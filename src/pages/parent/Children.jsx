import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiBookOpen,
  FiClipboard,
  FiTrendingUp,
  FiAward,
  FiChevronDown,
  FiChevronUp,
  FiSearch,
} from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getStoredChildren } from '../../data/parentData';

const ParentChildren = () => {
  const navigate = useNavigate();
  const [children] = useState(() => getStoredChildren());
  const [selectedChildId, setSelectedChildId] = useState(children[0]?.id || null);
  const [expandedExamId, setExpandedExamId] = useState(null);
  const [search, setSearch] = useState('');

  const selectedChild = children.find(c => c.id === selectedChildId) || children[0];
  const childExams = (selectedChild?.exams || []).filter(
    e => e.subject.toLowerCase().includes(search.toLowerCase()) || e.name?.toLowerCase().includes(search.toLowerCase())
  );

  const avgScore = childExams.length > 0
    ? Math.round(childExams.reduce((s, e) => s + e.score, 0) / childExams.length)
    : 0;
  const passedCount = childExams.filter(e => e.status === 'Passed').length;
  const bestScore = childExams.length > 0 ? Math.max(...childExams.map(e => e.score)) : 0;

  return (
    <DashboardLayout
      role="parent"
      activeTab="children"
      title="Children Stats"
      subtitle="Detailed performance reports"
    >
      <div className="flex flex-col gap-6 text-left p-6 md:p-8 pb-36 lg:pb-16 animate-fade-in">

        {/* Child Selector Tabs */}
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => setSelectedChildId(child.id)}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm border whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                selectedChildId === child.id
                  ? 'bg-purple-600 border-purple-500 text-white shadow-[0_4px_15px_rgba(168,85,247,0.3)]'
                  : 'bg-[#0e101a] border-gray-800 text-gray-400 hover:border-gray-700'
              }`}
            >
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                selectedChildId === child.id ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-400'
              }`}>
                {child.initials}
              </div>
              <span className="capitalize">{child.name}</span>
            </button>
          ))}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Avg Score', value: `${avgScore}%`, icon: FiTrendingUp, color: 'cyan' },
            { label: 'Best Score', value: `${bestScore}%`, icon: FiAward, color: 'yellow' },
            { label: 'Passed', value: passedCount, icon: FiClipboard, color: 'emerald' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className={`p-4 rounded-2xl bg-${s.color}-500/10 border border-${s.color}-500/20 flex flex-col items-center justify-center text-center gap-1.5`}
              >
                <Icon className={`text-${s.color}-400 text-lg`} />
                <span className="text-lg font-black text-white">{s.value}</span>
                <span className={`text-[10px] font-bold text-${s.color}-400 uppercase tracking-wider`}>{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Subject Performance */}
        {(selectedChild?.subjects || []).length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-base font-black text-white">Subject Performance</h3>
            {selectedChild.subjects.map((subj) => (
              <div
                key={subj.name}
                className="p-4 bg-[#0e101a] border border-gray-800 rounded-2xl flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                      <FiBookOpen size={14} />
                    </div>
                    <span className="text-sm font-extrabold text-white capitalize">{subj.name}</span>
                  </div>
                  <span className="text-sm font-black text-emerald-400">{subj.bestScore}%</span>
                </div>
                <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                    style={{ width: `${subj.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search Exams */}
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exams..."
            className="w-full pl-11 pr-4 py-3 bg-[#0e101a] border border-gray-800 rounded-2xl text-white text-sm font-semibold outline-none focus:border-purple-500/50 transition-colors placeholder:text-gray-600"
          />
        </div>

        {/* Exams List */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-black text-white">Exam History</h3>
            <span className="text-xs font-bold text-gray-500">{childExams.length} exams</span>
          </div>

          {childExams.length === 0 ? (
            <div className="p-10 rounded-3xl bg-[#0c0d19]/40 border border-gray-800/80 flex flex-col items-center justify-center gap-2">
              <FiClipboard className="text-gray-600" size={36} />
              <span className="text-sm font-extrabold text-gray-500">No exams taken yet</span>
            </div>
          ) : (
            childExams.map((exam) => {
              const isPassed = exam.status === 'Passed';
              const isExpanded = expandedExamId === exam.id;
              return (
                <div
                  key={exam.id}
                  className={`p-4 bg-[#0e101a] border rounded-2xl transition-all duration-300 ${
                    isPassed ? 'border-emerald-500/20' : 'border-red-500/20'
                  }`}
                >
                  <button
                    onClick={() => setExpandedExamId(isExpanded ? null : exam.id)}
                    className="w-full flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {/* Score ring */}
                      <div className="relative w-12 h-12 shrink-0">
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
                      <div className="text-left">
                        <p className="text-sm font-black text-white capitalize">{exam.subject}</p>
                        <p className="text-xs text-gray-500 font-semibold">{exam.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border flex items-center gap-1 ${
                        isPassed
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/10 border-red-500/20 text-red-400'
                      }`}>
                        {isPassed ? '✓' : '✗'} {exam.status}
                      </span>
                      {isExpanded ? (
                        <FiChevronUp size={16} className="text-gray-400" />
                      ) : (
                        <FiChevronDown size={16} className="text-gray-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-800/50 flex items-center justify-between animate-fade-in">
                      <div className="text-center">
                        <span className="text-xs text-gray-500 font-semibold block">Score</span>
                        <span className="text-base font-black text-white">{exam.score}/{exam.total || 100}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-xs text-gray-500 font-semibold block">Status</span>
                        <span className={`text-sm font-black ${isPassed ? 'text-emerald-400' : 'text-red-400'}`}>{exam.status}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-xs text-gray-500 font-semibold block">Date</span>
                        <span className="text-sm font-black text-white">{exam.date}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default ParentChildren;
