const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const authRoutes = require("./src/routes/authRoutes");

app.use("/api/auth", authRoutes);

const connectDB = require("./src/config/db");

dotenv.config();

const startServer = async () => {
  try {
    await connectDB(); // ✅ WAIT for DB connection

    const app = express();

    app.use(cors());
    app.use(express.json());

    app.get("/", (req, res) => {
      res.send("ResolveHub API is running...");
    });

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Failed to start server:", error.message);
  }
};

startServer();

