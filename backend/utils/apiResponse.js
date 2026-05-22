/**
 * Standardized API response helpers.
 *
 * All API responses follow this shape:
 *   Success: { success: true,  data: {...},    message: "..." }
 *   Error:   { success: false, error: {...},   message: "..." }
 *
 * This consistency lets the frontend use a single Axios interceptor
 * to handle all responses uniformly.
 */

/**
 * Send a successful response.
 * @param {Response} res - Express response object
 * @param {number} statusCode - HTTP status code (default 200)
 * @param {string} message - Human-readable success message
 * @param {object|array} data - Response payload
 */
const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

/**
 * Send an error response.
 * @param {Response} res - Express response object
 * @param {number} statusCode - HTTP status code (default 500)
 * @param {string} message - Human-readable error message
 * @param {object} errors - Validation errors or extra context
 */
const sendError = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  const response = { success: false, message };
  if (errors !== null) response.errors = errors;
  return res.status(statusCode).json(response);
};

/**
 * Send a paginated list response.
 * @param {Response} res - Express response object
 * @param {array} data - Array of items
 * @param {object} pagination - { page, limit, total, totalPages }
 * @param {string} message
 */
const sendPaginated = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  });
};

module.exports = { sendSuccess, sendError, sendPaginated };
