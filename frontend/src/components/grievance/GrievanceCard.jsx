import { Link } from 'react-router-dom';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { timeAgo, truncate, snakeToTitle } from '@/utils/helpers';

/**
 * Priority-to-border-color mapping for left accent
 */
const PRIORITY_BORDER = {
  critical: 'border-l-red-500',
  high:     'border-l-orange-500',
  medium:   'border-l-yellow-500',
  low:      'border-l-gray-300 dark:border-l-gray-600',
};

/**
 * Props:
 *   grievance  - grievance object from API
 *   linkBase   - "/grievances" | "/admin/grievances"
 */
const GrievanceCard = ({ grievance, linkBase = '/grievances' }) => {
  const {
    _id, ticketNumber, title, description,
    status, priority, department,
    aiAnalysis, createdAt, location,
  } = grievance;

  const borderColor = PRIORITY_BORDER[priority] || PRIORITY_BORDER.low;

  return (
    <Link
      to={`${linkBase}/${_id}`}
      className={`card block border-l-4 ${borderColor} hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 animate-fade-in`}
    >
      {/* Top row: ticket + badges */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-xs font-mono text-gray-400 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md">
          {ticketNumber}
        </span>
        <StatusBadge status={status} />
        <PriorityBadge priority={priority} />

        {/* AI analysis indicator */}
        {aiAnalysis?.analysisStatus === 'completed' && (
          <span className="badge bg-violet-50 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mr-1.5 inline-block" />
            AI ✓
          </span>
        )}
        {aiAnalysis?.analysisStatus === 'processing' && (
          <span className="badge bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5 inline-block animate-glow-pulse" />
            AI analyzing…
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">{title}</h3>

      {/* Description preview */}
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
        {truncate(description, 120)}
      </p>

      {/* Footer: department + location + time */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 dark:text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3.5 h-3.5 rounded bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-[8px]">🏢</span>
          {snakeToTitle(department)}
        </span>
        {location?.district && (
          <span className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[8px]">📍</span>
            {location.district}
          </span>
        )}
        <span className="ml-auto font-medium">{timeAgo(createdAt)}</span>
      </div>

      {/* AI sentiment hint */}
      {aiAnalysis?.sentiment && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
          <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[10px]">
            {aiAnalysis.sentiment === 'negative' ? '😠' :
             aiAnalysis.sentiment === 'positive' ? '🙂' : '😐'}
          </span>
          <span className="capitalize">{aiAnalysis.sentiment} sentiment</span>
          {aiAnalysis.categoryConfidence && (
            <span className="ml-auto font-mono text-[11px]">
              {Math.round(aiAnalysis.categoryConfidence * 100)}% conf
            </span>
          )}
        </div>
      )}
    </Link>
  );
};

export default GrievanceCard;
