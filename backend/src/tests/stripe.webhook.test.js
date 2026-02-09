const stripeLib = require("stripe");
const Order = require("../models/order");
const { request, app, createUserAndToken, createAdminAndToken, createProduct } = require("./helpers");

describe("Stripe webhook", () => {
  beforeAll(() => {
    process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "sk_test_dummy";
    process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "whsec_test";
  });

  function buildSignature(payload) {
    const stripe = stripeLib(process.env.STRIPE_SECRET_KEY);
    return stripe.webhooks.generateTestHeaderString({
      payload,
      secret: process.env.STRIPE_WEBHOOK_SECRET,
    });
  }

  it("marks order as paid on checkout.session.completed", async () => {
    const admin = await createAdminAndToken();
    const user = await createUserAndToken();
    const product = await createProduct({ adminToken: admin.token });

    const placed = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${user.token}`)
      .send({ items: [{ productId: product._id, quantity: 1 }] });

    const orderId = placed.body._id;

    const payload = JSON.stringify({
      id: "evt_test_paid",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_paid",
          payment_intent: "pi_test_paid",
          metadata: { orderId },
        },
      },
    });

    const signature = buildSignature(payload);

    const res = await request(app)
      .post("/api/webhooks/stripe")
      .set("Stripe-Signature", signature)
      .set("Content-Type", "application/json")
      .send(payload);

    expect(res.statusCode).toBe(200);

    const updated = await Order.findById(orderId);
    expect(updated.status).toBe("paid");
    expect(updated.paymentIntentId).toBe("pi_test_paid");
  });

  it("marks order as cancelled on checkout.session.expired", async () => {
    const admin = await createAdminAndToken();
    const user = await createUserAndToken();
    const product = await createProduct({ adminToken: admin.token });

    const placed = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${user.token}`)
      .send({ items: [{ productId: product._id, quantity: 1 }] });

    const orderId = placed.body._id;

    const payload = JSON.stringify({
      id: "evt_test_expired",
      type: "checkout.session.expired",
      data: {
        object: {
          id: "cs_test_expired",
          metadata: { orderId },
        },
      },
    });

    const signature = buildSignature(payload);

    const res = await request(app)
      .post("/api/webhooks/stripe")
      .set("Stripe-Signature", signature)
      .set("Content-Type", "application/json")
      .send(payload);

    expect(res.statusCode).toBe(200);

    const updated = await Order.findById(orderId);
    expect(updated.status).toBe("cancelled");
  });
});
