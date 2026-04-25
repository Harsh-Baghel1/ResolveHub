// backend/src/routes/agentRoutes.js

const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  getAgentProfile,
  getAssignedComplaints,
  updateComplaintStatus,
  getNotifications,
  getPerformance,
} = require("../controllers/agentController");

// ======================================
// AGENT ACCESS ONLY
// ======================================
router.use(
  protect,
  authorizeRoles("agent")
);

// ======================================
// PROFILE
// ======================================

// Get Logged-in Agent Profile
router.get(
  "/profile",
  getAgentProfile
);

// ======================================
// COMPLAINTS
// ======================================

// Get Assigned Complaints
router.get(
  "/complaints",
  getAssignedComplaints
);

// Update Complaint Status
router.patch(
  "/complaints/status",
  updateComplaintStatus
);

// ======================================
// PERFORMANCE
// ======================================

// Agent Performance Stats
router.get(
  "/performance",
  getPerformance
);

// ======================================
// NOTIFICATIONS
// ======================================

// Get Agent Notifications
router.get(
  "/notifications",
  getNotifications
);

module.exports = router;