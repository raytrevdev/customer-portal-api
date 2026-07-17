const customerService = require('../services/customer.service');
const { success } = require('../utils/response');
const { parsePagination } = require('../utils/pagination');

exports.getMyProfile = async (req, res) => {
  const customer = await customerService.getProfile(req.user.id);
  return success(res, 200, 'Profile retrieved', customer);
};

exports.updateMyProfile = async (req, res) => {
  const customer = await customerService.updateProfile(req.user.id, req.body);
  return success(res, 200, 'Profile updated', customer);
};

exports.changePassword = async (req, res) => {
  await customerService.changePassword(req.user.id, req.body);
  return success(res, 200, 'Password updated successfully');
};

// ---- Admin ----
exports.listCustomers = async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const result = await customerService.listCustomers({ page, limit, offset });
  return success(res, 200, 'Customers retrieved', result);
};

exports.deleteCustomer = async (req, res) => {
  await customerService.deleteCustomer(req.params.id);
  return success(res, 200, 'Customer deleted');
};

exports.deactivateCustomer = async (req, res) => {
  const customer = await customerService.deactivateCustomer(req.params.id);
  return success(res, 200, 'Customer deactivated', customer);
};
