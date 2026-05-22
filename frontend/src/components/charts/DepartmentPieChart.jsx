import {
  PieChart, Pie, Cell, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import { DEPARTMENT_LABELS } from '@/utils/constants';
import { snakeToTitle } from '@/utils/helpers';

const COLORS = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#10b981', '#6366f1',
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-medium text-gray-900">
        {DEPARTMENT_LABELS[payload[0].name] || snakeToTitle(payload[0].name)}
      </p>
      <p className="text-primary-600 font-bold">{payload[0].value} grievances</p>
      <p className="text-gray-400">{payload[0].payload.percent}%</p>
    </div>
  );
};

const CustomLegend = ({ payload }) => (
  <ul className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-2">
    {payload.map((entry) => (
      <li key={entry.value} className="flex items-center gap-1.5 text-xs text-gray-600">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: entry.color }}
        />
        {DEPARTMENT_LABELS[entry.value] || snakeToTitle(entry.value)}
      </li>
    ))}
  </ul>
);

/**
 * Props:
 *   data - [{ _id: "water_supply", count: 45 }, ...]
 */
const DepartmentPieChart = ({ data = [] }) => {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  const formatted = data.map((d) => ({
    name: d._id,
    value: d.count,
    percent: total ? Math.round((d.count / total) * 100) : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={formatted}
          cx="50%"
          cy="45%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
          dataKey="value"
        >
          {formatted.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default DepartmentPieChart;
