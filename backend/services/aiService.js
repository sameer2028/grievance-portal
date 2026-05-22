const axios = require('axios');
const Grievance = require('../models/Grievance');
const { PRIORITY_LEVELS, DEPARTMENTS } = require('../config/constants');
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
 * Calls the AI service to analyze a grievance text.
 * Updates the Grievance document in MongoDB with results.
 * Called asynchronously (fire-and-forget) from grievanceService.
 */
const analyzeGrievance = async (grievanceId, title, description) => {
  // Mark as processing before making the call
  await Grievance.findByIdAndUpdate(grievanceId, {
    'aiAnalysis.analysisStatus': 'processing',
  });

  try {
    const response = await aiClient.post('/analyze', {
      grievance_id: grievanceId.toString(),
      title,
      description,
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

    // Update the grievance with AI results
    await Grievance.findByIdAndUpdate(grievanceId, {
      'aiAnalysis.category': category || DEPARTMENTS.OTHER,
      'aiAnalysis.categoryConfidence': category_confidence,
      'aiAnalysis.sentiment': sentiment,
      'aiAnalysis.sentimentScore': sentiment_score,
      'aiAnalysis.urgencyScore': urgency_score,
      'aiAnalysis.isDuplicate': is_duplicate || false,
      'aiAnalysis.duplicateOf': duplicate_of || null,
      'aiAnalysis.analysisStatus': 'completed',
      'aiAnalysis.analyzedAt': new Date(),
      // Auto-set department and priority from AI results
      department: category || DEPARTMENTS.OTHER,
      priority: urgencyToPriority(urgency_score),
    });

    logger.info(`AI analysis complete for grievance ${grievanceId}`, {
      category,
      sentiment,
      urgencyScore: urgency_score,
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
    .select('_id title description')
    .limit(20);

  logger.info(`Retrying AI analysis for ${failed.length} grievances`);

  for (const g of failed) {
    await analyzeGrievance(g._id, g.title, g.description);
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
