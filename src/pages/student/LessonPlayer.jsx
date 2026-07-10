import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FiCheckCircle, 
  FiTv,
  FiFileText,
  FiDownload
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { fetchSubjectLessons, updateLessonProgress } from '../../redux/slices/studentSlice';

const LessonPlayer = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { lessonsData, isLoading, isActionLoading } = useSelector((state) => state.student);
  
  const [lesson, setLesson] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const simulationInterval = useRef(null);

  // Fetch subject lessons on load if not loaded or if route changes
  useEffect(() => {
    dispatch(fetchSubjectLessons(courseId));
  }, [dispatch, courseId, lessonId]);

  // Find the selected lesson
  useEffect(() => {
    if (lessonsData?.lessons) {
      const found = lessonsData.lessons.find(l => l._id === lessonId);
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

  const startSimulateWatch = () => {
    if (!lesson || isSimulating) return;

    setIsSimulating(true);
    const duration = lesson.videoDuration || 100; // default duration to 100s for simulation if 0
    let currentPos = lesson.lastPosition || 0;

    const step = Math.max(1, Math.round(duration / 10)); // 10 steps

    simulationInterval.current = setInterval(async () => {
      currentPos = Math.min(currentPos + step, duration);
      
      try {
        const result = await dispatch(updateLessonProgress({
          lessonId: lesson._id,
          position: currentPos
        })).unwrap();

        if (result?.data?.lessonProgress?.isCompleted || currentPos >= duration) {
          clearInterval(simulationInterval.current);
          setIsSimulating(false);
          toast.success('Lesson completed! 🎓');
          // Refresh lessons to update stats
          dispatch(fetchSubjectLessons(courseId));
        }
      } catch (err) {
        clearInterval(simulationInterval.current);
        setIsSimulating(false);
        toast.error(err || 'Failed to update lesson progress.');
      }
    }, 1000); // tick every second to simulate watching
  };

  if (isLoading && !lesson) {
    return (
      <DashboardLayout
        role="student"
        activeTab="courses"
        title="Loading Lesson..."
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
        title="Lesson Not Found"
        showBackButton={true}
        onBackClick={() => navigate(`/student/courses/${courseId}/lessons`)}
      >
        <div className="p-8 text-center text-gray-500 font-bold">
          Lesson not found. It might be unavailable.
        </div>
      </DashboardLayout>
    );
  }

  const progress = lesson.progressPercent || 0;
  const isCompleted = lesson.isCompleted;

  return (
    <DashboardLayout
      role="student"
      activeTab="courses"
      title={`Module ${lesson.order || 1}`}
      subtitle={lesson.title}
      showBackButton={true}
      onBackClick={() => navigate(`/student/courses/${courseId}/lessons`)}
    >
      <div className="flex flex-col gap-6 text-left p-6 md:p-8 pb-32 lg:pb-12 w-full max-w-4xl mx-auto">
        {/* Slide Document Player Screen */}
        <div className="aspect-video w-full rounded-[2.5rem] bg-gradient-to-br from-[#0a0f26] to-[#05081a] border border-gray-800 shadow-2xl p-6 md:p-8 flex flex-col justify-between text-left relative overflow-hidden select-none">
          {/* Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
          
          <div className="flex flex-col gap-1 z-10 border-b border-white/5 pb-3">
            <span className="text-xs font-black text-gray-500 uppercase tracking-widest leading-none">
              Module {lesson.order || 1}
            </span>
            <h3 className="text-lg md:text-2xl font-black text-white tracking-tight mt-1.5 capitalize">
              {lesson.title}
            </h3>
          </div>

          <div className="my-auto py-4 flex flex-col gap-4 text-left z-10">
            <p className="text-sm md:text-base font-semibold text-gray-300 max-w-xl leading-relaxed">
              {lesson.description || 'Welcome to this lesson! Please read the provided materials and complete the video playback to earn points.'}
            </p>
            
            {lesson.pdfUrl && (
              <div className="flex items-center gap-4 mt-2">
                <a
                  href={lesson.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-purple-600/10 border border-purple-500/20 text-xs font-black text-purple-300 shadow-sm flex items-center gap-2 hover:bg-purple-600/20 transition-all"
                >
                  <FiFileText className="text-sm" /> View Slide PDF
                </a>
              </div>
            )}
          </div>

          <div className="flex justify-between items-end border-t border-white/5 pt-3 z-10">
            <span className="text-xs text-gray-500 font-bold uppercase">
              Fullmark Courseware
            </span>
            <span className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center font-black text-xs text-gray-400">
              SI
            </span>
          </div>
        </div>

        {/* Watch Progress Card */}
        <div className="p-6 rounded-[2rem] bg-gray-900/30 border border-gray-800/80 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiTv className="text-blue-400 text-lg animate-pulse" />
              <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest font-bold">
                Watch Progress
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

          <div className="flex items-center justify-between text-xs text-gray-500 font-bold border-t border-gray-800/40 pt-3.5">
            <span>Video length: {lesson.duration || 0} mins</span>
            <span>Completes at 90%</span>
          </div>

          {/* Simulation Play Trigger */}
          {!isCompleted ? (
            <button
              onClick={startSimulateWatch}
              disabled={isSimulating || isActionLoading}
              className="w-full py-3.5 mt-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-purple-950/20 disabled:text-gray-500 text-sm font-black text-white transition-all shadow-[0_4px_15px_rgba(139,92,246,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSimulating ? 'Playing Lesson... ⏳' : 'Play & Study Lesson ⯈'}
            </button>
          ) : (
            <div className="py-3 mt-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm font-black text-emerald-400 flex items-center justify-center gap-2">
              <FiCheckCircle />
              Lesson Completed Successfully
            </div>
          )}
        </div>

        {/* Lesson Description */}
        <div className="flex flex-col gap-2 text-left">
          <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">About this Lesson</h4>
          <p className="text-sm text-gray-500 leading-relaxed font-semibold">
            {lesson.description || 'No description provided.'}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LessonPlayer;
