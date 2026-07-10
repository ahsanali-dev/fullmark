import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FiPlay, 
  FiCheckCircle 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { fetchSubjectLessons } from '../../redux/slices/studentSlice';

const CourseLessons = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { lessonsData, isLoading } = useSelector((state) => state.student);

  useEffect(() => {
    dispatch(fetchSubjectLessons(courseId));
  }, [dispatch, courseId]);

  const lessons = lessonsData?.lessons || [];
  const progress = lessonsData?.progress || { completed: 0, total: 0, percent: 0 };

  const totalLessons = progress.total || lessons.length;
  const completedCount = progress.completed || 0;
  const progressPercent = progress.percent || 0;

  return (
    <DashboardLayout
      role="student"
      activeTab="courses"
      title="Course Lessons"
      subtitle={`${completedCount} of ${totalLessons} lessons completed`}
      showBackButton={true}
      onBackClick={() => navigate(`/student/courses/${courseId}`)}
    >
      <div className="flex flex-col gap-6 text-left p-6 md:p-8 pb-32 lg:pb-12 w-full max-w-4xl mx-auto">
        {/* Overall Course Progress Box */}
        <div className="p-5 rounded-2xl bg-gray-900/30 border border-gray-800/80 flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm font-black">
            <span className="text-gray-400 uppercase tracking-widest font-bold">Course Progress</span>
            <span className="text-blue-400 font-extrabold">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full bg-gray-950 rounded-full overflow-hidden border border-gray-900">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Lessons List container */}
        <div className="flex flex-col gap-4 text-left">
          <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b border-gray-800/40 pb-2">
            Lesson Modules
          </h4>

          {isLoading ? (
            <div className="flex flex-col gap-4">
              {Array(3).fill(0).map((_, idx) => <TableRowSkeleton key={idx} />)}
            </div>
          ) : lessons.length > 0 ? (
            <div className="flex flex-col gap-4">
              {lessons.map((lesson) => {
                const isDone = lesson.isCompleted;
                const lessonProgress = lesson.progressPercent || 0;

                return (
                  <div
                    key={lesson._id}
                    onClick={() => navigate(`/student/courses/${courseId}/lessons/${lesson._id}`)}
                    className={`p-4 rounded-[2rem] border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isDone 
                        ? 'bg-emerald-500/5 border-emerald-500/20 shadow-md' 
                        : 'bg-[#0c0d19]/40 border-gray-800/80 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Blue play thumbnail */}
                      <div className="w-20 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0 shadow-inner">
                        <FiPlay size={20} className="fill-blue-400/20" />
                      </div>
                      
                      <div className="flex flex-col items-start">
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                          Module {lesson.order || 1}
                        </span>
                        <h5 className="text-base font-bold text-white mt-0.5 leading-snug">
                          {lesson.title}
                        </h5>
                        <span className="text-xs text-gray-500 font-semibold mt-1">
                          Duration: {lesson.duration || 0} mins
                        </span>
                      </div>
                    </div>

                    {/* Progress bar info */}
                    <div className="flex flex-col gap-1.5 min-w-[150px] justify-end">
                      <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                        <span>Watch Progress</span>
                        <span className={isDone ? 'text-emerald-400' : 'text-gray-400'}>
                          {lessonProgress}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-950 rounded-full overflow-hidden border border-gray-900">
                        <div 
                          className={`h-full rounded-full ${isDone ? 'bg-emerald-400' : 'bg-blue-500'}`}
                          style={{ width: `${lessonProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-[#0c0d19]/40 border border-gray-800/80 rounded-3xl flex flex-col items-center justify-center">
              <span className="text-sm font-bold text-gray-500">No lessons uploaded for this course yet.</span>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourseLessons;
