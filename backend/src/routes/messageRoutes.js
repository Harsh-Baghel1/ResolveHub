const express = require("express");
const router = express.Router();

const { getMessagesByComplaint } = require("../controllers/messageController");
const protect = require("../middleware/authMiddleware");

// GET chat history
router.get("/:complaintId", protect, getMessagesByComplaint);

module.exports = router;