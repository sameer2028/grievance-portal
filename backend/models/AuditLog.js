const mongoose = require('mongoose');

/**
 * Immutable audit trail for all significant actions.
 * Written by the auditLog service — never updated or deleted.
 *
 * Examples of logged actions:
 *   - Grievance status change
 *   - Grievance assignment
 *   - Officer account created/deactivated
 *   - SLA config updated
 *   - Bulk operations
 */
const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      // e.g. "GRIEVANCE_STATUS_CHANGED", "USER_CREATED", "SLA_UPDATED"
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // The document being acted upon
    targetType: {
      type: String,
      enum: ['Grievance', 'User', 'SLAConfig', 'Comment', 'Feedback'],
      required: true,
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    // Snapshot of what changed: { from: {...}, to: {...} }
    changes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Extra context
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    ipAddress: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    // Prevent any updates — audit logs are write-once
  }
);

// Efficient queries by target or actor
auditLogSchema.index({ performedBy: 1, createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

// Auto-delete after 1 year
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
