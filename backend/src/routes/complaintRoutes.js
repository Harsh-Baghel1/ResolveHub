// backend/src/routes/complaintRoutes.js

const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  updateStatus,
  getAssignedComplaints,
} = require("../controllers/complaintController");

// ======================================
// USER ROUTES
// ======================================

// Create Complaint
router.post(
  "/",
  protect,
  createComplaint
);

// My Complaints
router.get(
  "/my",
  protect,
  getMyComplaints
);

// ======================================
// AGENT ROUTES
// ======================================

// Assigned Complaints
router.get(
  "/assigned",
  protect,
  authorizeRoles("agent"),
  getAssignedComplaints
);

// ======================================
// ADMIN + AGENT ROUTES
// ======================================

// Update Complaint Status
router.patch(
  "/status",
  protect,
  authorizeRoles(
    "admin",
    "agent"
  ),
  updateStatus
);

// ======================================
// COMMON ROUTES
// ======================================

// Get Complaint By ID
router.get(
  "/:id",
  protect,
  getComplaintById
);

module.exports = router;