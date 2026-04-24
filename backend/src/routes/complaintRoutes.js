const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  updateStatus,
  getOverdueComplaints,
  getAssignedComplaints
} = require("../controllers/complaintController");


// USER
router.post("/", protect, createComplaint);
router.get("/my", protect, getMyComplaints);


// AGENT
router.get(
  "/assigned",
  protect,
  authorizeRoles("agent"),
  getAssignedComplaints
);


// ADMIN + AGENT
router.put(
  "/status",
  protect,
  authorizeRoles("admin", "agent"),
  updateStatus
);


// OPTIONAL ADMIN
router.get(
  "/overdue",
  protect,
  authorizeRoles("admin"),
  getOverdueComplaints
);


// COMMON
router.get("/:id", protect, getComplaintById);

module.exports = router;