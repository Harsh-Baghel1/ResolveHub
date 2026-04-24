const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const messageRoutes = require("./routes/messageRoutes");

const protect = require("./middleware/authMiddleware");
const authorizeRoles = require("./middleware/roleMiddleware");
const adminRoutes = require("./routes/adminRoutes");


const {
  notFound,
  errorHandler,
} = require("./middleware/errorMiddleware");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);

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

// Middleware should be LAST
app.use(notFound);
app.use(errorHandler);

module.exports = app;