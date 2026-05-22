import { Outlet, NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import { selectSidebarOpen, toggleSidebar } from '@/store/slices/uiSlice';
import { useAuth } from '@/hooks/useAuth';
import { getInitials, snakeToTitle } from '@/utils/helpers';
import Spinner from '@/components/ui/Spinner';
import NotificationBell from '@/components/ui/NotificationBell';

const NAV_GROUPS = [
  {
    label: 'Main',
    links: [
      { to: '/admin/dashboard',  label: 'Dashboard',  icon: '⊞' },
      { to: '/admin/grievances', label: 'Grievances', icon: '≡' },
      { to: '/admin/analytics',  label: 'Analytics',  icon: '↗' },
    ],
  },
  {
    label: 'Administration',
    links: [
      { to: '/admin/users',      label: 'Users',      icon: '👥', adminOnly: true },
      { to: '/admin/sla',        label: 'SLA Config', icon: '⏱', adminOnly: true },
    ],
  },
  {
    label: 'Account',
    links: [
      { to: '/admin/notifications', label: 'Notifications', icon: '🔔' },
      { to: '/admin/profile',       label: 'My Profile',    icon: '👤' },
    ],
  },
];

const AdminLayout = () => {
  const { user, logout, isAdmin, role } = useAuth();
  const sidebarOpen = useSelector(selectSidebarOpen);
  const dispatch = useDispatch();
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

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo + collapse toggle */}
      <div className="h-16 flex items-center px-4 border-b border-gray-200 gap-3">
        <div className="w-7 h-7 bg-primary-600 rounded flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">G</span>
        </div>
        {sidebarOpen && (
          <span className="font-semibold text-gray-900 text-sm truncate">Admin Panel</span>
        )}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="ml-auto text-gray-400 hover:text-gray-600 hidden lg:block"
        >
          {sidebarOpen ? '‹' : '›'}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {sidebarOpen && (
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.links.filter(link => !link.adminOnly || isAdmin).map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={navLinkClass}
                  title={!sidebarOpen ? link.label : undefined}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="text-base leading-none shrink-0">{link.icon}</span>
                  {sidebarOpen && link.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User + role */}
      <div className="p-3 border-t border-gray-200">
        {sidebarOpen && (
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">
              {getInitials(user?.name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{snakeToTitle(role)}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          title="Logout"
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          {loggingOut ? <Spinner size="sm" /> : <span className="shrink-0">→</span>}
          {sidebarOpen && (loggingOut ? 'Logging out...' : 'Logout')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex">
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-200 shrink-0 ${
          sidebarOpen ? 'w-56' : 'w-16'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-56 bg-white border-r border-gray-200 flex flex-col lg:hidden transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 gap-4 shrink-0">
          <button
            className="lg:hidden p-2 text-gray-500 hover:text-gray-900"
            onClick={() => setMobileOpen(true)}
          >
            ☰
          </button>
          <div className="flex-1"/>
          <NotificationBell />
          <span className="text-sm font-medium text-gray-500 hidden sm:block">
            {isAdmin ? 'Administrator' : 'Officer'} · {user?.department ? snakeToTitle(user.department) : 'All Departments'}
          </span>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
