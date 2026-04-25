
const Message = require("../models/Message");
const Complaint = require("../models/Complaint");

// ======================================
// GET CHAT MESSAGES BY COMPLAINT
// Access:
// Admin = all
// User = own complaint
// Agent = assigned complaint
// ======================================
exports.getMessagesByComplaint =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        complaintId,
      } = req.params;

      const page =
        parseInt(
          req.query.page
        ) || 1;

      const limit =
        parseInt(
          req.query.limit
        ) || 20;

      const skip =
        (page - 1) *
        limit;

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

      const role =
        req.user.role;

      const userId =
        req.user.id;

      const isAdmin =
        role ===
        "admin";

      const isOwner =
        complaint.createdBy.toString() ===
        userId;

      const isAssignedAgent =
        complaint.assignedTo &&
        complaint.assignedTo.toString() ===
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

      const messages =
        await Message.find(
          {
            complaintId,
          }
        )
          .populate(
            "sender",
            "name email role"
          )
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit);

      const totalMessages =
        await Message.countDocuments(
          {
            complaintId,
          }
        );

      res.json({
        success:
          true,
        page,
        limit,
        totalMessages,
        totalPages:
          Math.ceil(
            totalMessages /
              limit
          ),
        data:
          messages,
      });
    } catch (error) {
      next(error);
    }
  };

// ======================================
// MARK MESSAGE AS SEEN
// ======================================
exports.markMessageSeen =
  async (
    req,
    res,
    next
  ) => {
    try {
      const message =
        await Message.findByIdAndUpdate(
          req.params.id,
          {
            status:
              "seen",
          },
          {
            new: true,
          }
        );

      if (!message) {
        return res
          .status(404)
          .json({
            success:
              false,
            message:
              "Message not found",
          });
      }

      res.json({
        success:
          true,
        message:
          "Message marked as seen",
        data:
          message,
      });
    } catch (error) {
      next(error);
    }
  };