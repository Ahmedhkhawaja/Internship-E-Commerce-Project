const product = require("../models/product");

async function listProducts(req, res) {
  const products = await product.find({isActive: true}).sort({createdAt: -1});
  return res.json({products});
}

async function productById(req, res) {
  const thisProduct = await product.findOne({_id: req.params.id, isActive: true});
  if (!thisProduct) res.status(404).json({message: "Product not found"});
  return res.json({thisProduct});
}

module.exports = {listProducts, productById};