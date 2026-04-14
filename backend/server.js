const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const complaintRoutes = require("./src/routes/complaintRoutes");
const protect = require("./src/middleware/authMiddleware");
const authorizeRoles = require("./src/middleware/roleMiddleware");
const messageRoutes = require("./src/routes/messageRoutes");



//  Load environment variables
dotenv.config();

//  Initialize Express app
const app = express();

//  Middleware
app.use(cors());
app.use(express.json());

//  Routes
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/messages", messageRoutes);

//  Protected test route
app.get("/api/test", protect, (req, res) => {
  res.json({
    msg: "Protected route accessed",
    user: req.user
  });
});

//  Admin only route
app.get("/api/admin", protect, authorizeRoles("admin"), (req, res) => {
  res.json({
    msg: "Welcome Admin",
    user: req.user
  });
});

app.get("/", (req, res) => {
  res.send("ResolveHub API is running...");
});

//  404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});


// ================= SOCKET.IO SETUP =================

const server = http.createServer(app);

const io = new Server(server, {   
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinComplaint", (complaintId) => {
    if (!complaintId) return;
    socket.join(complaintId);
  });

  socket.on("typing", ({ complaintId, user }) => {
    socket.to(complaintId).emit("typing", { userId: user.id });
  });

  socket.on("stopTyping", ({ complaintId, user }) => {
    socket.to(complaintId).emit("stopTyping", { userId: user.id });
  });

  socket.on("sendMessage", async ({ complaintId, message, sender }) => {
    try {
      if (!complaintId || !message || !sender) return;

      const newMessage = await Message.create({
        complaintId,
        sender,
        message
      });

      const populatedMessage = await newMessage.populate("sender", "name email");

      io.to(complaintId).emit("receiveMessage", populatedMessage);

    } catch (error) {
      console.error("Message error:", error.message);
    }
  });

socket.on("messageSeen", async ({ messageId, complaintId }) => {
  try {
    if (!messageId || !complaintId) return;

    //  Update message status + get updated document
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { status: "seen" },
      { new: true }
    );

    //  Emit to only that complaint room
    io.to(complaintId).emit("messageSeen", updatedMessage);

  } catch (error) {
    console.error("Seen error:", error.message);
  }
});

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ================= START SERVER =================

const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();