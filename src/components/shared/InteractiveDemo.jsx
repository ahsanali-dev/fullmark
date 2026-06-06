import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiShield, FiBookOpen, FiAward, FiPlus, 
  FiCheck, FiX, FiUsers, FiHelpCircle, FiFileText 
} from 'react-icons/fi';

export const InteractiveDemo = () => {
  const [activeTab, setActiveTab] = useState('admin');
  const [userCount, setUserCount] = useState(1420);
  const [questionsCount, setQuestionsCount] = useState(48);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  const triggerNotification = (msg) => {
    setNotificationMsg(msg);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  const handleAddUserSim = () => {
    setUserCount(prev => prev + 1);
    triggerNotification('User created successfully (Simulated)');
  };

  const handleAddQuestionSim = () => {
    setQuestionsCount(prev => prev + 1);
    triggerNotification('Question added to Bank (Simulated)');
  };

  const renderDashboardContent = () => {
    switch (activeTab) {
      case 'admin':
        return (
          <motion.div 
            key="admin-demo"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-4 h-full justify-between"
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-white">System Admin Controls</h4>
                <p className="text-[10px] text-gray-500">Real-time user & role monitoring</p>
              </div>
              <button 
                onClick={handleAddUserSim}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[10px] font-bold cursor-pointer transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)]"
              >
                <FiPlus size={12} /> Add User
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-2xl bg-gray-950/60 border border-gray-800 flex flex-col items-center">
                <span className="text-sm font-black text-red-400">{userCount}</span>
                <span className="text-[9px] text-gray-500 uppercase font-semibold">Total Users</span>
              </div>
              <div className="p-3 rounded-2xl bg-gray-950/60 border border-gray-800 flex flex-col items-center">
                <span className="text-sm font-black text-white">12</span>
                <span className="text-[9px] text-gray-500 uppercase font-semibold">Subjects</span>
              </div>
              <div className="p-3 rounded-2xl bg-gray-950/60 border border-gray-800 flex flex-col items-center">
                <span className="text-sm font-black text-emerald-400">99.8%</span>
                <span className="text-[9px] text-gray-500 uppercase font-semibold">Uptime</span>
              </div>
            </div>

            <div className="bg-gray-950/40 border border-gray-850 rounded-2xl p-3 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Recent Activity Logs</span>
              <div className="flex items-center justify-between text-[10px] py-1 border-b border-gray-900">
                <span className="text-gray-300">New teacher registered</span>
                <span className="text-red-400 font-bold">Just now</span>
              </div>
              <div className="flex items-center justify-between text-[10px] py-1">
                <span className="text-gray-300">Chemistry quiz schedule updated</span>
                <span className="text-gray-500">2 mins ago</span>
              </div>
            </div>
          </motion.div>
        );

      case 'teacher':
        return (
          <motion.div 
            key="teacher-demo"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-4 h-full justify-between"
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-white">Assessment Planner</h4>
                <p className="text-[10px] text-gray-500">Manage questions and schedules</p>
              </div>
              <button 
                onClick={handleAddQuestionSim}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-[10px] font-bold cursor-pointer transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)]"
              >
                <FiPlus size={12} /> Add Question
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-2xl bg-gray-950/60 border border-gray-800 flex flex-col items-center">
                <span className="text-sm font-black text-blue-400">4</span>
                <span className="text-[9px] text-gray-500 uppercase font-semibold">Active Exams</span>
              </div>
              <div className="p-3 rounded-2xl bg-gray-950/60 border border-gray-800 flex flex-col items-center">
                <span className="text-sm font-black text-white">{questionsCount}</span>
                <span className="text-[9px] text-gray-500 uppercase font-semibold">Questions Bank</span>
              </div>
              <div className="p-3 rounded-2xl bg-gray-950/60 border border-gray-800 flex flex-col items-center">
                <span className="text-sm font-black text-amber-400">82%</span>
                <span className="text-[9px] text-gray-500 uppercase font-semibold">Avg Score</span>
              </div>
            </div>

            <div className="bg-gray-950/40 border border-gray-850 rounded-2xl p-3 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Interactive PDF Parsing Tool</span>
              <div className="border border-dashed border-gray-800 rounded-xl p-2.5 flex items-center justify-center gap-2 bg-gray-900/10 cursor-pointer hover:bg-white/5 transition-all">
                <FiFileText className="text-blue-400" />
                <span className="text-[9px] text-gray-400">Drag & Drop Syllabus PDF for Auto-Quiz generation</span>
              </div>
            </div>
          </motion.div>
        );

      case 'student':
        return (
          <motion.div 
            key="student-demo"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-3 h-full justify-between"
          >
            <div>
              <h4 className="text-sm font-bold text-white">Interactive Assessment Mode</h4>
              <p className="text-[10px] text-gray-500">Answer the question below to test the platform</p>
            </div>

            <div className="p-3 rounded-2xl bg-gray-950/60 border border-gray-850 flex flex-col gap-2">
              <p className="text-[11px] font-black text-white">Q. Which element is represented by chemical symbol "O"?</p>
              
              <div className="grid grid-cols-2 gap-2 mt-1">
                {[
                  { key: 'A', text: 'Gold' },
                  { key: 'B', text: 'Oxygen' },
                  { key: 'C', text: 'Osmium' },
                  { key: 'D', text: 'Helium' }
                ].map((opt) => {
                  const isSelected = selectedAnswer === opt.key;
                  const isCorrect = opt.key === 'B';
                  let btnStyle = "bg-gray-900 hover:bg-gray-800/80 text-gray-300 border-gray-800";
                  
                  if (selectedAnswer !== null) {
                    if (isSelected) {
                      btnStyle = isCorrect 
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50" 
                        : "bg-red-500/20 text-red-400 border-red-500/50";
                    } else if (isCorrect) {
                      btnStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
                    }
                  }

                  return (
                    <button
                      key={opt.key}
                      disabled={selectedAnswer !== null}
                      onClick={() => {
                        setSelectedAnswer(opt.key);
                        if (opt.key === 'B') {
                          triggerNotification('Correct Answer! 🎉');
                        } else {
                          triggerNotification('Incorrect. Try again! ❌');
                        }
                      }}
                      className={`px-3 py-2 rounded-xl border text-[10px] font-semibold text-left transition-all ${btnStyle} ${selectedAnswer === null ? 'cursor-pointer active:scale-95' : ''}`}
                    >
                      <span className="font-bold mr-1">{opt.key}.</span> {opt.text}
                    </button>
                  );
                })}
              </div>

              {selectedAnswer !== null && (
                <button 
                  onClick={() => setSelectedAnswer(null)}
                  className="text-[9px] font-bold text-blue-400 hover:text-blue-300 cursor-pointer self-end mt-1"
                >
                  Reset Question
                </button>
              )}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const getActiveColors = () => {
    switch (activeTab) {
      case 'admin': return { border: 'border-red-500/30', glow: 'shadow-[0_0_50px_rgba(239,68,68,0.25)]', activeBtn: 'bg-red-500 text-white' };
      case 'teacher': return { border: 'border-blue-500/30', glow: 'shadow-[0_0_50px_rgba(59,130,246,0.25)]', activeBtn: 'bg-blue-500 text-white' };
      case 'student': return { border: 'border-emerald-500/30', glow: 'shadow-[0_0_50px_rgba(16,185,129,0.25)]', activeBtn: 'bg-emerald-500 text-white' };
      default: return { border: 'border-gray-800', glow: '', activeBtn: '' };
    }
  };

  const style = getActiveColors();

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 relative px-4">
      {/* Tab Selectors */}
      <div className="flex justify-center bg-[#0e101a] border border-gray-800 rounded-2xl p-1.5 self-center max-w-sm w-full gap-1">
        {[
          { id: 'admin', label: 'Admin View', icon: FiShield },
          { id: 'teacher', label: 'Teacher View', icon: FiBookOpen },
          { id: 'student', label: 'Student View', icon: FiAward }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedAnswer(null);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSelected 
                  ? style.activeBtn 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* App Window Layout Mockup */}
      <div 
        className={`w-full bg-[#0c0d19] border ${style.border} rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] ${style.glow} transition-all duration-500 flex flex-col`}
      >
        {/* App Title Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-850 bg-gray-950/40">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-[10px] text-gray-500 font-bold tracking-wider uppercase">FullMark Live Interface Preview</span>
          <div className="w-10" />
        </div>

        {/* Outer Workspace */}
        <div className="flex h-[260px] md:h-[280px]">
          {/* Mock Sidebar */}
          <div className="w-16 md:w-44 border-r border-gray-850 bg-gray-950/20 p-2 md:p-3 flex flex-col justify-between hidden sm:flex">
            <div className="flex flex-col gap-1.5">
              <div className="h-6 w-full rounded bg-gray-900 opacity-60 mb-2" />
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className="flex items-center gap-2 p-1.5 rounded bg-gray-900/40">
                  <div className="w-3 h-3 rounded bg-gray-800 shrink-0" />
                  <div className="h-2 w-16 rounded bg-gray-800 hidden md:block" />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 p-1.5">
              <div className="w-5 h-5 rounded bg-gradient-to-r from-red-500 to-rose-500" />
              <div className="h-2 w-12 rounded bg-gray-800 hidden md:block" />
            </div>
          </div>

          {/* Mock Content Workspace */}
          <div className="flex-1 p-5 md:p-6 bg-[#0c0d19]/80 overflow-hidden relative">
            <AnimatePresence mode="wait">
              {renderDashboardContent()}
            </AnimatePresence>

            {/* Notification Alert overlay */}
            <AnimatePresence>
              {showNotification && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className="absolute bottom-4 right-4 bg-gray-950 border border-emerald-500/40 px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-[10px] font-bold text-white"
                >
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <FiCheck size={10} />
                  </div>
                  {notificationMsg}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
