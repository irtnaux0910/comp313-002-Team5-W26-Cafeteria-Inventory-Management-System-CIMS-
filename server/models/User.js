const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      unique: true
    },
    password: String,
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user"
    },
    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);