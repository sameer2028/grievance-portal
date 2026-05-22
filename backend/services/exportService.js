const Grievance = require('../models/Grievance');
const { ROLES } = require('../config/constants');
const { log, ACTIONS } = require('./auditService');
const { snakeToTitle } = require('../utils/stringUtils');

/**
 * Converts an array of objects to a CSV string.
 * Handles values that contain commas or quotes.
 */
const toCSV = (rows) => {
  if (!rows.length) return '';

  const headers = Object.keys(rows[0]);
  const escape = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val).replace(/"/g, '""');
    return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
  };

  const csvRows = [
    headers.join(','),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(',')),
  ];

  return csvRows.join('\n');
};

/**
 * Build and return a CSV string of grievances matching given filters.
 * Called by the export route — streams back to client.
 *
 * @param {object} filters   - same filters as grievance list
 * @param {object} requestingUser
 */
const exportGrievancesCSV = async (filters = {}, requestingUser) => {
  const query = {};

  if (requestingUser.role === ROLES.OFFICER && requestingUser.department) {
    query.department = requestingUser.department;
  }

  if (filters.status) query.status = filters.status;
  if (filters.department && requestingUser.role !== ROLES.OFFICER) query.department = filters.department;
  if (filters.priority) query.priority = filters.priority;
  if (filters.district) query['location.district'] = filters.district;
  if (filters.fromDate || filters.toDate) {
    query.createdAt = {};
    if (filters.fromDate) query.createdAt.$gte = new Date(filters.fromDate);
    if (filters.toDate)   query.createdAt.$lte = new Date(filters.toDate);
  }

  const grievances = await Grievance.find(query)
    .populate('submittedBy', 'name email phone')
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 })
    .limit(5000) // Safety cap — prevent memory issues
    .lean();

  const rows = grievances.map((g) => ({
    'Ticket Number':       g.ticketNumber,
    'Title':               g.title,
    'Status':              g.status,
    'Priority':            g.priority,
    'Department':          g.department,
    'District':            g.location?.district || '',
    'State':               g.location?.state || '',
    'Pincode':             g.location?.pincode || '',
    'Submitted By':        g.submittedBy?.name || '',
    'Citizen Email':       g.submittedBy?.email || '',
    'Citizen Phone':       g.submittedBy?.phone || '',
    'Assigned To':         g.assignedTo?.name || 'Unassigned',
    'AI Category':         g.aiAnalysis?.category || '',
    'AI Confidence':       g.aiAnalysis?.categoryConfidence ? `${Math.round(g.aiAnalysis.categoryConfidence * 100)}%` : '',
    'Sentiment':           g.aiAnalysis?.sentiment || '',
    'Urgency Score':       g.aiAnalysis?.urgencyScore ?? '',
    'Is Duplicate':        g.aiAnalysis?.isDuplicate ? 'Yes' : 'No',
    'AI Analysis Status':  g.aiAnalysis?.analysisStatus || '',
    'Official Response':   g.officialResponse || '',
    'Days Open':           g.resolvedAt
                             ? Math.floor((new Date(g.resolvedAt) - new Date(g.createdAt)) / 86400000)
                             : Math.floor((Date.now() - new Date(g.createdAt)) / 86400000),
    'Submitted At':        new Date(g.createdAt).toISOString(),
    'Resolved At':         g.resolvedAt ? new Date(g.resolvedAt).toISOString() : '',
    'Escalated At':        g.escalatedAt ? new Date(g.escalatedAt).toISOString() : '',
  }));

  // Audit the export
  await log({
    action: ACTIONS.EXPORT_GENERATED,
    performedBy: requestingUser.id,
    targetType: 'Grievance',
    targetId: requestingUser.id,
    metadata: { filters, rowCount: rows.length },
  });

  return { csv: toCSV(rows), count: rows.length };
};

module.exports = { exportGrievancesCSV };
