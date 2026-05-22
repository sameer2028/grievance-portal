import { createSlice } from '@reduxjs/toolkit';

let toastId = 0;

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    toasts: [],              // { id, type, message, duration }
    sidebarOpen: true,       // For admin dashboard
    globalLoading: false,
  },

  reducers: {
    addToast(state, action) {
      state.toasts.push({
        id: ++toastId,
        type: action.payload.type || 'info', // success | error | warning | info
        message: action.payload.message,
        duration: action.payload.duration || 4000,
      });
    },

    removeToast(state, action) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },

    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },

    setSidebarOpen(state, action) {
      state.sidebarOpen = action.payload;
    },

    setGlobalLoading(state, action) {
      state.globalLoading = action.payload;
    },
  },
});

export const { addToast, removeToast, toggleSidebar, setSidebarOpen, setGlobalLoading } =
  uiSlice.actions;

// Selectors
export const selectToasts = (state) => state.ui.toasts;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectGlobalLoading = (state) => state.ui.globalLoading;

export default uiSlice.reducer;
