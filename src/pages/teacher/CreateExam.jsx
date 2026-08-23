import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FiChevronLeft,
  FiFileText,
  FiHelpCircle,
  FiClock,
  FiCheck,
  FiArrowRight,
  FiArrowLeft,
  FiInfo,
  FiBookOpen,
  FiSettings,
  FiCalendar,
  FiSearch,
  FiX,
  FiFilter
} from 'react-icons/fi';
import toast from 'react-hot-toast';

import DashboardLayout from '../../components/layout/DashboardLayout';
import Input from '../../components/ui/Input';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTeacherSubjects, fetchQuestions, createExam } from '../../redux/slices/teacherSlice';
import { useLanguage } from '../../context/LanguageContext';

const CreateExam = () => {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const dispatch = useDispatch();
  const { t, isRTL } = useLanguage();

  // Load store data
  const { subjects = [], questions = [], isLoading } = useSelector((state) => state.teacher);

  useEffect(() => {
    dispatch(fetchTeacherSubjects());
    dispatch(fetchQuestions());
  }, [dispatch]);

  const allQuestions = questions.map(q => {
    const qSubjectId = q.subject?._id || q.subject || q.subjectId;
    return {
      ...q,
      id: q._id || q.id,
      subjectId: qSubjectId,
    };
  });

  // Wizard state
  const [step, setStep] = useState(1);

  // Step 1 states
  const [examTitle, setExamTitle] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjectId === 'select' ? '' : (subjectId || ''));
  const [difficultyMix, setDifficultyMix] = useState('Mixed');
  const [questionCount, setQuestionCount] = useState(20);

  // Question counts by difficulty level for the selected subject
  const subjectQuestions = selectedSubjectId
    ? allQuestions.filter(q => q.subjectId === selectedSubjectId)
    : [];
  const easyCount = subjectQuestions.filter(q => (q.difficulty || '').toLowerCase() === 'easy').length;
  const mediumCount = subjectQuestions.filter(q => (q.difficulty || '').toLowerCase() === 'medium').length;
  const hardCount = subjectQuestions.filter(q => (q.difficulty || '').toLowerCase() === 'hard').length;
  const totalSubjectCount = subjectQuestions.length;

  // Step 2 states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);

  // Filter questions by selected subject, difficulty mix, and search query (English & Arabic text)
  const filteredQuestions = allQuestions.filter(q => {
    if (selectedSubjectId && q.subjectId !== selectedSubjectId) {
      return false;
    }

    const qDiff = (q.difficulty || '').toLowerCase();
    if (difficultyMix === 'Easy Only' && qDiff !== 'easy') {
      return false;
    }
    if (difficultyMix === 'Medium Only' && qDiff !== 'medium') {
      return false;
    }
    if (difficultyMix === 'Hard Only' && qDiff !== 'hard') {
      return false;
    }

    if (searchQuery.trim()) {
      const textEn = (q.text || q.questionText || '').toLowerCase();
      const textAr = (q.textAr || '').toLowerCase();
      const query = searchQuery.toLowerCase().trim();
      if (!textEn.includes(query) && !textAr.includes(query)) {
        return false;
      }
    }

    return true;
  });

  // Step 3 states
  const [enableTimer, setEnableTimer] = useState(true);
  const [duration, setDuration] = useState(60);
  const [showExplanations, setShowExplanations] = useState(true);
  const [allowRetake, setAllowRetake] = useState(false);

  // Actions
  const handleToggleQuestion = (id) => {
    if (selectedQuestionIds.includes(id)) {
      setSelectedQuestionIds(selectedQuestionIds.filter(qid => qid !== id));
    } else {
      if (selectedQuestionIds.length >= questionCount) {
        toast.error(
          isRTL
            ? `عذراً، الحد الأقصى للأسئلة المحددة في هذا الاختبار هو ${questionCount} أسئلة`
            : `Sorry, maximum allowed questions for this exam is ${questionCount}`
        );
        return;
      }
      setSelectedQuestionIds([...selectedQuestionIds, id]);
    }
  };

  const handleSelectAll = () => {
    const toSelect = filteredQuestions.slice(0, questionCount).map(q => q.id);
    setSelectedQuestionIds(toSelect);
    if (filteredQuestions.length > questionCount) {
      toast(
        isRTL
          ? `تم تحديد أول ${questionCount} أسئلة فقط بناءً على العدد المحدد`
          : `Selected top ${questionCount} questions based on your limit`,
        { icon: 'ℹ️' }
      );
    }
  };

  const handleDeselectAll = () => {
    setSelectedQuestionIds([]);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePublishExam = async () => {
    if (!selectedSubjectId) {
      toast.error(isRTL ? 'يرجى تحديد مادة أولاً' : 'Please select a subject first');
      setStep(1);
      return;
    }
    if (!examTitle.trim()) {
      toast.error(isRTL ? 'يرجى إدخال عنوان الاختبار' : 'Please enter an exam title');
      setStep(1);
      return;
    }
    if (selectedQuestionIds.length === 0) {
      toast.error(isRTL ? 'يرجى تحديد سؤال واحد على الأقل' : 'Please select at least one question');
      setStep(2);
      return;
    }

    setIsSubmitting(true);

    const getDifficultyEnum = (mix) => {
      if (mix === 'Easy Only') return 'easy';
      if (mix === 'Medium Only') return 'medium';
      if (mix === 'Hard Only') return 'hard';
      return 'mixed';
    };

    const payload = {
      title: examTitle,
      subject: selectedSubjectId,
      subjectId: selectedSubjectId,
      questionIds: selectedQuestionIds,
      questions: selectedQuestionIds,
      hasTimer: enableTimer,
      durationMinutes: enableTimer ? duration : 0,
      duration: enableTimer ? duration : 0,
      difficulty: getDifficultyEnum(difficultyMix),
      difficultyMix: difficultyMix,
      showExplanations: showExplanations,
      allowRetake: allowRetake,
      isPublished: true
    };

    const loadingToast = toast.loading(isRTL ? 'جاري نشر الاختبار...' : 'Publishing exam...');
    try {
      await dispatch(createExam(payload)).unwrap();
      toast.success(isRTL ? 'تم نشر الاختبار بنجاح!' : 'Exam published successfully!', { id: loadingToast });
      setIsSubmitting(false);
      navigate(`/teacher/subjects/${selectedSubjectId}`);
    } catch (err) {
      setIsSubmitting(false);
      toast.error(err || (isRTL ? 'فشل نشر الاختبار' : 'Failed to publish exam'), { id: loadingToast });
    }
  };

  const currentSubjectObj = subjects.find(s => (s._id || s.id) === selectedSubjectId) || { title: 'Unknown Subject' };

  return (
    <DashboardLayout
      role="teacher"
      activeTab="subjects"
      title={isRTL ? "إنشاء اختبار" : "Create Exam"}
      subtitle={isRTL ? `الخطوة ${step} من 3` : `Step ${step} of 3`}
    >
      <div className="w-full max-w-full p-6 md:p-8 pb-32 text-start flex flex-col gap-6 animate-fade-in">
        
        {/* Wizard Header Bar */}
        <div className="flex justify-between items-center pb-2 border-b border-gray-800/40">
          <div className="flex items-center">
            <button 
              onClick={() => {
                if (step > 1) setStep(step - 1);
                else {
                  const targetId = (subjectId === 'select' ? selectedSubjectId : subjectId) || '';
                  navigate(targetId ? `/teacher/subjects/${targetId}` : '/teacher/subjects');
                }
              }}
              className={`w-10 h-10 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 flex items-center justify-center text-slate-800 dark:text-white transition-all cursor-pointer ${isRTL ? 'ml-3' : 'mr-3'}`}
            >
              <FiChevronLeft size={20} className={isRTL ? 'rotate-180' : ''} />
            </button>
            <div className="text-start">
              <h2 className="text-2xl md:text-3xl font-black text-white">{isRTL ? "إنشاء اختبار" : "Create Exam"}</h2>
              <p className="text-sm text-gray-500 font-semibold mt-1">{isRTL ? `الخطوة ${step} من 3` : `Step ${step} of 3`}</p>
            </div>
          </div>

          <button 
            onClick={() => {
              toast.success(isRTL ? 'تم حفظ المسودة بنجاح!' : 'Draft saved successfully!');
              const targetId = (subjectId === 'select' ? selectedSubjectId : subjectId) || '';
              navigate(targetId ? `/teacher/subjects/${targetId}` : '/teacher/subjects');
            }}
            className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-all text-sm font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <FiFileText size={14} />
            <span>{isRTL ? "حفظ كمسودة" : "Save Draft"}</span>
          </button>
        </div>

        {/* Step Indicator Circles */}
        <div className="flex items-center justify-between max-w-md mx-auto w-full my-4 px-4">
          {/* Step 1: Basic Info */}
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step === 1 ? 'bg-blue-600 text-white ring-4 ring-blue-500/20' :
              step > 1 ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-500'
            }`}>
              {step > 1 ? <FiCheck size={14} /> : '1'}
            </div>
            <span className={`text-xs font-black uppercase tracking-wider ${
              step === 1 ? 'text-blue-500' :
              step > 1 ? 'text-emerald-400' : 'text-gray-500'
            }`}>{isRTL ? "المعلومات الأساسية" : "Basic Info"}</span>
          </div>

          {/* Line 1 */}
          <div className={`flex-1 h-0.5 mx-2 transition-all ${
            step > 1 ? 'bg-emerald-500' : 'bg-gray-800'
          }`} />

          {/* Step 2: Questions */}
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step === 2 ? 'bg-blue-600 text-white ring-4 ring-blue-500/20' :
              step > 2 ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-500'
            }`}>
              {step > 2 ? <FiCheck size={14} /> : '2'}
            </div>
            <span className={`text-xs font-black uppercase tracking-wider ${
              step === 2 ? 'text-blue-500' :
              step > 2 ? 'text-emerald-400' : 'text-gray-500'
            }`}>{isRTL ? "الأسئلة" : "Questions"}</span>
          </div>

          {/* Line 2 */}
          <div className={`flex-1 h-0.5 mx-2 transition-all ${
            step > 2 ? 'bg-emerald-500' : 'bg-gray-800'
          }`} />

          {/* Step 3: Settings */}
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step === 3 ? 'bg-blue-600 text-white ring-4 ring-blue-500/20' : 'bg-gray-800 text-gray-500'
            }`}>
              3
            </div>
            <span className={`text-xs font-black uppercase tracking-wider ${
              step === 3 ? 'text-blue-500' : 'text-gray-500'
            }`}>{isRTL ? "الإعدادات" : "Settings"}</span>
          </div>
        </div>

        {/* STEP CONTENT SWITCH */}
        <div className="w-full flex flex-col gap-6 mt-4">
          
          {/* STEP 1: BASIC INFO */}
          {step === 1 && (
            <div className="flex flex-col gap-6 animate-fade-in text-start">
              
              {/* Exam Title Text Input */}
              <Input
                name="title"
                type="text"
                label={isRTL ? "عنوان الاختبار" : "Exam Title"}
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                placeholder={isRTL ? "عنوان الاختبار" : "Exam Title"}
                icon={FiFileText}
                roleColor="teacher"
              />

              {/* Subject Selectors */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black tracking-widest text-gray-500 uppercase px-1">
                    {isRTL ? "المادة" : "Subject"}
                  </span>
                  {!selectedSubjectId && subjects.length > 0 && (
                    <span className="text-xs text-amber-400 font-bold px-1 animate-pulse">
                      {isRTL ? "⚠️ يرجى تحديد مادة للاختبار" : "⚠️ Please select a subject"}
                    </span>
                  )}
                </div>
                {subjects.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-[#0e101a] border border-gray-800/80 flex items-center gap-4 text-start">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <FiBookOpen size={20} />
                    </div>
                    <div>
                      <h5 className="text-sm font-extrabold text-white">
                        {isRTL ? "لا توجد مواد مسندة" : "No Assigned Subjects"}
                      </h5>
                      <p className="text-xs text-gray-400 font-semibold mt-0.5">
                        {isRTL ? "لم يتم العثور على أي مواد مسندة لحسابك. يرجى التواصل مع مسؤول النظام لتعيين المواد." : "No assigned subjects found. Please contact the administrator to assign subjects to your account."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2.5">
                    {subjects.map((sub) => {
                      const subId = sub._id || sub.id;
                      const isSelected = selectedSubjectId === subId;
                      return (
                        <button
                          key={subId}
                          type="button"
                          onClick={() => setSelectedSubjectId(subId)}
                          className={`px-5 py-3 rounded-2xl font-bold text-base border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/10'
                              : 'bg-[#0e101a] border-gray-800 text-gray-400 hover:border-gray-700'
                          }`}
                        >
                          {sub.title || sub.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Difficulty Mix Selectors */}
              <div className="flex flex-col gap-3">
                <span className="text-sm font-black tracking-widest text-gray-500 uppercase px-1">
                  {isRTL ? "مزيج الصعوبة" : "Difficulty Mix"}
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    { key: 'Mixed', label: isRTL ? 'مختلط' : 'Mixed', count: totalSubjectCount },
                    { key: 'Easy Only', label: isRTL ? 'سهل فقط' : 'Easy Only', count: easyCount },
                    { key: 'Medium Only', label: isRTL ? 'متوسط فقط' : 'Medium Only', count: mediumCount },
                    { key: 'Hard Only', label: isRTL ? 'صعب فقط' : 'Hard Only', count: hardCount }
                  ].map((mixObj) => {
                    const isSelected = difficultyMix === mixObj.key;
                    return (
                      <button
                        key={mixObj.key}
                        type="button"
                        onClick={() => setDifficultyMix(mixObj.key)}
                        className={`px-5 py-3 rounded-2xl font-bold text-base border transition-all cursor-pointer flex items-center gap-2.5 ${
                          isSelected
                            ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/10'
                            : 'bg-[#0e101a] border-gray-800 text-gray-400 hover:border-gray-700'
                        }`}
                      >
                        <span>{mixObj.label}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-black transition-all ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-800 text-gray-400'
                        }`}>
                          {mixObj.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question Count Incrementer */}
              <div className="flex flex-col gap-3">
                <span className="text-sm font-black tracking-widest text-gray-500 uppercase px-1">
                  {isRTL ? "عدد الأسئلة" : "Number of Questions"}
                </span>
                <div className="flex items-center justify-between p-4 bg-[#0e101a] border border-gray-800 rounded-2xl max-w-sm">
                  <button
                    type="button"
                    onClick={() => setQuestionCount(Math.max(5, questionCount - 1))}
                    className="w-10 h-10 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-gray-900 dark:hover:bg-gray-800 border border-slate-300 dark:border-gray-800 flex items-center justify-center text-slate-900 dark:text-white active:scale-95 transition-all cursor-pointer font-black text-xl shadow-sm"
                  >
                    -
                  </button>
                  <div className="text-center select-none">
                    <span className="text-2xl font-black text-white">{questionCount}</span>
                    <p className="text-xs text-gray-500 font-bold mt-0.5">{isRTL ? "الحد الأدنى: 5 • الحد الأقصى: 100" : "min: 5 • max: 100"}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuestionCount(Math.min(100, questionCount + 1))}
                    className="w-10 h-10 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-gray-900 dark:hover:bg-gray-800 border border-slate-300 dark:border-gray-800 flex items-center justify-center text-slate-900 dark:text-white active:scale-95 transition-all cursor-pointer font-black text-xl shadow-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Continue button */}
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedSubjectId) {
                      toast.error(isRTL ? 'يرجى تحديد مادة أولاً للمتابعة' : 'Please select a subject first to continue');
                      return;
                    }
                    if (!examTitle.trim()) {
                      toast.error(isRTL ? 'يرجى إدخال عنوان الاختبار' : 'Please enter an exam title');
                      return;
                    }
                    setStep(2);
                  }}
                  className={`px-8 py-3.5 rounded-2xl font-black flex items-center justify-center gap-2 transition-all duration-300 text-base ${
                    !selectedSubjectId || !examTitle.trim()
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-60'
                      : 'bg-[#2563eb] hover:bg-blue-500 text-white shadow-[0_4px_20px_rgba(37,99,235,0.25)] active:scale-95 cursor-pointer'
                  }`}
                >
                  <span>{isRTL ? "متابعة" : "Continue"}</span>
                  <FiArrowRight size={16} className={isRTL ? 'rotate-180' : ''} />
                </button>
              </div>

            </div>
          )}

          {/* STEP 2: QUESTIONS LIST SELECTION */}
          {step === 2 && (
            <div className="flex flex-col gap-6 animate-fade-in text-start">
              
              {/* Information & Active Filters Banner */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                <div className="flex items-center gap-3 text-blue-400 text-sm font-semibold">
                  <FiInfo size={18} className="shrink-0" />
                  <span>{isRTL ? "اختر الأسئلة المناسبة للاختبار بناءً على الفلاتر المحددة" : "Select questions based on your configured filters"}</span>
                </div>
                
                {/* Active filter badges */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400">
                    {currentSubjectObj.title || currentSubjectObj.name || (isRTL ? 'المادة' : 'Subject')}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    {difficultyMix === 'Mixed' ? (isRTL ? 'مختلط' : 'Mixed') :
                     difficultyMix === 'Easy Only' ? (isRTL ? 'سهل فقط' : 'Easy Only') :
                     difficultyMix === 'Medium Only' ? (isRTL ? 'متوسط فقط' : 'Medium Only') :
                     (isRTL ? 'صعب فقط' : 'Hard Only')}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    {isRTL ? `الحد الأقصى: ${questionCount} أسئلة` : `Limit: ${questionCount} Qs Max`}
                  </span>
                </div>
              </div>

              {/* Search Bar for Questions (Arabic & English) */}
              <div className="relative w-full">
                <div className={`absolute inset-y-0 flex items-center px-4 pointer-events-none text-gray-400 ${isRTL ? 'right-0' : 'left-0'}`}>
                  <FiSearch size={18} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('teacher.exams.searchQuestions') || (isRTL ? "البحث في الأسئلة بالنص..." : "Search questions by text...")}
                  className={`w-full py-3.5 ${isRTL ? 'pr-11 pl-10' : 'pl-11 pr-10'} bg-[#0e101a] border border-gray-800 focus:border-blue-500 rounded-2xl text-white font-semibold placeholder:text-gray-500 outline-none transition-all`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className={`absolute inset-y-0 flex items-center px-3 text-gray-400 hover:text-white cursor-pointer ${isRTL ? 'left-0' : 'right-0'}`}
                  >
                    <FiX size={18} />
                  </button>
                )}
              </div>

              {/* Question list controls & Progress limit indicator */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0e101a] p-3.5 border border-gray-800 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <span className={`px-3 py-1 rounded-xl font-extrabold text-sm border ${
                    selectedQuestionIds.length >= questionCount 
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                      : 'bg-blue-600/20 text-blue-400 border-blue-600/30'
                  }`}>
                    {selectedQuestionIds.length} / {questionCount}
                  </span>
                  <span className="text-sm font-bold text-gray-400">
                    {isRTL ? 'أسئلة محدودة محددة' : 'Questions selected'}
                    {selectedQuestionIds.length >= questionCount && (
                      <span className="text-amber-400 font-extrabold text-xs mx-2">
                        ({isRTL ? 'وصلت للحد الأقصى' : 'Max Limit Reached'})
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm font-black">
                  <button 
                    onClick={handleSelectAll}
                    className="text-blue-500 hover:text-blue-400 cursor-pointer"
                  >
                    {isRTL ? "تحديد الكل" : "Select All"}
                  </button>
                  <span className="text-gray-700">•</span>
                  <button 
                    onClick={handleDeselectAll}
                    className="text-red-500 hover:text-red-400 cursor-pointer"
                  >
                    {isRTL ? "إلغاء تحديد الكل" : "Deselect All"}
                  </button>
                </div>
              </div>

              {/* Questions checkboxes grid */}
              {filteredQuestions.length === 0 ? (
                <div className="p-12 text-center bg-[#0c0d19]/40 border border-gray-800/80 rounded-[2rem] flex flex-col items-center justify-center">
                  <FiHelpCircle className="text-gray-655 mb-3" size={40} />
                  <span className="text-base font-extrabold text-gray-500">{isRTL ? "لا توجد أسئلة متاحة" : "No questions available"}</span>
                  <p className="text-sm text-gray-655 font-semibold mt-1">{isRTL ? "يرجى إضافة أسئلة إلى هذه المادة أولاً" : "Please add questions to this subject first"}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredQuestions.map((q) => {
                    const isChecked = selectedQuestionIds.includes(q.id);
                    return (
                      <div
                        key={q.id}
                        onClick={() => handleToggleQuestion(q.id)}
                        className={`p-4 bg-[#0e101a] border rounded-2xl flex items-center gap-4 cursor-pointer transition-all ${
                          isChecked 
                            ? 'border-blue-600 bg-blue-500/[0.02]' 
                            : 'border-gray-800 hover:border-gray-750'
                        }`}
                      >
                        {/* Checkbox box */}
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                          isChecked ? 'bg-blue-600 text-white' : 'border-2 border-gray-700'
                        }`}>
                          {isChecked && <FiCheck size={12} />}
                        </div>

                        {/* Question title & badges */}
                        <div className="flex-1 min-w-0 text-start">
                          <p className="text-base font-bold text-white truncate">
                            {(isRTL && q.textAr) ? q.textAr : (q.text || q.textAr || q.questionText)}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase">
                              {isRTL ? "اختيار من متعدد" : "MCQ"}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-xs font-black uppercase border ${
                              (q.difficulty || '').toLowerCase() === 'easy' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                              (q.difficulty || '').toLowerCase() === 'medium' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                              'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}>
                              {(q.difficulty || '').toLowerCase() === 'easy' ? (isRTL ? 'سهل' : 'Easy') : (q.difficulty || '').toLowerCase() === 'medium' ? (isRTL ? 'متوسط' : 'Medium') : (isRTL ? 'صعب' : 'Hard')}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bottom nav triggers */}
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="w-14 h-14 bg-slate-200 hover:bg-slate-300 dark:bg-gray-900 dark:hover:bg-gray-800 text-slate-900 dark:text-white rounded-2xl flex items-center justify-center border border-slate-300 dark:border-gray-800/80 active:scale-95 transition-all cursor-pointer shrink-0 shadow-sm"
                >
                  <FiArrowLeft size={18} className={isRTL ? 'rotate-180' : ''} />
                </button>
                <button
                  onClick={() => {
                    if (selectedQuestionIds.length === 0) {
                      toast.error(isRTL ? 'يرجى تحديد سؤال واحد على الأقل' : 'Please select at least one question');
                      return;
                    }
                    setStep(3);
                  }}
                  className="px-8 py-3.5 bg-[#2563eb] hover:bg-blue-500 text-white rounded-2xl font-black shadow-[0_4px_20px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2 active:scale-95 transition-all duration-300 cursor-pointer text-base"
                >
                  <span>{isRTL ? "متابعة" : "Continue"}</span>
                  <FiArrowRight size={16} className={isRTL ? 'rotate-180' : ''} />
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: EXAM SETTINGS */}
          {step === 3 && (
            <div className="flex flex-col gap-6 animate-fade-in text-start">
              
              {/* Section 1: Timer Settings */}
              <div className="flex flex-col gap-3">
                <span className="text-sm font-black tracking-widest text-gray-500 uppercase px-1">
                  {isRTL ? "إعدادات المؤقت" : "Timer Settings"}
                </span>
                <div className="p-4 bg-[#0e101a] border border-gray-800 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                      <FiClock size={18} />
                    </div>
                    <div className="text-start">
                      <span className="text-base font-black text-white block">{isRTL ? "تفعيل المؤقت" : "Enable Timer"}</span>
                      <span className="text-xs text-gray-500 font-semibold block mt-0.5">{isRTL ? "تحديد حد زمني للاختبار" : "Set a time limit for the exam"}</span>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => setEnableTimer(!enableTimer)}
                    className={`w-12 h-6.5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center ${
                      enableTimer ? 'bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)]' : 'bg-slate-300 dark:bg-gray-800 border border-slate-400 dark:border-transparent'
                    }`}
                  >
                    <div className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transition-transform ${
                      enableTimer ? (isRTL ? '-translate-x-5.5' : 'translate-x-5.5') : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Section 2: Duration Selector */}
              {enableTimer && (
                <div className="flex flex-col gap-3 animate-fade-in text-start">
                  <span className="text-sm font-black tracking-widest text-gray-500 uppercase px-1">
                    {isRTL ? "المدة (بالدقائق)" : "Duration (minutes)"}
                  </span>
                  <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-[#0e101a] border border-slate-300 dark:border-gray-800 rounded-2xl max-w-sm">
                    <button
                      type="button"
                      onClick={() => setDuration(Math.max(10, duration - 5))}
                      className="w-10 h-10 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-gray-900 dark:hover:bg-gray-800 border border-slate-300 dark:border-gray-800 flex items-center justify-center text-slate-900 dark:text-white active:scale-95 transition-all cursor-pointer font-black text-xl shadow-sm"
                    >
                      -
                    </button>
                    <div className="text-center select-none">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">{duration}</span>
                      <p className="text-xs text-gray-500 font-bold mt-0.5">{isRTL ? "الحد الأدنى: 10 • الحد الأقصى: 180" : "min: 10 • max: 180"}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDuration(Math.min(180, duration + 5))}
                      className="w-10 h-10 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-gray-900 dark:hover:bg-gray-800 border border-slate-300 dark:border-gray-800 flex items-center justify-center text-slate-900 dark:text-white active:scale-95 transition-all cursor-pointer font-black text-xl shadow-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Section 3: Exam Behavior */}
              <div className="flex flex-col gap-3 text-start">
                <span className="text-xs font-black tracking-widest text-gray-500 uppercase px-1">
                  {isRTL ? "سلوك الاختبار" : "Exam Behavior"}
                </span>
                
                {/* Show Explanations Toggle */}
                <div className="p-4 bg-slate-100 dark:bg-[#0e101a] border border-slate-300 dark:border-gray-800 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                      <FiHelpCircle size={18} />
                    </div>
                    <div className="text-start">
                      <span className="text-sm font-black text-slate-900 dark:text-white block">{isRTL ? "إظهار الشروحات" : "Show Explanations"}</span>
                      <span className="text-[10px] text-gray-500 font-semibold block mt-0.5">{isRTL ? "إظهار الشرح بعد الإجابات الخاطئة" : "Show explanation after wrong answers"}</span>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => setShowExplanations(!showExplanations)}
                    className={`w-12 h-6.5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center ${
                      showExplanations ? 'bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)]' : 'bg-slate-300 dark:bg-gray-800 border border-slate-400 dark:border-transparent'
                    }`}
                  >
                    <div className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transition-transform ${
                      showExplanations ? (isRTL ? '-translate-x-5.5' : 'translate-x-5.5') : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Allow Retake Toggle */}
                <div className="p-4 bg-slate-100 dark:bg-[#0e101a] border border-slate-300 dark:border-gray-800 rounded-2xl flex items-center justify-between mt-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-500 shrink-0">
                      <FiSettings size={18} />
                    </div>
                    <div className="text-start">
                      <span className="text-base font-black text-slate-900 dark:text-white block">{isRTL ? "السماح بإعادة الاختبار" : "Allow Retake"}</span>
                      <span className="text-xs text-gray-500 font-semibold block mt-0.5">{isRTL ? "يمكن للطلاب إعادة هذا الاختبار" : "Students can retake this exam"}</span>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => setAllowRetake(!allowRetake)}
                    className={`w-12 h-6.5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center ${
                      allowRetake ? 'bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)]' : 'bg-slate-300 dark:bg-gray-800 border border-slate-400 dark:border-transparent'
                    }`}
                  >
                    <div className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transition-transform ${
                      allowRetake ? (isRTL ? '-translate-x-5.5' : 'translate-x-5.5') : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Summary Card Preview */}
              <div className="p-5 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white preserve-white border border-blue-400/30 rounded-[2rem] shadow-xl flex flex-col gap-4 relative overflow-hidden mt-4 text-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-white preserve-white shadow-inner shrink-0 backdrop-blur-md">
                    <FiFileText size={22} />
                  </div>
                  <div className="text-start">
                    <h4 className="text-lg font-extrabold text-white preserve-white leading-tight capitalize">
                      {examTitle || (isRTL ? 'اختبار بدون عنوان' : 'Untitled Exam')}
                    </h4>
                    <span className="text-xs text-blue-100 preserve-white-sub font-bold uppercase tracking-wider mt-0.5 block">
                      {currentSubjectObj.title || currentSubjectObj.name}
                    </span>
                  </div>
                </div>

                {/* Summary Metadata Pills */}
                <div className="flex flex-wrap gap-2 pt-3 border-t border-white/20">
                  <span className="px-3 py-1 rounded-full bg-white/15 border border-white/25 text-white preserve-white text-xs font-black uppercase backdrop-blur-md">
                    {selectedQuestionIds.length} {isRTL ? 'محدد' : 'Selected'}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/15 border border-white/25 text-white preserve-white text-xs font-black uppercase backdrop-blur-md">
                    {enableTimer ? `${duration} ${isRTL ? 'دقيقة' : 'minutes'}` : (isRTL ? 'بدون مؤقت' : 'No Timer')}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/15 border border-white/25 text-white preserve-white text-xs font-black uppercase backdrop-blur-md">
                    {difficultyMix === 'Mixed' ? (isRTL ? 'مختلط' : 'Mixed') :
                     difficultyMix === 'Easy Only' ? (isRTL ? 'سهل فقط' : 'Easy Only') :
                     difficultyMix === 'Medium Only' ? (isRTL ? 'متوسط فقط' : 'Medium Only') :
                     (isRTL ? 'صعب فقط' : 'Hard Only')}
                  </span>
                  {showExplanations && (
                    <span className="px-3 py-1 rounded-full bg-white/15 border border-white/25 text-white preserve-white text-xs font-black uppercase backdrop-blur-md">
                      {isRTL ? 'الشروحات' : 'Explanations'}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Nav triggers */}
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="w-14 h-14 bg-slate-200 hover:bg-slate-300 dark:bg-gray-900 dark:hover:bg-gray-800 text-slate-900 dark:text-white rounded-2xl flex items-center justify-center border border-slate-300 dark:border-gray-800/80 active:scale-95 transition-all cursor-pointer shrink-0 shadow-sm"
                >
                  <FiArrowLeft size={18} className={isRTL ? 'rotate-180' : ''} />
                </button>
                <button
                  onClick={handlePublishExam}
                  disabled={isSubmitting}
                  className="px-8 py-3.5 bg-[#2563eb] hover:bg-blue-500 text-white rounded-2xl font-black shadow-[0_4px_20px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2 active:scale-95 transition-all duration-300 cursor-pointer text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{isSubmitting ? (isRTL ? 'جاري النشر...' : 'Publishing...') : (isRTL ? 'نشر الاختبار' : 'Publish Exam')}</span>
                  <FiCheck size={16} />
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </DashboardLayout>
  );
};

export default CreateExam;
