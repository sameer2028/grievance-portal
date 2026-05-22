const { asyncHandler } = require('../middlewares/errorHandler');
const { sendSuccess } = require('../utils/apiResponse');
const authService = require('../services/authService');
const { HTTP_STATUS } = require('../config/constants');

/**
 * POST /api/auth/register
 * Public — create a new citizen account
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const result = await authService.registerUser({ name, email, password, phone });

  // Set refresh token as httpOnly cookie so JS can't read it (XSS protection)
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return sendSuccess(res, HTTP_STATUS.CREATED, 'Account created successfully', {
    user: result.user,
    accessToken: result.accessToken,
  });
});

/**
 * POST /api/auth/login
 * Public — authenticate and receive tokens
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.loginUser({ email, password });

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return sendSuccess(res, HTTP_STATUS.OK, 'Logged in successfully', {
    user: result.user,
    accessToken: result.accessToken,
  });
});

/**
 * POST /api/auth/refresh
 * Public — exchange refresh token for new access token
 */
const refresh = asyncHandler(async (req, res) => {
  // Prefer cookie over body (cookie is more secure)
  const token = req.cookies?.refreshToken || req.body?.refreshToken;

  const result = await authService.refreshAccessToken(token);

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return sendSuccess(res, HTTP_STATUS.OK, 'Token refreshed', {
    accessToken: result.accessToken,
  });
});

/**
 * POST /api/auth/logout
 * Protected — invalidate refresh token
 */
const logout = asyncHandler(async (req, res) => {
  await authService.logoutUser(req.user.id);

  res.clearCookie('refreshToken');

  return sendSuccess(res, HTTP_STATUS.OK, 'Logged out successfully');
});

/**
 * GET /api/auth/me
 * Protected — return current user profile
 */
const getMe = asyncHandler(async (req, res) => {
  return sendSuccess(res, HTTP_STATUS.OK, 'User profile fetched', { user: req.user });
});

module.exports = { register, login, refresh, logout, getMe };
