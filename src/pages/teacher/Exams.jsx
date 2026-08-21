import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiFileText,
  FiPlus,
  FiTrash2,
  FiChevronDown,
  FiBookOpen,
  FiCalendar,
  FiClock,
  FiX,
  FiCheck,
  FiUsers,
  FiHelpCircle,
  FiSearch,
  FiSliders,
  FiBarChart2,
  FiAlertCircle,
  FiZap,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import DashboardLayout from '../../components/layout/DashboardLayout';
import Input from '../../components/ui/Input';
import { useLanguage } from '../../context/LanguageContext';

import { useDispatch, useSelector } from 'react-redux';
import { fetchTeacherSubjects, fetchExams, createExam, deleteExam } from '../../redux/slices/teacherSlice';

const ExamSchema = Yup.object().shape({
  title: Yup.string().min(3, 'Title must be at least 3 characters').required('Exam title is required'),
  subjectId: Yup.string().required('Please select a subject'),
  duration: Yup.number().positive('Duration must be positive').required('Duration in minutes is required'),
  date: Yup.string().required('Exam date is required'),
  questionsCount: Yup.number().min(1, 'Select at least 1 question').required('Number of questions is required')
});

const SkeletonCard = () => (
  <div className="p-5 bg-[#0e101a] border border-gray-800/80 rounded-[2rem] flex flex-col gap-4 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gray-800/80 shrink-0" />
        <div className="flex flex-col gap-2">
          <div className="h-4 w-32 bg-gray-800/80 rounded" />
          <div className="h-3 w-20 bg-gray-800/80 rounded" />
        </div>
      </div>
      <div className="h-6 w-16 bg-gray-800/80 rounded-full" />
    </div>
    <div className="flex gap-3 mt-2">
      <div className="h-3 w-12 bg-gray-800/80 rounded" />
      <div className="h-3 w-12 bg-gray-800/80 rounded" />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-12 bg-gray-900/60 rounded-xl" />
      ))}
    </div>
    <div className="h-0.5 bg-gray-800/40 rounded" />
    <div className="flex gap-3">
      <div className="h-10 flex-1 bg-gray-800/80 rounded-2xl" />
      <div className="h-10 w-10 bg-gray-800/80 rounded-2xl" />
    </div>
  </div>
);

const generateMockResults = (examId, examTitle, passingScore = 60) => {
  let seed = 0;
  if (examId) {
    for (let i = 0; i < examId.length; i++) {
      seed = (seed << 5) - seed + examId.charCodeAt(i);
      seed |= 0;
    }
  }

  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const studentNames = [
    'Ahmad Ali',
    'Fatima Al-Mutairi',
    'Sarah Mansoor',
    'Khalid Yusuf',
    'Omar Farooq',
    'Zainab Ibrahim',
    'Mustafa Saeed',
    'Layla Hassan',
    'Bilal Qureshi',
    'Yasmine Farhat',
    'Tareq Masood',
    'Nour Al-Huda'
  ];

  const numSubmissions = Math.floor(random() * 6) + 6; // 6 to 11 submissions
  const shuffledNames = [...studentNames].sort(() => random() - 0.5);

  const attempts = [];
  let totalScore = 0;
  let highScore = 0;
  let lowScore = 100;

  for (let i = 0; i < numSubmissions; i++) {
    const score = Math.floor(random() * 41) + 55; // score between 55 and 96
    const timeTaken = Math.floor(random() * 21) + 10; // 10 to 30 mins
    const completedAt = new Date(Date.now() - (i * 2 + 1) * 24 * 60 * 60 * 1000).toLocaleDateString();
    const passed = score >= passingScore;

    totalScore += score;
    if (score > highScore) highScore = score;
    if (score < lowScore) lowScore = score;

    attempts.push({
      id: `attempt-${examId}-${i}`,
      studentName: shuffledNames[i % shuffledNames.length],
      score,
      timeTaken,
      completedAt,
      passed
    });
  }

  const avgScore = Math.round(totalScore / numSubmissions);

  return {
    attempts,
    stats: {
      avgScore: `${avgScore}%`,
      highScore: `${highScore}%`,
      lowScore: `${lowScore}%`,
      submitted: `${numSubmissions}/${studentNames.length}`,
      submissionRate: `${Math.round((numSubmissions / studentNames.length) * 100)}%`
    }
  };
};

