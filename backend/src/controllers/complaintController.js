 Complaint = require("../models/Complaint");
const User = require("../models/User");

const {
  generateTicketId,
} = require("../services/ticketService");

const {
  sendMail,
} = require("../services/mailService");

// ======================================
// SLA STATUS HELPER
// ======================================
const getSLAStatus = (
  complaint
) => {
  const now = new Date();

  if (
    ["resolved", "closed"].includes(
      complaint.status
    )
  ) {
    return "completed";
  }

  if (
    complaint.slaDueDate &&
    complaint.slaDueDate < now
  ) {
    return "overdue";
  }

  return "within_sla";
};

// ======================================
// FORMAT COMPLAINT
// ======================================
const formatComplaint = (
  complaint
) => ({
  ...complaint.toObject(),
  slaStatus:
    getSLAStatus(
      complaint
    ),
});

// ======================================
// CREATE COMPLAINT
// ======================================
exports.createComplaint = async (req, res, next) => {
  try {
    let { title, description, category, priority = "medium" } = req.body;

    // ================= VALIDATION =================
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, description and category required",
      });
    }

    const allowedPriorities = ["low", "medium", "high"];
    if (!allowedPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority",
      });
    }

    // ================= NORMALIZATION =================
    const normalizedCategory = category.trim().toLowerCase();

    const allowedCategories = [
      "technical",
      "billing",
      "service",
      "account",
      "other",
    ];

    if (!allowedCategories.includes(normalizedCategory)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category",
      });
    }

    // ================= SLA =================
    const slaDays = priority === "high" ? 1 : 3;
    const slaDueDate = new Date();
    slaDueDate.setDate(slaDueDate.getDate() + slaDays);

    const ticketId = await generateTicketId();

    // ================= CREATE =================
    const complaint = await Complaint.create({
      title,
      description,
      category: normalizedCategory,
      priority,
      createdBy: req.user.id,
      slaDueDate,
      ticketId,
    });

    // =========================================
    //  SMART ASSIGNMENT
    // =========================================

    let assignedAgent = null;
    let assignmentReason = "No agent available";

   // STEP 1: Skill match + load balance
const agents = await User.find({
  role: "agent",
  status: "active",
  isAvailable: true,
  skills: {
    $elemMatch: {
      $regex: normalizedCategory,
      $options: "i",
    },
  },
}).sort({ activeTickets: 1 });

    if (agents.length > 0) {
      assignedAgent = agents[0];
      assignmentReason = "Matched by skill + lowest workload";
    } else {
       assignmentReason = "No skilled agent available";
    }

    // STEP 2: Fallback (no skill match)
    if (!assignedAgent) {
      const fallbackAgents = await User.find({
        role: "agent",
        status: "active",
        isAvailable: true,
      }).sort({ activeTickets: 1 });

      if (fallbackAgents.length > 0) {
        assignedAgent = fallbackAgents[0];
        assignmentReason = "No skill match → assigned by availability";
      }
    }

    // STEP 3: Assign
    if (assignedAgent) {
      complaint.assignedTo = assignedAgent._id;
      complaint.status = "in_progress";
      complaint.assignmentReason = assignmentReason;
      await complaint.save();

      //  SAFE workload update
      await User.findByIdAndUpdate(assignedAgent._id, {
        $inc: { activeTickets: 1 },
      });

      // notify agent
      if (assignedAgent.email) {
        await sendMail(
          assignedAgent.email,
          "New Complaint Assigned",
          `Complaint ${ticketId} assigned (${assignmentReason})`
        );
      }
    }

    // notify user
    const user = await User.findById(req.user.id);
    if (user?.email) {
      await sendMail(
        user.email,
        "Complaint Created",
        `Your complaint ${ticketId} has been created successfully.`
      );
    }

    res.status(201).json({
      success: true,
      message: assignedAgent
        ? "Complaint created and assigned successfully"
        : "Complaint created (no agent available)",
      assignmentReason,
      data: complaint,
    });

  } catch (error) {
    next(error);
  }
};

// ======================================
// GET COMPLAINT BY ID
// Security:
// Admin = all
// User = own complaint
// Agent = assigned complaint
// ======================================
exports.getComplaintById =
  async (
    req,
    res,
    next
  ) => {
    try {
      const complaint =
        await Complaint.findById(
          req.params.id
        )
          .populate(
            "createdBy",
            "name email"
          )
          .populate(
            "assignedTo",
            "name email"
          );

      if (!complaint) {
        return res
          .status(404)
          .json({
            success:
              false,
            message:
              "Complaint not found",
          });
      }

      const role =
        req.user.role;

      const userId =
        req.user.id;

      const isAdmin =
        role ===
        "admin";

      const isOwner =
        complaint.createdBy._id.toString() ===
        userId;

      const isAssignedAgent =
        complaint.assignedTo &&
        complaint.assignedTo._id.toString() ===
          userId;

      if (
        !isAdmin &&
        !isOwner &&
        !isAssignedAgent
      ) {
        return res
          .status(403)
          .json({
            success:
              false,
            message:
              "Access denied",
          });
      }

      res.json({
        success:
          true,
        data:
          formatComplaint(
            complaint
          ),
      });
    } catch (error) {
      next(error);
    }
  };

