const logger = require('../utils/logger');
const { sendError } = require('../utils/apiResponse');

/**
 * Custom error class so controllers can throw typed errors
 * with HTTP status codes attached.
 *
 * Usage: throw new AppError('Not found', 404);
 */
class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true; // Marks expected errors vs programmer bugs
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global Express error-handling middleware.
 * Must have 4 parameters — Express identifies it by signature.
 * Mount LAST in server.js after all routes.
 */
const globalErrorHandler = (err, req, res, next) => {
  // Mongoose duplicate key error (e.g., email already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return sendError(res, 409, `${field} already exists`, null);
  }

  // Mongoose validation error (schema-level)
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return sendError(res, 422, 'Validation failed', errors);
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return sendError(res, 400, `Invalid ${err.path}: ${err.value}`, null);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid token', null);
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Token expired', null);
  }

  // Our own AppError
  if (err.isOperational) {
    return sendError(res, err.statusCode, err.message, err.errors);
  }

  // Unknown / programmer error — log full stack, don't leak details to client
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  return sendError(
    res,
    500,
    process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    null
  );
};

/**
 * Async wrapper — eliminates repetitive try/catch in every controller.
 *
 * Usage: router.get('/route', asyncHandler(myController));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { AppError, globalErrorHandler, asyncHandler };
