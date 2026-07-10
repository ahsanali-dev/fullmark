import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiBookOpen,
  FiBook,
  FiSearch,
  FiUsers,
  FiHelpCircle,
  FiChevronRight,
  FiX,
  FiLock,
  FiKey,
  FiShoppingBag
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { fetchBrowseSubjects, validateCoupon, enrollWithCoupon } from '../../redux/slices/studentSlice';

const Courses = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux Selectors
  const { browseSubjects, isLoading, isActionLoading } = useSelector((state) => state.student);

  // Filter & search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  // Modal enrollment states
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [activeEnrollCourse, setActiveEnrollCourse] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [validatedCouponData, setValidatedCouponData] = useState(null);

  // Fetch browse subjects on load
  useEffect(() => {
    dispatch(fetchBrowseSubjects());
  }, [dispatch]);

  const handleEnrollClick = (course) => {
    setActiveEnrollCourse(course);
    setCouponCode('');
    setValidatedCouponData(null);
    setIsEnrollModalOpen(true);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code.');
      return;
    }
    const myToast = toast.loading('Validating coupon...');
    try {
      const res = await dispatch(validateCoupon(couponCode)).unwrap();
      toast.dismiss(myToast);
      setValidatedCouponData(res);
      toast.success('Coupon validation successful! 🎁');
    } catch (err) {
      toast.dismiss(myToast);
      toast.error(err || 'Invalid or expired coupon code.');
      setValidatedCouponData(null);
    }
  };

  const handleConfirmEnrollment = async () => {
    if (!activeEnrollCourse) return;

    const isFree = activeEnrollCourse.price === 0;
    if (!isFree && !validatedCouponData) {
      toast.error('Please validate a coupon first.');
      return;
    }

    const myToast = toast.loading(isFree ? 'Enrolling...' : 'Processing purchase...');
    try {
      await dispatch(enrollWithCoupon({
        subjectId: activeEnrollCourse._id,
        couponCode: isFree ? '' : couponCode,
      })).unwrap();

      toast.dismiss(myToast);
      toast.success(`Successfully enrolled in ${activeEnrollCourse.name}! 🎉`);
      setIsEnrollModalOpen(false);
      setActiveEnrollCourse(null);
      setValidatedCouponData(null);
      // Refresh subject catalog
      dispatch(fetchBrowseSubjects());
    } catch (err) {
      toast.dismiss(myToast);
      toast.error(err || 'Failed to enroll.');
    }
  };

  // Generate dynamic tag filters
  const courseTags = ['All', 'Enrolled', 'Available'];
  if (browseSubjects && browseSubjects.length > 0) {
    const subjectNames = [...new Set(browseSubjects.map(s => s.name))];
    courseTags.push(...subjectNames);
  }

  // Filtering Logic
  const filteredCourses = (browseSubjects || []).filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedTag === 'Enrolled') return c.isEnrolled;
    if (selectedTag === 'Available') return !c.isEnrolled;
    if (selectedTag !== 'All') {
      return c.name.toLowerCase() === selectedTag.toLowerCase();
    }
    return true;
  });

  const enrolledCount = (browseSubjects || []).filter(s => s.isEnrolled).length;
  const availableCount = (browseSubjects || []).length - enrolledCount;

  return (
    <DashboardLayout
      role="student"
      activeTab="courses"
      title="My Courses"
      subtitle={`${enrolledCount} enrolled · ${availableCount} available`}
      showBackButton={false}
      isModalOpen={isEnrollModalOpen}
    >
      <div className="flex flex-col gap-6 text-left p-6 md:p-8 pb-32 lg:pb-12 w-full">
        {/* Search input */}
        <div className="relative w-full">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-gray-900/50 border border-gray-800 text-sm font-semibold text-white focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-gray-500"
          />
        </div>

        {/* Tag filters (horizontal scrollable) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none w-full">
          {courseTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-full text-xs font-black tracking-wide whitespace-nowrap transition-all border capitalize ${
                selectedTag === tag
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  : 'bg-gray-900/40 border-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {isLoading ? (
            Array(4).fill(0).map((_, idx) => <CardSkeleton key={idx} />)
          ) : (
            filteredCourses.map((course) => {
              const isEnrolled = course.isEnrolled;
              const isFree = course.price === 0;

              // Progress math
              const totalLessons = course.totalLessons || 0;
              const completedCount = course.completedLessons || 0;
              const progressPercent = course.progress ? Math.round(course.progress * 100) : 0;

              return (
                <div
                  key={course._id}
                  onClick={() => {
                    if (isEnrolled) {
                      navigate(`/student/courses/${course._id}/lessons`);
                    } else {
                      handleEnrollClick(course);
                    }
                  }}
                  className="p-5 rounded-[2rem] bg-gradient-to-br from-[#0c0d19]/90 to-[#0a0a12]/95 border border-gray-800/80 hover:border-emerald-500/20 shadow-xl flex flex-col justify-between gap-4 relative overflow-hidden transition-all duration-300 hover:translate-y-[-2px] cursor-pointer group"
                >
                  {/* Enrolled/Price badge */}
                  <div className="absolute top-4 right-4 z-10">
                    {isEnrolled ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Enrolled
                      </span>
                    ) : isFree ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400">
                        Free
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[10px] font-black text-yellow-400">
                        {course.price} Pts
                      </span>
                    )}
                  </div>

                  {/* Title & icon */}
                  <div className="flex flex-col text-left gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)] shrink-0">
                      <FiBookOpen size={18} className="group-hover:scale-110 transition-transform" />
                    </div>

                    <div className="flex flex-col text-left">
                      <h3 className="text-base font-black text-white capitalize leading-tight group-hover:text-emerald-400 transition-colors">
                        {course.name}
                      </h3>
                      <span className="text-xs text-gray-500 font-bold mt-1 leading-snug line-clamp-1">
                        {course.description}
                      </span>
                      {course.teacher && (
                        <span className="text-xs text-gray-400 font-bold mt-2">
                          Instructor: {course.teacher.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-gray-800/40 pt-3 mt-1">
                    {/* Stat pills info */}
                    <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                      <span className="flex items-center gap-1">
                        <FiBook className="text-blue-400" />
                        {course.totalLessons || 0} lessons
                      </span>
                      <span className="flex items-center gap-1">
                        <FiHelpCircle className="text-blue-400" />
                        {course.totalQuestions || 0} Qs
                      </span>
                      <span className="flex items-center gap-1">
                        <FiUsers className="text-yellow-500" />
                        {course.totalStudents || 0}
                      </span>
                    </div>

                    {/* Bottom row: Progress bar */}
                    <div className="flex flex-col gap-2">
                      {isEnrolled && totalLessons > 0 ? (
                        <div className="flex flex-col gap-1.5 flex-1">
                          <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                            <span>{completedCount}/{totalLessons} lessons</span>
                            <span className="text-blue-400">{progressPercent}%</span>
                          </div>
                          <div className="h-1 w-full bg-gray-900 rounded-full overflow-hidden border border-gray-800/60">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 font-bold">
                          {!isEnrolled && !isFree ? `Requires ${course.price} Points` : 'Available to study'}
                        </div>
                      )}

                      {/* Continue/Enroll button */}
                      {isEnrolled ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/student/courses/${course._id}/lessons`);
                          }}
                          className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-black text-white transition-all shadow-[0_4px_12px_rgba(37,99,235,0.25)] hover:scale-102 cursor-pointer flex items-center justify-center gap-1"
                        >
                          Continue <FiChevronRight />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEnrollClick(course);
                          }}
                          className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-black text-white transition-all shadow-[0_4px_12px_rgba(37,99,235,0.25)] hover:scale-102 cursor-pointer flex items-center justify-center gap-1"
                        >
                          Enroll +
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {!isLoading && filteredCourses.length === 0 && (
            <div className="col-span-2 lg:col-span-4 p-8 text-center bg-[#0c0d19]/40 border border-gray-800/80 rounded-3xl flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-gray-500">No courses match your search filters.</span>
            </div>
          )}
        </div>
      </div>

      {/* ENROLL MODAL DRAWER OVERLAY */}
      <AnimatePresence>
        {isEnrollModalOpen && activeEnrollCourse && (
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
              className="w-full sm:max-w-lg bg-[#0c0d19] border-t sm:border border-gray-800 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 pb-10 sm:pb-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Top Handle for Mobile */}
              <div className="w-12 h-1.5 bg-gray-800 rounded-full mx-auto mb-6 sm:hidden" />

              {/* Close Button */}
              <button
                disabled={isActionLoading}
                onClick={() => setIsEnrollModalOpen(false)}
                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                <FiX size={20} />
              </button>

              {/* Course Title and Badges */}
              <div className="flex items-center gap-4 mb-6 text-left">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
                  <FiBookOpen size={24} />
                </div>
                <div className="flex flex-col text-left">
                  <h3 className="text-xl font-black text-white capitalize leading-tight">
                    {activeEnrollCourse.name}
                  </h3>
                  {activeEnrollCourse.price === 0 || validatedCouponData ? (
                    <span className="text-xs font-bold text-emerald-400 mt-1 leading-none">
                      Free / Fully covered by coupon
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-yellow-500 mt-1 leading-none">
                      Price: {activeEnrollCourse.price} Points
                    </span>
                  )}
                </div>
              </div>

              {/* Coupon inputs or Free Banners */}
              {activeEnrollCourse.price === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 flex items-center gap-3 mb-6">
                  <FiLock className="text-lg shrink-0" />
                  <span className="text-xs font-bold">This course is free — no coupon needed.</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 mb-6">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-wider">
                    Enter your coupon code
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <FiKey className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                      <input
                        type="text"
                        placeholder="FM-XXXXXXXXX"
                        value={couponCode}
                        disabled={isActionLoading || validatedCouponData}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-950/50 border border-gray-800 text-xs font-semibold text-white focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-gray-600 uppercase"
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
                    <div className="p-3.5 mt-2 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex flex-col gap-1">
                      <div>Coupon Applied successfully!</div>
                      <div className="text-gray-400 font-semibold mt-1">Remaining Balance: {validatedCouponData.remainingBalance} Pts</div>
                    </div>
                  )}
                </div>
              )}

              {/* Confirm action button */}
              {activeEnrollCourse.price === 0 || validatedCouponData ? (
                <button
                  onClick={handleConfirmEnrollment}
                  disabled={isActionLoading}
                  className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-xs font-black text-white transition-all shadow-[0_4px_15px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isActionLoading ? 'Processing...' : 'Confirm Enrollment'}
                </button>
              ) : (
                <button
                  onClick={handleConfirmEnrollment}
                  disabled={true}
                  className="w-full py-4 rounded-2xl bg-gray-850 text-xs font-black text-gray-500 flex items-center justify-center gap-2 cursor-not-allowed border border-gray-800/80"
                >
                  <FiShoppingBag className="text-sm" /> Enter valid coupon to purchase
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default Courses;
