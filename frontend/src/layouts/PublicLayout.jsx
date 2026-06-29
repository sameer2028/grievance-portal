import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import ThemeToggle from '@/components/ui/ThemeToggle';

const PublicLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Minimal public header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center shrink-0 shadow-md">
              <img src="/faviconnew.png" alt="JanSamadhan Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-gray-100">JanSamadhan</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 text-sm">
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

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg py-4 px-4 flex flex-col gap-4">
            <Link 
              to="/track" 
              onClick={() => setIsMenuOpen(false)}
              className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium py-2 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Track Grievance
            </Link>
            <Link 
              to="/login" 
              onClick={() => setIsMenuOpen(false)}
              className="btn-secondary text-sm px-3 py-2.5 text-center dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              onClick={() => setIsMenuOpen(false)}
              className="btn-primary text-sm px-3 py-2.5 text-center"
            >
              Register
            </Link>
          </div>
        )}
      </header>

      {/* Page content rendered here */}
      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
        © 2026 JanSamadhan · Smart India Hackathon
      </footer>
    </div>
  );
};

export default PublicLayout;
