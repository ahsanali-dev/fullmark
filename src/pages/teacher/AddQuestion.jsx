  import { useState, useRef } from 'react';
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
  FiX,
  FiBookOpen
} from 'react-icons/fi';
import toast from 'react-hot-toast';

import DashboardLayout from '../../components/layout/DashboardLayout';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTeacherSubjects, createQuestion, uploadQuestionImage } from '../../redux/slices/teacherSlice';
import { useEffect } from 'react';

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

const AddQuestion = () => {
  const navigate = useNavigate();
  const { subjectId } = useParams();

  const fileInputRef = useRef(null);
  const optionFileInputRef = useRef(null);
  // image = base64 preview string; imageFile = actual File for upload
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploadingForOption, setUploadingForOption] = useState(null);
  // optionImages = base64 previews; optionImageFiles = actual Files
  const [optionImages, setOptionImages] = useState({ A: null, B: null, C: null, D: null });
  const [optionImageFiles, setOptionImageFiles] = useState({ A: null, B: null, C: null, D: null });

  const dispatch = useDispatch();
  const { subjects = [], isLoading } = useSelector((state) => state.teacher);

  const [selectedSubjectId, setSelectedSubjectId] = useState(() => {
    if (subjectId === 'select') {
      return '';
    }
    return subjectId;
  });

  // Fetch subjects on mount
  useEffect(() => {
    dispatch(fetchTeacherSubjects());
  }, [dispatch]);

  // Set default subject when subjects are loaded
  useEffect(() => {
    if (!selectedSubjectId && subjects.length > 0 && subjectId === 'select') {
      setSelectedSubjectId(subjects[0]?._id || subjects[0]?.id || '');
    }
  }, [subjects, selectedSubjectId, subjectId]);

  const subject = subjects.find((sub) => (sub._id || sub.id) === selectedSubjectId) || { name: 'Unknown Subject' };

  // Add Question State
  const [difficulty, setDifficulty] = useState('Easy');
  const [activeAccordion, setActiveAccordion] = useState('question'); // 'question' | 'options' | 'explanation'
  const [questionText, setQuestionText] = useState('');
  const [optionsData, setOptionsData] = useState({
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: ''
  });
  const [correctOption, setCorrectOption] = useState('B'); // Default matches mockup
  const [explanation, setExplanation] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image Upload Handlers — store File + generate preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => { setImage(reader.result); };
      reader.readAsDataURL(file);
      toast.success('Image selected!');
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.success('Image removed successfully!');
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
        toast.success(`Image added to Option ${letter}!`);
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
    toast.success(`Image removed from Option ${letter}`);
  };

  // Add Question Handler
  const handleSaveQuestion = async () => {
    if (!selectedSubjectId || selectedSubjectId === 'select') {
      toast.error('Please select a subject');
      return;
    }
    if (!questionText.trim()) {
      toast.error('Question text is required');
      setActiveAccordion('question');
      return;
    }
    if (!optionsData.optionA.trim() || !optionsData.optionB.trim() || !optionsData.optionC.trim() || !optionsData.optionD.trim()) {
      toast.error('Please fill in all options (A, B, C, D)');
      setActiveAccordion('options');
      return;
    }
    if (!correctOption) {
      toast.error('Please select the correct option');
      setActiveAccordion('options');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Uploading images...');

    try {
      // Upload main question image if a new file was selected
      let uploadedImagePath = null;
      if (imageFile) {
        try {
          uploadedImagePath = await dispatch(uploadQuestionImage(imageFile)).unwrap();
        } catch (uploadErr) {
          toast.error('Failed to upload question image', { id: loadingToast });
          setIsSubmitting(false);
          return;
        }
      }

      // Upload option images
      const uploadedOptionPaths = ['', '', '', ''];
      const optionLetters = ['A', 'B', 'C', 'D'];
      for (let i = 0; i < optionLetters.length; i++) {
        const letter = optionLetters[i];
        if (optionImageFiles[letter]) {
          try {
            uploadedOptionPaths[i] = await dispatch(uploadQuestionImage(optionImageFiles[letter])).unwrap() || '';
          } catch {
            uploadedOptionPaths[i] = '';
          }
        }
      }

      toast.loading('Adding question...', { id: loadingToast });

      const optionMap = { A: 0, B: 1, C: 2, D: 3 };
      const correctIdx = optionMap[correctOption] ?? 0;

      const payload = {
        subjectId: selectedSubjectId,
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
        image: uploadedImagePath || null,
        optionImages: uploadedOptionPaths,
      };

      await dispatch(createQuestion(payload)).unwrap();
      toast.success('Question added successfully!', { id: loadingToast });
      setIsSubmitting(false);
      navigate(`/teacher/subjects/${selectedSubjectId}`);
    } catch (err) {
      setIsSubmitting(false);
      toast.error(err || 'Failed to add question', { id: loadingToast });
    }
  };

  return (
    <DashboardLayout
      role="teacher"
      activeTab={subjectId === 'select' ? 'questions' : 'subjects'}
      title="Add Question"
      subtitle={subjectId === 'select' ? 'Choose subject and details' : `Subject: ${subject.name || subject.title}`}
    >
      <div className="w-full max-w-full p-6 md:p-8 pb-32 text-left flex flex-col gap-6 animate-fade-in">

        {/* Hidden inputs always mounted */}
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
        <div className="flex justify-between items-center pb-2 border-b border-gray-800/40">
          <div className="flex items-center">
            <button
              onClick={() => {
                const targetId = (subjectId === 'select' ? selectedSubjectId : subjectId) || '';
                navigate(targetId ? `/teacher/subjects/${targetId}` : '/teacher/subjects');
              }}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer mr-3"
            >
              <FiChevronLeft size={20} />
            </button>
          </div>

          {/* Difficulty Level Indicator */}
          <div className={`px-4.5 py-1.5 rounded-full text-sm font-black border flex items-center gap-1.5 ${difficulty === 'Easy' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
              difficulty === 'Medium' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${difficulty === 'Easy' ? 'bg-emerald-400' :
                difficulty === 'Medium' ? 'bg-blue-400' :
                  'bg-red-400'
              }`} />
            <span>{difficulty}</span>
          </div>
        </div>

        {/* Subject Dropdown Selector */}
        <div className="flex flex-col gap-3 text-left">
          <span className="text-xs font-black tracking-widest text-gray-500 uppercase px-1">
            Subject
          </span>
          <div className="relative w-full">
            <FiBookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full pl-12 pr-10 py-4 bg-[#0e101a] border border-gray-800 rounded-2xl text-white font-semibold outline-none focus:border-blue-500/50 appearance-none cursor-pointer focus:ring-0 text-base"
            >
              <option value="" disabled>Select Subject</option>
              {subjects.map(s => {
                const subId = s._id || s.id;
                const subTitle = s.name || s.title;
                return (
                  <option key={subId} value={subId}>{subTitle}</option>
                );
              })}
            </select>
            <FiChevronDown className="text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 1. Difficulty Level Selector */}
        <div className="flex flex-col gap-3 text-left">
          <span className="text-xs font-black tracking-widest text-gray-500 uppercase px-1">
            Difficulty Level
          </span>
          <div className="grid grid-cols-3 gap-3">
            {/* Easy */}
            <div
              onClick={() => setDifficulty('Easy')}
              className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer border transition-all ${difficulty === 'Easy'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                  : 'border-gray-800 bg-[#0e101a] text-gray-500 hover:border-gray-700'
                }`}
            >
              <FiSmile size={24} />
              <span className="text-sm font-bold">Easy</span>
            </div>
            {/* Medium */}
            <div
              onClick={() => setDifficulty('Medium')}
              className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer border transition-all ${difficulty === 'Medium'
                  ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                  : 'border-gray-800 bg-[#0e101a] text-gray-500 hover:border-gray-700'
                }`}
            >
              <FiMeh size={24} />
              <span className="text-sm font-bold">Medium</span>
            </div>
            {/* Hard */}
            <div
              onClick={() => setDifficulty('Hard')}
              className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer border transition-all ${difficulty === 'Hard'
                  ? 'border-red-500 bg-red-500/10 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
                  : 'border-gray-800 bg-[#0e101a] text-gray-500 hover:border-gray-700'
                }`}
            >
              <FiFrown size={24} />
              <span className="text-sm font-bold">Hard</span>
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
                <span className="text-base font-extrabold text-white">Question</span>
              </div>
              <FiChevronDown className={`text-gray-500 transition-transform duration-300 ${activeAccordion === 'question' ? 'rotate-180' : ''}`} />
            </div>

            {activeAccordion === 'question' && (
              <div className="p-5 bg-[#0e101a]/50 border-x border-b border-gray-800/80 rounded-b-2xl -mt-2.5 flex flex-col gap-4 animate-fade-in text-left">
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Question Text"
                  rows={4}
                  className="w-full bg-[#0e101a] border border-gray-800 rounded-2xl p-4 text-white text-base focus:outline-none focus:border-blue-500/50 resize-none font-semibold focus:ring-0"
                />



                {!image ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 border border-dashed border-gray-800 hover:border-blue-500/50 bg-[#0e101a]/30 hover:bg-blue-500/5 text-gray-400 hover:text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <FiImage size={18} />
                    <span>Add Image</span>
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
                      className="absolute top-6 right-6 w-8 h-8 rounded-full bg-red-600/90 hover:bg-red-600 hover:scale-105 active:scale-95 flex items-center justify-center text-white cursor-pointer transition-all shadow-lg"
                      title="Remove Image"
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
                <span className="text-base font-extrabold text-white">Answer Options</span>
              </div>
              <FiChevronDown className={`text-gray-500 transition-transform duration-300 ${activeAccordion === 'options' ? 'rotate-180' : ''}`} />
            </div>

            {activeAccordion === 'options' && (
              <div className="p-5 bg-[#0e101a]/50 border-x border-b border-gray-800/80 rounded-b-2xl -mt-2.5 flex flex-col gap-4 animate-fade-in text-left">
                <div className="flex items-center gap-3 p-3.5 bg-blue-500/5 border border-blue-500/20 rounded-2xl text-blue-400 text-sm font-semibold">
                  <FiInfo size={16} className="shrink-0" />
                  <span>Tap the circle to mark the correct answer. Each option can have an optional image.</span>
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
                            placeholder={`Option ${letter}...`}
                            className="w-full bg-transparent border-none text-white text-base font-semibold outline-none focus:outline-none focus:ring-0"
                          />

                          {/* Image upload button */}
                          <button
                            type="button"
                            onClick={() => handleOptionImageClick(letter)}
                            className={`p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer relative shrink-0 ${
                              hasImage ? 'text-blue-400' : 'text-gray-500 hover:text-white'
                            }`}
                            title={hasImage ? "Change Option Image" : "Add Image to Option"}
                          >
                            <FiImage size={18} />
                            {hasImage && (
                              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full border border-gray-900" />
                            )}
                          </button>

                          {isCorrect && (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-black uppercase shrink-0">
                              Correct
                            </span>
                          )}
                        </div>

                        {/* Image Preview if attached */}
                        {hasImage && (
                          <div className="ml-11 relative rounded-xl border border-gray-800 bg-[#0c0d19] overflow-hidden group max-w-full flex items-center p-2 self-start gap-3">
                            <img
                              src={getImageUrl(optionImages[letter])}
                              alt={`Option ${letter} Visual`}
                              className="max-h-20 rounded-lg object-contain bg-black/20"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveOptionImage(letter)}
                              className="w-6 h-6 rounded-full bg-red-600/90 hover:bg-red-600 flex items-center justify-center text-white cursor-pointer transition-all"
                              title="Remove Image"
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
                <span className="text-base font-extrabold text-white">Explanation & Video</span>
              </div>
              <FiChevronDown className={`text-gray-500 transition-transform duration-300 ${activeAccordion === 'explanation' ? 'rotate-180' : ''}`} />
            </div>

            {activeAccordion === 'explanation' && (
              <div className="p-5 bg-[#0e101a]/50 border-x border-b border-gray-800/80 rounded-b-2xl -mt-2.5 flex flex-col gap-4 animate-fade-in text-left">
                <div className="flex items-center gap-3 p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm font-semibold">
                  <FiInfo size={16} className="shrink-0" />
                  <span>This explanation is shown to students when they answer incorrectly.</span>
                </div>

                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Explanation"
                  rows={3}
                  className="w-full bg-[#0e101a] border border-gray-800 rounded-2xl p-4 text-white text-base focus:outline-none focus:border-blue-500/50 resize-none font-semibold focus:ring-0"
                />

                <div className="relative w-full">
                  <FiPlayCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="Explanation Video URL"
                    className="w-full pl-11 pr-4 py-3 bg-[#0e101a] border border-gray-800 rounded-2xl text-white text-base focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-gray-650 font-semibold focus:ring-0"
                  />
                </div>
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
          <span>{isSubmitting ? 'Adding...' : 'Add Question'}</span>
          <FiPlus className="text-base" />
        </button>

      </div>
    </DashboardLayout>
  );
};

export default AddQuestion;
