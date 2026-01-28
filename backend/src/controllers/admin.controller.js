const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/user");

function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function createProduct(req, res) {
  const slug = req.body.slug || generateSlug(req.body.name);
  const created = await Product.create({ ...req.body, slug });
  return res.status(201).json(created);
}

async function updateProduct(req,res) {
  const body = { ...req.body };
  if (body.name && !body.slug) {
    body.slug = generateSlug(body.name);
  }

  const update = await Product.findByIdAndUpdate(
    req.params.id,
    body,
    {new: true}
  );

  if (!update) 
    return res.status(404).json({message: "Product not found"});

  return res.json({product: update});
}

async function deleteProduct(req, res) {
  const deleted = await Product.findByIdAndDelete(req.params.id);

  if (!deleted) 
    return res.status(404).json({message: "Product not found"});
  
  return res.json({ message: "Product deleted" });
}

async function getAllOrders(req, res) {
  const orders = await Order.find()
    .populate("userId", "email")
    .sort({ createdAt: -1 });
  return res.json({ orders });
}

async function getOrderByIdAdmin(req, res) {
  const order = await Order.findById(req.params.id).populate("userId", "email");

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  return res.json(order);
}

async function updateOrderStatus(req, res) {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  ).populate("userId", "email");

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  return res.json(order);
}

module.exports = {createProduct, updateProduct, deleteProduct, getAllOrders, getOrderByIdAdmin, updateOrderStatus}