const Complaint = require("../models/Complaint");

const generateTicketId = async () => {
  const year = new Date().getFullYear();

  const count = await Complaint.countDocuments();

  const nextNumber = String(count + 1).padStart(4, "0");

  return `RH-${year}-${nextNumber}`;
};

module.exports = {
  generateTicketId,
};