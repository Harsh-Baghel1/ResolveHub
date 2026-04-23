const Message = require("../models/Message");

exports.getMessagesByComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const skip = (page - 1) * limit;

    const messages = await Message.find({ complaintId })
      .populate("sender", "name email")
      .sort({ createdAt: -1 }) // latest first
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({ complaintId });

    res.json({
      page,
      totalPages: Math.ceil(total / limit),
      totalMessages: total,
      messages
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};