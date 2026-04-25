const Message = require("../models/Message");

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("✅ Connected:", socket.id);

    socket.on("joinComplaint", (complaintId) => {
      if (!complaintId) return;
      socket.join(complaintId);
    });

    socket.on("typing", ({ complaintId, user }) => {
      if (!complaintId) return;

      socket.to(complaintId).emit("typing", {
        userId: user?.id,
      });
    });

    socket.on("stopTyping", ({ complaintId, user }) => {
      if (!complaintId) return;

      socket.to(complaintId).emit("stopTyping", {
        userId: user?.id,
      });
    });

    socket.on("sendMessage", async (payload) => {
      try {
        const { complaintId, sender, message } = payload;

        if (!complaintId || !sender || !message) return;

        const newMessage = await Message.create({
          complaintId,
          sender,
          message,
        });

        const populated = await newMessage.populate(
          "sender",
          "name email role"
        );

        io.to(complaintId).emit(
          "receiveMessage",
          populated
        );

      } catch (error) {
        console.error("Message Error:", error.message);
      }
    });

    socket.on("messageSeen", async (payload) => {
      try {
        const { messageId, complaintId } = payload;

        if (!messageId || !complaintId) return;

        const updated =
          await Message.findByIdAndUpdate(
            messageId,
            { status: "seen" },
            { new: true }
          );

        io.to(complaintId).emit(
          "messageSeen",
          updated
        );

      } catch (error) {
        console.error("Seen Error:", error.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected:", socket.id);
    });
  });
};

module.exports = socketHandler;