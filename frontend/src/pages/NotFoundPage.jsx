import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-gray-50">
    <p className="text-8xl font-black text-primary-100 select-none">404</p>
    <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2">Page not found</h1>
    <p className="text-gray-500 mb-8 max-w-sm">
      The page you're looking for doesn't exist or you don't have access to it.
    </p>
    <div className="flex gap-3">
      <Link to="/" className="btn-primary">Go Home</Link>
      <Link to="/track" className="btn-secondary">Track a Grievance</Link>
    </div>
  </div>
);

export default NotFoundPage;
