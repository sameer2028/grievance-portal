const { body } = require('express-validator');

const registerValidators = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 80 }).withMessage('Name must be 2–80 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
body('password')
  .notEmpty().withMessage('Password is required'),

body('phone')
  .optional()
  // .matches(/^[6-9]\d{9}$/).withMessage('Must be a valid 10-digit Indian mobile number'),
  // body('password')
  //   .notEmpty().withMessage('Password is required')
  //   .isLength({ min: 4 }).withMessage('Password must be at least 4 characters')
  //   .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  //   .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  // body('phone')
  //   .optional()
  //   .matches(/^[6-9]\d{9}$/).withMessage('Must be a valid 10-digit Indian mobile number'),
];

const loginValidators = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

module.exports = { registerValidators, loginValidators };
