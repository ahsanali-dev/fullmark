import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiStar,
  FiClipboard,
  FiBookOpen,
  FiAward,
  FiX,
  FiLink,
  FiHash,
  FiChevronRight,
  FiChevronLeft,
  FiUserPlus,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { CardSkeleton, TableRowSkeleton } from '../../components/ui/Skeleton';
import { 
  fetchParentProfile, 
  fetchChildrenList, 
  linkChild, 
  fetchChildOverview, 
  fetchChildSubjects 
} from '../../redux/slices/parentsSlice';
import { useLanguage } from '../../context/LanguageContext';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, isRTL } = useLanguage();

  // Select parent data from parentsSlice
  const { 
    profile, 
    children, 
    childOverview, 
    childSubjects, 
    isLoading, 
    isActionLoading 
  } = useSelector((state) => state.parent);

  const [selectedChildId, setSelectedChildId] = useState(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkCode, setLinkCode] = useState('');
  const [isLight, setIsLight] = useState(() => document.documentElement.classList.contains('light'));

  // Load initial parent profile and linked children
  useEffect(() => {
    dispatch(fetchParentProfile());
    dispatch(fetchChildrenList())
      .unwrap()
      .then((kids) => {
        if (kids && kids.length > 0) {
          setSelectedChildId(kids[0]._id);
        }
      });
  }, [dispatch]);

  // Load details whenever selected child changes
  useEffect(() => {
    if (selectedChildId) {
      dispatch(fetchChildOverview(selectedChildId));
      dispatch(fetchChildSubjects(selectedChildId));
    }
  }, [dispatch, selectedChildId]);

  useEffect(() => {
    const handleThemeChange = () => {
      setIsLight(document.documentElement.classList.contains('light'));
    };
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  const selectedChild = children.find(c => c._id === selectedChildId);

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? t('common.goodMorning') :
    hour < 17 ? t('common.goodAfternoon') :
    t('common.goodEvening');
  const greetingEmoji = hour < 12 ? '☀️' : hour < 17 ? '🌤️' : '🌙';

  // Stats for selected child
  const totalExamsCalculated = childSubjects.reduce((sum, subj) => sum + (subj.totalExamsTaken || 0), 0);
  const avgScore = totalExamsCalculated > 0
    ? Math.round(childSubjects.reduce((sum, subj) => sum + ((subj.averageScore || 0) * (subj.totalExamsTaken || 0)), 0) / totalExamsCalculated)
    : (childOverview?.stats?.averageScore || 0);

  const totalExams = childOverview?.stats?.totalExamsTaken || 0;
  const childCoursesCount = childOverview?.stats?.enrolledCount || 0;
  const childPoints = childOverview?.stats?.totalPoints || 0;
  const recentAttempts = childOverview?.recentAttempts || [];

  // Handle link child
  const handleLinkChild = async () => {
    const code = linkCode.trim().toUpperCase();
    if (!code) {
      toast.error(t('parent.dashboard.enterLinkCode'));
      return;
    }
    
    try {
      const res = await dispatch(linkChild(code)).unwrap();
      toast.success(res?.message || t('parent.dashboard.childLinkedSuccess'));
      setIsLinkModalOpen(false);
      setLinkCode('');
      
      // Refresh children list
      const kids = await dispatch(fetchChildrenList()).unwrap();
      if (kids && kids.length > 0) {
        if (!selectedChildId) {
          setSelectedChildId(kids[kids.length - 1]._id);
        }
      }
    } catch (err) {
      toast.error(err || t('parent.dashboard.linkChildFailed'));
    }
  };

  const statCards = [
    {
      label: t('parent.dashboard.avgScore'),
      value: `${avgScore}%`,
      icon: FiStar,
      iconColor: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
    },
    {
      label: t('parent.dashboard.exams'),
      value: totalExams,
      icon: FiClipboard,
      iconColor: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      label: t('parent.dashboard.courses'),
      value: childCoursesCount,
      icon: FiBookOpen,
      iconColor: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
    },
    {
      label: t('parent.dashboard.points'),
      value: childPoints,
      icon: FiAward,
      iconColor: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
    },
  ];

  return (
    <DashboardLayout
      role="parent"
      activeTab="dashboard"
      title={t('parent.dashboard.title')}
      subtitle={t('parent.dashboard.subtitle')}
      isModalOpen={isLinkModalOpen}
    >
      {/* Main scrollable content */}
      <div
        className={`flex flex-col gap-6 text-start p-6 md:p-8 pb-36 lg:pb-16 transition-all duration-300 ${
          isLinkModalOpen ? 'blur-sm pointer-events-none' : ''
        }`}
      >
        {/* 1. GREETING HEADER */}
        <div className="flex flex-col gap-0.5">
          <p className="text-base font-semibold text-gray-400">
            {greeting} {greetingEmoji}
          </p>
          <h2 className={`text-2xl md:text-3xl font-black capitalize ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
            {profile?.name || profile?.user?.name || t('roles.parent.title')}
          </h2>
          <span className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full text-xs font-black bg-purple-500/10 border border-purple-500/20 text-purple-400 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            {t('auth.parentRole')}
          </span>
        </div>

        {/* 2. MY CHILDREN SELECTOR */}
        <div className="flex flex-col gap-3">
          <h3 className={`text-lg font-black ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>{t('parent.dashboard.myChildren')}</h3>
          {isLoading && children.length === 0 ? (
            <div className="grid grid-cols-2 gap-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : children.length === 0 ? (
            <div className={`p-8 text-center border rounded-3xl ${
              isLight ? 'bg-white border-gray-200' : 'bg-[#0c0d19]/40 border-gray-800'
            }`}>
              <p className="text-sm font-bold text-gray-500 mb-3">{t('parent.dashboard.noChildren')}</p>
              <button 
                onClick={() => setIsLinkModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-black text-white cursor-pointer"
              >
                {t('parent.dashboard.linkChildNow')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {children.map((child) => {
                const isSelected = child._id === selectedChildId;
                const initials = child.name ? child.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'ST';
                
                return (
                  <button
                    key={child._id}
                    onClick={() => setSelectedChildId(child._id)}
                    className={`relative flex flex-col items-center justify-center gap-3 p-5 rounded-3xl border transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.15)]'
                        : isLight
                          ? 'bg-white border-gray-200 text-[#0f172a] hover:border-gray-300'
                          : 'bg-[#0c0d19]/60 border-gray-800/60 hover:border-gray-700 text-white'
                    }`}
                  >
                    {/* Avatar Circle */}
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl preserve-white text-white-force transition-all ${
                      isSelected
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                        : 'bg-gradient-to-br from-slate-700 to-slate-800'
                    }`}>
                      <span className="text-white preserve-white text-white-force">{initials}</span>
                    </div>
                    <span className={`text-sm font-black capitalize ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>{child.name}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${
                      isLight
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    }`}>
                      {isSelected ? avgScore : (child.avgScore || 0)}% {t('parent.dashboard.avg')}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. STATS GRID */}
        {selectedChildId && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-3xl ${card.bg} border ${card.border} text-center shadow-md`}
                >
                  <div className={`w-10 h-10 rounded-2xl ${card.bg} border ${card.border} flex items-center justify-center`}>
                    <Icon className={`text-lg ${card.iconColor}`} />
                  </div>
                  <span className={`text-xl font-black ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>{card.value}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${card.iconColor}`}>{card.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. SUBJECT PERFORMANCE */}
        {selectedChildId && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-black ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>{t('parent.dashboard.subjectPerformance')}</h3>
              <button
                onClick={() => navigate('/parent/children')}
                className="text-sm font-extrabold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
              >
                {t('parent.dashboard.fullReport')}
              </button>
            </div>

            {isLoading && childSubjects.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TableRowSkeleton />
                <TableRowSkeleton />
              </div>
            ) : childSubjects.length === 0 ? (
              <p className="text-sm text-gray-500 font-semibold py-2">{t('parent.dashboard.noSubjectsEnrolled')}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {childSubjects.map((subj) => {
                  const subjectData = subj.subject || {};
                  return (
                    <div
                      key={subj._id}
                      className={`p-4 border rounded-2xl flex flex-col gap-3 ${
                        isLight ? 'bg-white border-gray-200' : 'bg-[#0e101a] border-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                          <FiBookOpen size={16} />
                        </div>
                        <div className="flex-1 min-w-0 text-start">
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-black capitalize ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>{subjectData.name}</span>
                            <span className="text-sm font-black text-emerald-400">{subj.bestScore || 0}%</span>
                          </div>
                          <span className="text-xs text-gray-500 font-semibold">{t('parent.dashboard.bestScore')}</span>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className={`h-1.5 w-full rounded-full overflow-hidden ${isLight ? 'bg-gray-200' : 'bg-gray-900'}`}>
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                          style={{ width: `${subj.progressPercent || 0}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {selectedChildId && (
          <div className="relative rounded-3xl overflow-hidden p-5 bg-gradient-to-br from-emerald-600 to-teal-600 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <div className={`absolute top-0 ${isRTL ? 'left-0 rounded-br-full' : 'right-0 rounded-bl-full'} w-32 h-32 bg-white/5 pointer-events-none`} />
            <div className="flex items-center justify-between gap-4 relative z-10">
              <div className="text-start">
                <p className="text-white/70 text-sm font-semibold">{t('parent.dashboard.overallPerformance')}</p>
                <h4 className="text-xl font-black text-white capitalize mt-0.5">{selectedChild?.name}</h4>
                <p className="text-white/80 text-sm font-semibold mt-2 flex items-center gap-1.5">
                  {avgScore >= 70 ? t('parent.dashboard.greatPerf') :
                    avgScore >= 50 ? t('parent.dashboard.improvingSteadily') : t('parent.dashboard.needsImprovement')}
                </p>
              </div>
              <div className="relative shrink-0">
                <svg viewBox="0 0 80 80" className="w-20 h-20">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
                  <circle
                    cx="40" cy="40" r="32"
                    fill="none"
                    stroke="white"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 32}`}
                    strokeDashoffset={`${2 * Math.PI * 32 * (1 - avgScore / 100)}`}
                    transform="rotate(-90 40 40)"
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-black text-white">{avgScore}%</span>
                  <span className="text-[9px] font-bold text-white/70 uppercase tracking-wider">{t('parent.dashboard.avg')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. RECENT EXAMS */}
        {selectedChildId && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-black ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>{t('parent.dashboard.recentExams')}</h3>
              <button
                onClick={() => navigate('/parent/children')}
                className="text-sm font-extrabold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
              >
                {t('parent.dashboard.viewAll')}
              </button>
            </div>

            {isLoading && recentAttempts.length === 0 ? (
              <TableRowSkeleton />
            ) : recentAttempts.length === 0 ? (
              <div className={`flex items-center gap-3 p-4 border rounded-2xl ${
                isLight ? 'bg-white border-gray-200 text-gray-500' : 'bg-[#0e101a] border-gray-800/60 text-gray-500'
              }`}>
                <FiClipboard size={18} />
                <span className="text-sm font-semibold">{t('parent.dashboard.noExamsTakenYet')}</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {recentAttempts.map((exam) => {
                  const isPassed = exam.passed;
                  const formattedDate = exam.createdAt 
                    ? new Date(exam.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : '';
                  return (
                    <div
                      key={exam._id}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 text-start ${
                        isLight ? 'bg-white border-gray-200 hover:border-gray-300' : 'bg-[#0c0d19]/60 border border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Score circle */}
                        <div className={`relative w-12 h-12 shrink-0`}>
                          <svg viewBox="0 0 48 48" className="w-12 h-12">
                            <circle cx="24" cy="24" r="18" fill="none"
                              stroke={isPassed ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}
                              strokeWidth="4" />
                            <circle cx="24" cy="24" r="18" fill="none"
                              stroke={isPassed ? '#10b981' : '#ef4444'}
                              strokeWidth="4"
                              strokeLinecap="round"
                              strokeDasharray={`${2 * Math.PI * 18}`}
                              strokeDashoffset={`${2 * Math.PI * 18 * (1 - (exam.score || 0) / 100)}`}
                              transform="rotate(-90 24 24)"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-[11px] font-black ${isPassed ? 'text-emerald-400' : 'text-red-400'}`}>
                              {exam.score || 0}%
                            </span>
                          </div>
                        </div>
                        <div className="text-start">
                          <p className={`text-sm font-bold capitalize ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                            {exam.subject?.name || t('parent.dashboard.exam')}
                          </p>
                          <p className="text-xs text-gray-500 font-semibold">{formattedDate}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-sm font-extrabold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                          {exam.correctAnswers || 0}/{exam.totalQuestions || 0}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border flex items-center gap-1 ${
                          isPassed
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                          {isPassed ? '✓' : '✗'} {isPassed ? t('parent.dashboard.passed') : t('parent.dashboard.failed')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FLOATING LINK CHILD BUTTON */}
      <button
        onClick={() => setIsLinkModalOpen(true)}
        className={`fixed bottom-28 lg:bottom-8 ${isRTL ? 'left-6' : 'right-6'} w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white flex items-center justify-center shadow-[0_8px_25px_rgba(168,85,247,0.4)] hover:shadow-[0_8px_30px_rgba(168,85,247,0.6)] transition-all duration-300 active:scale-95 cursor-pointer z-30`}
        title={t('parent.dashboard.linkChild')}
      >
        <FiUserPlus size={22} />
      </button>

      {/* LINK A CHILD MODAL */}
      {isLinkModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => {
            if (isActionLoading) return;
            setIsLinkModalOpen(false);
            setLinkCode('');
          }}
        >
          <div
            className={`border rounded-3xl p-6 w-full max-w-sm shadow-[0_20px_60px_rgba(0,0,0,0.8)] animate-fade-in relative text-start ${
              isLight ? 'bg-white border-gray-200' : 'bg-[#0f1020] border border-gray-800'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              disabled={isActionLoading}
              onClick={() => {
                setIsLinkModalOpen(false);
                setLinkCode('');
              }}
              className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isLight ? 'bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800' : 'bg-gray-800/60 hover:bg-gray-700/60 text-gray-400 hover:text-white'
              }`}
            >
              <FiX size={16} />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] shrink-0">
                <FiLink size={20} />
              </div>
              <div>
                <h3 className={`text-xl font-black ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>{t('parent.dashboard.linkChild')}</h3>
              </div>
            </div>

            <p className={`text-sm font-semibold mb-5 leading-relaxed ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
              {t('parent.dashboard.linkChildDesc')}
            </p>

            {/* Code Input */}
            <div className="relative mb-6">
              <div className={`flex items-center gap-3 px-4 py-3.5 border rounded-2xl focus-within:border-purple-500/60 transition-colors ${
                isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#0c0d19] border border-gray-700'
              }`}>
                <FiHash size={16} className="text-purple-400 shrink-0" />
                <input
                  type="text"
                  disabled={isActionLoading}
                  value={linkCode}
                  onChange={(e) => setLinkCode(e.target.value.toUpperCase())}
                  placeholder="FM-XXXXXX"
                  maxLength={10}
                  className={`flex-1 bg-transparent border-none outline-none font-bold text-base focus:ring-0 ${
                    isLight ? 'text-[#0f172a] placeholder:text-gray-400' : 'text-white placeholder:text-gray-600'
                  }`}
                  onKeyDown={(e) => e.key === 'Enter' && handleLinkChild()}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <button
                disabled={isActionLoading}
                onClick={() => {
                  setIsLinkModalOpen(false);
                  setLinkCode('');
                }}
                className={`flex-1 py-3 rounded-2xl border font-bold text-sm transition-all cursor-pointer ${
                  isLight ? 'bg-transparent border-gray-300 text-gray-750 hover:bg-gray-50 hover:text-gray-900' : 'bg-transparent border border-gray-700 text-gray-300 hover:text-white hover:border-gray-600'
                }`}
              >
                {t('parent.dashboard.cancel')}
              </button>
              <button
                disabled={isActionLoading}
                onClick={handleLinkChild}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black text-sm shadow-[0_4px_20px_rgba(168,85,247,0.3)] active:scale-95 transition-all cursor-pointer disabled:opacity-55"
              >
                {isActionLoading ? t('parent.dashboard.linking') : t('parent.dashboard.link')}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ParentDashboard;

