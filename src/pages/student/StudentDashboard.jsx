import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  FiBookOpen, 
  FiClipboard, 
  FiStar, 
  FiTarget, 
  FiAward,
  FiPlay,
  FiCheckCircle,
  FiChevronRight,
  FiZap
} from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { fetchStudentDashboard } from '../../redux/slices/studentSlice';
import { useLanguage } from '../../context/LanguageContext';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, isRTL } = useLanguage();

  const user = useSelector((state) => state.auth.user);
  const { dashboard, isLoading } = useSelector((state) => state.student);

  const [isLight, setIsLight] = React.useState(() => document.documentElement.classList.contains('light'));

  useEffect(() => {
    dispatch(fetchStudentDashboard());
  }, [dispatch]);

  useEffect(() => {
    const handleThemeChange = () => {
      setIsLight(document.documentElement.classList.contains('light'));
    };
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  const studentName = user?.name || user?.fullName || (isRTL ? 'علي' : 'Ali');
  const points = dashboard?.student?.totalPoints || 40;
  const streakDays = dashboard?.student?.streakDays || 1;
  const examsCount = dashboard?.student?.totalExamsTaken || 5;
  const recentExams = dashboard?.recentAttempts || [];
  const enrollments = dashboard?.enrollments || [];
  const activeCourse = (isRTL && enrollments[0]?.subject?.nameAr) 
    ? enrollments[0].subject.nameAr 
    : (enrollments[0]?.subject?.name || (isRTL ? 'الكيمياء' : 'Chemistry'));

  return (
    <DashboardLayout
      role="student"
      activeTab="dashboard"
      title={t('student.dashboard.title')}
      subtitle={t('student.dashboard.subtitle')}
    >
      <div className="flex flex-col gap-6 text-start p-4 sm:p-6 md:p-8 pb-32 lg:pb-12 max-w-[1200px] mx-auto w-full">
        
        {isLoading ? (
          /* Loading Skeleton */
          <div className="flex flex-col gap-6 w-full animate-pulse">
            <div className="h-8 w-64 bg-gray-800 rounded-lg" />
            <div className="h-64 w-full bg-[#0d0d21] border border-gray-800 rounded-3xl" />
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-[#090b17] rounded-2xl border border-gray-800" />
              ))}
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-6 w-full"
          >
            {/* ── TOP GREETING HEADER ── */}
            <div className="flex flex-col text-start">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {t('student.dashboard.greeting')}, {studentName}?
              </h1>
              <p className="text-sm font-semibold text-gray-400 mt-1">
                {t('student.dashboard.dailyMissionWaiting')}
              </p>
            </div>

            {/* ── 1. DAILY MISSION HERO CARD ── */}
            <div className={`relative rounded-[2.2rem] p-5 sm:p-6 transition-all duration-300 overflow-hidden flex flex-col gap-5 ${
              isLight 
                ? 'bg-gradient-to-br from-indigo-50/95 via-purple-50/95 to-white border border-purple-200 shadow-[0_10px_30px_rgba(147,51,234,0.08)] text-slate-900' 
                : 'bg-gradient-to-br from-[#120a2e] via-[#0d0d21] to-[#0a0718] border border-purple-500/40 shadow-[0_12px_40px_rgba(18,10,46,0.9),_0_0_30px_rgba(168,85,247,0.12)] text-white'
            }`}>
              
              {/* Card Title Header */}
              <div className="flex items-center gap-2 font-bold text-base">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                  isLight 
                    ? 'bg-purple-100 border border-purple-300 text-purple-700' 
                    : 'bg-purple-500/20 border border-purple-400/40 text-purple-300'
                }`}>
                  <FiTarget size={14} />
                </div>
                <span className={isLight ? 'text-slate-900 font-extrabold' : 'keep-white'}>
                  {t('student.dashboard.dailyMission')}
                </span>
              </div>

              {/* Main Content Area: Progress Ring + Checklist Pill Box + 3D Robot Mascot */}
              <div className="flex items-center justify-between gap-3 sm:gap-6">
                
                {/* Circular Progress Ring */}
                <div className="relative shrink-0 flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    <defs>
                      <linearGradient id="cyanPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                    <circle cx="50" cy="50" r="40" fill="none" stroke={isLight ? "#e2e8f0" : "#181534"} strokeWidth="10" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="none" 
                      stroke="url(#cyanPurpleGrad)" 
                      strokeWidth="10" 
                      strokeDasharray="251.2"
                      strokeDashoffset="251.2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-black">
                    <span className={`text-2xl sm:text-3xl ${isLight ? 'text-slate-900' : 'keep-white'}`}>0</span>
                    <span className={`text-sm font-bold ${isRTL ? 'mr-0.5' : 'ml-0.5'} ${isLight ? 'text-purple-700' : 'keep-purple-light'}`}>/3</span>
                  </div>
                </div>

                {/* Checklist Pills Stack */}
                <div className="flex-1 flex flex-col gap-2 max-w-[210px]">
                  <div className={`px-3 py-2 rounded-xl flex items-center gap-2.5 text-xs font-bold shadow-sm ${
                    isLight 
                      ? 'bg-white/90 border border-purple-200/80 text-slate-800' 
                      : 'bg-white/10 border border-white/15 text-white'
                  }`}>
                    <FiBookOpen size={14} className={isLight ? "text-purple-600 shrink-0" : "text-purple-300 shrink-0"} />
                    <span className="truncate">{activeCourse} {t('student.dashboard.lesson')}</span>
                  </div>
                  <div className={`px-3 py-2 rounded-xl flex items-center gap-2.5 text-xs font-bold shadow-sm ${
                    isLight 
                      ? 'bg-white/90 border border-purple-200/80 text-slate-800' 
                      : 'bg-white/10 border border-white/15 text-white'
                  }`}>
                    <FiTarget size={14} className={isLight ? "text-cyan-600 shrink-0" : "text-cyan-300 shrink-0"} />
                    <span className="truncate">{t('student.dashboard.weaknessReview')}</span>
                  </div>
                  <div className={`px-3 py-2 rounded-xl flex items-center gap-2.5 text-xs font-bold shadow-sm ${
                    isLight 
                      ? 'bg-white/90 border border-purple-200/80 text-slate-800' 
                      : 'bg-white/10 border border-white/15 text-white'
                  }`}>
                    <FiClipboard size={14} className={isLight ? "text-blue-600 shrink-0" : "text-blue-300 shrink-0"} />
                    <span className="truncate">{t('student.dashboard.dailyExam')}</span>
                  </div>
                </div>

                {/* 3D AI Robot Mascot Image */}
                <div className="shrink-0 relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full" />
                  <img 
                    src="/assets/images/robot_mascot.png" 
                    alt="AI Robot Mascot" 
                    className="w-24 sm:w-32 md:w-36 h-24 sm:h-32 md:h-36 object-contain relative z-10 filter drop-shadow-[0_0_20px_rgba(168,85,247,0.4)] animate-pulse"
                  />
                </div>
              </div>

              {/* Reward Subtext */}
              <div className={`flex items-center gap-1.5 text-xs font-bold ${isLight ? 'text-purple-900' : 'text-indigo-300'} mt-1`}>
                <FiStar className="text-yellow-500 fill-yellow-500" size={13} />
                <span>
                  {t('student.dashboard.completeAllToEarn')}
                  <strong className={isLight ? 'text-purple-950 font-black' : 'keep-white'}>
                    {t('student.dashboard.pointsEarn')}
                  </strong>
                </span>
              </div>

              {/* Start Mission CTA Button */}
              <button 
                onClick={() => navigate('/student/courses')}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-base shadow-[0_0_25px_rgba(99,102,241,0.35)] hover:shadow-[0_0_35px_rgba(168,85,247,0.5)] transition-all cursor-pointer active:scale-[0.99]"
              >
                {t('student.dashboard.startMission')}
              </button>
            </div>

            {/* ── 2. STATS ROW (3 Metric Cards Grid) ── */}
            <div className="grid grid-cols-3 gap-3.5">
              {/* Metric 1: Points */}
              <div className="p-4 rounded-2xl bg-[#090b17] border border-gray-800/80 flex items-center gap-3 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 dark:text-cyan-400 shrink-0">
                  <FiStar size={18} />
                </div>
                <div className="flex flex-col text-start">
                  <span className="text-xl sm:text-2xl font-black text-white leading-none">
                    {points}
                  </span>
                  <span className="text-xs font-bold text-gray-400 mt-1">{t('student.dashboard.points')}</span>
                </div>
              </div>

              {/* Metric 2: Streak */}
              <div className="p-4 rounded-2xl bg-[#090b17] border border-gray-800/80 flex items-center gap-3 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 dark:text-orange-400 shrink-0">
                  <FaFire size={18} />
                </div>
                <div className="flex flex-col text-start">
                  <span className="text-xl sm:text-2xl font-black text-white leading-none flex items-center gap-1">
                    {streakDays} <span className="text-xs font-bold text-gray-300">{t('student.dashboard.day')}</span>
                  </span>
                  <span className="text-xs font-bold text-gray-400 mt-1">{t('student.dashboard.streak')}</span>
                </div>
              </div>

              {/* Metric 3: Exams */}
              <div className="p-4 rounded-2xl bg-[#090b17] border border-gray-800/80 flex items-center gap-3 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                  <FiClipboard size={18} />
                </div>
                <div className="flex flex-col text-start">
                  <span className="text-xl sm:text-2xl font-black text-white leading-none">
                    {examsCount}
                  </span>
                  <span className="text-xs font-bold text-gray-400 mt-1">{t('student.dashboard.exams')}</span>
                </div>
              </div>
            </div>

            {/* ── 3. "JUMP BACK IN" SECTION ── */}
            <div className="flex flex-col gap-3.5 text-start mt-1">
              <h3 className="text-lg font-black text-white">{t('student.dashboard.jumpBackIn')}</h3>

              {/* Main Course Progress Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#090b17] border border-gray-800/80 flex items-center justify-between gap-4 shadow-md">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center text-purple-700 dark:text-purple-400 shrink-0 shadow-inner">
                    <FiBookOpen size={22} />
                  </div>
                  <div className="flex flex-col text-start min-w-0">
                    <h4 className="text-base font-black text-white truncate">
                      {activeCourse}
                    </h4>
                    <span className="text-xs font-semibold text-gray-400 mt-0.5">
                      {t('student.dashboard.unitLesson')}
                    </span>
                    <div className="flex items-center gap-2 mt-1.5 w-full">
                      <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">{t('student.dashboard.completePercent')}</span>
                      <div className="h-1.5 w-24 bg-slate-200 dark:bg-gray-900 rounded-full overflow-hidden border border-slate-300 dark:border-gray-800">
                        <div className="h-full bg-blue-500 rounded-full w-0" />
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => navigate('/student/courses')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 border border-blue-600 dark:border-blue-500/40 text-white dark:text-blue-300 text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm"
                >
                  {t('student.dashboard.continue')}
                </button>
              </div>

              {/* 2-Card Row under Jump Back In */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* Card 1: Fix Weak Topics */}
                <div className="p-4 rounded-2xl bg-[#090b17] border border-cyan-500/20 flex items-center justify-between gap-3 shadow-md hover:border-cyan-500/40 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
                      <FiTarget size={18} />
                    </div>
                    <div className="flex flex-col text-start">
                      <h5 className="text-sm font-black text-white">{t('student.dashboard.fixWeakTopics')}</h5>
                      <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">{t('student.dashboard.questionsDue')}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate('/student/weaknesses')}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500/10 dark:hover:bg-cyan-500/20 border border-cyan-600 dark:border-cyan-500/40 text-white dark:text-cyan-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    {t('student.dashboard.review')}
                  </button>
                </div>

                {/* Card 2: Challenge a Friend */}
                <div className="p-4 rounded-2xl bg-[#090b17] border border-purple-500/20 flex items-center justify-between gap-3 shadow-md hover:border-purple-500/40 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-400/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                      <FiAward size={18} />
                    </div>
                    <div className="flex flex-col text-start">
                      <h5 className="text-sm font-black text-white">{t('student.dashboard.challengeFriend')}</h5>
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400 mt-0.5">{t('student.dashboard.examDuel')}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate('/student/exams')}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 dark:bg-purple-500/10 dark:hover:bg-purple-500/20 border border-purple-600 dark:border-purple-500/40 text-white dark:text-purple-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    {t('student.dashboard.challenge')}
                  </button>
                </div>

              </div>
            </div>

            {/* ── 4. "RECENT RESULT" SECTION ── */}
            <div className="flex flex-col gap-3.5 text-start mt-1">
              <h3 className="text-lg font-black text-white">{t('student.dashboard.recentResult')}</h3>

              <div className="p-4 sm:p-5 rounded-2xl bg-[#090b17] border border-gray-800/80 flex items-center justify-between gap-4 shadow-md">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center text-purple-700 dark:text-purple-400 shrink-0">
                    <FiClipboard size={22} />
                  </div>
                  <div className="flex flex-col text-start">
                    <h4 className="text-base font-black text-white">
                      {recentExams[0]?.exam?.title || ((isRTL && recentExams[0]?.subject?.nameAr) ? recentExams[0].subject.nameAr : (recentExams[0]?.subject?.name || activeCourse))}
                    </h4>
                    <span className="text-xs font-semibold text-gray-400 mt-0.5">
                      {recentExams[0]?.createdAt ? new Date(recentExams[0].createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '15 Aug 2026'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xl sm:text-2xl font-black text-white">
                    {recentExams[0]?.score || 100}%
                  </span>
                  <button 
                    onClick={() => navigate('/student/results')}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 border border-blue-600 dark:border-blue-500/40 text-white dark:text-blue-300 text-xs font-bold transition-all cursor-pointer shrink-0 shadow-sm"
                  >
                    {t('student.dashboard.reviewMistakes')}
                  </button>
                </div>
              </div>
            </div>

            {/* ── 5. "MY COURSES" SECTION ── */}
            <div className="flex flex-col gap-3.5 text-start mt-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span>📚</span> {t('student.dashboard.myCourses')}
                </h3>
                <button 
                  onClick={() => navigate('/student/courses')}
                  className="px-4 py-1.5 rounded-full bg-purple-100 hover:bg-purple-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-extrabold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20 transition-all cursor-pointer shadow-sm"
                >
                  {t('student.dashboard.seeAll')}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {enrollments.length > 0 ? (
                  enrollments.map((enrollment, idx) => (
                    <div 
                      key={enrollment.subject?._id || idx}
                      onClick={() => navigate(`/student/courses/${enrollment.subject?._id}`)}
                      className={`group relative rounded-3xl p-5 overflow-hidden transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[160px] ${
                        isLight 
                          ? 'bg-gradient-to-br from-indigo-50/95 via-purple-50/95 to-white border border-purple-200 shadow-md hover:border-purple-400 hover:shadow-lg' 
                          : 'bg-gradient-to-br from-[#3b2175] to-[#201242] border border-purple-500/30 hover:border-purple-500/60 shadow-[0_10px_25px_rgba(0,0,0,0.4)]'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform ${
                        isLight 
                          ? 'bg-purple-100 border border-purple-200 text-purple-700' 
                          : 'bg-white/10 backdrop-blur-md border border-white/10 text-white'
                      }`}>
                        <FiBookOpen size={20} />
                      </div>

                      <div className="flex flex-col items-start mt-4">
                        <h4 className={`text-base font-black capitalize leading-tight transition-colors ${
                          isLight 
                            ? 'text-slate-900 group-hover:text-purple-700' 
                            : 'text-white group-hover:text-purple-200'
                        }`}>
                          {(isRTL && enrollment.subject?.nameAr) ? enrollment.subject.nameAr : (enrollment.subject?.name || t('student.dashboard.chemistry'))}
                        </h4>
                        <span className={`text-xs font-semibold mt-1 ${
                          isLight 
                            ? 'text-purple-700 font-bold' 
                            : 'text-purple-200'
                        }`}>
                          {enrollment.completedLessons || 0}/{enrollment.subject?.totalLessons || 0} {t('student.dashboard.lessons')}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div 
                      onClick={() => navigate('/student/courses')}
                      className={`group relative rounded-3xl p-5 overflow-hidden transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[160px] ${
                        isLight 
                          ? 'bg-gradient-to-br from-indigo-50/95 via-purple-50/95 to-white border border-purple-200 shadow-md hover:border-purple-400 hover:shadow-lg' 
                          : 'bg-gradient-to-br from-[#3b2175] to-[#201242] border border-purple-500/30 hover:border-purple-500/60 shadow-[0_10px_25px_rgba(0,0,0,0.4)]'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform ${
                        isLight 
                          ? 'bg-purple-100 border border-purple-200 text-purple-700' 
                          : 'bg-white/10 backdrop-blur-md border border-white/10 text-white'
                      }`}>
                        <FiBookOpen size={20} />
                      </div>

                      <div className="flex flex-col items-start mt-4">
                        <h4 className={`text-base font-black capitalize leading-tight transition-colors ${
                          isLight 
                            ? 'text-slate-900 group-hover:text-purple-700' 
                            : 'text-white group-hover:text-purple-200'
                        }`}>
                          {t('student.dashboard.chemistry')}
                        </h4>
                        <span className={`text-xs font-semibold mt-1 ${
                          isLight 
                            ? 'text-purple-700 font-bold' 
                            : 'text-purple-200'
                        }`}>
                          0/1 {t('student.dashboard.lessons')}
                        </span>
                      </div>
                    </div>

                    <div 
                      onClick={() => navigate('/student/courses')}
                      className={`group relative rounded-3xl p-5 overflow-hidden transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[160px] ${
                        isLight 
                          ? 'bg-gradient-to-br from-indigo-50/95 via-purple-50/95 to-white border border-purple-200 shadow-md hover:border-purple-400 hover:shadow-lg' 
                          : 'bg-gradient-to-br from-[#3b2175] to-[#201242] border border-purple-500/30 hover:border-purple-500/60 shadow-[0_10px_25px_rgba(0,0,0,0.4)]'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform ${
                        isLight 
                          ? 'bg-purple-100 border border-purple-200 text-purple-700' 
                          : 'bg-white/10 backdrop-blur-md border border-white/10 text-white'
                      }`}>
                        <FiBookOpen size={20} />
                      </div>

                      <div className="flex flex-col items-start mt-4">
                        <h4 className={`text-base font-black capitalize leading-tight transition-colors ${
                          isLight 
                            ? 'text-slate-900 group-hover:text-purple-700' 
                            : 'text-white group-hover:text-purple-200'
                        }`}>
                          {t('student.dashboard.physics')}
                        </h4>
                        <span className={`text-xs font-semibold mt-1 ${
                          isLight 
                            ? 'text-purple-700 font-bold' 
                            : 'text-purple-200'
                        }`}>
                          0/0 {t('student.dashboard.lessons')}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;

