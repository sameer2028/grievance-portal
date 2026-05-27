import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';

const SENTIMENT_COLORS = {
  positive: '#22c55e',
  neutral:  '#94a3b8',
  negative: '#ef4444',
};

const SENTIMENT_ICONS = {
  positive: '🙂',
  neutral:  '😐',
  negative: '😠',
};

/**
 * Props:
 *   data - [{ _id: "negative", count: 80 }, ...]
 */
const SentimentChart = ({ data = [] }) => {
  const total = data.reduce((s, d) => s + d.count, 0);

  const formatted = data.map((d) => ({
    name: d._id,
    count: d.count,
    pct: total ? Math.round((d.count / total) * 100) : 0,
  }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart
          data={formatted}
          layout="vertical"
          margin={{ top: 4, right: 32, left: 16, bottom: 4 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            tick={({ x, y, payload }) => (
              <text x={x} y={y} dy={4} textAnchor="end" fontSize={12} fill="#6b7280">
                {SENTIMENT_ICONS[payload.value]} {payload.value}
              </text>
            )}
            width={80}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(v, _, props) => [`${v} (${props.payload.pct}%)`, 'Count']}
            cursor={{ fill: 'transparent' }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={28}>
            {formatted.map((entry) => (
              <Cell
                key={entry.name}
                fill={SENTIMENT_COLORS[entry.name] || '#94a3b8'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Percentage legend */}
      <div className="flex gap-4 mt-2 justify-center">
        {formatted.map((d) => (
          <div key={d.name} className="text-center">
            <span className="text-lg">{SENTIMENT_ICONS[d.name]}</span>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{d.pct}%</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">{d.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SentimentChart;
