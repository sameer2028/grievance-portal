import { useEffect, useState } from 'react';
import { analyticsApi } from '@/api/analyticsApi';
import { grievanceApi } from '@/api/grievanceApi';
import StatCard from '@/components/ui/StatCard';
import StatusBarChart from '@/components/charts/StatusBarChart';
import DepartmentPieChart from '@/components/charts/DepartmentPieChart';
import TrendLineChart from '@/components/charts/TrendLineChart';
import GrievanceMap from '@/components/maps/GrievanceMap';
import Spinner from '@/components/ui/Spinner';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { ROLES } from '@/utils/constants';

const AdminDashboard = () => {
  const toast = useToast();
  const { user } = useAuth();
  const isAdminOrSuper = user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN;

  const [summary, setSummary] = useState(null);
  const [grievances, setGrievances] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingMap, setLoadingMap] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const data = await analyticsApi.getSummary();
        setSummary(data.data);
      } catch {
        toast.error('Failed to load analytics');
      } finally {
        setLoadingSummary(false);
      }
    };

    const loadGrievancesForMap = async () => {
      try {
        const data = await grievanceApi.getAll({ limit: 200 });
        setGrievances(data.data || []);
      } catch {
        // silently fail map
      } finally {
        setLoadingMap(false);
      }
    };

    loadSummary();
    loadGrievancesForMap();
  }, []);

  // Compute quick stat values from summary
  const getCount = (arr, id) => arr?.find((d) => d._id === id)?.count ?? 0;

  const totalPending   = getCount(summary?.byStatus, 'pending');
  const totalResolved  = getCount(summary?.byStatus, 'resolved');
  const totalCritical  = getCount(summary?.byPriority, 'critical');
  const totalEscalated = getCount(summary?.byStatus, 'escalated');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Real-time overview of all grievances</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Grievances"
          value={summary?.total}
          icon="📋"
          color="bg-blue-100 dark:bg-blue-900/40"
          iconColor="text-blue-600 dark:text-blue-300"
          loading={loadingSummary}
        />
        <StatCard
          label="Pending Review"
          value={totalPending}
          icon="🕐"
          color="bg-yellow-100 dark:bg-yellow-900/40"
          iconColor="text-yellow-600 dark:text-yellow-300"
          loading={loadingSummary}
        />
        <StatCard
          label="Resolved"
          value={totalResolved}
          icon="✅"
          color="bg-green-100 dark:bg-green-900/40"
          iconColor="text-green-600 dark:text-green-300"
          loading={loadingSummary}
          trend={summary?.total ? { value: `${Math.round((totalResolved / summary.total) * 100)}% rate`, up: true } : undefined}
        />
        <StatCard
          label="Critical Priority"
          value={totalCritical}
          icon="🔴"
          color="bg-red-100 dark:bg-red-900/40"
          iconColor="text-red-600 dark:text-red-300"
          loading={loadingSummary}
        />
      </div>

      {/* Charts row */}
      {isAdminOrSuper && (
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Status breakdown */}
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Grievances by Status</h2>
            {loadingSummary ? (
              <div className="flex justify-center py-16"><Spinner /></div>
            ) : (
              <StatusBarChart data={summary?.byStatus || []} />
            )}
          </div>

          {/* Department pie */}
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">By Department</h2>
            {loadingSummary ? (
              <div className="flex justify-center py-16"><Spinner /></div>
            ) : (
              <DepartmentPieChart data={summary?.byDepartment || []} />
            )}
          </div>
        </div>
      )}

      {/* 7-day trend */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Submissions — Last 7 Days</h2>
        {loadingSummary ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : (
          <TrendLineChart data={summary?.recentTrend || []} />
        )}
      </div>

      {/* Map */}
      <div className="card !p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Geographic Distribution</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Grievances plotted by reported location. Hover for details.
          </p>
        </div>
        {loadingMap ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : (
          <GrievanceMap grievances={grievances} height="380px" />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
