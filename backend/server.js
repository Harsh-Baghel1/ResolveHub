const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const authorizeRoles = require("./src/middleware/roleMiddleware");

// 🔐 Load environment variables
dotenv.config();

// 🚀 Initialize Express app
const app = express();

// 🧩 Middleware
app.use(cors());
app.use(express.json());

// 📌 Routes
app.use("/api/auth", authRoutes);

const protect = require("./src/middleware/authMiddleware");

// 🔐 Protected test route
app.get("/api/test", protect, (req, res) => {
  res.json({
    msg: "Protected route accessed",
    user: req.user
  });
});

// 👇 Admin only route
app.get("/api/admin", protect, authorizeRoles("admin"), (req, res) => {
  res.json({
    msg: "Welcome Admin",
    user: req.user
    
  });
});

app.get("/", (req, res) => {
  res.send("ResolveHub API is running...");
});

// ❌ 404 Handler (Optional but recommended)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});


const startServer = async () => {
  try {
    await connectDB(); // ✅ Ensure DB connects first

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1); // Exit if DB fails
  }
};

startServer();  