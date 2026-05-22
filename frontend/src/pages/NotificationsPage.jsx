import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationApi } from '@/api/notificationApi';
import { useToast } from '@/hooks/useToast';
import Spinner from '@/components/ui/Spinner';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import { timeAgo } from '@/utils/helpers';

const TYPE_ICONS = {
  status_changed:        '📋',
  comment_added:         '💬',
  grievance_assigned:    '👤',
  grievance_escalated:   '🔺',
  sla_breach:            '⚠️',
  feedback_received:     '⭐',
};

const TYPE_LABELS = {
  status_changed:        'Status Update',
  comment_added:         'New Comment',
  grievance_assigned:    'Assignment',
  grievance_escalated:   'Escalation',
  sla_breach:            'SLA Breach',
  feedback_received:     'Feedback',
};

const NotificationsPage = () => {
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await notificationApi.getAll({ page, limit: 20, unreadOnly: unreadOnly ? 'true' : 'false' });
      setNotifications(data.data.notifications || []);
      setPagination(data.data.pagination);
      setUnreadCount(data.data.unreadCount || 0);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, unreadOnly]);

  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markRead(id);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationApi.delete(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success('Notification deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-primary-600 font-medium mt-0.5">{unreadCount} unread</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setUnreadOnly((p) => !p); setPage(1); }}
            className={`btn-secondary text-sm ${unreadOnly ? 'border-primary-400 text-primary-600' : ''}`}
          >
            {unreadOnly ? '👁 Showing Unread' : 'Filter Unread'}
          </button>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} disabled={markingAll} className="btn-secondary text-sm">
              {markingAll ? <Spinner size="sm" /> : 'Mark All Read'}
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="No notifications"
          desc={unreadOnly ? 'All caught up! No unread notifications.' : 'Notifications will appear here when there are updates on your grievances.'}
        />
      ) : (
        <>
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`card !p-0 overflow-hidden transition-colors ${!n.isRead ? 'border-l-4 border-primary-500' : ''}`}
              >
                <div className="flex items-start gap-3 p-4">
                  {/* Icon */}
                  <span className="text-xl shrink-0 mt-0.5">{TYPE_ICONS[n.type] || '📌'}</span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2 mb-1">
                      <span className={`text-xs font-semibold uppercase tracking-wide ${
                        n.isRead ? 'text-gray-400' : 'text-primary-600'
                      }`}>
                        {TYPE_LABELS[n.type] || n.type}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">{timeAgo(n.createdAt)}</span>
                    </div>
                    <p className={`text-sm leading-snug ${n.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                      {n.message}
                    </p>
                    {n.link && (
                      <Link
                        to={n.link}
                        className="text-xs text-primary-600 hover:text-primary-800 font-medium mt-1 inline-block"
                        onClick={() => !n.isRead && handleMarkRead(n._id)}
                      >
                        View →
                      </Link>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1 shrink-0">
                    {!n.isRead && (
                      <button
                        onClick={() => handleMarkRead(n._id)}
                        className="text-xs text-gray-400 hover:text-primary-600 transition-colors"
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(n._id)}
                      className="text-xs text-gray-300 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default NotificationsPage;
