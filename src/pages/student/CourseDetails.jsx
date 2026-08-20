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
  FiCheckCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { fetchBrowseSubjects, validateCoupon, redeemCoupon, enrollWithCoupon } from '../../redux/slices/studentSlice';
import { getImageUrl } from '../../utils/imageUrl';
import { useLanguage } from '../../context/LanguageContext';

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, isRTL } = useLanguage();

  const { browseSubjects, isLoading, isActionLoading } = useSelector((state) => state.student);

  const [course, setCourse] = useState(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [validatedCouponData, setValidatedCouponData] = useState(null);

  // Fetch subjects if empty
  useEffect(() => {
    if (!browseSubjects || browseSubjects.length === 0) {
      dispatch(fetchBrowseSubjects());
    }
  }, [dispatch, browseSubjects]);

  // Find the selected course
  useEffect(() => {
    if (browseSubjects && browseSubjects.length > 0) {
      const found = browseSubjects.find(c => c._id === courseId);
      if (found) {
        setCourse(found);
      }
    }
  }, [courseId, browseSubjects]);

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
        <div className="rounded-[2.5rem] bg-gradient-to-br from-[#0c0d19]/90 to-[#0a0a12]/95 border border-gray-800/80 shadow-2xl overflow-hidden relative">
          {course.bannerUrl && (
            <div className="w-full h-48 sm:h-64 relative overflow-hidden">
              <img 
                src={getImageUrl(course.bannerUrl)} 
                alt={course.name}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d19] via-[#0c0d19]/50 to-transparent" />
            </div>
          )}
          
          <div className="p-6 sm:p-8 flex items-start gap-5 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0 shadow-lg">
              <FiBookOpen size={28} />
            </div>
            <div className="flex flex-col text-start">
              <h3 className="text-xl sm:text-2xl font-black text-white capitalize leading-tight">
                {course.name}
              </h3>
              <p className="text-sm text-gray-400 font-semibold mt-1.5 leading-normal">
                {course.description}
              </p>
            </div>
          </div>
        </div>

        {/* Grid of Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-gray-900/30 border border-gray-800/80 flex flex-col items-center justify-center text-center gap-2">
            <FiBook className="text-purple-400 text-lg" />
            <span className="text-base font-black text-white">{course.totalLessons || 0}</span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{isRTL ? "الدروس" : "Lessons"}</span>
          </div>
          
          <div className="p-5 rounded-2xl bg-gray-900/30 border border-gray-800/80 flex flex-col items-center justify-center text-center gap-2">
            <FiHelpCircle className="text-blue-400 text-lg" />
            <span className="text-base font-black text-white">{course.totalQuestions || 0}</span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{isRTL ? "الأسئلة" : "Questions"}</span>
          </div>

          <div className="p-5 rounded-2xl bg-gray-900/30 border border-gray-800/80 flex flex-col items-center justify-center text-center gap-2">
            <FiTag className="text-yellow-500 text-lg" />
            <span className="text-base font-black text-yellow-500">
              {course.price === 0 ? (isRTL ? 'مجاني' : 'Free') : `${course.price} ${isRTL ? 'نقاط' : 'Pts'}`}
            </span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{isRTL ? "السعر" : "Price"}</span>
          </div>
        </div>

        {/* Instructor Section */}
        {course.teacher && (
          <div className="p-5 rounded-2xl bg-gray-900/30 border border-gray-800/80 flex items-center gap-4 text-start">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <FiUser className="text-lg" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-white capitalize leading-tight">
                {course.teacher.name}
              </span>
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-0.5">
                {isRTL ? "محاضر الكورس" : "Course Instructor"}
              </span>
            </div>
          </div>
        )}

        {/* About Course Section */}
        <div className="flex flex-col gap-2 text-start">
          <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">{isRTL ? "عن الكورس" : "About this Course"}</h4>
          <p className="text-sm text-gray-500 leading-relaxed font-semibold">
            {isRTL 
              ? "يغطي هذا الكورس كامل المواد والشرائح الدراسية. باختيارك لهذا الكورس ستتعلم القوانين والتعاريف بالتفصيل وتجري تقييمات تحتوي على أسئلة منظمة."
              : "This course covers full materials and slide modules. By selecting this course you will learn detailed formulas, definitions, and verify assessments containing structured questions."
            }
          </p>
        </div>

        {/* Footer CTA Button */}
        {isEnrolled ? (
          <button
            onClick={() => navigate(`/student/courses/${course._id}/lessons`)}
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-sm font-black text-white transition-all shadow-[0_4px_15px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <FiPlay className={`text-sm ${isRTL ? 'rotate-180' : ''}`} />
            {isRTL ? "متابعة التعلم" : "Continue Learning"}
          </button>
        ) : (
          <button
            onClick={handleEnrollClick}
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-sm font-black text-white transition-all shadow-[0_4px_15px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2 cursor-pointer"
          >
            {isRTL ? "سجل الآن" : "Enroll Now"}
          </button>
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
              className="w-full sm:max-w-lg bg-[#0c0d19] border-t sm:border border-gray-800 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 pb-10 sm:pb-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden text-start"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Top Handle for Mobile */}
              <div className="w-12 h-1.5 bg-gray-800 rounded-full mx-auto mb-6 sm:hidden" />
              
              {/* Close Button */}
              <button 
                disabled={isActionLoading}
                onClick={() => setIsEnrollModalOpen(false)}
                className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} text-gray-500 hover:text-white transition-colors cursor-pointer disabled:opacity-50`}
              >
                <FiX size={20} />
              </button>

              {/* Course Title and Badges */}
              <div className="flex items-center gap-4 mb-6 text-start">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
                  <FiBookOpen size={24} />
                </div>
                <div className="flex flex-col text-start">
                  <h3 className="text-xl font-black text-white capitalize leading-tight">
                    {course.name}
                  </h3>
                  {course.price === 0 || validatedCouponData ? (
                    <span className="text-xs font-bold text-emerald-400 mt-1 leading-none">
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
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 flex items-center gap-3 mb-6">
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
                        className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 rounded-xl bg-gray-950/50 border border-gray-800 text-xs font-semibold text-white focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-gray-600 uppercase text-start`}
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
                    <div className="p-4 mt-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex flex-col gap-2">
                      <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-black">
                        <FiCheckCircle size={16} /> {isRTL ? "كوبون صالح:" : "Valid Coupon:"} {validatedCouponData.code}
                      </div>
                      <div className="text-gray-300 font-semibold">
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
                  className="w-full py-4 rounded-2xl bg-gray-850 text-xs font-black text-gray-500 flex items-center justify-center gap-2 cursor-not-allowed border border-gray-800/80"
                >
                  <FiShoppingBag className="text-sm" /> {isRTL ? "أدخل كوبون صالح بالشراء" : "Enter valid coupon to purchase"}
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
