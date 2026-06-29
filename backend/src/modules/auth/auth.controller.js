const authService = require('./auth.service');
const ApiResponse = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, role } = req.body;
  const result = await authService.register({ fullName, email, password, role });
  ApiResponse.created(res, result, 'Registration successful');
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  ApiResponse.success(res, result, 'Login successful');
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);
  ApiResponse.success(res, user, 'User profile retrieved');
});

module.exports = { register, login, getMe };
