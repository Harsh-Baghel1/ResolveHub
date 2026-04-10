const Complaint = require("../models/Complaint");

// Create Complaint
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    // basic validation
    if (!title || !description || !category) {
      return res.status(400).json({
        msg: "Title, description, and category are required",
      });
    }

    // SLA logic: 3 days default, 1 day for high priority
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