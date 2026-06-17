import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiFileText,
  FiPlus,
  FiTrash2,
  FiChevronDown,
  FiBookOpen,
  FiCalendar,
  FiClock,
  FiX,
  FiCheck,
  FiUsers,
  FiHelpCircle,
  FiSearch,
  FiSliders,
  FiBarChart2,
  FiAlertCircle,
  FiZap
} from 'react-icons/fi';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import DashboardLayout from '../../components/layout/DashboardLayout';
import Input from '../../components/ui/Input';

import {
  getStoredSubjects,
  getStoredExams,
  setStoredExams
} from './store';

const ExamSchema = Yup.object().shape({
  title: Yup.string().min(3, 'Title must be at least 3 characters').required('Exam title is required'),
  subjectId: Yup.string().required('Please select a subject'),
  duration: Yup.number().positive('Duration must be positive').required('Duration in minutes is required'),
  date: Yup.string().required('Exam date is required'),
  questionsCount: Yup.number().min(1, 'Select at least 1 question').required('Number of questions is required')
});

const TeacherExams = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState(() => getStoredSubjects());
  const [exams, setExams] = useState(() => getStoredExams());

  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Sync state from store
  useEffect(() => {
    const handleSync = () => {
      setSubjects(getStoredSubjects());
      setExams(getStoredExams());
    };
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = () => setActiveMenuId(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const handleAddExam = (values, { resetForm }) => {
    const newExam = {
      id: `ex-${Date.now()}`,
      title: values.title,
      subjectId: values.subjectId,
      duration: values.duration,
      date: values.date,
      questionsCount: values.questionsCount,
      status: 'published'
    };
    const updated = [newExam, ...exams];
    setExams(updated);
    setStoredExams(updated);
    toast.success('Exam scheduled successfully!');
    setIsAddExamOpen(false);
    resetForm();
  };

  const handleDeleteExam = (id) => {
    const updated = exams.filter(ex => ex.id !== id);
    setExams(updated);
    setStoredExams(updated);
    toast.success('Exam cancelled successfully!');
  };

  // Filter logic
  const filteredExams = exams.filter(ex => {
    const matchesSubject = selectedSubjectFilter === 'all' || ex.subjectId === selectedSubjectFilter;
    const matchesQuery = ex.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesQuery;
  });

  // Stat counts
  const totalCount = exams.length;
  const publishedCount = exams.filter(e => e.status === 'published').length;
  const draftCount = exams.filter(e => e.status === 'draft').length;
  const upcomingCount = exams.filter(e => e.status === 'upcoming').length;

  const isModalActive = isAddExamOpen;

  return (
    <DashboardLayout
      role="teacher"
      activeTab="exams"
      title="Exams Schedule"
      subtitle="Organize student exams and durations"
      isModalOpen={isModalActive}
    >
      <div className="flex flex-col gap-6 text-left p-6 md:p-8 pb-36">

        {/* Header Block */}
        <div className="flex justify-between items-center pb-2 border-b border-gray-800/40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/teacher/subjects/select/create-exam')}
              className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-[0_4px_15px_rgba(37,99,235,0.3)] transition-all flex items-center gap-1.5 cursor-pointer text-base"
            >
              <FiPlus size={16} />
              <span>Create Exam</span>
            </button>
            <button
              onClick={() => toast.success('Downloading Exams PDF...')}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-black transition-all flex items-center gap-1.5 cursor-pointer text-base"
            >
              <FiFileText size={16} />
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Row */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-[#0e101a] border border-gray-800 rounded-2xl text-white text-base font-semibold outline-none focus:border-blue-500/50 placeholder:text-gray-655"
            />
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
          </div>
          <div className="relative w-full md:w-56">
            <FiBookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="w-full pl-11 pr-10 py-3.5 bg-[#0e101a] border border-gray-800 rounded-2xl text-white text-base font-semibold focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer focus:ring-0"
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
            <span className="text-sm text-gray-500 font-bold uppercase tracking-wider mt-1 block">Total</span>
          </div>
          <div className="p-3.5 bg-emerald-500/[0.02] border border-emerald-500/15 rounded-2xl text-center">
            <span className="text-lg md:text-xl font-black text-emerald-400 block">{publishedCount}</span>
            <span className="text-sm text-gray-500 font-bold uppercase tracking-wider mt-1 block">Published</span>
          </div>
          <div className="p-3.5 bg-amber-500/[0.02] border border-amber-500/15 rounded-2xl text-center">
            <span className="text-lg md:text-xl font-black text-amber-400 block">{draftCount}</span>
            <span className="text-sm text-gray-500 font-bold uppercase tracking-wider mt-1 block">Draft</span>
          </div>
          <div className="p-3.5 bg-indigo-500/[0.02] border border-indigo-500/15 rounded-2xl text-center">
            <span className="text-lg md:text-xl font-black text-indigo-400 block">{upcomingCount}</span>
            <span className="text-sm text-gray-500 font-bold uppercase tracking-wider mt-1 block">Upcoming</span>
          </div>
        </div>

        {/* Results Counter & Sort */}
        <div className="flex justify-between items-center text-sm font-bold text-gray-400 px-1">
          <span>{filteredExams.length} results</span>
          <div className="flex items-center gap-1.5 text-blue-450 hover:text-blue-400 cursor-pointer">
            <FiSliders size={13} />
            <span>Newest</span>
          </div>
        </div>

        {/* Exams Grid */}
        {filteredExams.length === 0 ? (
          <div className="p-12 text-center bg-[#0c0d19]/40 border border-gray-800/80 rounded-[2rem] flex flex-col items-center justify-center">
            <FiAlertCircle className="text-gray-650 mb-3" size={40} />
            <span className="text-lg font-extrabold text-gray-500">No exams found</span>
            <p className="text-base text-gray-600 font-semibold mt-1">Create a new exam or adjust your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredExams.map((ex) => {
              const subObj = subjects.find(s => s.id === ex.subjectId);
              const isPublished = ex.status === 'published';
              const isDraft = ex.status === 'draft';

              return (
                <div
                  key={ex.id}
                  className="p-5 bg-[#0e101a] border border-gray-800/80 rounded-[2rem] shadow-lg flex flex-col gap-4 relative text-left transition-all duration-300 hover:border-gray-700 animate-fade-in"
                >
                  {/* Top Row: Icon + Title + Status badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] shrink-0">
                        <FiFileText size={18} />
                      </div>
                      <div>
                        <h4 className="text-lg font-extrabold text-white leading-tight capitalize max-w-[140px] md:max-w-[240px] truncate">
                          {ex.title}
                        </h4>
                        <span className="text-sm text-gray-500 font-bold mt-1 block uppercase">
                          {subObj ? subObj.title : 'Unassigned'}
                        </span>
                      </div>
                    </div>

                    <span className={`text-sm font-black uppercase px-3 py-1 rounded-full border ${
                      isPublished
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : isDraft
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                    }`}>
                      {ex.status || 'Published'}
                    </span>
                  </div>

                  {/* Metadata Row: Qs, Duration, Date, Timer */}
                  <div className="flex items-center gap-3 flex-wrap text-sm font-bold text-gray-500 uppercase tracking-wide">
                    <div className="flex items-center gap-1">
                      <FiHelpCircle size={12} className="text-gray-650" />
                      <span>{ex.questionsCount} Qs</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiClock size={12} className="text-gray-650" />
                      <span>{ex.duration} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiCalendar size={12} className="text-gray-650" />
                      <span>{ex.date}</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-400">
                      <FiZap size={12} />
                      <span>Timer</span>
                    </div>
                  </div>

                  {/* Score Stats Grid */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="p-2.5 rounded-xl bg-amber-500/[0.05] border border-amber-500/10 text-center">
                      <span className="text-base font-black text-amber-400 block">0%</span>
                      <span className="text-xs text-gray-600 font-bold uppercase tracking-wider block mt-0.5">Avg Score</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/10 text-center">
                      <span className="text-base font-black text-emerald-400 block">0%</span>
                      <span className="text-xs text-gray-600 font-bold uppercase tracking-wider block mt-0.5">High Score</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-red-500/[0.05] border border-red-500/10 text-center">
                      <span className="text-base font-black text-red-400 block">0%</span>
                      <span className="text-xs text-gray-600 font-bold uppercase tracking-wider block mt-0.5">Low Score</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-blue-500/[0.05] border border-blue-500/10 text-center">
                      <span className="text-base font-black text-blue-400 block">0/0</span>
                      <span className="text-xs text-gray-600 font-bold uppercase tracking-wider block mt-0.5">Submitted</span>
                    </div>
                  </div>

                  {/* Submission Rate */}
                  <p className="text-sm font-semibold text-gray-600 -mt-1">0% submission rate</p>

                  {/* Divider */}
                  <div className="border-t border-gray-800/40" />

                  {/* Bottom Row: View Results + Delete */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toast.success('Viewing results for: ' + ex.title)}
                      className="flex-1 py-3 rounded-2xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/20 text-blue-400 font-black text-base flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <FiBarChart2 size={14} />
                      <span>View Results</span>
                    </button>
                    <button
                      onClick={() => handleDeleteExam(ex.id)}
                      className="p-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all cursor-pointer shrink-0"
                      title="Cancel Exam"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: ADD EXAM */}
      <AnimatePresence>
        {isAddExamOpen && (
          <div
            className="fixed inset-0 bg-[#020205]/70 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4 transition-all duration-300 animate-fade-in"
            onClick={() => setIsAddExamOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 100, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 100, opacity: 0 }}
              className="w-full sm:max-w-md bg-[#0c0d19] border-t sm:border border-gray-800 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 pb-10 sm:pb-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-gray-800 rounded-full mx-auto mb-6 sm:hidden" />

              <button
                onClick={() => setIsAddExamOpen(false)}
                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                <FiX size={20} />
              </button>

              <h3 className="text-xl sm:text-2xl font-black text-white mb-2">New Exam</h3>
              <p className="text-xs text-gray-500 mb-6 font-semibold">Schedule a new student assessment exam</p>

              <Formik
                initialValues={{ title: '', subjectId: '', duration: '', date: '', questionsCount: '' }}
                validationSchema={ExamSchema}
                onSubmit={handleAddExam}
              >
                {({ values, handleChange, handleBlur, isSubmitting }) => (
                  <Form className="flex flex-col gap-4 mt-2">
                    <Input name="title" type="text" label="Exam Title" placeholder="e.g. Midterm assessment" icon={FiFileText} roleColor="teacher" />

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

                    <div className="grid grid-cols-2 gap-3">
                      <Input name="duration" type="number" label="Duration (mins)" placeholder="45" icon={FiClock} roleColor="teacher" />
                      <Input name="questionsCount" type="number" label="No. of Questions" placeholder="10" icon={FiHelpCircle} roleColor="teacher" />
                    </div>

                    <Input name="date" type="date" label="Exam Date" placeholder="YYYY-MM-DD" icon={FiCalendar} roleColor="teacher" />

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 mt-2 bg-[#2563eb] hover:bg-blue-500 text-white rounded-2xl font-black shadow-[0_4px_20px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2 active:scale-95 transition-all duration-300 cursor-pointer disabled:opacity-55"
                    >
                      <span>Schedule Exam</span>
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

export default TeacherExams;