const TeacherExams = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, isRTL } = useLanguage();

  const { subjects = [], exams = [], isLoading } = useSelector((state) => state.teacher);

  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingExam, setDeletingExam] = useState(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [resultsExam, setResultsExam] = useState(null);
  const [resultsSearchQuery, setResultsSearchQuery] = useState('');
  const [resultsFilter, setResultsFilter] = useState('all');

  // Sync state from Redux on mount
  useEffect(() => {
    dispatch(fetchTeacherSubjects());
    dispatch(fetchExams());
  }, [dispatch]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = () => setActiveMenuId(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const handleAddExam = (values, { resetForm }) => {
    const payload = {
      title: values.title,
      subjectId: values.subjectId,
      duration: Number(values.duration),
      date: values.date,
      questionsCount: Number(values.questionsCount)
    };

    toast.promise(
      dispatch(createExam(payload)).unwrap(),
      {
        loading: isRTL ? 'جاري جدولة الاختبار...' : 'Scheduling exam...',
        success: () => {
          setIsAddExamOpen(false);
          resetForm();
          return isRTL ? 'تم جدولة الاختبار بنجاح!' : 'Exam scheduled successfully!';
        },
        error: (err) => err || (isRTL ? 'فشل جدولة الاختبار' : 'Failed to schedule exam')
      }
    );
  };

  const handleDeleteClick = (exam) => {
    setDeletingExam(exam);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingExam) return;
    const id = deletingExam._id || deletingExam.id;
    setIsDeletingId(id);
    setShowDeleteConfirm(false);
    const loadingToast = toast.loading(isRTL ? 'جاري حذف الاختبار...' : 'Deleting exam...');
    try {
      await dispatch(deleteExam(id)).unwrap();
      toast.success(isRTL ? 'تم حذف الاختبار بنجاح!' : 'Exam deleted successfully!', { id: loadingToast });
      setDeletingExam(null);
    } catch (err) {
      toast.error(err || (isRTL ? 'فشل حذف الاختبار' : 'Failed to delete exam'), { id: loadingToast });
    } finally {
      setIsDeletingId(null);
    }
  };

  // Filter logic
  const filteredExams = exams.filter(ex => {
    const exSubjectId = ex.subject?._id || ex.subject || ex.subjectId;
    const matchesSubject = selectedSubjectFilter === 'all' || exSubjectId === selectedSubjectFilter;
    const matchesQuery = (ex.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesQuery;
  });

  // Stat counts
  const totalCount = exams.length;
  const publishedCount = exams.filter(e => e.status === 'published').length;
  const draftCount = exams.filter(e => e.status === 'draft').length;
  const upcomingCount = exams.filter(e => e.status === 'upcoming').length;

  const isModalActive = isAddExamOpen || showDeleteConfirm || showResultsModal;

  return (
    <DashboardLayout
      role="teacher"
      activeTab="exams"
      title={t('teacher.exams.title')}
      subtitle={t('teacher.exams.subtitle')}
      isModalOpen={isModalActive}
    >
      <div className="flex flex-col gap-6 text-start p-6 md:p-8 pb-36">

        {/* Header Block */}
        <div className="flex justify-between items-center pb-2 border-b border-gray-800/40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/teacher/subjects/select/create-exam')}
              className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-[0_4px_15px_rgba(37,99,235,0.3)] transition-all flex items-center gap-1.5 cursor-pointer text-base"
            >
              <FiPlus size={16} />
              <span>{isRTL ? "إنشاء اختبار" : "Create Exam"}</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Row */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={isRTL ? "البحث في الاختبارات..." : "Search exams..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3.5 bg-[#0e101a] border border-gray-800 rounded-2xl text-white text-base font-semibold outline-none focus:border-blue-500/50 placeholder:text-gray-500`}
            />
            <FiSearch className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-blue-500`} size={18} />
          </div>
          <div className="relative w-full md:w-56">
            <FiBookOpen className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-500`} size={16} />
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className={`w-full ${isRTL ? 'pr-11 pl-10' : 'pl-11 pr-10'} py-3.5 bg-[#0e101a] border border-gray-800 rounded-2xl text-white text-base font-semibold focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer focus:ring-0`}
            >
              <option value="all">{isRTL ? "جميع المواد" : "All Subjects"}</option>
              {subjects.map(s => (
                <option key={s._id || s.id} value={s._id || s.id}>{s.name || s.title}</option>
              ))}
            </select>
            <FiChevronDown className={`text-gray-400 absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 pointer-events-none`} />
          </div>
        </div>

        {/* Summary Stat Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 md:gap-4">
          <div className="p-3.5 bg-blue-500/[0.02] border border-blue-500/15 rounded-2xl text-center">
            <span className="text-lg md:text-xl font-black text-blue-400 block">{totalCount}</span>
            <span className="text-sm text-gray-500 font-bold uppercase tracking-wider mt-1 block">{isRTL ? "الإجمالي" : "Total"}</span>
          </div>
          <div className="p-3.5 bg-emerald-500/[0.02] border border-emerald-500/15 rounded-2xl text-center">
            <span className="text-lg md:text-xl font-black text-emerald-400 block">{publishedCount}</span>
            <span className="text-sm text-gray-500 font-bold uppercase tracking-wider mt-1 block">{isRTL ? "منشور" : "Published"}</span>
          </div>
          <div className="p-3.5 bg-amber-500/[0.02] border border-amber-500/15 rounded-2xl text-center">
            <span className="text-lg md:text-xl font-black text-amber-400 block">{draftCount}</span>
            <span className="text-sm text-gray-500 font-bold uppercase tracking-wider mt-1 block">{isRTL ? "مسودة" : "Draft"}</span>
          </div>
          <div className="p-3.5 bg-indigo-500/[0.02] border border-indigo-500/15 rounded-2xl text-center">
            <span className="text-lg md:text-xl font-black text-indigo-400 block">{upcomingCount}</span>
            <span className="text-sm text-gray-500 font-bold uppercase tracking-wider mt-1 block">{isRTL ? "قادم" : "Upcoming"}</span>
          </div>
        </div>

        {/* Results Counter & Sort */}
        <div className="flex justify-between items-center text-sm font-bold text-gray-400 px-1">
          <span>{filteredExams.length} {isRTL ? "نتيجة" : "results"}</span>
          <div className="flex items-center gap-1.5 text-blue-450 hover:text-blue-400 cursor-pointer">
            <FiSliders size={13} />
            <span>{isRTL ? "الأحدث" : "Newest"}</span>
          </div>
        </div>

        {/* Exams Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="p-12 text-center bg-[#0c0d19]/40 border border-gray-800/80 rounded-[2rem] flex flex-col items-center justify-center">
            <FiAlertCircle className="text-gray-650 mb-3" size={40} />
            <span className="text-lg font-extrabold text-gray-500">{isRTL ? "لم يتم العثور على اختبارات" : "No exams found"}</span>
            <p className="text-base text-gray-600 font-semibold mt-1">{isRTL ? "أنشئ اختباراً جديداً أو عدل الفلاتر" : "Create a new exam or adjust your filters"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredExams.map((ex) => {
              const exSubjectId = typeof ex.subject === 'object' ? ex.subject?._id : (ex.subject || ex.subjectId);
              const subObj = subjects.find(s => (s._id || s.id) === exSubjectId);
              const subName = (typeof ex.subject === 'object' && ex.subject?.name)
                ? ex.subject.name
                : (subObj ? (subObj.name || subObj.title) : (isRTL ? 'غير مسند' : 'Unassigned'));

              const isPublished = ex.isPublished !== undefined ? ex.isPublished : (ex.status === 'published' || !ex.status);
              const isDraft = ex.isPublished === false || ex.status === 'draft';
              const qCount = ex.questionCount || ex.questionsCount || (Array.isArray(ex.questions) ? ex.questions.length : 0);
              const durationMins = ex.timerMinutes || ex.duration || ex.durationMinutes || ex.durationInMinutes || ex.timeLimit || 30;
              const mockRes = generateMockResults(ex._id || ex.id, ex.title, ex.passingScore);

              return (
                <div
                  key={ex.id || ex._id}
                  className="p-5 bg-[#0e101a] border border-gray-800/80 rounded-[2rem] shadow-lg flex flex-col gap-4 relative text-start transition-all duration-300 hover:border-gray-700 animate-fade-in"
                >
                  {/* Top Row: Icon + Title + Status badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] shrink-0">
                        <FiFileText size={18} />
                      </div>
                      <div>
                        <h4 className="text-lg font-extrabold text-white leading-tight capitalize max-w-[140px] md:max-w-[240px] truncate">
                          {ex.title}
                        </h4>
                        <span className="text-sm text-gray-500 font-bold mt-1 block uppercase font-semibold">
                          {subName}
                        </span>
                      </div>
                    </div>

                    <span className={`text-sm font-black uppercase px-3 py-1 rounded-full border ${
                      isPublished
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : isDraft
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                    }`}>
                      {isPublished ? (isRTL ? 'منشور' : 'Published') : isDraft ? (isRTL ? 'مسودة' : 'Draft') : (isRTL ? 'قادم' : 'Upcoming')}
                    </span>
                  </div>

                  {/* Metadata Row: Qs, Duration, Date, Timer */}
                  <div className="flex items-center gap-3 flex-wrap text-sm font-bold text-gray-500 uppercase tracking-wide">
                    <div className="flex items-center gap-1">
                      <FiHelpCircle size={12} className="text-gray-650" />
                      <span>{qCount} {isRTL ? 'أسئلة' : 'Qs'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiClock size={12} className="text-gray-650" />
                      <span>{durationMins} {isRTL ? 'دقيقة' : 'MIN'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiCalendar size={12} className="text-gray-650" />
                      <span>{ex.date || (ex.createdAt ? new Date(ex.createdAt).toLocaleDateString() : 'N/A')}</span>
                    </div>
                    {ex.hasTimer !== false && (
                      <div className="flex items-center gap-1 text-blue-400">
                        <FiZap size={12} />
                        <span>{isRTL ? 'المؤقت' : 'Timer'}</span>
                      </div>
                    )}
                  </div>

                  {/* Score Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-2.5 rounded-xl bg-amber-500/[0.05] border border-amber-500/10 text-center">
                      <span className="text-base font-black text-amber-400 block">{mockRes.stats.avgScore}</span>
                      <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider block mt-0.5 whitespace-nowrap">{isRTL ? 'متوسط الدرجة' : 'Avg Score'}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/10 text-center">
                      <span className="text-base font-black text-emerald-400 block">{mockRes.stats.highScore}</span>
                      <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider block mt-0.5 whitespace-nowrap">{isRTL ? 'أعلى درجة' : 'High Score'}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-red-500/[0.05] border border-red-500/10 text-center">
                      <span className="text-base font-black text-red-400 block">{mockRes.stats.lowScore}</span>
                      <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider block mt-0.5 whitespace-nowrap">{isRTL ? 'أقل درجة' : 'Low Score'}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-blue-500/[0.05] border border-blue-500/10 text-center">
                      <span className="text-base font-black text-blue-400 block">{mockRes.stats.submitted}</span>
                      <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider block mt-0.5 whitespace-nowrap">{isRTL ? 'المقدمين' : 'Submitted'}</span>
                    </div>
                  </div>

                  {/* Submission Rate */}
                  <p className="text-sm font-semibold text-gray-600 -mt-1">{mockRes.stats.submissionRate} {isRTL ? 'نسبة التقديم' : 'submission rate'}</p>

                  {/* Divider */}
                  <div className="border-t border-gray-800/40" />

                  {/* Bottom Row: View Results + Delete */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setResultsExam(ex);
                        setShowResultsModal(true);
                      }}
                      className="flex-1 py-3 rounded-2xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/20 text-blue-400 font-black text-base flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <FiBarChart2 size={14} />
                      <span>{isRTL ? "عرض النتائج" : "View Results"}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(ex)}
                      disabled={isDeletingId === (ex._id || ex.id)}
                      className="p-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={isRTL ? "إلغاء الاختبار" : "Cancel Exam"}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: ADD EXAM */}
      <AnimatePresence>
        {isAddExamOpen && (
          <div
            className="fixed inset-0 bg-[#020205]/70 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4 transition-all duration-300 animate-fade-in"
            onClick={() => setIsAddExamOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 100, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 100, opacity: 0 }}
              className="w-full sm:max-w-md bg-[#0c0d19] border-t sm:border border-gray-800 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 pb-10 sm:pb-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden text-start"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-gray-800 rounded-full mx-auto mb-6 sm:hidden" />

              <button
                onClick={() => setIsAddExamOpen(false)}
                className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} text-gray-500 hover:text-white transition-colors cursor-pointer`}
              >
                <FiX size={20} />
              </button>

              <h3 className="text-xl sm:text-2xl font-black text-white mb-2">{isRTL ? "اختبار جديد" : "New Exam"}</h3>
              <p className="text-xs text-gray-500 mb-6 font-semibold">{isRTL ? "جدولة اختبار تقييم جديد للطلاب" : "Schedule a new student assessment exam"}</p>

              <Formik
                initialValues={{ title: '', subjectId: '', duration: '', date: '', questionsCount: '' }}
                validationSchema={ExamSchema}
                onSubmit={handleAddExam}
              >
                {({ values, handleChange, handleBlur, isSubmitting }) => (
                  <Form className="flex flex-col gap-4 mt-2">
                    <Input name="title" type="text" label={isRTL ? "عنوان الاختبار" : "Exam Title"} placeholder={isRTL ? "مثال: تقييم منتصف الفصل" : "e.g. Midterm assessment"} icon={FiFileText} roleColor="teacher" />

                    <div className="w-full flex flex-col relative">
                      <div className="w-full flex items-center relative rounded-2xl px-4 h-15 input-3d-teacher">
                        <div className="flex-1 relative h-full flex items-center">
                          <span className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1.5 pointer-events-none font-semibold text-[10px] text-blue-400 uppercase tracking-wider`}>
                            {isRTL ? "المادة" : "Subject"}
                          </span>
                          <select
                            name="subjectId"
                            value={values.subjectId}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="w-full bg-transparent border-none text-white text-sm md:text-base font-semibold pt-4 outline-none focus:ring-0 appearance-none cursor-pointer focus:outline-none"
                          >
                            <option value="" className="bg-[#0b0c16] text-gray-500">{isRTL ? "اختر المادة" : "Select Subject"}</option>
                            {subjects.map(s => (
                              <option key={s._id || s.id} value={s._id || s.id} className="bg-[#0b0c16] text-white">{s.name || s.title}</option>
                            ))}
                          </select>
                        </div>
                        <FiChevronDown className={`text-gray-400 absolute ${isRTL ? 'left-4' : 'right-4'} pointer-events-none`} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Input name="duration" type="number" label={isRTL ? "المدة (بالدقائق)" : "Duration (mins)"} placeholder="45" icon={FiClock} roleColor="teacher" />
                      <Input name="questionsCount" type="number" label={isRTL ? "عدد الأسئلة" : "No. of Questions"} placeholder="10" icon={FiHelpCircle} roleColor="teacher" />
                    </div>

                    <Input name="date" type="date" label={isRTL ? "تاريخ الاختبار" : "Exam Date"} placeholder="YYYY-MM-DD" icon={FiCalendar} roleColor="teacher" />

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 mt-2 bg-[#2563eb] hover:bg-blue-500 text-white rounded-2xl font-black shadow-[0_4px_20px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2 active:scale-95 transition-all duration-300 cursor-pointer disabled:opacity-55"
                    >
                      <span>{isRTL ? "جدولة الاختبار" : "Schedule Exam"}</span>
                      <FiCheck className="text-base" />
                    </button>
                  </Form>
                )}
              </Formik>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: DELETE CONFIRMATION */}
      <AnimatePresence>
        {showDeleteConfirm && deletingExam && (
          <div
            className="fixed inset-0 bg-[#020205]/70 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300 animate-fade-in"
            onClick={() => {
              setShowDeleteConfirm(false);
              setDeletingExam(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 100, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 100, opacity: 0 }}
              className="w-full sm:max-w-md bg-[#0c0d19] border border-gray-800 rounded-[2.5rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden text-start"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-black text-white mb-4">{isRTL ? "إلغاء الاختبار" : "Cancel Exam"}</h3>
              <p className="text-sm text-gray-400 leading-relaxed font-semibold mb-6">
                {isRTL ? "هل أنت تأكد من أنك تريد إلغاء الاختبار" : "Are you sure you want to cancel the exam"} <span className="text-red-400 font-extrabold">"{deletingExam.title}"</span>؟ {isRTL ? "لا يمكن التراجع عن هذا الإجراء." : "This action cannot be undone."}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletingExam(null);
                  }}
                  className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl font-bold text-base transition-all cursor-pointer text-center"
                >
                  {isRTL ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold text-base transition-all cursor-pointer text-center shadow-[0_4px_15px_rgba(239,68,68,0.3)]"
                >
                  {isRTL ? "حذف" : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: VIEW RESULTS */}
      <AnimatePresence>
        {showResultsModal && resultsExam && (() => {
          const { attempts, stats } = generateMockResults(resultsExam._id || resultsExam.id, resultsExam.title, resultsExam.passingScore);
          const filteredAttempts = attempts.filter(att => {
            const matchesSearch = att.studentName.toLowerCase().includes(resultsSearchQuery.toLowerCase());
            const matchesFilter = resultsFilter === 'all' || 
              (resultsFilter === 'passed' && att.passed) || 
              (resultsFilter === 'failed' && !att.passed);
            return matchesSearch && matchesFilter;
          });

          return (
            <div
              className="fixed inset-0 bg-[#020205]/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto transition-all duration-300 animate-fade-in"
              onClick={() => {
                setShowResultsModal(false);
                setResultsExam(null);
                setResultsSearchQuery('');
                setResultsFilter('all');
              }}
            >
              <motion.div
                initial={{ scale: 0.95, y: 30, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 30, opacity: 0 }}
                className="w-full max-w-3xl bg-[#0c0d19] border border-gray-800 rounded-[2.5rem] shadow-2xl relative text-start flex flex-col max-h-[85vh] my-auto overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header (Fixed at top inside rounded modal corners) */}
                <div className="px-6 py-5 border-b border-gray-800/60 flex items-center justify-between shrink-0 bg-[#0c0d19]">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white capitalize">{resultsExam.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-500 font-bold uppercase mt-0.5">{isRTL ? "أداء الطلاب والنتائج" : "Student Performance & Results"}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowResultsModal(false);
                      setResultsExam(null);
                      setResultsSearchQuery('');
                      setResultsFilter('all');
                    }}
                    className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-all cursor-pointer shadow-sm shrink-0"
                  >
                    <FiX size={18} />
                  </button>
                </div>

                {/* Scrollable Content (Stats Grid + Search/Filter + Submissions) */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-7 flex flex-col gap-5">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 shrink-0">
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/[0.03] border border-amber-500/20 flex flex-col">
                      <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">{stats.avgScore}</span>
                      <span className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">{isRTL ? "متوسط الدرجة" : "Average Score"}</span>
                    </div>
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/[0.03] border border-emerald-500/20 flex flex-col">
                      <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.highScore}</span>
                      <span className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">{isRTL ? "أعلى درجة" : "High Score"}</span>
                    </div>
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-red-500/10 dark:bg-red-500/[0.03] border border-red-500/20 flex flex-col">
                      <span className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-400">{stats.lowScore}</span>
                      <span className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">{isRTL ? "أقل درجة" : "Low Score"}</span>
                    </div>
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-500/10 dark:bg-blue-500/[0.03] border border-blue-500/20 flex flex-col">
                      <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">{stats.submitted}</span>
                      <span className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">{isRTL ? "نسبة التقديم" : "Submission Rate"} ({stats.submissionRate})</span>
                    </div>
                  </div>

                  {/* Search & Filters */}
                  <div className="flex flex-col sm:flex-row gap-3 items-center w-full shrink-0">
                    {/* Search */}
                    <div className="relative flex-1 w-full">
                      <FiSearch className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-500`} size={16} />
                      <input
                        type="text"
                        placeholder={isRTL ? "البحث باسم الطالب..." : "Search student name..."}
                        value={resultsSearchQuery}
                        onChange={(e) => setResultsSearchQuery(e.target.value)}
                        className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 bg-[#0e101a] border border-gray-800/80 rounded-2xl text-white font-bold text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all`}
                      />
                    </div>

                    {/* Filter tabs */}
                    <div className="flex bg-[#0e101a] border border-gray-800/80 p-1.5 rounded-2xl w-full sm:w-auto shrink-0">
                      <button
                        onClick={() => setResultsFilter('all')}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                          resultsFilter === 'all'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {isRTL ? "الكل" : "All"}
                      </button>
                      <button
                        onClick={() => setResultsFilter('passed')}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                          resultsFilter === 'passed'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {isRTL ? "ناجح" : "Passed"}
                      </button>
                      <button
                        onClick={() => setResultsFilter('failed')}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                          resultsFilter === 'failed'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {isRTL ? "راسب" : "Failed"}
                      </button>
                    </div>
                  </div>

                  {/* Submissions List */}
                  <div className="flex flex-col gap-3">
                    {filteredAttempts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center p-8 sm:p-10 bg-slate-50 dark:bg-gray-900/40 border border-slate-200 dark:border-gray-800/80 rounded-3xl">
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 dark:text-blue-400 mb-3 shadow-sm shrink-0">
                          <FiUsers size={26} />
                        </div>
                        <span className="text-base font-extrabold text-slate-800 dark:text-gray-200">{isRTL ? "لم يتم العثور على محاولات" : "No attempts found"}</span>
                        <p className="text-xs text-slate-500 dark:text-gray-400 font-semibold mt-1">{isRTL ? "جرب إعادة ضبط البحث أو الفلاتر" : "Try resetting search or filters"}</p>
                      </div>
                    ) : (
                      filteredAttempts.map((att, idx) => {
                        const gradients = [
                          'from-blue-600 to-indigo-600',
                          'from-purple-600 to-pink-600',
                          'from-emerald-500 to-teal-600',
                          'from-amber-500 to-orange-600',
                          'from-cyan-500 to-blue-600'
                        ];
                        const avatarGradient = gradients[idx % gradients.length];

                        return (
                          <div
                            key={att.id}
                            className="p-4 sm:p-4.5 bg-[#0e101a] border border-gray-800/80 rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 transition-all duration-200 hover:border-blue-500/40 hover:shadow-lg group"
                          >
                            <div className="flex items-center gap-3.5">
                              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white font-black text-sm uppercase shrink-0 shadow-md`}>
                                {att.studentName.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <h5 className="font-extrabold text-white text-base leading-tight group-hover:text-blue-400 transition-colors">{att.studentName}</h5>
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold mt-1">
                                  <FiCalendar size={12} className="text-gray-400 shrink-0" />
                                  <span>{isRTL ? "تم التقديم:" : "Submitted:"} {att.completedAt}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-gray-800/40">
                              <div className="flex items-center gap-1.5 text-xs font-extrabold text-gray-300 bg-gray-900/60 px-3 py-1.5 rounded-xl border border-gray-800/80 shrink-0 shadow-sm">
                                <FiClock size={13} className="text-gray-400 shrink-0" />
                                <span>{att.timeTaken} {isRTL ? "دقيقة" : "mins"}</span>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <span className={`text-lg font-black tracking-tight ${att.passed ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                                  {att.score}%
                                </span>

                                <span className={`text-xs font-black uppercase px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm ${
                                  att.passed
                                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400'
                                }`}>
                                  {att.passed ? <FiCheckCircle size={13} /> : <FiXCircle size={13} />}
                                  <span>{att.passed ? (isRTL ? 'ناجح' : 'PASSED') : (isRTL ? 'راسب' : 'FAILED')}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default TeacherExams;
