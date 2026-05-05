
const Complaint = require("../models/Complaint");
const User = require("../models/User");

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
// DASHBOARD STATS
// ======================================
exports.getDashboardStats =
  async (
    req,
    res,
    next
  ) => {
    try {
      const totalComplaints =
        await Complaint.countDocuments();

      const openComplaints =
        await Complaint.countDocuments(
          {
            status:
              "open",
          }
        );

      const resolvedComplaints =
        await Complaint.countDocuments(
          {
            status:
              "resolved",
          }
        );

      const closedComplaints =
        await Complaint.countDocuments(
          {
            status:
              "closed",
          }
        );

      const overdueComplaints =
        await Complaint.countDocuments(
          {
            status:
              {
                $nin:
                  [
                    "resolved",
                    "closed",
                  ],
              },
            slaDueDate:
              {
                $lt: new Date(),
              },
          }
        );

      const totalUsers =
        await User.countDocuments(
          {
            role:
              "user",
          }
        );

      const totalAgents =
        await User.countDocuments(
          {
            role:
              "agent",
          }
        );

      res.json({
        success:
          true,
        data: {
          totalComplaints,
          openComplaints,
          resolvedComplaints,
          closedComplaints,
          overdueComplaints,
          totalUsers,
          totalAgents,
        },
      });
    } catch (error) {
      next(error);
    }
  };

// ======================================
// GET ALL USERS
// ======================================
exports.getAllUsers =
  async (
    req,
    res,
    next
  ) => {
    try {
      const users =
        await User.find(
          {}
        )
          .select(
            "-password -refreshToken"
          )
          .sort({
            createdAt: -1,
          });

      res.json({
        success:
          true,
        count:
          users.length,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  };

// ======================================
// GET ALL AGENTS
// ======================================
exports.getAllAgents =
  async (
    req,
    res,
    next
  ) => {
    try {
      const agents =
        await User.find(
          {
            role:
              "agent",
          }
        )
          .select(
            "-password -refreshToken"
          )
          .sort({
            createdAt: -1,
          });

      res.json({
        success:
          true,
        count:
          agents.length,
        data: agents,
      });
    } catch (error) {
      next(error);
    }
  };

// ======================================
// CHANGE USER ROLE
// ======================================
exports.changeUserRole =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        userId,
        role,
      } = req.body;

      const allowedRoles =
        [
          "admin",
          "user",
          "agent",
        ];

      if (
        !allowedRoles.includes(
          role
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,
            message:
              "Invalid role",
          });
      }

      const user =
        await User.findByIdAndUpdate(
          userId,
          {
            role,
          },
          { returnDocument: "after" }
        ).select(
          "-password -refreshToken"
        );

      if (!user) {
        return res
          .status(404)
          .json({
            success:
              false,
            message:
              "User not found",
          });
      }

      res.json({
        success:
          true,
        message:
          "Role updated successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

// ======================================
// GET ALL COMPLAINTS
// ======================================
exports.getAllComplaints =
  async (
    req,
    res,
    next
  ) => {
    try {
      const complaints =
        await Complaint.find()
          .select(
            "-__v"
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
// ASSIGN COMPLAINT
// ======================================
exports.assignComplaint =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        complaintId,
        assignedTo,
      } = req.body;

      if (
        !complaintId ||
        !assignedTo
      ) {
        return res
          .status(400)
          .json({
            success:
              false,
            message:
              "Complaint ID and Agent ID required",
          });
      }

      const complaint =
        await Complaint.findById(
          complaintId
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

      if (
        complaint.assignedTo
      ) {
        return res
          .status(400)
          .json({
            success:
              false,
            message:
              "Complaint already assigned",
          });
      }

      const agent =
        await User.findById(
          assignedTo
        );

      if (!agent) {
        return res
          .status(404)
          .json({
            success:
              false,
            message:
              "Agent not found",
          });
      }

      if (
        agent.role !==
        "agent"
      ) {
        return res
          .status(400)
          .json({
            success:
              false,
            message:
              "Can assign only to agent",
          });
      }

      if (
        complaint.createdBy.toString() ===
        assignedTo
      ) {
        return res
          .status(400)
          .json({
            success:
              false,
            message:
              "Cannot assign to creator",
          });
      }

      complaint.assignedTo =
        assignedTo;

      complaint.status =
        "in_progress";

      await complaint.save();

      await complaint.populate(
        "assignedTo",
        "name email"
      );

      // Send mail after save
      if (
        agent.email
      ) {
        await sendMail(
          agent.email,
          "New Complaint Assigned",
          `Complaint ${complaint.ticketId} has been assigned to you.`
        );
      }

      res.json({
        success:
          true,
        message:
          "Complaint assigned successfully",
        data:
          complaint,
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
                $lt:
                  new Date(),
              },
            status:
              {
                $nin:
                  [
                    "resolved",
                    "closed",
                  ],
              },
          }
        )
          .select(
            "-__v"
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
   // ======================================
// UPDATE AGENT DETAILS (skills, availability)
// ======================================
exports.updateAgentDetails = async (req, res, next) => {
  try {
    // 🔥 TAKE ID FROM PARAMS (not body)
    const userId = req.params.id;
    const { skills, isAvailable } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    //  Only agents allowed
    if (user.role !== "agent") {
      return res.status(400).json({
        success: false,
        message: "User is not an agent",
      });
    }

    // 🔥 NO DATA CHECK
    if (!skills && typeof isAvailable !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "No data provided to update",
      });
    }

    // ================= VALIDATE SKILLS =================
    if (skills) {
      if (!Array.isArray(skills)) {
        return res.status(400).json({
          success: false,
          message: "Skills must be an array",
        });
      }

      user.skills = skills
        .map((s) => s.trim().toLowerCase())
        .filter((s) => s.length > 0);
    }

    // ================= VALIDATE AVAILABILITY =================
    if (typeof isAvailable === "boolean") {
      user.isAvailable = isAvailable;
    }

    await user.save();

    res.json({
      success: true,
      message: "Agent details updated successfully",
      data: user,
    });

  } catch (error) {
    next(error);
  }
};
  // ====================================
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -refreshToken");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const complaints = await Complaint.find({
      createdBy: req.params.id,
    })
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      user,
      complaints,
    });

  } catch (error) {
    next(error);
  }
};

// ======================================
// UPDATE USER STATUS (active/suspended)
// ======================================
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { userId, status } = req.body;

    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.status = status;
    await user.save();

    res.json({
      success: true,
      message: "User status updated successfully",
      data: user,
    });

  } catch (error) {
    next(error);
  }
};