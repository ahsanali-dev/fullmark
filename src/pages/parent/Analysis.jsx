import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBookOpen, FiChevronDown } from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getStoredChildren } from '../../data/parentData';

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
const ExamCard = ({ exam, isLight }) => {
  const isPassed = exam.status === 'Passed';
  return (
    <div className={`rounded-2xl border overflow-hidden ${isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#111520] border-gray-800/60'
      }`}>
      {/* Top row */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/20 flex items-center justify-center shrink-0">
            <FiBookOpen className="text-amber-400" size={16} />
          </div>
          <div>
            <p className={`text-sm font-extrabold leading-tight ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
              {exam.name}
            </p>
            <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
              {exam.subject} · {exam.date}
            </p>
          </div>
        </div>
        <span className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase border ${isPassed
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
          {isPassed ? '✓' : '✗'} {exam.status}
        </span>
      </div>

      {/* Divider */}
      <div className={`h-px mx-4 ${isLight ? 'bg-gray-100' : 'bg-gray-800/50'}`} />

      {/* Bottom row */}
      <div className="flex items-center gap-4 px-4 py-3">
        <ScoreCircle score={exam.score} size={52} />
        <div className="flex-1 flex flex-col gap-1.5">
          <div className={`h-2 w-full rounded-full overflow-hidden ${isLight ? 'bg-gray-100' : 'bg-gray-900'}`}>
            <div
              className={`h-full rounded-full transition-all duration-700 ${isPassed ? 'bg-emerald-500' : 'bg-red-500'}`}
              style={{ width: `${exam.score}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-500 font-semibold">
            {exam.score}% score · {exam.duration ?? 0} min
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-base font-black text-yellow-400 leading-tight">
            {exam.correctAnswers}/{exam.totalQuestions}
          </p>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">correct</p>
        </div>
      </div>
    </div>
  );
};

/* ─── TABS ─────────────────────────────────────────────────── */
const TABS = ['Overview', 'Exams', 'Subjects'];

/* ═══════════════════════════════════════════════════════════ */
const ParentAnalysis = () => {
  const navigate = useNavigate();

  const [isLight, setIsLight] = useState(
    () => document.documentElement.classList.contains('light')
  );
  useEffect(() => {
    const handle = () => setIsLight(document.documentElement.classList.contains('light'));
    window.addEventListener('themeChange', handle);
    return () => window.removeEventListener('themeChange', handle);
  }, []);

  const [children] = useState(() => getStoredChildren());
  const [selectedChildId, setSelectedChildId] = useState(children[0]?.id || null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [showChildPicker, setShowChildPicker] = useState(false);

  const child = children.find(c => c.id === selectedChildId) || children[0];
  const exams = child?.exams || [];
  const subjects = child?.subjects || [];

  const totalExams = exams.length;
  const passedExams = exams.filter(e => e.status === 'Passed');
  const failedExams = exams.filter(e => e.status === 'Failed');
  const avgScore = totalExams > 0
    ? Math.round(exams.reduce((s, e) => s + e.score, 0) / totalExams)
    : 0;
  const streak = child?.streak || 0;

  const sortedSubjects = [...subjects].sort((a, b) => b.avgScore - a.avgScore);
  const strongestSubject = sortedSubjects[0] || null;
  const weakestSubject = sortedSubjects[sortedSubjects.length - 1] || null;

  const performanceLabel =
    avgScore >= 80 ? '🏆 Excellent performance!' :
      avgScore >= 60 ? '📈 Good progress, keep it up' :
        '⚠️ Needs improvement and attention';

  // ── shared helpers ─────────────────────────────────────────
  const textPrimary = isLight ? 'text-[#0f172a]' : 'text-white';
  const card = isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#111520] border-gray-800/60';
  const divider = isLight ? 'bg-gray-100' : 'bg-gray-800/50';
  const trackBg = isLight ? 'bg-gray-100' : 'bg-gray-900';
  const emptyBg = isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#0e101a] border-gray-800/60';

  return (
    <DashboardLayout
      role="parent"
      activeTab="attendance"
      title="Analysis"
      subtitle={`${child?.name || ''}'s performance`}
      showBackButton
      onBackClick={() => navigate('/parent/dashboard')}
    >
      <div className="flex flex-col w-full pb-36 lg:pb-16 animate-fade-in">

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
                {child?.initials}
              </div>
              <span className={`text-sm font-extrabold capitalize flex-1 text-left ${textPrimary}`}>
                {child?.name}
              </span>
              <FiChevronDown
                className={`text-gray-400 transition-transform ${showChildPicker ? 'rotate-180' : ''}`}
                size={16}
              />
            </button>

            {showChildPicker && (
              <div className={`absolute top-full left-0 right-0 mt-2 border rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.15)] z-20 animate-fade-in ${isLight ? 'bg-white border-gray-200' : 'bg-[#0f1020] border-gray-800'
                }`}>
                {children.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedChildId(c.id); setShowChildPicker(false); setActiveTab('Overview'); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors cursor-pointer ${c.id === selectedChildId
                        ? 'bg-purple-500/10 text-purple-400'
                        : isLight
                          ? 'text-gray-600 hover:bg-gray-50'
                          : 'text-gray-300 hover:bg-gray-800/40'
                      }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-black text-[11px] text-white shrink-0">
                      {c.initials}
                    </div>
                    <span className="capitalize">{c.name}</span>
                    {c.id === selectedChildId && (
                      <span className="ml-auto text-[10px] font-black text-purple-400 uppercase">Selected</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── CHILD HEADER CARD ──────────────────────────────── */}
        <div className="mx-5 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 p-5 shadow-[0_0_30px_rgba(16,185,129,0.25)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/20 flex items-center justify-center font-black text-xl text-white shrink-0">
              {child?.initials}
            </div>
            <div>
              <h2 className="text-xl font-black text-white capitalize">{child?.name}</h2>
              <p className="text-white/70 text-xs font-semibold">Student</p>
              {streak > 0 && (
                <div className="flex items-center gap-1 mt-1.5 px-2.5 py-1 rounded-full bg-orange-500/20 border border-orange-400/30 w-fit">
                  <FaFire className="text-orange-400" size={11} />
                  <span className="text-orange-300 text-[11px] font-bold">{streak}d streak</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-0 mt-5 border-t border-white/15 pt-4">
            {[
              { label: 'Avg Score', value: `${avgScore}%` },
              { label: 'Exams', value: totalExams },
              { label: 'Passed', value: passedExams.length },
              { label: 'Failed', value: failedExams.length },
            ].map((s, i) => (
              <div key={s.label} className={`flex flex-col items-center text-center ${i < 3 ? 'border-r border-white/15' : ''}`}>
                <span className="text-lg font-black text-white">{s.value}</span>
                <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider mt-0.5">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── TAB BAR ────────────────────────────────────────── */}
        <div className={`flex border-b mx-5 mt-5 ${isLight ? 'border-gray-200' : 'border-gray-800/60'}`}>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-extrabold transition-all cursor-pointer border-b-2 ${activeTab === tab
                  ? 'text-emerald-400 border-emerald-400'
                  : isLight
                    ? 'text-gray-400 hover:text-gray-600 border-transparent'
                    : 'text-gray-500 hover:text-gray-400 border-transparent'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── TAB CONTENT ────────────────────────────────────── */}
        <div className="flex flex-col gap-5 p-5">

          {/* ══ OVERVIEW TAB ══════════════════════════════════ */}
          {activeTab === 'Overview' && (
            <div className="flex flex-col gap-5 animate-fade-in">

              {/* Overall Performance card */}
              <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 p-5 relative overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-tl-full pointer-events-none" />
                <p className="text-white/70 text-xs font-semibold">Overall Performance</p>
                <p className="text-4xl font-black text-white mt-1">{avgScore}%</p>
                <p className="text-white/80 text-sm font-semibold mt-2">{performanceLabel}</p>
                <div className="flex items-center gap-6 mt-3">
                  <div>
                    <span className="text-white font-black text-sm">{passedExams.length}/{totalExams}</span>
                    <span className="text-white/60 text-xs font-semibold block">Passed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-white font-black text-sm">{streak}d</span>
                    <FaFire className="text-orange-400" size={13} />
                    <span className="text-white/60 text-xs font-semibold block ml-0.5">Streak</span>
                  </div>
                </div>
              </div>

              {/* Strongest / Needs Attention */}
              {subjects.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  <div className={`rounded-2xl border p-4 flex flex-col gap-3 ${isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-[#111520] border-emerald-500/20'
                    }`}>
                    <p className="text-xs font-black text-emerald-400 flex items-center gap-1">
                      👍 Strongest Subject
                    </p>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                      <FiBookOpen className="text-emerald-400" size={16} />
                    </div>
                    <p className={`text-sm font-extrabold capitalize ${textPrimary}`}>{strongestSubject?.name}</p>
                    <div className={`h-1.5 w-full rounded-full overflow-hidden ${trackBg}`}>
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${strongestSubject?.avgScore ?? 0}%` }} />
                    </div>
                    <p className="text-sm font-black text-emerald-400">{strongestSubject?.avgScore ?? 0}%</p>
                  </div>

                  <div className={`rounded-2xl border p-4 flex flex-col gap-3 ${isLight ? 'bg-red-50 border-red-200' : 'bg-[#111520] border-red-500/20'
                    }`}>
                    <p className="text-xs font-black text-red-400 flex items-center gap-1">
                      ❗ Needs Attention
                    </p>
                    <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center">
                      <FiBookOpen className="text-red-400" size={16} />
                    </div>
                    <p className={`text-sm font-extrabold capitalize ${textPrimary}`}>{weakestSubject?.name}</p>
                    <div className={`h-1.5 w-full rounded-full overflow-hidden ${trackBg}`}>
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${weakestSubject?.avgScore ?? 0}%` }} />
                    </div>
                    <p className="text-sm font-black text-red-400">{weakestSubject?.avgScore ?? 0}%</p>
                  </div>
                </div>
              )}

              {/* Recent Exams */}
              <div className="flex flex-col gap-3">
                <h3 className={`text-base font-black ${textPrimary}`}>Recent Exams</h3>
                {exams.length === 0 ? (
                  <div className={`p-8 rounded-2xl border flex flex-col items-center gap-2 ${emptyBg}`}>
                    <FiBookOpen className="text-gray-400" size={32} />
                    <p className="text-sm font-extrabold text-gray-500">No exams taken yet</p>
                  </div>
                ) : (
                  exams.slice(0, 5).map((exam) => (
                    <ExamCard key={exam.id} exam={exam} isLight={isLight} />
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
                  <span>{passedExams.length} Passed</span>
                </div>
                <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 font-black text-sm">
                  <span>✗</span>
                  <span>{failedExams.length} Failed</span>
                </div>
              </div>
              {exams.length === 0 ? (
                <div className={`p-8 rounded-2xl border flex flex-col items-center gap-2 ${emptyBg}`}>
                  <FiBookOpen className="text-gray-400" size={32} />
                  <p className="text-sm font-extrabold text-gray-500">No exams taken yet</p>
                </div>
              ) : (
                exams.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} isLight={isLight} />
                ))
              )}
            </div>
          )}

          {/* ══ SUBJECTS TAB ══════════════════════════════════ */}
          {activeTab === 'Subjects' && (
            <div className="flex flex-col gap-4 animate-fade-in">
              {subjects.length === 0 ? (
                <div className={`p-10 rounded-2xl border flex flex-col items-center gap-2 ${emptyBg}`}>
                  <FiBookOpen className="text-gray-400" size={36} />
                  <p className="text-sm font-extrabold text-gray-500">No subjects enrolled yet</p>
                </div>
              ) : (
                subjects.map((subj) => {
                  const subAvg = subj.avgScore || 0;
                  const barColor = subAvg >= 60 ? 'bg-yellow-400' : 'bg-red-500';
                  return (
                    <div key={subj.name} className={`rounded-2xl border overflow-hidden ${card}`}>
                      {/* Subject header */}
                      <div className="flex items-center justify-between px-4 pt-4 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/20 flex items-center justify-center shrink-0">
                            <FiBookOpen className="text-amber-400" size={16} />
                          </div>
                          <div>
                            <p className={`text-sm font-extrabold capitalize ${textPrimary}`}>{subj.name}</p>
                            <p className="text-[11px] text-gray-500 font-semibold">
                              {subj.examScores?.length ?? 0} exams taken
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-base font-black text-yellow-400">{subAvg}%</span>
                          {(subj.improvement ?? 0) > 0 && (
                            <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              ↑ +{subj.improvement}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className={`h-px mx-4 ${divider}`} />

                      {/* Exam History */}
                      <div className="px-4 py-3">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Exam History</p>
                        <div className="flex gap-2 flex-wrap">
                          {(subj.examScores || []).map((sc, idx) => {
                            const isPassed = sc >= 60;
                            return (
                              <div
                                key={idx}
                                className={`flex flex-col items-center justify-center px-4 py-2.5 rounded-xl text-center min-w-[72px] ${isPassed
                                    ? 'bg-emerald-500/10 border border-emerald-500/30'
                                    : 'bg-red-500/10 border border-red-500/25'
                                  }`}
                              >
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Exam {idx + 1}</span>
                                <span className={`text-base font-black mt-0.5 ${isPassed ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {sc}%
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Average progress bar */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-bold text-gray-500">Average:</span>
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
      </div>
    </DashboardLayout>
  );
};

export default ParentAnalysis;