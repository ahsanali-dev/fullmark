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
import { getStoredSubjects, getStoredQuestions, setStoredQuestions } from './store';

const EditQuestion = () => {
  const navigate = useNavigate();
  const { subjectId, questionId } = useParams();

  const fileInputRef = useRef(null);

  const [subjects] = useState(() => getStoredSubjects());
  const [questions, setQuestions] = useState(() => getStoredQuestions());

  const subject = subjects.find((sub) => sub.id === subjectId) || { title: 'Unknown Subject' };
  const existingQuestion = questions.find((q) => q.id === questionId);

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
  const [image, setImage] = useState(null);

  // Populate data on mount
  useEffect(() => {
    if (existingQuestion) {
      setDifficulty(existingQuestion.difficulty || 'Easy');
      setQuestionText(existingQuestion.text || '');
      setOptionsData({
        optionA: existingQuestion.optionA || '',
        optionB: existingQuestion.optionB || '',
        optionC: existingQuestion.optionC || '',
        optionD: existingQuestion.optionD || ''
      });
      setCorrectOption(existingQuestion.correctOption || 'B');
      setExplanation(existingQuestion.explanation || '');
      setVideoUrl(existingQuestion.videoUrl || '');
      setImage(existingQuestion.image || null);
    } else {
      toast.error('Question not found');
      navigate(`/teacher/subjects/${subjectId}`);
    }
  }, [existingQuestion, subjectId, navigate]);

  // Image handlers
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        toast.success('Image updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('Image removed successfully!');
  };

  // Save changes handler
  const handleSaveQuestion = () => {
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

    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId) {
        return {
          ...q,
          text: questionText,
          optionA: optionsData.optionA,
          optionB: optionsData.optionB,
          optionC: optionsData.optionC,
          optionD: optionsData.optionD,
          correctOption: correctOption,
          difficulty: difficulty,
          explanation: explanation,
          videoUrl: videoUrl,
          image: image
        };
      }
      return q;
    });

    setQuestions(updatedQuestions);
    setStoredQuestions(updatedQuestions);
    toast.success('Question updated successfully!');

    // Redirect to subject details
    navigate(`/teacher/subjects/${subjectId}`);
  };

  return (
    <DashboardLayout
      role="teacher"
      activeTab="subjects"
      title="Edit Question"
      subtitle={`Subject: ${subject.title}`}
    >
      <div className="w-full max-w-full p-6 md:p-8 pb-32 text-left flex flex-col gap-6 animate-fade-in">
        
        {/* Header Block */}
        <div className="flex justify-between items-center pb-2 border-b border-gray-800/40">
          <div className="flex items-center">
            <button 
              onClick={() => navigate(`/teacher/subjects/${subjectId}`)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer mr-3"
            >
              <FiChevronLeft size={20} />
            </button>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white">Edit Question</h2>
              <p className="text-sm text-gray-500 font-semibold mt-1">Modify question details for {subject.title}</p>
            </div>
          </div>

          {/* Difficulty Level Indicator */}
          <div className={`px-4.5 py-1.5 rounded-full text-sm font-black border flex items-center gap-1.5 ${
            difficulty === 'Easy' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
            difficulty === 'Medium' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
            'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              difficulty === 'Easy' ? 'bg-emerald-400' :
              difficulty === 'Medium' ? 'bg-blue-400' :
              'bg-red-400'
            }`} />
            <span>{difficulty}</span>
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
              className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer border transition-all ${
                difficulty === 'Easy' 
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                  : 'border-gray-800 bg-[#0e101a] text-gray-500 hover:border-gray-705'
              }`}
            >
              <FiSmile size={24} />
              <span className="text-sm font-bold">Easy</span>
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
              <span className="text-sm font-bold">Medium</span>
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
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
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
                      src={image} 
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
                  <span>Tap the circle to mark the correct answer</span>
                </div>

                <div className="flex flex-col gap-3">
                  {['A', 'B', 'C', 'D'].map((letter) => {
                    const optionKey = `option${letter}`;
                    const value = optionsData[optionKey];
                    const isCorrect = correctOption === letter;
                    return (
                      <div 
                        key={letter}
                        className={`flex items-center gap-4 p-3.5 rounded-2xl border transition-all ${
                          isCorrect 
                            ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.05)]' 
                            : 'border-gray-800/80 bg-[#0e101a]'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setCorrectOption(letter)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm shrink-0 cursor-pointer transition-all ${
                            isCorrect 
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

                        {isCorrect && (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-black uppercase shrink-0">
                            Correct
                          </span>
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
          className="w-full py-4 mt-6 bg-[#2563eb] hover:bg-blue-500 text-white rounded-2xl font-black text-base shadow-[0_4px_20px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2 active:scale-95 transition-all duration-300 cursor-pointer shadow-md"
        >
          <span>Save Changes</span>
          <FiCheck className="text-base" />
        </button>

      </div>
    </DashboardLayout>
  );
};

export default EditQuestion;
