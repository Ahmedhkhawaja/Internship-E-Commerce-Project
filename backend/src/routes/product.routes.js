const express = require("express");
const { z } = require("zod");
const router = express.Router();
// Public list/detail plus admin CRUD in one place.
const { authAdmin, authUser } = require("../middleware/auth");
const { listProducts, productById } = require("../controllers/product.controller");
const { createProduct, updateProduct, deleteProduct } = require("../controllers/admin.controller");
const { validateBody } = require("../middleware/validate");

const productCreateSchema = z.object({
  name: z.string().min(1).max(100),
  priceCents: z.number().min(0),
  description: z.string().max(1000).optional(),
  category: z.string().max(50).optional(),
  countInStock: z.number().int().min(0),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

const productUpdateSchema = productCreateSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided" }
);

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
router.post("/", authUser, authAdmin, validateBody(productCreateSchema), createProduct);

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
router.patch("/:id", authUser, authAdmin, validateBody(productUpdateSchema), updateProduct);

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