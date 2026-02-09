const express = require("express");
const { handleStripeWebhook } = require("../controllers/payment.controller");

const router = express.Router();
// Webhook routes must receive raw body for signature verification.

router.post("/stripe", handleStripeWebhook);

module.exports = router;
