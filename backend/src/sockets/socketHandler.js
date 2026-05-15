const mongoose = require("mongoose");
const Message = require("../models/Message");

const socketHandler = (io) => {
  io.on("connection", (socket) => {

    console.log("✅ Connected:", socket.id);

    // ======================================
    // JOIN ROOM
    // ======================================
    socket.on(
      "joinComplaint",
      (complaintId) => {

        if (!complaintId) return;

        socket.join(complaintId);

        console.log(
          `📥 Joined Room: ${complaintId}`
        );
      }
    );

    // ======================================
    // LEAVE ROOM
    // ======================================
    socket.on(
      "leaveComplaint",
      (complaintId) => {

        if (!complaintId) return;

        socket.leave(complaintId);

        console.log(
          `📤 Left Room: ${complaintId}`
        );
      }
    );

    // ======================================
    // TYPING
    // ======================================
    socket.on(
      "typing",
      ({ complaintId, user }) => {

        if (!complaintId) return;

        socket.to(complaintId).emit(
          "typing",
          {
            userId: user?.id,
          }
        );
      }
    );

    // ======================================
    // STOP TYPING
    // ======================================
    socket.on(
      "stopTyping",
      ({ complaintId, user }) => {

        if (!complaintId) return;

        socket.to(complaintId).emit(
          "stopTyping",
          {
            userId: user?.id,
          }
        );
      }
    );

    // ======================================
    // SEND MESSAGE
    // ======================================
    socket.on(
      "sendMessage",
      async (payload) => {
console.log("PAYLOAD:", payload);
        try {

          const {
            complaintId,
            sender,
            message,
          } = payload;

          if (
            !complaintId ||
            !sender ||
            !message?.trim()
          ) {
            return;
          }

          // SAVE MESSAGE
          const newMessage =
            await Message.create({
              complaintId,
              sender,
              message: message.trim(),
            });

          // POPULATE
          const populated =
            await newMessage.populate(
              "sender",
              "name email role"
            );

          console.log(
            "💬 Message Saved:",
            populated._id
          );

          // EMIT MESSAGE
          io.to(complaintId).emit(
            "receiveMessage",
            populated
          );

        } catch (error) {

          console.error(
            "Message Error:",
            error.message
          );
        }
      }
    );

    // ======================================
    // MESSAGE SEEN
    // ======================================
    socket.on(
  "messageSeen",
  async (payload) => {

    try {

      const {
        messageId,
        complaintId,
        viewerId,
      } = payload;

      // VALIDATION
      if (
        !messageId ||
        !complaintId ||
        !viewerId ||
        !mongoose.Types.ObjectId.isValid(
          messageId
        )
      ) {
        return;
      }

      // FIND MESSAGE
      const message =
        await Message.findById(
          messageId
        );

      if (!message) {
        return;
      }

      // DON'T ALLOW SENDER
      // TO MARK OWN MESSAGE
      if (
        message.sender.toString() ===
        viewerId
      ) {
        return;
      }

      // ALREADY SEEN
      if (
        message.status === "seen"
      ) {
        return;
      }

      // UPDATE STATUS
      message.status = "seen";

      await message.save();

      io.to(complaintId).emit(
        "messageSeen",
        message
      );

    } catch (error) {

      console.error(
        "Seen Error:",
        error.message
      );
    }
  }
);

    // ======================================
    // DISCONNECT
    // ======================================
    socket.on(
      "disconnect",
      () => {

        console.log(
          "❌ Disconnected:",
          socket.id
        );
      }
    );
  });
};

module.exports = socketHandler;