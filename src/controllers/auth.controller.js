const authService = require('../services/auth.service');
const { success } = require('../utils/response');

exports.register = async (req, res) => {
  const result = await authService.register(req.body);
  return success(res, 201, 'Registration successful', result);
};

exports.login = async (req, res) => {
  const result = await authService.login(req.body);
  return success(res, 200, 'Login successful', result);
};
