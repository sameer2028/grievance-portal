const { validationResult } = require('express-validator');
const { sendError } = require('../utils/apiResponse');

/**
 * Reads express-validator results and short-circuits with 422 if invalid.
 * Place this AFTER your validation chain, BEFORE your controller.
 *
 * Usage:
 *   router.post('/register', [...registerValidators], validate, registerController)
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formatted = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));

    return sendError(res, 422, 'Validation failed', formatted);
  }

  next();
};

module.exports = validate;
