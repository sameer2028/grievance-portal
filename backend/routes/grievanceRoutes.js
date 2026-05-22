const express = require('express');
const router = express.Router();

const grievanceController = require('../controllers/grievanceController');
const { protect, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { ROLES } = require('../config/constants');
const {
  createGrievanceValidators,
  updateStatusValidators,
  assignGrievanceValidators,
  listGrievanceValidators,
} = require('../validators/grievanceValidators');

// ── Public ─────────────────────────────────────────────────────────────────────

// Track a grievance by ticket number (no login required)
router.get('/track/:ticketNumber', grievanceController.trackByTicket);

// ── Citizen ────────────────────────────────────────────────────────────────────

// Submit a new grievance
router.post(
  '/',
  protect,
  authorize(ROLES.CITIZEN),
  createGrievanceValidators,
  validate,
  grievanceController.createGrievance
);

// View own grievances
router.get(
  '/my',
  protect,
  authorize(ROLES.CITIZEN),
  listGrievanceValidators,
  validate,
  grievanceController.getMyGrievances
);

// ── Officer / Admin ────────────────────────────────────────────────────────────

// List all grievances (filtered by role in service layer)
router.get(
  '/',
  protect,
  authorize(ROLES.OFFICER, ROLES.ADMIN, ROLES.SUPER_ADMIN),
  listGrievanceValidators,
  validate,
  grievanceController.getAllGrievances
);

// Get single grievance (citizens can also call this for their own)
router.get('/:id', protect, grievanceController.getGrievanceById);

// Update status
router.patch(
  '/:id/status',
  protect,
  authorize(ROLES.OFFICER, ROLES.ADMIN, ROLES.SUPER_ADMIN),
  updateStatusValidators,
  validate,
  grievanceController.updateGrievanceStatus
);

// Assign to officer
router.patch(
  '/:id/assign',
  protect,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  assignGrievanceValidators,
  validate,
  grievanceController.assignGrievance
);

module.exports = router;
