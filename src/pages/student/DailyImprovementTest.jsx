import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiCheck, FiX, FiArrowRight, FiArrowLeft, FiAward, FiZap, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';

import DashboardLayout from '../../components/layout/DashboardLayout';
import { fetchDailyImprovementTest, submitDailyImprovementTest } from '../../redux/slices/studentSlice';
import { ContentSkeleton } from '../../components/shared/SkeletonLoading';
import { useLanguage } from '../../context/LanguageContext';

const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const baseUrl = import.meta.env.VITE_IMAGE_URL || 'http://146.190.18.35:3008/uploads';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${cleanBase}/${cleanPath}`;
};

const DailyImprovementTest = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, isRTL } = useLanguage();

  const { dailyImprovementTest, isLoading, isActionLoading } = useSelector((state) => state.student);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionId: selectedOptionIndex }
  const [startTime] = useState(Date.now());
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    dispatch(fetchDailyImprovementTest());
  }, [dispatch]);

  const questions = dailyImprovementTest?.questions || (Array.isArray(dailyImprovementTest) ? dailyImprovementTest : []);
  const currentQuestion = questions[currentIdx];

  const handleSelectOption = (questionId, optionIdx) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  const handleSubmitTest = async () => {
    if (Object.keys(selectedAnswers).length < questions.length) {
      if (!window.confirm(t('student.dailyImprovement.unansweredConfirm'))) {
        return;
      }
    }

    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    const answersPayload = questions.map(q => {
      const qId = q._id || q.id;
      return {
        questionId: qId,
        selectedOption: selectedAnswers[qId] !== undefined ? selectedAnswers[qId] : -1,
        timeTaken: timeTaken
      };
    });

    const loadingToast = toast.loading(t('student.dailyImprovement.submitting'));

    try {
      const res = await dispatch(submitDailyImprovementTest({ answers: answersPayload })).unwrap();
      toast.success(t('student.dailyImprovement.submitSuccess'), { id: loadingToast });
      setTestResult(res?.result || res?.data || res);
    } catch (err) {
      toast.error(err || t('student.dailyImprovement.submitFail'), { id: loadingToast });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="student" activeTab="weaknesses" title={t('student.dailyImprovement.title')}>
        <div className="max-w-3xl mx-auto p-6">
          <ContentSkeleton rows={4} />
        </div>
      </DashboardLayout>
    );
  }

  // Result Summary View
  if (testResult) {
    const totalCount = questions.length;
    const score = testResult.score !== undefined ? testResult.score : testResult.correctCount || 0;
    const percentage = totalCount > 0 ? Math.round((score / totalCount) * 100) : 100;

    return (
      <DashboardLayout role="student" activeTab="weaknesses" title={t('student.dailyImprovement.resultsTitle')}>
        <div className="w-full max-w-3xl mx-auto p-4 md:p-8 pb-32 flex flex-col gap-6 text-start animate-fade-in">
          
          <div className="p-8 bg-[#0e101a] border border-amber-500/30 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center text-center gap-6">
            <div className="w-24 h-24 rounded-full bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 text-4xl shadow-lg">
              <FiAward />
            </div>

            <div>
              <h2 className="text-3xl font-black text-white">{t('student.dailyImprovement.reviewCompleted')}</h2>
              <p className="text-sm text-gray-400 font-semibold mt-1">{t('student.dailyImprovement.scheduleUpdated')}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              <div className="p-4 bg-[#121424] border border-gray-800 rounded-2xl flex flex-col items-center">
                <span className="text-xs font-black text-gray-400 uppercase">{t('student.dailyImprovement.score')}</span>
                <span className="text-2xl font-black text-amber-400 mt-1">{score} / {totalCount}</span>
              </div>
              <div className="p-[#121424] border border-gray-800 rounded-2xl flex flex-col items-center p-4">
                <span className="text-xs font-black text-gray-400 uppercase">{t('student.dailyImprovement.accuracy')}</span>
                <span className="text-2xl font-black text-emerald-400 mt-1">{percentage}%</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/student/weaknesses')}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 text-white font-black text-base shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
            >
              {t('student.dailyImprovement.backToWeakness')}
            </button>
          </div>

        </div>
      </DashboardLayout>
    );
  }

  // No Due Test Available
  if (!questions || questions.length === 0) {
    return (
      <DashboardLayout role="student" activeTab="weaknesses" title={t('student.dailyImprovement.title')}>
        <div className="w-full max-w-2xl mx-auto p-8 pb-32 flex flex-col items-center justify-center text-center gap-6 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-4xl">
            <FiCheck />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">{t('student.dailyImprovement.noDueTests')}</h2>
            <p className="text-sm font-semibold text-gray-400 mt-1">
              {t('student.dailyImprovement.caughtUp')}
            </p>
          </div>
          <button
            onClick={() => navigate('/student/weaknesses')}
            className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm cursor-pointer transition-all"
          >
            {t('student.dailyImprovement.viewWeaknessTopics')}
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const qId = currentQuestion._id || currentQuestion.id;
  const currentSelected = selectedAnswers[qId];

  return (
    <DashboardLayout
      role="student"
      activeTab="weaknesses"
      title={t('student.dailyImprovement.title')}
      subtitle={t('student.dailyImprovement.questionProgress', { current: currentIdx + 1, total: questions.length })}
    >
      <div className="w-full max-w-3xl mx-auto p-4 md:p-8 pb-32 flex flex-col gap-6 text-start animate-fade-in">

        {/* Header Bar */}
        <div className="flex items-center justify-between gap-4 pb-2 border-b border-gray-800/40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/student/weaknesses')}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
            >
              {isRTL ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
            </button>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                🎯 {t('student.dailyImprovement.dailyPractice')}
              </h2>
              <span className="text-xs text-amber-400 font-bold">
                {t('student.dailyImprovement.targetingWeakness')} {currentQuestion.weaknessTopic?.title || currentQuestion.topicTitle || t('student.dailyImprovement.weaknessReview')}
              </span>
            </div>
          </div>

          <span className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black text-xs">
            {currentIdx + 1} / {questions.length}
          </span>
        </div>

        {/* Question Card */}
        <div className="p-6 md:p-8 bg-[#0e101a] border border-gray-800/90 rounded-[2.5rem] shadow-2xl flex flex-col gap-6 text-start">
          
          <h3 className="text-lg md:text-xl font-black text-white leading-relaxed">
            {currentQuestion.text || currentQuestion.questionText}
          </h3>

          {currentQuestion.image && (
            <img
              src={getImageUrl(currentQuestion.image)}
              alt="Question Diagram"
              className="max-h-60 rounded-2xl object-contain border border-gray-800 mx-auto"
            />
          )}

          {/* Options Grid */}
          <div className="flex flex-col gap-3">
            {(currentQuestion.options || []).map((opt, optIdx) => {
              const optionLetters = ['A', 'B', 'C', 'D'];
              const isSelected = currentSelected === optIdx;

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(qId, optIdx)}
                  className={`p-4.5 rounded-2xl border flex items-center gap-4 text-start cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.2)] scale-[1.01]'
                      : 'bg-[#121424] border-gray-800/80 text-gray-300 hover:border-gray-700 hover:bg-white/5'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                    isSelected ? 'bg-amber-500 text-gray-950 shadow-md' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {optionLetters[optIdx]}
                  </div>
                  <span className="text-sm md:text-base font-bold flex-1">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-800/60">
            <button
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-gray-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {isRTL ? <FiArrowRight size={16} /> : <FiArrowLeft size={16} />} {t('student.dailyImprovement.previous')}
            </button>

            {currentIdx < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
              >
                {t('student.dailyImprovement.next')} {isRTL ? <FiArrowLeft size={16} /> : <FiArrowRight size={16} />}
              </button>
            ) : (
              <button
                onClick={handleSubmitTest}
                disabled={isActionLoading}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-white font-black text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
              >
                <FiCheck size={18} />
                <span>{isActionLoading ? t('student.dailyImprovement.submittingBtn') : t('student.dailyImprovement.submitTest')}</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default DailyImprovementTest;
