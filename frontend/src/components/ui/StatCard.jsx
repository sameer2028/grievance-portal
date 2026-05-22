import Spinner from './Spinner';

/**
 * Used on dashboards to show a single KPI.
 * Props:
 *   label     - "Total Grievances"
 *   value     - 1234  (number or string)
 *   icon      - emoji or SVG string
 *   color     - tailwind bg class for icon bg, e.g. "bg-blue-100"
 *   iconColor - tailwind text class, e.g. "text-blue-600"
 *   trend     - { value: "+12%", up: true } (optional)
 *   loading   - bool
 */
const StatCard = ({ label, value, icon, color = 'bg-gray-100', iconColor = 'text-gray-600', trend, loading = false }) => (
  <div className="card flex items-start gap-4">
    <div className={`w-11 h-11 rounded-lg ${color} ${iconColor} flex items-center justify-center text-xl shrink-0`}>
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">{label}</p>
      {loading ? (
        <Spinner size="sm" className="mt-2" />
      ) : (
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value ?? '—'}</p>
      )}
      {trend && !loading && (
        <p className={`text-xs mt-1 font-medium ${trend.up ? 'text-green-600' : 'text-red-500'}`}>
          {trend.up ? '↑' : '↓'} {trend.value}
        </p>
      )}
    </div>
  </div>
);

export default StatCard;
