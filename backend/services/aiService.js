const axios = require('axios');
const Grievance = require('../models/Grievance');
const User = require('../models/User');
const { PRIORITY_LEVELS, DEPARTMENTS, GRIEVANCE_STATUS, ROLES } = require('../config/constants');
const logger = require('../utils/logger');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Dedicated Axios instance for AI service — has its own timeout
const aiClient = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: 30000, // AI analysis can take up to 30 seconds for large models
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Map AI urgency score (0.0–1.0) to our priority levels.
 */
const urgencyToPriority = (urgencyScore) => {
  if (urgencyScore >= 0.8) return PRIORITY_LEVELS.CRITICAL;
  if (urgencyScore >= 0.6) return PRIORITY_LEVELS.HIGH;
  if (urgencyScore >= 0.35) return PRIORITY_LEVELS.MEDIUM;
  return PRIORITY_LEVELS.LOW;
};

/**
 * Find the most suitable officer for a department (least busy).
 */
const findBestOfficerForDepartment = async (department) => {
  const officers = await User.find({ role: ROLES.OFFICER, department, isActive: true });
  if (!officers || officers.length === 0) return null;

  let leastBusyOfficer = officers[0];
  let minCount = Infinity;

  for (const officer of officers) {
    const count = await Grievance.countDocuments({
      assignedTo: officer._id,
      status: { $in: [GRIEVANCE_STATUS.ASSIGNED, GRIEVANCE_STATUS.IN_PROGRESS] }
    });
    if (count < minCount) {
      minCount = count;
      leastBusyOfficer = officer;
    }
  }
  
  return leastBusyOfficer;
};

/**
 * Calls the AI service to analyze a grievance text.
 * Updates the Grievance document in MongoDB with results.
 * Called asynchronously (fire-and-forget) from grievanceService.
 */
const analyzeGrievance = async (grievanceId, title, description, attachments = []) => {
  // Mark as processing before making the call
  await Grievance.findByIdAndUpdate(grievanceId, {
    'aiAnalysis.analysisStatus': 'processing',
  });

  try {
    const response = await aiClient.post('/analyze', {
      grievance_id: grievanceId.toString(),
      title,
      description,
      attachments: attachments || [],
    });

    const {
      category,
      category_confidence,
      sentiment,
      sentiment_score,
      urgency_score,
      is_duplicate,
      duplicate_of,
    } = response.data;

    const categoryToUse = category || DEPARTMENTS.OTHER;
    const priorityToUse = urgencyToPriority(urgency_score);

    // Auto-assignment logic
    const officer = await findBestOfficerForDepartment(categoryToUse);
    const assignedTo = officer ? officer._id : null;
    const finalStatus = officer ? GRIEVANCE_STATUS.ASSIGNED : GRIEVANCE_STATUS.PENDING;

    // Update the grievance with AI results
    const updateData = {
      'aiAnalysis.category': categoryToUse,
      'aiAnalysis.categoryConfidence': category_confidence,
      'aiAnalysis.sentiment': sentiment,
      'aiAnalysis.sentimentScore': sentiment_score,
      'aiAnalysis.urgencyScore': urgency_score,
      'aiAnalysis.isDuplicate': is_duplicate || false,
      'aiAnalysis.duplicateOf': duplicate_of || null,
      'aiAnalysis.analysisStatus': 'completed',
      'aiAnalysis.analyzedAt': new Date(),
      // Auto-set department and priority from AI results
      department: categoryToUse,
      priority: priorityToUse,
    };

    if (assignedTo) {
      updateData.assignedTo = assignedTo;
      updateData.status = finalStatus;
    }

    const updatedGrievance = await Grievance.findByIdAndUpdate(grievanceId, updateData, { new: true });

    if (assignedTo && updatedGrievance) {
      updatedGrievance.statusHistory.push({
        status: finalStatus,
        note: `Auto-assigned to officer ${officer.name} by AI based on department routing.`,
      });
      await updatedGrievance.save();
    }

    logger.info(`AI analysis complete for grievance ${grievanceId}`, {
      category: categoryToUse,
      sentiment,
      urgencyScore: urgency_score,
      assignedTo: assignedTo ? assignedTo.toString() : null,
    });
  } catch (error) {
    // AI service failure should NOT block grievance creation
    // Mark as failed — can be retried by a cron job
    await Grievance.findByIdAndUpdate(grievanceId, {
      'aiAnalysis.analysisStatus': 'failed',
    });

    logger.error(`AI analysis failed for grievance ${grievanceId}`, {
      error: error.message,
      code: error.code,
    });
  }
};

/**
 * Batch re-analyze grievances whose analysis failed.
 * Can be called by a scheduled job.
 */
const retryFailedAnalyses = async () => {
  const failed = await Grievance.find({ 'aiAnalysis.analysisStatus': 'failed' })
    .select('_id title description attachments')
    .limit(20);

  logger.info(`Retrying AI analysis for ${failed.length} grievances`);

  for (const g of failed) {
    await analyzeGrievance(g._id, g.title, g.description, g.attachments);
  }
};

/**
 * Check if AI service is reachable.
 */
const checkAIHealth = async () => {
  try {
    const res = await aiClient.get('/health');
    return { online: true, data: res.data };
  } catch {
    return { online: false };
  }
};

module.exports = { analyzeGrievance, retryFailedAnalyses, checkAIHealth };
