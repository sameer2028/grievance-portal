import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { grievanceApi } from '@/api/grievanceApi';

// ── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchGrievances = createAsyncThunk(
  'grievances/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      return await grievanceApi.getAll(params);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load grievances');
    }
  }
);

export const fetchMyGrievances = createAsyncThunk(
  'grievances/fetchMine',
  async (params, { rejectWithValue }) => {
    try {
      return await grievanceApi.getMy(params);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load your grievances');
    }
  }
);

export const submitGrievance = createAsyncThunk(
  'grievances/submit',
  async (data, { rejectWithValue }) => {
    try {
      return await grievanceApi.create(data);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Submission failed');
    }
  }
);

export const fetchGrievanceById = createAsyncThunk(
  'grievances/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      return await grievanceApi.getById(id);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Grievance not found');
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const grievanceSlice = createSlice({
  name: 'grievances',
  initialState: {
    list: [],
    selected: null,
    pagination: null,
    isLoading: false,
    isSubmitting: false,
    error: null,
    submitSuccess: false,
  },

  reducers: {
    clearSelected(state) {
      state.selected = null;
    },
    clearSubmitSuccess(state) {
      state.submitSuccess = false;
    },
    clearError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    const loadingCase = (state) => {
      state.isLoading = true;
      state.error = null;
    };

    builder
      .addCase(fetchGrievances.pending, loadingCase)
      .addCase(fetchGrievances.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchGrievances.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchMyGrievances.pending, loadingCase)
      .addCase(fetchMyGrievances.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMyGrievances.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    builder
      .addCase(submitGrievance.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.submitSuccess = false;
      })
      .addCase(submitGrievance.fulfilled, (state) => {
        state.isSubmitting = false;
        state.submitSuccess = true;
      })
      .addCase(submitGrievance.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchGrievanceById.pending, loadingCase)
      .addCase(fetchGrievanceById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selected = action.payload.data.grievance;
      })
      .addCase(fetchGrievanceById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelected, clearSubmitSuccess, clearError } = grievanceSlice.actions;

// Selectors
export const selectGrievanceList = (state) => state.grievances.list;
export const selectSelectedGrievance = (state) => state.grievances.selected;
export const selectGrievancePagination = (state) => state.grievances.pagination;
export const selectGrievanceLoading = (state) => state.grievances.isLoading;
export const selectGrievanceSubmitting = (state) => state.grievances.isSubmitting;
export const selectGrievanceError = (state) => state.grievances.error;
export const selectSubmitSuccess = (state) => state.grievances.submitSuccess;

export default grievanceSlice.reducer;
