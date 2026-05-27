const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');
const grievanceService = require('../services/grievanceService');
const { HTTP_STATUS } = require('../config/constants');
const crypto = require('crypto');
const { GoogleGenAI } = require('@google/genai');
const Grievance = require('../models/Grievance');
const fs = require('fs');
const path = require('path');

/**
 * POST /api/grievances
 * Protected (citizen) — submit a new grievance
 */
const createGrievance = asyncHandler(async (req, res) => {
  const { title, description, location, attachments, imageHash } = req.body;

  const grievance = await grievanceService.createGrievance({
    title,
    description,
    location,
    attachments,
    imageHash,
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

/**
 * POST /api/grievances/analyze-image
 * Protected — Upload image, check for duplicates, analyze using Gemini
 */
const analyzeImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('No image uploaded', 400);
  }

  // 1. Calculate image hash
  const hash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');

  // 2. Check for duplicate image
  const existing = await Grievance.findOne({ imageHash: hash }).select('_id createdAt');
  if (existing) {
    throw new AppError('Duplicate image detected. This issue has already been reported.', 400);
  }

  // 3. Initialize Gemini
  if (!process.env.GEMINI_API_KEY) {
    throw new AppError('Gemini API key not configured', 500);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const mimeType = req.file.mimetype;
  const base64Data = req.file.buffer.toString('base64');

  // 4. Prompt Gemini
  const prompt = `Analyze this image which a citizen is trying to submit as a civic grievance (e.g. broken road, garbage dump, water leak, broken streetlight).
  
If the image does NOT depict a valid civic issue (e.g. it is a selfie, a meme, a random screenshot, or a blank photo), respond with a JSON object: {"isRelevant": false}.

If it IS a valid civic issue, respond with a JSON object:
{
  "isRelevant": true,
  "title": "A short, concise title describing the problem (max 100 chars)",
  "description": "A detailed explanation of the problem visible in the image."
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      { role: 'user', parts: [
        { text: prompt },
        { inlineData: { mimeType, data: base64Data } }
      ]}
    ]
  });

  const text = response.text;
  
  // Extract JSON from response (handling potential markdown formatting)
  let resultJSON;
  try {
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      resultJSON = JSON.parse(jsonMatch[1]);
    } else {
      resultJSON = JSON.parse(text);
    }
  } catch (err) {
    throw new AppError('Failed to parse AI response', 500);
  }

  if (!resultJSON.isRelevant) {
    throw new AppError('Irrelevant image detected. Please upload a clear photo of a civic issue.', 400);
  }

  // Save the valid image to disk
  const ext = req.file.originalname.split('.').pop();
  const filename = `${hash}-${Date.now()}.${ext}`;
  const uploadPath = path.join(__dirname, '..', 'uploads', filename);
  fs.writeFileSync(uploadPath, req.file.buffer);

  // Return the hash and the new attachment path
  resultJSON.imageHash = hash;
  resultJSON.attachmentPath = `/uploads/${filename}`;

  return sendSuccess(res, HTTP_STATUS.OK, 'Image analyzed successfully', resultJSON);
});

module.exports = {
  createGrievance,
  getAllGrievances,
  getMyGrievances,
  getGrievanceById,
  updateGrievanceStatus,
  assignGrievance,
  trackByTicket,
  analyzeImage,
};
