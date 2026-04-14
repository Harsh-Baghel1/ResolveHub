const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
  type: String,
  enum: ["sent", "delivered", "seen"],
  default: "sent"
},
    message: String,
  },
  
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);