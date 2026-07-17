const productRepository = require('../repositories/product.repository');
const { buildPagination } = require('../utils/pagination');

class ProductService {
  async listProducts({ page, limit, offset }) {
    const { rows, count } = await productRepository.findAndCountAll({
      limit, offset, order: [['name', 'ASC']],
    });
    return { items: rows, pagination: buildPagination(count, page, limit) };
  }
}

module.exports = new ProductService();
