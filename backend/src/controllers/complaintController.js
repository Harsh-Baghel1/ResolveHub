const Complaint = require("../models/Complaint");
const User = require("../models/User"); 

const getSLAStatus = (complaint) => {
  const now = new Date();

  if (complaint.status === "resolved" || complaint.status === "closed") {
    return "completed";
  }

  if (complaint.slaDueDate && complaint.slaDueDate < now) {
    return "overdue";
  }

  return "within_sla";
};

// Create Complaint
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority = "medium" } = req.body;

    //  Basic validation
    if (!title || !description || !category) {
      return res.status(400).json({
        msg: "Title, description, and category are required",
      });
    }

    // (priority validation)
    const allowedPriorities = ["low", "medium", "high"];
    if (priority && !allowedPriorities.includes(priority)) {
      return res.status(400).json({ msg: "Invalid priority value" });
    }

    //  SLA logic
    const slaDays = priority === "high" ? 1 : 3;
    const slaDueDate = new Date();
    slaDueDate.setDate(slaDueDate.getDate() + slaDays);

    const complaint = await Complaint.create({
      title,
      description,
      category,
      priority,
      createdBy: req.user.id,
      slaDueDate,
    });

    res.status(201).json({
      msg: "Complaint created successfully",
      complaint,
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// Get user Compaints 
exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      createdBy: req.user.id
    })
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email")
    .sort({ createdAt: -1 });

    const complaintsWithSLA = complaints.map((c) => ({
  ...c.toObject(),
  slaStatus: getSLAStatus(c),
}));

res.json({
  count: complaints.length,
  complaints: complaintsWithSLA
});
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Compaints by Admin 
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    const complaintsWithSLA = complaints.map((c) => ({
      ...c.toObject(),
      slaStatus: getSLAStatus(c),
    }));

    res.json({
      count: complaints.length,
      complaints: complaintsWithSLA
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin assigns complaint to agent


exports.assignComplaint = async (req, res) => {
  try {
    const { complaintId, assignedTo } = req.body;

    if (!complaintId || !assignedTo) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ msg: "Complaint not found" });
    }

    //  CHECK USER EXISTS
    const user = await User.findById(assignedTo);
    if (!user) {
      return res.status(404).json({ msg: "Assigned user not found" });
    }

    complaint.assignedTo = assignedTo;
    complaint.status = "in_progress";

    await complaint.save();

    res.json({
      msg: "Complaint assigned successfully",
      complaint
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { complaintId, status } = req.body;

    const allowedStatus = ["open", "in_progress", "resolved", "closed"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({ msg: "Complaint not found" });
    }

    // 🔥 LOGIC
    if (
      req.user.role === "agent" &&
      complaint.assignedTo?.toString() !== req.user.id
    ) {
      return res.status(403).json({
        msg: "You can only update your assigned complaints"
      });
    }

    complaint.status = status;

    await complaint.save();

    res.json({
      msg: "Status updated successfully",
      complaint
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOverdueComplaints = async (req, res) => {
  try {
    const now = new Date();

    const complaints = await Complaint.find({
      slaDueDate: { $lt: now },
      status: { $nin: ["resolved", "closed"] }
    })
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email");

    res.json({
      count: complaints.length,
      complaints
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const total = await Complaint.countDocuments();

    const open = await Complaint.countDocuments({ status: "open" });
    const inProgress = await Complaint.countDocuments({ status: "in_progress" });
    const resolved = await Complaint.countDocuments({ status: "resolved" });

    const now = new Date();
    const overdue = await Complaint.countDocuments({
      slaDueDate: { $lt: now },
      status: { $nin: ["resolved", "closed"] }
    });

    res.json({
      total,
      open,
      inProgress,
      resolved,
      overdue
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};