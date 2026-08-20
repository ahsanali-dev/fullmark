import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FiCheckCircle, 
  FiTv,
  FiFileText,
  FiPlay,
  FiPause
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { fetchSubjectLessons, updateLessonProgress } from '../../redux/slices/studentSlice';
import { getImageUrl } from '../../utils/imageUrl';
import { useLanguage } from '../../context/LanguageContext';

const LessonPlayer = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, isRTL } = useLanguage();

  const { lessonsData, isLoading, isActionLoading } = useSelector((state) => state.student);
  
  const [lesson, setLesson] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const videoRef = useRef(null);
  const simulationInterval = useRef(null);
  const lastReportedTime = useRef(0);

  // Fetch subject lessons on load if not loaded or if route changes
  useEffect(() => {
    dispatch(fetchSubjectLessons(courseId));
  }, [dispatch, courseId, lessonId]);

  // Find the selected lesson
  useEffect(() => {
    if (lessonsData?.lessons) {
      const found = lessonsData.lessons.find(l => (l._id || l.id) === lessonId);
      if (found) {
        setLesson(found);
      }
    }
  }, [lessonId, lessonsData]);

  // Set initial video position from lastPosition
  useEffect(() => {
    if (lesson && videoRef.current && lesson.lastPosition) {
      videoRef.current.currentTime = lesson.lastPosition;
    }
  }, [lesson]);

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
    // Don't spam API if position hasn't changed by at least 3 seconds
    if (Math.abs(roundedPos - lastReportedTime.current) < 3 && roundedPos > 0) return;
    
    lastReportedTime.current = roundedPos;
    try {
      const res = await dispatch(updateLessonProgress({
        lessonId: lesson._id || lesson.id,
        position: roundedPos
      })).unwrap();

      if (res?.data?.lessonProgress?.isCompleted && !lesson.isCompleted) {
        toast.success(isRTL ? 'اكتمل الدرس! 🎓' : 'Lesson completed! 🎓');
        dispatch(fetchSubjectLessons(courseId));
      }
    } catch (err) {
      console.error('Failed to report progress:', err);
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

    const step = Math.max(2, Math.round(duration / 10)); // 10 steps

    simulationInterval.current = setInterval(async () => {
      currentPos = Math.min(currentPos + step, duration);
      
      try {
        const result = await dispatch(updateLessonProgress({
          lessonId: lesson._id || lesson.id,
          position: currentPos
        })).unwrap();

        if (result?.data?.lessonProgress?.isCompleted || currentPos >= duration) {
          clearInterval(simulationInterval.current);
          setIsSimulating(false);
          toast.success(isRTL ? 'اكتمل الدرس! 🎓' : 'Lesson completed! 🎓');
          dispatch(fetchSubjectLessons(courseId));
        }
      } catch (err) {
        clearInterval(simulationInterval.current);
        setIsSimulating(false);
        toast.error(err || (isRTL ? 'فشل تحديث تقدم الدرس.' : 'Failed to update lesson progress.'));
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

  const progress = lesson.progressPercent || 0;
  const isCompleted = lesson.isCompleted;

  const isYouTube = lesson.videoUrl && (lesson.videoUrl.includes('youtube.com') || lesson.videoUrl.includes('youtu.be'));
  const getEmbedYouTube = (url) => {
    let videoId = '';
    if (url.includes('v=')) videoId = url.split('v=')[1]?.split('&')[0];
    else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  };

  return (
    <DashboardLayout
      role="student"
      activeTab="courses"
      title={isRTL ? `الوحدة ${lesson.order || 1}` : `Module ${lesson.order || 1}`}
      subtitle={lesson.title}
      showBackButton={true}
      onBackClick={() => navigate(`/student/courses/${courseId}/lessons`)}
    >
      <div className="flex flex-col gap-6 text-start p-6 md:p-8 pb-32 lg:pb-12 w-full max-w-4xl mx-auto">
        {/* Main Video / Slide Player Display */}
        {lesson.videoUrl ? (
          <div className="aspect-video w-full rounded-[2.5rem] bg-black border border-gray-800 shadow-2xl overflow-hidden relative flex items-center justify-center">
            {isYouTube ? (
              <iframe
                src={getEmbedYouTube(lesson.videoUrl)}
                title={lesson.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                ref={videoRef}
                src={getImageUrl(lesson.videoUrl)}
                poster={getImageUrl(lesson.thumbnailUrl)}
                controls
                onTimeUpdate={handleVideoTimeUpdate}
                onEnded={handleVideoEnded}
                className="w-full h-full object-contain bg-black"
              />
            )}
          </div>
        ) : (
          <div className="aspect-video w-full rounded-[2.5rem] bg-gradient-to-br from-[#0a0f26] to-[#05081a] border border-gray-800 shadow-2xl p-6 md:p-8 flex flex-col justify-between text-start relative overflow-hidden select-none">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
            
            <div className="flex flex-col gap-1 z-10 border-b border-white/5 pb-3">
              <span className="text-xs font-black text-gray-500 uppercase tracking-widest leading-none">
                {isRTL ? `الوحدة ${lesson.order || 1}` : `Module ${lesson.order || 1}`}
              </span>
              <h3 className="text-lg md:text-2xl font-black text-white tracking-tight mt-1.5 capitalize">
                {lesson.title}
              </h3>
            </div>

            <div className="my-auto py-4 flex flex-col gap-4 text-start z-10">
              <p className="text-sm md:text-base font-semibold text-gray-300 max-w-xl leading-relaxed">
                {lesson.description || (isRTL ? 'أهلاً بك في هذا الدرس! اقرأ المواد وتابع تقدمك في الدراسة.' : 'Welcome to this lesson! Read the materials and track your study progress.')}
              </p>
              
              {lesson.pdfUrl && (
                <div className="flex items-center gap-4 mt-2">
                  <a
                    href={getImageUrl(lesson.pdfUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-purple-600/10 border border-purple-500/20 text-xs font-black text-purple-300 shadow-sm flex items-center gap-2 hover:bg-purple-600/20 transition-all"
                  >
                    <FiFileText className="text-sm" /> {isRTL ? "عرض عرض الشريحة PDF" : "View Slide PDF"}
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-between items-end border-t border-white/5 pt-3 z-10">
              <span className="text-xs text-gray-500 font-bold uppercase">
                {isRTL ? "مواد فول مارك" : "Fullmark Courseware"}
              </span>
              <span className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center font-black text-xs text-gray-400">
                FM
              </span>
            </div>
          </div>
        )}

        {/* Watch Progress Card */}
        <div className="p-6 rounded-[2rem] bg-gray-900/40 border border-gray-800/80 flex flex-col gap-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiTv className="text-blue-400 text-lg animate-pulse" />
              <h4 className="text-sm font-black text-gray-300 uppercase tracking-widest">
                {isRTL ? "نسبة المشاهدة" : "Watch Progress"}
              </h4>
            </div>
            <span className={`text-base font-black ${isCompleted ? 'text-emerald-400' : 'text-blue-400'}`}>
              {progress}%
            </span>
          </div>

          <div className="h-2 w-full bg-gray-950 rounded-full overflow-hidden border border-gray-900">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${isCompleted ? 'bg-emerald-400' : 'bg-blue-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 font-bold border-t border-gray-800/40 pt-3.5">
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
            <div className="py-3 mt-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm font-black text-emerald-400 flex items-center justify-center gap-2">
              <FiCheckCircle />
              {isRTL ? "تم إكمال الدرس بنجاح" : "Lesson Completed Successfully"}
            </div>
          )}
        </div>

        {/* Lesson Description & Materials */}
        <div className="flex flex-col gap-3 text-start">
          <h4 className="text-sm font-black text-gray-300 uppercase tracking-widest">{isRTL ? "عن هذا الدرس" : "About this Lesson"}</h4>
          <p className="text-sm text-gray-400 leading-relaxed font-semibold">
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
