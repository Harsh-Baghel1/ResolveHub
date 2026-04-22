const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {register,login,refreshToken,getMe} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.get("/me", protect, getMe);


module.exports = router;