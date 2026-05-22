import { useState } from 'react';
import { feedbackApi } from '@/api/otherApis';
import { useToast } from '@/hooks/useToast';
import Spinner from '@/components/ui/Spinner';

const StarRating = ({ value, onChange, label }) => (
  <div>
    {label && <p className="text-xs text-gray-600 mb-1">{label}</p>}
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-2xl transition-transform hover:scale-110 ${
            star <= value ? 'text-yellow-400' : 'text-gray-300'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  </div>
);

/**
 * Props:
 *   grievanceId  - string
 *   onSubmitted  - () => void  (called after successful submission)
 *   existingFeedback - feedback object if already submitted
 */
const FeedbackForm = ({ grievanceId, onSubmitted, existingFeedback }) => {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    rating:            existingFeedback?.rating || 0,
    resolutionQuality: existingFeedback?.resolutionQuality || 0,
    responseTime:      existingFeedback?.responseTime || 0,
    officerBehavior:   existingFeedback?.officerBehavior || 0,
    isIssueResolved:   existingFeedback?.isIssueResolved ?? null,
    requestReopening:  false,
    comment:           existingFeedback?.comment || '',
  });

  if (existingFeedback) {
    return (
      <div className="card border-l-4 border-yellow-400">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          ⭐ Your Feedback
        </h3>
        <div className="flex gap-1 mb-2">
          {[1,2,3,4,5].map((s) => (
            <span key={s} className={`text-xl ${s <= existingFeedback.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
          ))}
          <span className="text-sm text-gray-500 ml-2">{existingFeedback.rating}/5</span>
        </div>
        {existingFeedback.comment && (
          <p className="text-sm text-gray-600 italic">"{existingFeedback.comment}"</p>
        )}
        <p className="text-xs text-gray-400 mt-2">
          Issue resolved: {existingFeedback.isIssueResolved ? '✅ Yes' : '❌ No'}
        </p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.rating === 0) { toast.error('Please select an overall rating'); return; }
    if (form.isIssueResolved === null) { toast.error('Please indicate if the issue was resolved'); return; }

    setSubmitting(true);
    try {
      await feedbackApi.submit(grievanceId, form);
      toast.success('Thank you for your feedback!');
      onSubmitted?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card border-l-4 border-yellow-400">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        ⭐ Rate Your Experience
      </h3>
      <p className="text-sm text-gray-500 mb-5">
        Your grievance has been resolved. Please share your feedback to help us improve.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Overall rating */}
        <StarRating
          label="Overall satisfaction *"
          value={form.rating}
          onChange={(v) => setForm((p) => ({ ...p, rating: v }))}
        />

        {/* Dimension ratings */}
        <div className="grid sm:grid-cols-3 gap-4">
          <StarRating
            label="Resolution quality"
            value={form.resolutionQuality}
            onChange={(v) => setForm((p) => ({ ...p, resolutionQuality: v }))}
          />
          <StarRating
            label="Response time"
            value={form.responseTime}
            onChange={(v) => setForm((p) => ({ ...p, responseTime: v }))}
          />
          <StarRating
            label="Officer behaviour"
            value={form.officerBehavior}
            onChange={(v) => setForm((p) => ({ ...p, officerBehavior: v }))}
          />
        </div>

        {/* Is issue resolved? */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Was your issue actually resolved? *</p>
          <div className="flex gap-3">
            {[{ val: true, label: '✅ Yes, resolved' }, { val: false, label: '❌ No, still pending' }].map(
              ({ val, label }) => (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, isIssueResolved: val }))}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                    form.isIssueResolved === val
                      ? val ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-red-400 bg-red-50 text-red-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </div>

        {/* Request reopening if not resolved */}
        {form.isIssueResolved === false && (
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.requestReopening}
              onChange={(e) => setForm((p) => ({ ...p, requestReopening: e.target.checked }))}
              className="rounded border-gray-300 text-primary-600"
            />
            Request this grievance to be reopened for further action
          </label>
        )}

        {/* Comment */}
        <div>
          <label className="label">Additional comments (optional)</label>
          <textarea
            value={form.comment}
            onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))}
            rows={3}
            maxLength={500}
            placeholder="Tell us more about your experience..."
            className="input resize-none text-sm"
          />
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? <><Spinner size="sm" /> Submitting…</> : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
