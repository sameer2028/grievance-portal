import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchGrievances,
  selectGrievanceList,
  selectGrievancePagination,
  selectGrievanceLoading,
} from '@/store/slices/grievanceSlice';
import { grievanceApi } from '@/api/grievanceApi';
import GrievanceFilters from '@/components/grievance/GrievanceFilters';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { timeAgo, snakeToTitle, truncate } from '@/utils/helpers';

const INITIAL_FILTERS = { status: '', department: '', priority: '', search: '' };

// Assign officer modal
const AssignModal = ({ grievanceId, onClose, onSuccess }) => {
  const [officerId, setOfficerId] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleAssign = async () => {
    if (!officerId.trim()) { toast.error('Enter an officer ID'); return; }
    setLoading(true);
    try {
      await grievanceApi.assign(grievanceId, officerId.trim());
      toast.success('Grievance assigned successfully');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Enter the MongoDB Object ID of the officer to assign this grievance to.
      </p>
      <div>
        <label className="label">Officer ID</label>
        <input
          type="text"
          value={officerId}
          onChange={(e) => setOfficerId(e.target.value)}
          placeholder="64f1a2b3c4d5e6f7a8b9c0d1"
          className="input font-mono text-sm"
        />
      </div>
      <div className="flex gap-3">
        <button onClick={handleAssign} disabled={loading} className="btn-primary flex-1">
          {loading ? <><Spinner size="sm" /> Assigning…</> : 'Assign'}
        </button>
        <button onClick={onClose} className="btn-secondary">Cancel</button>
      </div>
    </div>
  );
};

const AllGrievancesPage = () => {
  const dispatch = useDispatch();
  const { isAdmin } = useAuth();
  const toast = useToast();

  const grievances = useSelector(selectGrievanceList);
  const pagination = useSelector(selectGrievancePagination);
  const isLoading = useSelector(selectGrievanceLoading);

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [assignTarget, setAssignTarget] = useState(null); // grievanceId

  const load = useCallback(() => {
    dispatch(fetchGrievances({
      page,
      limit: 12,
      sortBy,
      sortOrder,
      ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
    }));
  }, [dispatch, page, filters, sortBy, sortOrder]);

  useEffect(() => { load(); }, [load]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(field); setSortOrder('desc'); }
    setPage(1);
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-primary-600 ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  const thClass = 'px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap';
  const tdClass = 'px-4 py-3 text-sm text-gray-700 align-top';

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Grievances</h1>
          {pagination && (
            <p className="text-sm text-gray-500 mt-0.5">{pagination.total} total</p>
          )}
        </div>
      </div>

      {/* Filters */}
      <GrievanceFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={() => { setFilters(INITIAL_FILTERS); setPage(1); }}
      />

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : grievances.length === 0 ? (
          <EmptyState icon="🔎" title="No grievances match your filters" desc="Try adjusting or clearing the filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className={thClass}>Ticket</th>
                  <th className={thClass}>
                    <button onClick={() => handleSort('title')} className="flex items-center hover:text-gray-800">
                      Title <SortIcon field="title" />
                    </button>
                  </th>
                  <th className={thClass}>Status</th>
                  <th className={thClass}>Priority</th>
                  <th className={thClass}>Department</th>
                  <th className={thClass}>AI</th>
                  <th className={thClass}>
                    <button onClick={() => handleSort('createdAt')} className="flex items-center hover:text-gray-800">
                      Submitted <SortIcon field="createdAt" />
                    </button>
                  </th>
                  <th className={thClass}>Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {grievances.map((g) => (
                  <tr key={g._id} className="hover:bg-gray-50 transition-colors">
                    <td className={tdClass}>
                      <span className="font-mono text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                        {g.ticketNumber}
                      </span>
                    </td>
                    <td className={`${tdClass} max-w-[220px]`}>
                      <Link
                        to={`/admin/grievances/${g._id}`}
                        className="font-medium text-gray-900 hover:text-primary-600 transition-colors line-clamp-2"
                      >
                        {g.title}
                      </Link>
                      {g.location?.district && (
                        <p className="text-xs text-gray-400 mt-0.5">📍 {g.location.district}</p>
                      )}
                    </td>
                    <td className={tdClass}><StatusBadge status={g.status} /></td>
                    <td className={tdClass}><PriorityBadge priority={g.priority} /></td>
                    <td className={`${tdClass} whitespace-nowrap`}>
                      {snakeToTitle(g.department)}
                    </td>
                    <td className={tdClass}>
                      {g.aiAnalysis?.analysisStatus === 'completed' ? (
                        <span className="text-violet-600 font-medium text-xs">✓ Done</span>
                      ) : g.aiAnalysis?.analysisStatus === 'processing' ? (
                        <span className="text-gray-400 text-xs">Running…</span>
                      ) : (
                        <span className="text-red-400 text-xs">Failed</span>
                      )}
                    </td>
                    <td className={`${tdClass} whitespace-nowrap text-gray-400`}>
                      {timeAgo(g.createdAt)}
                    </td>
                    <td className={tdClass}>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/grievances/${g._id}`}
                          className="text-xs text-primary-600 hover:text-primary-800 font-medium"
                        >
                          View
                        </Link>
                        {isAdmin && g.status === 'pending' && (
                          <button
                            onClick={() => setAssignTarget(g._id)}
                            className="text-xs text-gray-500 hover:text-gray-800 font-medium"
                          >
                            Assign
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination pagination={pagination} onPageChange={setPage} />

      {/* Assign modal */}
      <Modal
        open={!!assignTarget}
        onClose={() => setAssignTarget(null)}
        title="Assign Grievance"
      >
        <AssignModal
          grievanceId={assignTarget}
          onClose={() => setAssignTarget(null)}
          onSuccess={load}
        />
      </Modal>
    </div>
  );
};

export default AllGrievancesPage;
