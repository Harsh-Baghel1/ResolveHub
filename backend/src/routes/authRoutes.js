// backend/src/routes/authRoutes.js

const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const {register,login,refreshToken,getMe,} = require("../controllers/authController");

// ======================================
// AUTH ROUTES
// ======================================
// Register New User
router.post("/register",register);
// Login User
router.post("/login",login);
// Refresh Access Token
router.post("/refresh",refreshToken);
// Get Current Logged-in User
router.get("/me",protect,getMe);

module.exports = router;