import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  FiBookOpen, 
  FiClipboard, 
  FiStar, 
  FiTrendingUp, 
  FiChevronRight,
  FiAward
} from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { fetchStudentDashboard } from '../../redux/slices/studentSlice';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const { dashboard, isLoading } = useSelector((state) => state.student);

  useEffect(() => {
    dispatch(fetchStudentDashboard());
  }, [dispatch]);

  const studentName = user?.name || 'Student';
  const points = dashboard?.student?.totalPoints || 0;
  const streakDays = dashboard?.student?.streakDays || 0;
  const overallProgress = dashboard?.student?.overallProgress || 0;
  const completedCount = dashboard?.enrollments?.reduce((sum, e) => sum + (e.completedLessons || 0), 0) || 0;
  const examsCount = dashboard?.student?.totalExamsTaken || 0;
  const avgScore = dashboard?.student?.averageScore || 0;
  const recentExams = dashboard?.recentAttempts || [];
  const coursesCount = dashboard?.enrollments?.length || 0;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <DashboardLayout
      role="student"
      activeTab="dashboard"
      title="Student Panel"
      subtitle="Student Portal Overview 🎒"
    >
      <div className="flex flex-col gap-6 text-left p-6 md:p-8 pb-32 lg:pb-12 w-full">
        {isLoading ? (
          <div className="flex flex-col gap-6 w-full animate-fade-in">
            {/* Banner Skeleton */}
            <div className="relative rounded-[2.5rem] p-8 bg-[#0c0d19]/40 border border-gray-800/80 h-52 flex flex-col justify-between animate-pulse">
              <div className="flex flex-col gap-2">
                <div className="h-4 w-32 bg-gray-800 rounded-md" />
                <div className="h-8 w-48 bg-gray-800 rounded-md mt-2" />
                <div className="h-4 w-64 bg-gray-800 rounded-md mt-1" />
              </div>
              <div className="h-3 w-full bg-gray-800 rounded-full mt-4" />
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 rounded-3xl bg-[#0c0d19]/40 border border-gray-800/80 h-28 flex flex-col justify-between animate-pulse">
                  <div className="w-10 h-10 rounded-2xl bg-gray-800" />
                  <div className="h-6 w-12 bg-gray-800 rounded-md" />
                  <div className="h-3 w-16 bg-gray-800 rounded-md" />
                </div>
              ))}
            </div>

            {/* Courses Section Skeleton */}
            <div className="flex flex-col gap-3">
              <div className="h-6 w-36 bg-gray-800 rounded-md" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-40 rounded-3xl bg-[#0c0d19]/40 border border-gray-800/80 animate-pulse" />
                <div className="h-40 rounded-3xl bg-[#0c0d19]/40 border border-gray-800/80 animate-pulse" />
              </div>
            </div>

            {/* Recent Exams Skeleton */}
            <div className="flex flex-col gap-3">
              <div className="h-6 w-36 bg-gray-800 rounded-md" />
              <div className="flex flex-col gap-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-[#0c0d19]/40 border border-gray-800/80 h-16 animate-pulse">
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-10 h-10 rounded-xl bg-gray-800" />
                      <div className="flex flex-col gap-2 flex-1">
                        <div className="h-4 w-1/3 bg-gray-800 rounded-md" />
                        <div className="h-3 w-1/5 bg-gray-800 rounded-md" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6 w-full"
          >
            {/* 1. PROGRESS / WELCOME PANEL */}
            <motion.div 
              variants={itemVariants}
              className="relative rounded-3xl p-6 overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-600 dark:from-[#1b1c3a]/90 dark:to-[#0e0f24]/95 border border-purple-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.6),_inset_0_1px_0_rgba(255,255,255,0.05),_0_0_30px_rgba(168,85,247,0.08)]"
            >
              <div className="absolute top-4 left-4 text-purple-400/30 text-xs select-none">✦</div>
              <div className="absolute top-12 left-8 text-purple-400/20 text-sm select-none">✦</div>
              <div className="absolute bottom-8 left-16 text-purple-400/30 text-xs select-none">✦</div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex-1 flex flex-col items-start text-left w-full">
                  <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs uppercase font-bold tracking-wider text-purple-300 mb-4 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                    <span className="text-xs">✨</span> Your Progress Today
                  </div>
                  
                  <h2 className="text-gray-400 text-base font-semibold tracking-wide">
                    Welcome back,
                  </h2>
                  <h1 className="text-3xl font-black text-white mt-1 flex items-center gap-2">
                    {studentName}! <span className="animate-bounce inline-block">👋</span>
                  </h1>
                  
                  <p className="text-gray-400 text-sm font-semibold mt-2 max-w-xs leading-relaxed">
                    Ready to continue your learning journey today?
                  </p>
                  
                  <div className="w-full mt-6">
                    <div className="flex items-center justify-between text-sm font-bold mb-2">
                      <span className="text-gray-500">Overall Progress</span>
                      <span className="text-emerald-400">{overallProgress}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-950/60 rounded-full overflow-hidden border border-gray-900">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${overallProgress}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 w-full mt-6">
                    <div className="rounded-2xl p-2.5 flex flex-col items-center justify-center bg-yellow-500/5 border border-yellow-500/35 shadow-[0_0_15px_rgba(234,179,8,0.05)] text-center">
                      <FiStar className="text-yellow-400 text-base mb-1" />
                      <span className="text-base font-black text-white">{points}</span>
                      <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider">Points</span>
                    </div>
                    <div className="rounded-2xl p-2.5 flex flex-col items-center justify-center bg-pink-500/5 border border-pink-500/35 shadow-[0_0_15px_rgba(236,72,153,0.05)] text-center">
                      <FaFire className="text-pink-400 text-base mb-1" />
                      <span className="text-base font-black text-white">{streakDays}</span>
                      <span className="text-xs font-bold text-pink-500 uppercase tracking-wider">Streak</span>
                    </div>
                    <div className="rounded-2xl p-2.5 flex flex-col items-center justify-center bg-emerald-500/5 border border-emerald-500/35 shadow-[0_0_15px_rgba(16,185,129,0.05)] text-center">
                      <FiTrendingUp className="text-emerald-400 text-base mb-1" />
                      <span className="text-base font-black text-white">{overallProgress}%</span>
                      <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Overall</span>
                    </div>
                  </div>
                </div>
                
                <div className="relative shrink-0 flex items-center justify-center">
                  <div className="absolute w-44 h-44 rounded-full border border-purple-500/10 animate-pulse pointer-events-none" />
                  <div className="absolute w-36 h-36 rounded-full border border-purple-500/5 pointer-events-none" />
                  
                  <svg viewBox="0 0 200 200" className="w-36 h-36 relative z-10 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
                    <circle cx="100" cy="110" r="72" fill="none" stroke="rgba(168, 85, 247, 0.1)" strokeWidth="1.5" strokeDasharray="5 5" />
                    <circle cx="100" cy="110" r="56" fill="none" stroke="rgba(168, 85, 247, 0.15)" strokeWidth="1" />
                    
                    <path d="M60 160 C60 120, 140 120, 140 160 Z" fill="#3b82f6" />
                    <ellipse cx="65" cy="148" rx="10" ry="18" fill="#2563eb" transform="rotate(-15 65 148)" />
                    <ellipse cx="135" cy="148" rx="10" ry="18" fill="#2563eb" transform="rotate(15 135 148)" />
                    
                    <circle cx="58" cy="162" r="8" fill="#fbcfe8" />
                    <circle cx="142" cy="162" r="8" fill="#fbcfe8" />
                    
                    <rect x="92" y="102" width="16" height="15" fill="#fbcfe8" rx="4" />
                    
                    <path d="M90 112 L100 123 L110 112 Z" fill="#1d4ed8" />
                    
                    <circle cx="100" cy="85" r="28" fill="#fbcfe8" />
                    
                    <path d="M72 82 C72 65, 128 65, 128 82 Z" fill="#451a03" />
                    <path d="M72 80 C80 75, 90 75, 95 82 C100 75, 115 75, 128 80 C125 70, 75 70, 72 80 Z" fill="#451a03" />
                    
                    <circle cx="90" cy="85" r="3.5" fill="#000" />
                    <circle cx="110" cy="85" r="3.5" fill="#000" />
                    <circle cx="89" cy="84" r="1.2" fill="#fff" />
                    <circle cx="109" cy="84" r="1.2" fill="#fff" />
                    
                    <path d="M83 78 Q90 75 97 79" fill="none" stroke="#451a03" strokeWidth="2.2" strokeLinecap="round" />
                    <path d="M103 79 Q110 75 117 78" fill="none" stroke="#451a03" strokeWidth="2.2" strokeLinecap="round" />
                    
                    <path d="M98 90 Q100 93 102 90" fill="none" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" />
                    
                    <path d="M90 96 Q100 104 110 96" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
                    
                    <circle cx="100" cy="138" r="11" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
                    <polygon points="100,131 102,135 106,136 103,139 104,144 100,141 96,144 97,139 94,136 98,135" fill="#fff" />
                    
                    <path d="M85 64 L85 58 C85 58, 100 55, 115 58 L115 64 Z" fill="#1f2937" />
                    <polygon points="100,48 140,58 100,68 60,58" fill="#111827" stroke="#1f2937" strokeWidth="1" />
                    <circle cx="100" cy="58" r="2.5" fill="#fbbf24" />
                    <path d="M100 58 Q120 58 128 68 L126 76" fill="none" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* 2. STATS LINK CARDS GRID */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {/* Card 1: Courses */}
              <button 
                onClick={() => navigate('/student/courses')}
                className="flex flex-col items-start p-4 rounded-3xl bg-[#0c0d19]/40 border border-cyan-500/25 hover:border-cyan-500/60 shadow-[0_4px_20px_rgba(0,0,0,0.3),_inset_0_1px_0_rgba(255,255,255,0.02)] hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all duration-300 text-left group"
              >
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 transition-transform group-hover:scale-110">
                  <FiBookOpen className="text-lg" />
                </div>
                <span className="text-2xl font-black text-white leading-none mb-1">
                  {coursesCount}
                </span>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                  Courses
                </span>
              </button>

              {/* Card 2: Exams */}
              <button 
                onClick={() => navigate('/student/exams')}
                className="flex flex-col items-start p-4 rounded-3xl bg-[#0c0d19]/40 border border-purple-500/25 hover:border-purple-500/60 shadow-[0_4px_20px_rgba(0,0,0,0.3),_inset_0_1px_0_rgba(255,255,255,0.02)] hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all duration-300 text-left group"
              >
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 transition-transform group-hover:scale-110">
                  <FiClipboard className="text-lg" />
                </div>
                <span className="text-2xl font-black text-white leading-none mb-1">
                  {examsCount}
                </span>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                  Exams
                </span>
              </button>

              {/* Card 3: Avg Score */}
              <button 
                onClick={() => navigate('/student/results')}
                className="flex flex-col items-start p-4 rounded-3xl bg-[#0c0d19]/40 border border-yellow-500/25 hover:border-yellow-500/60 shadow-[0_4px_20px_rgba(0,0,0,0.3),_inset_0_1px_0_rgba(255,255,255,0.02)] hover:shadow-[0_0_20px_rgba(234,179,8,0.15)] transition-all duration-300 text-left group"
              >
                <div className="w-10 h-10 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 mb-4 transition-transform group-hover:scale-110">
                  <FiStar className="text-lg" />
                </div>
                <span className="text-2xl font-black text-white leading-none mb-1">
                  {avgScore}%
                </span>
                <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">
                  Avg Score
                </span>
              </button>

              {/* Card 4: Streak */}
              <div 
                className="flex flex-col items-start p-4 rounded-3xl bg-[#0c0d19]/40 border border-pink-500/25 hover:border-pink-500/60 shadow-[0_4px_20px_rgba(0,0,0,0.3),_inset_0_1px_0_rgba(255,255,255,0.02)] hover:shadow-[0_0_20px_rgba(236,72,153,0.15)] transition-all duration-300 text-left group"
              >
                <div className="w-10 h-10 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-4 transition-transform group-hover:scale-110">
                  <FaFire className="text-lg" />
                </div>
                <span className="text-2xl font-black text-white leading-none mb-1 flex items-center gap-1">
                  {streakDays}d <span className="text-sm">🔥</span>
                </span>
                <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider">
                  Streak
                </span>
              </div>
            </motion.div>

            {/* 3. CONTINUE LEARNING SECTION */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col gap-3 text-left mt-2"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span>✨</span> Continue Learning
                </h3>
                <button 
                  onClick={() => navigate('/student/courses')}
                  className="px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-sm font-extrabold text-gray-400 hover:text-white transition-all cursor-pointer shadow-[0_2px_10px_rgba(0,0,0,0.2)]"
                >
                  See all
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {dashboard?.enrollments?.slice(0, 2).map((enrollment, idx) => (
                  <div 
                    key={enrollment.subject?._id || idx}
                    onClick={() => navigate(`/student/courses/${enrollment.subject?._id}`)}
                    className="group relative rounded-3xl p-6 overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 dark:from-[#4a2b91] dark:to-[#25155c] dark:hover:from-[#5833ab] dark:hover:to-[#2c196e] border border-purple-500/30 shadow-[0_15px_35px_rgba(0,0,0,0.5),_0_0_25px_rgba(139,92,246,0.15)] transition-all duration-300 cursor-pointer flex flex-col items-start gap-4 min-h-[160px] justify-between"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/10 rounded-bl-full pointer-events-none" />
                    
                    <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/10 flex items-center justify-center text-white shadow-[0_4px_15px_rgba(0,0,0,0.2)] transition-transform group-hover:scale-105">
                      <FiBookOpen className="text-xl" />
                    </div>

                    <div className="flex flex-col items-start">
                      <h4 className="text-lg font-black text-white capitalize leading-tight group-hover:text-purple-200 transition-colors">
                        {enrollment.subject?.name}
                      </h4>
                      <span className="text-sm text-gray-300 font-semibold mt-1">
                        {enrollment.completedLessons}/{enrollment.subject?.totalLessons || 0} lessons
                      </span>
                    </div>
                  </div>
                ))}
                {(!dashboard?.enrollments || dashboard.enrollments.length === 0) && (
                  <div 
                    onClick={() => navigate('/student/courses')}
                    className="col-span-2 p-6 rounded-3xl bg-[#0c0d19]/40 border border-gray-850 text-center font-bold text-gray-500 hover:text-white hover:border-gray-700 cursor-pointer transition-all"
                  >
                    No active courses. Tap to browse & enroll.
                  </div>
                )}
              </div>
            </motion.div>

            {/* 4. RECENT EXAMS SECTION */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col gap-3 text-left mt-2"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span>📋</span> Recent Exams
                </h3>
                <button 
                  onClick={() => navigate('/student/results')}
                  className="px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-sm font-extrabold text-gray-400 hover:text-white transition-all cursor-pointer shadow-[0_2px_10px_rgba(0,0,0,0.2)]"
                >
                  See all
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {recentExams.slice(0, 3).map((attempt, idx) => (
                  <div 
                    key={attempt._id || idx}
                    className="flex items-center justify-between p-4 rounded-2xl bg-[#0c0d19]/40 border border-gray-800 hover:border-gray-700 hover:bg-[#111222]/50 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                        <FiBookOpen className="text-lg" />
                      </div>
                      <div className="flex flex-col items-start text-left">
                        <h4 className="text-base font-bold text-white capitalize">
                          {attempt.exam?.title || attempt.subject?.name || 'Practice Exam'}
                        </h4>
                        <span className="text-xs font-bold text-gray-500 mt-1">
                          {new Date(attempt.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-base font-extrabold text-[#10b981]">
                        {attempt.score}%
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                        attempt.passed 
                          ? 'bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981]' 
                          : 'bg-[#ec4899]/10 border border-[#ec4899]/20 text-[#ec4899]'
                      }`}>
                        {attempt.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  </div>
                ))}
                {recentExams.length === 0 && (
                  <p className="text-sm text-gray-500 py-4 italic">No exam submissions yet.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
