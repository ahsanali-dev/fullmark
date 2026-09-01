import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FiChevronLeft,
  FiUploadCloud,
  FiBookOpen,
  FiChevronDown,
  FiCheck,
  FiImage,
  FiEdit3,
  FiFileText,
  FiTrash2,
  FiPlus,
  FiZap,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiMaximize2,
  FiX,
  FiEye
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';

import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  fetchTeacherSubjects,
  extractQuestionsFromPdf,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  uploadQuestionImage,
  fetchQuestions
} from '../../redux/slices/teacherSlice';
import { getImageUrl } from '../../utils/imageUrl';
import { useLanguage } from '../../context/LanguageContext';

const TeacherPdfUpload = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef(null);
  const { t, isRTL } = useLanguage();

  const urlSubjectId = searchParams.get('subject');
  const { subjects = [], isLoading: isSubjectsLoading } = useSelector((state) => state.teacher);

  // Stepper state: 1 = Upload, 2 = Processing, 3 = Review, 4 = Done
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 Form state
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [pdfFile, setPdfFile] = useState(null);

  // Step 2 Processing state
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState(isRTL ? 'جاري رفع ملف PDF...' : 'Uploading PDF...');
  const [completedChecklist, setCompletedChecklist] = useState({
    uploading: false,
    extracting: false,
    identifying: false
  });

  // Step 3 Review state
  const [extractedQuestions, setExtractedQuestions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [previewModalImage, setPreviewModalImage] = useState(null);
  const [uploadingTarget, setUploadingTarget] = useState(null); // { qIdx, optIdx: number | null }

  useEffect(() => {
    dispatch(fetchTeacherSubjects());
  }, [dispatch]);

  useEffect(() => {
    if (subjects.length > 0 && !selectedSubjectId) {
      if (urlSubjectId && subjects.some(s => (s._id || s.id) === urlSubjectId)) {
        setSelectedSubjectId(urlSubjectId);
      } else {
        setSelectedSubjectId(subjects[0]._id || subjects[0].id);
      }
    }
  }, [subjects, urlSubjectId, selectedSubjectId]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      toast.error(isRTL ? 'يسمح بملفات PDF فقط' : 'Only PDF files are allowed');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error(isRTL ? 'يجب أن يكون حجم الملف أقل من 50 ميغابايت' : 'File size must be less than 50MB');
      return;
    }

    setPdfFile(file);
    toast.success(isRTL ? `تم تحديد ${file.name}` : `Selected ${file.name}`);
  };

  const handleStartExtraction = async () => {
    if (!selectedSubjectId) {
      toast.error(isRTL ? 'يرجى تحديد مادة أولاً' : 'Please select a subject first');
      return;
    }
    if (!pdfFile) {
      toast.error(isRTL ? 'يرجى تحديد ملف PDF' : 'Please select a PDF file');
      return;
    }

    // Move to step 2: Processing
    setCurrentStep(2);
    setProcessingProgress(15);
    setProcessingStatus(isRTL ? 'جاري رفع ملف PDF...' : 'Uploading PDF...');
    setCompletedChecklist({ uploading: false, extracting: false, identifying: false });

    // Simulate progressive processing feedback while backend extraction API runs
    const timer1 = setTimeout(() => {
      setProcessingProgress(45);
      setCompletedChecklist(prev => ({ ...prev, uploading: true }));
      setProcessingStatus(isRTL ? 'جاري استخراج المحتوى النصي...' : 'Extracting text content...');
    }, 1000);

    const timer2 = setTimeout(() => {
      setProcessingProgress(75);
      setCompletedChecklist(prev => ({ ...prev, uploading: true, extracting: true }));
      setProcessingStatus(isRTL ? 'جاري تحديد الأسئلة والخيارات والرسوم بالذكاء الاصطناعي...' : 'Identifying questions, options & diagrams with AI...');
    }, 2200);

    try {
      const result = await dispatch(extractQuestionsFromPdf({
        subjectId: selectedSubjectId,
        pdfFile
      })).unwrap();

      clearTimeout(timer1);
      clearTimeout(timer2);

      setProcessingProgress(100);
      setCompletedChecklist({ uploading: true, extracting: true, identifying: true });
      setProcessingStatus(isRTL ? 'مراجعة الذكاء الاصطناعي مكتملة ✓' : 'AI review complete ✓');

      // Normalize extracted questions array and preserve images/diagrams/options
      const rawList = Array.isArray(result) ? result : (result?.questions || []);
      const formatted = rawList.map((q, idx) => {
        const questionImg = q.image || (q.diagram && q.diagram.url ? q.diagram.url : null) || null;
        return {
          _tempId: q._id || `ext-${Date.now()}-${idx}`,
          _id: q._id || null,
          text: q.text || q.question || `${isRTL ? 'سؤال مستخرج' : 'Extracted Question'} ${idx + 1}`,
          options: Array.isArray(q.options) && q.options.length >= 4 
            ? q.options 
            : [
                q.options?.[0] || (isRTL ? 'الخيار أ' : 'Option A'),
                q.options?.[1] || (isRTL ? 'الخيار ب' : 'Option B'),
                q.options?.[2] || (isRTL ? 'الخيار ج' : 'Option C'),
                q.options?.[3] || (isRTL ? 'الخيار د' : 'Option D')
              ],
          correctOption: typeof q.correctOption === 'number' ? q.correctOption : 0,
          difficulty: (q.difficulty || 'medium').toLowerCase(),
          marks: q.marks || 1,
          explanation: q.explanation || '',
          image: questionImg,
          diagram: q.diagram || null,
          optionImages: Array.isArray(q.optionImages) ? q.optionImages : []
        };
      });

      setExtractedQuestions(formatted);

      // Auto advance to Step 3 Review after brief pause
      setTimeout(() => {
        setCurrentStep(3);
      }, 1200);
    } catch (err) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      toast.error(err || (isRTL ? 'فشل استخراج الأسئلة من ملف PDF' : 'Failed to extract questions from PDF'));
      setCurrentStep(1);
    }
  };

  const handleUpdateQuestion = (index, field, value) => {
    setExtractedQuestions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleUpdateOption = (qIdx, optIdx, val) => {
    setExtractedQuestions(prev => {
      const copy = [...prev];
      const opts = [...copy[qIdx].options];
      opts[optIdx] = val;
      copy[qIdx] = { ...copy[qIdx], options: opts };
      return copy;
    });
  };

  const handleQuestionImageUpload = async (qIdx, file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error(isRTL ? 'الرجاء اختيار ملف صورة صالح' : 'Please select a valid image file');
      return;
    }
    const toastId = toast.loading(isRTL ? 'جاري رفع صورة السؤال...' : 'Uploading question image...');
    setUploadingTarget({ qIdx, optIdx: null });
    try {
      const url = await dispatch(uploadQuestionImage(file)).unwrap();
      handleUpdateQuestion(qIdx, 'image', url);
      toast.dismiss(toastId);
      toast.success(isRTL ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully');
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err || (isRTL ? 'فشل رفع الصورة' : 'Failed to upload image'));
    } finally {
      setUploadingTarget(null);
    }
  };

  const handleOptionImageUpload = async (qIdx, optIdx, file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error(isRTL ? 'الرجاء اختيار ملف صورة صالح' : 'Please select a valid image file');
      return;
    }
    const toastId = toast.loading(isRTL ? 'جاري رفع صورة الخيار...' : 'Uploading option image...');
    setUploadingTarget({ qIdx, optIdx });
    try {
      const url = await dispatch(uploadQuestionImage(file)).unwrap();
      setExtractedQuestions(prev => {
        const copy = [...prev];
        const optImages = [...(copy[qIdx].optionImages || ['', '', '', ''])];
        optImages[optIdx] = url;
        copy[qIdx] = { ...copy[qIdx], optionImages: optImages };
        return copy;
      });
      toast.dismiss(toastId);
      toast.success(isRTL ? 'تم رفع صورة الخيار بنجاح' : 'Option image uploaded');
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err || (isRTL ? 'فشل رفع صورة الخيار' : 'Failed to upload option image'));
    } finally {
      setUploadingTarget(null);
    }
  };

  const handleRemoveQuestion = async (qIdx) => {
    const q = extractedQuestions[qIdx];
    if (q?._id) {
      try {
        await dispatch(deleteQuestion(q._id)).unwrap();
      } catch (err) {
        console.error('Error removing question from database:', err);
      }
    }
    setExtractedQuestions(prev => prev.filter((_, idx) => idx !== qIdx));
    toast.success(isRTL ? 'تمت إزالة السؤال' : 'Question removed');
  };

  const handleAddBlankQuestion = () => {
    setExtractedQuestions(prev => [
      ...prev,
      {
        _tempId: `ext-new-${Date.now()}`,
        _id: null,
        text: isRTL ? 'نص السؤال الجديد' : 'New Question Text',
        options: [
          isRTL ? 'الخيار أ' : 'Option A',
          isRTL ? 'الخيار ب' : 'Option B',
          isRTL ? 'الخيار ج' : 'Option C',
          isRTL ? 'الخيار د' : 'Option D'
        ],
        correctOption: 0,
        difficulty: 'medium',
        marks: 1,
        explanation: '',
        image: null,
        optionImages: []
      }
    ]);
  };

  const handleSaveAllQuestions = async () => {
    if (extractedQuestions.length === 0) {
      toast.error(isRTL ? 'لا توجد أسئلة للحفظ' : 'No questions to save');
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading(isRTL ? `جاري حفظ ${extractedQuestions.length} سؤال...` : `Saving ${extractedQuestions.length} questions...`);

    try {
      for (const q of extractedQuestions) {
        if (q._id) {
          await dispatch(updateQuestion({
            id: q._id,
            questionData: {
              subject: selectedSubjectId,
              text: q.text,
              options: q.options,
              correctOption: q.correctOption,
              difficulty: q.difficulty,
              marks: q.marks,
              explanation: q.explanation,
              image: q.image || null,
              optionImages: q.optionImages || []
            }
          })).unwrap();
        } else {
          await dispatch(createQuestion({
            subjectId: selectedSubjectId,
            text: q.text,
            options: q.options,
            correctOption: q.correctOption,
            difficulty: q.difficulty,
            marks: q.marks,
            explanation: q.explanation,
            image: q.image || null,
            optionImages: q.optionImages || []
          })).unwrap();
        }
      }

      toast.dismiss(toastId);
      toast.success(isRTL ? `تم حفظ ${extractedQuestions.length} سؤال بنجاح!` : `Successfully saved ${extractedQuestions.length} questions!`);
      dispatch(fetchQuestions());
      setCurrentStep(4);
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err || (isRTL ? 'فشل حفظ الأسئلة' : 'Failed to save questions'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemovePdf = (e) => {
    if (e) e.stopPropagation();
    setPdfFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success(isRTL ? 'تمت إزالة ملف PDF' : 'PDF file removed');
  };

  const selectedSubject = subjects.find(s => (s._id || s.id) === selectedSubjectId);

  return (
    <DashboardLayout
      role="teacher"
      activeTab="questions"
      title={t('teacher.pdfUpload.title')}
      subtitle={t('teacher.pdfUpload.subtitle')}
    >
      <div className="w-full max-w-4xl mx-auto p-4 md:p-8 pb-32 flex flex-col gap-6 text-start animate-fade-in">
        
        {/* Top Header Card with Back Button and AI Badge */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => navigate('/teacher/questions')}
            className="w-12 h-12 rounded-2xl bg-[#0e101a] border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-md shrink-0"
          >
            <FiChevronLeft size={22} className={isRTL ? 'rotate-180' : ''} />
          </button>

          <div className="flex-1 text-start">
            <h2 className="text-xl md:text-2xl font-black text-white leading-tight">
              {isRTL ? "رفع أسئلة PDF" : "PDF Question Upload"}
            </h2>
            <p className="text-xs md:text-sm text-gray-400 font-semibold mt-0.5">
              {isRTL ? "استخراج الأسئلة بالذكاء الاصطناعي" : "AI-powered question extraction"}
            </p>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-black flex items-center gap-1.5 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <FiZap size={14} className="text-blue-400" />
            <span>{isRTL ? "ذكاء اصطناعي" : "AI"}</span>
          </div>
        </div>

        {/* Stepper Bar (4 Steps) */}
        <div className="w-full bg-[#0e101a] border border-gray-800/80 rounded-3xl p-4 md:p-6 shadow-xl">
          <div className="relative flex items-center justify-between w-full max-w-lg mx-auto">
            {/* Step Line Connector */}
            <div className="absolute left-6 right-6 top-5 h-0.5 bg-gray-800 -z-0">
              <div 
                className="h-full bg-blue-500 transition-all duration-500" 
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              />
            </div>

            {/* Step Nodes */}
            {[
              { step: 1, label: isRTL ? 'رفع' : 'Upload' },
              { step: 2, label: isRTL ? 'معالجة' : 'Processing' },
              { step: 3, label: isRTL ? 'مراجعة' : 'Review' },
              { step: 4, label: isRTL ? 'إنهاء' : 'Done' }
            ].map(({ step, label }) => {
              const isCompleted = currentStep > step;
              const isActive = currentStep === step;

              return (
                <div key={step} className="flex flex-col items-center gap-1.5 z-10">
                  <div
                    className={`w-10 h-10 md:w-11 md:h-11 rounded-full font-black text-sm md:text-base flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? 'bg-emerald-500 text-gray-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                        : isActive
                        ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] ring-4 ring-blue-500/20'
                        : 'bg-[#151726] border border-gray-800 text-gray-500'
                    }`}
                  >
                    {isCompleted ? <FiCheck size={20} className="stroke-[3]" /> : step}
                  </div>
                  <span
                    className={`text-xs font-extrabold transition-colors ${
                      isActive
                        ? 'text-blue-400'
                        : isCompleted
                        ? 'text-emerald-400'
                        : 'text-gray-500'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 1: UPLOAD & SUBJECT SELECTION */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex flex-col gap-6 text-start"
          >
            {/* A. Select Subject */}
            <div className="flex flex-col gap-2">
              <label className="text-base font-extrabold text-white">{isRTL ? "اختر المادة" : "Select Subject"}</label>
              <div className="relative">
                <FiBookOpen className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-blue-400`} size={18} />
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className={`w-full ${isRTL ? 'pr-12 pl-10' : 'pl-12 pr-10'} py-4 bg-[#0e101a] border border-gray-800 hover:border-gray-700 rounded-2xl text-white text-base font-bold outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-lg transition-all text-start`}
                >
                  {isSubjectsLoading ? (
                    <option value="">{isRTL ? "جاري تحميل المواد..." : "Loading subjects..."}</option>
                  ) : subjects.length === 0 ? (
                    <option value="">{isRTL ? "لم يتم العثور على مواد" : "No subjects found"}</option>
                  ) : (
                    subjects.map(s => (
                      <option key={s._id || s.id} value={s._id || s.id}>
                        {s.title || s.name}
                      </option>
                    ))
                  )}
                </select>
                <FiChevronDown className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none`} size={20} />
              </div>
            </div>

            {/* B. Drag & Drop / File Upload Card */}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileSelect}
            />

            {pdfFile ? (
              <div className="p-6 md:p-8 bg-[#0c0e1a] border-2 border-blue-500/50 rounded-[2.5rem] shadow-[0_0_30px_rgba(37,99,235,0.15)] flex flex-col items-center justify-center text-center relative overflow-hidden group">
                {/* Top Corner Quick Remove Button */}
                <button
                  type="button"
                  onClick={handleRemovePdf}
                  className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} w-9 h-9 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center transition-all cursor-pointer shadow-sm`}
                  title={isRTL ? "إزالة ملف PDF" : "Remove PDF file"}
                >
                  <FiTrash2 size={16} />
                </button>

                {/* PDF Document Icon Box */}
                <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-3 shadow-[0_0_25px_rgba(59,130,246,0.3)]">
                  <FiFileText size={38} />
                  <span className={`absolute -bottom-1 ${isRTL ? '-left-1' : '-right-1'} px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md`}>
                    PDF
                  </span>
                </div>

                {/* File Details */}
                <h3 className="text-lg md:text-xl font-black text-white max-w-xs md:max-w-md truncate">
                  {pdfFile.name}
                </h3>
                <span className="text-xs text-gray-400 font-bold mt-1">
                  {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB • {isRTL ? "جاهز للاستخراج بالذكاء الاصطناعي" : "Ready for AI Extraction"}
                </span>

                {/* Action Buttons: Change PDF & Remove PDF */}
                <div className="flex items-center gap-3 mt-5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-400 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <FiRefreshCw size={14} />
                    <span>{isRTL ? "تغيير PDF" : "Change PDF"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRemovePdf}
                    className="px-5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <FiTrash2 size={14} />
                    <span>{isRTL ? "إزالة PDF" : "Remove PDF"}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 md:p-12 bg-[#0e101a] border-2 border-dashed border-gray-800 hover:border-blue-500/40 rounded-[2.5rem] shadow-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all group relative overflow-hidden"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 shadow-[0_0_30px_rgba(59,130,246,0.25)] group-hover:scale-105 transition-transform">
                  <FiFileText size={36} />
                </div>

                <h3 className="text-xl md:text-2xl font-black text-white">{isRTL ? "رفع ملف PDF" : "Upload PDF File"}</h3>
                <p className="text-sm font-semibold text-gray-400 mt-1">{isRTL ? "انقر لتصفح ملف PDF الخاص بك" : "Tap to browse your PDF"}</p>
                <button
                  type="button"
                  className="mt-5 px-6 py-3 rounded-2xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-400 font-black transition-all cursor-pointer"
                >
                  {isRTL ? "تصفح الملفات" : "Browse Files"}
                </button>
              </div>
            )}

            {/* C. Feature Highlight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-start">
              <div className="p-5 bg-[#0e101a] border border-gray-800/80 rounded-2xl flex items-start gap-4 shadow-lg">
                <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <FiZap size={20} />
                </div>
                <div className="text-start">
                  <h4 className="text-base font-bold text-white leading-tight">{isRTL ? "استخراج بالذكاء الاصطناعي" : "AI Extraction"}</h4>
                  <p className="text-xs font-semibold text-gray-400 mt-1 leading-snug">
                    {isRTL ? "يكتشف الأسئلة والخيارات والإجابات تلقائيًا" : "Automatically detects questions, options and answers"}
                  </p>
                </div>
              </div>

              <div className="p-5 bg-[#0e101a] border border-gray-800/80 rounded-2xl flex items-start gap-4 shadow-lg">
                <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <FiImage size={20} />
                </div>
                <div className="text-start">
                  <h4 className="text-base font-bold text-white leading-tight">{isRTL ? "دعم الصور" : "Image Support"}</h4>
                  <p className="text-xs font-semibold text-gray-400 mt-1 leading-snug">
                    {isRTL ? "يستخرج الصور والرسوم التوضيحية المضمنة في PDF" : "Extracts embedded images and diagrams from PDF"}
                  </p>
                </div>
              </div>

              <div className="p-5 bg-[#0e101a] border border-gray-800/80 rounded-2xl flex items-start gap-4 shadow-lg">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <FiEdit3 size={20} />
                </div>
                <div className="text-start">
                  <h4 className="text-base font-bold text-white leading-tight">{isRTL ? "المراجعة أولاً" : "Review First"}</h4>
                  <p className="text-xs font-semibold text-gray-400 mt-1 leading-snug">
                    {isRTL ? "يمكنك المراجعة والموافقة قبل النشر" : "You review and approve before publishing"}
                  </p>
                </div>
              </div>
            </div>

            {/* D. Main Action Button */}
            <button
              onClick={handleStartExtraction}
              disabled={!pdfFile || !selectedSubjectId}
              className="w-full py-4 md:py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-2xl font-black text-lg shadow-[0_4px_25px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
            >
              <FiZap size={20} />
              <span>{isRTL ? "استخراج الأسئلة بالذكاء الاصطناعي" : "Extract Questions with AI"}</span>
            </button>
          </motion.div>
        )}

        {/* STEP 2: PROCESSING (AI ANALYZING PDF) */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center p-8 md:p-12 bg-[#0e101a] border border-gray-800 rounded-[2.5rem] shadow-2xl text-center gap-6 my-4"
          >
            {/* Animated Glowing AI Circle */}
            <div className="relative">
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-blue-600/20 border-2 border-blue-500/40 flex items-center justify-center text-blue-400 shadow-[0_0_50px_rgba(59,130,246,0.35)] animate-pulse">
                <FiZap size={56} className="text-blue-400 animate-bounce" />
              </div>
            </div>

            <div>
              <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                {isRTL ? "الذكاء الاصطناعي يحلل ملف PDF الخاص بك" : "AI is Analyzing Your PDF"}
              </h3>
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-600/15 border border-blue-500/30 text-blue-400 text-xs font-black mt-3">
                <span>{isRTL ? `المادة: ${selectedSubject?.title || selectedSubject?.name || 'المادة المحددة'}` : `Subject: ${selectedSubject?.title || selectedSubject?.name || 'Selected Subject'}`}</span>
              </div>
              <p className="text-sm font-extrabold text-gray-400 mt-2">
                {processingStatus}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-md bg-gray-900 rounded-full h-3 p-0.5 border border-gray-800 relative overflow-hidden mt-2">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                style={{ width: `${processingProgress}%` }}
              />
            </div>
            <span className="text-xs font-black text-blue-400 tracking-wider -mt-4">
              {isRTL ? `جاري المعالجة... ${processingProgress}%` : `Processing... ${processingProgress}%`}
            </span>

            {/* Checklist */}
            <div className="w-full max-w-md flex flex-col gap-3 mt-4 text-start">
              <div className={`p-4 rounded-2xl border flex items-center gap-3 transition-colors ${
                completedChecklist.uploading 
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400' 
                  : 'bg-[#121424] border-gray-800 text-gray-400'
              }`}>
                <FiCheckCircle className={completedChecklist.uploading ? 'text-emerald-400' : 'text-gray-600'} size={20} />
                <span className="text-sm font-bold">{isRTL ? "جاري رفع ملف PDF..." : "Uploading PDF..."}</span>
              </div>

              <div className={`p-4 rounded-2xl border flex items-center gap-3 transition-colors ${
                completedChecklist.extracting 
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400' 
                  : 'bg-[#121424] border-gray-800 text-gray-400'
              }`}>
                <FiCheckCircle className={completedChecklist.extracting ? 'text-emerald-400' : 'text-gray-600'} size={20} />
                <span className="text-sm font-bold">{isRTL ? "جاري استخراج المحتوى النصي..." : "Extracting text content..."}</span>
              </div>

              <div className={`p-4 rounded-2xl border flex items-center gap-3 transition-colors ${
                completedChecklist.identifying 
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400' 
                  : 'bg-[#121424] border-gray-800 text-gray-400'
              }`}>
                <FiCheckCircle className={completedChecklist.identifying ? 'text-emerald-400' : 'text-gray-600'} size={20} />
                <span className="text-sm font-bold">{isRTL ? "جاري تحديد الأسئلة..." : "Identifying questions..."}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: REVIEW EXTRACTED QUESTIONS */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex flex-col gap-6 text-start"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-800/60">
              <div className="text-start">
                <h3 className="text-xl md:text-2xl font-black text-white">
                  {isRTL ? `مراجعة الأسئلة المستخرجة (${extractedQuestions.length})` : `Review Extracted Questions (${extractedQuestions.length})`}
                </h3>
                <p className="text-xs md:text-sm font-semibold text-gray-400 mt-0.5">
                  {isRTL ? "راجع وعدّل قبل الحفظ في بنك الأسئلة" : "Review and edit before saving to your question bank"}
                </p>
              </div>

              <button
                onClick={handleAddBlankQuestion}
                className="px-4 py-2.5 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-400 text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer self-start md:self-auto"
              >
                <FiPlus size={16} />
                <span>{isRTL ? "إضافة سؤال" : "Add Question"}</span>
              </button>
            </div>

            {/* Questions List */}
            {extractedQuestions.length === 0 ? (
              <div className="p-12 text-center bg-[#0e101a] border border-gray-800 rounded-3xl">
                <p className="text-gray-400 font-bold">{isRTL ? "لم يتم العثور على أسئلة في هذا الملف." : "No questions found in this PDF."}</p>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm"
                >
                  {isRTL ? "رفع ملف آخر" : "Upload Another File"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {extractedQuestions.map((q, qIdx) => (
                  <div
                    key={q._tempId || qIdx}
                    className="p-6 bg-[#0e101a] border border-gray-800/90 rounded-[2rem] shadow-xl flex flex-col gap-5 relative text-start"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3.5 py-1 rounded-full bg-blue-600/20 text-blue-400 text-xs font-black">
                          {isRTL ? `سؤال #${qIdx + 1}` : `Question #${qIdx + 1}`}
                        </span>

                        {q.image && (
                          <span className="px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-xs font-black flex items-center gap-1.5 shadow-sm">
                            <FiImage size={13} />
                            <span>{isRTL ? "مرفق رسم / صورة" : "Diagram / Image Included"}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Add / Replace Image Button */}
                        <label
                          className="p-2 text-gray-400 hover:text-blue-400 rounded-xl hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                          title={isRTL ? (q.image ? "تغيير الصورة" : "إرفاق صورة") : (q.image ? "Change Image" : "Attach Image")}
                        >
                          <FiImage size={16} />
                          <span className="hidden sm:inline">{q.image ? (isRTL ? "تغيير صورة" : "Change Image") : (isRTL ? "إضافة صورة" : "Add Image")}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleQuestionImageUpload(qIdx, e.target.files[0]);
                                e.target.value = '';
                              }
                            }}
                          />
                        </label>

                        <button
                          onClick={() => handleRemoveQuestion(qIdx)}
                          className="p-2 text-gray-500 hover:text-red-400 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                          title={isRTL ? "إزالة السؤال" : "Remove question"}
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Question Text Input */}
                    <div className="flex flex-col gap-1.5 text-start">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
                        {isRTL ? "نص السؤال" : "Question Statement"}
                      </label>
                      <textarea
                        rows={2}
                        value={q.text}
                        onChange={(e) => handleUpdateQuestion(qIdx, 'text', e.target.value)}
                        className="w-full p-4 bg-[#121424] border border-gray-800 rounded-2xl text-white text-base font-bold outline-none focus:border-blue-500 resize-none text-start"
                      />
                    </div>

                    {/* Extracted / Attached Question Image Display */}
                    {q.image && (
                      <div className="flex flex-col gap-2.5 p-3.5 bg-[#0b0d18] border border-blue-500/30 rounded-2xl relative shadow-inner">
                        <div className="flex items-center justify-between px-1">
                          <div className="flex items-center gap-1.5 text-xs font-black text-blue-400">
                            <FiImage size={14} className="text-blue-400" />
                            <span>{isRTL ? "الرسم التوضيحي / الصورة المستخرجة بالسؤال:" : "Extracted Question Diagram / Image:"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setPreviewModalImage(getImageUrl(q.image))}
                              className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                              title={isRTL ? "معاينة وتكبير الصورة" : "Preview & Enlarge Image"}
                            >
                              <FiMaximize2 size={13} />
                              <span>{isRTL ? "تكبير" : "Preview"}</span>
                            </button>
                            <label
                              className="p-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
                              title={isRTL ? "استبدال الصورة" : "Replace Image"}
                            >
                              <FiRefreshCw size={13} />
                              <span className="hidden sm:inline">{isRTL ? "استبدال" : "Replace"}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    handleQuestionImageUpload(qIdx, e.target.files[0]);
                                    e.target.value = '';
                                  }
                                }}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                handleUpdateQuestion(qIdx, 'image', null);
                                toast.success(isRTL ? 'تمت إزالة صورة السؤال' : 'Question image removed');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                              title={isRTL ? "إزالة الصورة" : "Remove Image"}
                            >
                              <FiX size={14} className="stroke-[2.5]" />
                              <span>{isRTL ? "إزالة الصورة" : "Remove"}</span>
                            </button>
                          </div>
                        </div>

                        {/* Image Preview Canvas */}
                        <div
                          onClick={() => setPreviewModalImage(getImageUrl(q.image))}
                          className="w-full max-h-72 sm:max-h-84 rounded-xl overflow-hidden bg-black/60 border border-gray-800/90 flex items-center justify-center p-3 cursor-pointer hover:border-blue-500/50 transition-all group/img relative"
                        >
                          <img
                            src={getImageUrl(q.image)}
                            alt={`Question ${qIdx + 1} Visual`}
                            className="max-h-64 sm:max-h-78 w-auto max-w-full object-contain rounded-lg shadow-md group-hover/img:scale-[1.01] transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/35 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity pointer-events-none">
                            <span className="px-3 py-1.5 rounded-xl bg-black/85 text-white text-xs font-black flex items-center gap-1.5 shadow-2xl border border-white/20">
                              <FiMaximize2 size={13} className="text-blue-400" />
                              <span>{isRTL ? "انقر للمعاينة بالحجم الكامل" : "Click for full resolution"}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-start">
                      {['A', 'B', 'C', 'D'].map((optLabel, optIdx) => {
                        const isCorrect = q.correctOption === optIdx;
                        const optImg = q.optionImages?.[optIdx];
                        return (
                          <div
                            key={optLabel}
                            className={`p-3.5 rounded-2xl border flex flex-col gap-2 transition-all ${
                              isCorrect 
                                ? 'bg-emerald-950/20 border-emerald-500/50 text-white' 
                                : 'bg-[#121424] border-gray-800/80 text-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-3 w-full">
                              <button
                                type="button"
                                onClick={() => handleUpdateQuestion(qIdx, 'correctOption', optIdx)}
                                className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center shrink-0 transition-transform ${
                                  isCorrect
                                    ? 'bg-emerald-500 text-gray-950 shadow-[0_0_10px_rgba(16,185,129,0.5)] scale-105'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                                title={isRTL ? "تحديد كإجابة صحيحة" : "Set as Correct Answer"}
                              >
                                {optLabel}
                              </button>
                              <input
                                type="text"
                                value={q.options[optIdx] || ''}
                                onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                                className="w-full bg-transparent border-none text-white text-sm font-semibold outline-none focus:ring-0 text-start"
                                placeholder={isRTL ? `الخيار ${optLabel}` : `Option ${optLabel}`}
                              />
                              <label
                                className="p-1.5 text-gray-400 hover:text-blue-400 rounded-lg hover:bg-white/5 transition-colors cursor-pointer shrink-0"
                                title={isRTL ? "إرفاق صورة للخيار" : "Attach image to option"}
                              >
                                <FiImage size={14} />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                      handleOptionImageUpload(qIdx, optIdx, e.target.files[0]);
                                      e.target.value = '';
                                    }
                                  }}
                                />
                              </label>
                            </div>

                            {/* Option image if present */}
                            {optImg && (
                              <div className="relative group/optimg rounded-xl overflow-hidden border border-gray-800 bg-black/40 p-1.5 max-h-28 flex items-center justify-center">
                                <img
                                  src={getImageUrl(optImg)}
                                  alt={`Option ${optLabel} Visual`}
                                  className="max-h-24 object-contain rounded-lg cursor-pointer"
                                  onClick={() => setPreviewModalImage(getImageUrl(optImg))}
                                />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExtractedQuestions(prev => {
                                      const copy = [...prev];
                                      const optImages = [...(copy[qIdx].optionImages || [])];
                                      optImages[optIdx] = '';
                                      copy[qIdx] = { ...copy[qIdx], optionImages: optImages };
                                      return copy;
                                    });
                                    toast.success(isRTL ? 'تمت إزالة صورة الخيار' : 'Option image removed');
                                  }}
                                  className={`absolute top-1.5 ${isRTL ? 'left-1.5' : 'right-1.5'} w-6 h-6 bg-red-600/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-90 group-hover/optimg:opacity-100 transition-all cursor-pointer shadow-md`}
                                  title={isRTL ? "حذف صورة الخيار" : "Remove option image"}
                                >
                                  <FiX size={13} className="stroke-[2.5]" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Meta Info: Difficulty & Explanation */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-gray-800/40 text-start">
                      <div className="flex flex-col gap-1 text-start">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{isRTL ? "الصعوبة" : "Difficulty"}</label>
                        <select
                          value={q.difficulty}
                          onChange={(e) => handleUpdateQuestion(qIdx, 'difficulty', e.target.value)}
                          className="px-3 py-2 bg-[#121424] border border-gray-800 rounded-xl text-white text-xs font-bold outline-none cursor-pointer text-start"
                        >
                          <option value="easy">{isRTL ? "سهل" : "Easy"}</option>
                          <option value="medium">{isRTL ? "متوسط" : "Medium"}</option>
                          <option value="hard">{isRTL ? "صعب" : "Hard"}</option>
                        </select>
                      </div>

                      <div className="md:col-span-2 flex flex-col gap-1 text-start">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{isRTL ? "الشرح (اختياري)" : "Explanation (Optional)"}</label>
                        <input
                          type="text"
                          value={q.explanation}
                          onChange={(e) => handleUpdateQuestion(qIdx, 'explanation', e.target.value)}
                          placeholder={isRTL ? "شرح مختصر للإجابة الصحيحة" : "Brief explanation for correct option"}
                          className="px-3 py-2 bg-[#121424] border border-gray-800 rounded-xl text-white text-xs font-semibold outline-none focus:border-blue-500 text-start"
                        />
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-800">
              <button
                onClick={() => setCurrentStep(1)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-sm transition-all cursor-pointer"
              >
                {isRTL ? "إلغاء الكل" : "Discard All"}
              </button>
              <button
                onClick={handleSaveAllQuestions}
                disabled={isSaving || extractedQuestions.length === 0}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-base shadow-[0_4px_20px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <FiCheck size={18} />
                <span>{isRTL ? `الموافقة وحفظ ${extractedQuestions.length} سؤال` : `Approve & Save ${extractedQuestions.length} Questions`}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: DONE (IMPORT COMPLETE) */}
        {currentStep === 4 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center p-8 md:p-14 bg-[#0e101a] border border-gray-800 rounded-[2.5rem] shadow-2xl text-center gap-6 my-4"
          >
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.35)]">
              <FiCheckCircle size={56} />
            </div>

            <div>
              <h3 className="text-2xl md:text-3xl font-black text-white">
                {isRTL ? "اكتمل الاستيراد!" : "Import Complete!"}
              </h3>
              <p className="text-sm font-semibold text-gray-400 mt-2 max-w-md">
                {isRTL ? "تم استخراج الأسئلة بنجاح وإضافتها إلى بنك الأسئلة لمادة " : "Questions have been successfully extracted and added to your Question Bank for "}
                <span className="text-blue-400 font-bold">{selectedSubject?.title || selectedSubject?.name || (isRTL ? 'المادة' : 'Subject')}</span>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
              <button
                onClick={() => {
                  setPdfFile(null);
                  setExtractedQuestions([]);
                  setCurrentStep(1);
                }}
                className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-black text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <FiRefreshCw size={16} />
                <span>{isRTL ? "رفع ملف PDF آخر" : "Upload Another PDF"}</span>
              </button>

              <button
                onClick={() => navigate('/teacher/questions')}
                className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-base shadow-[0_4px_20px_rgba(37,99,235,0.4)] flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>{isRTL ? "عرض بنك الأسئلة" : "View Question Bank"}</span>
              </button>
            </div>
          </motion.div>
        )}

      </div>

      {/* Full Size Image Preview Lightbox Modal */}
      <AnimatePresence>
        {previewModalImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewModalImage(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-8 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[90vh] bg-[#0c0e1a] border border-gray-800 rounded-3xl p-4 shadow-2xl flex flex-col items-center cursor-default overflow-hidden"
            >
              <div className="w-full flex items-center justify-between pb-3 border-b border-gray-800/80 mb-3 px-2">
                <div className="flex items-center gap-2 text-sm font-black text-white">
                  <FiImage className="text-blue-400" size={18} />
                  <span>{isRTL ? "معاينة الرسم / الصورة بالحجم الكامل" : "Full Resolution Image Preview"}</span>
                </div>
                <button
                  onClick={() => setPreviewModalImage(null)}
                  className="w-8 h-8 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                >
                  <FiX size={18} />
                </button>
              </div>
              <div className="w-full max-h-[75vh] overflow-auto flex items-center justify-center rounded-2xl bg-black/40 p-2">
                <img
                  src={previewModalImage}
                  alt="Preview Visual"
                  className="max-h-[72vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default TeacherPdfUpload;
