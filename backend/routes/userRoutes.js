const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const { protect, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');
const { ROLES, DEPARTMENTS } = require('../config/constants');
const User = require('../models/User');
const { log, ACTIONS } = require('../services/auditService');

// ── Profile routes (any authenticated user) ───────────────────────────────────

/**
 * GET /api/users/profile
 * Returns full profile of current user.
 */
router.get('/profile', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new AppError('User not found', 404);
  return sendSuccess(res, 200, 'Profile fetched', { user: user.toSafeObject() });
}));

/**
 * PATCH /api/users/profile
 * Update own name, phone.
 */
router.patch(
  '/profile',
  protect,
  [
    body('name').optional().trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2–80 chars'),
    body('phone').optional().matches(/^[6-9]\d{9}$/).withMessage('Invalid phone number'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { name, phone } = req.body;
    const update = {};
    if (name)  update.name  = name;
    if (phone) update.phone = phone;

    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true, runValidators: true });
    return sendSuccess(res, 200, 'Profile updated', { user: user.toSafeObject() });
  })
);

/**
 * PATCH /api/users/change-password
 * Current user changes their own password.
 */
router.patch(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password required'),
    body('newPassword')
      .isLength({ min: 4 }).withMessage('Password must be at least 4 characters')
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    if (!user) throw new AppError('User not found', 404);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw new AppError('Current password is incorrect', 401);

    user.password = newPassword;
    await user.save();

    return sendSuccess(res, 200, 'Password changed successfully');
  })
);

// ── Admin user management ─────────────────────────────────────────────────────

/**
 * GET /api/users
 * Admin — list all users with optional role/department filter.
 */
router.get(
  '/',
  protect,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  asyncHandler(async (req, res) => {
    const { role, department, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (role)       query.role       = role;
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    return sendPaginated(
      res,
      users.map((u) => u.toSafeObject()),
      { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) },
      'Users fetched'
    );
  })
);

/**
 * POST /api/users/officers
 * Admin — create a new officer account.
 */
router.post(
  '/officers',
  protect,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  [
    body('name').trim().notEmpty().isLength({ min: 2, max: 80 }),
    body('email').trim().isEmail().normalizeEmail(),
    body('password').isLength({ min: 4 }),
    body('phone').optional().matches(/^[6-9]\d{9}$/),
    body('department')
      .notEmpty().withMessage('Department is required')
      .isIn(Object.values(DEPARTMENTS)).withMessage('Invalid department'),
    body('jurisdiction').optional().isArray(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { name, email, password, phone, department, jurisdiction } = req.body;

    const existing = await User.findOne({ email });
    if (existing) throw new AppError('Email already registered', 409);

    const officer = await User.create({
      name, email, password, phone,
      role: ROLES.OFFICER,
      department,
      jurisdiction: jurisdiction || [],
    });

    await log({
      action: ACTIONS.USER_CREATED,
      performedBy: req.user.id,
      targetType: 'User',
      targetId: officer._id,
      changes: { role: ROLES.OFFICER, department },
      ipAddress: req.ip,
    });

    return sendSuccess(res, 201, 'Officer account created', { user: officer.toSafeObject() });
  })
);

/**
 * PATCH /api/users/:id/toggle-active
 * Admin — activate or deactivate any user account.
 */
router.patch(
  '/:id/toggle-active',
  protect,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw new AppError('User not found', 404);

    // Protect super admin accounts from being deactivated
    if (user.role === ROLES.SUPER_ADMIN && req.user.role !== ROLES.SUPER_ADMIN) {
      throw new AppError('Cannot modify super admin accounts', 403);
    }

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    await log({
      action: user.isActive ? ACTIONS.USER_REACTIVATED : ACTIONS.USER_DEACTIVATED,
      performedBy: req.user.id,
      targetType: 'User',
      targetId: user._id,
      changes: { isActive: user.isActive },
      ipAddress: req.ip,
    });

    return sendSuccess(
      res, 200,
      `User ${user.isActive ? 'activated' : 'deactivated'}`,
      { user: user.toSafeObject() }
    );
  })
);

/**
 * PATCH /api/users/:id/department
 * Admin — reassign an officer to a different department.
 */
router.patch(
  '/:id/department',
  protect,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  [body('department').isIn(Object.values(DEPARTMENTS)).withMessage('Invalid department')],
  validate,
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { department: req.body.department },
      { new: true }
    );
    if (!user) throw new AppError('User not found', 404);

    return sendSuccess(res, 200, 'Department updated', { user: user.toSafeObject() });
  })
);

/**
 * GET /api/users/:id
 * Admin — get a specific user's profile.
 */
router.get(
  '/:id',
  protect,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw new AppError('User not found', 404);
    return sendSuccess(res, 200, 'User fetched', { user: user.toSafeObject() });
  })
);

module.exports = router;
