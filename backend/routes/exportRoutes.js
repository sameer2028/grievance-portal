const express = require('express');
const router = express.Router();

const { asyncHandler } = require('../middlewares/errorHandler');
const { protect, authorize } = require('../middlewares/auth');
const { ROLES } = require('../config/constants');
const { exportGrievancesCSV } = require('../services/exportService');

/**
 * GET /api/export/grievances
 * Admin/Officer — download grievances as CSV.
 *
 * Query params: status, department, priority, district, fromDate, toDate
 */
router.get(
  '/grievances',
  protect,
  authorize(ROLES.OFFICER, ROLES.ADMIN, ROLES.SUPER_ADMIN),
  asyncHandler(async (req, res) => {
    const { csv, count } = await exportGrievancesCSV(req.query, req.user);

    const filename = `grievances-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('X-Record-Count', count);

    // Add BOM for Excel UTF-8 compatibility
    res.send('\uFEFF' + csv);
  })
);

module.exports = router;
