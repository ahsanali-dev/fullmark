import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiX, 
  FiArrowRight, 
  FiArrowLeft, 
  FiFlag, 
  FiCheck 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { examsData } from '../../data/examsData';

const TakeExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [answeredCount, setAnsweredCount] = useState(0);

  useEffect(() => {
    const found = examsData.find(e => e.id === examId);
    if (!found) {
      toast.error('Exam not found!');
      navigate('/student/exams');
      return;
    }
    setExam(found);
  }, [examId, navigate]);

  if (!exam) return null;

  const currentQuestion = exam.questions[currentIdx];
  const totalQuestions = exam.questions.length;

  const handleSelectOption = (optionKey) => {
    const updated = {
      ...selectedAnswers,
      [currentIdx]: optionKey
    };
    setSelectedAnswers(updated);

    // Count how many questions are answered
    const count = Object.keys(updated).length;
    setAnsweredCount(count);
  };

  const handleNext = () => {
    if (!selectedAnswers.hasOwnProperty(currentIdx)) {
      toast.error('Please select an answer to proceed.');
      return;
    }
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSubmit = () => {
    if (!selectedAnswers.hasOwnProperty(currentIdx)) {
      toast.error('Please select an answer before submitting.');
      return;
    }

    // Calculate score
    let correctCount = 0;
    exam.questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctOption) {
        correctCount++;
      }
    });

    const scorePercent = Math.round((correctCount / totalQuestions) * 100);
    const passed = scorePercent >= 60; // 60% passing mark
    const status = passed ? 'Passed' : 'Failed';

    // Store in student_exams
    const stored = localStorage.getItem('student_exams');
    let history = [];
    if (stored) {
      history = JSON.parse(stored);
    }

    // Prepend new result with unique attemptId and questions/answers snapshots
    const newResult = {
      attemptId: `attempt-${Date.now()}`,
      id: exam.id,
      name: exam.title,
      subject: exam.subject,
      score: scorePercent,
      status: status,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      selectedAnswers: selectedAnswers,
      timeSpentSeconds: 10 + Math.floor(Math.random() * 20),
      questions: exam.questions
    };

    history.unshift(newResult);
    localStorage.setItem('student_exams', JSON.stringify(history));

    // Award points if passed
    if (passed) {
      const storedPoints = localStorage.getItem('student_points') || '40';
      const newPoints = parseInt(storedPoints) + 15;
      localStorage.setItem('student_points', newPoints.toString());
      toast.success(`Exam passed! +15 Points awarded! 🏆`);
    } else {
      toast.error(`Exam finished. Score: ${scorePercent}% (${status})`);
    }

    window.dispatchEvent(new Event('profileUpdate'));
    navigate('/student/results');
  };

  return (
    <div className="fixed inset-0 bg-[#080911] text-white z-50 overflow-y-auto flex flex-col justify-between select-none">
      
      {/* Top Banner Header */}
      <header className="px-6 py-5 md:px-8 border-b border-gray-900/60 bg-[#080911]/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/student/exams')}
            className="w-10 h-10 rounded-2xl border border-gray-800 bg-gray-950/40 hover:bg-gray-800/30 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer shrink-0"
          >
            <FiX className="text-lg" />
          </button>
          <h1 className="text-base sm:text-lg font-black capitalize tracking-tight">{exam.title}</h1>
        </div>

        {/* Question Counter Bullet pill */}
        <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] sm:text-xs font-black text-emerald-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {answeredCount}/{totalQuestions} answered
        </span>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-6 flex flex-col gap-6">
        
        {/* Multi-segment Progress Bar */}
        <div className="flex items-center gap-2 w-full">
          {exam.questions.map((_, index) => {
            const isActive = index <= currentIdx;
            return (
              <div 
                key={index} 
                className={`h-1.5 flex-1 rounded-full border border-black/10 transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_10px_rgba(59,130,246,0.15)]' 
                    : 'bg-gray-950'
                }`}
              />
            );
          })}
        </div>

        {/* Question Header & Card */}
        <div className="flex flex-col gap-1 text-left mt-2">
          <div className="flex items-center justify-between text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">
            <span>Question {currentIdx + 1} of {totalQuestions}</span>
          </div>

          <div className="p-6 rounded-[2rem] bg-gradient-to-br from-[#0c0d19]/90 to-[#0a0a12]/95 border border-gray-800/80 shadow-2xl flex flex-col gap-4 text-left mt-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-xl bg-gray-900 border border-gray-800 text-[9px] font-black text-gray-400">
                Q{currentIdx + 1}
              </span>
              <span className="px-2.5 py-0.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400">
                {currentQuestion.difficulty}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
              {currentQuestion.text}
            </h3>

            {/* Optional Question Banner Image */}
            {currentQuestion.image && (
              <div className="w-full rounded-2xl overflow-hidden border border-gray-800 max-h-56 mt-2 flex items-center justify-center bg-black/40">
                <img 
                  src={currentQuestion.image} 
                  alt="question-banner" 
                  className="w-full h-full object-cover max-h-56"
                />
              </div>
            )}
          </div>
        </div>

        {/* Question Options List */}
        <div className="flex flex-col gap-3 mt-1">
          {currentQuestion.options.map((opt) => {
            const isSelected = selectedAnswers[currentIdx] === opt.key;

            return (
              <button
                key={opt.key}
                onClick={() => handleSelectOption(opt.key)}
                className={`w-full p-4 rounded-[1.5rem] border transition-all text-left flex flex-col gap-3 cursor-pointer ${
                  isSelected 
                    ? 'bg-purple-600/5 border-purple-500 shadow-md shadow-purple-500/5' 
                    : 'bg-[#0c0d19]/40 border-gray-800 hover:border-gray-700/80'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    {/* Circle letter icon */}
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      isSelected 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-gray-800 text-gray-400'
                    }`}>
                      {opt.key}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-white capitalize leading-tight">
                      {opt.text}
                    </span>
                  </div>

                  {/* Right Circle Checkmark icon */}
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-white shrink-0">
                      <FiCheck size={12} />
                    </span>
                  )}
                </div>

                {/* Optional Option Banner Image */}
                {opt.image && (
                  <div className="w-full rounded-xl overflow-hidden border border-gray-800/80 max-h-32 mt-1 bg-black/20 flex items-center justify-center">
                    <img 
                      src={opt.image} 
                      alt={`option-${opt.key}`} 
                      className="w-full h-full object-cover max-h-32"
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </main>

      {/* Bottom Sticky Action Footer */}
      <footer className="border-t border-gray-900/60 bg-[#080911]/80 backdrop-blur-md sticky bottom-0 z-20 w-full">
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
          {currentIdx === totalQuestions - 1 ? (
            <div className="flex items-center gap-3 w-full">
              {/* Back Arrow button */}
              <button 
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="w-12 h-12 rounded-2xl border border-gray-800 bg-gray-950/40 hover:bg-gray-800/30 flex items-center justify-center text-gray-400 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
              >
                <FiArrowLeft className="text-lg" />
              </button>
              
              {/* Submit button */}
              <button 
                onClick={handleSubmit}
                className="flex-1 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-xs font-black text-gray-950 transition-all shadow-[0_4px_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
              >
                <FiFlag className="text-sm" /> Submit Exam
              </button>
            </div>
          ) : (
            /* Next Button Full Width */
            <button 
              onClick={handleNext}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-xs font-black text-white transition-all shadow-[0_4px_15px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
            >
              Next <FiArrowRight className="text-sm" />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default TakeExam;
