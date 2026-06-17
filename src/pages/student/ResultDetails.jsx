import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiCheckCircle,
  FiXCircle,
  FiStar,
  FiClock,
  FiBarChart2,
  FiHome
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { defaultResultsData } from '../../data/resultsData';
import { examsData } from '../../data/examsData';

const ResultDetails = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);

  useEffect(() => {
    let history = [];
    const stored = localStorage.getItem('student_exams');
    if (stored) {
      history = JSON.parse(stored);
    } else {
      history = defaultResultsData;
      localStorage.setItem('student_exams', JSON.stringify(defaultResultsData));
    }

    // Find attempt by attemptId or index fallback
    let found = history.find(h => h.attemptId === attemptId);
    
    if (!found && attemptId) {
      if (attemptId.startsWith('mock-')) {
        const idx = parseInt(attemptId.split('-')[1]);
        found = history[idx];
      } else if (attemptId.startsWith('attempt-mock-')) {
        const idx = parseInt(attemptId.split('attempt-mock-')[1]) - 1;
        found = history[idx];
      } else if (!isNaN(attemptId)) {
        const idx = parseInt(attemptId);
        found = history[idx];
      }
    }

    if (found) {
      setAttempt(found);
    } else {
      toast.error('Result attempt not found!');
      navigate('/student/results');
    }
  }, [attemptId, navigate]);

  if (!attempt) return null;

  // Resolve questions from attempt, or search examsData database as fallback
  const examDbItem = examsData.find(e => e.id === attempt.id);
  const questions = attempt.questions || (examDbItem ? examDbItem.questions : []);

  // Resolve selectedAnswers fallback if not stored
  let selectedAnswers = attempt.selectedAnswers;
  if (!selectedAnswers || Object.keys(selectedAnswers).length === 0) {
    selectedAnswers = {};
    if (attempt.score === 100) {
      questions.forEach((q, idx) => {
        selectedAnswers[idx] = q.correctOption;
      });
    } else {
      questions.forEach((q, idx) => {
        if (idx === 0) {
          selectedAnswers[idx] = q.correctOption;
        } else {
          const wrongOpt = q.options.find(o => o.key !== q.correctOption);
          selectedAnswers[idx] = wrongOpt ? wrongOpt.key : 'A';
        }
      });
    }
  }

  const isPassed = attempt.status === 'Passed';
  const totalQs = questions.length || 2;
  const correctCount = Math.round((attempt.score / 100) * totalQs);
  const wrongCount = totalQs - correctCount;

  // Grade calculator
  let grade = 'F';
  if (attempt.score === 100) grade = 'A+';
  else if (attempt.score >= 80) grade = 'A';
  else if (attempt.score >= 60) grade = 'B';
  else if (attempt.score >= 40) grade = 'C';
  else grade = 'D';

  return (
    <DashboardLayout
      role="student"
      activeTab="results"
      title="Exam Result"
      subtitle={attempt.name}
      showBackButton={true}
      onBackClick={() => navigate('/student/results')}
    >
      <div className="flex flex-col gap-6 text-left p-6 md:p-8 pb-32 lg:pb-12 w-full max-w-3xl mx-auto">

        {/* Large Score Main Card */}
        <div className={`p-6 rounded-[2.5rem] bg-gradient-to-br relative overflow-hidden flex flex-col items-center justify-center text-center gap-4 py-10 shadow-2xl border ${isPassed
            ? 'from-emerald-950/60 to-[#0c0d19]/90 border-emerald-500/20 shadow-emerald-500/5'
            : 'from-pink-950/40 to-[#0c0d19]/90 border-pink-500/20 shadow-pink-500/5'
          }`}>
          {/* Subject tag */}
          <span className="px-4 py-1.5 rounded-full bg-gray-950/65 border border-gray-800 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {attempt.subject}
          </span>

          {/* Large circular gauge with grade inside */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="62"
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="62"
                stroke={isPassed ? "#10b981" : "#ec4899"}
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 62}
                strokeDashoffset={2 * Math.PI * 62 * (1 - attempt.score / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white">{attempt.score}%</span>
              <span className={`w-8 h-6 rounded-lg flex items-center justify-center text-xs font-black text-white mt-1 border ${isPassed ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-pink-500/20 border-pink-500/30'
                }`}>
                {grade}
              </span>
            </div>
          </div>

          {/* Result Tagline Text */}
          <h2 className="text-xl font-black text-white mt-1">
            {isPassed ? 'Outstanding! 🌟' : 'Keep Practicing! 💪'}
          </h2>

          {/* Status pill action representation */}
          {isPassed ? (
            <span className="px-6 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-sm font-black text-emerald-400 flex items-center gap-1.5 shadow-sm">
              <FiCheckCircle /> Passed ✓
            </span>
          ) : (
            <span className="px-6 py-2.5 rounded-2xl bg-pink-500/10 border border-pink-500/30 text-sm font-black text-pink-400 flex items-center gap-1.5 shadow-sm">
              <FiXCircle /> Failed ✗
            </span>
          )}
        </div>

        {/* 4 Stats Cards grid */}
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#0c0d19]/90 border border-gray-800 flex flex-col items-center justify-center text-center shadow-md">
            <FiCheckCircle className="text-emerald-400 text-base mb-1.5" />
            <span className="text-base font-black text-white leading-none mb-1">{correctCount}</span>
            <span className="text-[10px] font-extrabold text-emerald-400/80 uppercase tracking-wider">Correct</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0c0d19]/90 border border-gray-800 flex flex-col items-center justify-center text-center shadow-md">
            <FiXCircle className="text-pink-500 text-base mb-1.5" />
            <span className="text-base font-black text-white leading-none mb-1">{wrongCount}</span>
            <span className="text-[10px] font-extrabold text-pink-400/80 uppercase tracking-wider">Wrong</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0c0d19]/90 border border-gray-800 flex flex-col items-center justify-center text-center shadow-md">
            <FiStar className="text-yellow-500 text-base mb-1.5" />
            <span className="text-base font-black text-white leading-none mb-1">{attempt.score}%</span>
            <span className="text-[10px] font-extrabold text-yellow-500/80 uppercase tracking-wider">Score</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0c0d19]/90 border border-gray-800 flex flex-col items-center justify-center text-center shadow-md">
            <FiClock className="text-blue-400 text-base mb-1.5" />
            <span className="text-base font-black text-white leading-none mb-1">{attempt.timeSpentSeconds || 10}s</span>
            <span className="text-[10px] font-extrabold text-blue-400/80 uppercase tracking-wider">Time</span>
          </div>
        </div>

        {/* Performance Breakdown Section */}
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
              <FiBarChart2 size={18} />
            </div>
            <h3 className="text-base font-black text-white uppercase tracking-wider">Performance Breakdown</h3>
          </div>

          {questions && questions.map((q, idx) => {
            const userAns = selectedAnswers ? selectedAnswers[idx] : null;

            return (
              <div
                key={q.id || idx}
                className="p-5 rounded-[2rem] bg-gradient-to-br from-[#0c0d19]/90 to-[#0a0a12]/95 border border-gray-800/80 shadow-md flex flex-col gap-4 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-xl bg-gray-900 border border-gray-800 text-xs font-black text-gray-400">
                    Q{idx + 1}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-black text-emerald-400">
                    {q.difficulty || 'Easy'}
                  </span>
                </div>

                <h4 className="text-base font-bold text-white leading-relaxed">
                  {q.text}
                </h4>

                {/* Question Image */}
                {q.image && (
                  <div className="w-full rounded-2xl overflow-hidden border border-gray-800 max-h-56 mt-1 flex items-center justify-center bg-black/40">
                    <img
                      src={q.image}
                      alt="question-banner"
                      className="w-full h-full object-cover max-h-56"
                    />
                  </div>
                )}

                {/* Options list showing right/wrong badges */}
                <div className="flex flex-col gap-2.5 mt-2">
                  {q.options && q.options.map((opt) => {
                    const isCorrectOpt = opt.key === q.correctOption;
                    const isUserChoice = opt.key === userAns;

                    let cardClass = 'border-gray-800 bg-[#0c0d19]/40';
                    if (isCorrectOpt) {
                      cardClass = 'border-emerald-500/50 bg-emerald-500/5';
                    } else if (isUserChoice) {
                      cardClass = 'border-pink-500/50 bg-pink-500/5';
                    }

                    return (
                      <div
                        key={opt.key}
                        className={`w-full p-4 rounded-xl border flex flex-col gap-3 transition-all ${cardClass}`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${isCorrectOpt
                                ? 'bg-emerald-500 text-white'
                                : isUserChoice
                                  ? 'bg-pink-500 text-white'
                                  : 'bg-gray-800 text-gray-400'
                              }`}>
                              {opt.key}
                            </span>
                            <span className="text-sm font-bold text-white capitalize leading-tight">
                              {opt.text}
                            </span>
                          </div>

                          {/* Pill badges */}
                          <div className="flex items-center gap-1.5">
                            {isCorrectOpt && (
                              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-black text-emerald-400">
                                Correct
                              </span>
                            )}
                            {isUserChoice && (
                              <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black ${isCorrectOpt
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                  : 'bg-pink-500/10 border-pink-500/20 text-pink-400'
                                }`}>
                                {isCorrectOpt ? 'You ✓' : 'Your answer'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Optional Option Banner Image */}
                        {opt.image && (
                          <div className="w-full rounded-lg overflow-hidden border border-gray-800/80 max-h-32 mt-1 bg-black/20 flex items-center justify-center">
                            <img
                              src={opt.image}
                              alt={`option-${opt.key}`}
                              className="w-full h-full object-cover max-h-32"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action row buttons */}
        <div className="flex flex-col gap-3 mt-4">
          <button
            onClick={() => navigate('/student/results')}
            className="w-full py-3.5 rounded-2xl bg-gray-900 border border-gray-800 hover:bg-gray-800/80 text-sm font-black text-gray-300 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <FiBarChart2 className="text-sm" /> All Results
          </button>

          <button
            onClick={() => navigate('/student/dashboard')}
            className="w-full py-3.5 rounded-2xl bg-[#0c0d19]/90 border border-gray-800 hover:bg-gray-850/80 text-sm font-black text-gray-400 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <FiHome className="text-sm" /> Back to Home
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default ResultDetails;
