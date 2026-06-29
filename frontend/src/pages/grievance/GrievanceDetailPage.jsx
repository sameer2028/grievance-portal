import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchGrievanceById, selectSelectedGrievance,
  selectGrievanceLoading, clearSelected,
} from '@/store/slices/grievanceSlice';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { grievanceApi } from '@/api/grievanceApi';
import { feedbackApi } from '@/api/otherApis';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import AIAnalysisPanel from '@/components/grievance/AIAnalysisPanel';
import GrievanceStatusTimeline from '@/components/grievance/GrievanceStatusTimeline';
import CommentThread from '@/components/grievance/CommentThread';
import FeedbackForm from '@/components/grievance/FeedbackForm';
import Spinner from '@/components/ui/Spinner';
import Modal from '@/components/ui/Modal';
import { formatDate, timeAgo, snakeToTitle } from '@/utils/helpers';
import { GRIEVANCE_STATUS, STATUS_LABELS, ROLES } from '@/utils/constants';

const UpdateStatusModal = ({ grievance, onClose, onSuccess }) => {
  const [status, setStatus] = useState(grievance.status);
  const [response, setResponse] = useState(grievance.officialResponse || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await grievanceApi.updateStatus(grievance._id, { status, officialResponse: response, internalNotes: notes });
      toast.success('Status updated');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">New Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Official Response (visible to citizen)</label>
        <textarea value={response} onChange={(e) => setResponse(e.target.value)} rows={3} className="input resize-none" placeholder="Inform the citizen about action taken…" maxLength={1000} />
      </div>
      <div>
        <label className="label">Internal Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="input resize-none" placeholder="Notes for your team…" maxLength={500} />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? <><Spinner size="sm" /> Updating…</> : 'Update Status'}
        </button>
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
};

const GrievanceDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAdmin, isOfficer, isCitizen } = useAuth();

  const grievance = useSelector(selectSelectedGrievance);
  const isLoading = useSelector(selectGrievanceLoading);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState(null);
  const [feedbackLoaded, setFeedbackLoaded] = useState(false);

  const isStaff = isAdmin || isOfficer;

  useEffect(() => {
    dispatch(fetchGrievanceById(id));
    return () => dispatch(clearSelected());
  }, [id, dispatch]);

  // Auto-poll while AI analysis is processing
  useEffect(() => {
    const aiStatus = grievance?.aiAnalysis?.analysisStatus;
    if (!grievance || aiStatus === 'completed' || aiStatus === 'failed') return;

    const timer = setInterval(() => {
      dispatch(fetchGrievanceById(id));
    }, 2500);

    return () => clearInterval(timer);
  }, [id, dispatch, grievance]);

  // Load feedback for resolved grievances
  useEffect(() => {
    if (grievance?.status === GRIEVANCE_STATUS.RESOLVED && isCitizen) {
      feedbackApi.get(id)
        .then((data) => setExistingFeedback(data.data.feedback))
        .catch(() => {})
        .finally(() => setFeedbackLoaded(true));
    }
  }, [grievance?.status, id, isCitizen]);

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (!grievance) return null;

  const {
    ticketNumber, title, description, status, priority,
    department, location, createdAt, resolvedAt,
    submittedBy, assignedTo, officialResponse,
    statusHistory, aiAnalysis, daysOpen, attachments,
  } = grievance;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in space-y-5">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-1">
        ← Back
      </button>

      {/* Header card */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-1 rounded">{ticketNumber}</span>
          <StatusBadge status={status} />
          <PriorityBadge priority={priority} />
          <span className="ml-auto text-xs text-gray-400">{timeAgo(createdAt)}</span>
        </div>

        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h1>

        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <span>🏢 {snakeToTitle(department)}</span>
          {location?.district && <span>📍 {location.district}{location.state ? `, ${location.state}` : ''}</span>}
          <span>📅 {formatDate(createdAt)}</span>
          {resolvedAt && <span>✅ Resolved {formatDate(resolvedAt)}</span>}
          <span>⏱ Open {daysOpen ?? 0} day{daysOpen !== 1 ? 's' : ''}</span>
        </div>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line mb-4">{description}</p>

        {location?.address && (
          <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-md px-3 py-2 mb-4">
            📍 {location.address}{location.pincode ? ` — ${location.pincode}` : ''}
          </div>
        )}

        {attachments && attachments.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Attached Proof</h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {attachments.map((url, idx) => (
                <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                  <img 
                    src={url} 
                    alt={`Attachment ${idx + 1}`} 
                    className="h-40 w-auto object-cover rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:opacity-90 transition-opacity" 
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {isStaff && submittedBy && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
            <span><strong>Submitted by:</strong> {submittedBy.name} ({submittedBy.email})</span>
            {submittedBy.phone && <span>📞 {submittedBy.phone}</span>}
            {assignedTo && <span><strong>Assigned to:</strong> {assignedTo.name}</span>}
          </div>
        )}

        {isStaff && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button onClick={() => setStatusModalOpen(true)} className="btn-primary text-sm">
              Update Status
            </button>
          </div>
        )}
      </div>

      {/* Official Response */}
      {officialResponse && (
        <div className="card border-l-4 border-green-500">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-600">✅</span>
            <h3 className="font-semibold text-gray-900 dark:text-white">Official Response</h3>
          </div>
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{officialResponse}</p>
        </div>
      )}

      {/* AI Analysis Panel */}
      <AIAnalysisPanel aiAnalysis={aiAnalysis} />

      {/* Feedback (citizen only, resolved grievances) */}
      {isCitizen && status === GRIEVANCE_STATUS.RESOLVED && feedbackLoaded && (
        <FeedbackForm
          grievanceId={id}
          existingFeedback={existingFeedback}
          onSubmitted={() => {
            feedbackApi.get(id).then((d) => setExistingFeedback(d.data.feedback)).catch(() => {});
          }}
        />
      )}

      {/* Comment Thread */}
      <CommentThread grievanceId={id} />

      {/* Status Timeline */}
      {statusHistory?.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Status History</h3>
          <GrievanceStatusTimeline history={statusHistory} />
        </div>
      )}

      <Modal open={statusModalOpen} onClose={() => setStatusModalOpen(false)} title="Update Grievance Status">
        <UpdateStatusModal
          grievance={grievance}
          onClose={() => setStatusModalOpen(false)}
          onSuccess={() => dispatch(fetchGrievanceById(id))}
        />
      </Modal>
    </div>
  );
};

export default GrievanceDetailPage;
