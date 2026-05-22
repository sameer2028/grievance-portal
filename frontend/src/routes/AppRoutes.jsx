import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUserRole } from '@/store/slices/authSlice';
import { ROLES } from '@/utils/constants';

import PublicLayout from '@/layouts/PublicLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import AdminLayout from '@/layouts/AdminLayout';

import LoginPage         from '@/pages/auth/LoginPage';
import RegisterPage      from '@/pages/auth/RegisterPage';
import LandingPage       from '@/pages/LandingPage';
import PublicStatsPage   from '@/pages/PublicStatsPage';
import NotFoundPage      from '@/pages/NotFoundPage';
import ProfilePage       from '@/pages/ProfilePage';
import NotificationsPage from '@/pages/NotificationsPage';

import TrackGrievancePage  from '@/pages/grievance/TrackGrievancePage';
import CitizenDashboard    from '@/pages/dashboard/CitizenDashboard';
import SubmitGrievancePage from '@/pages/grievance/SubmitGrievancePage';
import GrievanceDetailPage from '@/pages/grievance/GrievanceDetailPage';
import MyGrievancesPage    from '@/pages/grievance/MyGrievancesPage';

import AdminDashboard      from '@/pages/admin/AdminDashboard';
import AllGrievancesPage   from '@/pages/admin/AllGrievancesPage';
import AnalyticsPage       from '@/pages/analytics/AnalyticsPage';
import UserManagementPage  from '@/pages/admin/UserManagementPage';
import SLAConfigPage       from '@/pages/admin/SLAConfigPage';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const RoleRoute = ({ children, allowedRoles }) => {
  const role = useSelector(selectUserRole);
  return allowedRoles.includes(role) ? children : <Navigate to="/" replace />;
};

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route element={<PublicLayout />}>
      <Route path="/"           element={<LandingPage />} />
      <Route path="/login"      element={<LoginPage />} />
      <Route path="/register"   element={<RegisterPage />} />
      <Route path="/track"      element={<TrackGrievancePage />} />
      <Route path="/track/:ticketNumber" element={<TrackGrievancePage />} />
      <Route path="/stats"      element={<PublicStatsPage />} />
    </Route>

    {/* Citizen */}
    <Route element={
      <ProtectedRoute>
        <RoleRoute allowedRoles={[ROLES.CITIZEN]}>
          <DashboardLayout />
        </RoleRoute>
      </ProtectedRoute>
    }>
      <Route path="/dashboard"          element={<CitizenDashboard />} />
      <Route path="/grievances/submit"  element={<SubmitGrievancePage />} />
      <Route path="/grievances/my"      element={<MyGrievancesPage />} />
      <Route path="/grievances/:id"     element={<GrievanceDetailPage />} />
      <Route path="/profile"            element={<ProfilePage />} />
      <Route path="/notifications"      element={<NotificationsPage />} />
    </Route>

    {/* Admin / Officer */}
    <Route element={
      <ProtectedRoute>
        <RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.OFFICER]}>
          <AdminLayout />
        </RoleRoute>
      </ProtectedRoute>
    }>
      <Route path="/admin/dashboard"          element={<AdminDashboard />} />
      <Route path="/admin/grievances"         element={<AllGrievancesPage />} />
      <Route path="/admin/grievances/:id"     element={<GrievanceDetailPage />} />
      <Route path="/admin/analytics"          element={<AnalyticsPage />} />
      <Route path="/admin/users"              element={<UserManagementPage />} />
      <Route path="/admin/sla"                element={<SLAConfigPage />} />
      <Route path="/admin/profile"            element={<ProfilePage />} />
      <Route path="/admin/notifications"      element={<NotificationsPage />} />
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default AppRoutes;
