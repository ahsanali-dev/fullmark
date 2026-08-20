import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiGrid, 
  FiUsers, 
  FiBookOpen, 
  FiFileText, 
  FiUser, 
  FiPlus, 
  FiUploadCloud, 
  FiChevronRight, 
  FiChevronDown, 
  FiHelpCircle,
  FiX,
  FiCheck
} from 'react-icons/fi';
import { Formik, Form } from 'formik';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import DashboardLayout from '../../components/layout/DashboardLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import StatCard from '../../components/shared/StatCard';
import ModalWrapper from '../../components/shared/ModalWrapper';
import { QuestionSchema } from '../../schemas/questionSchema';
import { ExamSchema } from '../../schemas/examSchema';
import { useLanguage } from '../../context/LanguageContext';

import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchTeacherStats, 
  fetchTeacherSubjects, 
  fetchQuestions, 
  fetchExams,
  createQuestion,
  extractQuestionsFromPdf
} from '../../redux/slices/teacherSlice';
import { DashboardSkeleton } from '../../components/shared/SkeletonLoading';

// Schemas imported from src/schemas/

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, isRTL } = useLanguage();

  // Load from Redux
  const { subjects = [], questions = [], exams = [], stats = null, isLoading } = useSelector((state) => state.teacher);

  useEffect(() => {
    dispatch(fetchTeacherStats());
    dispatch(fetchTeacherSubjects());
    dispatch(fetchQuestions());
    dispatch(fetchExams());
  }, [dispatch]);

  // Update counts in subjects
  const subjectsWithCounts = subjects.map(sub => {
    const subId = sub._id || sub.id;
    return {
      ...sub,
      id: subId,
      title: sub.name || sub.title,
      questionsCount: sub.questionsCount ?? questions.filter(q => (q.subject?._id || q.subject || q.subjectId) === subId).length,
      examsCount: sub.examsCount ?? exams.filter(ex => (ex.subject?._id || ex.subject || ex.subjectId) === subId).length,
      studentsCount: sub.studentsCount ?? 0
    };
  });

  // Modal States
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [isUploadPDFOpen, setIsUploadPDFOpen] = useState(false);

  // Upload PDF State
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [selectedPdfSubject, setSelectedPdfSubject] = useState('');
  const [pdfFile, setPdfFile] = useState(null);

  const handleAddQuestion = (values, { setSubmitting, resetForm }) => {
    const optionMap = { A: 0, B: 1, C: 2, D: 3 };
    const correctIdx = optionMap[values.correctOption] ?? 0;
    
    toast.promise(
      dispatch(createQuestion({
        subjectId: values.subjectId,
        text: values.text,
        options: [values.optionA, values.optionB, values.optionC, values.optionD],
        correctOption: correctIdx,
      })).unwrap(),
      {
        loading: isRTL ? 'جاري إنشاء السؤال...' : 'Creating question...',
        success: () => {
          setIsAddQuestionOpen(false);
          resetForm();
          dispatch(fetchTeacherSubjects());
          dispatch(fetchQuestions());
          return isRTL ? 'تم إضافة السؤال بنجاح!' : 'Question added successfully!';
        },
        error: (err) => err || (isRTL ? 'فشل إضافة السؤال' : 'Failed to add question'),
      }
    );
  };

  const handleAddExam = (values, { resetForm }) => {
    if (!values.subjectId) {
      toast.error(isRTL ? 'الرجاء اختيار المادة' : 'Please select a subject');
      return;
    }
    setIsAddExamOpen(false);
    resetForm();
    navigate(`/teacher/subjects/${values.subjectId}/create-exam`);
  };

  const handlePdfUploadSubmit = async (e) => {
    e.preventDefault();
    if (!pdfFile) {
      toast.error(isRTL ? 'الرجاء اختيار ملف PDF أولاً' : 'Please select a PDF file first');
      return;
    }
    if (!selectedPdfSubject) {
      toast.error(isRTL ? 'الرجاء اختيار المادة' : 'Please select a subject');
      return;
    }

    setPdfUploading(true);
    setPdfProgress(10);

    const progressInterval = setInterval(() => {
      setPdfProgress(prev => (prev < 90 ? prev + 10 : prev));
    }, 300);

    const loadingToast = toast.loading(isRTL ? 'جاري استخراج الأسئلة من PDF...' : 'Extracting questions from PDF...');
    try {
      const res = await dispatch(extractQuestionsFromPdf({
        subjectId: selectedPdfSubject,
        pdfFile: pdfFile
      })).unwrap();

      clearInterval(progressInterval);
      setPdfProgress(100);
      
      toast.success(res.message || (isRTL ? 'تم رفع PDF واستخراج الأسئلة بنجاح!' : 'PDF uploaded and questions extracted successfully!'), { id: loadingToast });
      setPdfUploading(false);
      setIsUploadPDFOpen(false);
      setPdfFile(null);
      setSelectedPdfSubject('');
      dispatch(fetchQuestions());
      dispatch(fetchTeacherSubjects());
    } catch (err) {
      clearInterval(progressInterval);
      setPdfUploading(false);
      toast.error(err || (isRTL ? 'فشل استخراج الأسئلة من PDF' : 'Failed to extract questions from PDF'), { id: loadingToast });
    }
  };

  const isModalActive = isAddQuestionOpen || isAddExamOpen || isUploadPDFOpen;

  if (isLoading && subjects.length === 0) {
    return (
      <DashboardLayout
        role="teacher"
        activeTab="dashboard"
        title={t('teacher.dashboard.title')}
        subtitle={t('teacher.dashboard.subtitle')}
        isModalOpen={false}
      >
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role="teacher"
      activeTab="dashboard"
      title={t('teacher.dashboard.title')}
      subtitle={t('teacher.dashboard.subtitle')}
      isModalOpen={isModalActive}
    >
      <div className="flex flex-col gap-6 text-start p-4 sm:p-6 md:p-8 pb-32 lg:pb-12">
        
        {/* A. Core Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 shrink-0 animate-fade-in">
          {/* Subjects */}
          <div 
            onClick={() => navigate('/teacher/subjects')}
            className="p-3.5 sm:p-4 bg-[#0e101a]/90 border border-blue-500/15 rounded-3xl flex flex-col items-center justify-center text-center shadow-lg cursor-pointer hover:border-blue-500/40 transition-all hover:translate-y-[-2px] group"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.12)] mb-2.5 group-hover:scale-105 transition-transform">
              <FiBookOpen size={16} />
            </div>
            <span className="text-xl md:text-2xl font-extrabold text-white leading-none">{subjects.length}</span>
            <span className="text-xs sm:text-sm font-bold text-gray-400 tracking-wider mt-1 uppercase truncate max-w-full">{t('teacher.dashboard.subjects')}</span>
          </div>

          {/* Questions */}
          <div 
            onClick={() => navigate('/teacher/questions')}
            className="p-3.5 sm:p-4 bg-[#0e101a]/90 border border-blue-500/15 rounded-3xl flex flex-col items-center justify-center text-center shadow-lg cursor-pointer hover:border-blue-500/40 transition-all hover:translate-y-[-2px] group"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.12)] mb-2.5 group-hover:scale-105 transition-transform">
              <FiHelpCircle size={16} />
            </div>
            <span className="text-xl md:text-2xl font-extrabold text-white leading-none">{questions.length}</span>
            <span className="text-xs sm:text-sm font-bold text-gray-400 tracking-wider mt-1 uppercase truncate max-w-full">{t('teacher.dashboard.questions')}</span>
          </div>

          {/* Exams */}
          <div 
            onClick={() => navigate('/teacher/exams')}
            className="p-3.5 sm:p-4 bg-[#0e101a]/90 border border-blue-500/15 rounded-3xl flex flex-col items-center justify-center text-center shadow-lg cursor-pointer hover:border-blue-500/40 transition-all hover:translate-y-[-2px] group"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.12)] mb-2.5 group-hover:scale-105 transition-transform">
              <FiFileText size={16} />
            </div>
            <span className="text-xl md:text-2xl font-extrabold text-white leading-none">{exams.length}</span>
            <span className="text-xs sm:text-sm font-bold text-gray-400 tracking-wider mt-1 uppercase truncate max-w-full">{t('teacher.dashboard.exams')}</span>
          </div>

          {/* Students */}
          <div className="p-3.5 sm:p-4 bg-[#0e101a]/90 border border-yellow-500/15 rounded-3xl flex flex-col items-center justify-center text-center shadow-lg">
            <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.12)] mb-2.5">
              <FiUsers size={16} />
            </div>
            <span className="text-xl md:text-2xl font-extrabold text-white leading-none">
              {subjectsWithCounts.reduce((acc, curr) => acc + curr.studentsCount, 0)}
            </span>
            <span className="text-xs sm:text-sm font-bold text-gray-400 tracking-wider mt-1 uppercase truncate max-w-full">{t('teacher.dashboard.students')}</span>
          </div>
        </div>

        {/* B. Quick Actions */}
        <div className="flex flex-col gap-4 text-start animate-fade-in delay-100">
          <h3 className="text-lg md:text-xl font-bold tracking-wide text-white">{t('teacher.dashboard.quickActions')}</h3>
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <button 
              onClick={() => setIsUploadPDFOpen(true)}
              className="p-4 bg-[#0e101a] border border-gray-800 rounded-3xl flex flex-col items-center justify-center text-center gap-3 transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.3)] hover:bg-[#121324] hover:border-blue-500/20 group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 transition-transform duration-300 group-hover:scale-110">
                <FiUploadCloud size={18} />
              </div>
              <span className="text-base font-bold text-white tracking-wide">{t('teacher.dashboard.uploadPdf')}</span>
            </button>

            <button 
              onClick={() => navigate('/teacher/subjects/select/add-question')}
              className="p-4 bg-[#0e101a] border border-gray-800 rounded-3xl flex flex-col items-center justify-center text-center gap-3 transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.3)] hover:bg-[#121324] hover:border-blue-500/20 group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 transition-transform duration-300 group-hover:scale-110">
                <FiPlus size={18} />
              </div>
              <span className="text-base font-bold text-white tracking-wide">{t('teacher.dashboard.addQuestion')}</span>
            </button>

            <button 
              onClick={() => navigate('/teacher/subjects/select/create-exam')}
              className="p-4 bg-[#0e101a] border border-gray-800 rounded-3xl flex flex-col items-center justify-center text-center gap-3 transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.3)] hover:bg-[#121324] hover:border-blue-500/20 group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 transition-transform duration-300 group-hover:scale-110">
                <FiFileText size={18} />
              </div>
              <span className="text-base font-bold text-white tracking-wide">{t('teacher.dashboard.newExam')}</span>
            </button>
          </div>
        </div>

        {/* C. My Subjects Section */}
        <div className="flex flex-col gap-4 text-start animate-fade-in delay-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg md:text-xl font-bold tracking-wide text-white">{t('teacher.dashboard.mySubjects')}</h3>
            <button 
              onClick={() => navigate('/teacher/subjects')}
              className="text-blue-400 hover:text-blue-300 font-bold text-base transition-colors cursor-pointer"
            >
              {t('teacher.dashboard.manage')}
            </button>
          </div>

          {subjects.length === 0 ? (
            <div className="p-8 text-center bg-[#0c0d19]/40 border border-gray-800/80 rounded-3xl flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-gray-500">{t('teacher.dashboard.noSubjects')}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {subjectsWithCounts.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => navigate(`/teacher/subjects/${sub.id}`)}
                  className="p-5 bg-[#0e101a]/95 border border-gray-800/80 rounded-3xl shadow-lg flex flex-col gap-4 relative overflow-hidden transition-all duration-300 hover:bg-[#121424] hover:border-blue-500/35 hover:translate-y-[-2px] cursor-pointer group"
                >
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)] shrink-0">
                      <FiBookOpen size={20} />
                    </div>
                    <FiChevronRight size={18} className={`text-gray-500 mt-1 transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                  </div>
                  
                  <div className="text-start mt-2">
                    <h4 className="text-xl font-extrabold text-white leading-tight capitalize">{sub.title}</h4>
                    <p className="text-base text-gray-500 font-semibold mt-1 leading-normal line-clamp-2">{sub.description}</p>
                  </div>

                  <div className="flex items-center gap-4 text-base font-bold text-gray-500 mt-2 border-t border-gray-800/40 pt-3">
                    <span className="flex items-center gap-1.5">
                      <FiBookOpen size={14} className="text-blue-400" />
                      {sub.examsCount}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FiHelpCircle size={14} className="text-blue-400" />
                      {sub.questionsCount}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FiUsers size={14} className="text-yellow-500" />
                      {sub.studentsCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: ADD QUESTION */}
      <AnimatePresence>
        {isAddQuestionOpen && (
          <div 
            className="fixed inset-0 bg-[#020205]/70 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4 transition-all duration-300 animate-fade-in"
            onClick={() => setIsAddQuestionOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 100, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 100, opacity: 0 }}
              className="w-full sm:max-w-lg bg-[#0c0d19] border-t sm:border border-gray-800 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 pb-10 sm:pb-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden text-start"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-gray-800 rounded-full mx-auto mb-6 sm:hidden" />
              
              <button 
                onClick={() => setIsAddQuestionOpen(false)}
                className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} text-gray-500 hover:text-white transition-colors cursor-pointer`}
              >
                <FiX size={20} />
              </button>

              <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
                {isRTL ? "إضافة سؤال" : "Add Question"}
              </h3>
              <p className="text-xs text-gray-500 mb-6 font-semibold">{isRTL ? "إنشاء سؤال تقييم جديد يدوياً" : "Create a new assessment question manually"}</p>

              <Formik
                initialValues={{
                  subjectId: '',
                  text: '',
                  optionA: '',
                  optionB: '',
                  optionC: '',
                  optionD: '',
                  correctOption: ''
                }}
                validationSchema={QuestionSchema}
                onSubmit={handleAddQuestion}
              >
                {({ values, handleChange, handleBlur, isSubmitting }) => (
                  <Form className="flex flex-col gap-4 mt-2 max-h-[70vh] overflow-y-auto px-1">
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
                              <option key={s._id || s.id} value={s._id || s.id} className="bg-[#0b0c16] text-white">{s.title || s.name}</option>
                            ))}
                          </select>
                        </div>
                        <FiChevronDown className={`text-gray-400 absolute ${isRTL ? 'left-4' : 'right-4'} pointer-events-none`} />
                      </div>
                    </div>

                    <Input
                      name="text"
                      type="text"
                      label={isRTL ? "نص السؤال" : "Question Text"}
                      placeholder={isRTL ? "مثال: ما هو مجموع 2 + 2؟" : "e.g. What is the sum of 2 and 2?"}
                      icon={FiHelpCircle}
                      roleColor="teacher"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <Input name="optionA" type="text" label={isRTL ? "الخيار أ" : "Option A"} placeholder={isRTL ? "الخيار أ" : "Option A"} icon={FiPlus} roleColor="teacher" />
                      <Input name="optionB" type="text" label={isRTL ? "الخيار ب" : "Option B"} placeholder={isRTL ? "الخيار ب" : "Option B"} icon={FiPlus} roleColor="teacher" />
                      <Input name="optionC" type="text" label={isRTL ? "الخيار ج" : "Option C"} placeholder={isRTL ? "الخيار ج" : "Option C"} icon={FiPlus} roleColor="teacher" />
                      <Input name="optionD" type="text" label={isRTL ? "الخيار د" : "Option D"} placeholder={isRTL ? "الخيار د" : "Option D"} icon={FiPlus} roleColor="teacher" />
                    </div>

                    <div className="w-full flex flex-col relative">
                      <div className="w-full flex items-center relative rounded-2xl px-4 h-15 input-3d-teacher">
                        <div className="flex-1 relative h-full flex items-center">
                          <span className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1.5 pointer-events-none font-semibold text-[10px] text-blue-400 uppercase tracking-wider`}>
                            {isRTL ? "الخيار الصحيح" : "Correct Option"}
                          </span>
                          <select
                            name="correctOption"
                            value={values.correctOption}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="w-full bg-transparent border-none text-white text-sm md:text-base font-semibold pt-4 outline-none focus:ring-0 appearance-none cursor-pointer focus:outline-none"
                          >
                            <option value="" className="bg-[#0b0c16] text-gray-500">{isRTL ? "اختر الخيار الصحيح" : "Select Correct Option"}</option>
                            <option value="A" className="bg-[#0b0c16] text-white">{isRTL ? "الخيار أ" : "Option A"}</option>
                            <option value="B" className="bg-[#0b0c16] text-white">{isRTL ? "الخيار ب" : "Option B"}</option>
                            <option value="C" className="bg-[#0b0c16] text-white">{isRTL ? "الخيار ج" : "Option C"}</option>
                            <option value="D" className="bg-[#0b0c16] text-white">{isRTL ? "الخيار د" : "Option D"}</option>
                          </select>
                        </div>
                        <FiChevronDown className={`text-gray-400 absolute ${isRTL ? 'left-4' : 'right-4'} pointer-events-none`} />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      roleColor="teacher"
                      icon={FiCheck}
                    >
                      {isRTL ? "إنشاء السؤال" : "Create Question"}
                    </Button>
                  </Form>
                )}
              </Formik>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: ADD EXAM */}
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

              <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
                {isRTL ? "اختبار جديد" : "New Exam"}
              </h3>
              <p className="text-xs text-gray-500 mb-6 font-semibold">{isRTL ? "جدولة اختبار تقييم جديد للطلاب" : "Schedule a new student assessment exam"}</p>

              <Formik
                initialValues={{
                  title: '',
                  subjectId: '',
                  duration: '',
                  date: '',
                  questionsCount: ''
                }}
                validationSchema={ExamSchema}
                onSubmit={handleAddExam}
              >
                {({ values, handleChange, handleBlur, isSubmitting }) => (
                  <Form className="flex flex-col gap-4 mt-2">
                    <Input
                      name="title"
                      type="text"
                      label={isRTL ? "عنوان الاختبار" : "Exam Title"}
                      placeholder={isRTL ? "مثال: تقييم منتصف الفصل" : "e.g. Midterm assessment"}
                      icon={FiFileText}
                      roleColor="teacher"
                    />

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
                              <option key={s._id || s.id} value={s._id || s.id} className="bg-[#0b0c16] text-white">{s.title || s.name}</option>
                            ))}
                          </select>
                        </div>
                        <FiChevronDown className={`text-gray-400 absolute ${isRTL ? 'left-4' : 'right-4'} pointer-events-none`} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        name="duration"
                        type="number"
                        label={isRTL ? "المدة (بالدقائق)" : "Duration (mins)"}
                        placeholder="45"
                        icon={FiFileText}
                        roleColor="teacher"
                      />
                      <Input
                        name="questionsCount"
                        type="number"
                        label={isRTL ? "عدد الأسئلة" : "No. of Questions"}
                        placeholder="10"
                        icon={FiFileText}
                        roleColor="teacher"
                      />
                    </div>

                    <Input
                      name="date"
                      type="date"
                      label={isRTL ? "تاريخ الاختبار" : "Exam Date"}
                      placeholder="YYYY-MM-DD"
                      icon={FiFileText}
                      roleColor="teacher"
                    />

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      roleColor="teacher"
                      icon={FiCheck}
                    >
                      {isRTL ? "جدولة الاختبار" : "Schedule Exam"}
                    </Button>
                  </Form>
                )}
              </Formik>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: UPLOAD PDF */}
      <AnimatePresence>
        {isUploadPDFOpen && (
          <div 
            className="fixed inset-0 bg-[#020205]/70 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4 transition-all duration-300 animate-fade-in"
            onClick={() => {
              if (!pdfUploading) setIsUploadPDFOpen(false);
            }}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 100, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 100, opacity: 0 }}
              className="w-full sm:max-w-md bg-[#0c0d19] border-t sm:border border-gray-800 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 pb-10 sm:pb-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden text-start"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-gray-800 rounded-full mx-auto mb-6 sm:hidden" />
              
              {!pdfUploading && (
                <button 
                  onClick={() => setIsUploadPDFOpen(false)}
                  className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} text-gray-500 hover:text-white transition-colors cursor-pointer`}
                >
                  <FiX size={20} />
                </button>
              )}

              <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
                {isRTL ? "رفع PDF الأسئلة" : "Upload Question PDF"}
              </h3>
              <p className="text-xs text-gray-500 mb-6 font-semibold">{isRTL ? "رفع الفصول أو الأسئلة للتحليل الآلي بواسطة الذكاء الاصطناعي" : "Upload chapters or questions for automatic AI parsing"}</p>

              <form onSubmit={handlePdfUploadSubmit} className="flex flex-col gap-4 mt-2">
                <div className="w-full flex flex-col relative">
                  <div className="w-full flex items-center relative rounded-2xl px-4 h-15 input-3d-teacher">
                    <div className="flex-1 relative h-full flex items-center">
                      <span className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1.5 pointer-events-none font-semibold text-[10px] text-blue-400 uppercase tracking-wider`}>
                        {isRTL ? "المادة المستهدفة" : "Target Subject"}
                      </span>
                      <select
                        value={selectedPdfSubject}
                        onChange={(e) => setSelectedPdfSubject(e.target.value)}
                        disabled={pdfUploading}
                        className="w-full bg-transparent border-none text-white text-sm md:text-base font-semibold pt-4 outline-none focus:ring-0 appearance-none cursor-pointer focus:outline-none disabled:opacity-55"
                      >
                        <option value="" className="bg-[#0b0c16] text-gray-500">{isRTL ? "اختر المادة" : "Select Subject"}</option>
                        {subjects.map(s => (
                          <option key={s._id || s.id} value={s._id || s.id} className="bg-[#0b0c16] text-white">{s.title || s.name}</option>
                        ))}
                      </select>
                    </div>
                    <FiChevronDown className={`text-gray-400 absolute ${isRTL ? 'left-4' : 'right-4'} pointer-events-none`} />
                  </div>
                </div>

                <div className="w-full flex flex-col">
                  {pdfUploading ? (
                    <div className="border border-dashed border-blue-500/35 bg-blue-950/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 animate-bounce">
                        <FiUploadCloud size={22} />
                      </div>
                      <span className="text-sm font-bold text-white">{isRTL ? "جاري استخراج الأسئلة من PDF..." : "Extracting Questions from PDF..."}</span>
                      
                      <div className="w-full bg-gray-800 rounded-full h-2 mt-2 max-w-[200px]">
                        <div 
                          className="bg-gradient-to-r from-blue-600 to-indigo-500 h-2 rounded-full transition-all duration-150" 
                          style={{ width: `${pdfProgress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-gray-500">{pdfProgress}% {isRTL ? "مكتمل" : "completed"}</span>
                    </div>
                  ) : (
                    <label className="border border-dashed border-gray-800 hover:border-blue-500/35 bg-[#0e101a]/50 hover:bg-[#111326]/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all">
                      <input 
                        type="file" 
                        accept=".pdf" 
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setPdfFile(e.target.files[0]);
                            toast.success(`${isRTL ? 'الملف المختار:' : 'Selected file:'} ${e.target.files[0].name}`);
                          }
                        }}
                      />
                      <FiUploadCloud size={28} className="text-gray-500 mb-1" />
                      <span className="text-sm font-bold text-white leading-none">
                        {pdfFile ? pdfFile.name : (isRTL ? "اختر ملف PDF" : "Choose PDF File")}
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium">{isRTL ? "صيغ PDF حتى 15 ميجابايت" : "PDF formats up to 15MB"}</span>
                    </label>
                  )}
                </div>

                {!pdfUploading && (
                  <Button
                    type="submit"
                    roleColor="teacher"
                    icon={FiUploadCloud}
                    disabled={!pdfFile || !selectedPdfSubject}
                  >
                    {isRTL ? "بدء تحليل PDF" : "Start Parsing PDF"}
                  </Button>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
