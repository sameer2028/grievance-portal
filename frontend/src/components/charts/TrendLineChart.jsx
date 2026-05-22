import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="text-gray-500 text-xs">{label}</p>
      <p className="text-primary-600 font-bold">{payload[0].value} submitted</p>
    </div>
  );
};

/**
 * Props:
 *   data - [{ _id: "2024-01-15", count: 8 }, ...]  (last 7 days)
 */
const TrendLineChart = ({ data = [] }) => {
  const formatted = data.map((d) => ({
    date: format(parseISO(d._id), 'MMM d'),
    count: d.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={formatted} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey="date"
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
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="url(#trendGradient)"
          dot={{ fill: '#3b82f6', strokeWidth: 0, r: 3 }}
          activeDot={{ r: 5, fill: '#2563eb' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default TrendLineChart;
