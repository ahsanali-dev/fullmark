import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FiChevronLeft,
  FiSmile,
  FiMeh,
  FiFrown,
  FiHelpCircle,
  FiChevronDown,
  FiImage,
  FiList,
  FiInfo,
  FiCheck,
  FiPlayCircle,
  FiPlus,
  FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';

import DashboardLayout from '../../components/layout/DashboardLayout';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTeacherSubjects,
  fetchQuestions,
  updateQuestion,
  uploadQuestionImage,
  fetchWeaknessTopics,
  approveQuestion,
  generateVariants,
  fetchVariantsStatus
} from '../../redux/slices/teacherSlice';
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

const EditQuestion = () => {
  const navigate = useNavigate();
  const { subjectId, questionId } = useParams();
  const { t, isRTL } = useLanguage();

  const fileInputRef = useRef(null);
  const optionFileInputRef = useRef(null);

  const [uploadingForOption, setUploadingForOption] = useState(null);
  const [optionImages, setOptionImages] = useState({
    A: null,
    B: null,
    C: null,
    D: null
  });

  const dispatch = useDispatch();
  const { subjects = [], questions = [], weaknessTopics = [], variantsStatus, isLoading } = useSelector((state) => state.teacher);

  useEffect(() => {
    dispatch(fetchTeacherSubjects());
    dispatch(fetchQuestions());
    if (subjectId) {
      dispatch(fetchWeaknessTopics(subjectId));
    }
    if (questionId) {
      dispatch(fetchVariantsStatus(questionId));
    }
  }, [dispatch, subjectId, questionId]);

  const subject = subjects.find((sub) => (sub._id || sub.id) === subjectId) || { name: 'Unknown Subject' };
  const existingQuestion = questions.find((q) => (q._id || q.id) === questionId);

  // States
  const [difficulty, setDifficulty] = useState('Easy');
  const [activeAccordion, setActiveAccordion] = useState('question');
  const [questionText, setQuestionText] = useState('');
  const [optionsData, setOptionsData] = useState({
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: ''
  });
  const [correctOption, setCorrectOption] = useState('B');
  const [explanation, setExplanation] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [weaknessTopicId, setWeaknessTopicId] = useState('');
  const [useGeneralVideo, setUseGeneralVideo] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isGeneratingVariants, setIsGeneratingVariants] = useState(false);

  // image = base64 preview; imageFile = new File chosen by user (null = no new file chosen)
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [optionImageFiles, setOptionImageFiles] = useState({ A: null, B: null, C: null, D: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate data when existingQuestion is fetched
  useEffect(() => {
    if (existingQuestion) {
      const rawDiff = existingQuestion.difficulty || 'easy';
      setDifficulty(rawDiff.charAt(0).toUpperCase() + rawDiff.slice(1).toLowerCase());
      setQuestionText(existingQuestion.text || '');
      
      const opts = existingQuestion.options || [];
      setOptionsData({
        optionA: opts[0] || existingQuestion.optionA || '',
        optionB: opts[1] || existingQuestion.optionB || '',
        optionC: opts[2] || existingQuestion.optionC || '',
        optionD: opts[3] || existingQuestion.optionD || ''
      });

      const optionMapRev = { 0: 'A', 1: 'B', 2: 'C', 3: 'D' };
      const correctIdxKey = typeof existingQuestion.correctOption === 'number' 
        ? optionMapRev[existingQuestion.correctOption] 
        : existingQuestion.correctOption;
      setCorrectOption(correctIdxKey || 'B');

      setExplanation(existingQuestion.explanation || '');
      setVideoUrl(existingQuestion.videoUrl || '');
      setImage(existingQuestion.image || null);
      setWeaknessTopicId(existingQuestion.weaknessTopic?._id || existingQuestion.weaknessTopic || '');
      setUseGeneralVideo(!!existingQuestion.useGeneralVideo);
      setIsApproved(!!existingQuestion.isApproved);

      const optImgs = existingQuestion.optionImages || [];
      setOptionImages({
        A: optImgs[0] || null,
        B: optImgs[1] || null,
        C: optImgs[2] || null,
        D: optImgs[3] || null
      });
    }
  }, [existingQuestion]);

  const handleApprove = async () => {
    const loadingToast = toast.loading(isRTL ? 'جاري الموافقة على السؤال...' : 'Approving question...');
    try {
      await dispatch(approveQuestion(questionId)).unwrap();
      setIsApproved(true);
      toast.success(isRTL ? 'تمت الموافقة على السؤال!' : 'Question approved!', { id: loadingToast });
      dispatch(fetchQuestions());
    } catch (err) {
      toast.error(err || (isRTL ? 'فشلت الموافقة على السؤال' : 'Failed to approve question'), { id: loadingToast });
    }
  };

  const handleGenerateVariantsAction = async () => {
    setIsGeneratingVariants(true);
    const loadingToast = toast.loading(isRTL ? 'جاري بدء توليد النماذج الذكية...' : 'Triggering AI variant generation...');
    try {
      const res = await dispatch(generateVariants(questionId)).unwrap();
      toast.success(res.message || (isRTL ? 'بدأ توليد النماذج!' : 'Variant generation started!'), { id: loadingToast });
      dispatch(fetchVariantsStatus(questionId));
    } catch (err) {
      setIsGeneratingVariants(false);
      toast.error(err || (isRTL ? 'فشل توليد النماذج' : 'Failed to trigger variant generation'), { id: loadingToast });
    }
  };

  // Auto-poll variant generation status while status is pending
  const currentVariantStatus = variantsStatus?.variantGeneration?.status || variantsStatus?.status;
  useEffect(() => {
    if (currentVariantStatus === 'pending') {
      setIsGeneratingVariants(true);
      const interval = setInterval(() => {
        dispatch(fetchVariantsStatus(questionId));
        dispatch(fetchQuestions());
      }, 4000);
      return () => clearInterval(interval);
    } else {
      setIsGeneratingVariants(false);
    }
  }, [currentVariantStatus, dispatch, questionId]);

  // Handle errors or missing questions after loading
  useEffect(() => {
    if (!isLoading && questions.length > 0 && !existingQuestion) {
      toast.error(isRTL ? 'السؤال غير موجود' : 'Question not found');
      navigate(`/teacher/subjects/${subjectId}`);
    }
  }, [isLoading, questions, existingQuestion, subjectId, navigate, isRTL]);

  // Image handlers — store File + generate base64 preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => { setImage(reader.result); };
      reader.readAsDataURL(file);
      toast.success(isRTL ? 'تم تحديد الصورة!' : 'Image selected!');
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.success(isRTL ? 'تمت إزالة الصورة بنجاح!' : 'Image removed successfully!');
  };

  // Option Image Handlers
  const handleOptionImageChange = (e) => {
    const file = e.target.files[0];
    if (file && uploadingForOption) {
      const letter = uploadingForOption;
      setOptionImageFiles(prev => ({ ...prev, [letter]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setOptionImages(prev => ({ ...prev, [letter]: reader.result }));
        toast.success(isRTL ? `تم إضافة صورة للخيار ${letter}!` : `Image added to Option ${letter}!`);
        setUploadingForOption(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOptionImageClick = (letter) => {
    setUploadingForOption(letter);
    setTimeout(() => { optionFileInputRef.current?.click(); }, 50);
  };

  const handleRemoveOptionImage = (letter) => {
    setOptionImages(prev => ({ ...prev, [letter]: null }));
    setOptionImageFiles(prev => ({ ...prev, [letter]: null }));
    toast.success(isRTL ? `تمت إزالة الصورة من الخيار ${letter}` : `Image removed from Option ${letter}`);
  };

  // Save changes handler
  const handleSaveQuestion = async () => {
    if (!questionText.trim()) {
      toast.error(isRTL ? 'نص السؤال مطلوب' : 'Question text is required');
      setActiveAccordion('question');
      return;
    }
    if (!optionsData.optionA.trim() || !optionsData.optionB.trim() || !optionsData.optionC.trim() || !optionsData.optionD.trim()) {
      toast.error(isRTL ? 'يرجى ملء جميع الخيارات (أ، ب، ج، د)' : 'Please fill in all options (A, B, C, D)');
      setActiveAccordion('options');
      return;
    }
    if (!correctOption) {
      toast.error(isRTL ? 'يرجى تحديد الخيار الصحيح' : 'Please select the correct option');
      setActiveAccordion('options');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading(isRTL ? 'جاري رفع الصور...' : 'Uploading images...');

    try {
      // Upload new question image if user chose a new file
      let finalImagePath = image;
      if (imageFile) {
        try {
          finalImagePath = await dispatch(uploadQuestionImage(imageFile)).unwrap();
        } catch {
          toast.error(isRTL ? 'فشل رفع صورة السؤال' : 'Failed to upload question image', { id: loadingToast });
          setIsSubmitting(false);
          return;
        }
      }

      // Upload any new option image files
      const currentOptPaths = [
        optionImages.A,
        optionImages.B,
        optionImages.C,
        optionImages.D,
      ];
      const optionLetters = ['A', 'B', 'C', 'D'];
      for (let i = 0; i < optionLetters.length; i++) {
        const letter = optionLetters[i];
        if (optionImageFiles[letter]) {
          try {
            currentOptPaths[i] = await dispatch(uploadQuestionImage(optionImageFiles[letter])).unwrap() || '';
          } catch {
            currentOptPaths[i] = optionImages[letter] || '';
          }
        }
      }

      toast.loading(isRTL ? 'جاري تحديث السؤال...' : 'Updating question...', { id: loadingToast });

      const optionMap = { A: 0, B: 1, C: 2, D: 3 };
      const correctIdx = optionMap[correctOption] ?? 0;

      const payload = {
        subjectId: subjectId,
        text: questionText,
        options: [
          optionsData.optionA,
          optionsData.optionB,
          optionsData.optionC,
          optionsData.optionD
        ],
        correctOption: correctIdx,
        difficulty: difficulty.toLowerCase(),
        explanation: explanation,
        videoUrl: videoUrl,
        image: finalImagePath || null,
        optionImages: currentOptPaths.map(p => p || ''),
        weaknessTopic: weaknessTopicId || null,
        useGeneralVideo: !!useGeneralVideo,
      };

      await dispatch(updateQuestion({ id: questionId, questionData: payload })).unwrap();
      toast.success(isRTL ? 'تم تحديث السؤال بنجاح!' : 'Question updated successfully!', { id: loadingToast });
      setIsSubmitting(false);
      navigate(`/teacher/subjects/${subjectId}`);
    } catch (err) {
      setIsSubmitting(false);
      toast.error(err || (isRTL ? 'فشل تحديث السؤال' : 'Failed to update question'), { id: loadingToast });
    }
  };

  return (
    <DashboardLayout
      role="teacher"
      activeTab="subjects"
      title={isRTL ? "تعديل السؤال" : "Edit Question"}
      subtitle={isRTL ? `المادة: ${subject.name || subject.title}` : `Subject: ${subject.name || subject.title}`}
    >
      <div className="w-full max-w-full p-6 md:p-8 pb-32 text-start flex flex-col gap-6 animate-fade-in">

        {/* Hidden file inputs — always mounted so refs never go null */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={optionFileInputRef}
          onChange={handleOptionImageChange}
          accept="image/*"
          className="hidden"
        />

        {/* Header Block */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-800/40">
          <div className="flex items-start sm:items-center gap-3">
            <button 
              onClick={() => navigate(`/teacher/subjects/${subjectId}`)}
              className={`w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer shrink-0 ${isRTL ? 'ml-1' : 'mr-1'}`}
            >
              <FiChevronLeft size={20} className={isRTL ? 'rotate-180' : ''} />
            </button>
            <div className="text-start flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white">
                  {isRTL ? "تعديل السؤال" : "Edit Question"}
                </h2>
                {isApproved ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black flex items-center gap-1 shrink-0 whitespace-nowrap">
                    <FiCheck size={14} /> {isRTL ? "تمت الموافقة" : "Approved"}
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black shrink-0 whitespace-nowrap">
                    {isRTL ? "قيد الانتظار" : "Pending Approval"}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 font-semibold mt-1">
                {isRTL ? `تعديل تفاصيل السؤال للمادة ${subject.name || subject.title}` : `Modify question details for ${subject.name || subject.title}`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {!isApproved && (
              <button
                type="button"
                onClick={handleApprove}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/20 whitespace-nowrap shrink-0"
              >
                <FiCheck size={16} /> <span>{isRTL ? "الموافقة على السؤال" : "Approve Question"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleGenerateVariantsAction}
              disabled={isGeneratingVariants}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-600/20 disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              <FiPlus size={16} /> <span>{isGeneratingVariants ? (isRTL ? "جاري التوليد..." : "Generating...") : (isRTL ? "توليد نماذج تدريبية" : "Generate Practice Variants")}</span>
            </button>

            {/* Difficulty Level Indicator */}
            <div className={`px-4 py-2.5 rounded-full text-xs font-black border flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              difficulty === 'Easy' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
              difficulty === 'Medium' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
              'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                difficulty === 'Easy' ? 'bg-emerald-400' :
                difficulty === 'Medium' ? 'bg-blue-400' :
                'bg-red-400'
              }`} />
              <span>{difficulty === 'Easy' ? (isRTL ? 'سهل' : 'Easy') : difficulty === 'Medium' ? (isRTL ? 'متوسط' : 'Medium') : (isRTL ? 'صعب' : 'Hard')}</span>
            </div>
          </div>
        </div>

        {/* AI Variants Status Card (if status returned) */}
        {(variantsStatus?.variantGeneration || variantsStatus?.status) && (() => {
          const vg = variantsStatus.variantGeneration || variantsStatus;
          const count = variantsStatus.variants?.length ?? vg.approvedCount ?? 0;
          const statusText = vg.status || 'none';
          if (statusText === 'none') return null;
          return (
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between text-start animate-fade-in">
              <div className="text-start">
                <span className="text-xs font-black text-purple-400 uppercase tracking-wider block">
                  {isRTL ? "حالة مولد النماذج الذكي" : "AI Variant Generator Status"}
                </span>
                <div className="text-sm font-bold text-white mt-1 flex flex-wrap items-center gap-2">
                  <span>{isRTL ? 'الحالة:' : 'Status:'}</span>
                  <span className={`capitalize px-2.5 py-0.5 rounded-full text-xs font-black ${
                    statusText === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    statusText === 'pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse' :
                    'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}>
                    {statusText === 'completed' ? (isRTL ? 'مكتمل' : 'Completed') :
                     statusText === 'pending' ? (isRTL ? 'جاري التوليد...' : 'Generating...') :
                     (isRTL ? 'فشل' : 'Failed')}
                  </span>
                  {count > 0 && (
                    <span className="text-purple-300 text-xs font-bold">
                      • {isRTL ? `تم توليد ${count} نماذج` : `${count} variants generated`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Weakness Topic Selector */}
        {weaknessTopics.length > 0 && (
          <div className="flex flex-col gap-2 text-start">
            <span className="text-xs font-black tracking-widest text-amber-500 uppercase px-1 flex items-center gap-1.5">
              <span>🎯</span> {isRTL ? "موضوع الضعف المستهدف (اختياري)" : "Target Weakness Topic (Optional)"}
            </span>
            <select
              value={weaknessTopicId}
              onChange={(e) => setWeaknessTopicId(e.target.value)}
              className="w-full p-4 bg-[#0e101a] border border-gray-800 focus:border-amber-500/50 rounded-2xl text-white font-semibold text-sm outline-none cursor-pointer"
            >
              <option value="">{isRTL ? "-- لا يوجد موضوع ضعف محدد --" : "-- No Specific Weakness Topic --"}</option>
              {weaknessTopics.map((topic) => (
                <option key={topic._id || topic.id} value={topic._id || topic.id}>
                  {topic.title} {topic.titleAr ? `(${topic.titleAr})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 1. Difficulty Level Selector */}
        <div className="flex flex-col gap-3 text-start">
          <span className="text-xs font-black tracking-widest text-gray-500 uppercase px-1">
            {isRTL ? "مستوى الصعوبة" : "Difficulty Level"}
          </span>
          <div className="grid grid-cols-3 gap-3">
            {/* Easy */}
            <div 
              onClick={() => setDifficulty('Easy')}
              className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer border transition-all ${
                difficulty === 'Easy' 
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                  : 'border-gray-800 bg-[#0e101a] text-gray-500 hover:border-gray-705'
              }`}
            >
              <FiSmile size={24} />
              <span className="text-sm font-bold">{isRTL ? "سهل" : "Easy"}</span>
            </div>
            {/* Medium */}
            <div 
              onClick={() => setDifficulty('Medium')}
              className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer border transition-all ${
                difficulty === 'Medium' 
                  ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
                  : 'border-gray-800 bg-[#0e101a] text-gray-500 hover:border-gray-705'
              }`}
            >
              <FiMeh size={24} />
              <span className="text-sm font-bold">{isRTL ? "متوسط" : "Medium"}</span>
            </div>
            {/* Hard */}
            <div 
              onClick={() => setDifficulty('Hard')}
              className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer border transition-all ${
                difficulty === 'Hard' 
                  ? 'border-red-500 bg-red-500/10 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.15)]' 
                  : 'border-gray-800 bg-[#0e101a] text-gray-500 hover:border-gray-705'
              }`}
            >
              <FiFrown size={24} />
              <span className="text-sm font-bold">{isRTL ? "صعب" : "Hard"}</span>
            </div>
          </div>
        </div>

        {/* 2. Accordions Section */}
        <div className="flex flex-col gap-4">
          
          {/* ACCORDION A: QUESTION TEXT */}
          <div className="flex flex-col">
            <div 
              onClick={() => setActiveAccordion(activeAccordion === 'question' ? '' : 'question')}
              className="flex items-center justify-between p-4 bg-[#0e101a] border border-gray-800/80 rounded-2xl cursor-pointer hover:bg-[#121424] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                  <FiHelpCircle size={18} />
                </div>
                <span className="text-base font-extrabold text-white">{isRTL ? "السؤال" : "Question"}</span>
              </div>
              <FiChevronDown className={`text-gray-500 transition-transform duration-300 ${activeAccordion === 'question' ? 'rotate-180' : ''}`} />
            </div>

            {activeAccordion === 'question' && (
              <div className="p-5 bg-[#0e101a]/50 border-x border-b border-gray-800/80 rounded-b-2xl -mt-2.5 flex flex-col gap-4 animate-fade-in text-start">
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder={isRTL ? "نص السؤال" : "Question Text"}
                  rows={4}
                  className="w-full bg-[#0e101a] border border-gray-800 rounded-2xl p-4 text-white text-base focus:outline-none focus:border-blue-500/50 resize-none font-semibold focus:ring-0 text-start"
                />

                {!image ? (
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 border border-dashed border-gray-800 hover:border-blue-500/50 bg-[#0e101a]/30 hover:bg-blue-500/5 text-gray-400 hover:text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <FiImage size={18} />
                    <span>{isRTL ? "إضافة صورة" : "Add Image"}</span>
                  </button>
                ) : (
                  <div className="relative rounded-2xl border border-gray-800 bg-[#0c0d19] overflow-hidden group max-w-full flex flex-col items-center p-4">
                    <img 
                      src={getImageUrl(image)} 
                      alt="Uploaded Question Visual" 
                      className="max-h-64 rounded-xl object-contain border border-gray-900 bg-black/20"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} w-8 h-8 rounded-full bg-red-600/90 hover:bg-red-600 hover:scale-105 active:scale-95 flex items-center justify-center text-white cursor-pointer transition-all shadow-lg`}
                      title={isRTL ? "إزالة الصورة" : "Remove Image"}
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ACCORDION B: ANSWER OPTIONS */}
          <div className="flex flex-col">
            <div 
              onClick={() => setActiveAccordion(activeAccordion === 'options' ? '' : 'options')}
              className="flex items-center justify-between p-4 bg-[#0e101a] border border-gray-800/80 rounded-2xl cursor-pointer hover:bg-[#121424] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                  <FiList size={18} />
                </div>
                <span className="text-base font-extrabold text-white">{isRTL ? "خيارات الإجابة" : "Answer Options"}</span>
              </div>
              <FiChevronDown className={`text-gray-500 transition-transform duration-300 ${activeAccordion === 'options' ? 'rotate-180' : ''}`} />
            </div>

            {activeAccordion === 'options' && (
              <div className="p-5 bg-[#0e101a]/50 border-x border-b border-gray-800/80 rounded-b-2xl -mt-2.5 flex flex-col gap-4 animate-fade-in text-start">
                <div className="flex items-center gap-3 p-3.5 bg-blue-500/5 border border-blue-500/20 rounded-2xl text-blue-400 text-sm font-semibold">
                  <FiInfo size={16} className="shrink-0" />
                  <span>{isRTL ? "انقر على الدائرة لتحديد الإجابة الصحيحة" : "Tap the circle to mark the correct answer"}</span>
                </div>

                <div className="flex flex-col gap-3">
                  {['A', 'B', 'C', 'D'].map((letter) => {
                    const optionKey = `option${letter}`;
                    const value = optionsData[optionKey];
                    const isCorrect = correctOption === letter;
                    const hasImage = !!optionImages[letter];
                    return (
                      <div key={letter} className="flex flex-col gap-2">
                        <div
                          className={`flex items-center gap-4 p-3.5 rounded-2xl border transition-all ${isCorrect
                              ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.05)]'
                              : 'border-gray-800/80 bg-[#0e101a]'
                            }`}
                        >
                          <button
                            type="button"
                            onClick={() => setCorrectOption(letter)}
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm shrink-0 cursor-pointer transition-all ${isCorrect
                                ? 'bg-emerald-500 text-white shadow-md'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-750'
                              }`}
                          >
                            {isCorrect ? <FiCheck size={14} /> : letter}
                          </button>

                          <input
                            type="text"
                            value={value}
                            onChange={(e) => setOptionsData({ ...optionsData, [optionKey]: e.target.value })}
                            placeholder={isRTL ? `الخيار ${letter}...` : `Option ${letter}...`}
                            className="w-full bg-transparent border-none text-white text-base font-semibold outline-none focus:outline-none focus:ring-0 text-start"
                          />

                          {/* Image upload button */}
                          <button
                            type="button"
                            onClick={() => handleOptionImageClick(letter)}
                            className={`p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer relative shrink-0 ${
                              hasImage ? 'text-blue-400' : 'text-gray-500 hover:text-white'
                            }`}
                            title={hasImage ? (isRTL ? "تغيير صورة الخيار" : "Change Option Image") : (isRTL ? "إضافة صورة للخيار" : "Add Image to Option")}
                          >
                            <FiImage size={18} />
                            {hasImage && (
                              <span className={`absolute top-1 ${isRTL ? 'left-1' : 'right-1'} w-2 h-2 bg-blue-500 rounded-full border border-gray-900`} />
                            )}
                          </button>

                          {isCorrect && (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-black uppercase shrink-0">
                              {isRTL ? "صحيح" : "Correct"}
                            </span>
                          )}
                        </div>

                        {/* Image Preview if attached */}
                        {hasImage && (
                          <div className={`${isRTL ? 'mr-11' : 'ml-11'} relative rounded-xl border border-gray-850 bg-[#0c0d19] overflow-hidden group max-w-full flex items-center p-2 self-start gap-3`}>
                            <img
                              src={getImageUrl(optionImages[letter])}
                              alt={`Option ${letter} Visual`}
                              className="max-h-20 rounded-lg object-contain bg-black/20"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveOptionImage(letter)}
                              className="w-6 h-6 rounded-full bg-red-600/90 hover:bg-red-600 flex items-center justify-center text-white cursor-pointer transition-all"
                              title={isRTL ? "إزالة الصورة" : "Remove Image"}
                            >
                              <FiX size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ACCORDION C: EXPLANATION & VIDEO */}
          <div className="flex flex-col">
            <div 
              onClick={() => setActiveAccordion(activeAccordion === 'explanation' ? '' : 'explanation')}
              className="flex items-center justify-between p-4 bg-[#0e101a] border border-gray-800/80 rounded-2xl cursor-pointer hover:bg-[#121424] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <FiPlayCircle size={18} />
                </div>
                <span className="text-base font-extrabold text-white">{isRTL ? "الشرح والفيديو" : "Explanation & Video"}</span>
              </div>
              <FiChevronDown className={`text-gray-500 transition-transform duration-300 ${activeAccordion === 'explanation' ? 'rotate-180' : ''}`} />
            </div>

            {activeAccordion === 'explanation' && (
              <div className="p-5 bg-[#0e101a]/50 border-x border-b border-gray-800/80 rounded-b-2xl -mt-2.5 flex flex-col gap-4 animate-fade-in text-start">
                <div className="flex items-center gap-3 p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm font-semibold">
                  <FiInfo size={16} className="shrink-0" />
                  <span>{isRTL ? "يظهر هذا الشرح للطلاب عندما يجيبون بشكل خاطئ." : "This explanation is shown to students when they answer incorrectly."}</span>
                </div>

                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder={isRTL ? "الشرح" : "Explanation"}
                  rows={3}
                  className="w-full bg-[#0e101a] border border-gray-800 rounded-2xl p-4 text-white text-base focus:outline-none focus:border-blue-500/50 resize-none font-semibold focus:ring-0 text-start"
                />

                <div className="relative w-full">
                  <FiPlayCircle className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-500`} size={16} />
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    disabled={useGeneralVideo}
                    placeholder={useGeneralVideo ? (isRTL ? "استخدام الفيديو العام لموضوع الضعف" : "Using Weakness Topic General Video") : (isRTL ? "رابط فيديو الشرح" : "Explanation Video URL")}
                    className={`w-full ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 bg-[#0e101a] border border-gray-800 rounded-2xl text-white text-base focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-gray-650 font-semibold focus:ring-0 disabled:opacity-50 text-start`}
                  />
                </div>

                <label className="flex items-center gap-3 p-3 bg-white/5 border border-gray-800 rounded-xl cursor-pointer hover:bg-white/10 transition-all text-start">
                  <input
                    type="checkbox"
                    checked={useGeneralVideo}
                    onChange={(e) => setUseGeneralVideo(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-700 bg-gray-900 focus:ring-blue-500"
                  />
                  <span className="text-xs font-semibold text-gray-300">
                    {isRTL ? "استخدام الفيديو العام لموضوع الضعف (إن وجد) بدلاً من فيديو السؤال" : "Use Weakness Topic's general video (if available) instead of question video"}
                  </span>
                </label>
              </div>
            )}
          </div>

        </div>

        {/* Submit Button */}
        <button 
          onClick={handleSaveQuestion}
          disabled={isSubmitting}
          className="w-full py-4 mt-6 bg-[#2563eb] hover:bg-blue-500 text-white rounded-2xl font-black text-base shadow-[0_4px_20px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2 active:scale-95 transition-all duration-300 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{isSubmitting ? (isRTL ? "جاري الحفظ..." : "Saving...") : (isRTL ? "حفظ التغييرات" : "Save Changes")}</span>
          <FiCheck className="text-base" />
        </button>

      </div>
    </DashboardLayout>
  );
};

export default EditQuestion;
