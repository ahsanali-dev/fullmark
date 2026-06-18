import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiStar,
  FiClipboard,
  FiBookOpen,
  FiAward,
  FiX,
  FiLink,
  FiHash,
  FiChevronRight,
  FiTrendingUp,
  FiUserPlus,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getStoredChildren, setStoredChildren, getStoredParentProfile } from '../../data/parentData';

const ParentDashboard = () => {
  const navigate = useNavigate();

  const [children, setChildren] = useState(() => getStoredChildren());
  const [selectedChildId, setSelectedChildId] = useState(() => getStoredChildren()[0]?.id || null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkCode, setLinkCode] = useState('');
  const [parentName, setParentName] = useState('ali faraz');
  const [isLight, setIsLight] = useState(() => document.documentElement.classList.contains('light'));

  useEffect(() => {
    const handleThemeChange = () => {
      setIsLight(document.documentElement.classList.contains('light'));
    };
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  // Load parent profile name
  useEffect(() => {
    const profile = getStoredParentProfile();
    setParentName(profile.name || 'ali faraz');
  }, []);

  const selectedChild = children.find(c => c.id === selectedChildId) || children[0];

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' :
    hour < 17 ? 'Good Afternoon' :
    'Good Evening';
  const greetingEmoji = hour < 12 ? '☀️' : hour < 17 ? '🌤️' : '🌙';

  // Stats for selected child
  const childExams = selectedChild?.exams || [];
  const avgScore = childExams.length > 0
    ? Math.round(childExams.reduce((s, e) => s + e.score, 0) / childExams.length)
    : 0;
  const childCourses = selectedChild?.courses || [];
  const childPoints = selectedChild?.points || 0;
  const childSubjects = selectedChild?.subjects || [];

  // Handle link child
  const handleLinkChild = () => {
    const code = linkCode.trim().toUpperCase();
    if (!code) {
      toast.error('Please enter a link code');
      return;
    }
    if (!code.startsWith('FM-')) {
      toast.error('Invalid code format. Must start with FM-');
      return;
    }
    // Check if already linked
    const alreadyLinked = children.some(c => c.linkCode === code);
    if (alreadyLinked) {
      toast.error('This child is already linked to your account');
      return;
    }
    toast.success('Child linked successfully!');
    setIsLinkModalOpen(false);
    setLinkCode('');
  };

  const statCards = [
    {
      label: 'Avg Score',
      value: `${avgScore}%`,
      icon: FiStar,
      iconColor: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
    },
    {
      label: 'Exams',
      value: childExams.length,
      icon: FiClipboard,
      iconColor: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      label: 'Courses',
      value: childCourses.length,
      icon: FiBookOpen,
      iconColor: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
    },
    {
      label: 'Points',
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
      title="Parent Panel"
      subtitle="Parent Portal Overview 👨‍👩‍👧"
      isModalOpen={isLinkModalOpen}
    >
      {/* Main scrollable content */}
      <div
        className={`flex flex-col gap-6 text-left p-6 md:p-8 pb-36 lg:pb-16 transition-all duration-300 ${
          isLinkModalOpen ? 'blur-sm pointer-events-none' : ''
        }`}
      >
        {/* 1. GREETING HEADER */}
        <div className="flex flex-col gap-0.5">
          <p className="text-base font-semibold text-gray-400">
            {greeting} {greetingEmoji}
          </p>
          <h2 className={`text-2xl md:text-3xl font-black capitalize ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>{parentName}</h2>
          <span className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full text-xs font-black bg-purple-500/10 border border-purple-500/20 text-purple-400 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            Parent
          </span>
        </div>

        {/* 2. MY CHILDREN SELECTOR */}
        <div className="flex flex-col gap-3">
          <h3 className={`text-lg font-black ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>My Children</h3>
          <div className="grid grid-cols-2 gap-4">
            {children.map((child) => {
              const isSelected = child.id === selectedChildId;
              const childAvg = child.exams.length > 0
                ? Math.round(child.exams.reduce((s, e) => s + e.score, 0) / child.exams.length)
                : 0;
              return (
                <button
                  key={child.id}
                  onClick={() => setSelectedChildId(child.id)}
                  className={`relative flex flex-col items-center justify-center gap-3 p-5 rounded-3xl border transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.15)]'
                      : isLight
                        ? 'bg-white border-gray-200 text-[#0f172a] hover:border-gray-300'
                        : 'bg-[#0c0d19]/60 border-gray-800/60 hover:border-gray-700 text-white'
                  }`}
                >
                  {/* Avatar Circle */}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl text-white transition-all ${
                    isSelected
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                      : 'bg-gradient-to-br from-gray-700 to-gray-800'
                  }`}>
                    {child.initials}
                  </div>
                  <span className={`text-sm font-black capitalize ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>{child.name}</span>
                  {isSelected && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black">
                      {childAvg}% avg
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. STATS GRID */}
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

        {/* 4. SUBJECT PERFORMANCE */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-black ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>Subject Performance</h3>
            <button
              onClick={() => navigate('/parent/children')}
              className="text-sm font-extrabold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
            >
              Full Report
            </button>
          </div>

          {childSubjects.length === 0 ? (
            <p className="text-sm text-gray-500 font-semibold py-2">No subjects enrolled yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {childSubjects.map((subj) => (
                <div
                  key={subj.name}
                  className={`p-4 border rounded-2xl flex flex-col gap-3 ${
                    isLight ? 'bg-white border-gray-200' : 'bg-[#0e101a] border-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                      <FiBookOpen size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-black capitalize ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>{subj.name}</span>
                        <span className="text-sm font-black text-emerald-400">{subj.bestScore}%</span>
                      </div>
                      <span className="text-xs text-gray-500 font-semibold">Best score</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className={`h-1.5 w-full rounded-full overflow-hidden ${isLight ? 'bg-gray-200' : 'bg-gray-900'}`}>
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${subj.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative rounded-3xl overflow-hidden p-5 bg-gradient-to-br from-emerald-600 to-teal-600 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between gap-4 relative z-10">
            <div>
              <p className="text-white/70 text-sm font-semibold">Overall Performance</p>
              <h4 className="text-xl font-black text-white capitalize mt-0.5">{selectedChild?.name}</h4>
              <p className="text-white/80 text-sm font-semibold mt-2 flex items-center gap-1.5">
                {avgScore >= 70 ? '🏆 Great performance!' :
                  avgScore >= 50 ? '📈 Improving steadily' : '😔 Needs improvement'}
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
                <span className="text-[9px] font-bold text-white/70 uppercase tracking-wider">Avg</span>
              </div>
            </div>
          </div>
        </div>

        {/* 6. RECENT EXAMS */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-black ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>Recent Exams</h3>
            <button
              onClick={() => navigate('/parent/children')}
              className="text-sm font-extrabold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
            >
              View all
            </button>
          </div>

          {childExams.length === 0 ? (
            <div className={`flex items-center gap-3 p-4 border rounded-2xl ${
              isLight ? 'bg-white border-gray-200 text-gray-500' : 'bg-[#0e101a] border-gray-800/60 text-gray-500'
            }`}>
              <FiClipboard size={18} />
              <span className="text-sm font-semibold">No exams taken yet.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {childExams.slice(0, 3).map((exam) => {
                const isPassed = exam.status === 'Passed';
                return (
                  <div
                    key={exam.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${
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
                            strokeDashoffset={`${2 * Math.PI * 18 * (1 - exam.score / 100)}`}
                            transform="rotate(-90 24 24)"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-[11px] font-black ${isPassed ? 'text-emerald-400' : 'text-red-400'}`}>
                            {exam.score}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className={`text-sm font-bold capitalize ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>{exam.subject}</p>
                        <p className="text-xs text-gray-500 font-semibold">{exam.date}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-sm font-extrabold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                        {exam.score}/{exam.total || 100}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border flex items-center gap-1 ${
                        isPassed
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/10 border-red-500/20 text-red-400'
                      }`}>
                        {isPassed ? '✓' : '✗'} {exam.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* FLOATING LINK CHILD BUTTON */}
      <button
        onClick={() => setIsLinkModalOpen(true)}
        className="fixed bottom-28 lg:bottom-8 right-6 w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white flex items-center justify-center shadow-[0_8px_25px_rgba(168,85,247,0.4)] hover:shadow-[0_8px_30px_rgba(168,85,247,0.6)] transition-all duration-300 active:scale-95 cursor-pointer z-30"
        title="Link a Child"
      >
        <FiUserPlus size={22} />
      </button>

      {/* LINK A CHILD MODAL */}
      {isLinkModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => {
            setIsLinkModalOpen(false);
            setLinkCode('');
          }}
        >
          <div
            className={`border rounded-3xl p-6 w-full max-w-sm shadow-[0_20px_60px_rgba(0,0,0,0.8)] animate-fade-in relative text-left ${
              isLight ? 'bg-white border-gray-200' : 'bg-[#0f1020] border border-gray-800'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setIsLinkModalOpen(false);
                setLinkCode('');
              }}
              className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isLight ? 'bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800' : 'bg-gray-800/60 hover:bg-gray-700/60 text-gray-400 hover:text-white'
              }`}
            >
              <FiX size={16} />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                <FiLink size={20} />
              </div>
              <div>
                <h3 className={`text-xl font-black ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>Link a Child</h3>
              </div>
            </div>

            <p className={`text-sm font-semibold mb-5 leading-relaxed ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
              Ask your child to share their link code from their profile, then enter it below.
            </p>

            {/* Code Input */}
            <div className="relative mb-6">
              <div className={`flex items-center gap-3 px-4 py-3.5 border rounded-2xl focus-within:border-purple-500/60 transition-colors ${
                isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#0c0d19] border border-gray-700'
              }`}>
                <FiHash size={16} className="text-purple-400 shrink-0" />
                <input
                  type="text"
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
                onClick={() => {
                  setIsLinkModalOpen(false);
                  setLinkCode('');
                }}
                className={`flex-1 py-3 rounded-2xl border font-bold text-sm transition-all cursor-pointer ${
                  isLight ? 'bg-transparent border-gray-300 text-gray-750 hover:bg-gray-50 hover:text-gray-900' : 'bg-transparent border border-gray-700 text-gray-300 hover:text-white hover:border-gray-600'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleLinkChild}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black text-sm shadow-[0_4px_20px_rgba(168,85,247,0.3)] active:scale-95 transition-all cursor-pointer"
              >
                Link
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ParentDashboard;
