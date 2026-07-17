const { sequelize, Order } = require('../models');
const orderRepository = require('../repositories/order.repository');
const orderItemRepository = require('../repositories/orderItem.repository');
const productRepository = require('../repositories/product.repository');
const ApiError = require('../utils/ApiError');
const { buildPagination } = require('../utils/pagination');
const logger = require('../config/logger');

class OrderService {
  // Customer places an order from a list of { productId, quantity }.
  async placeOrder(customerId, items) {
    if (!Array.isArray(items) || items.length === 0) {
      throw ApiError.badRequest('An order must contain at least one item');
    }

    const productIds = [...new Set(items.map((i) => i.productId))];
    const products = await productRepository.findByIds(productIds);
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Validate every referenced product exists before touching the database.
    for (const item of items) {
      if (!productMap.has(item.productId)) {
        throw ApiError.badRequest(`Product not found: ${item.productId}`);
      }
    }

    // Wrap order + items in a transaction so a failure never leaves a partial order.
    return sequelize.transaction(async (t) => {
      let total = 0;
      const order = await orderRepository.create({ customerId, status: 'pending', totalAmount: 0 }, { transaction: t });

      const orderItems = items.map((item) => {
        const product = productMap.get(item.productId);
        const unitPrice = parseFloat(product.price);
        total += unitPrice * item.quantity;
        return {
          orderId: order.id,
          productId: product.id,
          quantity: item.quantity,
          unitPrice,
        };
      });

      await orderItemRepository.bulkCreate(orderItems, { transaction: t });
      await order.update({ totalAmount: total.toFixed(2) }, { transaction: t });

      logger.info(`Order ${order.id} placed by customer ${customerId} (total ${total.toFixed(2)})`);
      return orderRepository.findByIdWithItems(order.id);
    });
  }

  async listCustomerOrders(customerId, { page, limit, offset }) {
    const { rows, count } = await orderRepository.findAndCountAll({
      where: { customerId },
      limit, offset,
      order: [['createdAt', 'DESC']],
      include: orderRepository.itemInclude(),
    });
    return { items: rows, pagination: buildPagination(count, page, limit) };
  }

  // Fetch a single order, enforcing ownership unless the requester is an admin.
  async getOrderForUser(orderId, user) {
    const order = await orderRepository.findByIdWithItems(orderId);
    if (!order) throw ApiError.notFound('Order not found');
    if (user.role !== 'admin' && order.customerId !== user.id) {
      throw ApiError.forbidden('You cannot access this order');
    }
    return order;
  }

  async cancelOrder(orderId, user) {
    const order = await this.getOrderForUser(orderId, user);
    if (order.status === 'cancelled') throw ApiError.badRequest('Order is already cancelled');
    if (order.status !== 'pending') {
      throw ApiError.badRequest(`Order cannot be cancelled once it is ${order.status}`);
    }
    await order.update({ status: 'cancelled' });
    logger.info(`Order ${orderId} cancelled by ${user.email}`);
    return order;
  }

  // ---- Admin operations ----
  async listAllOrders({ page, limit, offset }) {
    const { rows, count } = await orderRepository.findAndCountAll({
      limit, offset,
      order: [['createdAt', 'DESC']],
      include: [...orderRepository.itemInclude(), ...orderRepository.customerInclude()],
    });
    return { items: rows, pagination: buildPagination(count, page, limit) };
  }

  async updateStatus(orderId, status) {
    if (!Order.STATUSES.includes(status)) {
      throw ApiError.badRequest(`Invalid status. Allowed: ${Order.STATUSES.join(', ')}`);
    }
    const order = await orderRepository.findById(orderId);
    if (!order) throw ApiError.notFound('Order not found');
    await order.update({ status });
    logger.info(`Order ${orderId} status updated to ${status}`);
    return orderRepository.findByIdWithItems(orderId);
  }
}

module.exports = new OrderService();
