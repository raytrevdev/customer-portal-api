const productService = require('../services/product.service');
const { success } = require('../utils/response');
const { parsePagination } = require('../utils/pagination');

exports.listProducts = async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const result = await productService.listProducts({ page, limit, offset });
  return success(res, 200, 'Products retrieved', result);
};
