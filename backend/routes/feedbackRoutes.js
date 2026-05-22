const express = require('express');
const router = express.Router({ mergeParams: true });
const { body } = require('express-validator');

const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const { protect, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { sendSuccess } = require('../utils/apiResponse');
const { ROLES, GRIEVANCE_STATUS } = require('../config/constants');

const Feedback = require('../models/Feedback');
const Grievance = require('../models/Grievance');
const notificationService = require('../services/notificationService');
const { log, ACTIONS } = require('../services/auditService');

const feedbackValidators = [
  body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('isIssueResolved')
    .isBoolean().withMessage('isIssueResolved must be true or false'),
  body('resolutionQuality').optional().isInt({ min: 1, max: 5 }),
  body('responseTime').optional().isInt({ min: 1, max: 5 }),
  body('officerBehavior').optional().isInt({ min: 1, max: 5 }),
  body('comment').optional().trim().isLength({ max: 500 }),
  body('requestReopening').optional().isBoolean(),
];

/**
 * POST /api/grievances/:grievanceId/feedback
 * Citizen submits feedback after grievance is resolved.
 */
router.post(
  '/',
  protect,
  authorize(ROLES.CITIZEN),
  feedbackValidators,
  validate,
  asyncHandler(async (req, res) => {
    const { grievanceId } = req.params;

    const grievance = await Grievance.findById(grievanceId);
    if (!grievance) throw new AppError('Grievance not found', 404);

    if (grievance.submittedBy.toString() !== req.user.id) {
      throw new AppError('You can only submit feedback on your own grievances', 403);
    }

    if (grievance.status !== GRIEVANCE_STATUS.RESOLVED) {
      throw new AppError('Feedback can only be submitted on resolved grievances', 400);
    }

    const existing = await Feedback.findOne({ grievance: grievanceId });
    if (existing) throw new AppError('Feedback already submitted for this grievance', 409);

    const {
      rating, isIssueResolved, resolutionQuality,
      responseTime, officerBehavior, comment, requestReopening,
    } = req.body;

    const feedback = await Feedback.create({
      grievance: grievanceId,
      submittedBy: req.user.id,
      rating,
      isIssueResolved,
      resolutionQuality,
      responseTime,
      officerBehavior,
      comment,
      requestReopening: requestReopening || false,
    });

    // If citizen says issue is not resolved and wants reopening
    if (!isIssueResolved && requestReopening) {
      grievance.status = GRIEVANCE_STATUS.IN_PROGRESS;
      grievance.statusHistory.push({
        status: GRIEVANCE_STATUS.IN_PROGRESS,
        changedBy: req.user.id,
        note: 'Reopened by citizen — issue not resolved per feedback',
      });
      await grievance.save();
    }

    // Notify assigned officer
    if (grievance.assignedTo) {
      setImmediate(() => {
        notificationService.notifyFeedback({
          grievance,
          rating,
          officerId: grievance.assignedTo,
        });
      });
    }

    await log({
      action: ACTIONS.FEEDBACK_SUBMITTED,
      performedBy: req.user.id,
      targetType: 'Feedback',
      targetId: feedback._id,
      metadata: { grievanceId, rating, isIssueResolved },
      ipAddress: req.ip,
    });

    return sendSuccess(res, 201, 'Feedback submitted. Thank you!', { feedback });
  })
);

/**
 * GET /api/grievances/:grievanceId/feedback
 * Fetch feedback (citizen sees own, staff sees all).
 */
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const feedback = await Feedback.findOne({ grievance: req.params.grievanceId })
      .populate('submittedBy', 'name');

    return sendSuccess(res, 200, 'Feedback fetched', { feedback });
  })
);

module.exports = router;
