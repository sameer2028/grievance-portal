const express = require('express');
const router = express.Router();

const { asyncHandler } = require('../middlewares/errorHandler');
const { sendSuccess } = require('../utils/apiResponse');
const Grievance = require('../models/Grievance');
const Feedback = require('../models/Feedback');
const { GRIEVANCE_STATUS } = require('../config/constants');

/**
 * GET /api/public/stats
 * No authentication required.
 * Powers the public transparency dashboard.
 */
router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const [
      total,
      resolved,
      pending,
      byDepartment,
      byDistrict,
      avgRating,
      recentResolved,
    ] = await Promise.all([
      Grievance.countDocuments(),
      Grievance.countDocuments({ status: GRIEVANCE_STATUS.RESOLVED }),
      Grievance.countDocuments({ status: GRIEVANCE_STATUS.PENDING }),
      Grievance.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 }, resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } } } },
        { $sort: { count: -1 } },
        { $limit: 9 },
      ]),
      Grievance.aggregate([
        { $match: { 'location.district': { $exists: true, $ne: '' } } },
        { $group: { _id: '$location.district', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Feedback.aggregate([
        { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]),
      Grievance.countDocuments({
        status: GRIEVANCE_STATUS.RESOLVED,
        resolvedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),
    ]);

    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    return sendSuccess(res, 200, 'Public stats fetched', {
      overview: {
        total,
        resolved,
        pending,
        resolutionRate,
        recentResolved,
        avgCitizenRating: avgRating[0]?.avgRating?.toFixed(1) || null,
        totalFeedbacks: avgRating[0]?.count || 0,
      },
      byDepartment,
      byDistrict,
    });
  })
);

module.exports = router;
