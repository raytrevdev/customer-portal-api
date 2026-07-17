const BaseRepository = require('./base.repository');
const { OrderItem } = require('../models');

class OrderItemRepository extends BaseRepository {
  constructor() {
    super(OrderItem);
  }

  bulkCreate(items, options = {}) {
    return this.model.bulkCreate(items, options);
  }
}

module.exports = new OrderItemRepository();
