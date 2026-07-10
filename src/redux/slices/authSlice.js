import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import apiEndpoints from '../apiEndpoint';

// Helper to get auth headers
const getAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Async Thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post(apiEndpoints.auth.register, userData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (otpData, thunkAPI) => {
    try {
      const response = await axios.post(apiEndpoints.auth.verifyOtp, otpData);
      if (response.data?.data?.token) {
        localStorage.setItem('token', response.data.data.token);
      }
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'OTP verification failed';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const resendOtp = createAsyncThunk(
  'auth/resendOtp',
  async (emailData, thunkAPI) => {
    try {
      const response = await axios.post(apiEndpoints.auth.resendOtp, emailData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to resend OTP';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, thunkAPI) => {
    try {
      const response = await axios.post(apiEndpoints.auth.login, credentials);
      if (response.data?.data?.token) {
        localStorage.setItem('token', response.data.data.token);
      }
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        message: error.response?.data?.message || error.message || 'Login failed',
        needsVerification: error.response?.data?.needsVerification || false,
        email: error.response?.data?.email || null
      });
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (emailData, thunkAPI) => {
    try {
      const response = await axios.post(apiEndpoints.auth.forgotPassword, emailData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to send reset request';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (resetData, thunkAPI) => {
    try {
      const response = await axios.post(apiEndpoints.auth.resetPassword, resetData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to reset password';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      if (!token) return thunkAPI.rejectWithValue('No token found');
      const response = await axios.get(apiEndpoints.auth.me, getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch user profile';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.put(apiEndpoints.auth.updateProfile, profileData, getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update profile';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateTeacherProfile = createAsyncThunk(
  'auth/updateTeacherProfile',
  async (profileData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.put(apiEndpoints.teacher.profile, profileData, getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update teacher profile';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.put(apiEndpoints.auth.changePassword, passwordData, getAuthConfig(token));
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to change password';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      if (token) {
        await axios.post(apiEndpoints.auth.logout, {}, getAuthConfig(token));
      }
    } catch (error) {
      console.warn('API logout failed', error);
    } finally {
      localStorage.removeItem('token');
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('token'),
  otpSent: false,
  otpVerified: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetOtpState: (state) => {
      state.otpSent = false;
      state.otpVerified = false;
    },
    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload;
      if (action.payload) {
        localStorage.setItem('token', action.payload);
      } else {
        localStorage.removeItem('token');
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.otpSent = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpVerified = true;
        state.user = action.payload?.user || null;
        if (action.payload?.token) {
          state.token = action.payload.token;
          state.isAuthenticated = true;
          localStorage.setItem('token', action.payload.token);
        }
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.profile 
          ? { ...action.payload.user, ...action.payload.profile }
          : action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Login failed';
      })

      // Get Me
      .addCase(getMe.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        const userData = action.payload.user || action.payload.data || action.payload;
        state.user = action.payload.profile 
          ? { ...userData, ...action.payload.profile }
          : userData;
      })
      .addCase(getMe.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
      })

      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedUser = action.payload.user || action.payload.data || action.payload;
        state.user = state.user 
          ? { ...state.user, ...updatedUser }
          : updatedUser;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Teacher Profile
      .addCase(updateTeacherProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTeacherProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.user && action.payload?.profile) {
          state.user = { ...state.user, ...action.payload.profile };
        }
      })
      .addCase(updateTeacherProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      });
  },
});

export const { clearError, resetOtpState, setToken } = authSlice.actions;
export default authSlice.reducer;
