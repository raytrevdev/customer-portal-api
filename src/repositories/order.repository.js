const BaseRepository = require('./base.repository');
const { Order, OrderItem, Product, Customer } = require('../models');

class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }

  // Default eager-loading of items (+ their product) for order detail views.
  itemInclude() {
    return [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }];
  }

  customerInclude() {
    return [{ model: Customer, as: 'customer', attributes: ['id', 'name', 'email'] }];
  }

  findByIdWithItems(id) {
    return this.model.findByPk(id, { include: this.itemInclude() });
  }
}

module.exports = new OrderRepository();
