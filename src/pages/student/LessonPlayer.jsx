import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiCheckCircle, 
  FiTv 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { coursesData } from '../../data/coursesData';

const LessonPlayer = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);

  // States for player progress & stats
  const [watchProgressObj, setWatchProgressObj] = useState({});
  const [completedLessons, setCompletedLessons] = useState([]);
  const [points, setPoints] = useState(40);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    const foundCourse = coursesData.find(c => c.id === courseId);
    if (!foundCourse) {
      toast.error('Course not found!');
      navigate('/student/courses');
      return;
    }
    setCourse(foundCourse);

    const foundLesson = foundCourse.lessons.find(l => l.id === lessonId);
    if (!foundLesson) {
      toast.error('Lesson not found!');
      navigate(`/student/courses/${courseId}/lessons`);
      return;
    }
    setLesson(foundLesson);

    // Load watch progress object from localStorage
    const storedWatch = localStorage.getItem('student_watch_progress');
    if (storedWatch) {
      setWatchProgressObj(JSON.parse(storedWatch));
    }

    const storedLessons = localStorage.getItem('student_completed_lessons');
    if (storedLessons) {
      setCompletedLessons(JSON.parse(storedLessons));
    }

    const storedPoints = localStorage.getItem('student_points');
    if (storedPoints) {
      setPoints(parseInt(storedPoints));
    }
  }, [courseId, lessonId, navigate]);

  const startSimulateWatch = () => {
    if (!lesson || isSimulating) return;
    setIsSimulating(true);

    let current = watchProgressObj[lesson.id] || 0;
    
    const interval = setInterval(() => {
      current += 10;
      
      const newWatchObj = {
        ...watchProgressObj,
        [lesson.id]: Math.min(current, 100)
      };
      
      setWatchProgressObj(newWatchObj);
      localStorage.setItem('student_watch_progress', JSON.stringify(newWatchObj));

      if (current >= 100) {
        clearInterval(interval);
        setIsSimulating(false);

        // Mark as completed if not already done
        if (!completedLessons.includes(lesson.id)) {
          const updatedCompleted = [...completedLessons, lesson.id];
          setCompletedLessons(updatedCompleted);
          localStorage.setItem('student_completed_lessons', JSON.stringify(updatedCompleted));
          
          const newPoints = points + 10;
          setPoints(newPoints);
          localStorage.setItem('student_points', newPoints.toString());
          
          toast.success(`Lesson completed! +10 Points earned! 🎓`);
          window.dispatchEvent(new Event('profileUpdate'));
        }
      }
    }, 250);
  };

  if (!course || !lesson) return null;

  const progress = watchProgressObj[lesson.id] || (completedLessons.includes(lesson.id) ? 100 : 0);
  const isCompleted = completedLessons.includes(lesson.id);

  return (
    <DashboardLayout
      role="student"
      activeTab="courses"
      title={lesson.label}
      subtitle={lesson.title}
      showBackButton={true}
      onBackClick={() => navigate(`/student/courses/${course.id}/lessons`)}
    >
      <div className="flex flex-col gap-6 text-left p-6 md:p-8 pb-32 lg:pb-12 w-full max-w-4xl mx-auto">
        {/* Slide Document Player Screen */}
        {lesson.slideContent && (
          <div className="aspect-video w-full rounded-[2.5rem] bg-gradient-to-br from-[#0a0f26] to-[#05081a] border border-gray-800 shadow-2xl p-6 md:p-8 flex flex-col justify-between text-left relative overflow-hidden select-none">
            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
            
            <div className="flex flex-col gap-1 z-10 border-b border-white/5 pb-3">
              <span className="text-xs font-black text-gray-500 uppercase tracking-widest leading-none">
                {lesson.slideContent.subtitle}
              </span>
              <h3 className="text-lg md:text-2xl font-black text-white tracking-tight mt-1.5">
                {lesson.slideContent.title}
              </h3>
            </div>

            <div className="my-auto py-4 flex flex-col gap-4 text-left z-10">
              <p className="text-sm md:text-base font-semibold text-gray-300 max-w-xl leading-relaxed">
                {lesson.slideContent.instructions}
              </p>
              <div className="flex flex-col md:flex-row gap-4 md:items-center mt-2">
                <div className="px-4 py-2.5 rounded-xl bg-purple-600/10 border border-purple-500/20 text-sm md:text-base font-black text-purple-300 shadow-sm flex flex-col gap-0.5">
                  <span className="text-[10px] text-gray-500 uppercase">Formula</span>
                  {lesson.slideContent.formula}
                </div>
                <div className="px-4 py-2.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-sm md:text-base font-black text-blue-300 shadow-sm flex flex-col gap-0.5">
                  <span className="text-[10px] text-gray-500 uppercase">Calculation</span>
                  {lesson.slideContent.calculation}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-end border-t border-white/5 pt-3 z-10">
              <span className="text-xs text-gray-500 font-bold uppercase">
                {lesson.slideContent.author}
              </span>
              <span className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center font-black text-xs text-gray-400">
                SI
              </span>
            </div>
          </div>
        )}

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
            <span>Video length: {lesson.duration}</span>
            <span>Completes at 90%</span>
          </div>

          {/* Simulation Play Trigger */}
          {!isCompleted ? (
            <button
              onClick={startSimulateWatch}
              disabled={isSimulating}
              className="w-full py-3.5 mt-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-purple-950/20 disabled:text-gray-500 text-sm font-black text-white transition-all shadow-[0_4px_15px_rgba(139,92,246,0.3)] flex items-center justify-center gap-2 cursor-pointer"
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
            Description: {lesson.description}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LessonPlayer;
