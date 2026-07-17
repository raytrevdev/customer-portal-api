const { verifyToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');
const { Customer } = require('../models');

// Verifies the Bearer token and attaches the current user to req.user.
module.exports = async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Authentication token missing');
    }
    const token = header.slice(7);
    const decoded = verifyToken(token);

    const user = await Customer.findByPk(decoded.sub);
    if (!user) throw ApiError.unauthorized('User no longer exists');
    if (!user.isActive) throw ApiError.forbidden('Account is deactivated');

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Invalid or expired token'));
    }
    next(err);
  }
};
