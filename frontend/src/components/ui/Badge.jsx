import { STATUS_BADGE_CLASS, PRIORITY_BADGE_CLASS, STATUS_LABELS } from '@/utils/constants';
import { snakeToTitle } from '@/utils/helpers';

export const StatusBadge = ({ status }) => (
  <span className={STATUS_BADGE_CLASS[status] || 'badge bg-gray-100 text-gray-700'}>
    {STATUS_LABELS[status] || snakeToTitle(status)}
  </span>
);

export const PriorityBadge = ({ priority }) => (
  <span className={PRIORITY_BADGE_CLASS[priority] || 'badge bg-gray-100 text-gray-700'}>
    {snakeToTitle(priority)}
  </span>
);
