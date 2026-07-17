const customerRepository = require('../repositories/customer.repository');
const password = require('../utils/password');
const { signToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

class AuthService {
  async register({ name, email, password: plainPassword, phone, address }) {
    const existing = await customerRepository.findByEmail(email);
    if (existing) throw ApiError.conflict('Email is already registered');

    const passwordHash = await password.hash(plainPassword);
    const customer = await customerRepository.create({
      name, email, passwordHash, phone, address, role: 'customer',
    });

    logger.info(`New customer registered: ${email}`);
    return this._withToken(customer);
  }

  async login({ email, password: plainPassword }) {
    const customer = await customerRepository.findByEmail(email);
    if (!customer) throw ApiError.unauthorized('Invalid email or password');
    if (!customer.isActive) throw ApiError.forbidden('Account is deactivated');

    const match = await password.compare(plainPassword, customer.passwordHash);
    if (!match) throw ApiError.unauthorized('Invalid email or password');

    logger.info(`Customer logged in: ${email}`);
    return this._withToken(customer);
  }

  _withToken(customer) {
    const token = signToken({ sub: customer.id, role: customer.role });
    return { token, user: customer.toJSON() };
  }
}

module.exports = new AuthService();
