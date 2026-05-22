const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const { protect, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { sendSuccess } = require('../utils/apiResponse');
const { ROLES } = require('../config/constants');
const SLAConfig = require('../models/SLAConfig');
const { runEscalationCheck } = require('../services/escalationService');
const { log, ACTIONS } = require('../services/auditService');

/**
 * GET /api/sla
 * Admin — get all SLA configurations.
 */
router.get(
  '/',
  protect,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  asyncHandler(async (req, res) => {
    const configs = await SLAConfig.find().sort({ department: 1, priority: 1 });
    return sendSuccess(res, 200, 'SLA configs fetched', { configs });
  })
);

/**
 * PATCH /api/sla/:id
 * Admin — update a specific SLA config.
 */
router.patch(
  '/:id',
  protect,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  [
    body('resolutionHours').optional().isInt({ min: 1 }).withMessage('Must be positive integer'),
    body('warningHours').optional().isInt({ min: 1 }).withMessage('Must be positive integer'),
    body('isActive').optional().isBoolean(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { resolutionHours, warningHours, isActive } = req.body;

    const sla = await SLAConfig.findById(req.params.id);
    if (!sla) throw new AppError('SLA config not found', 404);

    const oldValues = { resolutionHours: sla.resolutionHours, warningHours: sla.warningHours };

    if (resolutionHours !== undefined) sla.resolutionHours = resolutionHours;
    if (warningHours    !== undefined) sla.warningHours    = warningHours;
    if (isActive        !== undefined) sla.isActive        = isActive;
    sla.updatedBy = req.user.id;

    await sla.save();

    await log({
      action: ACTIONS.SLA_UPDATED,
      performedBy: req.user.id,
      targetType: 'SLAConfig',
      targetId: sla._id,
      changes: { from: oldValues, to: { resolutionHours: sla.resolutionHours, warningHours: sla.warningHours } },
      ipAddress: req.ip,
    });

    return sendSuccess(res, 200, 'SLA config updated', { sla });
  })
);

/**
 * POST /api/sla/run-escalation
 * Admin — manually trigger the escalation check (for testing or urgent runs).
 */
router.post(
  '/run-escalation',
  protect,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  asyncHandler(async (req, res) => {
    const result = await runEscalationCheck();
    return sendSuccess(res, 200, 'Escalation check completed', result);
  })
);

module.exports = router;
