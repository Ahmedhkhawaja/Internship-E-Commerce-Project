const mongoose = require("mongoose");

const products = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Store money as integer cents to avoid floating-point issues.
    priceCents: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    // Image URLs returned from the upload endpoint.
    images: {
      type: [String],
      default: [],
    },

    category: {
      type: String,
      default: "general",
      trim: true,
      lowercase: true,
    },

    countInStock: {
      type: Number,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", products);
