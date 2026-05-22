const express = require('express');
const router = express.Router();

const { asyncHandler } = require('../middlewares/errorHandler');
const { protect } = require('../middlewares/auth');
const { sendSuccess } = require('../utils/apiResponse');
const Notification = require('../models/Notification');

/**
 * GET /api/notifications
 * Returns paginated notifications for the logged-in user.
 */
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const query = { recipient: req.user.id };
    if (unreadOnly === 'true') query.isRead = false;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .populate('triggeredBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments(query),
      Notification.countDocuments({ recipient: req.user.id, isRead: false }),
    ]);

    return sendSuccess(res, 200, 'Notifications fetched', {
      notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  })
);

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read.
 */
router.patch(
  '/:id/read',
  protect,
  asyncHandler(async (req, res) => {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isRead: true }
    );
    return sendSuccess(res, 200, 'Marked as read');
  })
);

/**
 * PATCH /api/notifications/read-all
 * Mark all unread notifications as read.
 */
router.patch(
  '/read-all',
  protect,
  asyncHandler(async (req, res) => {
    const result = await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true }
    );
    return sendSuccess(res, 200, `${result.modifiedCount} notifications marked as read`);
  })
);

/**
 * DELETE /api/notifications/:id
 * Delete a specific notification.
 */
router.delete(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user.id });
    return sendSuccess(res, 200, 'Notification deleted');
  })
);

module.exports = router;
