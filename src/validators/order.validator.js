const { body } = require('express-validator');

exports.placeOrder = [
  body('items').isArray({ min: 1 }).withMessage('items must be a non-empty array'),
  body('items.*.productId').isUUID().withMessage('Each item requires a valid productId'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Each item requires a quantity of at least 1'),
];

exports.updateStatus = [
  body('status')
    .isIn(['pending', 'shipped', 'delivered', 'cancelled'])
    .withMessage('status must be one of: pending, shipped, delivered, cancelled'),
];
