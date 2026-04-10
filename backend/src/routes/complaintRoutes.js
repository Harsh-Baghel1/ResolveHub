const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { createComplaint } = require("../controllers/complaintController");

// User creates complaint
router.post("/", protect, createComplaint);

module.exports = router;