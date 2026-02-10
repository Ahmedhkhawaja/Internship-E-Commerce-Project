const cors = require("cors");
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const ordersRoutes = require("./routes/order.routes");
const adminRoutes = require("./routes/admin.routes");
const uploadRoutes = require("./routes/upload.routes");
const paymentRoutes = require("./routes/payment.routes");
const webhookRoutes = require("./routes/webhook.routes");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const xssFilters = require("xss-filters");

const app = express();
// Parse cookies early so refresh/logout can read them.
app.use(cookieParser());
app.use(morgan("dev"));

const frontendOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

// Allow frontend origin and send cookies for refresh-token flow.
app.use(
  cors({
    origin: frontendOrigin,
    credentials: true,
  })
);

// Security hardening for common web attacks.
app.use(helmet());
app.use(hpp());
// Stripe webhooks require raw body for signature verification.
app.use("/api/webhooks/stripe", express.raw({ type: "application/json" }));
app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/api/webhooks/stripe")) {
    return next();
  }
  return express.json()(req, res, next);
});

function sanitizeValue(value) {
  if (typeof value === "string") {
    return xssFilters.inHTMLData(value).trim();
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === "object") {
    Object.keys(value).forEach((key) => {
      value[key] = sanitizeValue(value[key]);
    });
  }

  return value;
}

// Apply mongo/XSS sanitization to request data (skip webhooks).
app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/api/webhooks/stripe")) {
    return next();
  }
  ["body", "params", "headers", "query"].forEach((key) => {
    if (req[key]) {
      mongoSanitize.sanitize(req[key]);
    }
  });
  next();
});

app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/api/webhooks/stripe")) {
    return next();
  }
  ["body", "params", "headers", "query"].forEach((key) => {
    if (req[key]) {
      sanitizeValue(req[key]);
    }
  });
  next();
});

// Throttle auth endpoints to reduce brute-force attempts.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});

app.use("/api/auth", authLimiter);

// Route mounting.
app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/webhooks", webhookRoutes);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

module.exports = app;
