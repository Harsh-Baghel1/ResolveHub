const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const messageRoutes = require("./routes/messageRoutes");

const protect = require("./middleware/authMiddleware");
const authorizeRoles = require("./middleware/roleMiddleware");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/messages", messageRoutes);

// Test Route
app.get("/api/test", protect, (req, res) => {
  res.json({
    msg: "Protected route accessed",
    user: req.user,
  });
});

// Admin Test Route
app.get(
  "/api/admin",
  protect,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({
      msg: "Welcome Admin",
      user: req.user,
    });
  }
);

// Health Check
app.get("/", (req, res) => {
  res.send("ResolveHub API running...");
});

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

module.exports = app;