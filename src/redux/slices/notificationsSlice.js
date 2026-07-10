import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import apiEndpoints from '../apiEndpoint';

const getAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.common.notifications, getAuthConfig(token));
      return response.data.data; // contains { notifications, unreadCount, total }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch notifications';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.patch(apiEndpoints.common.markAllNotificationsRead, {}, getAuthConfig(token));
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to mark all as read';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markOneRead',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      await axios.patch(apiEndpoints.common.readNotification(id), {}, getAuthConfig(token));
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to mark notification as read';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteOne',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      await axios.delete(apiEndpoints.common.notificationById(id), getAuthConfig(token));
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete notification';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    unreadCount: 0,
    total: 0,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearNotificationsState: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.total = 0;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchNotifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.notifications || [];
        state.unreadCount = action.payload.unreadCount || 0;
        state.total = action.payload.total || 0;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // markAllNotificationsRead
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((n) => ({ ...n, read: true }));
        state.unreadCount = 0;
      })
      // markNotificationRead
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const id = action.payload;
        const notification = state.notifications.find((n) => n._id === id);
        if (notification && !notification.read) {
          notification.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      // deleteNotification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const id = action.payload;
        const notification = state.notifications.find((n) => n._id === id);
        if (notification) {
          if (!notification.read) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          state.notifications = state.notifications.filter((n) => n._id !== id);
          state.total = Math.max(0, state.total - 1);
        }
      });
  },
});

export const { clearNotificationsState } = notificationsSlice.actions;
export default notificationsSlice.reducer;
