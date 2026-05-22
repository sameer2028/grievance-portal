const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

/**
 * Records an audit event. Fire-and-forget — never blocks the main request.
 *
 * @param {object} opts
 * @param {string}   opts.action       - e.g. "GRIEVANCE_STATUS_CHANGED"
 * @param {ObjectId} opts.performedBy  - user who did it
 * @param {string}   opts.targetType   - "Grievance" | "User" | "SLAConfig" ...
 * @param {ObjectId} opts.targetId     - ID of the affected document
 * @param {object}   opts.changes      - { from: {}, to: {} }
 * @param {object}   opts.metadata     - any extra context
 * @param {string}   opts.ipAddress    - request IP
 */
const log = async ({ action, performedBy, targetType, targetId, changes = {}, metadata = {}, ipAddress = null }) => {
  try {
    await AuditLog.create({
      action,
      performedBy,
      targetType,
      targetId,
      changes,
      metadata,
      ipAddress,
    });
  } catch (err) {
    // Audit log failure must never crash the main flow
    logger.error('Audit log write failed', { action, error: err.message });
  }
};

// ── Predefined action constants ───────────────────────────────────────────────
const ACTIONS = {
  GRIEVANCE_CREATED:        'GRIEVANCE_CREATED',
  GRIEVANCE_STATUS_CHANGED: 'GRIEVANCE_STATUS_CHANGED',
  GRIEVANCE_ASSIGNED:       'GRIEVANCE_ASSIGNED',
  GRIEVANCE_ESCALATED:      'GRIEVANCE_ESCALATED',
  COMMENT_ADDED:            'COMMENT_ADDED',
  COMMENT_DELETED:          'COMMENT_DELETED',
  USER_CREATED:             'USER_CREATED',
  USER_DEACTIVATED:         'USER_DEACTIVATED',
  USER_REACTIVATED:         'USER_REACTIVATED',
  USER_ROLE_CHANGED:        'USER_ROLE_CHANGED',
  SLA_UPDATED:              'SLA_UPDATED',
  FEEDBACK_SUBMITTED:       'FEEDBACK_SUBMITTED',
  EXPORT_GENERATED:         'EXPORT_GENERATED',
};

module.exports = { log, ACTIONS };
