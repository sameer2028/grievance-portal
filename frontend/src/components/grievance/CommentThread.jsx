import { useState, useEffect, useRef } from 'react';
import { commentApi } from '@/api/otherApis';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { timeAgo, getInitials } from '@/utils/helpers';
import Spinner from '@/components/ui/Spinner';

const Comment = ({ comment, currentUserId, isStaff, onDelete }) => {
  const isOwn = comment.author?._id === currentUserId;

  return (
    <div className={`flex gap-3 ${comment.isInternal ? 'opacity-90' : ''}`}>
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
        {getInitials(comment.author?.name)}
      </div>

      <div className="flex-1 min-w-0">
        {/* Author + meta */}
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{comment.author?.name}</span>
          <span className="text-[10px] uppercase tracking-wide bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded font-semibold">
            {comment.author?.role?.replace('_', ' ')}
          </span>
          {comment.isInternal && (
            <span className="text-[10px] uppercase tracking-wide bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded font-semibold border border-amber-200 dark:border-amber-800">
              🔒 Internal
            </span>
          )}
          
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-gray-400 dark:text-gray-500">{timeAgo(comment.createdAt)}</span>
            {(isOwn || isStaff) && (
              <button
                onClick={() => onDelete(comment._id)}
                className="text-xs text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                title="Delete comment"
              >
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Text */}
        <div className={`text-sm text-gray-700 dark:text-gray-200 leading-relaxed p-3 rounded-lg mt-1.5 ${
          comment.isInternal
            ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50'
            : 'bg-gray-100 dark:bg-gray-800'
        }`}>
          {comment.text}
        </div>
      </div>
    </div>
  );
};

/**
 * Props:
 *   grievanceId - string
 */
const CommentThread = ({ grievanceId }) => {
  const { user, isAdmin, isOfficer } = useAuth();
  const toast = useToast();
  const isStaff = isAdmin || isOfficer;

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef(null);

  const fetchComments = async () => {
    try {
      const data = await commentApi.getAll(grievanceId);
      setComments(data.data.comments || []);
    } catch {
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComments(); }, [grievanceId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await commentApi.create(grievanceId, { text: text.trim(), isInternal });
      setText('');
      await fetchComments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await commentApi.delete(grievanceId, commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        💬 Discussion
        {comments.length > 0 && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {comments.length}
          </span>
        )}
      </h3>

      {/* Comment list */}
      {loading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">
          No comments yet. Be the first to add a note.
        </p>
      ) : (
        <div className="space-y-4 mb-5 max-h-80 overflow-y-auto scrollbar-thin pr-1">
          {comments.map((c) => (
            <Comment
              key={c._id}
              comment={c}
              currentUserId={user?.id}
              isStaff={isStaff}
              onDelete={handleDelete}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Compose */}
      <form onSubmit={handleSubmit} className="border-t border-gray-100 pt-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder={isStaff ? 'Add a note or update...' : 'Ask a question or add details...'}
          className="input resize-none text-sm mb-2"
        />

        <div className="flex items-center justify-between gap-3">
          {/* Internal toggle — staff only */}
          {isStaff && (
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="rounded border-gray-300 text-amber-500"
              />
              <span>Internal note</span>
              <span className="text-xs text-gray-400">(not visible to citizen)</span>
            </label>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-gray-400">{1000 - text.length} left</span>
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="btn-primary text-sm px-4 py-1.5"
            >
              {submitting ? <><Spinner size="sm" /> Posting…</> : 'Post'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CommentThread;
