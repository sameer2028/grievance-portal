const Grievance = require('../models/Grievance');
const SLAConfig = require('../models/SLAConfig');
const User = require('../models/User');
const { GRIEVANCE_STATUS, ROLES } = require('../config/constants');
const notificationService = require('./notificationService');
const { log, ACTIONS } = require('./auditService');
const logger = require('../utils/logger');

/**
 * Checks all non-resolved grievances against their SLA config.
 * Any grievance past its resolutionHours gets escalated automatically.
 *
 * Called by:
 *   - setInterval in server.js every hour
 *   - POST /api/admin/escalation/run (manual trigger)
 */
const runEscalationCheck = async () => {
  logger.info('Running SLA escalation check...');

  // Load all SLA configs into a fast lookup map: "department:priority" → config
  const slaConfigs = await SLAConfig.find({ isActive: true });
  const slaMap = {};
  slaConfigs.forEach((c) => {
    slaMap[`${c.department}:${c.priority}`] = c;
  });

  // Find all active (non-terminal) grievances
  const activeGrievances = await Grievance.find({
    status: { $nin: [GRIEVANCE_STATUS.RESOLVED, GRIEVANCE_STATUS.REJECTED, GRIEVANCE_STATUS.ESCALATED] },
  }).populate('submittedBy', '_id').populate('assignedTo', '_id');

  const now = Date.now();
  let escalatedCount = 0;
  let warningCount = 0;

  for (const grievance of activeGrievances) {
    const key = `${grievance.department}:${grievance.priority}`;
    const sla = slaMap[key];
    if (!sla) continue;

    const ageHours = (now - grievance.createdAt.getTime()) / (1000 * 60 * 60);

    // Past resolution deadline → escalate
    if (ageHours >= sla.resolutionHours) {
      grievance.status = GRIEVANCE_STATUS.ESCALATED;
      grievance.escalatedAt = new Date();
      grievance.statusHistory.push({
        status: GRIEVANCE_STATUS.ESCALATED,
        note: `Auto-escalated: SLA of ${sla.resolutionHours}h breached (open for ${Math.round(ageHours)}h)`,
        changedAt: new Date(),
      });
      await grievance.save();

      // Find all admins to notify
      const admins = await User.find({
        role: { $in: [ROLES.ADMIN, ROLES.SUPER_ADMIN] },
        isActive: true,
      }).select('_id');

      const recipientIds = admins.map((a) => a._id);
      if (grievance.assignedTo) recipientIds.push(grievance.assignedTo._id);

      await notificationService.notifySLABreach({ grievance, recipientIds });

      await log({
        action: ACTIONS.GRIEVANCE_ESCALATED,
        performedBy: admins[0]?._id || grievance.submittedBy._id,
        targetType: 'Grievance',
        targetId: grievance._id,
        changes: { from: { status: 'active' }, to: { status: GRIEVANCE_STATUS.ESCALATED } },
        metadata: { reason: 'SLA breach', ageHours: Math.round(ageHours), slaHours: sla.resolutionHours },
      });

      escalatedCount++;
      logger.warn(`Escalated grievance ${grievance.ticketNumber} (${Math.round(ageHours)}h old, SLA: ${sla.resolutionHours}h)`);
    }
    // Approaching deadline → warning notification (within warning window but not yet escalated)
    else if (ageHours >= sla.warningHours && !grievance.warningNotificationSent) {
      const admins = await User.find({ role: { $in: [ROLES.ADMIN, ROLES.SUPER_ADMIN] }, isActive: true }).select('_id');
      const recipientIds = admins.map((a) => a._id);
      if (grievance.assignedTo) recipientIds.push(grievance.assignedTo._id);

      // Reuse SLA breach notification as warning
      await notificationService.notifySLABreach({ grievance, recipientIds });
      warningCount++;
    }
  }

  logger.info(`Escalation check complete: ${escalatedCount} escalated, ${warningCount} warnings sent`);
  return { escalatedCount, warningCount, checkedCount: activeGrievances.length };
};

module.exports = { runEscalationCheck };