// ======================================
// GET MY COMPLAINTS
// ======================================
exports.getMyComplaints =
  async (
    req,
    res,
    next
  ) => {
    try {
      const complaints =
        await Complaint.find(
          {
            createdBy:
              req.user.id,
          }
        )
          .populate(
            "createdBy",
            "name email"
          )
          .populate(
            "assignedTo",
            "name email"
          )
          .sort({
            createdAt: -1,
          });

      res.json({
        success:
          true,
        count:
          complaints.length,
        data:
          complaints.map(
            formatComplaint
          ),
      });
    } catch (error) {
      next(error);
    }
  };

// ======================================
// GET ASSIGNED COMPLAINTS
// AGENT ONLY
// ======================================
exports.getAssignedComplaints =
  async (
    req,
    res,
    next
  ) => {
    try {
      const complaints =
        await Complaint.find(
          {
            assignedTo:
              req.user.id,
          }
        )
          .populate(
            "createdBy",
            "name email"
          )
          .sort({
            createdAt: -1,
          });

      res.json({
        success:
          true,
        count:
          complaints.length,
        data:
          complaints.map(
            formatComplaint
          ),
      });
    } catch (error) {
      next(error);
    }
  };

// ======================================
// UPDATE STATUS
// Admin = any status
// Agent = cannot close
// Agent = only assigned complaint
// ======================================
exports.updateStatus = async (req, res, next) => {
  try {
    const { complaintId, status } = req.body;

    const allowedStatus = [
      "open",
      "in_progress",
      "resolved",
      "closed",
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    // =====================================
    // AGENT PERMISSION RULES
    // =====================================
    if (req.user.role === "agent") {
      if (!complaint.assignedTo) {
        return res.status(403).json({
          success: false,
          message: "Complaint not assigned",
        });
      }

      if (
        complaint.assignedTo.toString() !== req.user.id
      ) {
        return res.status(403).json({
          success: false,
          message: "Only assigned complaint can be updated",
        });
      }

      if (status === "closed") {
        return res.status(403).json({
          success: false,
          message: "Only admin can close complaint",
        });
      }
    }

    // =====================================
    // STORE OLD STATUS
    // =====================================
    const oldStatus = complaint.status;

    // =====================================
    // UPDATE STATUS
    // =====================================
    complaint.status = status;
    await complaint.save();

    // =====================================
    // 🔥 UPDATE AGENT LOAD (VERY IMPORTANT)
    // =====================================
    if (oldStatus !== "resolved" && status === "resolved") {
      if (complaint.assignedTo) {
        await User.findByIdAndUpdate(
          complaint.assignedTo,
          {
            $inc: {
              activeTickets: -1,
              resolvedTickets: 1,
            },
          }
        );
      }
    }

    // =====================================
    // EMAIL ON RESOLVE
    // =====================================
    if (oldStatus !== "resolved" && status === "resolved") {
      const user = await User.findById(
        complaint.createdBy
      );

      if (user?.email) {
        await sendMail(
          user.email,
          "Complaint Resolved",
          `Your complaint ${complaint.ticketId} has been resolved successfully.`
        );
      }
    }

    // =====================================
    // RESPONSE
    // =====================================
    res.json({
      success: true,
      message: "Status updated successfully",
      data: complaint,
    });

  } catch (error) {
    next(error);
  }
};

// ======================================
// GET OVERDUE COMPLAINTS
// ======================================
exports.getOverdueComplaints =
  async (
    req,
    res,
    next
  ) => {
    try {
      const complaints =
        await Complaint.find(
          {
            slaDueDate:
              {
                $lt: new Date(),
              },
            status:
              {
                $nin: [
                  "resolved",
                  "closed",
                ],
              },
          }
        )
          .populate(
            "createdBy",
            "name email"
          )
          .populate(
            "assignedTo",
            "name email"
          )
          .sort({
            slaDueDate: 1,
          });

      res.json({
        success:
          true,
        count:
          complaints.length,
        data:
          complaints.map(
            formatComplaint
          ),
      });
    } catch (error) {
      next(error);
    }
  };