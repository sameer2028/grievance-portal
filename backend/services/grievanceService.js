const Grievance = require('../models/Grievance');
const User = require('../models/User');
const { AppError } = require('../middlewares/errorHandler');
const { GRIEVANCE_STATUS, PRIORITY_LEVELS, ROLES, DEPARTMENTS } = require('../config/constants');
const logger = require('../utils/logger');
const aiService = require('./aiService');

/**
 * Create a new grievance and trigger async AI analysis.
 * AI analysis runs in the background — user gets an immediate response.
 */
const createGrievance = async ({ title, description, location, attachments, submittedBy }) => {
  const grievance = await Grievance.create({
    title,
    description,
    location,
    attachments: attachments || [],
    submittedBy,
    status: GRIEVANCE_STATUS.PENDING,
    statusHistory: [
      {
        status: GRIEVANCE_STATUS.PENDING,
        changedBy: submittedBy,
        note: 'Grievance submitted',
      },
    ],
  });

  logger.info(`Grievance created: ${grievance.ticketNumber} by user ${submittedBy}`);

  // Fire-and-forget: trigger AI analysis without blocking the response
  // If AI service is down, the grievance is still created — analysis retries can be scheduled
  setImmediate(() => {
    aiService.analyzeGrievance(grievance._id, title, description).catch((err) => {
      logger.error(`AI analysis failed for ${grievance.ticketNumber}`, { error: err.message });
    });
  });

  return grievance;
};

/**
 * Paginated grievance list with dynamic filters.
 * Officers only see their assigned department; admins see everything.
 */
const getAllGrievances = async ({
  page,
  limit,
  filters,
  search,
  sortBy,
  sortOrder,
  requestingUser,
}) => {
  const query = {};

  // Officers are scoped to their department
  if (requestingUser.role === ROLES.OFFICER && requestingUser.department) {
    query.department = requestingUser.department;
  }

  // Apply optional filters
  if (filters.status) query.status = filters.status;
  if (filters.department && requestingUser.role === ROLES.ADMIN) query.department = filters.department;
  if (filters.priority) query.priority = filters.priority;
  if (filters.district) query['location.district'] = filters.district;

  // Text search on title and description
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { ticketNumber: { $regex: search, $options: 'i' } },
    ];
  }

  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  const skip = (page - 1) * limit;

  const [grievances, total] = await Promise.all([
    Grievance.find(query)
      .populate('submittedBy', 'name email phone')
      .populate('assignedTo', 'name email department')
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(limit)
      .lean(),
    Grievance.countDocuments(query),
  ]);

  return {
    grievances,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
};

/**
 * Get all grievances submitted by a specific citizen.
 */
const getUserGrievances = async ({ userId, page, limit, status }) => {
  const query = { submittedBy: userId };
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const [grievances, total] = await Promise.all([
    Grievance.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Grievance.countDocuments(query),
  ]);

  return {
    grievances,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

/**
 * Fetch a single grievance.
 * Citizens can only see their own; officers/admins see all.
 */
const getGrievanceById = async (grievanceId, requestingUser) => {
  const grievance = await Grievance.findById(grievanceId)
    .populate('submittedBy', 'name email phone')
    .populate('assignedTo', 'name email department')
    .populate('statusHistory.changedBy', 'name role');

  if (!grievance) {
    throw new AppError('Grievance not found', 404);
  }

  // Citizens can only view their own grievances
  if (
    requestingUser.role === ROLES.CITIZEN &&
    grievance.submittedBy._id.toString() !== requestingUser.id
  ) {
    throw new AppError('Access denied', 403);
  }

  // Increment view count (non-blocking)
  Grievance.findByIdAndUpdate(grievanceId, { $inc: { viewCount: 1 } }).exec();

  return grievance;
};

/**
 * Update grievance status with an audit trail entry.
 */
const updateGrievanceStatus = async ({
  grievanceId,
  status,
  officialResponse,
  internalNotes,
  updatedBy,
}) => {
  const grievance = await Grievance.findById(grievanceId);
  if (!grievance) throw new AppError('Grievance not found', 404);

  if (!Object.values(GRIEVANCE_STATUS).includes(status)) {
    throw new AppError(`Invalid status: ${status}`, 400);
  }

  // Officers can only update their department's grievances
  if (updatedBy.role === ROLES.OFFICER && grievance.department.toLowerCase() !== updatedBy.department.toLowerCase()) {
    throw new AppError('You can only update grievances in your department', 403);
  }

  grievance.status = status;
  if (officialResponse) grievance.officialResponse = officialResponse;
  if (internalNotes) grievance.internalNotes = internalNotes;
  if (status === GRIEVANCE_STATUS.RESOLVED) grievance.resolvedAt = new Date();
  if (status === GRIEVANCE_STATUS.ESCALATED) grievance.escalatedAt = new Date();

  grievance.statusHistory.push({
    status,
    changedBy: updatedBy.id,
    note: officialResponse || `Status changed to ${status}`,
  });

  await grievance.save();
  logger.info(`Grievance ${grievanceId} status → ${status} by ${updatedBy.id}`);

  return grievance;
};

/**
 * Assign a grievance to an officer.
 */
const assignGrievance = async ({ grievanceId, officerId, assignedBy }) => {
  const [grievance, officer] = await Promise.all([
    Grievance.findById(grievanceId),
    User.findById(officerId),
  ]);

  if (!grievance) throw new AppError('Grievance not found', 404);
  if (!officer || officer.role !== ROLES.OFFICER) {
    throw new AppError('Invalid officer ID', 400);
  }

  grievance.assignedTo = officerId;
  grievance.status = GRIEVANCE_STATUS.ASSIGNED;
  grievance.statusHistory.push({
    status: GRIEVANCE_STATUS.ASSIGNED,
    changedBy: assignedBy.id,
    note: `Assigned to ${officer.name}`,
  });

  await grievance.save();
  return grievance;
};

/**
 * Public ticket lookup — returns limited fields only.
 */
const trackByTicketNumber = async (ticketNumber) => {
  const grievance = await Grievance.findOne({ ticketNumber }).select(
    'ticketNumber title status department priority createdAt resolvedAt officialResponse statusHistory'
  );

  if (!grievance) throw new AppError('Ticket not found', 404);

  return grievance;
};

module.exports = {
  createGrievance,
  getAllGrievances,
  getUserGrievances,
  getGrievanceById,
  updateGrievanceStatus,
  assignGrievance,
  trackByTicketNumber,
};
