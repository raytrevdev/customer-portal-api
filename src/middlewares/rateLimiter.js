const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/ApiError');

// Rejections are routed through the global error handler so rate-limited
// responses share the same { success, message } shape as the rest of the API.
const rejection = (message) => (req, res, next) => next(new ApiError(429, message));

// Strict limiter for authentication endpoints to slow down brute-force attempts.
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 min
  max: parseInt(process.env.AUTH_RATE_MAX, 10) || 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rejection('Too many authentication attempts. Please try again later.'),
});

// Lenient safety-net limiter applied to the whole API.
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.API_RATE_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.API_RATE_MAX, 10) || 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rejection('Too many requests. Please try again later.'),
});

module.exports = { authLimiter, apiLimiter };
