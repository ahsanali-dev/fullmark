import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FiBookOpen, 
  FiBook, 
  FiHelpCircle, 
  FiTag, 
  FiUser, 
  FiPlay,
  FiX,
  FiLock,
  FiKey,
  FiSearch,
  FiShoppingBag,
  FiCheckCircle,
  FiChevronDown,
  FiChevronRight,
  FiLayers,
  FiUnlock,
  FiPlayCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { fetchBrowseSubjects, fetchSubjectLessons, validateCoupon, redeemCoupon, enrollWithCoupon } from '../../redux/slices/studentSlice';
import { getImageUrl } from '../../utils/imageUrl';
import { useLanguage } from '../../context/LanguageContext';

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, isRTL } = useLanguage();

  const { browseSubjects, lessonsData, isLoading, isActionLoading } = useSelector((state) => state.student);

  const [course, setCourse] = useState(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [validatedCouponData, setValidatedCouponData] = useState(null);
  const [expandedUnits, setExpandedUnits] = useState({});

  const [isLight, setIsLight] = useState(() => {
    return typeof window !== 'undefined' && (localStorage.getItem('theme') === 'light' || document.documentElement.classList.contains('light'));
  });

  useEffect(() => {
    const handleThemeChange = () => {
      setIsLight(localStorage.getItem('theme') === 'light' || document.documentElement.classList.contains('light'));
    };
    window.addEventListener('themeChange', handleThemeChange);
    window.addEventListener('storage', handleThemeChange);
    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
      window.removeEventListener('storage', handleThemeChange);
    };
  }, []);

  // Fetch subjects if empty
  useEffect(() => {
    if (!browseSubjects || browseSubjects.length === 0) {
      dispatch(fetchBrowseSubjects());
    }
  }, [dispatch, browseSubjects]);

  // Fetch lessons / curriculum for this course
  useEffect(() => {
    if (courseId) {
      dispatch(fetchSubjectLessons(courseId));
    }
  }, [dispatch, courseId]);

  // Find the selected course
  useEffect(() => {
    if (browseSubjects && browseSubjects.length > 0) {
      const found = browseSubjects.find(c => c._id === courseId);
      if (found) {
        setCourse(found);
      }
    }
  }, [courseId, browseSubjects]);

  // Auto-expand all units once loaded
  useEffect(() => {
    if (lessonsData?.units) {
      const map = { unassigned: true };
      lessonsData.units.forEach((u, i) => {
        map[u._id || i] = true;
      });
      setExpandedUnits(map);
    }
  }, [lessonsData]);

  const toggleUnit = (unitId) => {
    setExpandedUnits(prev => ({
      ...prev,
      [unitId]: !prev[unitId]
    }));
  };

  const handleEnrollClick = () => {
    setCouponCode('');
    setValidatedCouponData(null);
    setIsEnrollModalOpen(true);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error(isRTL ? 'الرجاء إدخال رمز الكوبون.' : 'Please enter a coupon code.');
      return;
    }
    const myToast = toast.loading(isRTL ? 'جاري التحقق من الكوبون...' : 'Validating coupon...');
    try {
      const res = await dispatch(validateCoupon(couponCode)).unwrap();
      toast.dismiss(myToast);
      setValidatedCouponData(res);
      toast.success(isRTL ? 'الكوبون صالح! 🎁' : 'Coupon valid! 🎁');
    } catch (err) {
      toast.dismiss(myToast);
      toast.error(err || (isRTL ? 'رمز الكوبون غير صالح أو منتهي الصلاحية.' : 'Invalid or expired coupon code.'));
      setValidatedCouponData(null);
    }
  };

  const handleConfirmEnrollment = async () => {
    if (!course) return;

    const isFree = course.price === 0;
    if (!isFree && !validatedCouponData) {
      toast.error(isRTL ? 'الرجاء التحقق من الكوبون أولاً.' : 'Please validate a coupon first.');
      return;
    }

    const myToast = toast.loading(isFree ? (isRTL ? 'جاري التسجيل...' : 'Enrolling...') : (isRTL ? 'جاري استخدام الكوبون...' : 'Redeeming coupon...'));
    try {
      if (isFree) {
        await dispatch(enrollWithCoupon({ subjectId: course._id })).unwrap();
        toast.success(isRTL ? `تم التسجيل بنجاح في ${course.name}! 🎉` : `Successfully enrolled in ${course.name}! 🎉`);
      } else {
        const res = await dispatch(redeemCoupon(couponCode)).unwrap();
        toast.success(res.message || (isRTL ? 'تم استخدام الكوبون بنجاح! 🎉' : 'Coupon redeemed successfully! 🎉'));
      }

      toast.dismiss(myToast);
      setIsEnrollModalOpen(false);
      setValidatedCouponData(null);
      // Refresh browse catalog to update status
      dispatch(fetchBrowseSubjects());
    } catch (err) {
      toast.dismiss(myToast);
      toast.error(err || (isRTL ? 'فشل استخدام الكوبون.' : 'Failed to redeem coupon.'));
    }
  };

  if (isLoading && !course) {
    return (
      <DashboardLayout
        role="student"
        activeTab="courses"
        title={isRTL ? "جاري تحميل الكورس..." : "Loading Course..."}
        showBackButton={true}
        onBackClick={() => navigate('/student/courses')}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout
        role="student"
        activeTab="courses"
        title={isRTL ? "الكورس غير موجود" : "Course Not Found"}
        showBackButton={true}
        onBackClick={() => navigate('/student/courses')}
      >
        <div className="p-8 text-center text-gray-500 font-bold">
          {isRTL ? "الكورس غير موجود أو غير متاح حالياً." : "Course not found. It might be unavailable."}
        </div>
      </DashboardLayout>
    );
  }

  const isEnrolled = course.isEnrolled;
  const rawUnits = (lessonsData?.units || []).filter((u) => u && u._id !== null && u._id !== 'null');
  const allLessons = lessonsData?.lessons || [];
  const freeLessons = allLessons.filter((l) => l.isFree);

  // Group unassigned lessons if any
  const assignedLessonIds = new Set();
  rawUnits.forEach((u) => {
    (u.lessons || []).forEach((l) => assignedLessonIds.add(l._id || l.id));
  });
  const unassignedLessons = allLessons.filter((l) => !assignedLessonIds.has(l._id || l.id));

  return (
    <DashboardLayout
      role="student"
      activeTab="courses"
      title={course.name}
      subtitle={course.teacher ? (isRTL ? `المحاضر: ${course.teacher.name}` : `Instructor: ${course.teacher.name}`) : ''}
      showBackButton={true}
      onBackClick={() => navigate('/student/courses')}
      isModalOpen={isEnrollModalOpen}
    >
      <div className="flex flex-col gap-6 text-start p-6 md:p-8 pb-32 lg:pb-12 w-full max-w-4xl mx-auto">
        {/* Header Box Card / Course Banner */}
        <div className={`rounded-[2.5rem] border shadow-2xl overflow-hidden relative transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-gradient-to-br from-[#0c0d19]/90 to-[#0a0a12]/95 border-gray-800/80'
        }`}>
          {course.bannerUrl && (
            <div className="w-full h-48 sm:h-64 relative overflow-hidden">
              <img 
                src={getImageUrl(course.bannerUrl)} 
                alt={course.name}
                className="w-full h-full object-cover object-center"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${
                isLight ? 'from-white via-white/40 to-transparent' : 'from-[#0c0d19] via-[#0c0d19]/50 to-transparent'
              }`} />
            </div>
          )}
          
          <div className="p-6 sm:p-8 flex items-start gap-5 relative z-10">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
              isLight ? 'bg-blue-50 border border-blue-200 text-blue-600' : 'bg-blue-500/15 border border-blue-500/25 text-blue-400'
            }`}>
              <FiBookOpen size={28} />
            </div>
            <div className="flex flex-col text-start">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {isEnrolled ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-black flex items-center gap-1.5 shadow-sm">
                    <FiCheckCircle size={13} />
                    <span>{isRTL ? "أنت مشترك في هذا الكورس" : "Enrolled in Course"}</span>
                  </span>
                ) : freeLessons.length > 0 ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-black flex items-center gap-1.5 shadow-sm">
                    <FiUnlock size={13} />
                    <span>{isRTL ? `متاح معاينة مجانية (${freeLessons.length} دروس)` : `Free Preview Available (${freeLessons.length} lessons)`}</span>
                  </span>
                ) : null}
              </div>

              <h3 className={`text-xl sm:text-2xl font-black capitalize leading-tight ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                {course.name}
              </h3>
              <p className={`text-sm font-semibold mt-1.5 leading-normal ${
                isLight ? 'text-slate-600' : 'text-gray-400'
              }`}>
                {course.description}
              </p>
            </div>
          </div>
        </div>

        {/* Grid of Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-5 rounded-2xl border flex flex-col items-center justify-center text-center gap-2 transition-colors ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-gray-900/30 border-gray-800/80 shadow-md'
          }`}>
            <FiBook className="text-purple-500 dark:text-purple-400 text-lg" />
            <span className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{course.totalLessons || allLessons.length || 0}</span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{isRTL ? "الدروس" : "Lessons"}</span>
          </div>
          
          <div className={`p-5 rounded-2xl border flex flex-col items-center justify-center text-center gap-2 transition-colors ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-gray-900/30 border-gray-800/80 shadow-md'
          }`}>
            <FiHelpCircle className="text-blue-500 dark:text-blue-400 text-lg" />
            <span className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{course.totalQuestions || 0}</span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{isRTL ? "الأسئلة" : "Questions"}</span>
          </div>

          <div className={`p-5 rounded-2xl border flex flex-col items-center justify-center text-center gap-2 transition-colors ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-gray-900/30 border-gray-800/80 shadow-md'
          }`}>
            <FiTag className="text-yellow-500 text-lg" />
            <span className="text-base font-black text-yellow-500">
              {course.price === 0 ? (isRTL ? 'مجاني' : 'Free') : `${course.price} ${isRTL ? 'نقاط' : 'Pts'}`}
            </span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{isRTL ? "السعر" : "Price"}</span>
          </div>
        </div>

        {/* Instructor Section */}
        {course.teacher && (
          <div className={`p-5 rounded-2xl border flex items-center gap-4 text-start transition-colors ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-gray-900/30 border-gray-800/80 shadow-md'
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-purple-500 shrink-0 ${
              isLight ? 'bg-purple-50 border border-purple-200' : 'bg-purple-500/10 border border-purple-500/20'
            }`}>
              <FiUser className="text-lg" />
            </div>
            <div className="flex flex-col">
              <span className={`text-sm font-black capitalize leading-tight ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                {course.teacher.name}
              </span>
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-0.5">
                {isRTL ? "محاضر الكورس" : "Course Instructor"}
              </span>
            </div>
          </div>
        )}

        {/* Free Preview Banner Alert (if unenrolled and has free lessons) */}
        {!isEnrolled && freeLessons.length > 0 && (
          <div className={`p-5 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-sm ${
            isLight 
              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950' 
              : 'bg-emerald-950/20 border-emerald-500/40 text-white'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <FiUnlock size={22} />
              </div>
              <div className="flex flex-col text-start">
                <h4 className="text-sm sm:text-base font-black">
                  {isRTL ? `معاينة مجانية متاحة لهذا الكورس! (${freeLessons.length} دروس)` : `Free Preview Available for this Course! (${freeLessons.length} lessons)`}
                </h4>
                <p className={`text-xs font-semibold mt-0.5 ${isLight ? 'text-emerald-800' : 'text-gray-300'}`}>
                  {isRTL ? "يمكنك البدء بمشاهدة الدروس المجانية كمعاينة قبل التسجيل الكامل." : "You can start watching the free sample lessons before full enrollment."}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                const firstFree = freeLessons[0];
                if (firstFree) {
                  navigate(`/student/courses/${course._id}/lessons/${firstFree._id || firstFree.id}`);
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer shrink-0"
            >
              <FiPlay size={14} className={isRTL ? 'rotate-180' : ''} />
              <span>{isRTL ? "شاهد المعاينة الآن" : "Watch Preview Now"}</span>
            </button>
          </div>
        )}

        {/* Course Curriculum & Syllabus Section */}
        <div className="flex flex-col gap-4 text-start">
          <div className={`flex items-center justify-between border-b pb-3 ${
            isLight ? 'border-slate-200' : 'border-gray-800/60'
          }`}>
            <h4 className={`text-sm font-black uppercase tracking-widest flex items-center gap-2 ${
              isLight ? 'text-slate-800' : 'text-gray-300'
            }`}>
              <FiBookOpen className="text-blue-500" />
              <span>{isRTL ? "محتوى ومنهاج الكورس" : "Course Curriculum"}</span>
            </h4>
            <span className="text-xs font-bold text-gray-500">
              {allLessons.length} {isRTL ? "دروس" : "Lessons"}
            </span>
          </div>

          {/* Units / Lessons List */}
          {allLessons.length === 0 ? (
            <div className={`p-8 text-center border rounded-2xl ${
              isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-gray-900/30 border-gray-800 text-gray-400'
            }`}>
              <p className="text-sm font-bold">{isRTL ? "لم يتم نشر دروس في هذا الكورس بعد." : "No published lessons in this course yet."}</p>
            </div>
          ) : rawUnits.length > 0 ? (
            <div className="flex flex-col gap-4">
              {rawUnits.map((unit) => {
                const unitId = unit._id;
                const isOpen = expandedUnits[unitId] !== false;
                const unitLessons = unit.lessons || [];

                return (
                  <div 
                    key={unitId} 
                    className={`rounded-3xl border overflow-hidden transition-all ${
                      isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c0d19]/40 border-gray-800/80 shadow-md'
                    }`}
                  >
                    {/* Unit Accordion Header */}
                    <button
                      onClick={() => toggleUnit(unitId)}
                      className={`w-full p-4 sm:p-5 flex items-center justify-between text-start cursor-pointer transition-colors ${
                        isLight ? 'hover:bg-slate-50' : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-blue-500 shrink-0 ${
                          isLight ? 'bg-blue-50' : 'bg-blue-500/10'
                        }`}>
                          {isOpen ? <FiChevronDown size={18} /> : <FiChevronRight size={18} className={isRTL ? 'rotate-180' : ''} />}
                        </div>
                        <div className="flex flex-col text-start">
                          <span className={`text-base font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {(isRTL && unit.titleAr) ? unit.titleAr : unit.title}
                          </span>
                          <span className="text-xs text-gray-500 font-bold mt-0.5">
                            {unitLessons.length} {isRTL ? "دروس" : "Lessons"}
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* Unit Lessons */}
                    {isOpen && (
                      <div className={`p-3 sm:p-4 pt-0 flex flex-col gap-2.5 border-t ${
                        isLight ? 'border-slate-100 bg-slate-50/50' : 'border-gray-800/40 bg-black/15'
                      }`}>
                        {unitLessons.map((lesson) => {
                          const isFree = Boolean(lesson.isFree);
                          const canPlay = isEnrolled || isFree;

                          return (
                            <div
                              key={lesson._id || lesson.id}
                              onClick={() => {
                                if (canPlay) {
                                  navigate(`/student/courses/${course._id}/lessons/${lesson._id || lesson.id}`);
                                } else {
                                  handleEnrollClick();
                                }
                              }}
                              className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                                canPlay
                                  ? isFree && !isEnrolled
                                    ? isLight 
                                      ? 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-400 shadow-xs' 
                                      : 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/50'
                                    : isLight
                                    ? 'bg-white border-slate-200 hover:border-blue-300 shadow-xs'
                                    : 'bg-[#121424] border-gray-800 hover:border-blue-500/40'
                                  : isLight
                                  ? 'bg-slate-100/70 border-slate-200 opacity-80 hover:opacity-100'
                                  : 'bg-gray-900/30 border-gray-800/60 opacity-70 hover:opacity-90'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                  canPlay
                                    ? isFree && !isEnrolled
                                      ? 'bg-emerald-500 text-gray-950 shadow-sm'
                                      : 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-gray-800 text-gray-400'
                                }`}>
                                  {canPlay ? (
                                    <FiPlay size={16} className={isRTL ? 'rotate-180' : ''} />
                                  ) : (
                                    <FiLock size={15} />
                                  )}
                                </div>
                                <div className="flex flex-col text-start">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-gray-500 uppercase">
                                      {t('student.courseLessons.lessonNum')} {lesson.order || 1}
                                    </span>
                                    {lesson.animationUrl && (
                                      <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30 text-[9px] font-black flex items-center gap-1">
                                        <FiLayers size={9} /> {isRTL ? "تفاعلي" : "Interactive"}
                                      </span>
                                    )}
                                  </div>
                                  <span className={`text-sm font-bold leading-tight mt-0.5 ${
                                    isLight ? 'text-slate-900' : 'text-white'
                                  }`}>
                                    {(isRTL && lesson.titleAr) ? lesson.titleAr : lesson.title}
                                  </span>
                                </div>
                              </div>

                              {/* Action Badge */}
                              <div className="shrink-0">
                                {isEnrolled ? (
                                  <span className="px-3 py-1 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-500 dark:text-blue-400 text-xs font-black flex items-center gap-1">
                                    <FiPlayCircle size={13} />
                                    <span>{isRTL ? "مشاهدة" : "Play"}</span>
                                  </span>
                                ) : isFree ? (
                                  <span className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs font-black flex items-center gap-1 shadow-sm">
                                    <FiUnlock size={12} />
                                    <span>{isRTL ? "معاينة مجانية" : "Free Preview"}</span>
                                  </span>
                                ) : (
                                  <span className={`px-2.5 py-1 rounded-xl border text-[11px] font-bold flex items-center gap-1 ${
                                    isLight ? 'bg-slate-200/80 border-slate-300 text-slate-600' : 'bg-gray-800/80 border-gray-700 text-gray-400'
                                  }`}>
                                    <FiLock size={12} />
                                    <span>{isRTL ? "يتطلب اشتراك" : "Locked"}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Unassigned / General Lessons (if any) */}
              {unassignedLessons.length > 0 && (
                <div 
                  className={`rounded-3xl border overflow-hidden transition-all ${
                    isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c0d19]/40 border-gray-800/80 shadow-md'
                  }`}
                >
                  {/* General Header */}
                  <button
                    onClick={() => toggleUnit('unassigned')}
                    className={`w-full p-4 sm:p-5 flex items-center justify-between text-start cursor-pointer transition-colors ${
                      isLight ? 'hover:bg-slate-50' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-purple-500 shrink-0 ${
                        isLight ? 'bg-purple-50' : 'bg-purple-500/10'
                      }`}>
                        {expandedUnits['unassigned'] !== false ? <FiChevronDown size={18} /> : <FiChevronRight size={18} className={isRTL ? 'rotate-180' : ''} />}
                      </div>
                      <div className="flex flex-col text-start">
                        <span className={`text-base font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {isRTL ? "دروس عامة (بدون وحدة)" : "General Lessons"}
                        </span>
                        <span className="text-xs text-gray-500 font-bold mt-0.5">
                          {unassignedLessons.length} {isRTL ? "دروس" : "Lessons"}
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* General Lessons List */}
                  {expandedUnits['unassigned'] !== false && (
                    <div className={`p-3 sm:p-4 pt-0 flex flex-col gap-2.5 border-t ${
                      isLight ? 'border-slate-100 bg-slate-50/50' : 'border-gray-800/40 bg-black/15'
                    }`}>
                      {unassignedLessons.map((lesson) => {
                        const isFree = Boolean(lesson.isFree);
                        const canPlay = isEnrolled || isFree;

                        return (
                          <div
                            key={lesson._id || lesson.id}
                            onClick={() => {
                              if (canPlay) {
                                navigate(`/student/courses/${course._id}/lessons/${lesson._id || lesson.id}`);
                              } else {
                                handleEnrollClick();
                              }
                            }}
                            className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                              canPlay
                                ? isFree && !isEnrolled
                                  ? isLight 
                                    ? 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-400 shadow-xs' 
                                    : 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/50'
                                  : isLight
                                  ? 'bg-white border-slate-200 hover:border-blue-300 shadow-xs'
                                  : 'bg-[#121424] border-gray-800 hover:border-blue-500/40'
                                : isLight
                                ? 'bg-slate-100/70 border-slate-200 opacity-80 hover:opacity-100'
                                : 'bg-gray-900/30 border-gray-800/60 opacity-70 hover:opacity-90'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                canPlay
                                  ? isFree && !isEnrolled
                                    ? 'bg-emerald-500 text-gray-950 shadow-sm'
                                    : 'bg-blue-600 text-white shadow-sm'
                                  : 'bg-gray-800 text-gray-400'
                              }`}>
                                {canPlay ? (
                                  <FiPlay size={16} className={isRTL ? 'rotate-180' : ''} />
                                ) : (
                                  <FiLock size={15} />
                                )}
                              </div>
                              <div className="flex flex-col text-start">
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-bold text-gray-500 uppercase">
                                    {t('student.courseLessons.lessonNum')} {lesson.order || 1}
                                  </span>
                                  {lesson.animationUrl && (
                                    <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30 text-[9px] font-black flex items-center gap-1">
                                      <FiLayers size={9} /> {isRTL ? "تفاعلي" : "Interactive"}
                                    </span>
                                  )}
                                </div>
                                <span className={`text-sm font-bold leading-tight mt-0.5 ${
                                  isLight ? 'text-slate-900' : 'text-white'
                                }`}>
                                  {(isRTL && lesson.titleAr) ? lesson.titleAr : lesson.title}
                                </span>
                              </div>
                            </div>

                            {/* Action Badge */}
                            <div className="shrink-0">
                              {isEnrolled ? (
                                <span className="px-3 py-1 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-500 dark:text-blue-400 text-xs font-black flex items-center gap-1">
                                  <FiPlayCircle size={13} />
                                  <span>{isRTL ? "مشاهدة" : "Play"}</span>
                                </span>
                              ) : isFree ? (
                                <span className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs font-black flex items-center gap-1 shadow-sm">
                                  <FiUnlock size={12} />
                                  <span>{isRTL ? "معاينة مجانية" : "Free Preview"}</span>
                                </span>
                              ) : (
                                <span className={`px-2.5 py-1 rounded-xl border text-[11px] font-bold flex items-center gap-1 ${
                                  isLight ? 'bg-slate-200/80 border-slate-300 text-slate-600' : 'bg-gray-800/80 border-gray-700 text-gray-400'
                                }`}>
                                  <FiLock size={12} />
                                  <span>{isRTL ? "يتطلب اشتراك" : "Locked"}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Flat lessons list */
            <div className="flex flex-col gap-2.5">
              {allLessons.map((lesson) => {
                const isFree = Boolean(lesson.isFree);
                const canPlay = isEnrolled || isFree;

                return (
                  <div
                    key={lesson._id || lesson.id}
                    onClick={() => {
                      if (canPlay) {
                        navigate(`/student/courses/${course._id}/lessons/${lesson._id || lesson.id}`);
                      } else {
                        handleEnrollClick();
                      }
                    }}
                    className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                      canPlay
                        ? isFree && !isEnrolled
                          ? isLight 
                            ? 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-400 shadow-xs' 
                            : 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/50'
                          : isLight
                          ? 'bg-white border-slate-200 hover:border-blue-300 shadow-xs'
                          : 'bg-[#121424] border-gray-800 hover:border-blue-500/40'
                        : isLight
                        ? 'bg-slate-100/70 border-slate-200 opacity-80'
                        : 'bg-gray-900/30 border-gray-800/60 opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        canPlay
                          ? isFree && !isEnrolled
                            ? 'bg-emerald-500 text-gray-950 shadow-sm'
                            : 'bg-blue-600 text-white shadow-sm'
                          : 'bg-gray-800 text-gray-400'
                      }`}>
                        {canPlay ? <FiPlay size={16} className={isRTL ? 'rotate-180' : ''} /> : <FiLock size={15} />}
                      </div>
                      <div className="flex flex-col text-start">
                        <span className="text-[11px] font-bold text-gray-500 uppercase">
                          {t('student.courseLessons.lessonNum')} {lesson.order || 1}
                        </span>
                        <span className={`text-sm font-bold leading-tight mt-0.5 ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}>
                          {(isRTL && lesson.titleAr) ? lesson.titleAr : lesson.title}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isEnrolled ? (
                        <span className="px-3 py-1 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-500 dark:text-blue-400 text-xs font-black flex items-center gap-1">
                          <FiPlayCircle size={13} />
                          <span>{isRTL ? "مشاهدة" : "Play"}</span>
                        </span>
                      ) : isFree ? (
                        <span className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs font-black flex items-center gap-1 shadow-sm">
                          <FiUnlock size={12} />
                          <span>{isRTL ? "معاينة مجانية" : "Free Preview"}</span>
                        </span>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-xl border text-[11px] font-bold flex items-center gap-1 ${
                          isLight ? 'bg-slate-200/80 border-slate-300 text-slate-600' : 'bg-gray-800/80 border-gray-700 text-gray-400'
                        }`}>
                          <FiLock size={12} />
                          <span>{isRTL ? "يتطلب اشتراك" : "Locked"}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* About Course Section */}
        <div className="flex flex-col gap-2 text-start pt-2">
          <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">{isRTL ? "عن الكورس" : "About this Course"}</h4>
          <p className={`text-sm leading-relaxed font-semibold ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
            {course.description || (isRTL 
              ? "يغطي هذا الكورس كامل المواد والشرائح الدراسية. باختيارك لهذا الكورس ستتعلم القوانين والتعاريف بالتفصيل وتجري تقييمات تحتوي على أسئلة منظمة."
              : "This course covers full materials and slide modules. By selecting this course you will learn detailed formulas, definitions, and verify assessments containing structured questions."
            )}
          </p>
        </div>

        {/* Footer CTA Button */}
        {isEnrolled ? (
          <button
            onClick={() => navigate(`/student/courses/${course._id}/lessons`)}
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-sm font-black text-white transition-all shadow-[0_4px_15px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <FiPlay className={`text-sm ${isRTL ? 'rotate-180' : ''}`} />
            {isRTL ? "متابعة التعلم في الكورس" : "Continue Learning"}
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            {freeLessons.length > 0 && (
              <button
                onClick={() => {
                  const firstFree = freeLessons[0];
                  if (firstFree) {
                    navigate(`/student/courses/${course._id}/lessons/${firstFree._id || firstFree.id}`);
                  }
                }}
                className={`w-full sm:w-1/2 py-4 rounded-2xl border text-sm font-black flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm ${
                  isLight 
                    ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-700' 
                    : 'bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-500/40 text-emerald-400'
                }`}
              >
                <FiPlay className={`text-sm ${isRTL ? 'rotate-180' : ''}`} />
                <span>{isRTL ? `معاينة مجانية (${freeLessons.length})` : `Free Preview (${freeLessons.length})`}</span>
              </button>
            )}

            <button
              onClick={handleEnrollClick}
              className={`${freeLessons.length > 0 ? 'w-full sm:w-1/2' : 'w-full'} py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-sm font-black text-white transition-all shadow-[0_4px_15px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2 cursor-pointer active:scale-98`}
            >
              {isRTL ? "سجل في الكورس الآن" : "Enroll in Course Now"}
            </button>
          </div>
        )}
      </div>

      {/* ENROLL MODAL DRAWER OVERLAY */}
      <AnimatePresence>
        {isEnrollModalOpen && (
          <div 
            className="fixed inset-0 bg-[#020205]/70 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4 transition-all duration-300 animate-fade-in"
            onClick={() => {
              if (!isActionLoading) setIsEnrollModalOpen(false);
            }}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 100, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 100, opacity: 0 }}
              className={`w-full sm:max-w-lg border-t sm:border rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 pb-10 sm:pb-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden text-start transition-colors ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#0c0d19] border-gray-800'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Top Handle for Mobile */}
              <div className={`w-12 h-1.5 rounded-full mx-auto mb-6 sm:hidden ${isLight ? 'bg-slate-300' : 'bg-gray-800'}`} />
              
              {/* Close Button */}
              <button 
                disabled={isActionLoading}
                onClick={() => setIsEnrollModalOpen(false)}
                className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} transition-colors cursor-pointer disabled:opacity-50 ${
                  isLight ? 'text-slate-400 hover:text-slate-700' : 'text-gray-500 hover:text-white'
                }`}
              >
                <FiX size={20} />
              </button>

              {/* Course Title and Badges */}
              <div className="flex items-center gap-4 mb-6 text-start">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-500 shrink-0">
                  <FiBookOpen size={24} />
                </div>
                <div className="flex flex-col text-start">
                  <h3 className={`text-xl font-black capitalize leading-tight ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    {course.name}
                  </h3>
                  {course.price === 0 || validatedCouponData ? (
                    <span className="text-xs font-bold text-emerald-500 mt-1 leading-none">
                      {isRTL ? "مجاني / مغطى بالكوبون" : "Free / Covered by coupon"}
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-yellow-500 mt-1 leading-none">
                      {isRTL ? `السعر: ${course.price} نقاط` : `Price: ${course.price} Points`}
                    </span>
                  )}
                </div>
              </div>

              {/* Coupon inputs or Free Banners */}
              {course.price === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-3 mb-6">
                  <FiLock className="text-lg shrink-0" />
                  <span className="text-xs font-bold">{isRTL ? "هذا الكورس مجاني — لا حاجة لكوبون." : "This course is free — no coupon needed."}</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 mb-6">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-wider">
                    {isRTL ? "أدخل رمز الكوبون" : "Enter your coupon code"}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <FiKey className={`absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-gray-500 text-sm`} />
                      <input 
                        type="text"
                        placeholder="FM-XXXXXXXXX"
                        value={couponCode}
                        disabled={isActionLoading || validatedCouponData}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 rounded-xl border text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all uppercase text-start ${
                          isLight 
                            ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400' 
                            : 'bg-gray-950/50 border-gray-800 text-white placeholder:text-gray-600'
                        }`}
                      />
                    </div>
                    {!validatedCouponData && (
                      <button 
                        onClick={handleApplyCoupon}
                        disabled={isActionLoading}
                        className="w-12 h-10 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-gray-950 flex items-center justify-center transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)] hover:scale-105 cursor-pointer shrink-0 disabled:opacity-50"
                      >
                        <FiSearch size={16} />
                      </button>
                    )}
                  </div>
                  {validatedCouponData && (
                    <div className="p-4 mt-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex flex-col gap-2">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm font-black">
                        <FiCheckCircle size={16} /> {isRTL ? "كوبون صالح:" : "Valid Coupon:"} {validatedCouponData.code}
                      </div>
                      <div className={isLight ? 'text-slate-700 font-semibold' : 'text-gray-300 font-semibold'}>
                        {isRTL ? `يفتح ${validatedCouponData.courses?.length || 0} كورس رئيسي و ${validatedCouponData.bonusCourses?.length || 0} كورس إضافي.` : `Unlocks ${validatedCouponData.courses?.length || 0} main course(s) and ${validatedCouponData.bonusCourses?.length || 0} bonus course(s).`}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Confirm action button */}
              {course.price === 0 || validatedCouponData ? (
                <button
                  onClick={handleConfirmEnrollment}
                  disabled={isActionLoading}
                  className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-xs font-black text-white transition-all shadow-[0_4px_15px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isActionLoading ? (isRTL ? 'جاري المعالجة...' : 'Processing...') : (isRTL ? 'تأكيد التسجيل' : 'Confirm Enrollment')}
                </button>
              ) : (
                <button
                  onClick={handleConfirmEnrollment}
                  disabled={true}
                  className={`w-full py-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 cursor-not-allowed border ${
                    isLight ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-gray-850 border-gray-800/80 text-gray-500'
                  }`}
                >
                  <FiShoppingBag className="text-sm" /> {isRTL ? "أدخل كوبون صالح للتسجيل" : "Enter valid coupon to enroll"}
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default CourseDetails;
