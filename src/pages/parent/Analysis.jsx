import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiBookOpen, FiChevronDown } from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { 
  fetchChildrenList, 
  fetchChildOverview, 
  fetchChildSubjects, 
  fetchChildResults 
} from '../../redux/slices/parentsSlice';
import { useLanguage } from '../../context/LanguageContext';

/* ─── Score Circle ─────────────────────────────────────────── */
const ScoreCircle = ({ score, size = 56 }) => {
  const isPassed = score >= 60;
  const r = (size / 2) * 0.72;
  const circ = 2 * Math.PI * r;
  const dash = circ * (score / 100);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill={isPassed ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)'}
          stroke={isPassed ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}
          strokeWidth="3"
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={isPassed ? '#10b981' : '#ef4444'}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-black leading-none ${size >= 56 ? 'text-sm' : 'text-[11px]'} ${isPassed ? 'text-emerald-400' : 'text-red-400'}`}>
          {score}
        </span>
      </div>
    </div>
  );
};

/* ─── Exam Card ────────────────────────────────────────────── */
const ExamCard = ({ exam, isLight, isRTL, t }) => {
  const isPassed = exam.passed;
  const formattedDate = exam.createdAt 
    ? new Date(exam.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';
  return (
    <div className={`rounded-2xl border overflow-hidden ${isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#111520] border-gray-800/60'}`}>
      {/* Top row */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/20 flex items-center justify-center shrink-0">
            <FiBookOpen className="text-amber-400" size={16} />
          </div>
          <div className="text-start">
            <p className={`text-sm font-extrabold leading-tight ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
              {exam.exam?.title || t('parent.analysis.examAttempt')}
            </p>
            <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
              {exam.subject?.name || t('parent.analysis.subject')} · {formattedDate}
            </p>
          </div>
        </div>
        <span className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase border ${isPassed
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
          {isPassed ? `✓ ${t('parent.analysis.passed')}` : `✗ ${t('parent.analysis.failed')}`}
        </span>
      </div>

      {/* Divider */}
      <div className={`h-px mx-4 ${isLight ? 'bg-gray-100' : 'bg-gray-800/50'}`} />

      {/* Bottom row */}
      <div className="flex items-center gap-4 px-4 py-3">
        <ScoreCircle score={exam.score || 0} size={52} />
        <div className="flex-1 flex flex-col gap-1.5">
          <div className={`h-2 w-full rounded-full overflow-hidden ${isLight ? 'bg-gray-100' : 'bg-gray-900'}`}>
            <div
              className={`h-full rounded-full transition-all duration-700 ${isPassed ? 'bg-emerald-500' : 'bg-red-500'}`}
              style={{ width: `${exam.score || 0}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-500 font-semibold text-start">
            {exam.score || 0}% {t('parent.analysis.score')} · {t('parent.analysis.duration')} {exam.durationMinutes || 0} {t('parent.analysis.mins')}
          </p>
        </div>
        <div className="text-end shrink-0">
          <p className="text-base font-black text-yellow-400 leading-tight">
            {exam.correctAnswers || 0}/{exam.totalQuestions || 0}
          </p>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{t('parent.analysis.correct')}</p>
        </div>
      </div>
    </div>
  );
};

const ParentAnalysis = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, isRTL } = useLanguage();

  const [isLight, setIsLight] = useState(() => document.documentElement.classList.contains('light'));
  
  useEffect(() => {
    const handle = () => setIsLight(document.documentElement.classList.contains('light'));
    window.addEventListener('themeChange', handle);
    return () => window.removeEventListener('themeChange', handle);
  }, []);

  const { 
    children, 
    childOverview, 
    childSubjects, 
    childResultsData, 
    isLoading 
  } = useSelector((state) => state.parent);

  const [selectedChildId, setSelectedChildId] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [showChildPicker, setShowChildPicker] = useState(false);

  const TABS = [
    { key: 'Overview', label: t('parent.analysis.tabOverview') },
    { key: 'Exams', label: t('parent.analysis.tabExams') },
    { key: 'Subjects', label: t('parent.analysis.tabSubjects') },
  ];

  // Initial children fetch
  useEffect(() => {
    dispatch(fetchChildrenList())
      .unwrap()
      .then((kids) => {
        if (kids && kids.length > 0) {
          setSelectedChildId(kids[0]._id);
        }
      });
  }, [dispatch]);

  // Selected child dependencies fetch
  useEffect(() => {
    if (selectedChildId) {
      dispatch(fetchChildOverview(selectedChildId));
      dispatch(fetchChildSubjects(selectedChildId));
      dispatch(fetchChildResults({ childId: selectedChildId }));
    }
  }, [dispatch, selectedChildId]);

  const selectedChild = children.find(c => c._id === selectedChildId);
  const initials = selectedChild?.name ? selectedChild.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'ST';

  // Overall performance calculations
  const stats = childOverview?.stats || { averageScore: 0, totalExamsTaken: 0, totalExamsPassed: 0, streakDays: 0 };
  const totalExamsCalculated = childSubjects.reduce((sum, subj) => sum + (subj.totalExamsTaken || 0), 0);
  const avgScore = totalExamsCalculated > 0
    ? Math.round(childSubjects.reduce((sum, subj) => sum + ((subj.averageScore || 0) * (subj.totalExamsTaken || 0)), 0) / totalExamsCalculated)
    : Math.round(stats.averageScore || 0);

  const totalExams = stats.totalExamsTaken || 0;
  const passedExams = childResultsData?.attempts?.filter(e => e.passed) || [];
  const failedExams = childResultsData?.attempts?.filter(e => !e.passed) || [];
  const streak = stats.streakDays || 0;

  // Subjects sorting
  const sortedSubjects = [...childSubjects].sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0));
  const strongestSubject = sortedSubjects[0] || null;
  const weakestSubject = sortedSubjects[sortedSubjects.length - 1] || null;

  const performanceLabel =
    avgScore >= 80 ? t('parent.analysis.excellentPerf') :
      avgScore >= 60 ? t('parent.analysis.goodProgress') :
        t('parent.analysis.needsImp');

  // styles helpers
  const textPrimary = isLight ? 'text-[#0f172a]' : 'text-white';
  const card = isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#111520] border-gray-800/60';
  const divider = isLight ? 'bg-gray-100' : 'bg-gray-800/50';
  const trackBg = isLight ? 'bg-gray-100' : 'bg-gray-900';
  const emptyBg = isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#0e101a] border-gray-800/60';

  return (
    <DashboardLayout
      role="parent"
      activeTab="attendance"
      title={t('parent.analysis.title')}
      subtitle={t('parent.analysis.subtitle')}
      showBackButton
      onBackClick={() => navigate('/parent/dashboard')}
    >
      <div className="flex flex-col w-full pb-36 lg:pb-16 animate-fade-in text-start">

        {/* ── CHILD SELECTOR ─────────────────────────────────── */}
        <div className="px-5 pt-5 pb-3">
          <div className="relative">
            <button
              onClick={() => setShowChildPicker(!showChildPicker)}
              className={`w-full flex items-center gap-3 px-4 py-3 border rounded-2xl transition-colors cursor-pointer ${isLight
                  ? 'bg-white border-gray-200 hover:border-purple-400/60'
                  : 'bg-[#0e101a] border-gray-800 hover:border-purple-500/40'
                }`}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-black text-xs text-white shrink-0">
                {initials}
              </div>
              <span className={`text-sm font-extrabold capitalize flex-1 text-start ${textPrimary}`}>
                {selectedChild?.name || t('parent.analysis.selectChild')}
              </span>
              <FiChevronDown
                className={`text-gray-400 transition-transform ${showChildPicker ? 'rotate-180' : ''}`}
                size={16}
              />
            </button>

            {showChildPicker && (
              <div className={`absolute top-full left-0 right-0 mt-2 border rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.15)] z-20 animate-fade-in ${isLight ? 'bg-white border-gray-200' : 'bg-[#0f1020] border-gray-800'}`}>
                {children.map((c) => {
                  const childInitials = c.name ? c.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'ST';
                  return (
                    <button
                      key={c._id}
                      onClick={() => { setSelectedChildId(c._id); setShowChildPicker(false); setActiveTab('Overview'); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors cursor-pointer ${c._id === selectedChildId
                          ? 'bg-purple-500/10 text-purple-400'
                          : isLight
                            ? 'text-gray-600 hover:bg-gray-50'
                            : 'text-gray-300 hover:bg-gray-800/40'
                        }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-black text-[11px] text-white shrink-0">
                        {childInitials}
                      </div>
                      <span className="capitalize">{c.name}</span>
                      {c._id === selectedChildId && (
                        <span className={`${isRTL ? 'mr-auto' : 'ml-auto'} text-[10px] font-black text-purple-400 uppercase`}>{t('parent.analysis.selected')}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── CHILD HEADER CARD ──────────────────────────────── */}
        {selectedChildId && (
          <div className="mx-5 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 p-5 shadow-[0_0_30px_rgba(16,185,129,0.25)] relative overflow-hidden">
            <div className={`absolute top-0 ${isRTL ? 'left-0 rounded-br-full' : 'right-0 rounded-bl-full'} w-32 h-32 bg-white/5 pointer-events-none`} />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/20 flex items-center justify-center font-black text-xl text-white shrink-0">
                {initials}
              </div>
              <div className="text-start">
                <h2 className="text-xl font-black text-white capitalize">{selectedChild?.name}</h2>
                <p className="text-white/70 text-xs font-semibold">{t('parent.analysis.student')}</p>
                {streak > 0 && (
                  <div className="flex items-center gap-1 mt-1.5 px-2.5 py-1 rounded-full bg-orange-500/20 border border-orange-400/30 w-fit">
                    <FaFire className="text-orange-400" size={11} />
                    <span className="text-orange-300 text-[11px] font-bold">{streak} {t('parent.analysis.daysStreak')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-0 mt-5 border-t border-white/15 pt-4">
              {[
                { label: t('parent.dashboard.avgScore'), value: `${avgScore}%` },
                { label: t('parent.dashboard.exams'), value: totalExams },
                { label: t('parent.dashboard.passed'), value: passedExams.length },
                { label: t('parent.dashboard.failed'), value: failedExams.length },
              ].map((s, i) => (
                <div key={s.label} className={`flex flex-col items-center text-center ${i < 3 ? (isRTL ? 'border-l border-white/15' : 'border-r border-white/15') : ''}`}>
                  <span className="text-lg font-black text-white">{s.value}</span>
                  <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider mt-0.5">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB BAR ────────────────────────────────────────── */}
        {selectedChildId && (
          <div className={`flex border-b mx-5 mt-5 ${isLight ? 'border-gray-200' : 'border-gray-800/60'}`}>
            {TABS.map((tItem) => (
              <button
                key={tItem.key}
                onClick={() => setActiveTab(tItem.key)}
                className={`flex-1 py-3 text-sm font-extrabold transition-all cursor-pointer border-b-2 ${activeTab === tItem.key
                    ? 'text-emerald-400 border-emerald-400'
                    : isLight
                      ? 'text-gray-400 hover:text-gray-600 border-transparent'
                      : 'text-gray-500 hover:text-gray-400 border-transparent'
                  }`}
              >
                {tItem.label}
              </button>
            ))}
          </div>
        )}

        {/* ── TAB CONTENT ────────────────────────────────────── */}
        {selectedChildId && (
          <div className="flex flex-col gap-5 p-5">

            {/* ══ OVERVIEW TAB ══════════════════════════════════ */}
            {activeTab === 'Overview' && (
              <div className="flex flex-col gap-5 animate-fade-in">

                {/* Overall Performance card */}
                <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 p-5 relative overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <div className={`absolute bottom-0 ${isRTL ? 'left-0 rounded-tr-full' : 'right-0 rounded-tl-full'} w-24 h-24 bg-white/10 pointer-events-none`} />
                  <p className="text-white/70 text-xs font-semibold text-start">{t('parent.analysis.overallPerf')}</p>
                  <p className="text-4xl font-black text-white mt-1 text-start">{avgScore}%</p>
                  <p className="text-white/80 text-sm font-semibold mt-2 text-start">{performanceLabel}</p>
                  <div className="flex items-center gap-6 mt-3">
                    <div className="text-start">
                      <span className="text-white font-black text-sm">{passedExams.length}/{totalExams}</span>
                      <span className="text-white/60 text-xs font-semibold block">{t('parent.analysis.passedLabel')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-white font-black text-sm">{streak}d</span>
                      <FaFire className="text-orange-400" size={13} />
                      <span className="text-white/60 text-xs font-semibold block text-start">{t('parent.analysis.streakLabel')}</span>
                    </div>
                  </div>
                </div>

                {/* Strongest / Needs Attention */}
                {childSubjects.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {strongestSubject && (
                      <div className={`rounded-2xl border p-4 flex flex-col gap-3 text-start ${isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-[#111520] border-emerald-500/20'}`}>
                        <p className="text-xs font-black text-emerald-400 flex items-center gap-1">
                          {t('parent.analysis.strongestSubject')}
                        </p>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                          <FiBookOpen className="text-emerald-400" size={16} />
                        </div>
                        <p className={`text-sm font-extrabold capitalize ${textPrimary}`}>{strongestSubject.subject?.name}</p>
                        <div className={`h-1.5 w-full rounded-full overflow-hidden ${trackBg}`}>
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${strongestSubject.averageScore || 0}%` }} />
                        </div>
                        <p className="text-sm font-black text-emerald-400">{Math.round(strongestSubject.averageScore || 0)}% {t('parent.analysis.avg')}</p>
                      </div>
                    )}

                    {weakestSubject && (
                      <div className={`rounded-2xl border p-4 flex flex-col gap-3 text-start ${isLight ? 'bg-red-50 border-red-200' : 'bg-[#111520] border-red-500/20'}`}>
                        <p className="text-xs font-black text-red-400 flex items-center gap-1">
                          {t('parent.analysis.needsAttention')}
                        </p>
                        <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center">
                          <FiBookOpen className="text-red-400" size={16} />
                        </div>
                        <p className={`text-sm font-extrabold capitalize ${textPrimary}`}>{weakestSubject.subject?.name}</p>
                        <div className={`h-1.5 w-full rounded-full overflow-hidden ${trackBg}`}>
                          <div className="h-full bg-red-500 rounded-full" style={{ width: `${weakestSubject.averageScore || 0}%` }} />
                        </div>
                        <p className="text-sm font-black text-red-400">{Math.round(weakestSubject.averageScore || 0)}% {t('parent.analysis.avg')}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Recent Exams */}
                <div className="flex flex-col gap-3">
                  <h3 className={`text-base font-black ${textPrimary} text-start`}>{t('parent.analysis.recentExams')}</h3>
                  {isLoading && childResultsData?.attempts?.length === 0 ? (
                    <TableRowSkeleton />
                  ) : childResultsData?.attempts?.length === 0 ? (
                    <div className={`p-8 rounded-2xl border flex flex-col items-center gap-2 ${emptyBg}`}>
                      <FiBookOpen className="text-gray-400" size={32} />
                      <p className="text-sm font-extrabold text-gray-500">{t('parent.analysis.noExamsYet')}</p>
                    </div>
                  ) : (
                    childResultsData?.attempts?.slice(0, 5).map((exam) => (
                      <ExamCard key={exam._id} exam={exam} isLight={isLight} isRTL={isRTL} t={t} />
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ══ EXAMS TAB ═════════════════════════════════════ */}
            {activeTab === 'Exams' && (
              <div className="flex flex-col gap-4 animate-fade-in">
                <div className="flex gap-3">
                  <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-black text-sm">
                    <span>✓</span>
                    <span>{passedExams.length} {t('parent.analysis.passed')}</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 font-black text-sm">
                    <span>✗</span>
                    <span>{failedExams.length} {t('parent.analysis.failed')}</span>
                  </div>
                </div>
                {isLoading && childResultsData?.attempts?.length === 0 ? (
                  <TableRowSkeleton />
                ) : childResultsData?.attempts?.length === 0 ? (
                  <div className={`p-8 rounded-2xl border flex flex-col items-center gap-2 ${emptyBg}`}>
                    <FiBookOpen className="text-gray-400" size={32} />
                    <p className="text-sm font-extrabold text-gray-500">{t('parent.analysis.noExamsYet')}</p>
                  </div>
                ) : (
                  childResultsData?.attempts?.map((exam) => (
                    <ExamCard key={exam._id} exam={exam} isLight={isLight} isRTL={isRTL} t={t} />
                  ))
                )}
              </div>
            )}

            {/* ══ SUBJECTS TAB ══════════════════════════════════ */}
            {activeTab === 'Subjects' && (
              <div className="flex flex-col gap-4 animate-fade-in">
                {isLoading && childSubjects.length === 0 ? (
                  <TableRowSkeleton />
                ) : childSubjects.length === 0 ? (
                  <div className={`p-10 rounded-2xl border flex flex-col items-center gap-2 ${emptyBg}`}>
                    <FiBookOpen className="text-gray-400" size={36} />
                    <p className="text-sm font-extrabold text-gray-500">{t('parent.analysis.noSubjectsYet')}</p>
                  </div>
                ) : (
                  childSubjects.map((subj) => {
                    const subAvg = Math.round(subj.averageScore || 0);
                    const barColor = subAvg >= 60 ? 'bg-yellow-400' : 'bg-red-500';
                    const subjectAttempts = childResultsData?.attempts?.filter(attempt => attempt.subject?._id === subj.subject?._id) || [];
                    
                    return (
                      <div key={subj._id} className={`rounded-2xl border overflow-hidden ${card}`}>
                        {/* Subject header */}
                        <div className="flex items-center justify-between px-4 pt-4 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/20 flex items-center justify-center shrink-0">
                              <FiBookOpen className="text-amber-400" size={16} />
                            </div>
                            <div className="text-start">
                              <p className={`text-sm font-extrabold capitalize ${textPrimary}`}>{subj.subject?.name}</p>
                              <p className="text-[11px] text-gray-500 font-semibold">
                                {subj.totalExamsTaken || 0} {t('parent.analysis.examsTaken')}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-base font-black text-yellow-400">{subAvg}% {t('parent.analysis.avg')}</span>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className={`h-px mx-4 ${divider}`} />

                        {/* Exam History */}
                        <div className="px-4 py-3 text-start">
                          <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">{t('parent.analysis.examHistory')}</p>
                          {subjectAttempts.length === 0 ? (
                            <p className="text-xs text-gray-500 font-semibold">{t('parent.analysis.noExamScoresForSubj')}</p>
                          ) : (
                            <div className="flex gap-2 flex-wrap">
                              {subjectAttempts.map((attempt, idx) => {
                                const isPassed = attempt.passed;
                                return (
                                  <div
                                    key={attempt._id}
                                    className={`flex flex-col items-center justify-center px-4 py-2.5 rounded-xl text-center min-w-[72px] ${isPassed
                                        ? 'bg-emerald-500/10 border border-emerald-500/30'
                                        : 'bg-red-500/10 border border-red-500/25'
                                      }`}
                                  >
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">{t('parent.analysis.examNum')} {idx + 1}</span>
                                    <span className={`text-base font-black mt-0.5 ${isPassed ? 'text-emerald-400' : 'text-red-400'}`}>
                                      {attempt.score || 0}%
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Average progress bar */}
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[11px] font-bold text-gray-400">{t('parent.analysis.averageNum')}</span>
                              <span className="text-[11px] font-black text-yellow-400">{subAvg}%</span>
                            </div>
                            <div className={`h-1.5 w-full rounded-full overflow-hidden ${trackBg}`}>
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                                style={{ width: `${subAvg}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ParentAnalysis;