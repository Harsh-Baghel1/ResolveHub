const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "user", "agent"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },

    skills: {
  type: [String],
  default: [],
},

activeTickets: {
  type: Number,
  default: 0,
},

isAvailable: {
  type: Boolean,
  default: true,
},

    refreshToken: {
  type: String
},
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);