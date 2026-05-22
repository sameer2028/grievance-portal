const mongoose = require('mongoose');

const NOTIFICATION_TYPES = {
  STATUS_CHANGED:   'status_changed',
  COMMENT_ADDED:    'comment_added',
  GRIEVANCE_ASSIGNED: 'grievance_assigned',
  GRIEVANCE_ESCALATED: 'grievance_escalated',
  SLA_BREACH:       'sla_breach',
  FEEDBACK_RECEIVED: 'feedback_received',
};

const notificationSchema = new mongoose.Schema(
  {
    // Who receives this notification
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      required: true,
    },

    title: {
      type: String,
      required: true,
      maxlength: 200,
    },

    message: {
      type: String,
      required: true,
      maxlength: 500,
    },

    // Reference to the grievance (for deep-link in UI)
    grievance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Grievance',
      default: null,
    },

    // Reference to the actor who triggered this notification
    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Deep link path in the frontend e.g. "/grievances/abc123"
    link: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient "unread notifications for user" queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

// Auto-delete notifications older than 90 days (TTL index)
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
