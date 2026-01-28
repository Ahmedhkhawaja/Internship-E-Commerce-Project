const express = require("express");
const router = express.Router();
const { authAdmin, authUser } = require("../middleware/auth");
const { listProducts, productById } = require("../controllers/product.controller");
const { createProduct, updateProduct, deleteProduct } = require("../controllers/admin.controller");

/**
 * @openapi
 * /api/products:
 *   get:
 *     tags:
 *       - Products
 *     summary: List all active products
 *     responses:
 *       200:
 *         description: Product list
 */
router.get("/", listProducts);

/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get product by id
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Product detail
 */
router.get("/:id", productById);

/**
 * @openapi
 * /api/products:
 *   post:
 *     tags:
 *       - Products
 *     summary: Create new product
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Product created
 */
router.post("/", authUser, authAdmin, createProduct);

/**
 * @openapi
 * /api/products/{id}:
 *   patch:
 *     tags:
 *       - Products
 *     summary: Update existing product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Product updated
 */
router.patch("/:id", authUser, authAdmin, updateProduct);

/**
 * @openapi
 * /api/products/{id}:
 *   delete:
 *     tags:
 *       - Products
 *     summary: Delete a product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Product deleted
 */
router.delete("/:id", authUser, authAdmin, deleteProduct);

module.exports = router;