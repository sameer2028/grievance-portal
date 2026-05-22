export const ROLES = {
  CITIZEN: 'citizen',
  OFFICER: 'officer',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
};

export const GRIEVANCE_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
  ESCALATED: 'escalated',
};

export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

export const DEPARTMENTS = {
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

export const DEPARTMENT_LABELS = {
  water_supply: 'Water Supply',
  electricity: 'Electricity',
  roads_infrastructure: 'Roads & Infrastructure',
  sanitation: 'Sanitation',
  health: 'Health',
  education: 'Education',
  transport: 'Transport',
  revenue: 'Revenue',
  police: 'Police',
  other: 'Other',
};

export const STATUS_LABELS = {
  pending: 'Pending',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
  escalated: 'Escalated',
};

export const STATUS_BADGE_CLASS = {
  pending: 'badge-pending',
  assigned: 'badge-assigned',
  in_progress: 'badge-progress',
  resolved: 'badge-resolved',
  rejected: 'badge-rejected',
  escalated: 'badge-escalated',
};

export const PRIORITY_BADGE_CLASS = {
  low: 'badge-low',
  medium: 'badge-medium',
  high: 'badge-high',
  critical: 'badge-critical',
};
