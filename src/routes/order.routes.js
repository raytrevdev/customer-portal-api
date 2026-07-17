const express = require('express');
const controller = require('../controllers/order.controller');
const authenticate = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const rules = require('../validators/order.validator');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Orders
 *     description: Customer order management
 */

/**
 * @openapi
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: View my order history
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200: { description: Orders retrieved }
 *   post:
 *     tags: [Orders]
 *     summary: Place a new order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [productId, quantity]
 *                   properties:
 *                     productId: { type: string, format: uuid }
 *                     quantity: { type: integer, example: 2 }
 *     responses:
 *       201: { description: Order placed }
 *       400: { description: Invalid items }
 */
router.get('/', authenticate, asyncHandler(controller.getMyOrders));
router.post('/', authenticate, validate(rules.placeOrder), asyncHandler(controller.placeOrder));

/**
 * @openapi
 * /api/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: View a single order and its status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Order retrieved }
 *       403: { description: Not your order }
 *       404: { description: Order not found }
 */
router.get('/:id', authenticate, asyncHandler(controller.getOrderById));

/**
 * @openapi
 * /api/orders/{id}/cancel:
 *   patch:
 *     tags: [Orders]
 *     summary: Cancel an order (only while pending / not yet shipped)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Order cancelled }
 *       400: { description: Order can no longer be cancelled }
 */
router.patch('/:id/cancel', authenticate, asyncHandler(controller.cancelOrder));

module.exports = router;
