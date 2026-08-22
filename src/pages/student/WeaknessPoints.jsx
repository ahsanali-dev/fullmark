import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTrendingUp, FiCheckCircle, FiClock, FiPlayCircle, FiZap, FiChevronRight, FiChevronLeft, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';

import DashboardLayout from '../../components/layout/DashboardLayout';
import VideoPlayer from '../../components/shared/VideoPlayer';
import { fetchWeaknesses } from '../../redux/slices/studentSlice';
import { ContentSkeleton } from '../../components/shared/SkeletonLoading';
import { useLanguage } from '../../context/LanguageContext';

const WeaknessPoints = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, isRTL } = useLanguage();

  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'improving' | 'resolved'
  const [activeVideo, setActiveVideo] = useState(null); // { url, title, topicId }
  const { weaknesses = [], isLoading } = useSelector((state) => state.student);

  const [isLight, setIsLight] = useState(() => {
    return localStorage.getItem('theme') === 'light' || document.documentElement.classList.contains('light');
  });

  useEffect(() => {
    const handleThemeChange = () => {
      setIsLight(localStorage.getItem('theme') === 'light' || document.documentElement.classList.contains('light'));
    };
    handleThemeChange();
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  useEffect(() => {
    dispatch(fetchWeaknesses(activeTab));
  }, [dispatch, activeTab]);

  return (
    <DashboardLayout
      role="student"
      activeTab="weaknesses"
      title={t('student.weakness.title')}
      subtitle={t('student.weakness.subtitle')}
    >
      <div className="w-full max-w-5xl mx-auto p-4 md:p-8 pb-32 flex flex-col gap-6 text-start animate-fade-in">

        {/* Top Hero Banner */}
        <div className={`p-6 md:p-8 border rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden text-start ${
          isLight 
            ? 'bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-500/10 border-amber-300/70 shadow-md' 
            : 'bg-gradient-to-r from-amber-950/40 via-[#0e101a] to-amber-950/20 border-amber-500/30'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner shrink-0 ${
              isLight ? 'bg-amber-100 border border-amber-300 text-amber-600' : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
            }`}>
              🎯
            </div>
            <div>
              <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${isLight ? 'text-amber-950' : 'text-white'}`}>
                {t('student.weakness.trackerTitle')}
              </h2>
              <p className={`text-sm font-semibold mt-1 max-w-md ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                {t('student.weakness.trackerDesc')}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/student/daily-improvement-test')}
            className="px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-white font-black text-sm md:text-base flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(245,158,11,0.35)] transition-all transform hover:-translate-y-0.5 cursor-pointer border border-amber-400/30 shrink-0"
          >
            <FiZap size={20} />
            <span>{t('student.weakness.dailyImprovementTest')}</span>
            {isRTL ? <FiChevronLeft size={18} /> : <FiChevronRight size={18} />}
          </button>
        </div>

        {/* Tab Filters */}
        <div className={`p-1.5 border rounded-2xl w-full grid grid-cols-3 gap-1 sm:gap-1.5 shadow-inner min-w-0 ${
          isLight ? 'bg-slate-200/70 border-slate-300' : 'bg-[#0a0b14]/80 border-gray-800/80'
        }`}>
          <button
            onClick={() => setActiveTab('active')}
            className={`py-2.5 sm:py-3 px-1.5 sm:px-4 text-center font-black text-[10px] xs:text-xs md:text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 min-w-0 ${
              activeTab === 'active'
                ? isLight ? 'bg-amber-500 text-white shadow-md' : 'bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-md'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="truncate">{t('student.weakness.activeWeaknesses')}</span>
          </button>

          <button
            onClick={() => setActiveTab('improving')}
            className={`py-2.5 sm:py-3 px-1.5 sm:px-4 text-center font-black text-[10px] xs:text-xs md:text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 min-w-0 ${
              activeTab === 'improving'
                ? isLight ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-500/20 border border-blue-500/40 text-blue-400 shadow-md'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FiTrendingUp className="shrink-0 text-xs sm:text-base" />
            <span className="truncate">{t('student.weakness.improvingStage')}</span>
          </button>

          <button
            onClick={() => setActiveTab('resolved')}
            className={`py-2.5 sm:py-3 px-1.5 sm:px-4 text-center font-black text-[10px] xs:text-xs md:text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 min-w-0 ${
              activeTab === 'resolved'
                ? isLight ? 'bg-emerald-600 text-white shadow-md' : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-md'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FiCheckCircle className="shrink-0 text-xs sm:text-base" />
            <span className="truncate">{t('student.weakness.mastered')}</span>
          </button>
        </div>

        {/* List of Weakness Topics */}
        {isLoading ? (
          <ContentSkeleton rows={3} />
        ) : weaknesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weaknesses.map((item) => {
              const topic = item.weaknessTopic || item.topic || item;
              const title = topic.title || item.title || t('student.weakness.weaknessTopic');
              const subjectName = (isRTL && item.subject?.nameAr) ? item.subject.nameAr : (item.subject?.name || item.subject?.title || t('student.weakness.generalSubject'));
              const mistakeCount = item.mistakeCount || item.mistakes || 1;
              const reviewStage = item.reviewStage !== undefined ? item.reviewStage : 0;
              const stageLabels = [
                t('student.weakness.stage0'),
                t('student.weakness.stage1'),
                t('student.weakness.stage2'),
                t('student.weakness.stage3'),
                t('student.weakness.stage4')
              ];

              return (
                <div
                  key={item._id || item.id}
                  className={`p-6 border rounded-3xl shadow-xl flex flex-col justify-between gap-5 transition-all text-start group ${
                    isLight 
                      ? 'bg-white border-slate-200 hover:border-amber-400 shadow-sm' 
                      : 'bg-[#0e101a] border-gray-800/80 hover:border-amber-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-md border inline-block mb-2 ${
                        isLight ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-amber-500/10 text-amber-400/90 border-amber-500/20'
                      }`}>
                        {subjectName}
                      </span>
                      <h3 className={`text-lg font-black transition-colors ${
                        isLight ? 'text-slate-900 group-hover:text-amber-600' : 'text-white group-hover:text-amber-300'
                      }`}>
                        {(isRTL && topic.titleAr) ? topic.titleAr : title}
                      </h3>
                      {topic.titleAr && !isRTL && (
                        <span className={`text-xs font-semibold block mt-0.5 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                          {topic.titleAr}
                        </span>
                      )}
                    </div>

                    <div className={`px-3 py-1.5 rounded-2xl border font-black text-xs shrink-0 flex items-center gap-1 ${
                      isLight ? 'bg-rose-100 border-rose-300 text-rose-700' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}>
                      <span>⚠️ {t('student.weakness.mistakesCount', { count: mistakeCount })}</span>
                    </div>
                  </div>

                  <div className={`flex flex-col gap-2 pt-3 border-t ${isLight ? 'border-slate-200' : 'border-gray-800/50'}`}>
                    <div className={`flex items-center justify-between text-xs font-bold ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                      <span>{t('student.weakness.srsStage')}</span>
                      <span className={`font-black ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>{stageLabels[Math.min(reviewStage, 4)]}</span>
                    </div>

                    {/* Progress Bar for SRS Stage */}
                    <div className={`w-full rounded-full h-2 overflow-hidden border ${isLight ? 'bg-slate-200 border-slate-300' : 'bg-gray-900 border-gray-800'}`}>
                      <div
                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(((reviewStage + 1) / 5) * 100, 100)}%` }}
                      />
                    </div>

                    <div className={`flex items-center justify-between text-[11px] font-semibold mt-1 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                      <span className="flex items-center gap-1">
                        <FiClock size={12} /> {t('student.weakness.lastMistake')} {item.lastMistakeAt ? new Date(item.lastMistakeAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US') : t('student.weakness.recent')}
                      </span>
                      <span className={`capitalize font-bold ${isLight ? 'text-slate-700' : 'text-gray-400'}`}>
                        {t('student.weakness.status')} {item.status || activeTab}
                      </span>
                    </div>
                  </div>

                  {topic.generalVideoUrl && (
                    <button
                      onClick={() => setActiveVideo({
                        url: topic.generalVideoUrl,
                        title: (isRTL && topic.titleAr) ? topic.titleAr : title,
                        topicId: topic._id || topic.id
                      })}
                      className={`px-4 py-2.5 rounded-xl border font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer mt-1 ${
                        isLight 
                          ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-700' 
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      <FiPlayCircle size={16} /> {t('student.weakness.watchExplanation')}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`p-12 text-center border rounded-3xl flex flex-col items-center justify-center ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0e101a] border-gray-800/80'
          }`}>
            <span className="text-4xl mb-3">🎉</span>
            <h3 className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{t('student.weakness.noWeaknessTopics', { tab: activeTab })}</h3>
            <p className={`text-xs font-medium mt-1 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
              {t('student.weakness.keepPracticing')}
            </p>
          </div>
        )}

        {/* Video Explanation Modal */}
        {activeVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="bg-[#0e101a] border border-gray-800 rounded-3xl p-5 max-w-3xl w-full flex flex-col gap-4 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <h3 className="text-base font-black text-white">{activeVideo.title}</h3>
                <button
                  onClick={() => setActiveVideo(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-all"
                >
                  <FiX size={18} />
                </button>
              </div>

              <VideoPlayer
                videoUrl={activeVideo.url}
                targetType="weaknessTopic"
                targetId={activeVideo.topicId}
                autoPlay={true}
                className="w-full h-full"
              />
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default WeaknessPoints;
