const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../middlewares/errorHandler');
const { ROLES } = require('../config/constants');
const logger = require('../utils/logger');

/**
 * Generate access + refresh token pair for a user.
 * Access token is short-lived; refresh token is long-lived.
 */
// Add department as an optional parameter (defaulting to an empty string)
const generateTokens = (userId, email, role, department = "") => {
  // Include department in the payload
  const payload = { id: userId, email, role, department };

  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });

  return { accessToken, refreshToken };
};

/**
 * Register a new citizen user.
 */
const registerUser = async ({ name, email, password, phone }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('An account with this email already exists', 409);
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: ROLES.CITIZEN, // Registration always creates a citizen — admins are seeded separately
  });

  logger.info(`New user registered: ${email}`);

  const { accessToken, refreshToken } = generateTokens(user._id, user.email, user.role);

  // Store hashed refresh token in DB (optional: hash for extra security)
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  return { user: user.toSafeObject(), accessToken, refreshToken };
};

/**
 * Login with email + password.
 */
const loginUser = async ({ email, password }) => {
  // Must explicitly select password since it's select:false in schema
  const user = await User.findOne({ email }).select('+password');

  if (!user || !user.isActive) {
    throw new AppError('Invalid credentials', 401);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  const { accessToken, refreshToken } = generateTokens(user._id, user.email, user.role,user.department);

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  logger.info(`User logged in: ${email}`);

  return { user: user.toSafeObject(), accessToken, refreshToken };
};

/**
 * Issue a new access token using a valid refresh token.
 */
const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError('Refresh token required', 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== refreshToken) {
    throw new AppError('Refresh token mismatch. Please log in again.', 401);
  }

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(
    user._id,
    user.email,
    user.role
  );

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken: newRefreshToken };
};

/**
 * Logout: clear stored refresh token.
 */
const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
  logger.info(`User logged out: ${userId}`);
};

module.exports = { registerUser, loginUser, refreshAccessToken, logoutUser, generateTokens };
