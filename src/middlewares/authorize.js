const ApiError = require('../utils/ApiError');

// Restricts a route to the given roles. Use after the authenticate middleware.
module.exports = function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };
};
