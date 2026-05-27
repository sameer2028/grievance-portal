import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { initializeAuth, selectIsInitialized } from '@/store/slices/authSlice';
import AppRoutes from '@/routes/AppRoutes';
import ToastContainer from '@/components/ui/ToastContainer';
import Spinner from '@/components/ui/Spinner';

/**
 * App.jsx is intentionally minimal.
 * - Routes are in AppRoutes.jsx
 * - Layouts are in /layouts
 * - Business logic is in pages + store
 * - Global UI (toasts) mounted once here
 */
function App() {
  const dispatch = useDispatch();
  const isInitialized = useSelector(selectIsInitialized);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <AppRoutes />
      <ToastContainer />
    </>
  );
}

export default App;
