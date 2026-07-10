import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import apiEndpoints from '../apiEndpoint';

const getAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Async Thunks for Parent
export const fetchParentProfile = createAsyncThunk(
  'parent/fetchProfile',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.parent.profile, getAuthConfig(token));
      return response.data.data.profile;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch parent profile';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchChildrenList = createAsyncThunk(
  'parent/fetchChildrenList',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.parent.children, getAuthConfig(token));
      return response.data.data.children;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch children';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const linkChild = createAsyncThunk(
  'parent/linkChild',
  async (code, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.post(apiEndpoints.parent.linkChild, { code }, getAuthConfig(token));
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to link child';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const unlinkChild = createAsyncThunk(
  'parent/unlinkChild',
  async (childId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.delete(apiEndpoints.parent.unlinkChild(childId), getAuthConfig(token));
      return { childId, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to unlink child';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchChildOverview = createAsyncThunk(
  'parent/fetchChildOverview',
  async (childId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.parent.childOverview(childId), getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch child overview';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchChildSubjects = createAsyncThunk(
  'parent/fetchChildSubjects',
  async (childId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.parent.childSubjects(childId), getAuthConfig(token));
      return response.data.data.enrollments;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch child subjects';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchChildResults = createAsyncThunk(
  'parent/fetchChildResults',
  async ({ childId, subjectId, page, limit }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.parent.childResults(childId), {
        ...getAuthConfig(token),
        params: { subjectId, page, limit },
      });
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch child results';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchChildProgress = createAsyncThunk(
  'parent/fetchChildProgress',
  async (childId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.parent.childProgress(childId), getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch child progress';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchChildResultDetail = createAsyncThunk(
  'parent/fetchChildResultDetail',
  async ({ childId, resultId }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.parent.childResultDetail(childId, resultId), getAuthConfig(token));
      return response.data.data.attempt;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch child result detail';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  profile: null,
  children: [],
  childOverview: null,
  childSubjects: [],
  childResultsData: null, // contains attempts, stats, pagination
  childProgress: null,
  childResultDetail: null,
  isLoading: false,
  isActionLoading: false,
  error: null,
};

const parentsSlice = createSlice({
  name: 'parent',
  initialState,
  reducers: {
    clearParentState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Profile
      .addCase(fetchParentProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      })

      // Children list
      .addCase(fetchChildrenList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChildrenList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.children = action.payload;
      })
      .addCase(fetchChildrenList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Link child
      .addCase(linkChild.pending, (state) => {
        state.isActionLoading = true;
      })
      .addCase(linkChild.fulfilled, (state, action) => {
        state.isActionLoading = false;
        // Optionally prepend or append linked child if returned or just refresh
      })
      .addCase(linkChild.rejected, (state) => {
        state.isActionLoading = false;
      })

      // Unlink child
      .addCase(unlinkChild.pending, (state) => {
        state.isActionLoading = true;
      })
      .addCase(unlinkChild.fulfilled, (state, action) => {
        state.isActionLoading = false;
        state.children = state.children.filter((child) => child._id !== action.payload.childId);
      })
      .addCase(unlinkChild.rejected, (state) => {
        state.isActionLoading = false;
      })

      // Child overview
      .addCase(fetchChildOverview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChildOverview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.childOverview = action.payload;
      })
      .addCase(fetchChildOverview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Child subjects
      .addCase(fetchChildSubjects.fulfilled, (state, action) => {
        state.childSubjects = action.payload;
      })

      // Child results
      .addCase(fetchChildResults.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchChildResults.fulfilled, (state, action) => {
        state.isLoading = false;
        state.childResultsData = action.payload;
      })
      .addCase(fetchChildResults.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Child progress
      .addCase(fetchChildProgress.fulfilled, (state, action) => {
        state.childProgress = action.payload;
      })

      // Child result detail
      .addCase(fetchChildResultDetail.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchChildResultDetail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.childResultDetail = action.payload;
      })
      .addCase(fetchChildResultDetail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearParentState } = parentsSlice.actions;
export default parentsSlice.reducer;
