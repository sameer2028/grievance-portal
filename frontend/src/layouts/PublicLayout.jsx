import { Outlet, Link } from 'react-router-dom';
import ThemeToggle from '@/components/ui/ThemeToggle';

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Minimal public header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-center">
              <span className="text-white text-sm font-bold">G</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-gray-100">GrievancePortal</span>
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <ThemeToggle />
            <Link to="/track" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Track Grievance
            </Link>
            <Link to="/login" className="btn-secondary text-sm px-3 py-1.5 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
              Login
            </Link>
            <Link to="/register" className="btn-primary text-sm px-3 py-1.5">
              Register
            </Link>
          </nav>
        </div>
      </header>

      {/* Page content rendered here */}
      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
        © 2024 Grievance Portal · Smart India Hackathon
      </footer>
    </div>
  );
};

export default PublicLayout;
