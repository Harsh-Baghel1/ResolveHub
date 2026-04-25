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
exports.createComplaint =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        title,
        description,
        category,
        priority =
          "medium",
      } = req.body;

      if (
        !title ||
        !description ||
        !category
      ) {
        return res
          .status(400)
          .json({
            success:
              false,
            message:
              "Title, description and category required",
          });
      }

      const allowedPriorities =
        [
          "low",
          "medium",
          "high",
        ];

      if (
        !allowedPriorities.includes(
          priority
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,
            message:
              "Invalid priority",
          });
      }

      // SLA Logic
      const slaDays =
        priority ===
        "high"
          ? 1
          : 3;

      const slaDueDate =
        new Date();

      slaDueDate.setDate(
        slaDueDate.getDate() +
          slaDays
      );

      const ticketId =
        await generateTicketId();

      const complaint =
        await Complaint.create(
          {
            title,
            description,
            category,
            priority,
            createdBy:
              req.user.id,
            slaDueDate,
            ticketId,
          }
        );

      const user =
        await User.findById(
          req.user.id
        );

      if (
        user?.email
      ) {
        await sendMail(
          user.email,
          "Complaint Created",
          `Your complaint ${ticketId} has been created successfully.`
        );
      }

      res.status(201).json(
        {
          success:
            true,
          message:
            "Complaint created successfully",
          data:
            complaint,
        }
      );
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
exports.updateStatus =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        complaintId,
        status,
      } = req.body;

      const allowedStatus =
        [
          "open",
          "in_progress",
          "resolved",
          "closed",
        ];

      if (
        !allowedStatus.includes(
          status
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,
            message:
              "Invalid status",
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

      // Agent Rules
      if (
        req.user.role ===
        "agent"
      ) {
        if (
          !complaint.assignedTo
        ) {
          return res
            .status(403)
            .json({
              success:
                false,
              message:
                "Complaint not assigned",
            });
        }

        if (
          complaint.assignedTo.toString() !==
          req.user.id
        ) {
          return res
            .status(403)
            .json({
              success:
                false,
              message:
                "Only assigned complaint can be updated",
            });
        }

        if (
          status ===
          "closed"
        ) {
          return res
            .status(403)
            .json({
              success:
                false,
              message:
                "Only admin can close complaint",
            });
        }
      }

      const oldStatus =
        complaint.status;

      complaint.status =
        status;

      await complaint.save();

      // Mail only first resolve
      if (
        oldStatus !==
          "resolved" &&
        status ===
          "resolved"
      ) {
        const user =
          await User.findById(
            complaint.createdBy
          );

        if (
          user?.email
        ) {
          await sendMail(
            user.email,
            "Complaint Resolved",
            `Your complaint ${complaint.ticketId} has been resolved successfully.`
          );
        }
      }

      res.json({
        success:
          true,
        message:
          "Status updated successfully",
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