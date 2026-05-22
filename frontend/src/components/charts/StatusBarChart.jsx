import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { STATUS_LABELS } from '@/utils/constants';

const STATUS_COLORS = {
  pending:     '#f59e0b',
  assigned:    '#3b82f6',
  in_progress: '#6366f1',
  resolved:    '#22c55e',
  rejected:    '#ef4444',
  escalated:   '#f97316',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-medium text-gray-900">{STATUS_LABELS[label] || label}</p>
      <p className="text-primary-600 font-bold">{payload[0].value} grievances</p>
    </div>
  );
};

/**
 * Props:
 *   data - [{ _id: "pending", count: 12 }, ...]  (from /api/analytics/summary)
 */
const StatusBarChart = ({ data = [] }) => {
  const formatted = data.map((d) => ({
    status: d._id,
    count: d.count,
    label: STATUS_LABELS[d._id] || d._id,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={formatted} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
          {formatted.map((entry) => (
            <Cell
              key={entry.status}
              fill={STATUS_COLORS[entry.status] || '#94a3b8'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default StatusBarChart;
