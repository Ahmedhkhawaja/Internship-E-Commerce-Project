const express = require("express");
const { z } = require("zod");
const router = express.Router();
// Admin-only order management endpoints.
const { authAdmin } = require("../middleware/auth");
const { getAllOrders, getOrderByIdAdmin, updateOrderStatus } = require("../controllers/admin.controller");
const { validateBody } = require("../middleware/validate");

const orderStatusSchema = z.object({
  status: z.enum(["pending", "paid", "cancelled", "shipped", "delivered"]),
});

/**
 * @openapi
 * /api/admin/orders:
 *   get:
 *     tags:
 *       - Admin
 *     summary: List all orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders with user info
 */
router.get("/orders", authAdmin, getAllOrders);

/**
 * @openapi
 * /api/admin/orders/{id}:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get order by id
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
 *         description: Order detail
 */
router.get("/orders/:id", authAdmin, getOrderByIdAdmin);

/**
 * @openapi
 * /api/admin/orders/{id}:
 *   patch:
 *     tags:
 *       - Admin
 *     summary: Update order status
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated
 */
router.patch("/orders/:id", authAdmin, validateBody(orderStatusSchema), updateOrderStatus);

module.exports = router;

