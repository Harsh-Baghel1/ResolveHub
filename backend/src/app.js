const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const messageRoutes = require("./routes/messageRoutes");
const adminRoutes = require("./routes/adminRoutes");
const agentRoutes = require("./routes/agentRoutes");


const protect = require("./middleware/authMiddleware");

const {
  notFound,
  errorHandler,
} = require("./middleware/errorMiddleware");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get("/", (req, res) => {
  res.send("ResolveHub API running...");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/agent", agentRoutes);

// Protected Test Route
app.get("/api/test", protect, (req, res) => {
  res.json({
    success: true,
    message: "Protected route accessed",
    user: req.user,
  });
});

// Error Middleware (LAST)
app.use(notFound);
app.use(errorHandler);

module.exports = app;