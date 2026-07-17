const express = require('express');
const customerController = require('../controllers/customer.controller');
const orderController = require('../controllers/order.controller');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const orderRules = require('../validators/order.validator');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Every admin route requires a valid token AND the 'admin' role.
router.use(authenticate, authorize('admin'));

/**
 * @openapi
 * tags:
 *   - name: Admin
 *     description: Administrator-only management endpoints (role-protected)
 */

/**
 * @openapi
 * /api/admin/customers:
 *   get:
 *     tags: [Admin]
 *     summary: View all customers
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200: { description: Customers retrieved }
 *       403: { description: Admin access required }
 */
router.get('/customers', asyncHandler(customerController.listCustomers));

/**
 * @openapi
 * /api/admin/customers/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a customer account
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Customer deleted }
 *       404: { description: Customer not found }
 */
router.delete('/customers/:id', asyncHandler(customerController.deleteCustomer));

/**
 * @openapi
 * /api/admin/customers/{id}/deactivate:
 *   patch:
 *     tags: [Admin]
 *     summary: Deactivate a customer account
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Customer deactivated }
 */
router.patch('/customers/:id/deactivate', asyncHandler(customerController.deactivateCustomer));

/**
 * @openapi
 * /api/admin/orders:
 *   get:
 *     tags: [Admin]
 *     summary: View all orders across every customer
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200: { description: Orders retrieved }
 */
router.get('/orders', asyncHandler(orderController.listAllOrders));

/**
 * @openapi
 * /api/admin/orders/{id}/status:
 *   patch:
 *     tags: [Admin]
 *     summary: Update an order's status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, shipped, delivered, cancelled]
 *     responses:
 *       200: { description: Order status updated }
 *       400: { description: Invalid status }
 */
router.patch('/orders/:id/status', validate(orderRules.updateStatus), asyncHandler(orderController.updateOrderStatus));

module.exports = router;
