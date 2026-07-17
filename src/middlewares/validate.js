const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

// Runs the given validation chains, then rejects the request if any failed.
module.exports = function validate(validations) {
  return async (req, res, next) => {
    await Promise.all(validations.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();

    const message = errors
      .array()
      .map((e) => `${e.path}: ${e.msg}`)
      .join('; ');
    next(ApiError.badRequest(message));
  };
};
