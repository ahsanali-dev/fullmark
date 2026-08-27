import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FiPlay, 
  FiCheckCircle, 
  FiChevronDown, 
  FiChevronRight, 
  FiFolder,
  FiBookOpen,
  FiLayers
} from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { fetchSubjectLessons } from '../../redux/slices/studentSlice';
import { getImageUrl } from '../../utils/imageUrl';
import { useLanguage } from '../../context/LanguageContext';

const CourseLessons = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, isRTL } = useLanguage();

  const { lessonsData, isLoading } = useSelector((state) => state.student);
  const [expandedUnits, setExpandedUnits] = useState({});
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
    dispatch(fetchSubjectLessons(courseId));
  }, [dispatch, courseId]);

  const subject = lessonsData?.subject;
  const rawUnits = (lessonsData?.units || []).filter((u) => u && u._id !== null && u._id !== 'null');
  const lessons = lessonsData?.lessons || [];
  const progress = lessonsData?.progress || { completed: 0, total: 0, percent: 0 };

  const totalLessons = progress.total || lessons.length;
  const completedCount = progress.completed || 0;
  const progressPercent = progress.percent || 0;

  // Group unassigned lessons if any unit is missing
  const assignedLessonIds = new Set();
  rawUnits.forEach((u) => {
    (u.lessons || []).forEach((l) => assignedLessonIds.add(l._id || l.id));
  });

  const unassignedLessons = lessons.filter((l) => !assignedLessonIds.has(l._id || l.id));

  // Initialize expanded state for all units
  useEffect(() => {
    if (rawUnits.length > 0) {
      const initialMap = {};
      rawUnits.forEach((u, index) => {
        initialMap[u._id || index] = true;
      });
      if (unassignedLessons.length > 0) {
        initialMap['unassigned'] = true;
      }
      setExpandedUnits(initialMap);
    }
  }, [lessonsData]);

  const toggleUnit = (unitId) => {
    setExpandedUnits((prev) => ({
      ...prev,
      [unitId]: !prev[unitId],
    }));
  };

  const renderLessonCard = (lesson) => {
    const isDone = lesson.isCompleted;
    const lessonProgress = lesson.progressPercent || 0;

    return (
      <div
        key={lesson._id || lesson.id}
        onClick={() => navigate(`/student/courses/${courseId}/lessons/${lesson._id || lesson.id}`)}
        className={`p-4 rounded-[2rem] border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isDone 
            ? isLight
              ? 'bg-emerald-50/80 border-emerald-200 shadow-sm hover:border-emerald-400'
              : 'bg-emerald-500/5 border-emerald-500/20 shadow-md hover:border-emerald-500/40' 
            : isLight
              ? 'bg-white border-slate-200 shadow-sm hover:border-blue-400 hover:bg-slate-50/50'
              : 'bg-[#0c0d19]/60 border-gray-800/80 hover:border-blue-500/50 hover:bg-[#0c0d19]'
        }`}
      >
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-blue-400 shrink-0 shadow-inner ${
            isDone 
              ? isLight ? 'bg-emerald-100 text-emerald-600 border border-emerald-300' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
              : isLight ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-blue-600/20 border border-blue-500/25'
          }`}>
            {isDone ? <FiCheckCircle size={22} /> : <FiPlay size={20} className={`fill-blue-400/20 ${isRTL ? 'mr-0.5 rotate-180' : 'ml-0.5'}`} />}
          </div>
          
          <div className="flex flex-col items-start text-start">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider">
                {t('student.courseLessons.lessonNum')} {lesson.order || 1}
              </span>
              {lesson.animationUrl && (
                <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30 text-[10px] font-black flex items-center gap-1">
                  <FiLayers size={10} /> {isRTL ? "رسوم تفاعلية" : "Interactive HTML"}
                </span>
              )}
            </div>
            <h5 className={`text-base font-bold mt-0.5 leading-snug ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {(isRTL && lesson.titleAr) ? lesson.titleAr : lesson.title}
            </h5>
            <span className={`text-xs font-semibold mt-1 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
              {t('student.courseLessons.durationMins', { mins: lesson.duration || 0 })}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 min-w-[150px] justify-end">
          <div className={`flex items-center justify-between text-xs font-bold ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
            <span>{t('student.courseLessons.watchProgress')}</span>
            <span className={isDone ? (isLight ? 'text-emerald-600 font-extrabold' : 'text-emerald-400 font-extrabold') : (isLight ? 'text-slate-700 font-extrabold' : 'text-gray-300 font-extrabold')}>
              {lessonProgress}%
            </span>
          </div>
          <div className={`h-1.5 w-full rounded-full overflow-hidden border ${isLight ? 'bg-slate-200 border-slate-300' : 'bg-gray-950 border-gray-900'}`}>
            <div 
              className={`h-full rounded-full transition-all duration-300 ${isDone ? 'bg-emerald-500' : 'bg-blue-500'}`}
              style={{ width: `${lessonProgress}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout
      role="student"
      activeTab="courses"
      title={subject?.name || t('student.courseLessons.title')}
      subtitle={t('student.courseLessons.lessonsCompleted', { completed: completedCount, total: totalLessons })}
      showBackButton={true}
      onBackClick={() => navigate(`/student/courses/${courseId}`)}
    >
      <div className="flex flex-col gap-6 text-start p-6 md:p-8 pb-32 lg:pb-12 w-full max-w-4xl mx-auto">
        {/* Banner Section */}
        {subject?.bannerUrl && (
          <div className="w-full h-44 sm:h-56 rounded-[2.5rem] overflow-hidden border border-gray-800 shadow-2xl relative">
            <img 
              src={getImageUrl(subject.bannerUrl)} 
              alt={subject.name}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d19] via-[#0c0d19]/40 to-transparent flex items-end p-6">
              <div>
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-black uppercase tracking-wider">
                  {t('student.courseLessons.courseContent')}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {subject.name}
                </h2>
              </div>
            </div>
          </div>
        )}

        {/* Overall Course Progress Box */}
        <div className={`p-5 rounded-2xl border flex flex-col gap-3 ${isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-gray-900/40 border-gray-800/80 shadow-lg'}`}>
          <div className="flex items-center justify-between text-sm font-black">
            <span className={`uppercase tracking-widest font-bold ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              {t('student.courseLessons.overallCompletion')}
            </span>
            <span className="text-blue-500 dark:text-blue-400 font-extrabold">{progressPercent}%</span>
          </div>
          <div className={`h-2.5 w-full rounded-full overflow-hidden border ${isLight ? 'bg-slate-200 border-slate-300' : 'bg-gray-950 border-gray-900'}`}>
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Units Collapsible Tree View */}
        <div className="flex flex-col gap-6 text-start">
          <div className={`flex items-center justify-between border-b pb-3 ${isLight ? 'border-slate-200' : 'border-gray-800/60'}`}>
            <h4 className={`text-sm font-black uppercase tracking-widest flex items-center gap-2 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
              <FiBookOpen className="text-blue-500 dark:text-blue-400" /> {t('student.courseLessons.unitsCurriculum')}
            </h4>
            <span className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
              {t('student.courseLessons.unitsAndLessons', { units: rawUnits.length, lessons: totalLessons })}
            </span>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-4">
              {Array(3).fill(0).map((_, idx) => <TableRowSkeleton key={idx} />)}
            </div>
          ) : rawUnits.length > 0 ? (
            <div className="flex flex-col gap-5">
              {rawUnits.map((unit) => {
                const unitId = unit._id;
                const isOpen = expandedUnits[unitId] !== false;
                const unitLessons = unit.lessons || [];
                const unitCompleted = unitLessons.filter(l => l.isCompleted).length;

                return (
                  <div key={unitId} className={`rounded-3xl border overflow-hidden transition-all ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c0d19]/40 border-gray-800/80 shadow-md'}`}>
                    {/* Unit Accordion Header */}
                    <button
                      onClick={() => toggleUnit(unitId)}
                      className={`w-full p-4 sm:p-5 flex items-center justify-between gap-2 sm:gap-4 transition-all text-start cursor-pointer border-b ${
                        isLight 
                          ? 'bg-slate-100/90 hover:bg-slate-200/80 border-slate-200' 
                          : 'bg-gradient-to-r from-[#121426] to-[#0c0d19] hover:from-[#181a33] border-gray-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isLight ? 'bg-blue-100 text-blue-600 border border-blue-200' : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'}`}>
                          <FiFolder size={20} />
                        </div>
                        <div className="min-w-0">
                          <h5 className={`text-sm sm:text-base font-black truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {unit.title}
                          </h5>
                          {unit.titleAr && (
                            <span className={`text-xs font-medium truncate block ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                              {unit.titleAr}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                        <span className={`px-2.5 sm:px-3 py-1 rounded-full border text-[11px] sm:text-xs font-extrabold whitespace-nowrap shrink-0 ${isLight ? 'bg-slate-200/80 border-slate-300 text-slate-700' : 'bg-gray-800/80 border-gray-700 text-gray-300'}`}>
                          {unitCompleted} / {unitLessons.length} {t('student.courseLessons.done')}
                        </span>
                        <div className={`shrink-0 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                          {isOpen ? <FiChevronDown size={20} /> : <FiChevronRight size={20} className={isRTL ? 'rotate-180' : ''} />}
                        </div>
                      </div>
                    </button>

                    {/* Unit Lessons Body */}
                    {isOpen && (
                      <div className={`p-4 flex flex-col gap-3 ${isLight ? 'bg-slate-50/70' : 'bg-[#0a0b14]/50'}`}>
                        {unitLessons.length > 0 ? (
                          unitLessons.map(lesson => renderLessonCard(lesson))
                        ) : (
                          <div className={`p-4 text-center text-xs font-bold ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                            {t('student.courseLessons.noLessonsInUnit')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Unassigned / General Lessons */}
              {unassignedLessons.length > 0 && (
                <div className={`rounded-3xl border overflow-hidden transition-all ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c0d19]/40 border-gray-800/80 shadow-md'}`}>
                  <button
                    onClick={() => toggleUnit('unassigned')}
                    className={`w-full p-4 sm:p-5 flex items-center justify-between gap-2 sm:gap-4 transition-all text-start cursor-pointer border-b ${
                      isLight 
                        ? 'bg-slate-100/90 hover:bg-slate-200/80 border-slate-200' 
                        : 'bg-gradient-to-r from-[#121426] to-[#0c0d19] hover:from-[#181a33] border-gray-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isLight ? 'bg-purple-100 text-purple-600 border border-purple-200' : 'bg-purple-500/10 border border-purple-500/20 text-purple-400'}`}>
                        <FiFolder size={20} />
                      </div>
                      <div className="min-w-0">
                        <h5 className={`text-sm sm:text-base font-black truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {t('student.courseLessons.generalLessons')}
                        </h5>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                      <span className={`px-2.5 sm:px-3 py-1 rounded-full border text-[11px] sm:text-xs font-extrabold whitespace-nowrap shrink-0 ${isLight ? 'bg-slate-200/80 border-slate-300 text-slate-700' : 'bg-gray-800/80 border-gray-700 text-gray-300'}`}>
                        {unassignedLessons.filter(l => l.isCompleted).length} / {unassignedLessons.length} {t('student.courseLessons.done')}
                      </span>
                      <div className={`shrink-0 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                        {expandedUnits['unassigned'] !== false ? <FiChevronDown size={20} /> : <FiChevronRight size={20} className={isRTL ? 'rotate-180' : ''} />}
                      </div>
                    </div>
                  </button>

                  {expandedUnits['unassigned'] !== false && (
                    <div className={`p-4 flex flex-col gap-3 ${isLight ? 'bg-slate-50/70' : 'bg-[#0a0b14]/50'}`}>
                      {unassignedLessons.map(lesson => renderLessonCard(lesson))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : lessons.length > 0 ? (
            /* Fallback flat list if no units defined */
            <div className="flex flex-col gap-4">
              {lessons.map(lesson => renderLessonCard(lesson))}
            </div>
          ) : (
            <div className="p-8 text-center bg-[#0c0d19]/40 border border-gray-800/80 rounded-3xl flex flex-col items-center justify-center">
              <span className="text-sm font-bold text-gray-400">
                {t('student.courseLessons.noLessonsUploaded')}
              </span>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourseLessons;
