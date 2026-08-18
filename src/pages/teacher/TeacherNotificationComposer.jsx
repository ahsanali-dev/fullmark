import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSend, FiUsers, FiBookOpen, FiBell, FiCheck, FiChevronLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';

import DashboardLayout from '../../components/layout/DashboardLayout';
import { fetchTeacherSubjects, sendTeacherNotification } from '../../redux/slices/teacherSlice';

const TeacherNotificationComposer = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { subjects = [], isActionLoading } = useSelector((state) => state.teacher);

  const [mode, setMode] = useState('all'); // 'all' | 'subject'
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    dispatch(fetchTeacherSubjects());
  }, [dispatch]);

  useEffect(() => {
    if (subjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjects[0]._id || subjects[0].id);
    }
  }, [subjects, selectedSubjectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Notification title is required');
      return;
    }
    if (!body.trim()) {
      toast.error('Notification message body is required');
      return;
    }
    if (mode === 'subject' && !selectedSubjectId) {
      toast.error('Please select a subject');
      return;
    }

    const loadingToast = toast.loading('Sending push notification...');

    try {
      const payload = {
        mode,
        title,
        body,
        ...(mode === 'subject' ? { subjectId: selectedSubjectId } : {})
      };

      const res = await dispatch(sendTeacherNotification(payload)).unwrap();
      toast.success(res?.message || 'Notification sent successfully to students! 🚀', { id: loadingToast });
      setTitle('');
      setBody('');
    } catch (err) {
      toast.error(err || 'Failed to send notification', { id: loadingToast });
    }
  };

  return (
    <DashboardLayout
      role="teacher"
      activeTab="notifications"
      title="Notification Center"
      subtitle="Send broadcast announcements and updates to your students"
    >
      <div className="w-full max-w-3xl mx-auto p-4 md:p-8 pb-32 flex flex-col gap-6 text-left animate-fade-in">
        
        {/* Header Block */}
        <div className="flex items-center justify-between gap-4 pb-2 border-b border-gray-800/40">
          <div className="flex items-center">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer mr-3"
            >
              <FiChevronLeft size={20} />
            </button>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
                <FiBell className="text-indigo-400" /> Push Notification Center
              </h2>
              <p className="text-sm text-gray-500 font-semibold mt-1">Broadcast direct web & mobile push notifications to enrolled students</p>
            </div>
          </div>
        </div>

        {/* Notification Form Card */}
        <div className="p-6 md:p-8 bg-[#0e101a] border border-gray-800/80 rounded-[2.5rem] shadow-2xl flex flex-col gap-6">
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {/* Target Audience Mode Selection */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-black tracking-widest text-gray-400 uppercase">
                Target Audience
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode('all')}
                  className={`p-4 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                    mode === 'all'
                      ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.2)]'
                      : 'bg-[#121424] border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                    mode === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'
                  }`}>
                    <FiUsers size={20} />
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-extrabold">All Students</h4>
                    <p className="text-xs text-gray-500 font-medium">Broadcast to all enrolled students</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('subject')}
                  className={`p-4 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                    mode === 'subject'
                      ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.2)]'
                      : 'bg-[#121424] border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                    mode === 'subject' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
                  }`}>
                    <FiBookOpen size={20} />
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-extrabold">Specific Subject</h4>
                    <p className="text-xs text-gray-500 font-medium">Target a single course roster</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Subject Selector (if mode === 'subject') */}
            {mode === 'subject' && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black tracking-widest text-purple-400 uppercase">
                  Select Subject Roster
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full p-4 bg-[#121424] border border-gray-800 focus:border-purple-500/50 rounded-2xl text-white font-bold text-sm outline-none cursor-pointer"
                >
                  {subjects.map((sub) => (
                    <option key={sub._id || sub.id} value={sub._id || sub.id}>
                      {sub.title || sub.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Notification Title */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black tracking-widest text-gray-400 uppercase">
                Notification Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. New Exam Announcement or Weakness Improvement Tip"
                className="w-full p-4 bg-[#121424] border border-gray-800 focus:border-blue-500/50 rounded-2xl text-white font-bold text-base outline-none transition-all placeholder:text-gray-650"
                required
              />
            </div>

            {/* Message Body */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black tracking-widest text-gray-400 uppercase">
                Message Body
              </label>
              <textarea
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write message details for your students..."
                className="w-full p-4 bg-[#121424] border border-gray-800 focus:border-blue-500/50 rounded-2xl text-white font-semibold text-base outline-none resize-none transition-all placeholder:text-gray-650"
                required
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={isActionLoading}
              className="w-full py-4.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl font-black text-base shadow-[0_4px_25px_rgba(37,99,235,0.35)] flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 active:scale-98 disabled:opacity-50"
            >
              <FiSend size={18} />
              <span>{isActionLoading ? 'Broadcasting...' : 'Send Push Notification Now'}</span>
            </button>

          </form>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherNotificationComposer;
