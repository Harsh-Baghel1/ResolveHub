const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  assignComplaint,
  updateStatus,
  getOverdueComplaints,
  getDashboardStats,
  getAssignedComplaints
} = require("../controllers/complaintController");

//  USER
router.post("/", protect, createComplaint);
router.get("/my", protect, getMyComplaints);

//  ADMIN
router.get("/all", protect, authorizeRoles("admin"), getAllComplaints);
router.put("/assign", protect, authorizeRoles("admin"), assignComplaint);
router.get("/overdue", protect, authorizeRoles("admin"), getOverdueComplaints);
router.get("/stats", protect, authorizeRoles("admin"), getDashboardStats);

//  ADMIN + AGENT
router.put("/status", protect, authorizeRoles("admin", "agent"), updateStatus);

// AGENT
router.get("/assigned", protect, authorizeRoles("agent"), getAssignedComplaints);

module.exports = router;