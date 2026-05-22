import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import grievanceReducer from './slices/grievanceSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    grievances: grievanceReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these non-serializable values in Redux state
        ignoredActions: ['auth/setCredentials'],
      },
    }),
  devTools: import.meta.env.DEV, // Redux DevTools only in development
});

export default store;
