const Complaint = require("../models/Complaint");
const User = require("../models/User");

//  SLA STATUS HELPER
const getSLAStatus = (complaint) => {
  const now = new Date();

  if (["resolved", "closed"].includes(complaint.status)) {
    return "completed";
  }

  if (complaint.slaDueDate && complaint.slaDueDate < now) {
    return "overdue";
  }

  return "within_sla";
};

//  CREATE COMPLAINT
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority = "medium" } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        msg: "Title, description, and category are required",
      });
    }

    const allowedPriorities = ["low", "medium", "high"];

    if (!allowedPriorities.includes(priority)) {
      return res.status(400).json({
        msg: "Invalid priority value",
      });
    }

    // ==========================
    // SLA DATE
    // ==========================
    const slaDays = priority === "high" ? 1 : 3;

    const slaDueDate = new Date();
    slaDueDate.setDate(slaDueDate.getDate() + slaDays);

    // ==========================
    // GENERATE TICKET ID
    // RH-1001 / RH-1002
    // ==========================
    const lastComplaint = await Complaint.findOne()
      .sort({ createdAt: -1 })
      .select("ticketId");

    let nextNumber = 1001;

    if (lastComplaint?.ticketId) {
      const lastNumber = parseInt(
        lastComplaint.ticketId.split("-")[1]
      );

      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    const ticketId = `RH-${nextNumber}`;

    // ==========================
    // CREATE COMPLAINT
    // ==========================
    const complaint = await Complaint.create({
      title,
      description,
      category,
      priority,
      createdBy: req.user.id,
      slaDueDate,
      ticketId,
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

exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    if (!complaint) {
      return res.status(404).json({ msg: "Complaint not found" });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//  GET USER COMPLAINTS
exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ createdBy: req.user.id })
      .select("-__v")
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    const formatted = complaints.map((c) => ({
      ...c.toObject(),
      slaStatus: getSLAStatus(c),
    }));

    res.json({
      count: complaints.length,
      complaints: formatted,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//  GET ALL (ADMIN)
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .select("-__v")
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    const formatted = complaints.map((c) => ({
      ...c.toObject(),
      slaStatus: getSLAStatus(c),
    }));

    res.json({
      count: complaints.length,
      complaints: formatted,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//  GET ASSIGNED (AGENT)
exports.getAssignedComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ assignedTo: req.user.id })
      .select("-__v")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    const formatted = complaints.map((c) => ({
      ...c.toObject(),
      slaStatus: getSLAStatus(c),
    }));

    res.json({
      count: complaints.length,
      complaints: formatted,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//  ASSIGN COMPLAINT (ADMIN)
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

    //  Prevent re-assignment
    if (complaint.assignedTo) {
      return res.status(400).json({
        msg: "Complaint already assigned",
      });
    }

    const user = await User.findById(assignedTo);
    if (!user) {
      return res.status(404).json({ msg: "Assigned user not found" });
    }

    if (user.role !== "agent") {
      return res.status(400).json({
        msg: "Can only assign complaints to agents",
      });
    }

    //  Prevent assigning to creator
    if (complaint.createdBy.toString() === assignedTo) {
      return res.status(400).json({
        msg: "Cannot assign complaint to the creator",
      });
    }

    complaint.assignedTo = assignedTo;
    complaint.status = "in_progress";

    await complaint.save();

    res.json({
      msg: "Complaint assigned successfully",
      complaint,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//  UPDATE STATUS
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

    //  Agent restriction
    if (req.user.role === "agent") {
      if (!complaint.assignedTo) {
        return res.status(403).json({
          msg: "Complaint not assigned yet",
        });
      }

      if (complaint.assignedTo.toString() !== req.user.id) {
        return res.status(403).json({
          msg: "You can only update your assigned complaints",
        });
      }
    }

    complaint.status = status;
    await complaint.save();

    res.json({
      msg: "Status updated successfully",
      complaint,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//  OVERDUE
exports.getOverdueComplaints = async (req, res) => {
  try {
    const now = new Date();

    const complaints = await Complaint.find({
      slaDueDate: { $lt: now },
      status: { $nin: ["resolved", "closed"] },
    })
      .select("-__v")
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    res.json({
      count: complaints.length,
      complaints,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//  DASHBOARD STATS
exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();

    const [total, open, inProgress, resolved, overdue] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: "open" }),
      Complaint.countDocuments({ status: "in_progress" }),
      Complaint.countDocuments({ status: "resolved" }),
      Complaint.countDocuments({
        slaDueDate: { $lt: now },
        status: { $nin: ["resolved", "closed"] },
      }),
    ]);

    res.json({
      total,
      open,
      inProgress,
      resolved,
      overdue,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};