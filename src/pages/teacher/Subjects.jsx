import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiBookOpen,
  FiHelpCircle,
  FiUsers,
  FiChevronRight,
  FiSearch,
  FiPlus,
  FiImage,
  FiDollarSign,
  FiX,
  FiUploadCloud
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Input from '../../components/ui/Input';
import {
  fetchTeacherSubjects,
  createSubject,
  uploadSubjectBanner,
  fetchQuestions,
  fetchExams
} from '../../redux/slices/teacherSlice';
import { ContentSkeleton } from '../../components/shared/SkeletonLoading';
import { useLanguage } from '../../context/LanguageContext';

const TeacherSubjects = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, isRTL } = useLanguage();
  const bannerFileRef = useRef(null);

  // Core Store States
  const { subjects = [], questions = [], exams = [], isLoading } = useSelector((state) => state.teacher);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Create Subject Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [subjectNameAr, setSubjectNameAr] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [subjectPrice, setSubjectPrice] = useState('0');
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isLight, setIsLight] = useState(() => {
    return localStorage.getItem('theme') === 'light' || document.documentElement.classList.contains('light');
  });

  useEffect(() => {
    const handleThemeChange = () => {
      setIsLight(localStorage.getItem('theme') === 'light' || document.documentElement.classList.contains('light'));
    };
    handleThemeChange();
    window.addEventListener('themeChange', handleThemeChange);
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    dispatch(fetchTeacherSubjects());
    dispatch(fetchQuestions());
    dispatch(fetchExams());
  }, [dispatch]);

  // Counts mapping
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

  const filteredSubjects = subjectsWithCounts.filter(
    s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(isRTL ? 'يُرجى اختيار ملف صورة صالح' : 'Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(isRTL ? 'حجم الصورة يجب أن يكون أقل من 10 ميجابايت' : 'Image size must be less than 10MB');
      return;
    }

    setBannerFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBanner = (e) => {
    e.stopPropagation();
    setBannerFile(null);
    setBannerPreview(null);
    if (bannerFileRef.current) bannerFileRef.current.value = '';
  };

  const resetForm = () => {
    setSubjectName('');
    setSubjectNameAr('');
    setSubjectDescription('');
    setSubjectPrice('0');
    setBannerFile(null);
    setBannerPreview(null);
    if (bannerFileRef.current) bannerFileRef.current.value = '';
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!subjectName.trim()) {
      toast.error(isRTL ? 'اسم المادة مطلوب' : 'Subject name is required');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading(isRTL ? 'جاري إنشاء المادة...' : 'Creating subject...');

    try {
      const payload = {
        name: subjectName.trim(),
        nameAr: subjectNameAr.trim() || undefined,
        description: subjectDescription.trim() || undefined,
        price: Number(subjectPrice) >= 0 ? Number(subjectPrice) : 0,
      };

      const result = await dispatch(createSubject(payload)).unwrap();
      const createdSubjectId = result?.subject?._id || result?._id || result?.subject?.id || result?.id;

      // If banner image selected, upload banner
      if (bannerFile && createdSubjectId) {
        toast.loading(isRTL ? 'جاري رفع غلاف المادة...' : 'Uploading subject banner...', { id: loadingToast });
        try {
          await dispatch(uploadSubjectBanner({ subjectId: createdSubjectId, file: bannerFile })).unwrap();
        } catch (bannerErr) {
          console.error('Banner upload failed:', bannerErr);
          toast.error(isRTL ? 'تم إنشاء المادة ولكن فشل رفع الغلاف' : 'Subject created, but banner upload failed');
        }
      }

      toast.success(isRTL ? 'تم إنشاء المادة بنجاح! 🎉' : 'Subject created successfully! 🎉', { id: loadingToast });
      resetForm();
      setIsCreateModalOpen(false);
      dispatch(fetchTeacherSubjects());
    } catch (err) {
      toast.error(err || (isRTL ? 'فشل إنشاء المادة' : 'Failed to create subject'), { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !subjects.length) {
    return (
      <DashboardLayout
        role="teacher"
        activeTab="subjects"
        title={t('teacher.subjects.title')}
        subtitle={t('common.loading')}
      >
        <ContentSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role="teacher"
      activeTab="subjects"
      title={t('teacher.subjects.title')}
      subtitle={`${subjects.length} ${t('teacher.subjects.subtitle')}`}
    >
      <div className="w-full max-w-full p-6 md:p-8 pb-32 text-start flex flex-col gap-6 animate-fade-in">

        {/* Top Action & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <FiSearch className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-gray-500'}`} size={16} />
            <input
              type="text"
              placeholder={t('teacher.subjects.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 rounded-2xl text-base focus:outline-none focus:border-blue-500 transition-colors font-semibold ${
                isLight 
                  ? 'bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-sm' 
                  : 'bg-[#0e101a] border border-gray-800 text-white placeholder:text-gray-650'
              }`}
            />
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black shadow-[0_4px_20px_rgba(37,99,235,0.35)] hover:shadow-[0_6px_25px_rgba(37,99,235,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2 text-sm md:text-base shrink-0 border border-blue-400/30"
          >
            <FiPlus size={18} className="stroke-[3]" />
            <span className="whitespace-nowrap">{isRTL ? "إضافة مادة جديدة" : "Add Subject"}</span>
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 gap-4 my-2">
          <div className={`p-4 rounded-2xl flex flex-col items-center justify-center text-center border ${
            isLight ? 'bg-white border-emerald-200 shadow-sm' : 'bg-[#0e101a] border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]'
          }`}>
            <span className="text-2xl font-black text-emerald-500">{subjects.length}</span>
            <span className={`text-base font-semibold mt-1 ${isLight ? 'text-emerald-600' : 'text-emerald-500/70'}`}>{t('teacher.subjects.active')}</span>
          </div>
          <div className={`p-4 rounded-2xl flex flex-col items-center justify-center text-center border ${
            isLight ? 'bg-white border-yellow-200 shadow-sm' : 'bg-[#0e101a] border-yellow-500/20 shadow-[0_0_20px_rgba(245,158,11,0.05)]'
          }`}>
            <span className="text-2xl font-black text-yellow-500">{questions.length}</span>
            <span className={`text-base font-semibold mt-1 ${isLight ? 'text-yellow-600' : 'text-yellow-500/70'}`}>{t('teacher.dashboard.questions')}</span>
          </div>
        </div>

        {/* Grid of Subject Cards */}
        {filteredSubjects.length === 0 ? (
          <div className={`p-12 text-center border rounded-3xl flex flex-col items-center justify-center gap-3 ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c0d19]/40 border-gray-800/80'
          }`}>
            <FiBookOpen size={40} className={isLight ? 'text-slate-400' : 'text-gray-600'} />
            <span className={`text-lg font-bold ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>{t('admin.content.noSubjects')}</span>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-2 px-5 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-500 font-black text-xs md:text-sm border border-blue-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FiPlus size={16} />
              <span>{isRTL ? "إنشاء أول مادة الآن" : "Create Your First Subject"}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredSubjects.map((sub) => (
              <div
                key={sub.id}
                className={`p-5 rounded-[2rem] shadow-lg flex flex-col gap-4 relative overflow-hidden transition-all duration-300 border ${
                  isLight
                    ? 'bg-white border-slate-200 hover:border-blue-400 hover:bg-slate-50/50 text-slate-900 shadow-sm'
                    : 'bg-[#0e101a]/95 border-gray-800/80 hover:bg-[#121424] text-white'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)] shrink-0">
                    <FiBookOpen size={24} />
                  </div>

                  <div className="flex items-center gap-1.5 z-10">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{t('teacher.subjects.active')}</span>
                    </span>
                  </div>
                </div>

                <div className="text-start mt-1">
                  <div className={`text-2xl font-extrabold leading-tight capitalize ${isLight ? 'text-slate-900' : 'text-white'}`}>{sub.title}</div>
                  <p className={`text-base font-semibold mt-1 leading-normal line-clamp-1 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{sub.description}</p>
                </div>

                <div className={`flex items-center justify-between text-base font-bold border-t pt-4 mt-2 ${
                  isLight ? 'text-slate-500 border-slate-200' : 'text-gray-500 border-gray-800/40'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <FiHelpCircle size={13} className="text-blue-500" />
                      {sub.questionsCount} {t('teacher.dashboard.questions')}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiUsers size={13} className="text-yellow-500" />
                      {sub.studentsCount} {t('teacher.dashboard.students')}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      navigate(`/teacher/subjects/${sub.id}`);
                    }}
                    className="w-8 h-8 rounded-full bg-blue-500/10 hover:bg-blue-500/20 flex items-center justify-center text-blue-500 hover:text-blue-700 transition-all cursor-pointer"
                  >
                    <FiChevronRight size={16} className={isRTL ? 'rotate-180' : ''} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* CREATE SUBJECT MODAL */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm p-4 sm:p-6 flex min-h-full items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-lg my-auto rounded-3xl p-6 md:p-8 flex flex-col gap-5 text-start relative max-h-[calc(100vh-2rem)] overflow-y-auto border shadow-2xl ${
                isLight 
                  ? 'bg-white border-slate-200 text-slate-900' 
                  : 'bg-[#0e101a] border-gray-800 text-white'
              }`}
            >
              <div className={`flex items-center justify-between border-b pb-3 ${
                isLight ? 'border-slate-200' : 'border-gray-800'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-500 shrink-0">
                    <FiBookOpen size={20} />
                  </div>
                  <h3 className={`text-lg md:text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {isRTL ? 'إنشاء مادة تعليمية جديدة' : 'Create New Subject'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!isSubmitting) {
                      setIsCreateModalOpen(false);
                      resetForm();
                    }
                  }}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    isLight ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-700' : 'hover:bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateSubject} className="flex flex-col gap-4 text-start">
                <Input
                  label={isRTL ? "اسم المادة (إنجليزي / أساسي) *" : "Subject Name (Primary) *"}
                  placeholder={isRTL ? "مثال: Organic Chemistry" : "e.g. Organic Chemistry"}
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  required
                  roleColor="teacher"
                />

                <Input
                  label={isRTL ? "اسم المادة (بالعربية - اختياري)" : "Subject Name (Arabic - Optional)"}
                  placeholder={isRTL ? "مثال: الكيمياء العضوية" : "e.g. الكيمياء العضوية"}
                  value={subjectNameAr}
                  onChange={(e) => setSubjectNameAr(e.target.value)}
                  roleColor="teacher"
                />

                <div className="flex flex-col gap-1.5 text-start">
                  <label className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-gray-400'}`}>
                    {isRTL ? "وصف المادة (اختياري)" : "Subject Description (Optional)"}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={isRTL ? "اكتب نبذة مختصرة عن محتوى المادة..." : "Brief overview of the subject content..."}
                    value={subjectDescription}
                    onChange={(e) => setSubjectDescription(e.target.value)}
                    className={`w-full p-3 rounded-xl text-sm font-semibold outline-none resize-none transition-colors border ${
                      isLight 
                        ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 shadow-sm' 
                        : 'bg-[#121424] border-gray-800 text-white placeholder:text-gray-600 focus:border-blue-500/50'
                    }`}
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-start">
                  <label className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-gray-400'}`}>
                    {isRTL ? "سعر المادة (0 = مجانية)" : "Subject Price (0 = Free)"}
                  </label>
                  <div className="relative">
                    <FiDollarSign className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-gray-500'}`} size={16} />
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0"
                      value={subjectPrice}
                      onChange={(e) => setSubjectPrice(e.target.value)}
                      className={`w-full ${isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2.5 rounded-xl text-sm font-semibold outline-none transition-colors border ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-500 shadow-sm'
                          : 'bg-[#121424] border-gray-800 text-white focus:border-blue-500/50'
                      }`}
                    />
                  </div>
                </div>

                {/* Banner Image Picker */}
                <div className="flex flex-col gap-1.5 text-start">
                  <label className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-gray-400'}`}>
                    {isRTL ? "غلاف المادة (اختياري)" : "Subject Banner Image (Optional)"}
                  </label>

                  <input
                    type="file"
                    ref={bannerFileRef}
                    accept="image/*"
                    onChange={handleBannerChange}
                    className="hidden"
                  />

                  {bannerPreview ? (
                    <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-blue-500/30 group">
                      <img
                        src={bannerPreview}
                        alt="Banner Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => bannerFileRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 cursor-pointer"
                        >
                          {isRTL ? "تغيير الصورة" : "Change Image"}
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveBanner}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-500 cursor-pointer"
                        >
                          {isRTL ? "إزالة" : "Remove"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => bannerFileRef.current?.click()}
                      className={`w-full py-6 px-4 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 cursor-pointer text-center ${
                        isLight
                          ? 'border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-slate-100'
                          : 'border-gray-800 hover:border-blue-500/40 bg-[#121424]/60 hover:bg-[#121424]'
                      }`}
                    >
                      <FiUploadCloud size={24} className="text-blue-500" />
                      <span className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                        {isRTL ? "انقر لاختيار صورة غلاف للمادة" : "Click to select a banner image"}
                      </span>
                      <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                        {isRTL ? "PNG, JPG حتى 10MB" : "PNG, JPG up to 10MB"}
                      </span>
                    </div>
                  )}
                </div>

                <div className={`flex items-center justify-end gap-3 pt-3 border-t mt-2 ${
                  isLight ? 'border-slate-200' : 'border-gray-800'
                }`}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      resetForm();
                    }}
                    disabled={isSubmitting}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs cursor-pointer transition-colors ${
                      isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-blue-500/20 cursor-pointer disabled:opacity-50 transition-all"
                  >
                    {isSubmitting ? (isRTL ? 'جاري الإنشاء...' : 'Creating...') : (isRTL ? 'إنشاء المادة' : 'Create Subject')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default TeacherSubjects;

