
const User = require("../models/User");
const Complaint = require("../models/Complaint");
const Notification = require("../models/Notification");

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
// GET AGENT PROFILE
// ======================================
exports.getProfile =
  async (
    req,
    res,
    next
  ) => {
    try {
      const agent =
        await User.findById(
          req.user.id
        ).select(
          "-password -refreshToken"
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

      res.json({
        success:
          true,
        data: agent,
      });
    } catch (error) {
      next(error);
    }
  };

// ======================================
// GET ASSIGNED COMPLAINTS
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
// GET SINGLE ASSIGNED COMPLAINT
// ======================================
exports.getAssignedComplaintById =
  async (
    req,
    res,
    next
  ) => {
    try {
      const complaint =
        await Complaint.findOne(
          {
            _id:
              req.params.id,
            assignedTo:
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
// UPDATE COMPLAINT STATUS
// Agent cannot close
// ======================================
exports.updateComplaintStatus =
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
          "in_progress",
          "resolved",
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
        await Complaint.findOne(
          {
            _id:
              complaintId,
            assignedTo:
              req.user.id,
          }
        );

      if (!complaint) {
        return res
          .status(404)
          .json({
            success:
              false,
            message:
              "Complaint not found or not assigned",
          });
      }

      const oldStatus =
        complaint.status;

      complaint.status =
        status;

      await complaint.save();

      // Send mail on resolve
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
          "Complaint status updated",
        data:
          complaint,
      });
    } catch (error) {
      next(error);
    }
  };

// ======================================
// AGENT DASHBOARD STATS
// ======================================
exports.getDashboardStats =
  async (
    req,
    res,
    next
  ) => {
    try {
      const total =
        await Complaint.countDocuments(
          {
            assignedTo:
              req.user.id,
          }
        );

      const pending =
        await Complaint.countDocuments(
          {
            assignedTo:
              req.user.id,
            status:
              {
                $in: [
                  "open",
                  "in_progress",
                ],
              },
          }
        );

      const resolved =
        await Complaint.countDocuments(
          {
            assignedTo:
              req.user.id,
            status:
              "resolved",
          }
        );

      const closed =
        await Complaint.countDocuments(
          {
            assignedTo:
              req.user.id,
            status:
              "closed",
          }
        );

      res.json({
        success:
          true,
        data: {
          total,
          pending,
          resolved,
          closed,
        },
      });
    } catch (error) {
      next(error);
    }
  };

// ======================================
// GET AGENT NOTIFICATIONS
// ======================================
exports.getNotifications =
  async (
    req,
    res,
    next
  ) => {
    try {
      const notifications =
        await Notification.find(
          {
            userId:
              req.user.id,
          }
        ).sort({
          createdAt: -1,
        });

      res.json({
        success:
          true,
        count:
          notifications.length,
        data:
          notifications,
      });
    } catch (error) {
      next(error);
    }
  };

// ======================================
// MARK NOTIFICATION READ
// ======================================
exports.markNotificationRead =
  async (
    req,
    res,
    next
  ) => {
    try {
      const notification =
        await Notification.findOneAndUpdate(
          {
            _id:
              req.params.id,
            userId:
              req.user.id,
          },
          {
            isRead: true,
          },
          {
            new: true,
          }
        );

      if (!notification) {
        return res
          .status(404)
          .json({
            success:
              false,
            message:
              "Notification not found",
          });
      }

      res.json({
        success:
          true,
        message:
          "Notification marked as read",
        data:
          notification,
      });
    } catch (error) {
      next(error);
    }
  };

// ======================================
// AGENT PERFORMANCE
// ======================================
exports.getPerformance =
  async (
    req,
    res,
    next
  ) => {
    try {
      const totalAssigned =
        await Complaint.countDocuments(
          {
            assignedTo:
              req.user.id,
          }
        );

      const totalResolved =
        await Complaint.countDocuments(
          {
            assignedTo:
              req.user.id,
            status:
              "resolved",
          }
        );

      const resolutionRate =
        totalAssigned === 0
          ? 0
          : (
              (totalResolved /
                totalAssigned) *
              100
            ).toFixed(2);

      res.json({
        success:
          true,
        data: {
          totalAssigned,
          totalResolved,
          resolutionRate:
            `${resolutionRate}%`,
        },
      });
    } catch (error) {
      next(error);
    }
  };