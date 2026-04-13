const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { createComplaint } = require("../controllers/complaintController");
const { getMyComplaints } = require("../controllers/complaintController");
const authorizeRoles = require("../middleware/roleMiddleware");
const { getAllComplaints } = require("../controllers/complaintController");
const { assignComplaint } = require("../controllers/complaintController");
const { updateStatus } = require("../controllers/complaintController");

// Routes
router.post("/", protect, createComplaint);
router.get("/my", protect, getMyComplaints);
router.get("/all", protect, authorizeRoles("admin"), getAllComplaints);
router.put("/assign", protect, authorizeRoles("admin"), assignComplaint);
router.put("/status", protect, authorizeRoles("admin", "agent"), updateStatus);

module.exports = router;