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
} = require("../controllers/adminController");

router.use(protect, authorizeRoles("admin"));

router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);
router.get("/agents", getAllAgents);
router.patch("/users/role", changeUserRole);
router.get("/complaints", getAllComplaints);
router.patch("/complaints/assign", assignComplaint);

module.exports = router;