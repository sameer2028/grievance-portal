import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyGrievances, selectGrievanceList, selectGrievanceLoading } from '@/store/slices/grievanceSlice';
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
  const isLoading = useSelector(selectGrievanceLoading);

  useEffect(() => {
    dispatch(fetchMyGrievances({ limit: 5 }));
  }, [dispatch]);

  // Compute stats from the loaded list
  const stats = {
    total:      grievances.length,
    pending:    grievances.filter((g) => g.status === GRIEVANCE_STATUS.PENDING).length,
    resolved:   grievances.filter((g) => g.status === GRIEVANCE_STATUS.RESOLVED).length,
    escalated:  grievances.filter((g) => g.status === GRIEVANCE_STATUS.ESCALATED).length,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Here's an overview of your submitted grievances.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Submitted"   value={stats.total}     icon="📋" color="bg-blue-100"   iconColor="text-blue-600"   loading={isLoading} />
        <StatCard label="Pending Review"    value={stats.pending}   icon="🕐" color="bg-yellow-100" iconColor="text-yellow-600" loading={isLoading} />
        <StatCard label="Resolved"          value={stats.resolved}  icon="✅" color="bg-green-100"  iconColor="text-green-600"  loading={isLoading} />
        <StatCard label="Escalated"         value={stats.escalated} icon="🔺" color="bg-orange-100" iconColor="text-orange-600" loading={isLoading} />
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          to="/grievances/submit"
          className="card flex items-center gap-4 hover:shadow-card-hover transition-shadow group"
        >
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-2xl group-hover:bg-primary-200 transition-colors">
            ＋
          </div>
          <div>
            <p className="font-semibold text-gray-900">Submit New Grievance</p>
            <p className="text-sm text-gray-500">Report a public issue in your area</p>
          </div>
          <span className="ml-auto text-gray-300 group-hover:text-primary-600 transition-colors">→</span>
        </Link>

        <Link
          to="/track"
          className="card flex items-center gap-4 hover:shadow-card-hover transition-shadow group"
        >
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl group-hover:bg-green-200 transition-colors">
            🔍
          </div>
          <div>
            <p className="font-semibold text-gray-900">Track by Ticket</p>
            <p className="text-sm text-gray-500">Look up any grievance status</p>
          </div>
          <span className="ml-auto text-gray-300 group-hover:text-green-600 transition-colors">→</span>
        </Link>
      </div>

      {/* Recent grievances */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Grievances</h2>
          <Link
            to="/grievances/my"
            className="text-sm text-primary-600 hover:text-primary-800 font-medium"
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
          <div className="space-y-3">
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
