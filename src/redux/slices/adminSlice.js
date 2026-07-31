import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import apiEndpoints from '../apiEndpoint';

const getAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Helper for trigger file download from Blob
const downloadBlob = (data, filename) => {
  const url = window.URL.createObjectURL(new Blob([data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

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
      return response.data.data; // contains { users, pagination, metrics }
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

export const updateUser = createAsyncThunk(
  'admin/updateUser',
  async ({ id, userData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.put(apiEndpoints.admin.userById(id), userData, getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update user';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      await axios.delete(apiEndpoints.admin.userById(id), getAuthConfig(token));
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete user';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const exportUsersExcel = createAsyncThunk(
  'admin/exportUsersExcel',
  async (params, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.admin.usersExport, {
        ...getAuthConfig(token),
        params,
        responseType: 'blob',
      });
      const filterName = params?.filter || 'users';
      downloadBlob(response.data, `fullmark_${filterName}_export.xlsx`);
      return true;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to export users';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// 3. Subjects & Content
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

// 4. Coupons & Coupon Batches
export const fetchCouponBatches = createAsyncThunk(
  'admin/fetchCouponBatches',
  async (params, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.admin.couponBatches, {
        ...getAuthConfig(token),
        params,
      });
      return response.data.data; // { batches, totalBatches, summary }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch coupon batches';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const createCouponBatch = createAsyncThunk(
  'admin/createCouponBatch',
  async (batchData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.post(apiEndpoints.admin.couponBatches, batchData, getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to generate coupon batch';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchCouponBatchDetail = createAsyncThunk(
  'admin/fetchCouponBatchDetail',
  async (batchId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.admin.couponBatchDetail(batchId), getAuthConfig(token));
      return response.data.data; // { batch, coupons }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch batch details';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const exportCouponBatchExcel = createAsyncThunk(
  'admin/exportCouponBatchExcel',
  async (batchId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.admin.exportCouponBatch(batchId), {
        ...getAuthConfig(token),
        responseType: 'blob',
      });
      downloadBlob(response.data, `fullmark_coupons_batch_${batchId.slice(-6)}.xlsx`);
      return true;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to export batch Excel';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const cancelCoupon = createAsyncThunk(
  'admin/cancelCoupon',
  async (couponId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.patch(apiEndpoints.admin.cancelCoupon(couponId), {}, getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to cancel coupon';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// 5. Reports & Exports
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

export const exportReportExcel = createAsyncThunk(
  'admin/exportReportExcel',
  async (params, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.admin.reportsExport, {
        ...getAuthConfig(token),
        params,
        responseType: 'blob',
      });
      const periodName = params?.period || 'report';
      const typeName = params?.type || 'students';
      downloadBlob(response.data, `fullmark_${typeName}_${periodName}_report.xlsx`);
      return true;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to export report Excel';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// 6. Admin Notifications & Broadcasts
export const sendAdminNotification = createAsyncThunk(
  'admin/sendAdminNotification',
  async (payload, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.post(apiEndpoints.admin.notifications, payload, getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to send notification';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchNotificationHistory = createAsyncThunk(
  'admin/fetchNotificationHistory',
  async (params, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.admin.notificationHistory, {
        ...getAuthConfig(token),
        params,
      });
      return response.data.data; // { logs, pagination }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch notification history';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// 7. Lessons & Free Preview Management
export const fetchAdminLessons = createAsyncThunk(
  'admin/fetchAdminLessons',
  async (params, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.admin.lessons, {
        ...getAuthConfig(token),
        params,
      });
      return response.data.data; // { lessons }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch lessons';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const toggleLessonFree = createAsyncThunk(
  'admin/toggleLessonFree',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.patch(apiEndpoints.admin.toggleLessonFree(id), {}, getAuthConfig(token));
      return response.data.data; // { lesson }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to toggle free lesson status';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const bulkToggleLessonFree = createAsyncThunk(
  'admin/bulkToggleLessonFree',
  async ({ lessonIds, isFree }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.patch(apiEndpoints.admin.bulkToggleLessonFree, { lessonIds, isFree }, getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to bulk toggle lesson status';
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
    usersMetrics: null,
    pagination: null,
    subjects: [],
    couponBatches: [],
    couponSummary: null,
    activeBatchDetail: null,
    reports: null,
    notificationHistory: [],
    lessons: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearAdminState: (state) => {
      state.stats = null;
      state.recentUsers = [];
      state.users = [];
      state.subjects = [];
      state.couponBatches = [];
      state.reports = null;
      state.notificationHistory = [];
      state.lessons = [];
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
        state.usersMetrics = action.payload.metrics || null;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(toggleUserActive.fulfilled, (state, action) => {
        state.users = state.users.map((u) =>
          u._id === action.payload.id ? { ...u, isActive: action.payload.data.isActive } : u
        );
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const updated = action.payload?.user || action.payload;
        if (updated && updated._id) {
          state.users = state.users.map((u) => (u._id === updated._id ? { ...u, ...updated } : u));
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
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
        if (action.payload?.subject) {
          state.subjects = [action.payload.subject, ...state.subjects];
        }
      })
      .addCase(updateSubject.fulfilled, (state, action) => {
        if (action.payload?.subject) {
          state.subjects = state.subjects.map((s) =>
            s._id === action.payload.subject._id ? action.payload.subject : s
          );
        }
      })
      .addCase(deleteSubject.fulfilled, (state, action) => {
        state.subjects = state.subjects.filter((s) => s._id !== action.payload);
      })

      // Coupon Batches
      .addCase(fetchCouponBatches.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCouponBatches.fulfilled, (state, action) => {
        state.isLoading = false;
        state.couponBatches = action.payload.batches || [];
        state.couponSummary = action.payload.summary || null;
      })
      .addCase(fetchCouponBatches.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchCouponBatchDetail.fulfilled, (state, action) => {
        state.activeBatchDetail = action.payload;
      })
      .addCase(cancelCoupon.fulfilled, (state, action) => {
        if (state.activeBatchDetail?.coupons) {
          state.activeBatchDetail.coupons = state.activeBatchDetail.coupons.map(c => 
            c._id === action.payload._id ? { ...c, status: 'Cancelled' } : c
          );
        }
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
      })

      // Notification History
      .addCase(fetchNotificationHistory.fulfilled, (state, action) => {
        state.notificationHistory = action.payload.broadcasts || action.payload.logs || [];
      })

      // Lessons
      .addCase(fetchAdminLessons.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAdminLessons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lessons = action.payload.lessons || [];
      })
      .addCase(fetchAdminLessons.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(toggleLessonFree.fulfilled, (state, action) => {
        const updated = action.payload.lesson;
        if (updated) {
          state.lessons = state.lessons.map(l => l._id === updated._id ? updated : l);
        }
      })
      .addCase(bulkToggleLessonFree.fulfilled, (state, action) => {
        const updatedList = action.payload.lessons || [];
        const updatedMap = new Map(updatedList.map(l => [l._id, l]));
        state.lessons = state.lessons.map(l => updatedMap.get(l._id) || l);
      });
  },
});

export const { clearAdminState } = adminSlice.actions;
export default adminSlice.reducer;
