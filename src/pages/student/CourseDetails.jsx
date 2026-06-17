import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBookOpen, 
  FiBook, 
  FiHelpCircle, 
  FiTag, 
  FiUsers, 
  FiUser, 
  FiPlay,
  FiX,
  FiLock,
  FiKey,
  FiSearch,
  FiShoppingBag
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { coursesData } from '../../data/coursesData';

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  // Modal enrollment states
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [isCouponApplied, setIsCouponApplied] = useState(false);

  useEffect(() => {
    // Lookup course from shared database
    const found = coursesData.find(c => c.id === courseId);
    if (!found) {
      toast.error('Course not found!');
      navigate('/student/courses');
      return;
    }
    setCourse(found);

    const storedEnrolled = localStorage.getItem('student_enrolled_courses');
    if (storedEnrolled) {
      setEnrolledCourses(JSON.parse(storedEnrolled));
    }
  }, [courseId, navigate]);

  const handleEnrollClick = () => {
    setCouponCode('');
    setIsCouponApplied(false);
    setIsEnrollModalOpen(true);
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code first.');
      return;
    }
    if (couponCode.toUpperCase().startsWith('FM-')) {
      setIsCouponApplied(true);
      toast.success('Coupon Applied! 100% Discount Activated. 🎁');
    } else {
      toast.error('Invalid coupon code. Try entering one starting with "FM-"');
    }
  };

  const handleConfirmEnrollment = () => {
    if (!course) return;
    
    const updated = [...enrolledCourses, course.id];
    setEnrolledCourses(updated);
    localStorage.setItem('student_enrolled_courses', JSON.stringify(updated));
    toast.success(`Successfully enrolled in ${course.title}! 🎉`);
    
    setIsEnrollModalOpen(false);
    
    // Trigger update
    window.dispatchEvent(new Event('profileUpdate'));
  };

  if (!course) return null;

  const isEnrolled = enrolledCourses.includes(course.id);

  return (
    <DashboardLayout
      role="student"
      activeTab="courses"
      title={course.title}
      subtitle={`Instructor: ${course.instructor}`}
      showBackButton={true}
      onBackClick={() => navigate('/student/courses')}
      isModalOpen={isEnrollModalOpen}
    >
      <div className="flex flex-col gap-6 text-left p-6 md:p-8 pb-32 lg:pb-12 w-full max-w-4xl mx-auto">
        {/* Header Box Card */}
        <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-[#0c0d19]/90 to-[#0a0a12]/95 border border-gray-800/80 shadow-2xl flex flex-col gap-4 relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
              <FiBookOpen size={28} />
            </div>
            <div className="flex flex-col text-left">
              <h3 className="text-xl font-black text-white capitalize leading-tight">
                {course.title}
              </h3>
              <p className="text-sm text-gray-500 font-semibold mt-1.5 leading-normal">
                {course.description}
              </p>
            </div>
          </div>
        </div>

        {/* Grid of Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-gray-900/30 border border-gray-800/80 flex flex-col items-center justify-center text-center gap-2">
            <FiBook className="text-purple-400 text-lg" />
            <span className="text-base font-black text-white">{course.lessonsCount}</span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Lessons</span>
          </div>
          
          <div className="p-5 rounded-2xl bg-gray-900/30 border border-gray-800/80 flex flex-col items-center justify-center text-center gap-2">
            <FiHelpCircle className="text-blue-400 text-lg" />
            <span className="text-base font-black text-white">{course.questionsCount}</span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Questions</span>
          </div>

          <div className="p-5 rounded-2xl bg-gray-900/30 border border-gray-800/80 flex flex-col items-center justify-center text-center gap-2">
            <FiTag className="text-yellow-500 text-lg" />
            <span className="text-base font-black text-yellow-500">
              {course.price === 0 ? 'Free' : `${course.price} Pts`}
            </span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Price</span>
          </div>

          <div className="p-5 rounded-2xl bg-gray-900/30 border border-gray-800/80 flex flex-col items-center justify-center text-center gap-2">
            <FiUsers className="text-emerald-400 text-lg" />
            <span className="text-base font-black text-white">{course.studentsCount}</span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Students</span>
          </div>
        </div>

        {/* Instructor Section */}
        <div className="p-5 rounded-2xl bg-gray-900/30 border border-gray-800/80 flex items-center gap-4 text-left">
          <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <FiUser className="text-lg" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-white capitalize leading-tight">
              {course.instructor}
            </span>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-0.5">
              Course Instructor
            </span>
          </div>
        </div>

        {/* About Course Section */}
        <div className="flex flex-col gap-2 text-left">
          <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">About this Course</h4>
          <p className="text-sm text-gray-500 leading-relaxed font-semibold">
            This course covers full materials and slide modules. By selecting this course you will learn detailed formulas, definitions, and verify assessments containing structured questions.
          </p>
        </div>

        {/* Footer CTA Button */}
        {isEnrolled ? (
          <button
            onClick={() => navigate(`/student/courses/${course.id}/lessons`)}
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-sm font-black text-white transition-all shadow-[0_4px_15px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <FiPlay className="text-sm" />
            Continue Learning
          </button>
        ) : (
          <button
            onClick={handleEnrollClick}
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-sm font-black text-white transition-all shadow-[0_4px_15px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2 cursor-pointer"
          >
            Enroll Now
          </button>
        )}
      </div>

      {/* ENROLL MODAL DRAWER OVERLAY */}
      <AnimatePresence>
        {isEnrollModalOpen && (
          <div 
            className="fixed inset-0 bg-[#020205]/70 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4 transition-all duration-300 animate-fade-in"
            onClick={() => setIsEnrollModalOpen(false)}
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
                onClick={() => setIsEnrollModalOpen(false)}
                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors cursor-pointer"
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
                    {course.title}
                  </h3>
                  {course.price === 0 || isCouponApplied ? (
                    <span className="text-xs font-bold text-emerald-400 mt-1 leading-none">
                      Free course
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-yellow-500 mt-1 leading-none">
                      Price: {course.price}
                    </span>
                  )}
                </div>
              </div>

              {/* Coupon inputs or Free Banners */}
              {course.price === 0 || isCouponApplied ? (
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
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-950/50 border border-gray-800 text-xs font-semibold text-white focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-gray-600 uppercase"
                      />
                    </div>
                    <button 
                      onClick={handleApplyCoupon}
                      className="w-12 h-10 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-gray-950 flex items-center justify-center transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)] hover:scale-105 cursor-pointer shrink-0"
                    >
                      <FiSearch size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm action button */}
              {course.price === 0 || isCouponApplied ? (
                <button
                  onClick={handleConfirmEnrollment}
                  className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-xs font-black text-white transition-all shadow-[0_4px_15px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="text-sm">+</span> Confirm Enrollment
                </button>
              ) : (
                <button
                  onClick={handleConfirmEnrollment}
                  className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-xs font-black text-white transition-all shadow-[0_4px_15px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FiShoppingBag className="text-sm" /> Confirm Purchase
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
