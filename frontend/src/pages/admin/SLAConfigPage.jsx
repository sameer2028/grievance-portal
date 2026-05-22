import { useState, useEffect } from 'react';
import { slaApi } from '@/api/otherApis';
import { useToast } from '@/hooks/useToast';
import Spinner from '@/components/ui/Spinner';
import { DEPARTMENT_LABELS } from '@/utils/constants';

const PRIORITY_ORDER = ['critical', 'high', 'medium', 'low'];

const PRIORITY_COLORS = {
  critical: 'text-red-700 bg-red-50 border-red-200',
  high:     'text-orange-700 bg-orange-50 border-orange-200',
  medium:   'text-yellow-700 bg-yellow-50 border-yellow-200',
  low:      'text-gray-600 bg-gray-50 border-gray-200',
};

const EditCell = ({ value, onSave, loading }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  const handleSave = () => {
    const num = parseInt(val);
    if (!num || num < 1) return;
    onSave(num);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="w-20 px-2 py-1 text-sm border border-primary-400 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
          min={1}
          autoFocus
          onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false); }}
        />
        <button onClick={handleSave} className="text-green-600 hover:text-green-800 text-sm font-bold">✓</button>
        <button onClick={() => { setVal(value); setEditing(false); }} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      disabled={loading}
      className="text-sm text-gray-900 hover:text-primary-600 hover:underline font-medium"
      title="Click to edit"
    >
      {value}h
    </button>
  );
};

const SLAConfigPage = () => {
  const toast = useToast();
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [triggering, setTriggering] = useState(false);

  const load = async () => {
    try {
      const data = await slaApi.getAll();
      setConfigs(data.data.configs || []);
    } catch {
      toast.error('Failed to load SLA configs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleUpdate = async (id, field, value) => {
    setSaving(id);
    try {
      await slaApi.update(id, { [field]: value });
      setConfigs((prev) => prev.map((c) => (c._id === id ? { ...c, [field]: value } : c)));
      toast.success('SLA updated');
    } catch {
      toast.error('Failed to update SLA');
    } finally {
      setSaving(null);
    }
  };

  const handleToggleActive = async (config) => {
    await handleUpdate(config._id, 'isActive', !config.isActive);
  };

  const handleRunEscalation = async () => {
    setTriggering(true);
    try {
      const data = await slaApi.trigger();
      const { escalatedCount, warningCount, checkedCount } = data.data;
      toast.success(
        `Escalation done: ${escalatedCount} escalated, ${warningCount} warnings sent (${checkedCount} checked)`
      );
    } catch {
      toast.error('Escalation check failed');
    } finally {
      setTriggering(false);
    }
  };

  // Group configs by department
  const grouped = {};
  configs.forEach((c) => {
    if (!grouped[c.department]) grouped[c.department] = {};
    grouped[c.department][c.priority] = c;
  });

  const departments = Object.keys(grouped).sort();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SLA Configuration</h1>
          <p className="text-sm text-gray-500 mt-1">
            Set resolution deadlines per department and priority. Grievances exceeding these limits are auto-escalated.
          </p>
        </div>
        <button
          onClick={handleRunEscalation}
          disabled={triggering}
          className="btn-secondary text-sm"
        >
          {triggering ? <><Spinner size="sm" /> Running…</> : '▶ Run Escalation Check Now'}
        </button>
      </div>

      {/* Info banner */}
      <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-start gap-2">
        <span className="text-base shrink-0">ℹ️</span>
        <span>
          The escalation engine runs automatically every hour. Click any value to edit it inline.
          Changes take effect on the next escalation cycle.
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <div className="space-y-4">
          {departments.map((dept) => (
            <div key={dept} className="card !p-0 overflow-hidden">
              {/* Department header */}
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900 text-sm">
                  {DEPARTMENT_LABELS[dept] || dept}
                </h2>
              </div>

              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Priority</th>
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Resolution Deadline</th>
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Warning At</th>
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {PRIORITY_ORDER.map((priority) => {
                    const cfg = grouped[dept]?.[priority];
                    if (!cfg) return null;
                    return (
                      <tr key={priority} className={`${!cfg.isActive ? 'opacity-50' : ''}`}>
                        <td className="px-5 py-3">
                          <span className={`badge border capitalize ${PRIORITY_COLORS[priority]}`}>
                            {priority}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <EditCell
                            value={cfg.resolutionHours}
                            loading={saving === cfg._id}
                            onSave={(v) => handleUpdate(cfg._id, 'resolutionHours', v)}
                          />
                          <p className="text-xs text-gray-400 mt-0.5">
                            ≈ {cfg.resolutionHours >= 24 ? `${Math.round(cfg.resolutionHours / 24)} day(s)` : `${cfg.resolutionHours}h`}
                          </p>
                        </td>
                        <td className="px-5 py-3">
                          <EditCell
                            value={cfg.warningHours}
                            loading={saving === cfg._id}
                            onSave={(v) => handleUpdate(cfg._id, 'warningHours', v)}
                          />
                          <p className="text-xs text-gray-400 mt-0.5">
                            ≈ {cfg.warningHours >= 24 ? `${Math.round(cfg.warningHours / 24)} day(s)` : `${cfg.warningHours}h`} before breach
                          </p>
                        </td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => handleToggleActive(cfg)}
                            className={`text-xs font-medium px-3 py-1 rounded transition-colors ${
                              cfg.isActive
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            {cfg.isActive ? 'Active' : 'Disabled'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SLAConfigPage;
