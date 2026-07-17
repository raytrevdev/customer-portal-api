const express = require('express');
const controller = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');
const rules = require('../validators/auth.validator');
const { authLimiter } = require('../middlewares/rateLimiter');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Throttle authentication attempts to mitigate credential brute-forcing.
router.use(authLimiter);

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Registration and authentication
 */

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new customer
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: Jane Doe }
 *               email: { type: string, example: jane@example.com }
 *               password: { type: string, example: Secret@123 }
 *               phone: { type: string, example: "+6591234567" }
 *               address: { type: string, example: "1 Marina Blvd, Singapore" }
 *     responses:
 *       201: { description: Registration successful }
 *       409: { description: Email already registered }
 */
router.post('/register', validate(rules.register), asyncHandler(controller.register));

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in and receive a JWT
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: admin@portal.com }
 *               password: { type: string, example: Admin@123 }
 *     responses:
 *       200: { description: Login successful, returns token }
 *       401: { description: Invalid credentials }
 */
router.post('/login', validate(rules.login), asyncHandler(controller.login));

module.exports = router;
