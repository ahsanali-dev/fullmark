import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiTrendingUp, 
  FiAward, 
  FiCheckCircle, 
  FiCalendar, 
  FiChevronRight
} from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';

import { defaultResultsData } from '../../data/resultsData';

const Results = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);

  useEffect(() => {
    const loadExams = () => {
      const stored = localStorage.getItem('student_exams');
      if (stored) {
        setExams(JSON.parse(stored));
      } else {
        setExams(defaultResultsData);
        localStorage.setItem('student_exams', JSON.stringify(defaultResultsData));
      }
    };
    loadExams();
    window.addEventListener('profileUpdate', loadExams);
    return () => window.removeEventListener('profileUpdate', loadExams);
  }, []);

  // Calculate stats
  const totalAttempts = exams.length;
  const passedAttempts = exams.filter(e => e.status === 'Passed').length;
  const averageScore = totalAttempts > 0 ? Math.round(exams.reduce((sum, e) => sum + e.score, 0) / totalAttempts) : 0;
  const bestScore = totalAttempts > 0 ? Math.max(...exams.map(e => e.score)) : 0;

  return (
    <DashboardLayout
      role="student"
      activeTab="results"
      title="My Results"
      subtitle={`${totalAttempts} attempts`}
      showBackButton={true}
      onBackClick={() => navigate('/student/dashboard')}
    >
      <div className="flex flex-col gap-6 text-left p-6 md:p-8 pb-32 lg:pb-12 w-full max-w-4xl mx-auto">
        
        {/* Top metrics row */}
        <div className="grid grid-cols-3 gap-4">
          {/* Average Score Card */}
          <div className="p-4 rounded-2xl bg-[#0c0d19]/90 border border-gray-800 flex flex-col items-center justify-center text-center shadow-md">
            <FiTrendingUp className="text-cyan-400 text-lg mb-2" />
            <span className="text-lg sm:text-xl font-black text-white leading-none mb-1">{averageScore}%</span>
            <span className="text-[10px] font-bold text-cyan-400/80 uppercase tracking-widest">Avg Score</span>
          </div>

          {/* Best Score Card */}
          <div className="p-4 rounded-2xl bg-[#0c0d19]/90 border border-gray-800 flex flex-col items-center justify-center text-center shadow-md">
            <FiAward className="text-yellow-500 text-lg mb-2" />
            <span className="text-lg sm:text-xl font-black text-white leading-none mb-1">{bestScore}%</span>
            <span className="text-[10px] font-bold text-yellow-500/80 uppercase tracking-widest">Best Score</span>
          </div>

          {/* Passed Count Card */}
          <div className="p-4 rounded-2xl bg-[#0c0d19]/90 border border-gray-800 flex flex-col items-center justify-center text-center shadow-md">
            <FiCheckCircle className="text-emerald-400 text-lg mb-2" />
            <span className="text-lg sm:text-xl font-black text-white leading-none mb-1">{passedAttempts}</span>
            <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest">Passed</span>
          </div>
        </div>

        {/* Attempts Grid - 3 columns desktop / 1 or 2 columns mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-2">
          {exams.map((exam, idx) => {
            const isPassed = exam.status === 'Passed';
            const totalQs = exam.questions ? exam.questions.length : 2;
            const correctCount = Math.round((exam.score / 100) * totalQs);

            return (
              <div 
                key={exam.attemptId || idx}
                onClick={() => navigate(`/student/results/${exam.attemptId || `mock-${idx}`}`)}
                className="p-5 rounded-[2rem] bg-gradient-to-br from-[#0c0d19]/90 to-[#0a0a12]/95 border border-gray-800/80 hover:border-emerald-500/20 shadow-xl flex flex-col justify-between gap-5 cursor-pointer transition-all duration-300 hover:translate-y-[-2px] group"
              >
                {/* Circle gauge centered on top */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle 
                        cx="40" 
                        cy="40" 
                        r="34" 
                        className="stroke-slate-200 dark:stroke-slate-800" 
                        strokeWidth="4" 
                        fill="transparent" 
                      />
                      <circle 
                        cx="40" 
                        cy="40" 
                        r="34" 
                        stroke={isPassed ? "#10b981" : "#ec4899"} 
                        strokeWidth="4" 
                        fill="transparent" 
                        strokeDasharray={2 * Math.PI * 34}
                        strokeDashoffset={2 * Math.PI * 34 * (1 - exam.score / 100)}
                      />
                    </svg>
                    <span className="absolute text-xs font-black text-white">{exam.score}%</span>
                  </div>

                  <div className="text-center mt-1">
                    <h3 className="text-base font-black text-white capitalize leading-tight group-hover:text-emerald-400 transition-colors">
                      {exam.name}
                    </h3>
                    <span className="text-xs text-gray-500 font-extrabold mt-1 inline-block">
                      {exam.subject}
                    </span>
                  </div>
                </div>

                {/* Info and action section */}
                <div className="flex flex-col gap-3.5 border-t border-gray-800/40 pt-3.5">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                    <span className="flex items-center gap-1">
                      <FiCheckCircle className="text-blue-400 shrink-0" />
                      {correctCount}/{totalQs} Correct
                    </span>
                    <span className="flex items-center gap-1">
                      <FiCalendar className="text-blue-400 shrink-0" />
                      {exam.date}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    {isPassed ? (
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-black text-emerald-400">
                        Passed
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-xl bg-pink-500/10 border border-pink-500/20 text-xs font-black text-pink-400">
                        Failed
                      </span>
                    )}
                    <span className="text-xs font-black text-gray-400 group-hover:text-white transition-colors flex items-center gap-0.5">
                      Details <FiChevronRight />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Results;
