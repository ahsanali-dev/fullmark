import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
import { CardSkeleton, TableRowSkeleton } from '../../components/ui/Skeleton';
import { 
  fetchChildrenList, 
  fetchChildOverview, 
  fetchChildSubjects, 
  fetchChildResults 
} from '../../redux/slices/parentsSlice';
import { useLanguage } from '../../context/LanguageContext';

const ParentChildren = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, isRTL } = useLanguage();

  const { 
    children, 
    childOverview, 
    childSubjects, 
    childResultsData, 
    isLoading 
  } = useSelector((state) => state.parent);

  const [selectedChildId, setSelectedChildId] = useState(null);
  const [expandedExamId, setExpandedExamId] = useState(null);
  const [search, setSearch] = useState('');
  const [isLight, setIsLight] = useState(() => document.documentElement.classList.contains('light'));

  useEffect(() => {
    const handleThemeChange = () => {
      setIsLight(document.documentElement.classList.contains('light'));
    };
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  // Initial children list fetch
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
  const childResults = childResultsData?.attempts || [];
  
  // Stats overview
  const stats = childResultsData?.stats || { avgScore: 0, bestScore: 0, totalPassed: 0 };
  const avgScore = Math.round(stats.avgScore || 0);
  const bestScore = Math.round(stats.bestScore || 0);
  const passedCount = stats.totalPassed || 0;

  // Filter exams history
  const filteredExams = childResults.filter(
    e => (e.subject?.name || '').toLowerCase().includes(search.toLowerCase()) || 
         (e.exam?.title || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout
      role="parent"
      activeTab="children"
      title={t('parent.dashboard.myChildren')}
      subtitle={t('parent.dashboard.subjectPerformance')}
    >
      <div className="flex flex-col gap-6 text-start p-6 md:p-8 pb-36 lg:pb-16 animate-fade-in">

        {/* Child Selector Tabs */}
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {isLoading && children.length === 0 ? (
            <div className={`w-40 h-10 rounded-2xl animate-pulse ${isLight ? 'bg-gray-200' : 'bg-gray-900'}`} />
          ) : (
            children.map((child) => {
              const initials = child.name ? child.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'ST';
              const isSelected = selectedChildId === child._id;
              return (
                <button
                  key={child._id}
                  onClick={() => setSelectedChildId(child._id)}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm border whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-purple-600 border-purple-500 text-white shadow-[0_4px_15px_rgba(168,85,247,0.3)]'
                      : isLight
                        ? 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                        : 'bg-[#0e101a] border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs preserve-white text-white-force ${
                    isSelected ? 'bg-white/20 text-white' : isLight ? 'bg-gray-100 text-gray-700' : 'bg-gray-800 text-gray-400'
                  }`}>
                    <span className={isSelected ? 'text-white preserve-white' : ''}>{initials}</span>
                  </div>
                  <span className="capitalize">{child.name}</span>
                </button>
              );
            })
          )}
        </div>

        {/* Stats Overview */}
        {selectedChildId && (
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {[
              { label: t('parent.dashboard.avgScore'), value: `${avgScore}%`, icon: FiTrendingUp, color: 'cyan' },
              { label: t('parent.dashboard.bestScore'), value: `${bestScore}%`, icon: FiAward, color: 'yellow' },
              { label: t('parent.dashboard.passed'), value: passedCount, icon: FiClipboard, color: 'emerald' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className={`p-2.5 xs:p-3 sm:p-4 rounded-2xl border flex flex-col items-center justify-center text-center gap-1 min-w-0 ${
                    isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-gray-900/40 border-gray-800'
                  }`}
                >
                  <Icon className="text-purple-500 text-sm sm:text-lg shrink-0" />
                  <span className={`text-sm xs:text-base sm:text-lg font-black truncate ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>{s.value}</span>
                  <span className="text-[9px] xs:text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate max-w-full">{s.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Subject Performance */}
        {selectedChildId && (
          <div className="flex flex-col gap-3">
            <h3 className={`text-base font-black ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>{t('parent.dashboard.subjectPerformance')}</h3>
            {isLoading && childSubjects.length === 0 ? (
              <TableRowSkeleton />
            ) : childSubjects.length === 0 ? (
              <p className="text-sm text-gray-500 font-semibold py-2">{t('parent.dashboard.noSubjectsYet')}</p>
            ) : (
              childSubjects.map((subj) => {
                const subjectData = subj.subject || {};
                return (
                  <div
                    key={subj._id}
                    className={`p-4 border rounded-2xl flex flex-col gap-3 ${
                      isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#0e101a] border-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                          <FiBookOpen size={14} />
                        </div>
                        <span className={`text-sm font-extrabold capitalize ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>{subjectData.name}</span>
                      </div>
                      <span className="text-sm font-black text-emerald-500">{subj.bestScore || 0}%</span>
                    </div>
                    <div className={`h-2 w-full rounded-full overflow-hidden ${isLight ? 'bg-gray-100' : 'bg-gray-900'}`}>
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                        style={{ width: `${subj.progressPercent || 0}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Search Exams */}
        {selectedChildId && (
          <div className="relative">
            <FiSearch className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('parent.dashboard.searchExamsPlaceholder')}
              className={`w-full ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 border rounded-2xl text-sm font-semibold outline-none focus:border-purple-500/50 transition-colors ${
                isLight 
                  ? 'bg-white border-gray-200 text-[#0f172a] placeholder:text-gray-400 shadow-sm' 
                  : 'bg-[#0e101a] border-gray-800 text-white placeholder:text-gray-600'
              }`}
            />
          </div>
        )}

        {/* Exams List */}
        {selectedChildId && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <h3 className={`text-base font-black ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>{t('parent.dashboard.examHistory')}</h3>
              <span className="text-xs font-bold text-gray-500">{filteredExams.length} {t('parent.reports.exams')}</span>
            </div>

            {isLoading && childResults.length === 0 ? (
              <TableRowSkeleton />
            ) : filteredExams.length === 0 ? (
              <div className={`p-10 rounded-3xl border flex flex-col items-center justify-center gap-2 ${
                isLight ? 'bg-white border-gray-200' : 'bg-[#0c0d19]/40 border-gray-800/80'
              }`}>
                <FiClipboard className="text-gray-400" size={36} />
                <span className="text-sm font-extrabold text-gray-500">{t('parent.dashboard.noExamsTakenYet')}</span>
              </div>
            ) : (
              filteredExams.map((exam) => {
                const isPassed = exam.passed;
                const isExpanded = expandedExamId === exam._id;
                const formattedDate = exam.createdAt 
                  ? new Date(exam.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : '';
                const examTitle = exam.subject?.name || (exam.exam?.title) || t('student.exams.exam');
                return (
                  <div
                    key={exam._id}
                    className={`p-4 border rounded-2xl transition-all duration-300 ${
                      isLight
                        ? `bg-white ${isPassed ? 'border-emerald-200' : 'border-red-200'} shadow-sm`
                        : `bg-[#0e101a] ${isPassed ? 'border-emerald-500/20' : 'border-red-500/20'}`
                    }`}
                  >
                    <button
                      onClick={() => setExpandedExamId(isExpanded ? null : exam._id)}
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
                              strokeDashoffset={`${2 * Math.PI * 18 * (1 - (exam.score || 0) / 100)}`}
                              transform="rotate(-90 24 24)"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-[11px] font-black ${isPassed ? 'text-emerald-500' : 'text-red-500'}`}>
                              {exam.score || 0}%
                            </span>
                          </div>
                        </div>
                        <div className="text-start">
                          <p className={`text-sm font-black capitalize ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>{examTitle}</p>
                          <p className="text-xs text-gray-500 font-semibold">{formattedDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border flex items-center gap-1 ${
                          isPassed
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                            : 'bg-red-500/10 border-red-500/20 text-red-500'
                        }`}>
                          {isPassed ? `✓ ${t('student.results.passed')}` : `✗ ${t('student.results.failed')}`}
                        </span>
                        {isExpanded ? (
                          <FiChevronUp size={16} className="text-gray-400" />
                        ) : (
                          <FiChevronDown size={16} className="text-gray-400" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className={`mt-4 pt-4 border-t flex items-center justify-between animate-fade-in ${
                        isLight ? 'border-gray-200' : 'border-gray-800/50'
                      }`}>
                        <div className="text-center">
                          <span className="text-xs text-gray-500 font-semibold block">{t('student.dailyImprovement.score')}</span>
                          <span className={`text-base font-black ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>{exam.score}% ({exam.correctAnswers}/{exam.totalQuestions})</span>
                        </div>
                        <div className="text-center">
                          <span className="text-xs text-gray-500 font-semibold block">{t('admin.users.status')}</span>
                          <span className={`text-sm font-black ${isPassed ? 'text-emerald-500' : 'text-red-500'}`}>
                            {isPassed ? t('student.results.passed') : t('student.results.failed')}
                          </span>
                        </div>
                        <div className="text-center">
                          <span className="text-xs text-gray-500 font-semibold block">{t('teacher.exams.date')}</span>
                          <span className={`text-sm font-black ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>{formattedDate}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default ParentChildren;
