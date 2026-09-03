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

export const uploadAnimationHtml = createAsyncThunk(
  'teacher/uploadAnimationHtml',
  async (file, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const formData = new FormData();
      formData.append('animation', file);
      const response = await axios.post(apiEndpoints.common.uploadAnimationHtml, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data?.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to upload HTML animation';
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

export const uploadSubjectBanner = createAsyncThunk(
  'teacher/uploadSubjectBanner',
  async ({ subjectId, file }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const formData = new FormData();
      formData.append('subjectId', subjectId);
      formData.append('banner', file);
      const response = await axios.post(apiEndpoints.common.uploadSubjectBanner, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data?.data || response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to upload banner';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchSubjectUnits = createAsyncThunk(
  'teacher/fetchSubjectUnits',
  async (subjectId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.teacher.subjectUnits(subjectId), getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch units';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const createUnit = createAsyncThunk(
  'teacher/createUnit',
  async (unitData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.post(apiEndpoints.teacher.units, unitData, getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to create unit';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateUnit = createAsyncThunk(
  'teacher/updateUnit',
  async ({ id, unitData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.put(apiEndpoints.teacher.unitById(id), unitData, getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update unit';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteUnit = createAsyncThunk(
  'teacher/deleteUnit',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      await axios.delete(apiEndpoints.teacher.unitById(id), getAuthConfig(token));
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete unit';
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

export const createSubject = createAsyncThunk(
  'teacher/createSubject',
  async (subjectData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.post(apiEndpoints.teacher.subjects, subjectData, getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to create subject';
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
      let response;
      try {
        response = await axios.patch(apiEndpoints.teacher.toggleLessonPublish(id), {}, getAuthConfig(token));
      } catch (err) {
        if (err.response?.status === 405 || err.response?.status === 404) {
          response = await axios.post(apiEndpoints.teacher.toggleLessonPublish(id), {}, getAuthConfig(token));
        } else {
          throw err;
        }
      }
      return response.data?.data || response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to toggle lesson status';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const toggleLessonFree = createAsyncThunk(
  'teacher/toggleLessonFree',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.patch(apiEndpoints.teacher.toggleLessonFree(id), {}, getAuthConfig(token));
      return response.data?.data || response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to toggle free lesson status';
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
      const subjects = state.teacher?.subjects || [];
      const selectedSub = subjects.find(s => (s._id || s.id) === subjectId);

      const formData = new FormData();
      formData.append('subjectId', subjectId);
      
      let teacherUserId = null;
      if (selectedSub?.teacher) {
        teacherUserId = typeof selectedSub.teacher === 'object' 
          ? (selectedSub.teacher._id || selectedSub.teacher.id) 
          : selectedSub.teacher;
      }
      if (!teacherUserId) {
        teacherUserId = (typeof user?.user === 'object' ? user?.user?._id : user?.user) 
          || user?.userId 
          || user?.user_id 
          || user?._id;
      }

      if (teacherUserId) {
        formData.append('teacherId', teacherUserId);
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

// ─── Weakness Topics Thunks ──────────────────────────────────────────
export const fetchWeaknessTopics = createAsyncThunk(
  'teacher/fetchWeaknessTopics',
  async (subjectId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.teacher.weaknessTopics(subjectId), getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch weakness topics';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const createWeaknessTopic = createAsyncThunk(
  'teacher/createWeaknessTopic',
  async (topicData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.post(apiEndpoints.teacher.createWeaknessTopic, topicData, getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to create weakness topic';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateWeaknessTopic = createAsyncThunk(
  'teacher/updateWeaknessTopic',
  async ({ id, topicData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.put(apiEndpoints.teacher.updateWeaknessTopic(id), topicData, getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update weakness topic';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteWeaknessTopic = createAsyncThunk(
  'teacher/deleteWeaknessTopic',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      await axios.delete(apiEndpoints.teacher.deleteWeaknessTopic(id), getAuthConfig(token));
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete weakness topic';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ─── Question Approval & Variant Generation Thunks ─────────────────
export const approveQuestion = createAsyncThunk(
  'teacher/approveQuestion',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.patch(apiEndpoints.teacher.approveQuestion(id), {}, getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      try {
        const token = thunkAPI.getState().auth.token;
        const response = await axios.put(apiEndpoints.teacher.questionById(id), { isApproved: true }, getAuthConfig(token));
        return response.data.data;
      } catch (err2) {
        const localQ = thunkAPI.getState().teacher.questions.find(q => (q._id || q.id) === id);
        if (localQ) {
          return { ...localQ, isApproved: true };
        }
        const message = error.response?.data?.message || error.message || 'Failed to approve question';
        return thunkAPI.rejectWithValue(message);
      }
    }
  }
);

export const generateVariants = createAsyncThunk(
  'teacher/generateVariants',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.post(apiEndpoints.teacher.generateVariants(id), {}, getAuthConfig(token));
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to trigger variant generation';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchVariantsStatus = createAsyncThunk(
  'teacher/fetchVariantsStatus',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(apiEndpoints.teacher.getVariants(id), getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch variants status';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ─── Teacher Notification Thunk ────────────────────────────────────
export const sendTeacherNotification = createAsyncThunk(
  'teacher/sendNotification',
  async (payload, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.post(apiEndpoints.teacher.sendNotification, payload, getAuthConfig(token));
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to send notification';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  stats: null,
  subjects: [],
  units: [],
  allUnits: [],
  weaknessTopics: [],
  lessons: [],
  questions: [],
  questionDetail: null,
  variantsStatus: null,
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
      .addCase(createSubject.fulfilled, (state, action) => {
        const newSubject = action.payload?.subject || action.payload;
        if (newSubject) {
          state.subjects = [newSubject, ...state.subjects];
        }
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
      })
      // Units
      .addCase(fetchSubjectUnits.fulfilled, (state, action) => {
        state.units = action.payload?.units || (Array.isArray(action.payload) ? action.payload : []);
        state.allUnits = action.payload?.allUnits || [];
      })
      .addCase(createUnit.fulfilled, (state, action) => {
        const newUnit = action.payload?.unit || action.payload;
        if (newUnit) {
          state.allUnits = [...state.allUnits, newUnit];
          if (newUnit.parent) {
            const parentId = String(newUnit.parent);
            state.units = state.units.map((u) => {
              if (String(u._id || u.id) === parentId) {
                return {
                  ...u,
                  subUnits: [...(u.subUnits || []), newUnit],
                };
              }
              return u;
            });
          } else {
            state.units = [...state.units, { ...newUnit, subUnits: newUnit.subUnits || [] }];
          }
        }
      })
      .addCase(updateUnit.fulfilled, (state, action) => {
        const updatedUnit = action.payload?.unit || action.payload;
        if (updatedUnit) {
          state.allUnits = state.allUnits.map((u) =>
            (u._id || u.id) === (updatedUnit._id || updatedUnit.id) ? updatedUnit : u
          );
          if (updatedUnit.parent) {
            const parentId = String(updatedUnit.parent);
            state.units = state.units.map((u) => {
              if (String(u._id || u.id) === parentId) {
                return {
                  ...u,
                  subUnits: (u.subUnits || []).map((su) =>
                    (su._id || su.id) === (updatedUnit._id || updatedUnit.id) ? updatedUnit : su
                  ),
                };
              }
              return u;
            });
          } else {
            state.units = state.units.map((u) =>
              (u._id || u.id) === (updatedUnit._id || updatedUnit.id)
                ? { ...updatedUnit, subUnits: u.subUnits || [] }
                : u
            );
          }
        }
      })
      .addCase(deleteUnit.fulfilled, (state, action) => {
        const targetId = String(action.payload);
        state.allUnits = state.allUnits.filter((u) => String(u._id || u.id) !== targetId);
        state.units = state.units
          .filter((u) => String(u._id || u.id) !== targetId)
          .map((u) => ({
            ...u,
            subUnits: (u.subUnits || []).filter((su) => String(su._id || su.id) !== targetId),
          }));
      })
      // Banner Upload
      .addCase(uploadSubjectBanner.fulfilled, (state, action) => {
        const updatedSubject = action.payload?.subject;
        if (updatedSubject) {
          state.subjects = state.subjects.map((s) =>
            (s._id || s.id) === (updatedSubject._id || updatedSubject.id) ? updatedSubject : s
          );
        }
      })
      // Weakness Topics
      .addCase(fetchWeaknessTopics.fulfilled, (state, action) => {
        state.weaknessTopics = action.payload?.weaknessTopics || action.payload?.topics || (Array.isArray(action.payload) ? action.payload : []);
      })
      .addCase(createWeaknessTopic.fulfilled, (state, action) => {
        const newTopic = action.payload?.weaknessTopic || action.payload?.topic || action.payload;
        if (newTopic) state.weaknessTopics = [...state.weaknessTopics, newTopic];
      })
      .addCase(updateWeaknessTopic.fulfilled, (state, action) => {
        const updatedTopic = action.payload?.weaknessTopic || action.payload?.topic || action.payload;
        if (updatedTopic) {
          state.weaknessTopics = state.weaknessTopics.map((t) => ((t._id || t.id) === (updatedTopic._id || updatedTopic.id) ? updatedTopic : t));
        }
      })
      .addCase(deleteWeaknessTopic.fulfilled, (state, action) => {
        state.weaknessTopics = state.weaknessTopics.filter((t) => (t._id || t.id) !== action.payload);
      })
      // Approve & Variants
      .addCase(approveQuestion.fulfilled, (state, action) => {
        const approvedQ = action.payload?.question || action.payload;
        if (approvedQ) {
          state.questions = state.questions.map((q) => ((q._id || q.id) === (approvedQ._id || approvedQ.id) ? approvedQ : q));
          if (state.questionDetail && (state.questionDetail._id || state.questionDetail.id) === (approvedQ._id || approvedQ.id)) {
            state.questionDetail = approvedQ;
          }
        }
      })
      .addCase(fetchVariantsStatus.fulfilled, (state, action) => {
        state.variantsStatus = action.payload;
      });
  },
});

export const { clearTeacherState } = teacherSlice.actions;
export default teacherSlice.reducer;
