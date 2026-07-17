const express = require('express');
const controller = require('../controllers/customer.controller');
const authenticate = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const rules = require('../validators/customer.validator');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Customer Profile
 *     description: Authenticated customer self-service
 */

/**
 * @openapi
 * /api/customers/me:
 *   get:
 *     tags: [Customer Profile]
 *     summary: View my profile
 *     responses:
 *       200: { description: Profile retrieved }
 *       401: { description: Unauthorized }
 */
router.get('/me', authenticate, asyncHandler(controller.getMyProfile));

/**
 * @openapi
 * /api/customers/me:
 *   put:
 *     tags: [Customer Profile]
 *     summary: Update my profile (name, phone, address)
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               phone: { type: string }
 *               address: { type: string }
 *     responses:
 *       200: { description: Profile updated }
 */
router.put('/me', authenticate, validate(rules.updateProfile), asyncHandler(controller.updateMyProfile));

/**
 * @openapi
 * /api/customers/me/password:
 *   patch:
 *     tags: [Customer Profile]
 *     summary: Change my password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200: { description: Password updated }
 *       400: { description: Current password incorrect }
 */
router.patch('/me/password', authenticate, validate(rules.changePassword), asyncHandler(controller.changePassword));

module.exports = router;
