const express = require("express");
const { z } = require("zod");
const { authUser } = require("../middleware/auth");
const { validateBody } = require("../middleware/validate");
const { createCheckoutSession } = require("../controllers/payment.controller");

const router = express.Router();
// Starts a Stripe Checkout session for a specific order.

const checkoutSchema = z.object({
  orderId: z.string().min(1),
});

router.post("/checkout", authUser, validateBody(checkoutSchema), createCheckoutSession);

module.exports = router;
