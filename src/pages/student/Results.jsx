import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FiTrendingUp, 
  FiAward, 
  FiCheckCircle, 
  FiCalendar, 
  FiChevronRight
} from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { fetchMyResults } from '../../redux/slices/studentSlice';
import { useLanguage } from '../../context/LanguageContext';

const Results = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, isRTL } = useLanguage();

  const { resultsData, isLoading } = useSelector((state) => state.student);

  useEffect(() => {
    dispatch(fetchMyResults());
  }, [dispatch]);

  const attempts = resultsData?.attempts || [];
  const stats = resultsData?.stats || { avgScore: 0, totalPassed: 0, bestScore: 0 };
  const pagination = resultsData?.pagination || { total: 0 };

  const totalAttempts = pagination.total || attempts.length;
  const passedAttempts = stats.totalPassed || 0;
  const averageScore = Math.round(stats.avgScore || 0);
  const bestScore = Math.round(stats.bestScore || 0);

  return (
    <DashboardLayout
      role="student"
      activeTab="results"
      title={t('student.results.title')}
      subtitle={t('student.results.subtitle')}
      showBackButton={true}
      onBackClick={() => navigate('/student/dashboard')}
    >
      <div className="flex flex-col gap-6 text-start p-6 md:p-8 pb-32 lg:pb-12 w-full max-w-4xl mx-auto">
        
        {/* Top metrics row */}
        <div className="grid grid-cols-3 gap-4">
          {/* Average Score Card */}
          <div className="p-4 rounded-2xl bg-[#0c0d19]/90 border border-gray-800 flex flex-col items-center justify-center text-center shadow-md">
            <FiTrendingUp className="text-cyan-400 text-lg mb-2" />
            <span className="text-lg sm:text-xl font-black text-white leading-none mb-1">{averageScore}%</span>
            <span className="text-[10px] font-bold text-cyan-400/80 uppercase tracking-widest">{t('student.results.avgScore')}</span>
          </div>

          {/* Best Score Card */}
          <div className="p-4 rounded-2xl bg-[#0c0d19]/90 border border-gray-800 flex flex-col items-center justify-center text-center shadow-md">
            <FiAward className="text-yellow-500 text-lg mb-2" />
            <span className="text-lg sm:text-xl font-black text-white leading-none mb-1">{bestScore}%</span>
            <span className="text-[10px] font-bold text-yellow-500/80 uppercase tracking-widest">{t('student.results.bestScore')}</span>
          </div>

          {/* Passed Count Card */}
          <div className="p-4 rounded-2xl bg-[#0c0d19]/90 border border-gray-800 flex flex-col items-center justify-center text-center shadow-md">
            <FiCheckCircle className="text-emerald-400 text-lg mb-2" />
            <span className="text-lg sm:text-xl font-black text-white leading-none mb-1">{passedAttempts}</span>
            <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest">{t('student.results.passed')}</span>
          </div>
        </div>

        {/* Attempts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-2">
          {isLoading ? (
            Array(3).fill(0).map((_, idx) => <TableRowSkeleton key={idx} />)
          ) : attempts.length > 0 ? (
            attempts.map((attempt) => {
              const isPassed = attempt.passed;
              const totalQs = attempt.totalQuestions || attempt.exam?.questionCount || 0;
              const correctCount = attempt.correctAnswers || 0;
              const formattedDate = attempt.createdAt 
                ? new Date(attempt.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : '';

              return (
                <div 
                  key={attempt._id}
                  onClick={() => navigate(`/student/results/${attempt._id}`)}
                  className="p-5 rounded-[2rem] bg-gradient-to-br from-[#0c0d19]/90 to-[#0a0a12]/95 border border-gray-800/80 hover:border-emerald-500/20 shadow-xl flex flex-col justify-between gap-5 cursor-pointer transition-all duration-300 hover:translate-y-[-2px] group text-start"
                >
                  {/* Circle gauge centered on top */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle 
                          cx="40" 
                          cy="40" 
                          r="34" 
                          className="stroke-slate-200 dark:stroke-slate-800" 
                          strokeWidth="4" 
                          fill="transparent" 
                        />
                        <circle 
                          cx="40" 
                          cy="40" 
                          r="34" 
                          stroke={isPassed ? "#10b981" : "#ec4899"} 
                          strokeWidth="4" 
                          fill="transparent" 
                          strokeDasharray={2 * Math.PI * 34}
                          strokeDashoffset={2 * Math.PI * 34 * (1 - (attempt.score || 0) / 100)}
                        />
                      </svg>
                      <span className="absolute text-xs font-black text-white">{attempt.score || 0}%</span>
                    </div>

                    <div className="text-center mt-1">
                      <h3 className="text-base font-black text-white capitalize leading-tight group-hover:text-emerald-400 transition-colors">
                        {attempt.exam?.title || (isRTL ? 'اختبار تجريبي' : 'Practice Exam')}
                      </h3>
                      {attempt.subject && (
                        <span className="text-xs text-gray-500 font-extrabold mt-1 inline-block uppercase">
                          {(isRTL && attempt.subject.nameAr) ? attempt.subject.nameAr : attempt.subject.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info and action section */}
                  <div className="flex flex-col gap-3.5 border-t border-gray-800/40 pt-3.5">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                      <span className="flex items-center gap-1">
                        <FiCheckCircle className="text-blue-400 shrink-0" />
                        {isRTL ? `${correctCount}/${totalQs} صحيحة` : `${correctCount}/${totalQs} Correct`}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiCalendar className="text-blue-400 shrink-0" />
                        {formattedDate}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      {isPassed ? (
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-black text-emerald-400">
                          {isRTL ? "ناجح" : "Passed"}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-xl bg-pink-500/10 border border-pink-500/20 text-xs font-black text-pink-400">
                          {isRTL ? "راسب" : "Failed"}
                        </span>
                      )}
                      <span className="text-xs font-black text-gray-400 group-hover:text-white transition-colors flex items-center gap-0.5">
                        {isRTL ? "التفاصيل" : "Details"} <FiChevronRight className={isRTL ? 'rotate-180' : ''} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 p-8 text-center bg-[#0c0d19]/40 border border-gray-800/80 rounded-3xl flex flex-col items-center justify-center">
              <span className="text-sm font-bold text-gray-500">{isRTL ? "لم يتم العثور على محاولات اختبار. قم بأداء اختبار لرؤية نتائجك!" : "No exam attempts found. Take an exam to see your results!"}</span>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Results;
