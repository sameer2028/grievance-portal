const { body, param, query } = require('express-validator');
const { GRIEVANCE_STATUS, DEPARTMENTS, PRIORITY_LEVELS } = require('../config/constants');

const createGrievanceValidators = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 10, max: 200 }).withMessage('Title must be 10–200 characters'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 30, max: 2000 }).withMessage('Description must be 30–2000 characters'),

  body('location.address')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Address too long'),

  body('location.district')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('District name too long'),

  body('location.pincode')
    .optional()
    .matches(/^\d{6}$/).withMessage('Must be a valid 6-digit pincode'),

  body('location.coordinates.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 }).withMessage('Coordinates must be [longitude, latitude]'),

  body('attachments')
    .optional()
    .isArray({ max: 5 }).withMessage('Maximum 5 attachments allowed'),
];

const updateStatusValidators = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(Object.values(GRIEVANCE_STATUS))
    .withMessage(`Status must be one of: ${Object.values(GRIEVANCE_STATUS).join(', ')}`),

  body('officialResponse')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Official response cannot exceed 1000 characters'),

  body('internalNotes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Internal notes cannot exceed 500 characters'),
];

const assignGrievanceValidators = [
  body('officerId')
    .notEmpty().withMessage('Officer ID is required')
    .isMongoId().withMessage('Invalid officer ID format'),
];

const listGrievanceValidators = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
  query('status').optional().isIn(Object.values(GRIEVANCE_STATUS)).withMessage('Invalid status'),
  query('department').optional().isIn(Object.values(DEPARTMENTS)).withMessage('Invalid department'),
  query('priority').optional().isIn(Object.values(PRIORITY_LEVELS)).withMessage('Invalid priority'),
];

module.exports = {
  createGrievanceValidators,
  updateStatusValidators,
  assignGrievanceValidators,
  listGrievanceValidators,
};
