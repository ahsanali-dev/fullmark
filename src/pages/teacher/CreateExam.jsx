import React, { useState } from 'react';
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
  FiCalendar
} from 'react-icons/fi';
import toast from 'react-hot-toast';

import DashboardLayout from '../../components/layout/DashboardLayout';
import Input from '../../components/ui/Input';
import { getStoredSubjects, getStoredQuestions, getStoredExams, setStoredExams } from './store';

const CreateExam = () => {
  const navigate = useNavigate();
  const { subjectId } = useParams();

  // Load store data
  const [subjects] = useState(() => getStoredSubjects());
  const [allQuestions] = useState(() => getStoredQuestions());
  const [examsList, setExamsList] = useState(() => getStoredExams());

  // Wizard state
  const [step, setStep] = useState(1);

  // Step 1 states
  const [examTitle, setExamTitle] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjectId || (subjects[0]?.id || ''));
  const [difficultyMix, setDifficultyMix] = useState('Mixed');
  const [questionCount, setQuestionCount] = useState(20);

  // Step 2 states
  const filteredQuestions = allQuestions.filter(q => q.subjectId === selectedSubjectId);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);

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
      setSelectedQuestionIds([...selectedQuestionIds, id]);
    }
  };

  const handleSelectAll = () => {
    setSelectedQuestionIds(filteredQuestions.map(q => q.id));
  };

  const handleDeselectAll = () => {
    setSelectedQuestionIds([]);
  };

  const handlePublishExam = () => {
    if (!examTitle.trim()) {
      toast.error('Please enter an exam title');
      setStep(1);
      return;
    }
    if (selectedQuestionIds.length === 0) {
      toast.error('Please select at least one question');
      setStep(2);
      return;
    }

    const newExam = {
      id: `ex-${Date.now()}`,
      title: examTitle,
      subjectId: selectedSubjectId,
      duration: enableTimer ? duration : 0,
      date: new Date().toISOString().split('T')[0],
      questionsCount: selectedQuestionIds.length,
      status: 'upcoming',
      difficultyMix: difficultyMix,
      showExplanations: showExplanations,
      allowRetake: allowRetake,
      questionIds: selectedQuestionIds
    };

    const updated = [newExam, ...examsList];
    setExamsList(updated);
    setStoredExams(updated);
    toast.success('Exam published successfully!');
    navigate(`/teacher/subjects/${subjectId}`);
  };

  const currentSubjectObj = subjects.find(s => s.id === selectedSubjectId) || { title: 'Unknown Subject' };

  return (
    <DashboardLayout
      role="teacher"
      activeTab="subjects"
      title="Create Exam"
      subtitle={`Step ${step} of 3`}
    >
      <div className="w-full max-w-full p-6 md:p-8 pb-32 text-left flex flex-col gap-6 animate-fade-in">
        
        {/* Wizard Header Bar */}
        <div className="flex justify-between items-center pb-2 border-b border-gray-800/40">
          <div className="flex items-center">
            <button 
              onClick={() => {
                if (step > 1) setStep(step - 1);
                else navigate(`/teacher/subjects/${subjectId}`);
              }}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer mr-3"
            >
              <FiChevronLeft size={20} />
            </button>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white">Create Exam</h2>
              <p className="text-xs text-gray-500 font-semibold mt-1">Step {step} of 3</p>
            </div>
          </div>

          <button 
            onClick={() => {
              toast.success('Draft saved successfully!');
              navigate(`/teacher/subjects/${subjectId}`);
            }}
            className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <FiFileText size={14} />
            <span>Save Draft</span>
          </button>
        </div>

        {/* Step Indicator Circles */}
        <div className="flex items-center justify-between max-w-md mx-auto w-full my-4 px-4">
          {/* Step 1: Basic Info */}
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step === 1 ? 'bg-blue-600 text-white ring-4 ring-blue-500/20' :
              step > 1 ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-500'
            }`}>
              {step > 1 ? <FiCheck size={14} /> : '1'}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-wider ${
              step === 1 ? 'text-blue-500' :
              step > 1 ? 'text-emerald-400' : 'text-gray-500'
            }`}>Basic Info</span>
          </div>

          {/* Line 1 */}
          <div className={`flex-1 h-0.5 mx-2 transition-all ${
            step > 1 ? 'bg-emerald-500' : 'bg-gray-850 bg-gray-800'
          }`} />

          {/* Step 2: Questions */}
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step === 2 ? 'bg-blue-600 text-white ring-4 ring-blue-500/20' :
              step > 2 ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-500'
            }`}>
              {step > 2 ? <FiCheck size={14} /> : '2'}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-wider ${
              step === 2 ? 'text-blue-500' :
              step > 2 ? 'text-emerald-400' : 'text-gray-500'
            }`}>Questions</span>
          </div>

          {/* Line 2 */}
          <div className={`flex-1 h-0.5 mx-2 transition-all ${
            step > 2 ? 'bg-emerald-500' : 'bg-gray-850 bg-gray-800'
          }`} />

          {/* Step 3: Settings */}
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step === 3 ? 'bg-blue-600 text-white ring-4 ring-blue-500/20' : 'bg-gray-800 text-gray-500'
            }`}>
              3
            </div>
            <span className={`text-[10px] font-black uppercase tracking-wider ${
              step === 3 ? 'text-blue-500' : 'text-gray-500'
            }`}>Settings</span>
          </div>
        </div>

        {/* STEP CONTENT SWITCH */}
        <div className="w-full flex flex-col gap-6 mt-4">
          
          {/* STEP 1: BASIC INFO */}
          {step === 1 && (
            <div className="flex flex-col gap-6 animate-fade-in">
              
              {/* Exam Title Text Input */}
              <Input
                name="title"
                type="text"
                label="Exam Title"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                placeholder="Exam Title"
                icon={FiFileText}
                roleColor="teacher"
              />

              {/* Subject Selectors */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-black tracking-widest text-gray-500 uppercase px-1">
                  Subject
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {subjects.map((sub) => {
                    const isSelected = selectedSubjectId === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => setSelectedSubjectId(sub.id)}
                        className={`px-5 py-3 rounded-2xl font-bold text-sm border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/10'
                            : 'bg-[#0e101a] border-gray-800 text-gray-400 hover:border-gray-700'
                        }`}
                      >
                        {sub.title}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty Mix Selectors */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-black tracking-widest text-gray-500 uppercase px-1">
                  Difficulty Mix
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {['Mixed', 'Easy Only', 'Medium Only', 'Hard Only'].map((mix) => {
                    const isSelected = difficultyMix === mix;
                    return (
                      <button
                        key={mix}
                        onClick={() => setDifficultyMix(mix)}
                        className={`px-5 py-3 rounded-2xl font-bold text-sm border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/10'
                            : 'bg-[#0e101a] border-gray-800 text-gray-400 hover:border-gray-700'
                        }`}
                      >
                        {mix}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question Count Incrementer */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-black tracking-widest text-gray-500 uppercase px-1">
                  Number of Questions
                </span>
                <div className="flex items-center justify-between p-4 bg-[#0e101a] border border-gray-800 rounded-2xl max-w-sm">
                  <button
                    onClick={() => setQuestionCount(Math.max(5, questionCount - 1))}
                    className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-white hover:border-gray-750 active:scale-95 transition-all cursor-pointer font-bold"
                  >
                    -
                  </button>
                  <div className="text-center select-none">
                    <span className="text-2xl font-black text-white">{questionCount}</span>
                    <p className="text-[10px] text-gray-500 font-bold mt-0.5">min: 5 • max: 100</p>
                  </div>
                  <button
                    onClick={() => setQuestionCount(Math.min(100, questionCount + 1))}
                    className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-white hover:border-gray-750 active:scale-95 transition-all cursor-pointer font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Continue button */}
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    if (!examTitle.trim()) {
                      toast.error('Please enter an exam title');
                      return;
                    }
                    setStep(2);
                  }}
                  className="px-8 py-3.5 bg-[#2563eb] hover:bg-blue-500 text-white rounded-2xl font-black shadow-[0_4px_20px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2 active:scale-95 transition-all duration-300 cursor-pointer text-sm"
                >
                  <span>Continue</span>
                  <FiArrowRight size={16} />
                </button>
              </div>

            </div>
          )}

          {/* STEP 2: QUESTIONS LIST SELECTION */}
          {step === 2 && (
            <div className="flex flex-col gap-6 animate-fade-in">
              
              {/* Information Banner */}
              <div className="flex items-center gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl text-blue-400 text-xs font-semibold">
                <FiInfo size={18} className="shrink-0" />
                <span>Select specific questions to include in this exam</span>
              </div>

              {/* Question list controls */}
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400">
                  {selectedQuestionIds.length} of {filteredQuestions.length} selected
                </span>
                <div className="flex gap-3 text-xs font-black">
                  <button 
                    onClick={handleSelectAll}
                    className="text-blue-500 hover:text-blue-400 cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-gray-800">•</span>
                  <button 
                    onClick={handleDeselectAll}
                    className="text-red-500 hover:text-red-400 cursor-pointer"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Questions checkboxes grid */}
              {filteredQuestions.length === 0 ? (
                <div className="p-12 text-center bg-[#0c0d19]/40 border border-gray-800/80 rounded-[2rem] flex flex-col items-center justify-center">
                  <FiHelpCircle className="text-gray-650 mb-3" size={40} />
                  <span className="text-sm font-extrabold text-gray-500">No questions available</span>
                  <p className="text-xs text-gray-600 font-semibold mt-1">Please add questions to this subject first</p>
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
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm font-bold text-white truncate capitalize">{q.text}</p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase">
                              MCQ
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase border ${
                              q.difficulty === 'Easy' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                              q.difficulty === 'Medium' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                              'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}>
                              {q.difficulty || 'Easy'}
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
                  className="w-14 h-14 bg-gray-900 hover:bg-gray-850 text-white rounded-2xl flex items-center justify-center border border-gray-800/80 active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  <FiArrowLeft size={18} />
                </button>
                <button
                  onClick={() => {
                    if (selectedQuestionIds.length === 0) {
                      toast.error('Please select at least one question');
                      return;
                    }
                    setStep(3);
                  }}
                  className="px-8 py-3.5 bg-[#2563eb] hover:bg-blue-500 text-white rounded-2xl font-black shadow-[0_4px_20px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2 active:scale-95 transition-all duration-300 cursor-pointer text-sm"
                >
                  <span>Continue</span>
                  <FiArrowRight size={16} />
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: EXAM SETTINGS */}
          {step === 3 && (
            <div className="flex flex-col gap-6 animate-fade-in text-left">
              
              {/* Section 1: Timer Settings */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-black tracking-widest text-gray-500 uppercase px-1">
                  Timer Settings
                </span>
                <div className="p-4 bg-[#0e101a] border border-gray-800 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                      <FiClock size={18} />
                    </div>
                    <div>
                      <span className="text-sm font-black text-white block">Enable Timer</span>
                      <span className="text-[10px] text-gray-500 font-semibold block mt-0.5">Set a time limit for the exam</span>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => setEnableTimer(!enableTimer)}
                    className={`w-12 h-6.5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center ${
                      enableTimer ? 'bg-blue-600' : 'bg-gray-800'
                    }`}
                  >
                    <div className={`w-5.5 h-5.5 rounded-full bg-white transition-transform ${
                      enableTimer ? 'translate-x-5.5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Section 2: Duration Selector */}
              {enableTimer && (
                <div className="flex flex-col gap-3 animate-fade-in">
                  <span className="text-xs font-black tracking-widest text-gray-500 uppercase px-1">
                    Duration (minutes)
                  </span>
                  <div className="flex items-center justify-between p-4 bg-[#0e101a] border border-gray-800 rounded-2xl max-w-sm">
                    <button
                      onClick={() => setDuration(Math.max(10, duration - 5))}
                      className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-white hover:border-gray-750 active:scale-95 transition-all cursor-pointer font-bold"
                    >
                      -
                    </button>
                    <div className="text-center select-none">
                      <span className="text-2xl font-black text-white">{duration}</span>
                      <p className="text-[10px] text-gray-500 font-bold mt-0.5">min: 10 • max: 180</p>
                    </div>
                    <button
                      onClick={() => setDuration(Math.min(180, duration + 5))}
                      className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-white hover:border-gray-750 active:scale-95 transition-all cursor-pointer font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Section 3: Exam Behavior */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-black tracking-widest text-gray-500 uppercase px-1">
                  Exam Behavior
                </span>
                
                {/* Show Explanations Toggle */}
                <div className="p-4 bg-[#0e101a] border border-gray-800 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <FiHelpCircle size={18} />
                    </div>
                    <div>
                      <span className="text-sm font-black text-white block">Show Explanations</span>
                      <span className="text-[10px] text-gray-500 font-semibold block mt-0.5">Show explanation after wrong answers</span>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => setShowExplanations(!showExplanations)}
                    className={`w-12 h-6.5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center ${
                      showExplanations ? 'bg-blue-600' : 'bg-gray-800'
                    }`}
                  >
                    <div className={`w-5.5 h-5.5 rounded-full bg-white transition-transform ${
                      showExplanations ? 'translate-x-5.5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Allow Retake Toggle */}
                <div className="p-4 bg-[#0e101a] border border-gray-800 rounded-2xl flex items-center justify-between mt-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                      <FiSettings size={18} />
                    </div>
                    <div>
                      <span className="text-sm font-black text-white block">Allow Retake</span>
                      <span className="text-[10px] text-gray-500 font-semibold block mt-0.5">Students can retake this exam</span>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => setAllowRetake(!allowRetake)}
                    className={`w-12 h-6.5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center ${
                      allowRetake ? 'bg-blue-600' : 'bg-gray-800'
                    }`}
                  >
                    <div className={`w-5.5 h-5.5 rounded-full bg-white transition-transform ${
                      allowRetake ? 'translate-x-5.5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Summary Card Preview */}
              <div className="p-5 bg-gradient-to-br from-[#0c0d19] to-[#121426] border border-gray-850 rounded-[2rem] shadow-xl flex flex-col gap-4 relative overflow-hidden mt-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner shrink-0">
                    <FiFileText size={22} />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-white leading-tight capitalize">
                      {examTitle || 'Untitled Exam'}
                    </h4>
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mt-0.5 block">
                      {currentSubjectObj.title}
                    </span>
                  </div>
                </div>

                {/* Summary Metadata Pills */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-800/40">
                  <span className="px-3 py-1 rounded-full bg-gray-900 border border-gray-800 text-gray-400 text-[10px] font-black uppercase">
                    {selectedQuestionIds.length} Selected
                  </span>
                  <span className="px-3 py-1 rounded-full bg-gray-900 border border-gray-800 text-gray-400 text-[10px] font-black uppercase">
                    {enableTimer ? `${duration} minutes` : 'No Timer'}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-gray-900 border border-gray-800 text-gray-400 text-[10px] font-black uppercase">
                    {difficultyMix}
                  </span>
                  {showExplanations && (
                    <span className="px-3 py-1 rounded-full bg-gray-900 border border-gray-800 text-gray-400 text-[10px] font-black uppercase">
                      Explanations
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Nav triggers */}
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="w-14 h-14 bg-gray-900 hover:bg-gray-850 text-white rounded-2xl flex items-center justify-center border border-gray-800/80 active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  <FiArrowLeft size={18} />
                </button>
                <button
                  onClick={handlePublishExam}
                  className="px-8 py-3.5 bg-[#2563eb] hover:bg-blue-500 text-white rounded-2xl font-black shadow-[0_4px_20px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2 active:scale-95 transition-all duration-300 cursor-pointer text-sm"
                >
                  <span>Publish Exam</span>
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
