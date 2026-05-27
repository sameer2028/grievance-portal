import { useEffect, useState } from 'react';
import { analyticsApi } from '@/api/analyticsApi';
import { grievanceApi } from '@/api/grievanceApi';
import StatusBarChart from '@/components/charts/StatusBarChart';
import DepartmentPieChart from '@/components/charts/DepartmentPieChart';
import TrendLineChart from '@/components/charts/TrendLineChart';
import SentimentChart from '@/components/charts/SentimentChart';
import GrievanceMap from '@/components/maps/GrievanceMap';
import StatCard from '@/components/ui/StatCard';
import Spinner from '@/components/ui/Spinner';
import { DEPARTMENT_LABELS } from '@/utils/constants';
import { snakeToTitle } from '@/utils/helpers';

const AnalyticsPage = () => {
  const [summary, setSummary] = useState(null);
  const [sentiment, setSentiment] = useState([]);
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [summaryRes, sentimentRes, grievancesRes] = await Promise.allSettled([
          analyticsApi.getSummary(),
          analyticsApi.getSentiment(),
          grievanceApi.getAll({ limit: 500 }),
        ]);

        if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value.data);
        if (sentimentRes.status === 'fulfilled') setSentiment(sentimentRes.value.data.sentiment || []);
        if (grievancesRes.status === 'fulfilled') setGrievances(grievancesRes.value.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Top 3 departments by count
  const topDepts = [...(summary?.byDepartment || [])]
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Resolution rate
  const resolvedCount = summary?.byStatus?.find((s) => s._id === 'resolved')?.count ?? 0;
  const resolutionRate = summary?.total
    ? `${Math.round((resolvedCount / summary.total) * 100)}%`
    : '—';

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          AI-enriched insights across all submitted grievances
        </p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Grievances" value={summary?.total}        icon="📊" color="bg-blue-100 dark:bg-blue-900/40"   iconColor="text-blue-600 dark:text-blue-300" />
        <StatCard label="Resolution Rate"  value={resolutionRate}         icon="✅" color="bg-green-100 dark:bg-green-900/40"  iconColor="text-green-600 dark:text-green-300" />
        <StatCard label="Resolved"         value={resolvedCount}          icon="🏁" color="bg-teal-100 dark:bg-teal-900/40"   iconColor="text-teal-600 dark:text-teal-300" />
        <StatCard label="AI Analyzed"      value={summary?.total ?? 0}   icon="🤖" color="bg-violet-100 dark:bg-violet-900/40" iconColor="text-violet-600 dark:text-violet-300" />
      </div>

      {/* 7-day trend */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Submissions Trend — Last 7 Days</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Daily grievance submission volume</p>
        <TrendLineChart data={summary?.recentTrend || []} />
      </div>

      {/* Status + Sentiment row */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Grievances by Status</h2>
          <StatusBarChart data={summary?.byStatus || []} />
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Citizen Sentiment</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Based on AI sentiment analysis of grievance text
          </p>
          {sentiment.length > 0 ? (
            <SentimentChart data={sentiment} />
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">
              No sentiment data yet (requires AI analysis)
            </p>
          )}
        </div>
      </div>

      {/* Department + Priority row */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">By Department</h2>
          <DepartmentPieChart data={summary?.byDepartment || []} />
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Priority Breakdown</h2>
          {summary?.byPriority?.length ? (
            <div className="space-y-3">
              {['critical', 'high', 'medium', 'low'].map((p) => {
                const item = summary.byPriority.find((d) => d._id === p);
                const count = item?.count ?? 0;
                const pct = summary.total ? Math.round((count / summary.total) * 100) : 0;
                const colors = {
                  critical: 'bg-red-500',
                  high: 'bg-orange-500',
                  medium: 'bg-yellow-500',
                  low: 'bg-gray-400',
                };
                return (
                  <div key={p}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium capitalize text-gray-700 dark:text-gray-300">{p}</span>
                      <span className="text-gray-500 dark:text-gray-400">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colors[p]} transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No data</p>
          )}
        </div>
      </div>

      {/* Top departments table */}
      {topDepts.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Most Active Departments
          </h2>
          <div className="space-y-3">
            {(summary?.byDepartment || [])
              .sort((a, b) => b.count - a.count)
              .map((dept, idx) => {
                const pct = summary.total
                  ? Math.round((dept.count / summary.total) * 100)
                  : 0;
                return (
                  <div key={dept._id} className="flex items-center gap-4">
                    <span className="text-sm font-bold text-gray-400 w-5 shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                          {DEPARTMENT_LABELS[dept._id] || snakeToTitle(dept._id)}
                        </span>
                        <span className="text-xs text-gray-500 ml-2 shrink-0">
                          {dept.count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Map */}
      <div className="card !p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Geographic Heatmap</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Circle size = priority level. Click a marker for details.
          </p>
        </div>
        <GrievanceMap grievances={grievances} height="400px" />
      </div>
    </div>
  );
};

export default AnalyticsPage;
