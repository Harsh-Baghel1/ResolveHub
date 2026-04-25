// backend/src/routes/userRoutes.js

const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  getUserProfile,
  updateProfile,
  getDashboardStats,
  getComplaintHistory,
  getNotifications,
} = require("../controllers/userController");

// ======================================
// USER ACCESS ONLY
// ======================================
router.use(
  protect,
  authorizeRoles("user")
);

// ======================================
// PROFILE
// ======================================

// Get Logged-in User Profile
router.get(
  "/profile",
  getUserProfile
);

// Update User Profile
router.patch(
  "/profile",
  updateProfile
);

// ======================================
// DASHBOARD
// ======================================

// User Dashboard Stats
router.get(
  "/dashboard",
  getDashboardStats
);

// ======================================
// COMPLAINT HISTORY
// ======================================

// User Complaint History
router.get(
  "/complaints",
  getComplaintHistory
);

// ======================================
// NOTIFICATIONS
// ======================================

// Get User Notifications
router.get(
  "/notifications",
  getNotifications
);

module.exports = router;