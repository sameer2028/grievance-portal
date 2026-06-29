import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyGrievances, selectGrievanceList, selectGrievancePagination, selectGrievanceLoading } from '@/store/slices/grievanceSlice';
import { useAuth } from '@/hooks/useAuth';
import StatCard from '@/components/ui/StatCard';
import GrievanceCard from '@/components/grievance/GrievanceCard';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { GRIEVANCE_STATUS } from '@/utils/constants';

const CitizenDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const grievances = useSelector(selectGrievanceList);
  const pagination = useSelector(selectGrievancePagination);
  const isLoading = useSelector(selectGrievanceLoading);

  useEffect(() => {
    dispatch(fetchMyGrievances({ limit: 100 }));
  }, [dispatch]);

  // Auto-poll while AI analysis is processing for any grievance
  useEffect(() => {
    const hasPendingAi = grievances.some(
      (g) => !g.aiAnalysis || g.aiAnalysis.analysisStatus === 'pending' || g.aiAnalysis.analysisStatus === 'processing'
    );
    if (!hasPendingAi) return;

    const timer = setInterval(() => {
      dispatch(fetchMyGrievances({ limit: 100 }));
    }, 2500);

    return () => clearInterval(timer);
  }, [dispatch, grievances]);

  // Compute stats from the loaded list and backend pagination total
  const stats = {
    total:      pagination?.total ?? grievances.length,
    pending:    grievances.filter((g) => g.status === GRIEVANCE_STATUS.PENDING || g.status === GRIEVANCE_STATUS.ASSIGNED || g.status === GRIEVANCE_STATUS.IN_PROGRESS).length,
    resolved:   grievances.filter((g) => g.status === GRIEVANCE_STATUS.RESOLVED).length,
    escalated:  grievances.filter((g) => g.status === GRIEVANCE_STATUS.ESCALATED).length,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Here's an overview of your submitted grievances.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-stagger">
        <StatCard label="Total Submitted"   value={stats.total}     icon="📋" color="bg-blue-100 dark:bg-blue-900/40"   iconColor="text-blue-600 dark:text-blue-300"   loading={isLoading} />
        <StatCard label="Pending Review"    value={stats.pending}   icon="🕐" color="bg-yellow-100 dark:bg-yellow-900/40" iconColor="text-yellow-600 dark:text-yellow-300" loading={isLoading} />
        <StatCard label="Resolved"          value={stats.resolved}  icon="✅" color="bg-green-100 dark:bg-green-900/40"  iconColor="text-green-600 dark:text-green-300"  loading={isLoading} />
        <StatCard label="Escalated"         value={stats.escalated} icon="🔺" color="bg-orange-100 dark:bg-orange-900/40" iconColor="text-orange-600 dark:text-orange-300" loading={isLoading} />
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          to="/grievances/submit"
          className="card flex items-center gap-4 hover:shadow-card-hover transition-shadow group"
        >
          <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-2xl group-hover:bg-primary-200 dark:group-hover:bg-primary-900/50 transition-colors">
            ＋
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">Submit New Grievance</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Report a public issue in your area</p>
          </div>
          <span className="ml-auto text-gray-300 dark:text-gray-600 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">→</span>
        </Link>

        <Link
          to="/track"
          className="card flex items-center gap-4 hover:shadow-card-hover transition-shadow group"
        >
          <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-2xl group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
            🔍
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">Track by Ticket</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Look up any grievance status</p>
          </div>
          <span className="ml-auto text-gray-300 dark:text-gray-600 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">→</span>
        </Link>
      </div>

      {/* Recent grievances */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Grievances</h2>
          <Link
            to="/grievances/my"
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium"
          >
            View all →
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : grievances.length === 0 ? (
          <EmptyState
            icon="📭"
            title="No grievances yet"
            desc="Submit your first grievance to see it here."
            action={{ label: 'Submit a Grievance', to: '/grievances/submit' }}
          />
        ) : (
          <div className="space-y-3 animate-stagger">
            {grievances.slice(0, 5).map((g) => (
              <GrievanceCard key={g._id} grievance={g} linkBase="/grievances" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenDashboard;
