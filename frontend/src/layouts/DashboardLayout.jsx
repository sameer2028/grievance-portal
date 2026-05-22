import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { logoutUser } from '@/store/slices/authSlice';
import { useAuth } from '@/hooks/useAuth';
import { getInitials } from '@/utils/helpers';
import Spinner from '@/components/ui/Spinner';
import NotificationBell from '@/components/ui/NotificationBell';

const NAV_LINKS = [
  { to: '/dashboard',           label: 'Overview',           icon: '⊞' },
  { to: '/grievances/submit',   label: 'Submit Grievance',   icon: '＋' },
  { to: '/grievances/my',       label: 'My Grievances',      icon: '≡' },
  { to: '/notifications',       label: 'Notifications',      icon: '🔔' },
  { to: '/profile',             label: 'My Profile',         icon: '👤' },
];

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary-50 text-primary-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex">
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-gray-200
          flex flex-col transition-transform duration-200
          lg:static lg:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-gray-200">
          <div className="w-7 h-7 bg-primary-600 rounded flex items-center justify-center mr-2">
            <span className="text-white text-xs font-bold">G</span>
          </div>
          <span className="font-semibold text-gray-900 text-sm">GrievancePortal</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={navLinkClass}
              onClick={() => setMobileOpen(false)}
            >
              <span className="text-base leading-none">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-gray-200">
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">
              {getInitials(user?.name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            {loggingOut ? <Spinner size="sm" /> : <span>→</span>}
            {loggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 gap-4 shrink-0">
          <button
            className="lg:hidden p-2 text-gray-500 hover:text-gray-900"
            onClick={() => setMobileOpen(true)}
          >
            ☰
          </button>
          <div className="flex-1" />
          <NavLink
            to="/track"
            className="text-sm text-primary-600 hover:text-primary-800 font-medium"
          >
            Track a ticket
          </NavLink>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
