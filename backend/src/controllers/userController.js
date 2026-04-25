
const User = require("../models/User");
const Complaint = require("../models/Complaint");
const Notification = require("../models/Notification");

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
// GET USER PROFILE
// ======================================
exports.getProfile =
  async (
    req,
    res,
    next
  ) => {
    try {
      const user =
        await User.findById(
          req.user.id
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
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

// ======================================
// UPDATE USER PROFILE
// Future Ready:
// name
// phone
// avatar
// password
// ======================================
exports.updateProfile =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        name,
        phone,
        avatar,
      } = req.body;

      const user =
        await User.findById(
          req.user.id
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

      user.name =
        name ||
        user.name;

      if (
        phone !==
        undefined
      ) {
        user.phone =
          phone;
      }

      if (
        avatar !==
        undefined
      ) {
        user.avatar =
          avatar;
      }

      await user.save();

      res.json({
        success:
          true,
        message:
          "Profile updated successfully",
        data: {
          id: user._id,
          name: user.name,
          email:
            user.email,
          role: user.role,
          phone:
            user.phone,
          avatar:
            user.avatar,
        },
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
// GET MY COMPLAINT BY ID
// ======================================
exports.getMyComplaintById =
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
            createdBy:
              req.user.id,
          }
        ).populate(
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
// GET MY NOTIFICATIONS
// ======================================
exports.getMyNotifications =
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
// USER DASHBOARD STATS
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
            createdBy:
              req.user.id,
          }
        );

      const open =
        await Complaint.countDocuments(
          {
            createdBy:
              req.user.id,
            status:
              "open",
          }
        );

      const inProgress =
        await Complaint.countDocuments(
          {
            createdBy:
              req.user.id,
            status:
              "in_progress",
          }
        );

      const resolved =
        await Complaint.countDocuments(
          {
            createdBy:
              req.user.id,
            status:
              "resolved",
          }
        );

      const closed =
        await Complaint.countDocuments(
          {
            createdBy:
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
          open,
          inProgress,
          resolved,
          closed,
        },
      });
    } catch (error) {
      next(error);
    }
  };