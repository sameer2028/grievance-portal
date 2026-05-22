import { Outlet, Link } from 'react-router-dom';

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Minimal public header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-center">
              <span className="text-white text-sm font-bold">G</span>
            </div>
            <span className="font-semibold text-gray-900">GrievancePortal</span>
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <Link to="/track" className="text-gray-600 hover:text-primary-600 transition-colors">
              Track Grievance
            </Link>
            <Link to="/login" className="btn-secondary text-sm px-3 py-1.5">
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

      <footer className="bg-white border-t border-gray-200 py-4 text-center text-sm text-gray-500">
        © 2024 Grievance Portal · Smart India Hackathon
      </footer>
    </div>
  );
};

export default PublicLayout;
