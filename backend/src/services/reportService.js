const Complaint = require("../models/Complaint");

const getComplaintSummary = async () => {
  const total = await Complaint.countDocuments();

  const resolved =
    await Complaint.countDocuments({
      status: "resolved",
    });

  const open =
    await Complaint.countDocuments({
      status: "open",
    });

  return {
    total,
    resolved,
    open,
  };
};

module.exports = {
  getComplaintSummary,
};