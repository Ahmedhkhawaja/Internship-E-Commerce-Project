const Stripe = require("stripe");
const Order = require("../models/order");

// Lazy init avoids crashing when STRIPE_SECRET_KEY is missing.
function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

async function createCheckoutSession(req, res) {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ message: "orderId is required" });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return res.status(500).json({ message: "Stripe is not configured" });
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (String(order.userId) !== String(req.user.userId)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (order.status === "paid") {
    return res.status(400).json({ message: "Order already paid" });
  }

  // Use order snapshot pricing to avoid future price changes.
  const lineItems = order.items.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.name,
      },
      unit_amount: item.priceCents,
    },
    quantity: item.quantity,
  }));

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  // Include order/user metadata to reconcile in the webhook.
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    success_url: `${frontendUrl}/orders/${order._id}?success=1`,
    cancel_url: `${frontendUrl}/orders/${order._id}?canceled=1`,
    metadata: {
      orderId: order._id.toString(),
      userId: order.userId.toString(),
    },
  });

  order.checkoutSessionId = session.id;
  await order.save();

  return res.json({ url: session.url });
}

async function handleStripeWebhook(req, res) {
  // Stripe signs webhooks; we verify before trusting payload.
  const stripe = getStripeClient();
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).json({ message: "Stripe webhook is not configured" });
  }

  const signature = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      const order = await Order.findById(orderId);
      if (order && order.status !== "paid") {
        order.status = "paid";
        order.paidAt = new Date();
        order.paymentIntentId = session.payment_intent || order.paymentIntentId;
        order.checkoutSessionId = session.id || order.checkoutSessionId;
        await order.save();
      }
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      const order = await Order.findById(orderId);
      if (order && order.status === "pending") {
        order.status = "cancelled";
        order.checkoutSessionId = session.id || order.checkoutSessionId;
        await order.save();
      }
    }
  }

  return res.json({ received: true });
}

module.exports = { createCheckoutSession, handleStripeWebhook };
