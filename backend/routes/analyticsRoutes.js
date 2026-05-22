const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middlewares/errorHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { protect, authorize } = require('../middlewares/auth');
const { ROLES } = require('../config/constants');
const Grievance = require('../models/Grievance');

/**
 * GET /api/analytics/summary
 * Returns counts by status, department, and priority for dashboard widgets.
 */
router.get(
  '/summary',
  protect,
  authorize(ROLES.OFFICER, ROLES.ADMIN, ROLES.SUPER_ADMIN),
  asyncHandler(async (req, res) => {
    const matchStage = {};
    // Officers see only their department
    if (req.user.role === ROLES.OFFICER && req.user.department) {
      matchStage.department = req.user.department;
    }

    const [statusBreakdown, departmentBreakdown, priorityBreakdown, totalCount, recentTrend] =
      await Promise.all([
        // Count by status
        Grievance.aggregate([
          { $match: matchStage },
          { $group: { _id: '$status', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),

        // Count by department
        Grievance.aggregate([
          { $match: matchStage },
          { $group: { _id: '$department', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),

        // Count by priority
        Grievance.aggregate([
          { $match: matchStage },
          { $group: { _id: '$priority', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),

        // Total
        Grievance.countDocuments(matchStage),

        // Last 7 days — grievances per day
        Grievance.aggregate([
          {
            $match: {
              ...matchStage,
              createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            },
          },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ]);

    return sendSuccess(res, 200, 'Analytics summary fetched', {
      total: totalCount,
      byStatus: statusBreakdown,
      byDepartment: departmentBreakdown,
      byPriority: priorityBreakdown,
      recentTrend,
    });
  })
);

/**
 * GET /api/analytics/sentiment
 * Sentiment distribution from AI analysis results.
 */
router.get(
  '/sentiment',
  protect,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  asyncHandler(async (req, res) => {
    const data = await Grievance.aggregate([
      { $match: { 'aiAnalysis.analysisStatus': 'completed' } },
      { $group: { _id: '$aiAnalysis.sentiment', count: { $sum: 1 } } },
    ]);

    return sendSuccess(res, 200, 'Sentiment data fetched', { sentiment: data });
  })
);

module.exports = router;
