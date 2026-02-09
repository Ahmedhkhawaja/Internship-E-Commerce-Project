const mongoose = require("mongoose");

const user = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    // Hashed refresh tokens for rotation/revocation.
    refreshTokens: {
      type: [String],
      default: [],
    },
  },
  {timestamps:true}
);

module.exports = mongoose.model("User", user);

