import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { 
  FiCheckCircle, 
  FiTv,
  FiFileText,
  FiPlay,
  FiPause,
  FiLayers,
  FiLock,
  FiUnlock,
  FiShoppingBag
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { fetchSubjectLessons } from '../../redux/slices/studentSlice';
import apiEndpoints from '../../redux/apiEndpoint';
import { getImageUrl } from '../../utils/imageUrl';
import { useLanguage } from '../../context/LanguageContext';

import VideoPlayer from '../../components/shared/VideoPlayer';
import LessonAnimationPlayer from '../../components/shared/LessonAnimationPlayer';

const LessonPlayer = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, isRTL } = useLanguage();

  const { lessonsData, isLoading, isActionLoading } = useSelector((state) => state.student);
  
  const [lesson, setLesson] = useState(null);
  const [localProgress, setLocalProgress] = useState(null);
  const [activeMediaTab, setActiveMediaTab] = useState('video');
  const [isSimulating, setIsSimulating] = useState(false);
  const videoRef = useRef(null);
  const simulationInterval = useRef(null);
  const lastReportedTime = useRef(0);

  const [isLight, setIsLight] = useState(() => {
    return typeof window !== 'undefined' && (localStorage.getItem('theme') === 'light' || document.documentElement.classList.contains('light'));
  });

  useEffect(() => {
    const handleThemeChange = () => {
      setIsLight(localStorage.getItem('theme') === 'light' || document.documentElement.classList.contains('light'));
    };
    window.addEventListener('themeChange', handleThemeChange);
    window.addEventListener('storage', handleThemeChange);
    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
      window.removeEventListener('storage', handleThemeChange);
    };
  }, []);

  useEffect(() => {
    if (courseId) {
      dispatch(fetchSubjectLessons(courseId));
    }
  }, [dispatch, courseId]);

  // Find the selected lesson
  useEffect(() => {
    if (lessonsData?.lessons) {
      const found = lessonsData.lessons.find(l => (l._id || l.id) === lessonId);
      if (found) {
        setLesson(found);
        if (found.animationUrl && !found.videoUrl && !found.videoPreviewUrl) {
          setActiveMediaTab('animation');
        }
      }
    }
  }, [lessonId, lessonsData]);

  // Cleanup simulation interval on unmount
  useEffect(() => {
    return () => {
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current);
      }
    };
  }, []);

  const reportProgress = async (currentTime) => {
    if (!lesson) return;
    const roundedPos = Math.floor(currentTime);
    if (Math.abs(roundedPos - lastReportedTime.current) < 3 && roundedPos > 0) return;
    
    lastReportedTime.current = roundedPos;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        apiEndpoints.student.lessonProgress(lesson._id || lesson.id),
        { position: roundedPos },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      const progressData = res.data?.data?.lessonProgress || res.data?.data;
      if (progressData) {
        setLocalProgress({
          progressPercent: progressData.progressPercent ?? Math.min(100, Math.round((roundedPos / (lesson.videoDuration || 1)) * 100)),
          isCompleted: !!progressData.isCompleted
        });

        if (progressData.isCompleted && !lesson.isCompleted && !localProgress?.isCompleted) {
          toast.success(isRTL ? 'اكتمل الدرس! 🎓' : 'Lesson completed! 🎓');
        }
      }
    } catch (err) {
      console.error('Failed to report progress silently:', err);
    }
  };

  const handleVideoTimeUpdate = (e) => {
    const currentTime = e.target.currentTime;
    reportProgress(currentTime);
  };

  const handleVideoEnded = (e) => {
    const duration = e.target.duration || lesson.videoDuration || 100;
    reportProgress(duration);
  };

  const startSimulateWatch = () => {
    if (!lesson || isSimulating) return;

    setIsSimulating(true);
    const duration = lesson.videoDuration || (lesson.duration ? lesson.duration * 60 : 100);
    let currentPos = lesson.lastPosition || 0;

    toast.success(isRTL ? 'بدأ محاكاة مشاهدة الدرس...' : 'Started simulating lesson watch...');

    simulationInterval.current = setInterval(() => {
      currentPos += 5;
      reportProgress(currentPos);

      if (currentPos >= duration) {
        clearInterval(simulationInterval.current);
        setIsSimulating(false);
        toast.success(isRTL ? 'اكتملت محاكاة الدرس!' : 'Lesson simulation completed!');
      }
    }, 1000);
  };

  if (isLoading && !lesson) {
    return (
      <DashboardLayout
        role="student"
        activeTab="courses"
        title={isRTL ? "جاري تحميل الدرس..." : "Loading Lesson..."}
        showBackButton={true}
        onBackClick={() => navigate(`/student/courses/${courseId}/lessons`)}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!lesson) {
    return (
      <DashboardLayout
        role="student"
        activeTab="courses"
        title={isRTL ? "الدرس غير موجود" : "Lesson Not Found"}
        showBackButton={true}
        onBackClick={() => navigate(`/student/courses/${courseId}/lessons`)}
      >
        <div className="p-8 text-center text-gray-500 font-bold">
          {isRTL ? "الدرس غير موجود أو غير متاح حالياً." : "Lesson not found. It might be unavailable."}
        </div>
      </DashboardLayout>
    );
  }

  const isEnrolled = lessonsData?.isEnrolled ?? true;
  const isFree = Boolean(lesson.isFree);
  const isLocked = lesson.isLocked || (!isEnrolled && !isFree);

  // If lesson is locked for unenrolled student, render locked screen
  if (isLocked) {
    return (
      <DashboardLayout
        role="student"
        activeTab="courses"
        title={(isRTL && lesson.titleAr) ? lesson.titleAr : lesson.title}
        subtitle={isRTL ? "هذا الدرس مقفل" : "Lesson Locked"}
        showBackButton={true}
        onBackClick={() => navigate(`/student/courses/${courseId}`)}
      >
        <div className="flex flex-col items-center justify-center min-h-[450px] p-6 max-w-xl mx-auto text-center">
          <div className="w-20 h-20 rounded-3xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-500 mb-6 shadow-xl">
            <FiLock size={36} />
          </div>

          <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-black uppercase tracking-wider mb-2">
            {t('student.courseLessons.lessonNum')} {lesson.order || 1}
          </span>

          <h2 className={`text-2xl font-black mb-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {(isRTL && lesson.titleAr) ? lesson.titleAr : lesson.title}
          </h2>

          <p className={`text-sm font-semibold mb-8 max-w-md ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
            {isRTL 
              ? "هذا الدرس يتطلب الاشتراك الكامل في الكورس لمشاهدة الفيديو واستعراض كافة الرسوم والملفات المرفقة."
              : "This lesson requires enrollment in the course to watch the video and access full interactive contents."}
          </p>

          <button
            onClick={() => navigate(`/student/courses/${courseId}`)}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer active:scale-98"
          >
            <FiShoppingBag size={18} />
            <span>{isRTL ? "اشترك في الكورس الآن لفتح الدرس" : "Enroll in Course to Unlock Lesson"}</span>
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const progress = localProgress?.progressPercent ?? (lesson.progressPercent || 0);
  const isCompleted = localProgress?.isCompleted ?? (lesson.isCompleted || false);

  const hasVideo = Boolean(lesson.videoUrl || lesson.videoPreviewUrl || lesson.videoId || (lesson.videoStatus === 'ready' || lesson.videoStatus === 'processing') || lesson.videoReady === false);
  const hasAnimation = Boolean(lesson.animationUrl);

  return (
    <DashboardLayout
      role="student"
      activeTab="courses"
      title={isRTL ? `الوحدة ${lesson.order || 1}` : `Module ${lesson.order || 1}`}
      subtitle={(isRTL && lesson.titleAr) ? lesson.titleAr : lesson.title}
      showBackButton={true}
      onBackClick={() => navigate(`/student/courses/${courseId}/lessons`)}
    >
      <div className="flex flex-col gap-6 text-start p-4 sm:p-6 md:p-8 pb-32 lg:pb-12 w-full max-w-4xl mx-auto">
        {/* Free Preview Banner (for unenrolled student watching a free lesson) */}
        {!isEnrolled && isFree && (
          <div className={`p-4 sm:p-5 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm transition-all ${
            isLight 
              ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950' 
              : 'bg-emerald-950/30 border-emerald-500/40 text-white'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <FiUnlock size={20} />
              </div>
              <div className="flex flex-col text-start">
                <span className="text-sm font-extrabold">
                  {isRTL ? "أنت تشاهد درساً مجانياً (معاينة)" : "You are watching a Free Preview Lesson"}
                </span>
                <span className={`text-xs font-semibold ${isLight ? 'text-emerald-800' : 'text-gray-300'}`}>
                  {isRTL ? "هل أعجبك الشرح؟ اشترك في الكورس الآن للوصول إلى كافة الدروس والامتحانات." : "Enjoying the lesson? Enroll in the course now to access all lessons & exams."}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate(`/student/courses/${courseId}`)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0 active:scale-98"
            >
              <FiShoppingBag size={14} />
              <span>{isRTL ? "اشترك في الكورس الآن" : "Enroll in Course Now"}</span>
            </button>
          </div>
        )}

        {/* Media Tabs (shown when BOTH video and animation exist) */}
        {hasVideo && hasAnimation && (
          <div className={`grid grid-cols-2 sm:flex sm:w-fit items-center gap-1.5 p-1.5 rounded-2xl w-full transition-all ${
            isLight
              ? 'bg-slate-200/80 border border-slate-300 shadow-sm'
              : 'bg-[#090a14] border border-gray-800/90 shadow-lg'
          }`}>
            <button
              type="button"
              onClick={() => setActiveMediaTab('video')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeMediaTab === 'video'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/60'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
              }`}
            >
              <FiPlay className="text-sm shrink-0" /> <span className="truncate">{isRTL ? 'فيديو الشرح' : 'Video Lesson'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMediaTab('animation')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeMediaTab === 'animation'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/60'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
              }`}
            >
              <FiLayers className="text-sm shrink-0" /> <span className="truncate">{isRTL ? 'الرسوم التفاعلية' : 'Interactive Animation'}</span>
            </button>
          </div>
        )}

        {/* Main Video / Animation Player Display */}
        {hasVideo && (activeMediaTab === 'video' || !hasAnimation) ? (
          <VideoPlayer
            videoUrl={lesson.videoUrl || lesson.videoPreviewUrl}
            videoReady={lesson.videoReady !== false}
            thumbnailUrl={lesson.thumbnailUrl}
            title={lesson.title}
            targetType="lesson"
            targetId={lesson._id || lesson.id}
            lastPosition={lesson.lastPosition || 0}
            onTimeUpdate={handleVideoTimeUpdate}
            onEnded={handleVideoEnded}
            onRefreshUrl={async () => {
              const res = await dispatch(fetchSubjectLessons(courseId)).unwrap();
              const found = res?.lessons?.find(l => (l._id || l.id) === (lesson._id || lesson.id));
              return found?.videoUrl || found?.videoPreviewUrl || null;
            }}
            className="sm:rounded-[2.5rem]"
          />
        ) : hasAnimation ? (
          <LessonAnimationPlayer
            animationUrl={lesson.animationUrl}
            animationTitle={lesson.animationTitle}
            animationTitleAr={lesson.animationTitleAr}
            className="sm:rounded-[2.5rem]"
          />
        ) : (
          <div className={`min-h-[260px] sm:min-h-[300px] sm:aspect-video h-auto w-full rounded-3xl sm:rounded-[2.5rem] border shadow-2xl p-5 sm:p-6 md:p-8 flex flex-col justify-between text-start relative overflow-hidden select-none ${isLight ? 'bg-gradient-to-br from-slate-100 to-white border-slate-200/90 shadow-md' : 'bg-gradient-to-br from-[#0a0f26] to-[#05081a] border-gray-800 shadow-2xl'}`}>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
            
            <div className={`flex flex-col gap-1 z-10 border-b pb-3 ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
              <span className={`text-xs font-black uppercase tracking-widest leading-none ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                {isRTL ? `الوحدة ${lesson.order || 1}` : `Module ${lesson.order || 1}`}
              </span>
              <h3 className={`text-lg md:text-2xl font-black tracking-tight mt-1.5 capitalize ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {(isRTL && lesson.titleAr) ? lesson.titleAr : lesson.title}
              </h3>
            </div>

            <div className="my-auto py-4 flex flex-col gap-4 text-start z-10">
              <p className={`text-sm md:text-base font-semibold max-w-xl leading-relaxed ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
                {lesson.description || (isRTL ? 'أهلاً بك في هذا الدرس! اقرأ المواد وتابع تقدمك في الدراسة.' : 'Welcome to this lesson! Read the materials and track your study progress.')}
              </p>
              
              {lesson.pdfUrl && (
                <div className="flex items-center gap-4 mt-2">
                  <a
                    href={getImageUrl(lesson.pdfUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-purple-600/10 border border-purple-500/20 text-xs font-black text-purple-600 dark:text-purple-300 shadow-sm flex items-center gap-2 hover:bg-purple-600/20 transition-all"
                  >
                    <FiFileText className="text-sm" /> {isRTL ? "عرض عرض الشريحة PDF" : "View Slide PDF"}
                  </a>
                </div>
              )}
            </div>

            <div className={`flex justify-between items-end border-t pt-3 z-10 ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
              <span className={`text-xs font-bold uppercase ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                {isRTL ? "مواد فول مارك" : "Fullmark Courseware"}
              </span>
              <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${isLight ? 'bg-[#e2e8f0] text-slate-600' : 'bg-white/5 text-gray-400'}`}>
                FM
              </span>
            </div>
          </div>
        )}

        {/* Watch Progress Card */}
        <div className={`p-6 rounded-[2rem] border flex flex-col gap-4 ${isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-gray-900/40 border-gray-800/80 shadow-lg'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiTv className="text-blue-500 dark:text-blue-400 text-lg animate-pulse" />
              <h4 className={`text-sm font-black uppercase tracking-widest ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                {isRTL ? "نسبة المشاهدة" : "Watch Progress"}
              </h4>
            </div>
            <span className={`text-base font-black ${isCompleted ? 'text-emerald-500' : 'text-blue-500 dark:text-blue-400'}`}>
              {progress}%
            </span>
          </div>

          <div className={`h-2 w-full rounded-full overflow-hidden border ${isLight ? 'bg-slate-200 border-slate-300' : 'bg-gray-950 border-gray-900'}`}>
            <div 
              className={`h-full rounded-full transition-all duration-300 ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className={`flex items-center justify-between text-xs font-bold border-t pt-3.5 ${isLight ? 'text-slate-500 border-slate-200/80' : 'text-gray-400 border-gray-800/40'}`}>
            <span>{isRTL ? `المدة: ${lesson.duration || 0} دقيقة` : `Duration: ${lesson.duration || 0} mins`}</span>
            <span>{isRTL ? "يكتمل تلقائياً عند 90%" : "Completes automatically at 90%"}</span>
          </div>

          {/* Manual Simulation trigger for non-video or fallback */}
          {!isCompleted ? (
            <button
              onClick={startSimulateWatch}
              disabled={isSimulating || isActionLoading}
              className="w-full py-3.5 mt-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-purple-950/20 disabled:text-gray-500 text-sm font-black text-white transition-all shadow-[0_4px_15px_rgba(139,92,246,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSimulating ? (isRTL ? 'جاري تحديث التقدم... ⏳' : 'Updating Progress... ⏳') : (isRTL ? 'محاكاة مشاهدة الفيديو ⯈' : 'Simulate Video Progress ⯈')}
            </button>
          ) : (
            <div className="py-3 mt-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm font-black text-emerald-500 dark:text-emerald-400 flex items-center justify-center gap-2">
              <FiCheckCircle />
              {isRTL ? "تم إكمال الدرس بنجاح" : "Lesson Completed Successfully"}
            </div>
          )}
        </div>

        {/* Lesson Description & Materials */}
        <div className="flex flex-col gap-3 text-start">
          <h4 className={`text-sm font-black uppercase tracking-widest ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>{isRTL ? "عن هذا الدرس" : "About this Lesson"}</h4>
          <p className={`text-sm leading-relaxed font-semibold ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
            {lesson.description || (isRTL ? 'لا يوجد وصف لهذا الدرس.' : 'No description provided for this lesson.')}
          </p>

          {lesson.pdfUrl && !lesson.videoUrl && (
            <a
              href={getImageUrl(lesson.pdfUrl)}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600/10 border border-blue-500/20 text-sm font-extrabold text-blue-400 hover:bg-blue-600/20 transition-all w-fit"
            >
              <FiFileText size={18} /> {isRTL ? "تحميل ملف PDF المرفق" : "Download Attached PDF Material"}
            </a>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LessonPlayer;
