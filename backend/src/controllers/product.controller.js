const product = require("../models/product");

async function listProducts(req, res) {
  // Pagination and search are handled in MongoDB to keep responses fast.
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 8));
  const search = String(req.query.search || "").trim();

  const match = { isActive: true };
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    match.$or = [{ name: regex }, { description: regex }];
  }

  const skip = (page - 1) * limit;

  const results = await product.aggregate([
    { $match: match },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        items: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    },
  ]);

  const items = results[0]?.items || [];
  const totalCount = results[0]?.totalCount?.[0]?.count || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  return res.json({
    items,
    // Keep backward compatibility for older clients expecting "products".
    products: items,
    page,
    limit,
    totalCount,
    totalPages,
  });
}

async function productById(req, res) {
  const thisProduct = await product.findOne({_id: req.params.id, isActive: true});
  if (!thisProduct) return res.status(404).json({message: "Product not found"});
  return res.json({thisProduct});
}

module.exports = {listProducts, productById};