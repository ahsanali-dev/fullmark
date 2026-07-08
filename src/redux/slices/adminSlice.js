import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import apiEndpoints from '../apiEndpoint';

const getAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// 1. Dashboard
export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.admin.dashboard, getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch dashboard stats';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// 2. Users
export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async (params, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.admin.users, {
        ...getAuthConfig(token),
        params,
      });
      return response.data.data; // contains { users, pagination }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch users';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const createUser = createAsyncThunk(
  'admin/createUser',
  async (userData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.post(apiEndpoints.admin.users, userData, getAuthConfig(token));
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to create user';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const toggleUserActive = createAsyncThunk(
  'admin/toggleUserActive',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.patch(apiEndpoints.admin.toggleUserActive(id), {}, getAuthConfig(token));
      return { id, data: response.data.data };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to toggle user status';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// 3. Subjects
export const fetchAllSubjects = createAsyncThunk(
  'admin/fetchAllSubjects',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.admin.subjects, getAuthConfig(token));
      return response.data.data; // contains { subjects }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch subjects';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const createSubject = createAsyncThunk(
  'admin/createSubject',
  async (subjectData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.post(apiEndpoints.admin.subjects, subjectData, getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to create subject';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateSubject = createAsyncThunk(
  'admin/updateSubject',
  async ({ id, subjectData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.put(apiEndpoints.admin.subjectById(id), subjectData, getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update subject';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteSubject = createAsyncThunk(
  'admin/deleteSubject',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      await axios.delete(apiEndpoints.admin.subjectById(id), getAuthConfig(token));
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete subject';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// 4. Coupons
export const fetchAllCoupons = createAsyncThunk(
  'admin/fetchAllCoupons',
  async (params, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.admin.coupons, {
        ...getAuthConfig(token),
        params,
      });
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch coupons';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const createCoupon = createAsyncThunk(
  'admin/createCoupon',
  async (couponData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.post(apiEndpoints.admin.coupons, couponData, getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to create coupon';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const toggleCouponActive = createAsyncThunk(
  'admin/toggleCouponActive',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.patch(apiEndpoints.admin.toggleCouponActive(id), {}, getAuthConfig(token));
      return { id, data: response.data.data };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to toggle coupon status';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteCoupon = createAsyncThunk(
  'admin/deleteCoupon',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      await axios.delete(apiEndpoints.admin.couponById(id), getAuthConfig(token));
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete coupon';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// 5. Reports
export const fetchReports = createAsyncThunk(
  'admin/fetchReports',
  async (params, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.admin.reports, {
        ...getAuthConfig(token),
        params,
      });
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch reports';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    stats: null,
    recentUsers: [],
    users: [],
    pagination: null,
    subjects: [],
    coupons: [],
    reports: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearAdminState: (state) => {
      state.stats = null;
      state.recentUsers = [];
      state.users = [];
      state.subjects = [];
      state.coupons = [];
      state.reports = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.stats;
        state.recentUsers = action.payload.recentUsers;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Users
      .addCase(fetchAllUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        // Option: we can prepend the new user if we store simple info, or fetch again
      })
      .addCase(toggleUserActive.fulfilled, (state, action) => {
        state.users = state.users.map((u) =>
          u._id === action.payload.id ? { ...u, isActive: action.payload.data.isActive } : u
        );
      })
      // Subjects
      .addCase(fetchAllSubjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllSubjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subjects = action.payload.subjects;
      })
      .addCase(fetchAllSubjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createSubject.fulfilled, (state, action) => {
        state.subjects = [action.payload.subject, ...state.subjects];
      })
      .addCase(updateSubject.fulfilled, (state, action) => {
        state.subjects = state.subjects.map((s) =>
          s._id === action.payload.subject._id ? action.payload.subject : s
        );
      })
      .addCase(deleteSubject.fulfilled, (state, action) => {
        state.subjects = state.subjects.filter((s) => s._id !== action.payload);
      })
      // Coupons
      .addCase(fetchAllCoupons.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllCoupons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.coupons = action.payload.coupons;
      })
      .addCase(fetchAllCoupons.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.coupons = [action.payload.coupon, ...state.coupons];
      })
      .addCase(toggleCouponActive.fulfilled, (state, action) => {
        state.coupons = state.coupons.map((c) =>
          c._id === action.payload.id ? { ...c, isActive: action.payload.data.isActive } : c
        );
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.coupons = state.coupons.filter((c) => c._id !== action.payload);
      })
      // Reports
      .addCase(fetchReports.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAdminState } = adminSlice.actions;
export default adminSlice.reducer;
