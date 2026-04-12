const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { createComplaint } = require("../controllers/complaintController");
const { getMyComplaints } = require("../controllers/complaintController");
const authorizeRoles = require("../middleware/roleMiddleware");
const { getAllComplaints } = require("../controllers/complaintController");



// User creates complaint
router.post("/", protect, createComplaint);
router.get("/my", protect, getMyComplaints);
router.get("/all", protect, authorizeRoles("admin"), getAllComplaints);


module.exports = router;