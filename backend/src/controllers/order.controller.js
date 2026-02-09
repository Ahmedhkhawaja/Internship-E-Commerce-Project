const Order = require("../models/order");
const Product = require("../models/product");

// POST /api/orders
async function createOrder(req, res) {
  const items = req.body.items || [];
  // Track reserved stock so we can roll back on failure.
  const reserved = [];

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  let orderItems = [];
  let totalCents = 0;

  try {
    // If any item fails, restore any stock already reserved.
    async function rollbackReserved() {
      if (reserved.length === 0) return;
      await Promise.all(
        reserved.map((r) =>
          Product.updateOne(
            { _id: r.productId },
            { $inc: { countInStock: r.quantity } }
          )
        )
      );
    }

    for (const item of items) {
      const productId = item.productId;
      const quantity = Number(item.quantity);

      if (!productId || !Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ message: "Invalid cart item" });
      }

      // Atomic stock decrement prevents overselling under concurrency.
      const p = await Product.findOneAndUpdate(
        { _id: productId, isActive: true, countInStock: { $gte: quantity } },
        { $inc: { countInStock: -quantity } },
        { new: true }
      );

      if (!p) {
        const existing = await Product.findById(productId);
        if (!existing || !existing.isActive) {
          await rollbackReserved();
          return res.status(400).json({ message: "Product unavailable" });
        }
        if (existing.countInStock < quantity) {
          await rollbackReserved();
          return res.status(400).json({ message: `Not enough stock for ${existing.name}` });
        }
        await rollbackReserved();
        return res.status(400).json({ message: "Product unavailable" });
      }

      reserved.push({ productId: p._id, quantity });
      // Store a snapshot of item pricing to keep order history stable.
      orderItems.push({
        productId: p._id,
        name: p.name,
        priceCents: p.priceCents,
        quantity,
      });

      totalCents += p.priceCents * quantity;
    }

    const order = await Order.create({
      userId: req.user.userId,
      items: orderItems,
      totalCents,
      status: "pending",
    });

    return res.status(201).json(order);
  } catch (e) {
    if (reserved.length > 0) {
      await Promise.all(
        reserved.map((r) =>
          Product.updateOne(
            { _id: r.productId },
            { $inc: { countInStock: r.quantity } }
          )
        )
      );
    }
    return res.status(500).json({ message: "Server error" });
  }
}

// GET /api/orders/my
async function getMyOrders(req, res) {
  const orders = await Order.find({ userId: req.user.userId }).sort({ createdAt: -1 });
  return res.json({ orders });
}

// GET /api/orders/:id
async function getOrderById(req, res) {
  const order = await Order.findById(req.params.id);

  if (!order) return res.status(404).json({ message: "Order not found" });

  if (String(order.userId) !== String(req.user.userId)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  return res.json(order);
}

module.exports = { createOrder, getMyOrders, getOrderById };
