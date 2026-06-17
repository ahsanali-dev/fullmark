import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { examsData } from '../../data/examsData';

const Exams = () => {
  const navigate = useNavigate();

  // Selected subject tag filter
  const [selectedTag, setSelectedTag] = useState('All Subjects');
  const [historyExams, setHistoryExams] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('student_exams');
    if (stored) {
      setHistoryExams(JSON.parse(stored));
    } else {
      // Setup initial scores based on user screenshots
      const initial = [
        { id: 'exam-2', name: 'exam 2', subject: 'chemistry', score: 100, status: 'Passed' },
        { id: 'chem-test-1', name: 'chemistry test 1', subject: 'chemistry', score: 50, status: 'Failed' }
      ];
      setHistoryExams(initial);
      localStorage.setItem('student_exams', JSON.stringify(initial));
    }
  }, []);

  const getExamStatus = (examId) => {
    const found = historyExams.find(h => h.id === examId);
    return found ? found : null;
  };

  // Filter exams by tag
  const filteredExams = examsData.filter(exam => {
    if (selectedTag === 'All Subjects') return true;
    return exam.subjectId.toLowerCase() === selectedTag.toLowerCase();
  });

  return (
    <DashboardLayout
      role="student"
      activeTab="exams"
      title="Available Exams"
      subtitle={`${filteredExams.length} exams to take`}
      showBackButton={true}
      onBackClick={() => navigate('/student/dashboard')}
      headerActions={
        <button 
          onClick={() => navigate('/student/results')}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border border-gray-800 bg-gray-950/30 hover:bg-gray-800/30 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 cursor-pointer"
        >
          <FiBarChart2 className="text-lg" />
        </button>
      }
    >
      <div className="flex flex-col gap-6 text-left p-6 md:p-8 pb-32 lg:pb-12 w-full">
        
        {/* Subject filter tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none w-full">
          {['All Subjects', 'chemistry'].map(tag => (
            <button 
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-full text-xs font-black tracking-wide whitespace-nowrap transition-all border ${
                selectedTag === tag 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  : 'bg-gray-900/40 border-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Exams Grid - 4 columns desktop / 2 columns mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {filteredExams.map((exam) => {
            const history = getExamStatus(exam.id);
            const isPassed = history && history.status === 'Passed';
            const isFailed = history && history.status === 'Failed';

            return (
              <div 
                key={exam.id}
                className="p-5 rounded-[2rem] bg-gradient-to-br from-[#0c0d19]/90 to-[#0a0a12]/95 border border-gray-800/80 hover:border-emerald-500/20 shadow-xl flex flex-col justify-between gap-5 relative overflow-hidden transition-all duration-300 group"
              >
                {/* Status Badge in top right */}
                <div className="absolute top-4 right-4 z-10">
                  {isPassed && (
                    <span className="px-3 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 flex flex-col items-center justify-center">
                      <span className="text-xs leading-none">100%</span>
                      <span className="text-[9.5px] opacity-80 mt-0.5">Passed</span>
                    </span>
                  )}
                  {isFailed && (
                    <span className="px-3 py-1.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-[10px] font-black text-rose-400 flex flex-col items-center justify-center">
                      <span className="text-xs leading-none">50%</span>
                      <span className="text-[9.5px] opacity-80 mt-0.5 font-bold">Failed</span>
                    </span>
                  )}
                </div>

                {/* Icon & Details */}
                <div className="flex flex-col text-left gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)] shrink-0">
                    <FiClipboard size={18} className="group-hover:scale-110 transition-transform" />
                  </div>
                  
                  <div className="flex flex-col text-left mt-1">
                    <h3 className="text-base font-black text-white capitalize leading-tight group-hover:text-emerald-400 transition-colors">
                      {exam.title}
                    </h3>
                    <span className="text-xs text-gray-500 font-extrabold mt-1">
                      {exam.subject}
                    </span>
                  </div>
                </div>

                {/* Stats & Actions */}
                <div className="flex flex-col gap-4 border-t border-gray-800/40 pt-3 mt-1">
                  {/* Stats pills */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-gray-400">
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gray-900/30 border border-gray-800/80">
                      <FiHelpCircle className="text-blue-400" />
                      {exam.questionsCount} Qs
                    </span>
                    {exam.duration && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gray-900/30 border border-gray-800/80">
                        <FiClock className="text-blue-400" />
                        {exam.duration} min
                      </span>
                    )}
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gray-900/30 border border-gray-800/80">
                      <FiBarChart2 className="text-yellow-500" />
                      {exam.difficulty}
                    </span>
                  </div>

                  {/* Actions buttons */}
                  {isPassed ? (
                    <button 
                      onClick={() => navigate(`/student/exams/${exam.id}`)}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-black text-white transition-all shadow-[0_4px_12px_rgba(37,99,235,0.25)] hover:scale-102 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <FiRotateCcw className="text-xs" /> Retake Exam
                    </button>
                  ) : isFailed ? (
                    <button 
                      disabled
                      className="w-full py-2.5 rounded-xl bg-gray-900/30 border border-gray-800 text-xs font-black text-gray-500 transition-all flex items-center justify-center gap-1.5 select-none cursor-not-allowed"
                    >
                      <FiLock className="text-xs" /> Already Taken
                    </button>
                  ) : (
                    <button 
                      onClick={() => navigate(`/student/exams/${exam.id}`)}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-black text-white transition-all shadow-[0_4px_12px_rgba(37,99,235,0.25)] hover:scale-102 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <FiPlay className="text-xs" /> Take Exam
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Exams;
