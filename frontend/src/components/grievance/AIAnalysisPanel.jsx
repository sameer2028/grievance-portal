import { snakeToTitle } from '@/utils/helpers';
import { formatDate } from '@/utils/helpers';

const SENTIMENT_CONFIG = {
  negative: { icon: '😠', color: 'text-red-600 dark:text-red-400',   bg: 'bg-red-50 dark:bg-red-900/20',   label: 'Negative' },
  positive: { icon: '🙂', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', label: 'Positive' },
  neutral:  { icon: '😐', color: 'text-gray-600 dark:text-gray-400',  bg: 'bg-gray-50 dark:bg-gray-800',  label: 'Neutral'  },
};

const URGENCY_CONFIG = {
  critical: { color: 'text-red-700 dark:text-red-400',    bg: 'bg-red-100 dark:bg-red-900/20',    bar: 'bg-red-500'    },
  high:     { color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/20', bar: 'bg-orange-500' },
  medium:   { color: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/20', bar: 'bg-yellow-500' },
  low:      { color: 'text-gray-600 dark:text-gray-400',   bg: 'bg-gray-100 dark:bg-gray-800',   bar: 'bg-gray-400'   },
};

const ConfidenceBar = ({ value, colorClass }) => (
  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
    <div
      className={`h-1.5 rounded-full ${colorClass}`}
      style={{ width: `${Math.round((value || 0) * 100)}%` }}
    />
  </div>
);

/**
 * Props:
 *   aiAnalysis - the aiAnalysis sub-document from the Grievance model
 */
const AIAnalysisPanel = ({ aiAnalysis }) => {
  if (!aiAnalysis) return null;

  const {
    analysisStatus, category, categoryConfidence,
    sentiment, sentimentScore, urgencyScore,
    isDuplicate, analyzedAt,
  } = aiAnalysis;

  if (analysisStatus === 'pending' || analysisStatus === 'processing') {
    return (
      <div className="card border-l-4 border-violet-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">AI Analysis in Progress</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Classification and sentiment analysis running. Refresh in a few seconds.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (analysisStatus === 'failed') {
    return (
      <div className="card border-l-4 border-red-400">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">AI Analysis Failed</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          The AI service could not analyze this grievance. It will be retried automatically.
        </p>
      </div>
    );
  }

  if (analysisStatus !== 'completed') return null;

  const sentimentCfg = SENTIMENT_CONFIG[sentiment] || SENTIMENT_CONFIG.neutral;
  const urgencyLevel = urgencyScore >= 0.8 ? 'critical' : urgencyScore >= 0.6 ? 'high' : urgencyScore >= 0.35 ? 'medium' : 'low';
  const urgencyCfg = URGENCY_CONFIG[urgencyLevel];

  return (
    <div className="card border-l-4 border-violet-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-violet-600 dark:text-violet-400 text-lg">🤖</span>
          <h3 className="font-semibold text-gray-900 dark:text-white">AI Analysis</h3>
          <span className="badge bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">Completed</span>
        </div>
        {analyzedAt && (
          <span className="text-xs text-gray-400">{formatDate(analyzedAt)}</span>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Category */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            Department Classification
          </p>
          <p className="font-semibold text-gray-900 dark:text-gray-100">{snakeToTitle(category)}</p>
          <ConfidenceBar value={categoryConfidence} colorClass="bg-violet-500" />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {Math.round((categoryConfidence || 0) * 100)}% confidence
          </p>
        </div>

        {/* Sentiment */}
        <div className={`${sentimentCfg.bg} rounded-lg p-3`}>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            Sentiment
          </p>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{sentimentCfg.icon}</span>
            <div>
              <p className={`font-semibold ${sentimentCfg.color}`}>{sentimentCfg.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Score: {sentimentScore?.toFixed(2) ?? 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Urgency */}
        <div className={`${urgencyCfg.bg} rounded-lg p-3`}>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            Urgency Score
          </p>
          <p className={`font-semibold capitalize ${urgencyCfg.color}`}>{urgencyLevel}</p>
          <ConfidenceBar value={urgencyScore} colorClass={urgencyCfg.bar} />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {Math.round((urgencyScore || 0) * 100)} / 100
          </p>
        </div>

        {/* Duplicate */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            Duplicate Detection
          </p>
          {isDuplicate ? (
            <div>
              <p className="font-semibold text-orange-700 dark:text-orange-400">⚠ Possible Duplicate</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Similar grievance already exists in the system.
              </p>
            </div>
          ) : (
            <p className="font-semibold text-green-700 dark:text-green-400">✓ Unique Grievance</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisPanel;
