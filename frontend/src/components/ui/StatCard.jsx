import { useState, useEffect, useRef } from 'react';
import Spinner from './Spinner';

/**
 * Animated count-up hook
 */
const useCountUp = (target, duration = 600, enabled = true) => {
  const [count, setCount] = useState(0);
  const prevTarget = useRef(target);

  useEffect(() => {
    if (!enabled || target == null || isNaN(target)) {
      setCount(target);
      return;
    }

    const start = prevTarget.current === target ? 0 : count;
    prevTarget.current = target;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(start + (target - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [target, enabled]);

  return count;
};

/**
 * Gradient color sets for icon containers
 */
const GRADIENT_MAP = {
  blue:    'from-blue-500 to-blue-600',
  yellow:  'from-amber-400 to-amber-600',
  green:   'from-emerald-400 to-emerald-600',
  red:     'from-red-400 to-red-600',
  orange:  'from-orange-400 to-orange-600',
  purple:  'from-violet-400 to-violet-600',
  default: 'from-gray-400 to-gray-600',
};

/**
 * Detect gradient key from color prop
 */
const getGradient = (color = '') => {
  if (color.includes('blue'))   return GRADIENT_MAP.blue;
  if (color.includes('yellow') || color.includes('amber')) return GRADIENT_MAP.yellow;
  if (color.includes('green') || color.includes('emerald')) return GRADIENT_MAP.green;
  if (color.includes('red'))    return GRADIENT_MAP.red;
  if (color.includes('orange')) return GRADIENT_MAP.orange;
  if (color.includes('purple') || color.includes('violet')) return GRADIENT_MAP.purple;
  return GRADIENT_MAP.default;
};

/**
 * Premium stat card with gradient icon and animated counter.
 *
 * Props:
 *   label     - "Total Grievances"
 *   value     - 1234  (number or string)
 *   icon      - emoji or SVG string
 *   color     - tailwind bg class for icon bg, e.g. "bg-blue-100"
 *   iconColor - tailwind text class, e.g. "text-blue-600"
 *   trend     - { value: "+12%", up: true } (optional)
 *   loading   - bool
 */
const StatCard = ({ label, value, icon, color = 'bg-gray-100 dark:bg-gray-700', iconColor = 'text-gray-600 dark:text-gray-300', trend, loading = false }) => {
  const isNumber = typeof value === 'number' && !isNaN(value);
  const animatedValue = useCountUp(isNumber ? value : 0, 700, isNumber && !loading);
  const gradient = getGradient(color);

  return (
    <div className="card group hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex items-start gap-4">
      {/* Gradient icon container */}
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-xl text-white shrink-0 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-200`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">{label}</p>
        {loading ? (
          <Spinner size="sm" className="mt-2" />
        ) : (
          <p className="text-2xl font-extrabold font-mono text-gray-900 dark:text-gray-100 mt-0.5 tracking-tight">
            {isNumber ? animatedValue : (value ?? '—')}
          </p>
        )}
        {trend && !loading && (
          <p className={`text-xs mt-1 font-semibold flex items-center gap-1 ${trend.up ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
            <span className={`inline-block ${trend.up ? '' : 'rotate-180'}`}>↑</span>
            {trend.value}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
