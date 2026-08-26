import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { 
  FiCheckCircle, 
  FiTv,
  FiFileText,
  FiPlay,
  FiPause
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { fetchSubjectLessons } from '../../redux/slices/studentSlice';
import apiEndpoints from '../../redux/apiEndpoint';
import { getImageUrl } from '../../utils/imageUrl';
import { useLanguage } from '../../context/LanguageContext';

import VideoPlayer from '../../components/shared/VideoPlayer';

const LessonPlayer = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, isRTL } = useLanguage();

  const { lessonsData, isLoading, isActionLoading } = useSelector((state) => state.student);
  
  const [lesson, setLesson] = useState(null);
  const [localProgress, setLocalProgress] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const videoRef = useRef(null);
  const simulationInterval = useRef(null);
  const lastReportedTime = useRef(0);

  const [isLight, setIsLight] = useState(() => {
    return localStorage.getItem('theme') === 'light' || document.documentElement.classList.contains('light');
  });

  useEffect(() => {
    const handleThemeChange = () => {
      setIsLight(localStorage.getItem('theme') === 'light' || document.documentElement.classList.contains('light'));
    };
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
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

  const progress = localProgress?.progressPercent ?? (lesson.progressPercent || 0);
  const isCompleted = localProgress?.isCompleted ?? (lesson.isCompleted || false);

  return (
    <DashboardLayout
      role="student"
      activeTab="courses"
      title={isRTL ? `الوحدة ${lesson.order || 1}` : `Module ${lesson.order || 1}`}
      subtitle={lesson.title}
      showBackButton={true}
      onBackClick={() => navigate(`/student/courses/${courseId}/lessons`)}
    >
      <div className="flex flex-col gap-6 text-start p-4 sm:p-6 md:p-8 pb-32 lg:pb-12 w-full max-w-4xl mx-auto">
        {/* Main Video / Slide Player Display */}
        {(lesson.videoUrl || lesson.videoPreviewUrl || lesson.videoId || lesson.videoStatus || lesson.videoReady === false) ? (
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
