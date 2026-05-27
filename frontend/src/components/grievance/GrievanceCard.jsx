import { Link } from 'react-router-dom';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { timeAgo, truncate, snakeToTitle } from '@/utils/helpers';

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

  return (
    <Link
      to={`${linkBase}/${_id}`}
      className="card block hover:shadow-card-hover transition-shadow animate-fade-in"
    >
      {/* Top row: ticket + badges */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-xs font-mono text-gray-400 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
          {ticketNumber}
        </span>
        <StatusBadge status={status} />
        <PriorityBadge priority={priority} />

        {/* AI analysis indicator */}
        {aiAnalysis?.analysisStatus === 'completed' && (
          <span className="badge bg-violet-50 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">AI ✓</span>
        )}
        {aiAnalysis?.analysisStatus === 'processing' && (
          <span className="badge bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300">AI analyzing…</span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">{title}</h3>

      {/* Description preview */}
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
        {truncate(description, 120)}
      </p>

      {/* Footer: department + location + time */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 dark:text-gray-500">
        <span>🏢 {snakeToTitle(department)}</span>
        {location?.district && <span>📍 {location.district}</span>}
        <span className="ml-auto">{timeAgo(createdAt)}</span>
      </div>

      {/* AI sentiment hint */}
      {aiAnalysis?.sentiment && (
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
          <span>
            {aiAnalysis.sentiment === 'negative' ? '😠' :
             aiAnalysis.sentiment === 'positive' ? '🙂' : '😐'}
          </span>
          <span className="capitalize">{aiAnalysis.sentiment} sentiment</span>
          {aiAnalysis.categoryConfidence && (
            <span className="ml-auto">
              {Math.round(aiAnalysis.categoryConfidence * 100)}% confidence
            </span>
          )}
        </div>
      )}
    </Link>
  );
};

export default GrievanceCard;
