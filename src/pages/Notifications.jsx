import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBell, 
  FiTrash2, 
  FiCheckCircle, 
  FiBookOpen, 
  FiShield, 
  FiUser, 
  FiClipboard, 
  FiTag, 
  FiClock, 
  FiSend,
  FiRotateCcw,
  FiLink,
  FiUsers,
  FiGrid,
  FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout';
import { 
  fetchNotifications, 
  markAllNotificationsRead, 
  markNotificationRead, 
  deleteNotification 
} from '../redux/slices/notificationsSlice';
import { 
  sendAdminNotification, 
  fetchNotificationHistory,
  fetchAllSubjects,
  fetchAllUsers 
} from '../redux/slices/adminSlice';
import { useLanguage } from '../context/LanguageContext';
import Skeleton from 'react-loading-skeleton';

const Notifications = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();

  const user = useSelector((state) => state.auth.user);
  const role = user?.role || 'student';
  const isAdmin = role === 'admin';

  const { notifications, isLoading } = useSelector((state) => state.notifications);
  const { notificationHistory, subjects, users } = useSelector((state) => state.admin);

  // Admin Tab: 'compose' or 'history'
  const [adminTab, setAdminTab] = useState('compose');

  // Broadcast Composer State
  const [mode, setMode] = useState('all'); // all, non_subscribed, all_subscribed, course, courses, user
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  
  // Deep Link State
  const [deepLinkType, setDeepLinkType] = useState('none'); // none, course, lesson, exam
  const [deepLinkId, setDeepLinkId] = useState('');
  const [isSending, setIsSending] = useState(false);

  // User Search State for 'user' mode
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    dispatch(fetchNotifications());
    if (isAdmin) {
      dispatch(fetchNotificationHistory());
      dispatch(fetchAllSubjects());
      dispatch(fetchAllUsers({ role: 'student', limit: 1000 }));
    }
  }, [dispatch, isAdmin]);

  // Handle Send Notification Broadcast
  const handleSendBroadcast = async (e) => {
    e.preventDefault();

    if (!title.trim() || !body.trim()) {
      toast.error('Title and message body are required.');
      return;
    }

    if (mode === 'course' && !selectedCourse) {
      toast.error('Please select a course for this broadcast.');
      return;
    }

    if (mode === 'courses' && selectedCourses.length === 0) {
      toast.error('Please select at least one course.');
      return;
    }

    if (mode === 'user' && !selectedUser) {
      toast.error('Please select a recipient user.');
      return;
    }

    const payload = {
      mode,
      title: title.trim(),
      body: body.trim(),
      courseIds: mode === 'course' ? [selectedCourse] : mode === 'courses' ? selectedCourses : undefined,
      userId: mode === 'user' ? selectedUser : undefined,
      deepLink: deepLinkType !== 'none' && deepLinkId ? { type: deepLinkType, id: deepLinkId.trim() } : undefined,
    };

    const loadToast = toast.loading('Sending broadcast notification...');
    setIsSending(true);
    try {
      const res = await dispatch(sendAdminNotification(payload)).unwrap();
      toast.dismiss(loadToast);
      toast.success(`Notification sent successfully to ${res.sentCount || 'targeted'} user(s)! 🚀`);
      
      // Reset Form
      setTitle('');
      setBody('');
      setMode('all');
      setSelectedCourse('');
      setSelectedCourses([]);
      setSelectedUser('');
      setDeepLinkType('none');
      setDeepLinkId('');
      
      // Refresh History
      dispatch(fetchNotificationHistory());
    } catch (err) {
      toast.dismiss(loadToast);
      toast.error(err || 'Failed to send notification');
    } finally {
      setIsSending(false);
    }
  };

  // Helper date formatter
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleString(isRTL ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <DashboardLayout
      role={role}
      activeTab=""
      title={t('notif.title')}
      subtitle={isAdmin ? t('notif.subtitleAdmin') : t('notif.subtitleUser')}
      showBackButton
      onBackClick={() => navigate(`/${role}/dashboard`)}
    >
      <div className="max-w-4xl mx-auto p-4 md:p-8 text-left pb-32 flex flex-col gap-6">
        
        {/* Admin Navigation Segmented Control */}
        {isAdmin && (
          <div className="grid grid-cols-2 p-1.5 bg-[#0c0d19] border border-gray-800 rounded-2xl gap-1 shrink-0">
            <button
              onClick={() => setAdminTab('compose')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-extrabold transition-all duration-300 cursor-pointer ${
                adminTab === 'compose'
                  ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-[0_4px_20px_rgba(239,68,68,0.3)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FiSend size={16} />
              <span>{t('notif.sendBroadcast')}</span>
            </button>
            <button
              onClick={() => setAdminTab('history')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-extrabold transition-all duration-300 cursor-pointer ${
                adminTab === 'history'
                  ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-[0_4px_20px_rgba(239,68,68,0.3)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FiRotateCcw size={16} />
              <span>{t('notif.history')}</span>
            </button>
          </div>
        )}

        {/* 1. Admin Composer View (Requirement 4) */}
        {isAdmin && adminTab === 'compose' && (
          <div className="bg-[#0e101a] border border-gray-800/80 rounded-[2.5rem] p-6 md:p-8 shadow-xl flex flex-col gap-6">
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <FiSend size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white leading-tight">Compose Targeted Notification</h3>
                <p className="text-xs font-semibold text-gray-400 mt-0.5">
                  Broadcast push alerts to specific groups, courses, or individual students.
                </p>
              </div>
            </div>

            <form onSubmit={handleSendBroadcast} className="flex flex-col gap-5">
              
              {/* Target Mode Selector Buttons */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Target Audience</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                  {[
                    { id: 'all', label: 'All Users', desc: 'Every registered user' },
                    { id: 'non_subscribed', label: 'Registered Non-Subscribed', desc: 'Users without active course' },
                    { id: 'all_subscribed', label: 'All Subscribed', desc: 'Students with active course' },
                    { id: 'course', label: 'Specific Course', desc: 'Enrolled in one course' },
                    { id: 'courses', label: 'Multiple Courses', desc: 'Enrolled in selected courses' },
                    { id: 'user', label: 'One Specific User', desc: 'Direct message to student' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMode(m.id)}
                      className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        mode === m.id
                          ? 'border-red-500 bg-red-500/10 text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                          : 'border-gray-800 bg-[#07080e]/50 text-gray-400 hover:border-gray-700 hover:text-gray-200'
                      }`}
                    >
                      <span className="text-xs font-black">{m.label}</span>
                      <span className="text-[10px] text-gray-500 mt-1">{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Target Selectors */}
              {mode === 'course' && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Select Course</label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full p-3.5 bg-[#07080e] border border-gray-800 rounded-2xl text-sm font-semibold text-white focus:outline-none focus:border-red-500/50"
                  >
                    <option value="">Select Target Course</option>
                    {subjects?.map((s) => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {mode === 'courses' && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Select Multiple Courses</label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-[#07080e] border border-gray-800 rounded-2xl">
                    {subjects?.map((s) => {
                      const isSelected = selectedCourses.includes(s._id);
                      return (
                        <button
                          key={s._id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedCourses(selectedCourses.filter(id => id !== s._id));
                            } else {
                              setSelectedCourses([...selectedCourses, s._id]);
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                              : 'border-gray-800 text-gray-400 hover:text-white'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}{s.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {mode === 'user' && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Select Specific User</label>
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full p-3.5 bg-[#07080e] border border-gray-800 rounded-2xl text-sm font-semibold text-white focus:outline-none focus:border-red-500/50"
                  >
                    <option value="">Select Target Student</option>
                    {users?.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Title & Body Inputs */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Notification Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. New Exam Available or Offer!"
                    className="w-full p-3.5 bg-[#07080e] border border-gray-800 rounded-2xl text-sm font-semibold text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Notification Body Message</label>
                  <textarea
                    rows={3}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Write detailed message to send..."
                    className="w-full p-3.5 bg-[#07080e] border border-gray-800 rounded-2xl text-sm font-semibold text-white focus:outline-none focus:border-red-500/50 resize-none"
                  />
                </div>
              </div>

              {/* Deep Link Section (Requirement 4) */}
              <div className="p-4 bg-[#07080e]/60 border border-gray-800/80 rounded-2xl flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-blue-400">
                  <FiLink size={14} />
                  <span>Deep Link Attachment (Optional)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select
                    value={deepLinkType}
                    onChange={(e) => setDeepLinkType(e.target.value)}
                    className="w-full p-3 bg-[#0c0d19] border border-gray-800 rounded-xl text-xs font-bold text-white focus:outline-none"
                  >
                    <option value="none">No Deep Link</option>
                    <option value="course">Link to Course</option>
                    <option value="lesson">Link to Lesson</option>
                    <option value="exam">Link to Exam</option>
                  </select>

                  {deepLinkType !== 'none' && (
                    <input
                      type="text"
                      value={deepLinkId}
                      onChange={(e) => setDeepLinkId(e.target.value)}
                      placeholder={`Enter ${deepLinkType} ID`}
                      className="w-full p-3 bg-[#0c0d19] border border-gray-800 rounded-xl text-xs font-bold text-white focus:outline-none"
                    />
                  )}
                </div>
              </div>

              {/* Submit Broadcast Button */}
              <button
                type="submit"
                disabled={isSending}
                className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white rounded-2xl font-black text-sm shadow-[0_4px_25px_rgba(239,68,68,0.4)] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                <FiSend size={18} />
                <span>{isSending ? 'Sending Broadcast...' : 'Send Broadcast Notification'}</span>
              </button>

            </form>
          </div>
        )}

        {/* 2. Admin History View (Requirement 4) */}
        {isAdmin && adminTab === 'history' && (
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-black text-white">Broadcast History</h3>
            
            {notificationHistory.length === 0 ? (
              <div className="p-8 text-center bg-[#0e101a] border border-gray-800 rounded-3xl text-gray-500 font-bold">
                No past broadcast notifications recorded yet.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {notificationHistory.map((item, idx) => (
                  <div key={item._id || item.createdAt || idx} className="p-5 bg-[#0e101a] border border-gray-800/80 rounded-3xl shadow-lg flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                          <FiBell size={18} />
                        </div>
                        <div>
                          <h4 className="text-base font-extrabold text-white leading-tight">{item.title}</h4>
                          <span className="text-xs font-bold text-gray-400 mt-0.5 block">{item.body}</span>
                        </div>
                      </div>

                      <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase rounded-full">
                        {item.targetMeta?.mode || item.targetMode || 'Broadcast'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-xs font-semibold text-gray-500 pt-2 border-t border-gray-800/50">
                      <span>Recipients: {item.recipientCount || 1} student(s)</span>
                      <span>Sent: {formatDate(item.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. Non-Admin / Standard Received Alerts View */}
        {(!isAdmin || adminTab === 'compose') && (
          <div className="flex flex-col gap-3 mt-4">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t('notif.yourNotifs')}</h4>
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div key={n._id} className="p-4 bg-[#0e101a]/60 border border-gray-800/80 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FiBell className="text-indigo-400" />
                    <div>
                      <h5 className="text-xs font-black text-white">{n.title}</h5>
                      <p className="text-[11px] text-gray-400 font-semibold">{n.body}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500">{formatDate(n.createdAt)}</span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-gray-500 font-bold bg-[#0e101a]/30 rounded-2xl">
                {t('notif.noNotifs')}
              </div>
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default Notifications;
