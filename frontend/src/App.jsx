import AppRoutes from '@/routes/AppRoutes';
import ToastContainer from '@/components/ui/ToastContainer';

/**
 * App.jsx is intentionally minimal.
 * - Routes are in AppRoutes.jsx
 * - Layouts are in /layouts
 * - Business logic is in pages + store
 * - Global UI (toasts) mounted once here
 */
function App() {
  return (
    <>
      <AppRoutes />
      <ToastContainer />
    </>
  );
}

export default App;
