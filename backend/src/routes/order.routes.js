const express = require("express");
const { z } = require("zod");
const { validateBody } = require("../middleware/validate");
const { authUser } = require("../middleware/auth");
const { createOrder, getMyOrders, getOrderById } = require("../controllers/order.controller");

const router = express.Router();
// Orders are user-only; validation ensures clean payloads.
const orderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1),
      })
    )
    .nonempty({ message: "Cart is empty" }),
});

/**
 * @openapi
 * /api/orders:
 *   post:
 *     tags:
 *       - Orders
 *     summary: Create a new order for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Order created
 */
router.post("/", authUser, validateBody(orderSchema), createOrder);

/**
 * @openapi
 * /api/orders/my:
 *   get:
 *     tags:
 *       - Orders
 *     summary: List orders for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 */
router.get("/my", authUser, getMyOrders);

/**
 * @openapi
 * /api/orders/{id}:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get a single order by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order detail
 */
router.get("/:id", authUser, getOrderById);

module.exports = router;
