import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import apiEndpoints from '../apiEndpoint';

const getAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Thunks

// ─── Upload Question / Option Image ──────────────────────────
export const uploadQuestionImage = createAsyncThunk(
  'teacher/uploadQuestionImage',
  async (file, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const formData = new FormData();
      formData.append('image', file);
      const response = await axios.post(apiEndpoints.common.uploadQuestionImage, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data?.data?.url || null;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to upload image';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const uploadLessonPdf = createAsyncThunk(
  'teacher/uploadLessonPdf',
  async ({ lessonId, file }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const formData = new FormData();
      formData.append('lessonId', lessonId);
      formData.append('pdf', file);
      const response = await axios.post(apiEndpoints.common.uploadLessonPdf, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data?.data || null;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to upload PDF';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteLessonPdf = createAsyncThunk(
  'teacher/deleteLessonPdf',
  async (lessonId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.delete(apiEndpoints.common.deleteLessonPdf(lessonId), getAuthConfig(token));
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete PDF';
      return thunkAPI.rejectWithValue(message);
    }
  }
);


export const fetchTeacherStats = createAsyncThunk(
  'teacher/fetchTeacherStats',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.teacher.stats, getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch stats';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchTeacherSubjects = createAsyncThunk(
  'teacher/fetchTeacherSubjects',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.teacher.subjects, getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch subjects';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchLessons = createAsyncThunk(
  'teacher/fetchLessons',
  async (subjectId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.teacher.subjectLessons(subjectId), getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch lessons';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const createLesson = createAsyncThunk(
  'teacher/createLesson',
  async (lessonData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.post(apiEndpoints.teacher.lessons, lessonData, getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to create lesson';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateLesson = createAsyncThunk(
  'teacher/updateLesson',
  async ({ id, lessonData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.put(apiEndpoints.teacher.lessonById(id), lessonData, getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update lesson';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const toggleLessonPublish = createAsyncThunk(
  'teacher/toggleLessonPublish',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.patch(apiEndpoints.teacher.toggleLessonPublish(id), {}, getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to toggle lesson status';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteLesson = createAsyncThunk(
  'teacher/deleteLesson',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      await axios.delete(apiEndpoints.teacher.lessonById(id), getAuthConfig(token));
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete lesson';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchQuestions = createAsyncThunk(
  'teacher/fetchQuestions',
  async (params, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.teacher.questions, {
        ...getAuthConfig(token),
        params,
      });
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch questions';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchQuestionById = createAsyncThunk(
  'teacher/fetchQuestionById',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.teacher.questionById(id), getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const localQ = thunkAPI.getState().teacher.questions.find(q => (q._id || q.id) === id);
      if (localQ) return localQ;
      const message = error.response?.data?.message || error.message || 'Failed to fetch question detail';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const createQuestion = createAsyncThunk(
  'teacher/createQuestion',
  async (questionData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.post(apiEndpoints.teacher.questions, questionData, getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to create question';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateQuestion = createAsyncThunk(
  'teacher/updateQuestion',
  async ({ id, questionData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.put(apiEndpoints.teacher.questionById(id), questionData, getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update question';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteQuestion = createAsyncThunk(
  'teacher/deleteQuestion',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      await axios.delete(apiEndpoints.teacher.questionById(id), getAuthConfig(token));
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete question';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const extractQuestionsFromPdf = createAsyncThunk(
  'teacher/extractQuestionsFromPdf',
  async ({ subjectId, pdfFile }, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.auth.token;
      const user = state.auth.user;
      const formData = new FormData();
      formData.append('subjectId', subjectId);
      
      const teacherId = user?._id || user?.id || user?.teacherProfileId;
      if (teacherId) {
        formData.append('teacherId', teacherId);
      }
      formData.append('pdf', pdfFile);

      const response = await axios.post(apiEndpoints.teacher.extractPdf, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to extract questions from PDF';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchExams = createAsyncThunk(
  'teacher/fetchExams',
  async (params, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.teacher.exams, {
        ...getAuthConfig(token),
        params,
      });
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch exams';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchExamById = createAsyncThunk(
  'teacher/fetchExamById',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.teacher.examById(id), getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const localExam = thunkAPI.getState().teacher.exams.find(e => (e._id || e.id) === id);
      if (localExam) return localExam;
      const message = error.response?.data?.message || error.message || 'Failed to fetch exam detail';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const createExam = createAsyncThunk(
  'teacher/createExam',
  async (examData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.post(apiEndpoints.teacher.exams, examData, getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to create exam';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteExam = createAsyncThunk(
  'teacher/deleteExam',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      await axios.delete(apiEndpoints.teacher.examById(id), getAuthConfig(token));
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete exam';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const togglePublishExam = createAsyncThunk(
  'teacher/togglePublishExam',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.patch(apiEndpoints.teacher.togglePublishExam(id), {}, getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const localExam = thunkAPI.getState().teacher.exams.find(e => (e._id || e.id) === id);
      if (localExam) {
        return { ...localExam, isPublished: !localExam.isPublished };
      }
      const message = error.response?.data?.message || error.message || 'Failed to toggle exam status';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  stats: null,
  subjects: [],
  lessons: [],
  questions: [],
  questionDetail: null,
  exams: [],
  examDetail: null,
  isLoading: false,
  error: null,
};

const teacherSlice = createSlice({
  name: 'teacher',
  initialState,
  reducers: {
    clearTeacherState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Stats
      .addCase(fetchTeacherStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTeacherStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchTeacherStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Subjects
      .addCase(fetchTeacherSubjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTeacherSubjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subjects = action.payload?.subjects || (Array.isArray(action.payload) ? action.payload : []);
      })
      .addCase(fetchTeacherSubjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Lessons
      .addCase(fetchLessons.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLessons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lessons = action.payload?.lessons || (Array.isArray(action.payload) ? action.payload : []);
      })
      .addCase(fetchLessons.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createLesson.fulfilled, (state, action) => {
        const newLesson = action.payload?.lesson || action.payload;
        state.lessons = [...state.lessons, newLesson];
      })
      .addCase(updateLesson.fulfilled, (state, action) => {
        const updatedLesson = action.payload?.lesson || action.payload;
        state.lessons = state.lessons.map((l) =>
          (l._id || l.id) === (updatedLesson._id || updatedLesson.id) ? updatedLesson : l
        );
      })
      .addCase(toggleLessonPublish.fulfilled, (state, action) => {
        const updatedLesson = action.payload?.lesson || action.payload;
        state.lessons = state.lessons.map((l) =>
          (l._id || l.id) === (updatedLesson._id || updatedLesson.id) ? updatedLesson : l
        );
      })
      .addCase(deleteLesson.fulfilled, (state, action) => {
        state.lessons = state.lessons.filter((l) => (l._id || l.id) !== action.payload);
      })
      // Questions
      .addCase(fetchQuestions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.questions = action.payload?.questions || (Array.isArray(action.payload) ? action.payload : []);
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchQuestionById.fulfilled, (state, action) => {
        state.questionDetail = action.payload?.question || action.payload;
      })
      .addCase(createQuestion.fulfilled, (state, action) => {
        const newQuestion = action.payload?.question || action.payload;
        state.questions = [newQuestion, ...state.questions];
      })
      .addCase(updateQuestion.fulfilled, (state, action) => {
        const updatedQuestion = action.payload?.question || action.payload;
        state.questions = state.questions.map((q) =>
          (q._id || q.id) === (updatedQuestion._id || updatedQuestion.id) ? updatedQuestion : q
        );
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.questions = state.questions.filter((q) => (q._id || q.id) !== action.payload);
      })
      .addCase(extractQuestionsFromPdf.fulfilled, (state, action) => {
        const payloadQuestions = action.payload?.questions || action.payload;
        if (Array.isArray(payloadQuestions)) {
          state.questions = [...payloadQuestions, ...state.questions];
        }
      })
      // Exams
      .addCase(fetchExams.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExams.fulfilled, (state, action) => {
        state.isLoading = false;
        state.exams = action.payload?.exams || (Array.isArray(action.payload) ? action.payload : []);
      })
      .addCase(fetchExams.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchExamById.fulfilled, (state, action) => {
        state.examDetail = action.payload?.exam || action.payload;
      })
      .addCase(createExam.fulfilled, (state, action) => {
        const newExam = action.payload?.exam || action.payload;
        state.exams = [newExam, ...state.exams];
      })
      .addCase(deleteExam.fulfilled, (state, action) => {
        state.exams = state.exams.filter((ex) => (ex._id || ex.id) !== action.payload);
      })
      .addCase(togglePublishExam.fulfilled, (state, action) => {
        const updatedExam = action.payload?.exam || action.payload;
        state.exams = state.exams.map((ex) =>
          (ex._id || ex.id) === (updatedExam._id || updatedExam.id) ? updatedExam : ex
        );
      });
  },
});

export const { clearTeacherState } = teacherSlice.actions;
export default teacherSlice.reducer;
