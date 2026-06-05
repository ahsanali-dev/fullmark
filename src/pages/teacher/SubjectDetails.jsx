import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiChevronLeft,
  FiBookOpen,
  FiHelpCircle,
  FiUsers,
  FiFileText,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiCalendar,
  FiClock,
  FiX,
  FiCheck
} from 'react-icons/fi';
import toast from 'react-hot-toast';

import DashboardLayout from '../../components/layout/DashboardLayout';
import { getStoredSubjects, getStoredQuestions, getStoredExams, setStoredExams } from './store';

const SubjectDetails = () => {
  const navigate = useNavigate();
  const { subjectId } = useParams();

  const [subjects] = useState(() => getStoredSubjects());
  const [questions] = useState(() => getStoredQuestions());
  const [examsList, setExamsList] = useState(() => getStoredExams());

  const [activeTab, setActiveTab] = useState('questions'); // 'questions' | 'exams'

  const subject = subjects.find((sub) => sub.id === subjectId) || {
    id: subjectId,
    title: 'Unknown Subject',
    description: 'No description available'
  };

  const subjectQuestions = questions.filter((q) => q.subjectId === subjectId);
  const subjectExams = examsList.filter((ex) => ex.subjectId === subjectId);

  // Sync state from storage
  useEffect(() => {
    const handleSync = () => {
      setExamsList(getStoredExams());
    };
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  const handleDeleteExam = (id) => {
    const updated = examsList.filter(ex => ex.id !== id);
    setExamsList(updated);
    setStoredExams(updated);
    toast.success('Exam cancelled successfully!');
  };

  return (
    <DashboardLayout
      role="teacher"
      activeTab="subjects"
      title={subject.title}
      subtitle="Subject Hub"
    >
      <div className="w-full max-w-full p-6 md:p-8 pb-32 text-left flex flex-col gap-6 animate-fade-in">

        {/* Premium Blue Header Banner */}
        <div className="relative w-full bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-6 md:p-8 text-white overflow-hidden rounded-[2rem] shadow-lg">
          {/* Abstract circles design elements */}
          <div className="absolute right-[-10%] top-[-20%] w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute right-[10%] bottom-[-30%] w-48 h-48 rounded-full bg-white/5 blur-xl pointer-events-none" />

          {/* Navigation Back button */}
          <button
            onClick={() => navigate('/teacher/subjects')}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer mb-6"
            title="Back to Subjects"
          >
            <FiChevronLeft size={20} />
          </button>

          {/* Subject info row */}
          <div className="flex items-center gap-4.5 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-white shadow-inner shrink-0">
              <FiBookOpen size={28} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">{subject.title}</h2>
              <p className="text-sm text-white/80 font-medium mt-1">{subject.description}</p>
            </div>
          </div>

          {/* Stats Badge Grid */}
          <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-5 mt-2">
            <div className="flex flex-col items-center text-center">
              <FiHelpCircle size={18} className="text-white/70" />
              <span className="text-xl font-black mt-1">{subjectQuestions.length}</span>
              <span className="text-[10px] font-black tracking-wider uppercase text-white/60 mt-0.5">Questions</span>
            </div>
            <div className="flex flex-col items-center text-center border-x border-white/10">
              <FiUsers size={18} className="text-white/70" />
              <span className="text-xl font-black mt-1">0</span>
              <span className="text-[10px] font-black tracking-wider uppercase text-white/60 mt-0.5">Students</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <FiFileText size={18} className="text-white/70" />
              <span className="text-xl font-black mt-1">{subjectExams.length}</span>
              <span className="text-[10px] font-black tracking-wider uppercase text-white/60 mt-0.5">Exams</span>
            </div>
          </div>
        </div>

        {/* Tab Selection Switch (Rounded pill design) */}
        <div className="flex p-1.5 bg-[#0e101a] border border-gray-800 rounded-2xl w-full">
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex-1 py-3 text-center font-extrabold text-sm rounded-xl transition-all cursor-pointer ${activeTab === 'questions'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
              : 'text-gray-500 hover:text-gray-400'
              }`}
          >
            Questions
          </button>
          <button
            onClick={() => setActiveTab('exams')}
            className={`flex-1 py-3 text-center font-extrabold text-sm rounded-xl transition-all cursor-pointer ${activeTab === 'exams'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
              : 'text-gray-500 hover:text-gray-400'
              }`}
          >
            Exams
          </button>
        </div>

        {/* Tab Contents Area */}
        <div className="w-full">
          {activeTab === 'questions' ? (
            <div className="flex flex-col gap-6">

              {/* Add Question Button (Right-aligned, compact/not full-width) */}
              <div className="flex justify-end">
                <button
                  onClick={() => navigate(`/teacher/subjects/${subjectId}/add-question`)}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black shadow-[0_4px_15px_rgba(37,99,235,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer text-sm"
                >
                  <FiPlus size={16} />
                  <span>Add Question</span>
                </button>
              </div>

              {/* Questions List Grid */}
              {subjectQuestions.length === 0 ? (
                <div className="p-12 text-center bg-[#0c0d19]/40 border border-gray-800/80 rounded-[2rem] flex flex-col items-center justify-center">
                  <FiHelpCircle className="text-gray-650 mb-3" size={40} />
                  <span className="text-sm font-extrabold text-gray-500">No questions added yet</span>
                  <p className="text-xs text-gray-600 font-semibold mt-1">Create your first evaluation question for this subject</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {subjectQuestions.map((q) => (
                    <div
                      key={q.id}
                      className="p-5 bg-[#0e101a] border border-gray-800 rounded-3xl flex items-center gap-4 relative hover:border-gray-750 transition-all group"
                    >
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner shrink-0">
                        <FiHelpCircle size={20} />
                      </div>

                      {/* Info & Tags */}
                      <div className="flex-1 min-w-0 pr-8">
                        <div className="text-sm font-extrabold text-white truncate leading-tight capitalize">
                          {q.text}
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase">
                            MCQ
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${q.difficulty === 'Easy' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                            q.difficulty === 'Medium' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                              'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}>
                            {q.difficulty || 'Easy'}
                          </span>
                        </div>
                      </div>

                      {/* Edit Button */}
                      <button
                        onClick={() => navigate(`/teacher/subjects/${subjectId}/edit-question/${q.id}`)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-500 hover:text-white hover:border-gray-700 transition-all cursor-pointer"
                        title="Edit Question"
                      >
                        <FiEdit3 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-6">

              {/* Schedule Exam Button (Right-aligned, compact/not full-width) */}
              <div className="flex justify-end">
                <button
                  onClick={() => navigate(`/teacher/subjects/${subjectId}/create-exam`)}
                  className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white rounded-xl font-black shadow-[0_4px_15px_rgba(37,99,235,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer text-sm"
                >
                  <FiPlus size={16} />
                  <span>Schedule Exam</span>
                </button>
              </div>

              {/* Exams List Grid */}
              {subjectExams.length === 0 ? (
                <div className="p-12 text-center bg-[#0c0d19]/40 border border-gray-800/80 rounded-[2rem] flex flex-col items-center justify-center">
                  <FiFileText className="text-gray-650 mb-3" size={40} />
                  <span className="text-sm font-extrabold text-gray-500">No exams scheduled</span>
                  <p className="text-xs text-gray-600 font-semibold mt-1">Schedule evaluation tests and assessment parameters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {subjectExams.map((ex) => (
                    <div
                      key={ex.id}
                      className="p-5 bg-[#0e101a] border border-gray-800/80 rounded-[2rem] shadow-lg flex flex-col justify-between gap-4 transition-all duration-300 hover:border-gray-700 text-left animate-fade-in"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Icon Box with blue glow */}
                          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] shrink-0">
                            <FiFileText size={18} />
                          </div>
                          <div>
                            <h4 className="text-sm font-extrabold text-white leading-tight capitalize max-w-[140px] md:max-w-[180px] truncate">
                              {ex.title}
                            </h4>
                            <span className="text-[10px] text-gray-500 font-bold mt-1 block uppercase">
                              {ex.date}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">
                            Published
                          </span>
                          <button
                            onClick={() => handleDeleteExam(ex.id)}
                            className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-500 hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer shrink-0"
                            title="Cancel Assessment"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-800/40 my-1" />

                      {/* Metadata */}
                      <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-500 tracking-wider pt-1">
                        <div className="flex items-center gap-1.5">
                          <FiHelpCircle className="text-gray-650" size={14} />
                          <span>{ex.questionsCount} questions</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FiClock className="text-gray-650" size={14} />
                          <span>{ex.duration} min</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FiUsers className="text-gray-650" size={14} />
                          <span>0 students</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default SubjectDetails;
