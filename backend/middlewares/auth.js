const jwt = require('jsonwebtoken');
const { AppError, asyncHandler } = require('./errorHandler');
const { ROLES } = require('../config/constants');

/**
 * Verifies the Bearer token from Authorization header.
 * On success, attaches decoded payload as req.user.
 * On failure, throws AppError which bubbles to globalErrorHandler.
 */
const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('No token provided. Please log in.', 401);
  }

  const token = authHeader.split(' ')[1];

  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  req.user = decoded; // { id, email, role, iat, exp }

  next();
});

/**
 * Role-based access control guard.
 * Use AFTER protect middleware.
 *
 * Usage: router.get('/admin', protect, authorize(ROLES.ADMIN), handler)
 * Usage with multiple roles: authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(
        `Access denied. Required role: ${allowedRoles.join(' or ')}`,
        403
      );
    }

    next();
  };
};

module.exports = { protect, authorize };
