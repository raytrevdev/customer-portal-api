const customerRepository = require('../repositories/customer.repository');
const password = require('../utils/password');
const ApiError = require('../utils/ApiError');
const { buildPagination } = require('../utils/pagination');
const logger = require('../config/logger');

class CustomerService {
  async getProfile(customerId) {
    const customer = await customerRepository.findById(customerId);
    if (!customer) throw ApiError.notFound('Customer not found');
    return customer;
  }

  async updateProfile(customerId, { name, phone, address }) {
    const customer = await this.getProfile(customerId);
    const changes = {};
    if (name !== undefined) changes.name = name;
    if (phone !== undefined) changes.phone = phone;
    if (address !== undefined) changes.address = address;
    await customerRepository.update(customer, changes);
    return customer;
  }

  async changePassword(customerId, { currentPassword, newPassword }) {
    const customer = await this.getProfile(customerId);
    const match = await password.compare(currentPassword, customer.passwordHash);
    if (!match) throw ApiError.badRequest('Current password is incorrect');

    const passwordHash = await password.hash(newPassword);
    await customerRepository.update(customer, { passwordHash });
    logger.info(`Password changed for customer: ${customer.email}`);
  }

  // ---- Admin operations ----
  async listCustomers({ page, limit, offset }) {
    const { rows, count } = await customerRepository.findAndCountAll({
      limit, offset, order: [['createdAt', 'DESC']],
    });
    return { items: rows, pagination: buildPagination(count, page, limit) };
  }

  async deleteCustomer(id) {
    const customer = await customerRepository.findById(id);
    if (!customer) throw ApiError.notFound('Customer not found');
    if (customer.role === 'admin') throw ApiError.forbidden('Admin accounts cannot be deleted');
    await customerRepository.destroy(customer);
    logger.info(`Customer deleted by admin: ${customer.email}`);
  }

  async deactivateCustomer(id) {
    const customer = await customerRepository.findById(id);
    if (!customer) throw ApiError.notFound('Customer not found');
    if (customer.role === 'admin') throw ApiError.forbidden('Admin accounts cannot be deactivated');
    await customerRepository.update(customer, { isActive: false });
    logger.info(`Customer deactivated by admin: ${customer.email}`);
    return customer;
  }
}

module.exports = new CustomerService();
