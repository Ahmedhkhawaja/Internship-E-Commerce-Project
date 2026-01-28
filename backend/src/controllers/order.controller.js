const Order = require("../models/order");
const Product = require("../models/product");

// POST /api/orders
async function createOrder(req, res) {
  try {
    const items = req.body.items || [];

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let orderItems = [];
    let totalCents = 0;

    for (const item of items) {
      const productId = item.productId;
      const quantity = Number(item.quantity);

      if (!productId || !Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ message: "Invalid cart item" });
      }

      const p = await Product.findById(productId);
      if (!p || !p.isActive) {
        return res.status(400).json({ message: "Product unavailable" });
      }

      if (p.countInStock < quantity) {
        return res.status(400).json({ message: `Not enough stock for ${p.name}` });
      }

      orderItems.push({
        productId: p._id,
        name: p.name,
        priceCents: p.priceCents,
        quantity,
      });

      totalCents += p.priceCents * quantity;

      // simple stock decrement for now
      p.countInStock -= quantity;
      await p.save();
    }

    const order = await Order.create({
      userId: req.user.userId,
      items: orderItems,
      totalCents,
      status: "pending",
    });

    return res.status(201).json(order);
  } catch (e) {
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
