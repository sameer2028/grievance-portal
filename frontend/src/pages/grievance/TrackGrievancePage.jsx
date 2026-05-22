import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { grievanceApi } from '@/api/grievanceApi';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import GrievanceStatusTimeline from '@/components/grievance/GrievanceStatusTimeline';
import Spinner from '@/components/ui/Spinner';
import { formatDate, snakeToTitle } from '@/utils/helpers';

const TrackGrievancePage = () => {
  const { ticketNumber: paramTicket } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(paramTicket || '');
  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-search if ticket number came from URL param
  useEffect(() => {
    if (paramTicket) handleSearch(null, paramTicket);
  }, [paramTicket]);

  const handleSearch = async (e, forceTicket) => {
    if (e) e.preventDefault();
    const q = (forceTicket || ticket).trim().toUpperCase();
    if (!q) { setError('Please enter a ticket number'); return; }

    setLoading(true);
    setError('');
    setGrievance(null);

    try {
      const data = await grievanceApi.trackByTicket(q);
      setGrievance(data.data.grievance);
      // Update URL without reload for shareability
      navigate(`/track/${q}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Ticket not found. Please check the number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] px-4 py-12">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-4xl">🔍</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-3 mb-2">Track Your Grievance</h1>
          <p className="text-gray-500 text-sm">
            Enter your ticket number to get the latest status — no login required.
          </p>
        </div>

        {/* Search box */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            type="text"
            value={ticket}
            onChange={(e) => {
              setTicket(e.target.value.toUpperCase());
              setError('');
            }}
            placeholder="e.g. GRV-M5XK2J-A3B1"
            className="input flex-1 font-mono tracking-wide"
          />
          <button type="submit" disabled={loading} className="btn-primary px-5">
            {loading ? <Spinner size="sm" /> : 'Track'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 text-center animate-fade-in">
            {error}
          </div>
        )}

        {/* Result */}
        {grievance && (
          <div className="space-y-4 animate-slide-up">
            {/* Ticket header card */}
            <div className="card">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="font-mono text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                  {grievance.ticketNumber}
                </span>
                <StatusBadge status={grievance.status} />
                <PriorityBadge priority={grievance.priority} />
              </div>

              <h2 className="font-semibold text-gray-900 mb-3">{grievance.title}</h2>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Department</p>
                  <p className="text-gray-700 mt-0.5">{snakeToTitle(grievance.department)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Priority</p>
                  <p className="text-gray-700 capitalize mt-0.5">{grievance.priority}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Submitted</p>
                  <p className="text-gray-700 mt-0.5">{formatDate(grievance.createdAt)}</p>
                </div>
                {grievance.resolvedAt && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Resolved</p>
                    <p className="text-gray-700 mt-0.5">{formatDate(grievance.resolvedAt)}</p>
                  </div>
                )}
              </div>

              {/* Official response */}
              {grievance.officialResponse && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">
                    Official Response
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {grievance.officialResponse}
                  </p>
                </div>
              )}
            </div>

            {/* Timeline */}
            {grievance.statusHistory?.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4 text-sm">Progress Timeline</h3>
                <GrievanceStatusTimeline history={grievance.statusHistory} />
              </div>
            )}

            {/* CTA for registered users */}
            <div className="text-center text-sm text-gray-500 py-2">
              <a href="/register" className="text-primary-600 hover:underline font-medium">
                Create an account
              </a>{' '}
              to submit and manage your own grievances.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackGrievancePage;
