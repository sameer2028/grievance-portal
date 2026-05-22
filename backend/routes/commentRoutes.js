const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams gets :grievanceId from parent
const { body } = require('express-validator');

const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const { protect, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { sendSuccess } = require('../utils/apiResponse');
const { ROLES } = require('../config/constants');

const Comment = require('../models/Comment');
const Grievance = require('../models/Grievance');
const notificationService = require('../services/notificationService');
const { log, ACTIONS } = require('../services/auditService');

// Validators
const commentValidators = [
  body('text')
    .trim().notEmpty().withMessage('Comment text is required')
    .isLength({ min: 2, max: 1000 }).withMessage('Comment must be 2–1000 characters'),
  body('isInternal')
    .optional().isBoolean().withMessage('isInternal must be boolean'),
];

/**
 * GET /api/grievances/:grievanceId/comments
 * Returns comments. Citizens see only non-internal; staff see all.
 */
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const { grievanceId } = req.params;
    const isStaff = [ROLES.OFFICER, ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(req.user.role);

    const query = { grievance: grievanceId, isDeleted: false };
    if (!isStaff) query.isInternal = false;

    const comments = await Comment.find(query)
      .populate('author', 'name role')
      .populate('replyTo', 'text author')
      .sort({ createdAt: 1 });

    return sendSuccess(res, 200, 'Comments fetched', { comments });
  })
);

/**
 * POST /api/grievances/:grievanceId/comments
 * Add a comment. Only staff can mark isInternal: true.
 */
router.post(
  '/',
  protect,
  commentValidators,
  validate,
  asyncHandler(async (req, res) => {
    const { grievanceId } = req.params;
    const { text, isInternal = false, replyTo } = req.body;
    const isStaff = [ROLES.OFFICER, ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(req.user.role);

    // Citizens cannot post internal comments
    const effectiveInternal = isStaff ? isInternal : false;

    // Verify grievance exists and citizen owns it (if citizen)
    const grievance = await Grievance.findById(grievanceId);
    if (!grievance) throw new AppError('Grievance not found', 404);

    if (
      req.user.role === ROLES.CITIZEN &&
      grievance.submittedBy.toString() !== req.user.id
    ) {
      throw new AppError('Access denied', 403);
    }

    const comment = await Comment.create({
      grievance: grievanceId,
      author: req.user.id,
      text,
      isInternal: effectiveInternal,
      replyTo: replyTo || null,
    });

    await comment.populate('author', 'name role');

    // Fire notifications (non-blocking)
    setImmediate(async () => {
      await notificationService.notifyComment({
        grievance,
        commenterName: req.user.name || 'User',
        commenterId: req.user.id,
        isInternal: effectiveInternal,
      });
    });

    await log({
      action: ACTIONS.COMMENT_ADDED,
      performedBy: req.user.id,
      targetType: 'Comment',
      targetId: comment._id,
      metadata: { grievanceId, isInternal: effectiveInternal },
      ipAddress: req.ip,
    });

    return sendSuccess(res, 201, 'Comment added', { comment });
  })
);

/**
 * DELETE /api/grievances/:grievanceId/comments/:commentId
 * Soft-delete. Author or admin only.
 */
router.delete(
  '/:commentId',
  protect,
  asyncHandler(async (req, res) => {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) throw new AppError('Comment not found', 404);

    const isOwner = comment.author.toString() === req.user.id;
    const isAdmin = [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(req.user.role);

    if (!isOwner && !isAdmin) throw new AppError('Access denied', 403);

    comment.isDeleted = true;
    await comment.save();

    await log({
      action: ACTIONS.COMMENT_DELETED,
      performedBy: req.user.id,
      targetType: 'Comment',
      targetId: comment._id,
      ipAddress: req.ip,
    });

    return sendSuccess(res, 200, 'Comment deleted');
  })
);

module.exports = router;
