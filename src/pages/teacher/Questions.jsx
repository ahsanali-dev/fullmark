import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  FiHelpCircle,
  FiPlus,
  FiTrash2,
  FiChevronDown,
  FiBookOpen,
  FiX,
  FiCheck,
  FiChevronLeft,
  FiFileText,
  FiSearch,
  FiSliders,
  FiMoreVertical,
  FiEdit3,
  FiInfo
} from 'react-icons/fi';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import DashboardLayout from '../../components/layout/DashboardLayout';
import Input from '../../components/ui/Input';

import {
  getStoredSubjects,
  getStoredQuestions,
  setStoredQuestions
} from './store';

const QuestionSchema = Yup.object().shape({
  subjectId: Yup.string().required('Please select a subject'),
  text: Yup.string().min(5, 'Question must be at least 5 characters').required('Question text is required'),
  optionA: Yup.string().required('Option A is required'),
  optionB: Yup.string().required('Option B is required'),
  optionC: Yup.string().required('Option C is required'),
  optionD: Yup.string().required('Option D is required'),
  correctOption: Yup.string().oneOf(['A', 'B', 'C', 'D'], 'Invalid correct option').required('Correct option is required')
});

const TeacherQuestions = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlSubjectId = searchParams.get('subject');

  const [subjects, setSubjects] = useState(() => getStoredSubjects());
  const [questions, setQuestions] = useState(() => getStoredQuestions());

  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);

  // pre-select subject if passed in URL
  useEffect(() => {
    if (urlSubjectId) {
      setSelectedSubjectFilter(urlSubjectId);
    }
  }, [urlSubjectId]);

  // Sync state from store
  useEffect(() => {
    const handleSync = () => {
      setSubjects(getStoredSubjects());
      setQuestions(getStoredQuestions());
    };
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  const handleAddQuestion = (values, { resetForm }) => {
    const newQ = {
      id: `q-${Date.now()}`,
      subjectId: values.subjectId,
      text: values.text,
      optionA: values.optionA,
      optionB: values.optionB,
      optionC: values.optionC,
      optionD: values.optionD,
      correctOption: values.correctOption
    };
    const updated = [newQ, ...questions];
    setQuestions(updated);
    setStoredQuestions(updated);
    toast.success('Question added successfully!');
    setIsAddQuestionOpen(false);
    resetForm();
  };

  const handleDeleteQuestion = (id) => {
    const updated = questions.filter(q => q.id !== id);
    setQuestions(updated);
    setStoredQuestions(updated);
    toast.success('Question deleted successfully!');
  };

  // Filter logic
  const filteredQuestions = questions.filter(q => {
    const matchesSubject = selectedSubjectFilter === 'all' || q.subjectId === selectedSubjectFilter;
    const matchesQuery = q.text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesQuery;
  });

  const [activeMenuId, setActiveMenuId] = useState(null);

  const totalCount = questions.length;
  const easyCount = questions.filter(q => q.difficulty === 'Easy' || !q.difficulty || q.difficulty === '').length;
  const mediumCount = questions.filter(q => q.difficulty === 'Medium').length;
  const hardCount = questions.filter(q => q.difficulty === 'Hard').length;

  const isModalActive = isAddQuestionOpen;

  return (
    <DashboardLayout
      role="teacher"
      activeTab="questions"
      title="Questions Bank"
      subtitle="Configure assessment questions and multiple options"
      isModalOpen={isModalActive}
    >
      <div className="flex flex-col gap-6 text-left p-6 md:p-8 pb-36">

        {/* Header Block */}
        <div className="flex justify-between items-center pb-2 border-b border-gray-800/40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/teacher/subjects/select/add-question')}
              className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-[0_4px_15px_rgba(37,99,235,0.3)] transition-all flex items-center gap-1.5 cursor-pointer text-sm"
            >
              <FiPlus size={16} />
              <span>Add Question</span>
            </button>
            <button
              onClick={() => {
                toast.success('Downloading Question Bank PDF...');
              }}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-black transition-all flex items-center gap-1.5 cursor-pointer text-sm"
            >
              <FiFileText size={16} />
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/* Filters & Search Row */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-[#0e101a] border border-gray-800 rounded-2xl text-white font-semibold outline-none focus:border-blue-500/50 placeholder:text-gray-650"
            />
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
          </div>
          <div className="relative w-full md:w-56">
            <FiBookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="w-full pl-11 pr-10 py-3.5 bg-[#0e101a] border border-gray-800 rounded-2xl text-white text-sm font-semibold focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer focus:ring-0"
            >
              <option value="all">All Subjects</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
            <FiChevronDown className="text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Summary Stat Grid */}
        <div className="grid grid-cols-4 gap-2.5 md:gap-4">
          <div className="p-3.5 bg-blue-500/[0.02] border border-blue-500/15 rounded-2xl text-center">
            <span className="text-lg md:text-xl font-black text-blue-400 block">{totalCount}</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1 block">Total</span>
          </div>
          <div className="p-3.5 bg-emerald-500/[0.02] border border-emerald-500/15 rounded-2xl text-center">
            <span className="text-lg md:text-xl font-black text-emerald-400 block">{easyCount}</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1 block">Easy</span>
          </div>
          <div className="p-3.5 bg-amber-500/[0.02] border border-amber-500/15 rounded-2xl text-center">
            <span className="text-lg md:text-xl font-black text-amber-400 block">{mediumCount}</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1 block">Medium</span>
          </div>
          <div className="p-3.5 bg-red-500/[0.02] border border-red-500/15 rounded-2xl text-center">
            <span className="text-lg md:text-xl font-black text-red-400 block">{hardCount}</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1 block">Hard</span>
          </div>
        </div>

        {/* Results Counter & Sort */}
        <div className="flex justify-between items-center text-xs font-bold text-gray-400 px-1">
          <span>{filteredQuestions.length} results</span>
          <div className="flex items-center gap-1.5 text-blue-450 hover:text-blue-400 cursor-pointer">
            <FiSliders size={13} />
            <span>Newest</span>
          </div>
        </div>

        {/* Questions list */}
        {filteredQuestions.length === 0 ? (
          <div className="p-12 text-center bg-[#0c0d19]/40 border border-gray-800/80 rounded-[2rem] flex flex-col items-center justify-center">
            <FiHelpCircle className="text-gray-650 mb-3" size={40} />
            <span className="text-sm font-extrabold text-gray-500">No questions found</span>
            <p className="text-xs text-gray-600 font-semibold mt-1">Try searching a different wording or check filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredQuestions.map((q) => {
              const subObj = subjects.find(s => s.id === q.subjectId);

              const optionsList = [
                { key: 'A', val: q.optionA },
                { key: 'B', val: q.optionB },
                { key: 'C', val: q.optionC },
                { key: 'D', val: q.optionD }
              ].filter(opt => opt.val && opt.val.trim() !== '');

              return (
                <div
                  key={q.id}
                  className="p-5 bg-[#0e101a] border border-gray-800/80 rounded-[2rem] shadow-lg flex flex-col gap-4 relative text-left transition-all duration-300 hover:border-gray-700 animate-fade-in"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Icon Box with blue glow */}
                      <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] shrink-0">
                        <FiHelpCircle size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-white leading-tight capitalize max-w-[140px] md:max-w-[280px] truncate">
                          {q.text}
                        </h4>
                        <span className="text-[10px] text-gray-500 font-bold mt-1 block uppercase">
                          {subObj ? subObj.title : 'Unassigned'}
                        </span>
                      </div>
                    </div>

                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === q.id ? null : q.id);
                        }}
                        className="p-2 rounded-xl hover:bg-white/5 text-gray-450 hover:text-white transition-all cursor-pointer shrink-0"
                      >
                        <FiMoreVertical size={16} />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === q.id && (
                        <div className="absolute right-0 top-10 bg-[#0c0d19] border border-gray-800 rounded-2xl shadow-xl p-1.5 z-20 flex flex-col gap-0.5 w-28 text-xs font-bold">
                          <button
                            onClick={() => {
                              navigate(`/teacher/subjects/${q.subjectId}/edit-question/${q.id}`);
                              setActiveMenuId(null);
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer w-full text-left"
                          >
                            <FiEdit3 size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteQuestion(q.id);
                              setActiveMenuId(null);
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-xl cursor-pointer w-full text-left"
                          >
                            <FiTrash2 size={13} />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                    {optionsList.map((opt) => {
                      const isCorrect = q.correctOption === opt.key;
                      return (
                        <div
                          key={opt.key}
                          className={`text-xs font-semibold px-4 py-3 rounded-2xl border flex items-center gap-2.5 transition-all ${isCorrect
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold'
                            : 'bg-gray-950/20 border-gray-800 text-gray-400'
                            }`}
                        >
                          <span className={`text-xs font-black mr-0.5 ${isCorrect ? 'text-emerald-400' : 'text-gray-500'
                            }`}>
                            {opt.key}.
                          </span>
                          <span>{opt.val}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-800/40 my-1" />

                  {/* Badges & Actions bottom row */}
                  <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-500 tracking-wider pt-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                        MCQ
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg border ${q.difficulty === 'Easy' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        q.difficulty === 'Medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                          'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                        {q.difficulty || 'Easy'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          toast.success('Explanation: Correct answers are highlighted in emerald.');
                        }}
                        className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 text-amber-500 hover:bg-amber-500/10 transition-all cursor-pointer"
                        title="Show Explanation"
                      >
                        <FiInfo size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                        title="Delete Question"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: ADD QUESTION */}
      <AnimatePresence>
        {isAddQuestionOpen && (
          <div
            className="fixed inset-0 bg-[#020205]/70 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4 transition-all duration-300 animate-fade-in"
            onClick={() => setIsAddQuestionOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 100, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 100, opacity: 0 }}
              className="w-full sm:max-w-lg bg-[#0c0d19] border-t sm:border border-gray-800 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 pb-10 sm:pb-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-gray-800 rounded-full mx-auto mb-6 sm:hidden" />

              <button
                onClick={() => setIsAddQuestionOpen(false)}
                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                <FiX size={20} />
              </button>

              <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
                Add Question
              </h3>
              <p className="text-xs text-gray-500 mb-6 font-semibold">Create a new assessment question manually</p>

              <Formik
                initialValues={{
                  subjectId: selectedSubjectFilter !== 'all' ? selectedSubjectFilter : '',
                  text: '',
                  optionA: '',
                  optionB: '',
                  optionC: '',
                  optionD: '',
                  correctOption: ''
                }}
                validationSchema={QuestionSchema}
                onSubmit={handleAddQuestion}
              >
                {({ values, handleChange, handleBlur, isSubmitting }) => (
                  <Form className="flex flex-col gap-4 mt-2 max-h-[70vh] overflow-y-auto pr-1">
                    <div className="w-full flex flex-col relative">
                      <div className="w-full flex items-center relative rounded-2xl px-4 h-15 input-3d-teacher">
                        <div className="flex-1 relative h-full flex items-center">
                          <span className="absolute left-3 top-1.5 pointer-events-none font-semibold text-[10px] text-blue-400 uppercase tracking-wider">
                            Subject
                          </span>
                          <select
                            name="subjectId"
                            value={values.subjectId}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="w-full bg-transparent border-none text-white text-sm md:text-base font-semibold pt-4 outline-none focus:ring-0 appearance-none cursor-pointer focus:outline-none"
                          >
                            <option value="" className="bg-[#0b0c16] text-gray-500">Select Subject</option>
                            {subjects.map(s => (
                              <option key={s.id} value={s.id} className="bg-[#0b0c16] text-white">{s.title}</option>
                            ))}
                          </select>
                        </div>
                        <FiChevronDown className="text-gray-400 absolute right-4 pointer-events-none" />
                      </div>
                    </div>

                    <Input
                      name="text"
                      type="text"
                      label="Question Text"
                      placeholder="e.g. What is the sum of 2 and 2?"
                      icon={FiHelpCircle}
                      roleColor="teacher"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <Input name="optionA" type="text" label="Option A" placeholder="Option A" icon={FiPlus} roleColor="teacher" />
                      <Input name="optionB" type="text" label="Option B" placeholder="Option B" icon={FiPlus} roleColor="teacher" />
                      <Input name="optionC" type="text" label="Option C" placeholder="Option C" icon={FiPlus} roleColor="teacher" />
                      <Input name="optionD" type="text" label="Option D" placeholder="Option D" icon={FiPlus} roleColor="teacher" />
                    </div>

                    <div className="w-full flex flex-col relative">
                      <div className="w-full flex items-center relative rounded-2xl px-4 h-15 input-3d-teacher">
                        <div className="flex-1 relative h-full flex items-center">
                          <span className="absolute left-3 top-1.5 pointer-events-none font-semibold text-[10px] text-blue-400 uppercase tracking-wider">
                            Correct Option
                          </span>
                          <select
                            name="correctOption"
                            value={values.correctOption}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="w-full bg-transparent border-none text-white text-sm md:text-base font-semibold pt-4 outline-none focus:ring-0 appearance-none cursor-pointer focus:outline-none"
                          >
                            <option value="" className="bg-[#0b0c16] text-gray-500">Select Correct Option</option>
                            <option value="A" className="bg-[#0b0c16] text-white">Option A</option>
                            <option value="B" className="bg-[#0b0c16] text-white">Option B</option>
                            <option value="C" className="bg-[#0b0c16] text-white">Option C</option>
                            <option value="D" className="bg-[#0b0c16] text-white">Option D</option>
                          </select>
                        </div>
                        <FiChevronDown className="text-gray-400 absolute right-4 pointer-events-none" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 mt-2 bg-[#2563eb] hover:bg-blue-500 text-white rounded-2xl font-black shadow-[0_4px_20px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2 active:scale-95 transition-all duration-300 cursor-pointer disabled:opacity-55"
                    >
                      <span>Create Question</span>
                      <FiCheck className="text-base" />
                    </button>
                  </Form>
                )}
              </Formik>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default TeacherQuestions;
