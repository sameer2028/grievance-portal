import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectUserRole,
  loginUser,
  registerUser,
  logoutUser,
  clearError,
} from '@/store/slices/authSlice';
import { ROLES } from '@/utils/constants';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const role = useSelector(selectUserRole);

  const login = async (credentials) => {
    const result = await dispatch(loginUser(credentials));
    if (loginUser.fulfilled.match(result)) {
      const userRole = result.payload.data.user.role;
      // Route based on role
      if (userRole === ROLES.CITIZEN) navigate('/dashboard');
      else navigate('/admin/dashboard');
    }
    return result;
  };

  const register = async (userData) => {
    const result = await dispatch(registerUser(userData));
    if (registerUser.fulfilled.match(result)) {
      navigate('/dashboard');
    }
    return result;
  };

  const logout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const dismissError = () => dispatch(clearError());

  // Role helpers
  const isAdmin = role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;
  const isOfficer = role === ROLES.OFFICER;
  const isCitizen = role === ROLES.CITIZEN;

  return {
    user,
    role,
    isAuthenticated,
    isLoading,
    error,
    isAdmin,
    isOfficer,
    isCitizen,
    login,
    register,
    logout,
    dismissError,
  };
};
