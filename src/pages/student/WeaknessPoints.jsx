import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTrendingUp, FiCheckCircle, FiClock, FiPlayCircle, FiZap, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';

import DashboardLayout from '../../components/layout/DashboardLayout';
import { fetchWeaknesses } from '../../redux/slices/studentSlice';
import { ContentSkeleton } from '../../components/shared/SkeletonLoading';

const WeaknessPoints = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'improving' | 'resolved'
  const { weaknesses = [], isLoading } = useSelector((state) => state.student);

  useEffect(() => {
    dispatch(fetchWeaknesses(activeTab));
  }, [dispatch, activeTab]);

  return (
    <DashboardLayout
      role="student"
      activeTab="weaknesses"
      title="My Weakness Topics"
      subtitle="Track mistake points and master difficult concepts through SRS review"
    >
      <div className="w-full max-w-5xl mx-auto p-4 md:p-8 pb-32 flex flex-col gap-6 text-left animate-fade-in">

        {/* Top Hero Banner */}
        <div className="p-6 md:p-8 bg-gradient-to-r from-amber-950/40 via-[#0e101a] to-amber-950/20 border border-amber-500/30 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-3xl shadow-inner shrink-0">
              🎯
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">AI Weakness Tracker</h2>
              <p className="text-sm font-semibold text-gray-400 mt-1 max-w-md">
                Spaced repetition automatically schedules customized review tests to convert weak areas into strengths.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/student/daily-improvement-test')}
            className="px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-white font-black text-sm md:text-base flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(245,158,11,0.35)] transition-all transform hover:-translate-y-0.5 cursor-pointer border border-amber-400/30 shrink-0"
          >
            <FiZap size={20} />
            <span>Take Daily Improvement Test</span>
            <FiChevronRight size={18} />
          </button>
        </div>

        {/* Tab Filters */}
        <div className="p-1.5 bg-[#0a0b14]/80 border border-gray-800/80 rounded-2xl w-full grid grid-cols-3 gap-1.5 shadow-inner">
          <button
            onClick={() => setActiveTab('active')}
            className={`py-3 px-4 text-center font-black text-xs md:text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'active'
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>🎯 Active Weaknesses</span>
          </button>

          <button
            onClick={() => setActiveTab('improving')}
            className={`py-3 px-4 text-center font-black text-xs md:text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'improving'
                ? 'bg-blue-500/20 border border-blue-500/40 text-blue-400 shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FiTrendingUp size={16} />
            <span>Improving Stage</span>
          </button>

          <button
            onClick={() => setActiveTab('resolved')}
            className={`py-3 px-4 text-center font-black text-xs md:text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'resolved'
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FiCheckCircle size={16} />
            <span>Resolved Topics</span>
          </button>
        </div>

        {/* List of Weakness Topics */}
        {isLoading ? (
          <ContentSkeleton rows={3} />
        ) : weaknesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weaknesses.map((item) => {
              const topic = item.weaknessTopic || item.topic || item;
              const title = topic.title || item.title || 'Weakness Topic';
              const subjectName = item.subject?.title || item.subject?.name || 'General Subject';
              const mistakeCount = item.mistakeCount || item.mistakes || 1;
              const reviewStage = item.reviewStage !== undefined ? item.reviewStage : 0;
              const stageLabels = ['Day 0 (Initial)', 'Day 1 (Review)', 'Day 3 (Solidify)', 'Day 7 (Mastery)', 'Day 14 (Resolved)'];

              return (
                <div
                  key={item._id || item.id}
                  className="p-6 bg-[#0e101a] border border-gray-800/80 hover:border-amber-500/30 rounded-3xl shadow-xl flex flex-col justify-between gap-5 transition-all text-left group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-black tracking-wider uppercase text-amber-400/90 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 inline-block mb-2">
                        {subjectName}
                      </span>
                      <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                        {title}
                      </h3>
                      {topic.titleAr && (
                        <span className="text-xs font-semibold text-gray-500 block mt-0.5">
                          {topic.titleAr}
                        </span>
                      )}
                    </div>

                    <div className="px-3 py-1.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-black text-xs shrink-0 flex items-center gap-1">
                      <span>⚠️ {mistakeCount} Mistakes</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-3 border-t border-gray-800/50">
                    <div className="flex items-center justify-between text-xs text-gray-400 font-bold">
                      <span>SRS Stage:</span>
                      <span className="text-amber-400 font-black">{stageLabels[Math.min(reviewStage, 4)]}</span>
                    </div>

                    {/* Progress Bar for SRS Stage */}
                    <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden border border-gray-800">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(((reviewStage + 1) / 5) * 100, 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold mt-1">
                      <span className="flex items-center gap-1">
                        <FiClock size={12} /> Last mistake: {item.lastMistakeAt ? new Date(item.lastMistakeAt).toLocaleDateString() : 'Recent'}
                      </span>
                      <span className="capitalize font-bold text-gray-400">
                        Status: {item.status || activeTab}
                      </span>
                    </div>
                  </div>

                  {topic.generalVideoUrl && (
                    <a
                      href={topic.generalVideoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer mt-1"
                    >
                      <FiPlayCircle size={16} /> Watch Topic Explanation Video
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center bg-[#0e101a] border border-gray-800/80 rounded-3xl flex flex-col items-center justify-center">
            <span className="text-4xl mb-3">🎉</span>
            <h3 className="text-lg font-black text-white">No {activeTab} weakness topics!</h3>
            <p className="text-xs text-gray-400 font-medium mt-1">
              Keep practicing exams. Any questions you get wrong will automatically be tracked here for improvement.
            </p>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default WeaknessPoints;
