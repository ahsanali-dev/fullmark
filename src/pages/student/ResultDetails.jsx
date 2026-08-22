import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiCheckCircle,
  FiXCircle,
  FiStar,
  FiClock,
  FiBarChart2,
  FiHome,
  FiPlayCircle,
  FiZap,
  FiX,
  FiCheck
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import VideoPlayer from '../../components/shared/VideoPlayer';
import { fetchAttemptDetail, fetchSimilarQuestion } from '../../redux/slices/studentSlice';
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

const ResultDetails = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, isRTL } = useLanguage();

  const { resultDetail: attempt, similarQuestion, isLoading } = useSelector((state) => state.student);

  // Video Modal State
  const [videoModalUrl, setVideoModalUrl] = useState(null);

  // Similar Question Modal State
  const [similarModalOpen, setSimilarModalOpen] = useState(false);
  const [fetchingSimilar, setFetchingSimilar] = useState(false);
  const [selectedPracticeOpt, setSelectedPracticeOpt] = useState(null);
  const [submittedPractice, setSubmittedPractice] = useState(false);

  useEffect(() => {
    dispatch(fetchAttemptDetail(attemptId));
  }, [dispatch, attemptId]);

  const handleOpenSimilarQuestion = async (questionId) => {
    setFetchingSimilar(true);
    setSelectedPracticeOpt(null);
    setSubmittedPractice(false);
    setSimilarModalOpen(true);
    const loadingToast = toast.loading(isRTL ? 'جاري إنشاء سؤال مماثل...' : 'Generating similar question variant...');
    try {
      await dispatch(fetchSimilarQuestion(questionId)).unwrap();
      toast.dismiss(loadingToast);
    } catch (err) {
      toast.error(err || (isRTL ? 'فشل جلب سؤال مماثل' : 'Failed to fetch similar question'), { id: loadingToast });
      setSimilarModalOpen(false);
    } finally {
      setFetchingSimilar(false);
    }
  };

  if (isLoading && !attempt) {
    return (
      <DashboardLayout
        role="student"
        activeTab="results"
        title={isRTL ? "جاري تحميل تفاصيل النتيجة..." : "Loading Result Details..."}
        showBackButton={true}
        onBackClick={() => navigate('/student/results')}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!attempt) {
    return (
      <DashboardLayout
        role="student"
        activeTab="results"
        title={isRTL ? "النتيجة غير موجودة" : "Result Not Found"}
        showBackButton={true}
        onBackClick={() => navigate('/student/results')}
      >
        <div className="p-8 text-center text-gray-500 font-bold">
          {isRTL ? "فشل تحميل تفاصيل نتيجة الاختبار." : "Failed to load attempt result details."}
        </div>
      </DashboardLayout>
    );
  }

  const isPassed = attempt.passed;
  const totalQs = attempt.totalQuestions || 0;
  const correctCount = attempt.correctAnswers || 0;
  const wrongCount = attempt.wrongAnswers || 0;

  // Grade calculator
  const score = attempt.score || 0;
  let grade = 'F';
  if (score === 100) grade = 'A+';
  else if (score >= 80) grade = 'A';
  else if (score >= 60) grade = 'B';
  else if (score >= 40) grade = 'C';
  else grade = 'D';

  const answers = attempt.answers || [];

  return (
    <DashboardLayout
      role="student"
      activeTab="results"
      title={isRTL ? "نتيجة الاختبار" : "Exam Result"}
      subtitle={typeof attempt.exam === 'object' && attempt.exam?.title ? attempt.exam.title : (isRTL ? 'اختبار تجريبي' : 'Practice Exam')}
      showBackButton={true}
      onBackClick={() => navigate('/student/results')}
    >
      <div className="flex flex-col gap-6 text-start p-6 md:p-8 pb-32 lg:pb-12 w-full max-w-3xl mx-auto">

        {/* Large Score Main Card */}
        <div className={`p-6 rounded-[2.5rem] bg-gradient-to-br relative overflow-hidden flex flex-col items-center justify-center text-center gap-4 py-10 shadow-2xl border ${isPassed
            ? 'from-emerald-950/60 to-[#0c0d19]/90 border-emerald-500/20 shadow-emerald-500/5'
            : 'from-pink-950/40 to-[#0c0d19]/90 border-pink-500/20 shadow-pink-500/5'
          }`}>
          {/* Subject tag */}
          {attempt.subject && typeof attempt.subject === 'object' && (attempt.subject.name || attempt.subject.nameAr) && (
            <span className="px-4 py-1.5 rounded-full bg-gray-950/65 border border-gray-800 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {(isRTL && attempt.subject.nameAr) ? attempt.subject.nameAr : (attempt.subject.name || '')}
            </span>
          )}

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
                strokeDashoffset={2 * Math.PI * 62 * (1 - score / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white">{score}%</span>
              <span className={`w-8 h-6 rounded-lg flex items-center justify-center text-xs font-black text-white mt-1 border ${isPassed ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-pink-500/20 border-pink-500/30'
                }`}>
                {grade}
              </span>
            </div>
          </div>

          {/* Result Tagline Text */}
          <h2 className="text-xl font-black text-white mt-1">
            {isPassed ? (isRTL ? 'ممتاز! 🌟' : 'Outstanding! 🌟') : (isRTL ? 'واصل التدريب! 💪' : 'Keep Practicing! 💪')}
          </h2>

          {/* Status pill action representation */}
          {isPassed ? (
            <span className="px-6 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-sm font-black text-emerald-400 flex items-center gap-1.5 shadow-sm animate-pulse">
              <FiCheckCircle /> {isRTL ? "ناجح ✓" : "Passed ✓"}
            </span>
          ) : (
            <span className="px-6 py-2.5 rounded-2xl bg-pink-500/10 border border-pink-500/30 text-sm font-black text-pink-400 flex items-center gap-1.5 shadow-sm">
              <FiXCircle /> {isRTL ? "راسب ✗" : "Failed ✗"}
            </span>
          )}
        </div>

        {/* 4 Stats Cards grid */}
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#0c0d19]/90 border border-gray-800 flex flex-col items-center justify-center text-center shadow-md">
            <FiCheckCircle className="text-emerald-400 text-base mb-1.5" />
            <span className="text-base font-black text-white leading-none mb-1">{correctCount}</span>
            <span className="text-[10px] font-extrabold text-emerald-400/80 uppercase tracking-wider">{isRTL ? "صحيح" : "Correct"}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0c0d19]/90 border border-gray-800 flex flex-col items-center justify-center text-center shadow-md">
            <FiXCircle className="text-pink-500 text-base mb-1.5" />
            <span className="text-base font-black text-white leading-none mb-1">{wrongCount}</span>
            <span className="text-[10px] font-extrabold text-pink-400/80 uppercase tracking-wider">{isRTL ? "خطأ" : "Wrong"}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0c0d19]/90 border border-gray-800 flex flex-col items-center justify-center text-center shadow-md">
            <FiStar className="text-yellow-500 text-base mb-1.5" />
            <span className="text-base font-black text-white leading-none mb-1">{score}%</span>
            <span className="text-[10px] font-extrabold text-yellow-500/80 uppercase tracking-wider">{isRTL ? "النتيجة" : "Score"}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0c0d19]/90 border border-gray-800 flex flex-col items-center justify-center text-center shadow-md">
            <FiClock className="text-blue-400 text-base mb-1.5" />
            <span className="text-base font-black text-white leading-none mb-1">{attempt.timeTaken || 0}ث</span>
            <span className="text-[10px] font-extrabold text-blue-400/80 uppercase tracking-wider">{isRTL ? "الوقت" : "Time"}</span>
          </div>
        </div>

        {/* Performance Breakdown Section */}
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
              <FiBarChart2 size={18} />
            </div>
            <h3 className="text-base font-black text-white uppercase tracking-wider">{isRTL ? "تفاصيل الأداء" : "Performance Breakdown"}</h3>
          </div>

          {answers.map((ans, idx) => {
            const q = ans.question;
            if (!q) return null;

            const userAns = ans.selectedOption;
            const isCorrectAnswer = ans.isCorrect;
            const videoLink = q.videoUrl || q.weaknessTopic?.generalVideoUrl;

            return (
              <div
                key={ans._id || idx}
                className="p-5 rounded-[2rem] bg-gradient-to-br from-[#0c0d19]/90 to-[#0a0a12]/95 border border-gray-800/80 shadow-md flex flex-col gap-4 text-start"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-xl bg-gray-900 border border-gray-800 text-xs font-black text-gray-400">
                      Q{idx + 1}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-black text-emerald-400 capitalize">
                      {q.difficulty || (isRTL ? 'متوسط' : 'medium')}
                    </span>
                  </div>

                  {/* Actions for Incorrect Questions */}
                  {!isCorrectAnswer && (
                    <div className="flex items-center gap-2">
                      {videoLink && (
                        <button
                          type="button"
                          onClick={() => setVideoModalUrl(videoLink)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <FiPlayCircle size={15} /> {isRTL ? "شاهد فيديو الشرح" : "Watch Explanation Video"}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenSimilarQuestion(q._id || q.id)}
                        className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <FiZap size={15} /> {isRTL ? "جرب سؤالاً مماثلاً" : "Try Similar Question"}
                      </button>
                    </div>
                  )}
                </div>

                <h4 className="text-base font-bold text-white leading-relaxed">
                  {q.text}
                </h4>

                {/* Question Image */}
                {q.image && (
                  <div className="w-full rounded-2xl overflow-hidden border border-gray-800 max-h-56 mt-1 flex items-center justify-center bg-black/40">
                    <img
                      src={getImageUrl(q.image)}
                      alt="question-banner"
                      className="w-full h-full object-cover max-h-56"
                    />
                  </div>
                )}

                {/* Options list showing right/wrong badges */}
                <div className="flex flex-col gap-2.5 mt-2">
                  {(q.options || []).map((opt, optIdx) => {
                    const letters = ['A', 'B', 'C', 'D'];
                    const isObject = typeof opt === 'object' && opt !== null;
                    const optLetter = isObject ? (opt.key || letters[optIdx] || String(optIdx + 1)) : (letters[optIdx] || String(optIdx + 1));
                    const optText = isObject ? (opt.text || opt.val || opt.value || '') : opt;
                    const optImage = isObject ? opt.image : q.optionImages?.[optIdx];

                    const correctIndex = typeof q.correctOption === 'number'
                      ? q.correctOption
                      : letters.indexOf(q.correctOption);

                    const userIndex = typeof userAns === 'number'
                      ? userAns
                      : letters.indexOf(userAns);

                    const isCorrectOpt = optIdx === correctIndex || optLetter === q.correctOption;
                    const isUserChoice = optIdx === userIndex || optLetter === userAns;

                    let cardClass = 'border-gray-800 bg-[#0c0d19]/40';
                    if (isCorrectOpt) {
                      cardClass = 'border-emerald-500/50 bg-emerald-500/5';
                    } else if (isUserChoice) {
                      cardClass = 'border-pink-500/50 bg-pink-500/5';
                    }

                    return (
                      <div
                        key={optIdx}
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
                              {optLetter}
                            </span>
                            <span className="text-sm font-bold text-white capitalize leading-tight">
                              {optText}
                            </span>
                          </div>

                          {/* Pill badges */}
                          <div className="flex items-center gap-1.5">
                            {isCorrectOpt && (
                              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-black text-emerald-400">
                                {isRTL ? "صحيح" : "Correct"}
                              </span>
                            )}
                            {isUserChoice && (
                              <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black ${isCorrectOpt
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                  : 'bg-pink-500/10 border-pink-500/20 text-pink-400'
                                }`}>
                                {isCorrectOpt ? (isRTL ? 'إجابتك ✓' : 'You ✓') : (isRTL ? 'إجابتك' : 'Your answer')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Optional Option Banner Image */}
                        {optImage && (
                          <div className="w-full rounded-lg overflow-hidden border border-gray-800/80 max-h-32 mt-1 bg-black/20 flex items-center justify-center">
                            <img
                              src={getImageUrl(optImage)}
                              alt={`option-${optLetter}`}
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
            <FiBarChart2 className="text-sm" /> {isRTL ? "جميع النتائج" : "All Results"}
          </button>

          <button
            onClick={() => navigate('/student/dashboard')}
            className="w-full py-3.5 rounded-2xl bg-[#0c0d19]/90 border border-gray-800 hover:bg-gray-850/80 text-sm font-black text-gray-400 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <FiHome className="text-sm" /> {isRTL ? "العودة للرئيسية" : "Back to Home"}
          </button>
        </div>

      </div>

      {/* VIDEO MODAL */}
      <AnimatePresence>
        {videoModalUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-[#0e101a] border border-gray-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-start relative"
            >
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <FiPlayCircle className="text-emerald-400" /> {isRTL ? "فيديو شرح السؤال" : "Question Explanation Video"}
                </h3>
                <button
                  onClick={() => setVideoModalUrl(null)}
                  className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white cursor-pointer"
                >
                  <FiX size={18} />
                </button>
              </div>

              <VideoPlayer
                videoUrl={videoModalUrl}
                targetType="question"
                autoPlay={true}
                className="w-full h-full"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SIMILAR QUESTION PRACTICE MODAL */}
      <AnimatePresence>
        {similarModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-[#0e101a] border border-purple-500/30 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-start relative"
            >
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <FiZap className="text-purple-400" /> {isRTL ? "تدرب على سؤال مماثل" : "Practice Similar Variant Question"}
                </h3>
                <button
                  onClick={() => setSimilarModalOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white cursor-pointer"
                >
                  <FiX size={18} />
                </button>
              </div>

              {fetchingSimilar ? (
                <div className="py-12 flex items-center justify-center text-purple-400 font-bold">
                  {isRTL ? "جاري إنشاء سؤال مماثل..." : "Generating similar question variant..."}
                </div>
              ) : similarQuestion ? (
                <div className="flex flex-col gap-4">
                  <h4 className="text-base font-bold text-white leading-relaxed">
                    {similarQuestion.text || similarQuestion.questionText}
                  </h4>

                  {/* Options */}
                  <div className="flex flex-col gap-2.5">
                    {(similarQuestion.options || []).map((optText, optIdx) => {
                      const letters = ['A', 'B', 'C', 'D'];
                      const isSelected = selectedPracticeOpt === optIdx;
                      const correctOpt = typeof similarQuestion.correctOption === 'number'
                        ? similarQuestion.correctOption
                        : ['A', 'B', 'C', 'D'].indexOf(similarQuestion.correctOption);

                      let btnStyle = 'bg-[#121424] border-gray-800 text-gray-300';
                      if (submittedPractice) {
                        if (optIdx === correctOpt) btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                        else if (isSelected) btnStyle = 'bg-pink-500/20 border-pink-500 text-pink-300 font-bold';
                      } else if (isSelected) {
                        btnStyle = 'bg-purple-500/20 border-purple-500 text-white font-bold';
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={submittedPractice}
                          onClick={() => setSelectedPracticeOpt(optIdx)}
                          className={`p-3.5 rounded-xl border flex items-center gap-3 text-start transition-all cursor-pointer ${btnStyle}`}
                        >
                          <span className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-xs font-black">
                            {letters[optIdx]}
                          </span>
                          <span className="text-sm font-semibold">{optText}</span>
                        </button>
                      );
                    })}
                  </div>

                  {submittedPractice ? (
                    <div className="p-4 rounded-2xl bg-white/5 border border-gray-800 flex flex-col gap-2 mt-2">
                      {selectedPracticeOpt === (typeof similarQuestion.correctOption === 'number' ? similarQuestion.correctOption : ['A', 'B', 'C', 'D'].indexOf(similarQuestion.correctOption)) ? (
                        <span className="text-sm font-black text-emerald-400 flex items-center gap-1.5">
                          <FiCheck /> {isRTL ? "إجابة صحيحة! أحسنت في إتقان هذا المفهوم!" : "Correct! Great job mastering this concept!"}
                        </span>
                      ) : (
                        <span className="text-sm font-black text-pink-400 flex items-center gap-1.5">
                          <FiX /> {isRTL ? "إجابة غير صحيحة هذه المرة. استمر في التدريب!" : "Incorrect this time. Keep practicing!"}
                        </span>
                      )}
                      {similarQuestion.explanation && (
                        <p className="text-xs text-gray-400 font-medium">
                          {isRTL ? "الشرح:" : "Explanation:"} {similarQuestion.explanation}
                        </p>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (selectedPracticeOpt === null) {
                          toast.error(isRTL ? 'الرجاء اختيار خيار أولاً' : 'Please select an option first');
                          return;
                        }
                        setSubmittedPractice(true);
                      }}
                      className="mt-2 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-black text-sm transition-all cursor-pointer"
                    >
                      {isRTL ? "التحقق من الإجابة" : "Check Answer"}
                    </button>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-400 font-bold">
                  {isRTL ? "لا يتوفر سؤال مماثل." : "No similar question available."}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
};

export default ResultDetails;
