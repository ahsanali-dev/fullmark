import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FiClipboard, 
  FiClock, 
  FiRotateCcw, 
  FiLock, 
  FiBarChart2, 
  FiHelpCircle,
  FiPlay
} from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { fetchAvailableExams } from '../../redux/slices/studentSlice';
import { useLanguage } from '../../context/LanguageContext';

const Exams = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, isRTL } = useLanguage();

  const { availableExams, isLoading } = useSelector((state) => state.student);

  // Selected subject tag filter
  const [selectedTag, setSelectedTag] = useState('All Subjects');

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
    dispatch(fetchAvailableExams());
  }, [dispatch]);

  // Safe array fallback
  const examsList = Array.isArray(availableExams) ? availableExams : [];

  // Extract dynamic tags
  const tags = ['All Subjects'];
  if (examsList.length > 0) {
    const subjectNames = [...new Set(examsList.map(e => e.subject?.name).filter(Boolean))];
    tags.push(...subjectNames);
  }

  // Filter exams by tag
  const filteredExams = examsList.filter(exam => {
    if (selectedTag === 'All Subjects') return true;
    return exam.subject?.name === selectedTag;
  });

  return (
    <DashboardLayout
      role="student"
      activeTab="exams"
      title={t('student.exams.title')}
      subtitle={t('student.exams.subtitle')}
      showBackButton={true}
      onBackClick={() => navigate('/student/dashboard')}
      headerActions={
        <button 
          onClick={() => navigate('/student/results')}
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border flex items-center justify-center transition-all duration-300 cursor-pointer ${
            isLight ? 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700' : 'border-gray-800 bg-gray-950/30 hover:bg-gray-800/30 text-gray-400 hover:text-white'
          }`}
        >
          <FiBarChart2 className="text-lg" />
        </button>
      }
    >
      <div className="flex flex-col gap-6 text-start p-4 sm:p-6 md:p-8 pb-32 lg:pb-12 w-full">
        
        {/* Subject filter tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none w-full">
          {tags.map(tag => (
            <button 
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-full text-xs font-black tracking-wide whitespace-nowrap transition-all border capitalize cursor-pointer ${
                selectedTag === tag 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] font-black'
                  : isLight ? 'bg-slate-200/70 border-slate-300 text-slate-600 hover:text-slate-900' : 'bg-gray-900/40 border-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              {tag === 'All Subjects' ? t('student.exams.allSubjects') : tag}
            </button>
          ))}
        </div>

        {/* Exams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {isLoading ? (
            Array(4).fill(0).map((_, idx) => <CardSkeleton key={idx} />)
          ) : filteredExams.length > 0 ? (
            filteredExams.map((exam) => {
              const hasAttempted = exam.attempted;
              const isPassed = exam.lastPassed;
              const lastScore = exam.lastScore || 0;
              const canTake = exam.canTake;

              return (
                <div 
                  key={exam._id}
                  className={`p-5 rounded-[2rem] border shadow-xl flex flex-col justify-between gap-5 relative overflow-hidden transition-all duration-300 group text-start ${
                    isLight 
                      ? 'bg-white border-slate-200 hover:border-emerald-500/40 shadow-sm' 
                      : 'bg-gradient-to-br from-[#0c0d19]/90 to-[#0a0a12]/95 border-gray-800/80 hover:border-emerald-500/20'
                  }`}
                >
                  {/* Status Badge in top corner */}
                  <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} z-10`}>
                    {hasAttempted && (
                      <span className={`px-3 py-1.5 rounded-2xl text-[10px] font-black flex flex-col items-center justify-center ${
                        isPassed 
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400'
                      }`}>
                        <span className="text-xs leading-none">{lastScore}%</span>
                        <span className="text-[9.5px] opacity-80 mt-0.5">{isPassed ? t('student.results.passed') : t('student.results.failed')}</span>
                      </span>
                    )}
                  </div>

                  {/* Icon & Details */}
                  <div className="flex flex-col text-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-500 dark:text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)] shrink-0">
                      <FiClipboard size={18} className="group-hover:scale-110 transition-transform" />
                    </div>
                    
                    <div className="flex flex-col text-start mt-1">
                      <h3 className={`text-base font-black capitalize leading-tight group-hover:text-emerald-500 transition-colors ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}>
                        {exam.title}
                      </h3>
                      {exam.subject && (
                        <span className={`text-xs font-extrabold mt-1 uppercase ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                          {(isRTL && exam.subject.nameAr) ? exam.subject.nameAr : exam.subject.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats & Actions */}
                  <div className={`flex flex-col gap-4 border-t pt-3 mt-1 ${isLight ? 'border-slate-200' : 'border-gray-800/40'}`}>
                    {/* Stats pills */}
                    <div className={`flex flex-wrap items-center gap-1.5 text-xs font-bold ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                      <span className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border ${
                        isLight ? 'bg-slate-100 border-slate-200' : 'bg-gray-900/30 border-gray-800/80'
                      }`}>
                        <FiHelpCircle className="text-blue-500 dark:text-blue-400" />
                        {exam.questionCount ?? exam.totalQuestions ?? 0} {t('student.exams.qsCount')}
                      </span>
                      {(exam.timerMinutes || exam.duration) && (
                        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border ${
                          isLight ? 'bg-slate-100 border-slate-200' : 'bg-gray-900/30 border-gray-800/80'
                        }`}>
                          <FiClock className="text-blue-500 dark:text-blue-400" />
                          {exam.timerMinutes || exam.duration} {t('student.exams.minDuration')}
                        </span>
                      )}
                      <span className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border capitalize ${
                        isLight ? 'bg-slate-100 border-slate-200' : 'bg-gray-900/30 border-gray-800/80'
                      }`}>
                        <FiBarChart2 className="text-amber-500" />
                        {exam.difficulty}
                      </span>
                    </div>

                    {/* Actions buttons */}
                    {canTake ? (
                      <button 
                        onClick={() => navigate(`/student/exams/${exam._id}`)}
                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-black text-white transition-all shadow-[0_4px_12px_rgba(37,99,235,0.25)] hover:scale-102 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {hasAttempted ? (
                          <>
                            <FiRotateCcw className="text-xs" /> {t('student.exams.retakeExam')}
                          </>
                        ) : (
                          <>
                            <FiPlay className={`text-xs ${isRTL ? 'rotate-180' : ''}`} /> {t('student.exams.takeExam')}
                          </>
                        )}
                      </button>
                    ) : (
                      <button 
                        disabled
                        className={`w-full py-2.5 rounded-xl border text-xs font-black transition-all flex items-center justify-center gap-1.5 select-none cursor-not-allowed ${
                          isLight ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-gray-900/30 border-gray-800 text-gray-500'
                        }`}
                      >
                        <FiLock className="text-xs" /> {t('student.exams.alreadyTaken')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className={`col-span-2 lg:col-span-4 p-8 text-center border rounded-3xl flex flex-col items-center justify-center ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c0d19]/40 border-gray-800/80'
            }`}>
              <span className={`text-sm font-bold ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{t('student.exams.noExamsMatching')}</span>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Exams;
