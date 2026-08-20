import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import apiEndpoints from '../apiEndpoint';

const getAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Async Thunks
export const fetchStudentDashboard = createAsyncThunk(
  'student/fetchDashboard',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.student.dashboard, getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch dashboard';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchStudentProfile = createAsyncThunk(
  'student/fetchProfile',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.student.profile, getAuthConfig(token));
      return response.data.data.profile;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch profile';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateFCMToken = createAsyncThunk(
  'student/updateFCMToken',
  async (fcmToken, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.put(apiEndpoints.student.fcmToken, { fcmToken }, getAuthConfig(token));
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update FCM token';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchLinkCode = createAsyncThunk(
  'student/fetchLinkCode',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.student.linkCode, getAuthConfig(token));
      return response.data.data || response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch link code';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const enrollWithCoupon = createAsyncThunk(
  'student/enrollWithCoupon',
  async ({ subjectId }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.post(
        apiEndpoints.student.enroll,
        { subject: subjectId },
        getAuthConfig(token)
      );
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to enroll';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const validateCoupon = createAsyncThunk(
  'student/validateCoupon',
  async (code, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.student.couponsValidate(code), getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to validate coupon';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const redeemCoupon = createAsyncThunk(
  'student/redeemCoupon',
  async (couponCode, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.post(
        apiEndpoints.student.couponsRedeem,
        { couponCode },
        getAuthConfig(token)
      );
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to redeem coupon';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchMySubjects = createAsyncThunk(
  'student/fetchMySubjects',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.student.subjects, getAuthConfig(token));
      return response.data.data.subjects;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch subjects';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchBrowseSubjects = createAsyncThunk(
  'student/fetchBrowseSubjects',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.student.browseSubjects, getAuthConfig(token));
      return response.data.data.subjects;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to browse subjects';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchSubjectLessons = createAsyncThunk(
  'student/fetchSubjectLessons',
  async (subjectId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.student.subjectLessons(subjectId), getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch lessons';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchSubjectProgress = createAsyncThunk(
  'student/fetchSubjectProgress',
  async (subjectId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.student.subjectProgress(subjectId), getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch subject progress';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateLessonProgress = createAsyncThunk(
  'student/updateLessonProgress',
  async ({ lessonId, position }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.post(
        apiEndpoints.student.lessonProgress(lessonId),
        { position },
        getAuthConfig(token)
      );
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update lesson progress';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const markLessonComplete = createAsyncThunk(
  'student/markLessonComplete',
  async ({ subjectId, lessonId }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.post(
        apiEndpoints.student.markLessonComplete,
        { subjectId, lessonId },
        getAuthConfig(token)
      );
      return { lessonId, data: response.data.data };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to mark lesson complete';
      return thunkAPI.rejectWithValue(message);
    }
  }
);



export const fetchCouponTransactions = createAsyncThunk(
  'student/fetchCouponTransactions',
  async (code, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.student.couponTransactions(code), getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch coupon transactions';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchMyTransactions = createAsyncThunk(
  'student/fetchMyTransactions',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.student.transactions, getAuthConfig(token));
      return response.data.data.transactions;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch transactions';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchAvailableExams = createAsyncThunk(
  'student/fetchAvailableExams',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.student.exams, getAuthConfig(token));
      return response.data.data?.exams || response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch available exams';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchExamToTake = createAsyncThunk(
  'student/fetchExamToTake',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.student.examToTake(id), getAuthConfig(token));
      return response.data.data?.exam || response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch exam';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchAdaptiveQuestion = createAsyncThunk(
  'student/fetchAdaptiveQuestion',
  async ({ lessonId, difficulty, excludeQuestionIds }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.post(
        apiEndpoints.student.adaptiveQuestion,
        { lessonId, difficulty, excludeQuestionIds },
        getAuthConfig(token)
      );
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch adaptive question';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const generateExam = createAsyncThunk(
  'student/generateExam',
  async ({ subjectId, lessonId, questionCount, difficulty }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.post(
        apiEndpoints.student.generateExam,
        { subjectId, lessonId, questionCount, difficulty },
        getAuthConfig(token)
      );
      return response.data.data.exam;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to generate exam';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const submitExam = createAsyncThunk(
  'student/submitExam',
  async ({ examId, answers, timeTaken }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.post(
        apiEndpoints.student.submitExam,
        { examId, answers, timeTaken },
        getAuthConfig(token)
      );
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to submit exam';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchExamHistory = createAsyncThunk(
  'student/fetchExamHistory',
  async (params, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.student.examHistory, {
        ...getAuthConfig(token),
        params,
      });
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch exam history';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchMyResults = createAsyncThunk(
  'student/fetchMyResults',
  async (params, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.student.results, {
        ...getAuthConfig(token),
        params,
      });
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch results';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchAttemptDetail = createAsyncThunk(
  'student/fetchAttemptDetail',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.student.resultById(id), getAuthConfig(token));
      return response.data.data?.attempt || response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch result detail';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchNotifications = createAsyncThunk(
  'student/fetchNotifications',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.student.notifications, getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch notifications';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'student/markNotificationRead',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      await axios.patch(apiEndpoints.student.readNotification(id), {}, getAuthConfig(token));
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to read notification';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchLeaderboard = createAsyncThunk(
  'student/fetchLeaderboard',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.student.leaderboard, getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch leaderboard';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ─── Student Weakness Improvement Thunks ─────────────────────────────
export const fetchSimilarQuestion = createAsyncThunk(
  'student/fetchSimilarQuestion',
  async (questionId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.student.similarQuestion(questionId), getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch similar question';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchWeaknesses = createAsyncThunk(
  'student/fetchWeaknesses',
  async (status, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.student.weaknesses, {
        ...getAuthConfig(token),
        params: status ? { status } : {},
      });
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch weaknesses';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchDailyImprovementTest = createAsyncThunk(
  'student/fetchDailyImprovementTest',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.student.dailyImprovementTest, getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch daily improvement test';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const submitDailyImprovementTest = createAsyncThunk(
  'student/submitDailyImprovementTest',
  async ({ answers }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.post(
        apiEndpoints.student.submitDailyImprovementTest,
        { answers },
        getAuthConfig(token)
      );
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to submit improvement test';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  dashboard: null,
  profile: null,
  linkCode: null,
  mySubjects: [],
  browseSubjects: [],
  lessonsData: null, // contains lessons array and progress
  subjectProgress: null,
  transactions: [],
  couponDetails: null,
  availableExams: [],
  examDetail: null,
  adaptiveQuestion: null,
  generatedExam: null,
  lastAttemptResult: null,
  attemptsHistory: [],
  resultsData: null, // contains attempts, stats, pagination
  resultDetail: null,
  notificationsData: null, // contains notifications, unreadCount
  leaderboardData: null,
  weaknesses: [],
  dailyImprovementTest: null,
  similarQuestion: null,
  improvementTestResult: null,
  isLoading: false,
  isActionLoading: false,
  error: null,
};

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    clearStudentState: () => initialState,
    clearGeneratedExam: (state) => {
      state.generatedExam = null;
    },
    clearExamDetail: (state) => {
      state.examDetail = null;
    },
    clearAdaptiveQuestion: (state) => {
      state.adaptiveQuestion = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Dashboard
      .addCase(fetchStudentDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudentDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchStudentDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Profile
      .addCase(fetchStudentProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      })

      // Link code
      .addCase(fetchLinkCode.fulfilled, (state, action) => {
        state.linkCode = action.payload?.linkCode || action.payload;
      })

      // Enrolled subjects
      .addCase(fetchMySubjects.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMySubjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mySubjects = action.payload;
      })
      .addCase(fetchMySubjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Browse subjects
      .addCase(fetchBrowseSubjects.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBrowseSubjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.browseSubjects = action.payload;
      })
      .addCase(fetchBrowseSubjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Subject lessons
      .addCase(fetchSubjectLessons.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSubjectLessons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lessonsData = action.payload;
      })
      .addCase(fetchSubjectLessons.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Subject Progress
      .addCase(fetchSubjectProgress.fulfilled, (state, action) => {
        state.subjectProgress = action.payload;
      })

      // Update lesson progress
      .addCase(updateLessonProgress.fulfilled, (state, action) => {
        if (state.lessonsData?.lessons) {
          state.lessonsData.lessons = state.lessonsData.lessons.map((lesson) => {
            if (lesson._id === action.meta.arg.lessonId) {
              return {
                ...lesson,
                ...action.payload.lessonProgress,
              };
            }
            return lesson;
          });
        }
      })

      // Mark lesson complete
      .addCase(markLessonComplete.fulfilled, (state, action) => {
        if (state.lessonsData?.lessons) {
          state.lessonsData.lessons = state.lessonsData.lessons.map((lesson) => {
            if (lesson._id === action.payload.lessonId) {
              return { ...lesson, isCompleted: true };
            }
            return lesson;
          });
        }
      })

      // Validate Coupon
      .addCase(validateCoupon.pending, (state) => {
        state.isActionLoading = true;
      })
      .addCase(validateCoupon.fulfilled, (state, action) => {
        state.isActionLoading = false;
        state.couponDetails = action.payload;
      })
      .addCase(validateCoupon.rejected, (state) => {
        state.isActionLoading = false;
        state.couponDetails = null;
      })

      // Enroll with Coupon
      .addCase(enrollWithCoupon.pending, (state) => {
        state.isActionLoading = true;
      })
      .addCase(enrollWithCoupon.fulfilled, (state) => {
        state.isActionLoading = false;
      })
      .addCase(enrollWithCoupon.rejected, (state) => {
        state.isActionLoading = false;
      })

      // Redeem Coupon (COUPON v3)
      .addCase(redeemCoupon.pending, (state) => {
        state.isActionLoading = true;
      })
      .addCase(redeemCoupon.fulfilled, (state) => {
        state.isActionLoading = false;
        state.couponDetails = null;
      })
      .addCase(redeemCoupon.rejected, (state) => {
        state.isActionLoading = false;
      })

      // Transactions
      .addCase(fetchMyTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload;
      })

      // Available Exams
      .addCase(fetchAvailableExams.fulfilled, (state, action) => {
        state.availableExams = action.payload?.exams || (Array.isArray(action.payload) ? action.payload : []);
      })

      // Exam to take
      .addCase(fetchExamToTake.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchExamToTake.fulfilled, (state, action) => {
        state.isLoading = false;
        state.examDetail = action.payload;
      })
      .addCase(fetchExamToTake.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Adaptive question
      .addCase(fetchAdaptiveQuestion.pending, (state) => {
        state.isActionLoading = true;
      })
      .addCase(fetchAdaptiveQuestion.fulfilled, (state, action) => {
        state.isActionLoading = false;
        state.adaptiveQuestion = action.payload;
      })
      .addCase(fetchAdaptiveQuestion.rejected, (state) => {
        state.isActionLoading = false;
      })

      // Generate Exam
      .addCase(generateExam.pending, (state) => {
        state.isActionLoading = true;
      })
      .addCase(generateExam.fulfilled, (state, action) => {
        state.isActionLoading = false;
        state.generatedExam = action.payload;
      })
      .addCase(generateExam.rejected, (state) => {
        state.isActionLoading = false;
      })

      // Submit Exam
      .addCase(submitExam.pending, (state) => {
        state.isActionLoading = true;
      })
      .addCase(submitExam.fulfilled, (state, action) => {
        state.isActionLoading = false;
        state.lastAttemptResult = action.payload;
      })
      .addCase(submitExam.rejected, (state) => {
        state.isActionLoading = false;
      })

      // Results list
      .addCase(fetchMyResults.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMyResults.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resultsData = action.payload;
      })
      .addCase(fetchMyResults.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Result details
      .addCase(fetchAttemptDetail.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAttemptDetail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resultDetail = action.payload;
      })
      .addCase(fetchAttemptDetail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Notifications
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notificationsData = action.payload;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        if (state.notificationsData) {
          state.notificationsData.notifications = state.notificationsData.notifications.map((n) =>
            n._id === action.payload ? { ...n, isRead: true } : n
          );
          state.notificationsData.unreadCount = Math.max(0, state.notificationsData.unreadCount - 1);
        }
      })

      // Leaderboard
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.leaderboardData = action.payload;
      })

      // Weaknesses
      .addCase(fetchWeaknesses.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchWeaknesses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.weaknesses = action.payload?.weaknesses || (Array.isArray(action.payload) ? action.payload : []);
      })
      .addCase(fetchWeaknesses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Similar Question
      .addCase(fetchSimilarQuestion.fulfilled, (state, action) => {
        state.similarQuestion = action.payload?.variant || action.payload?.question || action.payload;
      })

      // Daily Improvement Test
      .addCase(fetchDailyImprovementTest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDailyImprovementTest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dailyImprovementTest = action.payload;
      })
      .addCase(fetchDailyImprovementTest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Submit Daily Improvement Test
      .addCase(submitDailyImprovementTest.pending, (state) => {
        state.isActionLoading = true;
      })
      .addCase(submitDailyImprovementTest.fulfilled, (state, action) => {
        state.isActionLoading = false;
        state.improvementTestResult = action.payload;
      })
      .addCase(submitDailyImprovementTest.rejected, (state) => {
        state.isActionLoading = false;
      });
  },
});

export const { clearStudentState, clearGeneratedExam, clearExamDetail, clearAdaptiveQuestion } = studentSlice.actions;
export default studentSlice.reducer;
