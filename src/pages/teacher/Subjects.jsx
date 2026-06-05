import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiBookOpen,
  FiHelpCircle,
  FiUsers,
  FiChevronRight,
  FiSearch
} from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getStoredSubjects, getStoredQuestions, getStoredExams } from './store';

const TeacherSubjects = () => {
  const navigate = useNavigate();

  // Core Store States
  const [subjects, setSubjects] = useState(() => getStoredSubjects());
  const [questions, setQuestions] = useState(() => getStoredQuestions());
  const [exams, setExams] = useState(() => getStoredExams());

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Sync state from store
  useEffect(() => {
    const handleSync = () => {
      setSubjects(getStoredSubjects());
      setQuestions(getStoredQuestions());
      setExams(getStoredExams());
    };
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  // Counts mapping
  const subjectsWithCounts = subjects.map(sub => ({
    ...sub,
    questionsCount: questions.filter(q => q.subjectId === sub.id).length,
    examsCount: exams.filter(ex => ex.subjectId === sub.id).length,
    studentsCount: sub.title === 'test 2' ? 0 : 0
  }));

  const filteredSubjects = subjectsWithCounts.filter(
    s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout
      role="teacher"
      activeTab="subjects"
      title="My Subjects"
      subtitle={`${subjects.length} subjects assigned`}
    >
      <div className="w-full max-w-full p-6 md:p-8 pb-32 text-left flex flex-col gap-6 animate-fade-in">

        {/* Search bar */}
        <div className="relative w-full">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Search subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#0e101a] border border-gray-800 rounded-2xl text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-gray-600 font-semibold"
          />
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 gap-4 my-2">
          <div className="p-4 bg-[#0e101a] border border-emerald-500/20 rounded-2xl flex flex-col items-center justify-center text-center shadow-[0_0_20px_rgba(16,185,129,0.05)]">
            <span className="text-2xl font-black text-emerald-400">{subjects.length}</span>
            <span className="text-xs font-semibold text-emerald-500/70 mt-1">Active</span>
          </div>
          <div className="p-4 bg-[#0e101a] border border-yellow-500/20 rounded-2xl flex flex-col items-center justify-center text-center shadow-[0_0_20px_rgba(245,158,11,0.05)]">
            <span className="text-2xl font-black text-yellow-500">{questions.length}</span>
            <span className="text-xs font-semibold text-yellow-500/70 mt-1">Questions</span>
          </div>
        </div>

        {/* Grid of Subject Cards */}
        {filteredSubjects.length === 0 ? (
          <div className="p-8 text-center bg-[#0c0d19]/40 border border-gray-800/80 rounded-3xl flex flex-col items-center justify-center">
            <span className="text-sm font-bold text-gray-500">No subjects matched your search</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredSubjects.map((sub) => (
              <div
                key={sub.id}
                className="p-5 bg-[#0e101a]/95 border border-gray-800/80 rounded-[2rem] shadow-lg flex flex-col gap-4 relative overflow-hidden transition-all duration-300 hover:bg-[#121424]"
              >
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)] shrink-0">
                    <FiBookOpen size={24} />
                  </div>

                  <div className="flex items-center gap-1.5 z-10">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Active</span>
                    </span>
                  </div>
                </div>

                <div className="text-left mt-1">
                  <div className="text-xl font-extrabold text-white leading-tight capitalize">{sub.title}</div>
                  <p className="text-xs text-gray-500 font-semibold mt-1 leading-normal line-clamp-1">{sub.description}</p>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-gray-500 border-t border-gray-800/40 pt-4 mt-2">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <FiHelpCircle size={13} className="text-blue-400" />
                      {sub.questionsCount} Questions
                    </span>
                    <span className="flex items-center gap-1">
                      <FiUsers size={13} className="text-yellow-500" />
                      {sub.studentsCount} Students
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      navigate(`/teacher/subjects/${sub.id}`);
                    }}
                    className="w-8 h-8 rounded-full bg-blue-500/10 hover:bg-blue-500/20 flex items-center justify-center text-blue-400 hover:text-white transition-all cursor-pointer"
                  >
                    <FiChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default TeacherSubjects;
