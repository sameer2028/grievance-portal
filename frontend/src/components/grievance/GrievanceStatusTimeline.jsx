import { formatDate, snakeToTitle } from '@/utils/helpers';
import { STATUS_LABELS } from '@/utils/constants';

const STATUS_ICONS = {
  pending:     '🕐',
  assigned:    '👤',
  in_progress: '⚙️',
  resolved:    '✅',
  rejected:    '❌',
  escalated:   '🔺',
};

const STATUS_COLORS = {
  pending:     'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/30',
  assigned:    'border-blue-400 bg-blue-50 dark:bg-blue-900/30',
  in_progress: 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30',
  resolved:    'border-green-500 bg-green-50 dark:bg-green-900/30',
  rejected:    'border-red-400 bg-red-50 dark:bg-red-900/30',
  escalated:   'border-orange-400 bg-orange-50 dark:bg-orange-900/30',
};

/**
 * Props:
 *   history - array of { status, changedBy, note, changedAt }
 */
const GrievanceStatusTimeline = ({ history = [] }) => {
  if (!history.length) return null;

  return (
    <div className="space-y-0">
      {history.map((entry, idx) => {
        const isLast = idx === history.length - 1;
        return (
          <div key={idx} className="relative flex gap-4">
            {/* Vertical connector line */}
            {!isLast && (
              <div className="absolute left-4 top-8 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
            )}

            {/* Icon dot */}
            <div
              className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm shrink-0 ${
                STATUS_COLORS[entry.status] || 'border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800'
              }`}
            >
              {STATUS_ICONS[entry.status] || '•'}
            </div>

            {/* Content */}
            <div className="flex-1 pb-6">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {STATUS_LABELS[entry.status] || snakeToTitle(entry.status)}
                </span>
                {entry.changedBy?.name && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">by {entry.changedBy.name}</span>
                )}
              </div>
              {entry.note && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{entry.note}</p>
              )}
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatDate(entry.changedAt)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GrievanceStatusTimeline;
