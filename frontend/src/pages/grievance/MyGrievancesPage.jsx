import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchMyGrievances,
  selectGrievanceList,
  selectGrievancePagination,
  selectGrievanceLoading,
} from '@/store/slices/grievanceSlice';
import GrievanceCard from '@/components/grievance/GrievanceCard';
import Pagination from '@/components/ui/Pagination';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { GRIEVANCE_STATUS, STATUS_LABELS } from '@/utils/constants';

const MyGrievancesPage = () => {
  const dispatch = useDispatch();
  const grievances = useSelector(selectGrievanceList);
  const pagination = useSelector(selectGrievancePagination);
  const isLoading = useSelector(selectGrievanceLoading);

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    dispatch(fetchMyGrievances({ page, limit: 8, status: statusFilter || undefined }));
  }, [dispatch, page, statusFilter]);

  // Auto-poll while AI analysis is processing for any grievance
  useEffect(() => {
    const hasPendingAi = grievances.some(
      (g) => !g.aiAnalysis || g.aiAnalysis.analysisStatus === 'pending' || g.aiAnalysis.analysisStatus === 'processing'
    );
    if (!hasPendingAi) return;

    const timer = setInterval(() => {
      dispatch(fetchMyGrievances({ page, limit: 8, status: statusFilter || undefined }));
    }, 2500);

    return () => clearInterval(timer);
  }, [dispatch, grievances, page, statusFilter]);

  const handleStatusChange = (val) => {
    setStatusFilter(val);
    setPage(1);
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Grievances</h1>
          {pagination && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {pagination.total} total
            </p>
          )}
        </div>
        <Link to="/grievances/submit" className="btn-primary">
          + New Grievance
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[{ val: '', label: 'All' }, ...Object.entries(STATUS_LABELS).map(([val, label]) => ({ val, label }))].map(
          ({ val, label }) => (
            <button
              key={val}
              onClick={() => handleStatusChange(val)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                statusFilter === val
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {label}
            </button>
          )
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : grievances.length === 0 ? (
        <EmptyState
          icon="📭"
          title={statusFilter ? `No ${STATUS_LABELS[statusFilter]?.toLowerCase()} grievances` : 'No grievances yet'}
          desc="Submit your first grievance and track its resolution here."
          action={!statusFilter ? { label: 'Submit a Grievance', to: '/grievances/submit' } : undefined}
        />
      ) : (
        <>
          <div className="space-y-3">
            {grievances.map((g) => (
              <GrievanceCard key={g._id} grievance={g} linkBase="/grievances" />
            ))}
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default MyGrievancesPage;
