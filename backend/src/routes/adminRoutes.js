// backend/src/routes/adminRoutes.js

const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  getDashboardStats,
  getAllUsers,
  getAllAgents,
  changeUserRole,
  getAllComplaints,
  assignComplaint,
  getOverdueComplaints,
} = require("../controllers/adminController");

// ======================================
// ADMIN ACCESS ONLY
// ======================================
router.use(
  protect,
  authorizeRoles("admin")
);

// ======================================
// DASHBOARD
// ======================================

// Admin Dashboard Stats
router.get(
  "/stats",
  getDashboardStats
);

// ======================================
// USER MANAGEMENT
// ======================================

// Get All Users
router.get(
  "/users",
  getAllUsers
);

// Change User Role
router.patch(
  "/users/role",
  changeUserRole
);

// ======================================
// AGENT MANAGEMENT
// ======================================

// Get All Agents
router.get(
  "/agents",
  getAllAgents
);

// ======================================
// COMPLAINT MANAGEMENT
// ======================================

// Get All Complaints
router.get(
  "/complaints",
  getAllComplaints
);

// Assign Complaint to Agent
router.patch(
  "/complaints/assign",
  assignComplaint
);

// Get Overdue Complaints
router.get(
  "/complaints/overdue",
  getOverdueComplaints
);

module.exports = router;