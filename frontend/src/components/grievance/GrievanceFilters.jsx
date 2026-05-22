import { useState } from 'react';
import { GRIEVANCE_STATUS, DEPARTMENTS, PRIORITY_LEVELS, DEPARTMENT_LABELS, STATUS_LABELS } from '@/utils/constants';

/**
 * Props:
 *   filters   - current filter object { status, department, priority, search }
 *   onChange  - (newFilters) => void
 *   onReset   - () => void
 */
const GrievanceFilters = ({ filters, onChange, onReset }) => {
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onChange({ ...filters, search: localSearch });
  };

  const handleSelect = (key, value) => {
    onChange({ ...filters, [key]: value || undefined });
  };

  const hasActiveFilters =
    filters.status || filters.department || filters.priority || filters.search;

  const selectClass =
    'text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <div className="card mb-4 !p-4">
      <div className="flex flex-wrap gap-3 items-end">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-1 flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by title or ticket…"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="input text-sm py-1.5 flex-1"
          />
          <button type="submit" className="btn-primary text-sm px-3 py-1.5">
            Search
          </button>
        </form>

        {/* Status */}
        <select
          value={filters.status || ''}
          onChange={(e) => handleSelect('status', e.target.value)}
          className={selectClass}
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>

        {/* Department */}
        <select
          value={filters.department || ''}
          onChange={(e) => handleSelect('department', e.target.value)}
          className={selectClass}
        >
          <option value="">All Departments</option>
          {Object.entries(DEPARTMENT_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>

        {/* Priority */}
        <select
          value={filters.priority || ''}
          onChange={(e) => handleSelect('priority', e.target.value)}
          className={selectClass}
        >
          <option value="">All Priorities</option>
          {Object.values(PRIORITY_LEVELS).map((p) => (
            <option key={p} value={p} className="capitalize">{p}</option>
          ))}
        </select>

        {/* Reset */}
        {hasActiveFilters && (
          <button
            onClick={() => {
              setLocalSearch('');
              onReset();
            }}
            className="text-sm text-red-600 hover:text-red-800 font-medium whitespace-nowrap"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
};

export default GrievanceFilters;
