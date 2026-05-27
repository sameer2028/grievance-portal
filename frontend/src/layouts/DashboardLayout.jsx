import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { logoutUser } from '@/store/slices/authSlice';
import { useAuth } from '@/hooks/useAuth';
import { getInitials } from '@/utils/helpers';
import Spinner from '@/components/ui/Spinner';
import NotificationBell from '@/components/ui/NotificationBell';
import ThemeToggle from '@/components/ui/ThemeToggle';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Overview', icon: '⊞' },
  { to: '/grievances/submit', label: 'Submit Grievance', icon: '+' },
  { to: '/grievances/my', label: 'My Grievances', icon: '≡' },
  { to: '/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/profile', label: 'My Profile', icon: '👤' },
];

const DashboardLayout = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await dispatch(logoutUser()).unwrap();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/5 dark:hover:text-gray-100'
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700 gap-3 shrink-0">
        <div className="w-7 h-7 bg-primary-600 rounded flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">G</span>
        </div>
        <span className="font-bold text-gray-900 dark:text-gray-100 truncate">GrievancePortal</span>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={navLinkClass}
            onClick={() => setMobileOpen(false)}
          >
            <span className="text-lg leading-none shrink-0 w-6 text-center">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center text-xs font-bold shrink-0">
            {getInitials(user?.name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
        >
          {loggingOut ? <Spinner size="sm" /> : <span>→</span>}
          {loggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col lg:hidden transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 dark:bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 sm:px-6 gap-4 shrink-0">
          <button
            className="lg:hidden p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            onClick={() => setMobileOpen(true)}
          >
            ☰
          </button>
          <div className="flex-1" />
          <ThemeToggle />
          <NotificationBell />
          <NavLink
            to="/track"
            className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hidden sm:block"
          >
            Track a ticket
          </NavLink>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-5xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
