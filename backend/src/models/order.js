const mongoose = require("mongoose");

// Snapshot item schema keeps history even if product changes later.
const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    priceCents: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Snapshot of items at purchase time.
    items: { type: [orderItemSchema], required: true },

    totalCents: { type: Number, required: true, min: 0 },

    // Status is updated by admin or payment webhooks.
    status: {
      type: String,
      enum: ["pending", "paid", "cancelled", "shipped", "delivered"],
      default: "pending",
    },

    // Stripe metadata for reconciliation and support.
    paidAt: { type: Date },
    paymentIntentId: { type: String, trim: true },
    checkoutSessionId: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
