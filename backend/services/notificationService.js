const Notification = require('../models/Notification');
const { NOTIFICATION_TYPES } = require('../models/Notification');
const logger = require('../utils/logger');

/**
 * Central notification factory.
 * All notification creation goes through here — not scattered in controllers.
 *
 * Architecture: in-app only for now.
 * Email/SMS can be added later by hooking into these functions.
 */

const create = async ({ recipient, type, title, message, grievanceId, triggeredBy, link }) => {
  try {
    await Notification.create({
      recipient,
      type,
      title,
      message,
      grievance: grievanceId || null,
      triggeredBy: triggeredBy || null,
      link: link || null,
    });
  } catch (err) {
    // Notification failure must NEVER crash the main flow
    logger.error('Failed to create notification', { error: err.message, type, recipient });
  }
};

// ── Domain-specific helpers ──────────────────────────────────────────────────

/**
 * Notify citizen when their grievance status changes.
 */
const notifyStatusChange = async ({ citizenId, grievance, newStatus, officerId }) => {
  const statusMessages = {
    assigned:    'Your grievance has been assigned to an officer.',
    in_progress: 'Work has started on your grievance.',
    resolved:    'Your grievance has been marked as resolved. Please share your feedback.',
    rejected:    'Your grievance has been rejected. See official response for details.',
    escalated:   'Your grievance has been escalated to senior authorities.',
  };

  await create({
    recipient: citizenId,
    type: NOTIFICATION_TYPES.STATUS_CHANGED,
    title: `Grievance ${newStatus.replace('_', ' ')}`,
    message: statusMessages[newStatus] || `Status updated to ${newStatus}`,
    grievanceId: grievance._id,
    triggeredBy: officerId,
    link: `/grievances/${grievance._id}`,
  });
};

/**
 * Notify officer when a grievance is assigned to them.
 */
const notifyAssignment = async ({ officerId, grievance, adminId }) => {
  await create({
    recipient: officerId,
    type: NOTIFICATION_TYPES.GRIEVANCE_ASSIGNED,
    title: 'New Grievance Assigned',
    message: `You have been assigned: "${grievance.title.substring(0, 80)}"`,
    grievanceId: grievance._id,
    triggeredBy: adminId,
    link: `/admin/grievances/${grievance._id}`,
  });
};

/**
 * Notify citizen and assigned officer when a comment is added.
 */
const notifyComment = async ({ grievance, commenterName, commenterId, isInternal }) => {
  const targets = [];

  // Notify citizen (only if comment is not internal)
  if (!isInternal && grievance.submittedBy.toString() !== commenterId.toString()) {
    targets.push({
      recipient: grievance.submittedBy,
      link: `/grievances/${grievance._id}`,
    });
  }

  // Notify assigned officer if citizen commented
  if (grievance.assignedTo && grievance.assignedTo.toString() !== commenterId.toString()) {
    targets.push({
      recipient: grievance.assignedTo,
      link: `/admin/grievances/${grievance._id}`,
    });
  }

  await Promise.all(
    targets.map((t) =>
      create({
        recipient: t.recipient,
        type: NOTIFICATION_TYPES.COMMENT_ADDED,
        title: 'New Comment on Grievance',
        message: `${commenterName} commented on "${grievance.title.substring(0, 60)}"`,
        grievanceId: grievance._id,
        triggeredBy: commenterId,
        link: t.link,
      })
    )
  );
};

/**
 * Notify admin and officer when SLA is breached.
 * Called by the escalation cron job.
 */
const notifySLABreach = async ({ grievance, recipientIds }) => {
  await Promise.all(
    recipientIds.map((recipientId) =>
      create({
        recipient: recipientId,
        type: NOTIFICATION_TYPES.SLA_BREACH,
        title: '⚠ SLA Breach Alert',
        message: `Grievance "${grievance.title.substring(0, 60)}" has exceeded its resolution deadline.`,
        grievanceId: grievance._id,
        link: `/admin/grievances/${grievance._id}`,
      })
    )
  );
};

/**
 * Notify officer when feedback is submitted on their resolved grievance.
 */
const notifyFeedback = async ({ grievance, rating, officerId }) => {
  await create({
    recipient: officerId,
    type: NOTIFICATION_TYPES.FEEDBACK_RECEIVED,
    title: 'Citizen Feedback Received',
    message: `Rating ${rating}/5 received for "${grievance.title.substring(0, 60)}"`,
    grievanceId: grievance._id,
    link: `/admin/grievances/${grievance._id}`,
  });
};

module.exports = {
  notifyStatusChange,
  notifyAssignment,
  notifyComment,
  notifySLABreach,
  notifyFeedback,
};
