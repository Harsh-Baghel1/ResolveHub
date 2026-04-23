const Message = require("../models/Message");

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinComplaint", (complaintId) => {
      socket.join(complaintId);
    });

    socket.on("typing", ({ complaintId, user }) => {
      socket.to(complaintId).emit("typing", {
        userId: user.id,
      });
    });

    socket.on("stopTyping", ({ complaintId, user }) => {
      socket.to(complaintId).emit("stopTyping", {
        userId: user.id,
      });
    });

    socket.on(
      "sendMessage",
      async ({ complaintId, sender, message }) => {
        try {
          const newMessage = await Message.create({
            complaintId,
            sender,
            message,
          });

          const populated = await newMessage.populate(
            "sender",
            "name email"
          );

          io.to(complaintId).emit(
            "receiveMessage",
            populated
          );
        } catch (error) {
          console.log(error.message);
        }
      }
    );

    socket.on(
      "messageSeen",
      async ({ messageId, complaintId }) => {
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
      }
    );

    socket.on("disconnect", () => {
      console.log("Disconnected:", socket.id);
    });
  });
};

module.exports = socketHandler;