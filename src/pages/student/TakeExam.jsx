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
import { useLanguage } from '../../context/LanguageContext';

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
  const { t, isRTL } = useLanguage();

  const { examDetail: exam, isLoading, isActionLoading } = useSelector((state) => state.student);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [answeredCount, setAnsweredCount] = useState(0);
  
  // Timer state
  const [timeSpent, setTimeSpent] = useState(0);
  const timerRef = useRef(null);

  const [isLight, setIsLight] = useState(() => {
    return localStorage.getItem('theme') === 'light' || document.documentElement.classList.contains('light');
  });

  useEffect(() => {
    const handleThemeChange = () => {
      setIsLight(localStorage.getItem('theme') === 'light' || document.documentElement.classList.contains('light'));
    };
    handleThemeChange();
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

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
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#080911] text-white'}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
          <span className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{isRTL ? "جاري تحميل أسئلة الاختبار..." : "Loading exam questions..."}</span>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-6 text-center ${isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#080911] text-white'}`}>
        <div className="flex flex-col items-center gap-4">
          <span className={`text-sm font-bold ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{isRTL ? "الاختبار غير موجود أو ليس لديك صلاحية." : "Exam not found or you are not authorized."}</span>
          <button 
            onClick={() => navigate('/student/exams')}
            className="px-4 py-2 bg-blue-600 rounded-xl text-xs font-black text-white hover:bg-blue-500 cursor-pointer"
          >
            {isRTL ? "العودة للاختبارات" : "Back to Exams"}
          </button>
        </div>
      </div>
    );
  }

  const questions = exam?.questions || exam?.exam?.questions || [];
  const currentQuestion = questions[currentIdx];
  const totalQuestions = questions.length;

  if (totalQuestions === 0) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-6 text-center ${isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#080911] text-white'}`}>
        <div className="flex flex-col items-center gap-4">
          <span className={`text-sm font-bold ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{isRTL ? "هذا الاختبار لا يحتوي على أسئلة." : "This exam does not have any questions."}</span>
          <button 
            onClick={() => navigate('/student/exams')}
            className="px-4 py-2 bg-blue-600 rounded-xl text-xs font-black text-white hover:bg-blue-500 cursor-pointer"
          >
            {isRTL ? "العودة للاختبارات" : "Back to Exams"}
          </button>
        </div>
      </div>
    );
  }

  const handleSelectOption = (optionIndex) => {
    if (isActionLoading) return;
    const updated = {
      ...selectedAnswers,
      [currentIdx]: optionIndex
    };
    setSelectedAnswers(updated);

    // Count how many questions are answered
    const count = Object.keys(updated).length;
    setAnsweredCount(count);
  };

  const handleNext = () => {
    if (!selectedAnswers.hasOwnProperty(currentIdx)) {
      toast.error(isRTL ? 'الرجاء اختيار إجابة للمتابعة.' : 'Please select an answer to proceed.');
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
      toast.error(isRTL ? 'الرجاء اختيار إجابة قبل التسليم.' : 'Please select an answer before submitting.');
      return;
    }

    if (timerRef.current) clearInterval(timerRef.current);

    // Build the formatted answers payload for the backend (selectedOption must be 0-3 index)
    const answersPayload = questions.map((q, index) => {
      const selected = selectedAnswers[index];
      let selectedOptionNum = 0;
      if (typeof selected === 'number') {
        selectedOptionNum = selected;
      } else if (typeof selected === 'string') {
        const letterIdx = ['A', 'B', 'C', 'D'].indexOf(selected.toUpperCase());
        selectedOptionNum = letterIdx !== -1 ? letterIdx : (parseInt(selected, 10) || 0);
      }

      return {
        questionId: q._id || q.id,
        selectedOption: selectedOptionNum,
        timeTaken: Math.round(timeSpent / totalQuestions) // approximation per question
      };
    });

    const myToast = toast.loading(isRTL ? 'جاري تسليم إجابات الاختبار...' : 'Submitting exam answers...');
    try {
      const res = await dispatch(submitExam({
        examId: exam?._id || exam?.id || examId,
        answers: answersPayload,
        timeTaken: timeSpent
      })).unwrap();

      toast.dismiss(myToast);
      toast.success(res?.message || (isRTL ? 'تم تسليم الاختبار بنجاح! 🏁' : 'Exam submitted successfully! 🏁'));
      
      // Navigate to results
      navigate('/student/results');
    } catch (err) {
      toast.dismiss(myToast);
      toast.error(err || (isRTL ? 'فشل تسليم الاختبار.' : 'Failed to submit exam.'));
      // resume timer if failed
      timerRef.current = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto flex flex-col justify-between select-none ${isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#080911] text-white'}`}>
      
      {/* Top Banner Header */}
      <header className={`px-6 py-5 md:px-8 border-b backdrop-blur-md flex items-center justify-between sticky top-0 z-20 ${
        isLight ? 'border-slate-200 bg-white/90' : 'border-gray-900/60 bg-[#080911]/80'
      }`}>
        <div className="flex items-center gap-4">
          <button 
            disabled={isActionLoading}
            onClick={() => navigate('/student/exams')}
            className={`w-10 h-10 rounded-2xl border flex items-center justify-center transition-all cursor-pointer shrink-0 disabled:opacity-50 ${
              isLight ? 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-600' : 'border-gray-800 bg-gray-950/40 hover:bg-gray-800/30 text-gray-400 hover:text-white'
            }`}
          >
            <FiX className="text-lg" />
          </button>
          <h1 className="text-base sm:text-lg font-black capitalize tracking-tight">{exam?.title}</h1>
        </div>

        {/* Question Counter Bullet pill */}
        <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] sm:text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
          {isRTL ? `تم إجابة ${answeredCount}/${totalQuestions}` : `${answeredCount}/${totalQuestions} answered`}
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
                className={`h-1.5 flex-1 rounded-full border transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_10px_rgba(59,130,246,0.15)] border-transparent' 
                    : isLight ? 'bg-slate-200 border-slate-300' : 'bg-gray-950 border-black/10'
                }`}
              />
            );
          })}
        </div>

        {/* Question Header & Card */}
        <div className="flex flex-col gap-1 text-start mt-2">
          <div className={`flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest ${
            isLight ? 'text-slate-500' : 'text-gray-500'
          }`}>
            <span>{isRTL ? `السؤال ${currentIdx + 1} من ${totalQuestions}` : `Question ${currentIdx + 1} of ${totalQuestions}`}</span>
            <span>{isRTL ? `الوقت: ${Math.floor(timeSpent / 60)}د ${timeSpent % 60}ث` : `Elapsed: ${Math.floor(timeSpent / 60)}m ${timeSpent % 60}s`}</span>
          </div>

          <div className={`p-6 rounded-[2rem] border shadow-2xl flex flex-col gap-4 text-start mt-2 ${
            isLight 
              ? 'bg-white border-slate-200 shadow-sm' 
              : 'bg-gradient-to-br from-[#0c0d19]/90 to-[#0a0a12]/95 border-gray-800/80 shadow-2xl'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-xl border text-[9px] font-black ${
                isLight ? 'bg-slate-100 border-slate-300 text-slate-600' : 'bg-gray-900 border-gray-800 text-gray-400'
              }`}>
                Q{currentIdx + 1}
              </span>
              <span className="px-2.5 py-0.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-600 dark:text-emerald-400 capitalize">
                {currentQuestion?.difficulty || (isRTL ? 'متوسط' : 'medium')}
              </span>
            </div>

            <h3 className={`text-base sm:text-lg font-bold leading-relaxed ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {(isRTL && currentQuestion?.textAr) ? currentQuestion.textAr : currentQuestion?.text}
            </h3>

            {/* Optional Question Banner Image */}
            {currentQuestion?.image && (
              <div className={`w-full rounded-2xl overflow-hidden border max-h-56 mt-2 flex items-center justify-center ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-black/40 border-gray-800'
              }`}>
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
          {(currentQuestion?.options || []).map((opt, optIdx) => {
            const optionLetters = ['A', 'B', 'C', 'D'];
            const isObject = typeof opt === 'object' && opt !== null;
            const optLetter = optionLetters[optIdx] || String(optIdx + 1);
            const optText = isObject ? (opt.text || opt.val || opt.value || '') : opt;
            const optImage = isObject ? opt.image : currentQuestion?.optionImages?.[optIdx];
            const isSelected = selectedAnswers[currentIdx] === optIdx;

            return (
              <button
                key={optIdx}
                disabled={isActionLoading}
                onClick={() => handleSelectOption(optIdx)}
                className={`w-full p-4 rounded-[1.5rem] border transition-all text-start flex flex-col gap-3 cursor-pointer ${
                  isSelected 
                    ? isLight 
                      ? 'bg-purple-50 border-purple-500 shadow-md shadow-purple-500/10' 
                      : 'bg-purple-600/5 border-purple-500 shadow-md shadow-purple-500/5' 
                    : isLight 
                      ? 'bg-white border-slate-200 hover:border-slate-300' 
                      : 'bg-[#0c0d19]/40 border-gray-800 hover:border-gray-700/80'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    {/* Circle letter icon */}
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      isSelected 
                        ? 'bg-purple-600 text-white' 
                        : isLight ? 'bg-slate-200 text-slate-600' : 'bg-gray-800 text-gray-400'
                    }`}>
                      {optLetter}
                    </span>
                    <span className={`text-xs sm:text-sm font-bold capitalize leading-tight ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}>
                      {optText}
                    </span>
                  </div>

                  {/* Right Circle Checkmark icon */}
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-white shrink-0">
                      <FiCheck size={12} />
                    </span>
                  )}
                </div>

                {/* Optional Option Banner Image */}
                {optImage && (
                  <div className={`w-full rounded-xl overflow-hidden border max-h-32 mt-1 flex items-center justify-center ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-gray-800/80'
                  }`}>
                    <img 
                      src={getImageUrl(optImage)} 
                      alt={`option-${optLetter}`} 
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
      <footer className={`border-t backdrop-blur-md sticky bottom-0 z-20 w-full ${
        isLight ? 'border-slate-200 bg-white/90' : 'border-gray-900/60 bg-[#080911]/80'
      }`}>
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
          {currentIdx === totalQuestions - 1 ? (
            <div className="flex items-center gap-3 w-full">
              {/* Back Arrow button */}
              <button 
                onClick={handlePrev}
                disabled={currentIdx === 0 || isActionLoading}
                className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer ${
                  isLight ? 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700' : 'border-gray-800 bg-gray-950/40 hover:bg-gray-800/30 text-gray-400 hover:text-white'
                }`}
              >
                {isRTL ? <FiArrowRight className="text-lg" /> : <FiArrowLeft className="text-lg" />}
              </button>
              
              {/* Submit button */}
              <button 
                onClick={handleSubmit}
                disabled={isActionLoading}
                className="flex-1 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-xs font-black text-gray-950 transition-all shadow-[0_4px_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] disabled:opacity-50"
              >
                <FiFlag className="text-sm" /> {isActionLoading ? (isRTL ? 'جاري التسليم...' : 'Submitting...') : (isRTL ? 'تسليم الاختبار' : 'Submit Exam')}
              </button>
            </div>
          ) : (
            /* Next Button Full Width */
            <button 
              onClick={handleNext}
              disabled={isActionLoading}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-xs font-black text-white transition-all shadow-[0_4px_15px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] disabled:opacity-50"
            >
              {isRTL ? "التالي" : "Next"} {isRTL ? <FiArrowLeft className="text-sm" /> : <FiArrowRight className="text-sm" />}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default TakeExam;
