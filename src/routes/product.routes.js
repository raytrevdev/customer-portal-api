const express = require('express');
const controller = require('../controllers/product.controller');
const authenticate = require('../middlewares/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Products
 *     description: Product catalogue (reference data for placing orders)
 */

/**
 * @openapi
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: List available products
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200: { description: Products retrieved }
 */
router.get('/', authenticate, asyncHandler(controller.listProducts));

module.exports = router;
