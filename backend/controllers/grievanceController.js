const { asyncHandler } = require('../middlewares/errorHandler');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');
const grievanceService = require('../services/grievanceService');
const { HTTP_STATUS } = require('../config/constants');

/**
 * POST /api/grievances
 * Protected (citizen) — submit a new grievance
 */
const createGrievance = asyncHandler(async (req, res) => {
  const { title, description, location, attachments } = req.body;

  const grievance = await grievanceService.createGrievance({
    title,
    description,
    location,
    attachments,
    submittedBy: req.user.id,
  });

  return sendSuccess(res, HTTP_STATUS.CREATED, 'Grievance submitted successfully', { grievance });
});

/**
 * GET /api/grievances
 * Protected (admin/officer) — list all grievances with filters & pagination
 */
const getAllGrievances = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    department,
    priority,
    district,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const result = await grievanceService.getAllGrievances({
    page: parseInt(page),
    limit: parseInt(limit),
    filters: { status, department, priority, district },
    search,
    sortBy,
    sortOrder,
    requestingUser: req.user,
  });

  return sendPaginated(res, result.grievances, result.pagination, 'Grievances fetched');
});

/**
 * GET /api/grievances/my
 * Protected (citizen) — get current user's grievances
 */
const getMyGrievances = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const result = await grievanceService.getUserGrievances({
    userId: req.user.id,
    page: parseInt(page),
    limit: parseInt(limit),
    status,
  });

  return sendPaginated(res, result.grievances, result.pagination, 'Your grievances fetched');
});

/**
 * GET /api/grievances/:id
 * Protected — get a single grievance by ID
 */
const getGrievanceById = asyncHandler(async (req, res) => {
  const grievance = await grievanceService.getGrievanceById(req.params.id, req.user);

  return sendSuccess(res, HTTP_STATUS.OK, 'Grievance fetched', { grievance });
});

/**
 * PATCH /api/grievances/:id/status
 * Protected (officer/admin) — update status and optionally add a response
 */
const updateGrievanceStatus = asyncHandler(async (req, res) => {
  const { status, officialResponse, internalNotes } = req.body;

  const grievance = await grievanceService.updateGrievanceStatus({
    grievanceId: req.params.id,
    status,
    officialResponse,
    internalNotes,
    updatedBy: req.user,
  });

  return sendSuccess(res, HTTP_STATUS.OK, 'Grievance status updated', { grievance });
});

/**
 * PATCH /api/grievances/:id/assign
 * Protected (admin) — assign grievance to an officer
 */
const assignGrievance = asyncHandler(async (req, res) => {
  const { officerId } = req.body;

  const grievance = await grievanceService.assignGrievance({
    grievanceId: req.params.id,
    officerId,
    assignedBy: req.user,
  });

  return sendSuccess(res, HTTP_STATUS.OK, 'Grievance assigned successfully', { grievance });
});

/**
 * GET /api/grievances/:id/ticket
 * Public — lookup grievance status by ticket number (for citizens without login)
 */
const trackByTicket = asyncHandler(async (req, res) => {
  const grievance = await grievanceService.trackByTicketNumber(req.params.ticketNumber);

  return sendSuccess(res, HTTP_STATUS.OK, 'Grievance found', { grievance });
});

module.exports = {
  createGrievance,
  getAllGrievances,
  getMyGrievances,
  getGrievanceById,
  updateGrievanceStatus,
  assignGrievance,
  trackByTicket,
};
