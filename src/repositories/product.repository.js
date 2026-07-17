const BaseRepository = require('./base.repository');
const { Product } = require('../models');

class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  findByIds(ids) {
    const { Op } = require('sequelize');
    return this.model.findAll({ where: { id: { [Op.in]: ids } } });
  }
}

module.exports = new ProductRepository();
