/**
 * Centralized constants for the backend.
 * Import from here — never hardcode these strings in business logic.
 */

// User roles — used in JWT payloads and route guards
const ROLES = {
  CITIZEN: 'citizen',
  OFFICER: 'officer',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
};

// Grievance lifecycle states
const GRIEVANCE_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
  ESCALATED: 'escalated',
};

// Priority levels set by AI urgency predictor
const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// Government departments for routing
const DEPARTMENTS = {
  WATER: 'water_supply',
  ELECTRICITY: 'electricity',
  ROADS: 'roads_infrastructure',
  SANITATION: 'sanitation',
  HEALTH: 'health',
  EDUCATION: 'education',
  TRANSPORT: 'transport',
  REVENUE: 'revenue',
  POLICE: 'police',
  OTHER: 'other',
};

// Sentiment labels from AI service
const SENTIMENT = {
  POSITIVE: 'positive',
  NEGATIVE: 'negative',
  NEUTRAL: 'neutral',
};

// HTTP status codes (most common ones — avoids magic numbers in controllers)
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

module.exports = {
  ROLES,
  GRIEVANCE_STATUS,
  PRIORITY_LEVELS,
  DEPARTMENTS,
  SENTIMENT,
  HTTP_STATUS,
};
