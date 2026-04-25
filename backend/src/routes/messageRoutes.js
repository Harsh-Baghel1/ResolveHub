// backend/src/routes/messageRoutes.js

const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getMessagesByComplaint,
  markMessageSeen,
} = require("../controllers/messageController");

// ======================================
// PROTECTED ROUTES
// ======================================

// Get Chat Messages By Complaint
router.get(
  "/:complaintId",
  protect,
  getMessagesByComplaint
);

// Mark Message As Seen
router.patch(
  "/seen/:id",
  protect,
  markMessageSeen
);

module.exports = router;