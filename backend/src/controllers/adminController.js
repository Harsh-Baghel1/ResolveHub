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

// ===============================
// Dashboard Stats
// ===============================
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalComplaints =
      await Complaint.countDocuments();

    const openComplaints =
      await Complaint.countDocuments({
        status: "open",
      });

    const resolvedComplaints =
      await Complaint.countDocuments({
        status: "resolved",
      });

    const overdueComplaints =
      await Complaint.countDocuments({
        status: { $ne: "resolved" },
        slaDueDate: { $lt: new Date() },
      });

    const totalUsers =
      await User.countDocuments({
        role: "user",
      });

    const totalAgents =
      await User.countDocuments({
        role: "agent",
      });

    res.json({
      success: true,
      data: {
        totalComplaints,
        openComplaints,
        resolvedComplaints,
        overdueComplaints,
        totalUsers,
        totalAgents,
      },
    });
  } catch (error) {
    next(error);
  }
};


// ===============================
// Get All Users
// ===============================
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select("-password -refreshToken")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};


// ===============================
// Get All Agents
// ===============================
exports.getAllAgents = async (req, res, next) => {
  try {
    const agents = await User.find({
      role: "agent",
    }).select("-password -refreshToken");

    res.json({
      success: true,
      count: agents.length,
      data: agents,
    });
  } catch (error) {
    next(error);
  }
};


// ===============================
// Change User Role
// ===============================
exports.changeUserRole = async (req,res,next) => {
  try {
    const { userId, role } = req.body;

    const user =
      await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true }
      ).select("-password");

    res.json({
      success: true,
      message: "Role updated",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// get all complaints (admin)
exports.getAllComplaints = async (req, res, next) => {
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

  } catch(error){
   next(error);
}
};

//  ASSIGN COMPLAINT (ADMIN)
exports.assignComplaint = async (req, res,next) => {
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
  success: true,
  message: "Complaint assigned successfully",
  data: complaint,
});

  } catch(error){
   next(error);
}
};


