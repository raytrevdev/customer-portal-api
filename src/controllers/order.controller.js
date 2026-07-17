const orderService = require('../services/order.service');
const { success } = require('../utils/response');
const { parsePagination } = require('../utils/pagination');

exports.placeOrder = async (req, res) => {
  const order = await orderService.placeOrder(req.user.id, req.body.items);
  return success(res, 201, 'Order placed', order);
};

exports.getMyOrders = async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const result = await orderService.listCustomerOrders(req.user.id, { page, limit, offset });
  return success(res, 200, 'Orders retrieved', result);
};

exports.getOrderById = async (req, res) => {
  const order = await orderService.getOrderForUser(req.params.id, req.user);
  return success(res, 200, 'Order retrieved', order);
};

exports.cancelOrder = async (req, res) => {
  const order = await orderService.cancelOrder(req.params.id, req.user);
  return success(res, 200, 'Order cancelled', order);
};

// ---- Admin ----
exports.listAllOrders = async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const result = await orderService.listAllOrders({ page, limit, offset });
  return success(res, 200, 'Orders retrieved', result);
};

exports.updateOrderStatus = async (req, res) => {
  const order = await orderService.updateStatus(req.params.id, req.body.status);
  return success(res, 200, 'Order status updated', order);
};
