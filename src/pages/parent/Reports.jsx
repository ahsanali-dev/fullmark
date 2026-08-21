import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiBarChart2,
  FiUsers,
  FiStar,
  FiCheckCircle,
  FiTrendingUp,
  FiBookOpen,
  FiRefreshCw,
} from 'react-icons/fi';
import { FaFire, FaTrophy, FaLightbulb } from 'react-icons/fa';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { 
  fetchChildrenList, 
  fetchChildOverview, 
  fetchChildSubjects, 
  fetchChildResults 
} from '../../redux/slices/parentsSlice';
import { useLanguage } from '../../context/LanguageContext';

// ─── Score Trend Chart ─────────────────────────────────────────
const ScoreTrendChart = ({ attempts, isLight, isRTL, t }) => {
  if (!attempts || attempts.length === 0) {
    return (
      <p className="text-sm font-semibold text-gray-500 text-center py-6">
        {t('parent.reports.notEnoughData')}
      </p>
    );
  }
  
  // Sort attempts chronologically
  const sorted = [...attempts].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const maxScore = 100;
  const chartH = 120;

  return (
    <div className="flex items-end gap-3 pt-4 pb-1 overflow-x-auto">
      {sorted.map((exam, idx) => {
        const isPassed = exam.passed;
        const barH = Math.max(12, ((exam.score || 0) / maxScore) * chartH);
        const formattedDate = exam.createdAt 
          ? new Date(exam.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { month: 'numeric', day: 'numeric' })
          : '';

        return (
          <div key={exam._id || idx} className="flex flex-col items-center gap-1 shrink-0 min-w-[52px]">
            <span className={`text-[11px] font-black ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
              {exam.score || 0}
            </span>
            <div
              className={`w-full rounded-t-lg transition-all duration-700 ${isPassed ? 'bg-emerald-500' : 'bg-red-500/80'}`}
              style={{ height: barH, minWidth: 48 }}
            />
            <span className="text-[10px] text-gray-500 font-semibold mt-0.5">{formattedDate}</span>
          </div>
        );
      })}
    </div>
  );
};

// ─── Comparison Horizontal Bar ────────────────────────────────
const CompareBar = ({ label, valA = 0, valB = 0, displayA, displayB }) => {
  const numA = Number(valA) || 0;
  const numB = Number(valB) || 0;
  const total = numA + numB;
  const bothZero = total === 0;
  const pctA = bothZero ? 50 : Math.round((numA / total) * 100);
  const pctB = bothZero ? 50 : 100 - pctA;
  const labelA = displayA !== undefined ? displayA : String(numA);
  const labelB = displayB !== undefined ? displayB : String(numB);

  return (
    <div className="flex flex-col gap-1.5 text-start">
      <span className="text-xs font-bold text-gray-400">{label}</span>
      <div className="flex w-full h-10 rounded-2xl overflow-hidden">
        <div
          className={`flex items-center justify-center font-black text-sm text-white transition-all duration-700 ${bothZero ? 'bg-emerald-700/50' : 'bg-emerald-500'}`}
          style={{ width: `${pctA}%` }}
        >
          {pctA >= 20 && labelA}
        </div>
        <div
          className={`flex items-center justify-center font-black text-sm text-white transition-all duration-700 ${bothZero ? 'bg-emerald-900/50' : 'bg-emerald-700/60'}`}
          style={{ width: `${pctB}%` }}
        >
          {pctB >= 20 && labelB}
        </div>
      </div>
    </div>
  );
};

const ParentReports = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, isRTL } = useLanguage();

  const [isLight, setIsLight] = useState(() => document.documentElement.classList.contains('light'));

  useEffect(() => {
    const handleThemeChange = () => {
      setIsLight(document.documentElement.classList.contains('light'));
    };
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  const { 
    children, 
    childOverview, 
    childSubjects, 
    childResultsData, 
    isLoading 
  } = useSelector((state) => state.parent);

  const [selectedChildId, setSelectedChildId] = useState(null);
  const [viewMode, setViewMode] = useState('Performance'); // 'Performance' | 'Comparison'

  // Load children list on mount
  useEffect(() => {
    dispatch(fetchChildrenList())
      .unwrap()
      .then((kids) => {
        if (kids && kids.length > 0) {
          setSelectedChildId(kids[0]._id);
        }
      });
  }, [dispatch]);

  // Load selected child dependencies
  useEffect(() => {
    if (selectedChildId) {
      dispatch(fetchChildOverview(selectedChildId));
      dispatch(fetchChildSubjects(selectedChildId));
      dispatch(fetchChildResults({ childId: selectedChildId }));
    }
  }, [dispatch, selectedChildId]);

  const child = children.find(c => c._id === selectedChildId);
  const otherChild = children.find(c => c._id !== selectedChildId);

  // Performance calculations
  const stats = childOverview?.stats || { averageScore: 0, totalExamsTaken: 0, totalExamsPassed: 0, streakDays: 0 };
  const totalExamsCalculated = childSubjects.reduce((sum, subj) => sum + (subj.totalExamsTaken || 0), 0);
  const avgScore = totalExamsCalculated > 0
    ? Math.round(childSubjects.reduce((sum, subj) => sum + ((subj.averageScore || 0) * (subj.totalExamsTaken || 0)), 0) / totalExamsCalculated)
    : Math.round(stats.averageScore || 0);

  const totalExams = stats.totalExamsTaken || childResultsData?.pagination?.total || attempts.length || 0;
  const attempts = childResultsData?.attempts || [];
  const passedExams = attempts.filter(e => e.passed) || [];

  // Compute trend from attempts chronologically
  const sortedAttempts = [...attempts].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const trend = sortedAttempts.length >= 2
    ? (sortedAttempts[sortedAttempts.length - 1].score || 0) - (sortedAttempts[0].score || 0)
    : 0;
  const trendLabel = trend > 0 ? t('parent.reports.improving') : trend < 0 ? t('parent.reports.declining') : t('parent.reports.stable');

  // Other child stats (for comparison)
  const otherAvg = otherChild ? otherChild.avgScore : 0;
  const otherPassed = otherChild ? otherChild.passed : 0;
  const otherExamsCount = otherChild ? otherChild.totalExams : 0;
  const leadingName = avgScore >= otherAvg ? child?.name : otherChild?.name;

  // Recommendations: subjects with average score below 70
  const recommendations = childSubjects
    .filter(s => (s.averageScore || 0) < 70)
    .map(s => ({
      subject: s.subject?.name || t('parent.reports.subject'),
      score: Math.round(s.averageScore || 0),
      tip: t('parent.reports.tipBelow70', { score: Math.round(s.averageScore || 0) }),
    }));

  const card = isLight
    ? 'bg-white border-gray-200 shadow-sm'
    : 'bg-[#111520] border-gray-800/60';

  const textPrimary = isLight ? 'text-[#0f172a]' : 'text-white';

  return (
    <DashboardLayout
      role="parent"
      activeTab="reports"
      title={t('parent.reports.title')}
      subtitle={t('parent.reports.subtitle')}
      showBackButton
      onBackClick={() => navigate('/parent/dashboard')}
    >
      <div className="flex flex-col gap-5 p-5 pb-36 lg:pb-16 animate-fade-in text-start">

        {/* ── 1. CHILD SELECTOR CARDS ─────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          {children.map((c) => {
            const isSelected = c._id === selectedChildId;
            const initials = c.name ? c.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'ST';
            return (
              <button
                key={c._id}
                onClick={() => setSelectedChildId(c._id)}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${isSelected
                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                    : isLight
                      ? 'bg-white border-gray-200 hover:border-gray-300'
                      : 'bg-[#0e101a] border-gray-800/60 hover:border-gray-700'
                  }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-base text-white shrink-0 ${isSelected
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'bg-gradient-to-br from-emerald-600/70 to-teal-700/70'
                  }`}>
                  {initials}
                </div>
                <div className="text-start min-w-0">
                  <p className={`text-sm font-black capitalize truncate ${textPrimary}`}>{c.name}</p>
                  <p className="text-[11px] text-gray-400 font-semibold">{c.totalExams || 0} {t('parent.reports.exams')}</p>
                  {isSelected && (
                    <p className="text-[11px] text-emerald-400 font-black">{avgScore}% {t('parent.reports.avg')}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* ── 2. VIEW MODE TOGGLE ──────────────────────────────── */}
        {selectedChildId && children.length > 1 && (
          <div className="grid grid-cols-2 gap-3">
            {['Performance', 'Comparison'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl border transition-all cursor-pointer ${viewMode === mode
                    ? 'bg-purple-600 border-purple-500 text-white shadow-[0_4px_20px_rgba(168,85,247,0.3)]'
                    : isLight
                      ? 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                      : 'bg-[#0e101a] border-gray-800/60 text-gray-500 hover:border-gray-700'
                  }`}
              >
                {mode === 'Performance' ? <FiBarChart2 size={22} /> : <FiUsers size={22} />}
                <span className="text-sm font-black">{mode === 'Performance' ? t('parent.reports.performance') : t('parent.reports.comparison')}</span>
              </button>
            ))}
          </div>
        )}

        {/* ══════════════ PERFORMANCE VIEW ══════════════════════ */}
        {selectedChildId && viewMode === 'Performance' && (
          <div className="flex flex-col gap-5 animate-fade-in">

            {/* 4 stat mini-cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="flex flex-col items-center justify-center gap-1 p-3 rounded-2xl bg-yellow-500/5 border border-yellow-500/20 text-center">
                <FiStar className="text-yellow-400" size={18} />
                <span className="text-base font-black text-yellow-400">{avgScore}%</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide leading-tight">{t('parent.reports.avgScore')}</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 p-3 rounded-2xl bg-purple-500/5 border border-purple-500/20 text-center">
                <FaFire className="text-purple-400" size={18} />
                <span className="text-base font-black text-purple-400">{stats.streakDays || 0}d</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide leading-tight">{t('parent.reports.streak')}</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-center">
                <FiCheckCircle className="text-emerald-400" size={18} />
                <span className="text-base font-black text-emerald-400">{passedExams.length}/{totalExams}</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide leading-tight">{t('parent.reports.passed')}</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-center">
                <FiTrendingUp className="text-emerald-400" size={18} />
                <span className="text-base font-black text-emerald-400">{trend >= 0 ? '+' : ''}{trend}</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide leading-tight">{t('parent.reports.trend')}</span>
              </div>
            </div>

            {/* Score Trend Chart card */}
            <div className={`border rounded-2xl p-4 ${card}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                    <FiTrendingUp className="text-white" size={18} />
                  </div>
                  <span className={`text-base font-black ${textPrimary}`}>{t('parent.reports.scoreTrend')}</span>
                </div>
                {attempts.length > 0 && (
                  <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black border ${trend >= 0
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : 'text-red-400 bg-red-500/10 border-red-500/20'
                    }`}>
                    {trend >= 0 ? '↑' : '↓'} {trendLabel}
                  </span>
                )}
              </div>
              {isLoading && attempts.length === 0 ? (
                <TableRowSkeleton />
              ) : (
                <ScoreTrendChart attempts={attempts} isLight={isLight} isRTL={isRTL} t={t} />
              )}
            </div>

            {/* Subject Breakdown card */}
            <div className={`border rounded-2xl p-4 ${card}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                  <FiBookOpen className="text-white" size={18} />
                </div>
                <span className={`text-base font-black ${textPrimary}`}>{t('parent.reports.subjectBreakdown')}</span>
              </div>
              {isLoading && childSubjects.length === 0 ? (
                <TableRowSkeleton />
              ) : childSubjects.length === 0 ? (
                <p className="text-sm text-gray-500 font-semibold text-center py-2">
                  {t('parent.reports.noSubjectsEnrolled')}
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {childSubjects.map((subj) => {
                    const subAvg = Math.round(subj.averageScore || 0);
                    return (
                      <div key={subj._id} className="text-start">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0">
                            <FiBookOpen className="text-amber-400" size={14} />
                          </div>
                          <span className={`text-sm font-extrabold capitalize flex-1 ${textPrimary}`}>
                            {subj.subject?.name}
                          </span>
                          <span className="text-sm font-black text-yellow-400">{subAvg}%</span>
                        </div>
                        <div className={`h-2 w-full rounded-full overflow-hidden ${isLight ? 'bg-gray-200' : 'bg-gray-900'}`}>
                          <div
                            className="h-full bg-yellow-400 rounded-full transition-all duration-700"
                            style={{ width: `${subAvg}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recommendations card */}
            <div className={`border rounded-2xl p-4 ${card}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
                  <FaLightbulb className="text-white" size={16} />
                </div>
                <span className={`text-base font-black ${textPrimary}`}>{t('parent.reports.recommendations')}</span>
              </div>
              {recommendations.length === 0 ? (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <FiCheckCircle className="text-emerald-400 shrink-0" size={16} />
                  <p className="text-sm font-semibold text-emerald-300">{t('parent.reports.greatPerformance')}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border text-start ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#0e101a] border-gray-800/60'}`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <FiBookOpen className="text-amber-400" size={14} />
                      </div>
                      <div>
                        <p className={`text-sm font-black capitalize ${textPrimary}`}>
                          {rec.subject} {t('parent.reports.needsAttention')}
                        </p>
                        <p className="text-[11px] text-gray-400 font-semibold mt-1 leading-relaxed">
                          {rec.tip}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ══════════════ COMPARISON VIEW ═══════════════════════ */}
        {selectedChildId && viewMode === 'Comparison' && otherChild && (
          <div className="flex flex-col gap-5 animate-fade-in">

            {/* Head-to-head card */}
            <div className={`border rounded-2xl p-5 relative overflow-hidden ${isLight
                ? 'bg-purple-50 border-purple-200 shadow-sm'
                : 'bg-purple-900/20 border-purple-500/20'
              }`}>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-transparent pointer-events-none" />
              <div className="flex items-end justify-between relative z-10 gap-4">

                {/* Child A */}
                <div className="flex flex-col items-center gap-2 flex-1">
                  {leadingName === child?.name && (
                    <FaTrophy className="text-yellow-400 mb-1" size={20} />
                  )}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl text-white border-2 ${leadingName === child?.name
                      ? 'bg-gradient-to-br from-yellow-500 to-amber-600 border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.4)]'
                      : 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400/30'
                    }`}>
                    {child?.name ? child.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'ST'}
                  </div>
                  <p className={`text-sm font-black capitalize ${textPrimary}`}>{child?.name}</p>
                  <p className="text-base font-black text-emerald-400">{avgScore}%</p>
                </div>

                {/* VS badge */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className={`w-12 h-12 rounded-full border flex items-center justify-center ${isLight ? 'border-gray-300 bg-white' : 'border-gray-600 bg-transparent'}`}>
                    <span className={`text-sm font-black ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{t('parent.reports.vs')}</span>
                  </div>
                  <p className={`text-[10px] font-bold capitalize ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                    {t('parent.reports.leading')} {leadingName}
                  </p>
                </div>

                {/* Child B */}
                <div className="flex flex-col items-center gap-2 flex-1">
                  {leadingName === otherChild.name && (
                    <FaTrophy className="text-yellow-400 mb-1" size={20} />
                  )}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl text-white border-2 ${leadingName === otherChild.name
                      ? 'bg-gradient-to-br from-yellow-500 to-amber-600 border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.4)]'
                      : 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400/30'
                    }`}>
                    {otherChild.name ? otherChild.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'ST'}
                  </div>
                  <p className={`text-sm font-black capitalize ${textPrimary}`}>{otherChild.name}</p>
                  <p className="text-base font-black text-emerald-400">{otherAvg}%</p>
                </div>

              </div>
            </div>

            {/* Metrics Comparison card */}
            <div className={`border rounded-2xl p-4 ${card}`}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                  <FiRefreshCw className="text-white" size={16} />
                </div>
                <span className={`text-base font-black ${textPrimary}`}>{t('parent.reports.metricsComparison')}</span>
              </div>
              <div className="flex flex-col gap-4">
                <CompareBar
                  label={t('parent.reports.avgScore')}
                  valA={avgScore}
                  valB={otherAvg}
                  displayA={`${avgScore}%`}
                  displayB={`${otherAvg}%`}
                />
                <CompareBar
                  label={t('parent.reports.streakDays')}
                  valA={stats.streakDays || 0}
                  valB={otherChild.streak || 0}
                />
                <CompareBar
                  label={t('parent.reports.examsTaken')}
                  valA={totalExams}
                  valB={otherExamsCount}
                />
                <CompareBar
                  label={t('parent.reports.passed')}
                  valA={passedExams.length}
                  valB={otherPassed}
                />
              </div>
              {/* Legend */}
              <div className={`flex items-center gap-4 mt-4 pt-3 border-t ${isLight ? 'border-gray-200' : 'border-gray-800/50'}`}>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-xs font-bold text-gray-500 capitalize">{child?.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600/60" />
                  <span className="text-xs font-bold text-gray-500 capitalize">{otherChild.name}</span>
                </div>
              </div>
            </div>

            {/* Subject Scores card */}
            <div className={`border rounded-2xl p-4 ${card}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                  <FiBookOpen className="text-white" size={16} />
                </div>
                <span className={`text-base font-black ${textPrimary}`}>{t('parent.reports.subjectScores')}</span>
              </div>
              {childSubjects.length === 0 ? (
                <p className="text-sm text-gray-500 font-semibold text-center py-2">
                  {t('parent.reports.noSubjectsEnrolledShort')}
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 justify-start">
                  {childSubjects.map((subj) => (
                    <div
                      key={subj._id}
                      className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl"
                    >
                      <FiBookOpen className="text-amber-400" size={13} />
                      <span className={`text-xs font-extrabold capitalize ${textPrimary}`}>
                        {subj.subject?.name}
                      </span>
                      <span className="text-xs font-black text-yellow-400">{Math.round(subj.averageScore || 0)}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default ParentReports;