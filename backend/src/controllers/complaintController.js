const Complaint = require("../models/Complaint");

// Create Complaint
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority = "medium" } = req.body;

    // ✅ Basic validation
    if (!title || !description || !category) {
      return res.status(400).json({
        msg: "Title, description, and category are required",
      });
    }

    // ✅ 🔥 ADD HERE (priority validation)
    const allowedPriorities = ["low", "medium", "high"];
    if (priority && !allowedPriorities.includes(priority)) {
      return res.status(400).json({ msg: "Invalid priority value" });
    }

    // ✅ SLA logic
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

exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      createdBy: req.user.id
    })
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email")
    .sort({ createdAt: -1 });

    res.json({
      count: complaints.length,
      complaints
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};