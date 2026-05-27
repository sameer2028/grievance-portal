import { useState, useEffect, useCallback } from 'react';
import { userApi } from '@/api/userApi';
import { useToast } from '@/hooks/useToast';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import Pagination from '@/components/ui/Pagination';
import { DEPARTMENTS, DEPARTMENT_LABELS, ROLES } from '@/utils/constants';
import { timeAgo, getInitials } from '@/utils/helpers';

const CreateOfficerModal = ({ onClose, onSuccess }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', department: '', jurisdiction: '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim())   e.name = 'Required';
    if (!form.email.trim())  e.email = 'Required';
    if (form.password.length < 4) e.password = 'Min 8 characters';
    if (!form.department)    e.department = 'Required';
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) {
      e.phone = 'Must be exactly 10 digits';
    }
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      await userApi.createOfficer({
        ...form,
        jurisdiction: form.jurisdiction.split(',').map((s) => s.trim()).filter(Boolean),
      });
      toast.success('Officer account created');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create officer');
    } finally {
      setLoading(false);
    }
  };

  const f = (name, value) => {
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: '' }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Full Name *</label>
          <input value={form.name} onChange={(e) => f('name', e.target.value)} className={`input ${errors.name ? 'input-error' : ''}`} placeholder="Priya Verma" />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="label">Email *</label>
          <input type="email" value={form.email} onChange={(e) => f('email', e.target.value)} className={`input ${errors.email ? 'input-error' : ''}`} placeholder="officer@gov.in" />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Password *</label>
          <input type="password" value={form.password} onChange={(e) => f('password', e.target.value)} className={`input ${errors.password ? 'input-error' : ''}`} placeholder="Min 4 chars" />
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
        </div>
        <div>
          <label className="label">Phone</label>
          <input type="tel" value={form.phone} onChange={(e) => f('phone', e.target.value)} className="input" placeholder="10-digit mobile" />
        </div>
      </div>

      <div>
        <label className="label">Department *</label>
        <select value={form.department} onChange={(e) => f('department', e.target.value)} className={`input ${errors.department ? 'input-error' : ''}`}>
          <option value="">Select department</option>
          {Object.entries(DEPARTMENT_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department}</p>}
      </div>

      <div>
        <label className="label">Jurisdiction Districts <span className="text-gray-400 font-normal">(comma-separated)</span></label>
        <input value={form.jurisdiction} onChange={(e) => f('jurisdiction', e.target.value)} className="input" placeholder="Lucknow, Kanpur, Unnao" />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? <><Spinner size="sm" /> Creating…</> : 'Create Officer'}
        </button>
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
};

const UserManagementPage = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [toggling, setToggling] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userApi.getAll({ page, limit: 15, search: search || undefined, role: roleFilter || undefined });
      setUsers(data.data || []);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (userId) => {
    setToggling(userId);
    try {
      const res = await userApi.toggleActive(userId);
      toast.success(res.message);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    } finally {
      setToggling(null);
    }
  };

  const ROLE_COLORS = {
    super_admin: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
    admin:       'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    officer:     'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
    citizen:     'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
          {pagination && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{pagination.total} users</p>}
        </div>
        <button onClick={() => setCreateModalOpen(true)} className="btn-primary">
          + Create Officer
        </button>
      </div>

      {/* Filters */}
      <div className="card !p-4 flex flex-wrap gap-3">
        <input
          type="text" placeholder="Search name or email…"
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input text-sm py-1.5 flex-1 min-w-[180px]"
        />
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 bg-white dark:bg-gray-700 dark:text-gray-200">
          <option value="">All Roles</option>
          {Object.values(ROLES).map((r) => <option key={r} value={r} className="capitalize">{r.replace('_', ' ')}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {['User', 'Role', 'Department', 'Status', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center text-xs font-bold shrink-0">
                          {getInitials(u.name)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-600'} capitalize`}>
                        {u.role?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {DEPARTMENT_LABELS[u.department] || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {timeAgo(u.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(u._id)}
                        disabled={toggling === u._id || u.role === ROLES.SUPER_ADMIN}
                        className={`text-xs font-medium px-3 py-1 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                          u.isActive
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {toggling === u._id ? <Spinner size="sm" /> : u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination pagination={pagination} onPageChange={setPage} />

      <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create Officer Account">
        <CreateOfficerModal onClose={() => setCreateModalOpen(false)} onSuccess={load} />
      </Modal>
    </div>
  );
};

export default UserManagementPage;
