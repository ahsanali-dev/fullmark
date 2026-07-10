import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FiX, 
  FiArrowRight, 
  FiArrowLeft, 
  FiFlag, 
  FiCheck 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { fetchExamToTake, submitExam } from '../../redux/slices/studentSlice';

const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const baseUrl = import.meta.env.VITE_IMAGE_URL || 'http://146.190.18.35:3008/uploads';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${cleanBase}/${cleanPath}`;
};

const TakeExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { examDetail: exam, isLoading, isActionLoading } = useSelector((state) => state.student);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [answeredCount, setAnsweredCount] = useState(0);
  
  // Timer state
  const [timeSpent, setTimeSpent] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    dispatch(fetchExamToTake(examId));
  }, [dispatch, examId]);

  // Start timer when exam is loaded
  useEffect(() => {
    if (exam) {
      timerRef.current = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [exam]);

  if (isLoading && !exam) {
    return (
      <div className="fixed inset-0 bg-[#080911] text-white z-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
          <span className="text-xs text-gray-500 font-bold">Loading exam questions...</span>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="fixed inset-0 bg-[#080911] text-white z-50 flex items-center justify-center p-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <span className="text-sm font-bold text-gray-500">Exam not found or you are not authorized.</span>
          <button 
            onClick={() => navigate('/student/exams')}
            className="px-4 py-2 bg-blue-600 rounded-xl text-xs font-black text-white hover:bg-blue-500"
          >
            Back to Exams
          </button>
        </div>
      </div>
    );
  }

  const questions = exam.questions || [];
  const currentQuestion = questions[currentIdx];
  const totalQuestions = questions.length;

  if (totalQuestions === 0) {
    return (
      <div className="fixed inset-0 bg-[#080911] text-white z-50 flex items-center justify-center p-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <span className="text-sm font-bold text-gray-500">This exam does not have any questions.</span>
          <button 
            onClick={() => navigate('/student/exams')}
            className="px-4 py-2 bg-blue-600 rounded-xl text-xs font-black text-white hover:bg-blue-500"
          >
            Back to Exams
          </button>
        </div>
      </div>
    );
  }

  const handleSelectOption = (optionKey) => {
    if (isActionLoading) return;
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

  const handleSubmit = async () => {
    if (!selectedAnswers.hasOwnProperty(currentIdx)) {
      toast.error('Please select an answer before submitting.');
      return;
    }

    if (timerRef.current) clearInterval(timerRef.current);

    // Build the formatted answers payload for the backend
    const answersPayload = questions.map((q, index) => ({
      questionId: q._id,
      selectedOption: selectedAnswers[index] || '',
      timeTaken: Math.round(timeSpent / totalQuestions) // approximation per question
    }));

    const myToast = toast.loading('Submitting exam answers...');
    try {
      const res = await dispatch(submitExam({
        examId: exam._id,
        answers: answersPayload,
        timeTaken: timeSpent
      })).unwrap();

      toast.dismiss(myToast);
      toast.success(res?.message || 'Exam submitted successfully! 🏁');
      
      // Navigate to results
      navigate('/student/results');
    } catch (err) {
      toast.dismiss(myToast);
      toast.error(err || 'Failed to submit exam.');
      // resume timer if failed
      timerRef.current = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#080911] text-white z-50 overflow-y-auto flex flex-col justify-between select-none">
      
      {/* Top Banner Header */}
      <header className="px-6 py-5 md:px-8 border-b border-gray-900/60 bg-[#080911]/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button 
            disabled={isActionLoading}
            onClick={() => navigate('/student/exams')}
            className="w-10 h-10 rounded-2xl border border-gray-800 bg-gray-950/40 hover:bg-gray-800/30 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer shrink-0 disabled:opacity-50"
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
          {questions.map((_, index) => {
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
            <span>Elapsed: {Math.floor(timeSpent / 60)}m {timeSpent % 60}s</span>
          </div>

          <div className="p-6 rounded-[2rem] bg-gradient-to-br from-[#0c0d19]/90 to-[#0a0a12]/95 border border-gray-800/80 shadow-2xl flex flex-col gap-4 text-left mt-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-xl bg-gray-900 border border-gray-800 text-[9px] font-black text-gray-400">
                Q{currentIdx + 1}
              </span>
              <span className="px-2.5 py-0.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400 capitalize">
                {currentQuestion.difficulty || 'medium'}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
              {currentQuestion.text}
            </h3>

            {/* Optional Question Banner Image */}
            {currentQuestion.image && (
              <div className="w-full rounded-2xl overflow-hidden border border-gray-800 max-h-56 mt-2 flex items-center justify-center bg-black/40">
                <img 
                  src={getImageUrl(currentQuestion.image)} 
                  alt="question-banner" 
                  className="w-full h-full object-cover max-h-56"
                />
              </div>
            )}
          </div>
        </div>

        {/* Question Options List */}
        <div className="flex flex-col gap-3 mt-1">
          {(currentQuestion.options || []).map((opt) => {
            const isSelected = selectedAnswers[currentIdx] === opt.key;

            return (
              <button
                key={opt.key}
                disabled={isActionLoading}
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
                      src={getImageUrl(opt.image)} 
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
                disabled={currentIdx === 0 || isActionLoading}
                className="w-12 h-12 rounded-2xl border border-gray-800 bg-gray-950/40 hover:bg-gray-800/30 flex items-center justify-center text-gray-400 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
              >
                <FiArrowLeft className="text-lg" />
              </button>
              
              {/* Submit button */}
              <button 
                onClick={handleSubmit}
                disabled={isActionLoading}
                className="flex-1 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-xs font-black text-gray-950 transition-all shadow-[0_4px_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] disabled:opacity-50"
              >
                <FiFlag className="text-sm" /> {isActionLoading ? 'Submitting...' : 'Submit Exam'}
              </button>
            </div>
          ) : (
            /* Next Button Full Width */
            <button 
              onClick={handleNext}
              disabled={isActionLoading}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-xs font-black text-white transition-all shadow-[0_4px_15px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] disabled:opacity-50"
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
