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

const Notifications = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();

  const user = useSelector((state) => state.auth.user);
  const role = user?.role || 'student';
  const isAdmin = role === 'admin';

  // App Theme Sync
  const [theme, setTheme] = useState(localStorage.getItem('admin_theme') || localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const handleThemeChange = () => {
      const currentTheme = localStorage.getItem('admin_theme') || localStorage.getItem('theme') || 'dark';
      setTheme(currentTheme);
    };
    window.addEventListener('storage', handleThemeChange);
    const interval = setInterval(handleThemeChange, 500);
    return () => {
      window.removeEventListener('storage', handleThemeChange);
      clearInterval(interval);
    };
  }, []);

  const isLight = theme === 'light';

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
      toast.error(isRTL ? 'العنوان ونصف الرسالة مطلوبان' : 'Title and message body are required.');
      return;
    }

    if (mode === 'course' && !selectedCourse) {
      toast.error(isRTL ? 'يرجى تحديد مادة للبث' : 'Please select a course for this broadcast.');
      return;
    }

    if (mode === 'courses' && selectedCourses.length === 0) {
      toast.error(isRTL ? 'يرجى تحديد مادة واحدة على الأقل' : 'Please select at least one course.');
      return;
    }

    if (mode === 'user' && !selectedUser) {
      toast.error(isRTL ? 'يرجى تحديد مستخدم للمستلم' : 'Please select a recipient user.');
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

    const loadToast = toast.loading(isRTL ? 'جاري إرسال الإشعار الجماعي...' : 'Sending broadcast notification...');
    setIsSending(true);
    try {
      const res = await dispatch(sendAdminNotification(payload)).unwrap();
      toast.dismiss(loadToast);
      toast.success(isRTL ? `تم إرسال الإشعار بنجاح إلى ${res.sentCount || ''} مستخدم! 🚀` : `Notification sent successfully to ${res.sentCount || 'targeted'} user(s)! 🚀`);
      
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
      toast.error(err || (isRTL ? 'فشل إرسال الإشعار' : 'Failed to send notification'));
    } finally {
      setIsSending(false);
    }
  };

  // Helper date formatter
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return isRTL ? 'مؤخراً' : 'Recently';
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
          <div className={`grid grid-cols-2 p-1.5 border rounded-2xl gap-1 shrink-0 ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#0c0d19] border-gray-800'
          }`}>
            <button
              onClick={() => setAdminTab('compose')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-extrabold transition-all duration-300 cursor-pointer ${
                adminTab === 'compose'
                  ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-[0_4px_20px_rgba(239,68,68,0.3)]'
                  : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-white')
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
                  : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-white')
              }`}
            >
              <FiRotateCcw size={16} />
              <span>{t('notif.history')}</span>
            </button>
          </div>
        )}

        {/* 1. Admin Composer View */}
        {isAdmin && adminTab === 'compose' && (
          <div className={`border rounded-[2.5rem] p-6 md:p-8 shadow-xl flex flex-col gap-6 text-start ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0e101a] border-gray-800/80 text-white'
          }`}>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 dark:text-red-400 shrink-0">
                <FiSend size={22} />
              </div>
              <div className="text-start">
                <h3 className={`text-xl font-black leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {isRTL ? "إنشاء إشعار موجه" : "Compose Targeted Notification"}
                </h3>
                <p className={`text-xs font-semibold mt-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                  {isRTL ? "بث إشعارات فورية لمجموعات محددة، مواد، أو طلاب منفردين." : "Broadcast push alerts to specific groups, courses, or individual students."}
                </p>
              </div>
            </div>

            <form onSubmit={handleSendBroadcast} className="flex flex-col gap-5 text-start">
              
              {/* Target Mode Selector Buttons */}
              <div className="flex flex-col gap-2">
                <label className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                  {isRTL ? "الجمهور المستهدف" : "Target Audience"}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                  {[
                    { id: 'all', label: isRTL ? 'جميع المستخدمين' : 'All Users', desc: isRTL ? 'كل الحسابات المسجلة' : 'Every registered user' },
                    { id: 'non_subscribed', label: isRTL ? 'غير المشتركين' : 'Registered Non-Subscribed', desc: isRTL ? 'بدون مواد مفعلة' : 'Users without active course' },
                    { id: 'all_subscribed', label: isRTL ? 'المشتركون فقط' : 'All Subscribed', desc: isRTL ? 'طلاب مع مواد مفعلة' : 'Students with active course' },
                    { id: 'course', label: isRTL ? 'مادة محددة' : 'Specific Course', desc: isRTL ? 'مسجلون بمادة واحدة' : 'Enrolled in one course' },
                    { id: 'courses', label: isRTL ? 'مواد متعددة' : 'Multiple Courses', desc: isRTL ? 'مسجلون بمواد مختارة' : 'Enrolled in selected courses' },
                    { id: 'user', label: isRTL ? 'مستخدم محدد' : 'One Specific User', desc: isRTL ? 'رسالة مباشرة لطالب' : 'Direct message to student' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMode(m.id)}
                      className={`p-3.5 rounded-2xl border text-start flex flex-col justify-between transition-all cursor-pointer ${
                        mode === m.id
                          ? 'border-red-500 bg-red-500/10 text-red-600 dark:text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                          : (isLight ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100' : 'border-gray-800 bg-[#07080e]/50 text-gray-400 hover:text-gray-200')
                      }`}
                    >
                      <span className="text-xs font-black">{m.label}</span>
                      <span className={`text-[10px] mt-1 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Target Selectors */}
              {mode === 'course' && (
                <div className="flex flex-col gap-2">
                  <label className={`text-xs font-bold uppercase ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                    {isRTL ? "اختر المادة" : "Select Course"}
                  </label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className={`w-full p-3.5 border rounded-2xl text-sm font-semibold focus:outline-none transition-colors ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-red-500 focus:bg-white' : 'bg-[#161828] border-gray-700/80 !text-white focus:border-red-500'
                    }`}
                  >
                    <option value="" className={isLight ? 'bg-white text-slate-900' : 'bg-[#161828] text-white'}>{isRTL ? "اختر المادة المستهدفة" : "Select Target Course"}</option>
                    {subjects?.map((s) => (
                      <option key={s._id} value={s._id} className={isLight ? 'bg-white text-slate-900' : 'bg-[#161828] text-white'}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {mode === 'courses' && (
                <div className="flex flex-col gap-2">
                  <label className={`text-xs font-bold uppercase ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                    {isRTL ? "اختر مواد متعددة" : "Select Multiple Courses"}
                  </label>
                  <div className={`grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-2xl ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#161828] border-gray-700/80'
                  }`}>
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
                          className={`p-2.5 rounded-xl border text-xs font-bold text-start transition-all cursor-pointer ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : (isLight ? 'border-slate-200 text-slate-700 bg-white' : 'border-gray-700/60 text-gray-300 hover:text-white bg-[#0e101a]')
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
                  <label className={`text-xs font-bold uppercase ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                    {isRTL ? "اختر مستخدماً محدداً" : "Select Specific User"}
                  </label>
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className={`w-full p-3.5 border rounded-2xl text-sm font-semibold focus:outline-none transition-colors ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-red-500 focus:bg-white' : 'bg-[#161828] border-gray-700/80 !text-white focus:border-red-500'
                    }`}
                  >
                    <option value="" className={isLight ? 'bg-white text-slate-900' : 'bg-[#161828] text-white'}>{isRTL ? "اختر الطالب المستهدف" : "Select Target Student"}</option>
                    {users?.map((u) => (
                      <option key={u._id} value={u._id} className={isLight ? 'bg-white text-slate-900' : 'bg-[#161828] text-white'}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Title & Body Inputs */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
                    {isRTL ? "عنوان الإشعار" : "Notification Title"}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={isRTL ? "مثال: امتحان جديد متاح أو عرض جديد!" : "e.g. New Exam Available or Offer!"}
                    className={`w-full p-3.5 border rounded-2xl text-sm font-semibold focus:outline-none transition-colors ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:bg-white' : 'bg-[#161828] border-gray-700/80 !text-white placeholder:text-gray-400 focus:border-red-500 focus:bg-[#1a1c30]'
                    }`}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
                    {isRTL ? "نص الإشعار" : "Notification Body Message"}
                  </label>
                  <textarea
                    rows={3}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder={isRTL ? "اكتب تفاصيل الرسالة للإرسال..." : "Write detailed message to send..."}
                    className={`w-full p-3.5 border rounded-2xl text-sm font-semibold focus:outline-none resize-none transition-colors ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:bg-white' : 'bg-[#161828] border-gray-700/80 !text-white placeholder:text-gray-400 focus:border-red-500 focus:bg-[#1a1c30]'
                    }`}
                  />
                </div>
              </div>

              {/* Deep Link Section */}
              <div className={`p-4 border rounded-2xl flex flex-col gap-3 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#161828] border-gray-700/80'
              }`}>
                <div className="flex items-center gap-2 text-xs font-extrabold text-blue-600 dark:text-blue-400">
                  <FiLink size={14} />
                  <span>{isRTL ? "رابط سريع مدمج (اختياري)" : "Deep Link Attachment (Optional)"}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select
                    value={deepLinkType}
                    onChange={(e) => setDeepLinkType(e.target.value)}
                    className={`w-full p-3 border rounded-xl text-xs font-bold focus:outline-none ${
                      isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0e101a] border-gray-700 text-white'
                    }`}
                  >
                    <option value="none">{isRTL ? "بدون رابط" : "No Deep Link"}</option>
                    <option value="course">{isRTL ? "رابط لمادة" : "Link to Course"}</option>
                    <option value="lesson">{isRTL ? "رابط لدرس" : "Link to Lesson"}</option>
                    <option value="exam">{isRTL ? "رابط لامتحان" : "Link to Exam"}</option>
                  </select>

                  {deepLinkType !== 'none' && (
                    <input
                      type="text"
                      value={deepLinkId}
                      onChange={(e) => setDeepLinkId(e.target.value)}
                      placeholder={isRTL ? `أدخل معرف ${deepLinkType}` : `Enter ${deepLinkType} ID`}
                      className={`w-full p-3 border rounded-xl text-xs font-bold focus:outline-none ${
                        isLight ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400' : 'bg-[#0e101a] border-gray-700 !text-white placeholder:text-gray-400'
                      }`}
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
                <span>{isSending ? (isRTL ? 'جاري الإرسال...' : 'Sending Broadcast...') : (isRTL ? 'إرسال الإشعار الجماعي' : 'Send Broadcast Notification')}</span>
              </button>

            </form>
          </div>
        )}

        {/* 2. Admin History View */}
        {isAdmin && adminTab === 'history' && (
          <div className="flex flex-col gap-4 text-start">
            <h3 className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {isRTL ? "سجل الإشعارات الجماعية" : "Broadcast History"}
            </h3>
            
            {notificationHistory.length === 0 ? (
              <div className={`p-8 text-center border rounded-3xl font-bold ${
                isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-[#0e101a] border-gray-800 text-gray-500'
              }`}>
                {isRTL ? "لا توجد إشعارات جماعية سابقة مسجلة" : "No past broadcast notifications recorded yet."}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {notificationHistory.map((item, idx) => (
                  <div key={item._id || item.createdAt || idx} className={`p-5 border rounded-3xl shadow-sm flex flex-col gap-3 text-start ${
                    isLight ? 'bg-white border-slate-200' : 'bg-[#0e101a] border-gray-800/80'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
                          <FiBell size={18} />
                        </div>
                        <div className="text-start">
                          <h4 className={`text-base font-extrabold leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.title}</h4>
                          <span className={`text-xs font-bold mt-0.5 block ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{item.body}</span>
                        </div>
                      </div>

                      <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase rounded-full shrink-0">
                        {item.targetMeta?.mode || item.targetMode || 'Broadcast'}
                      </span>
                    </div>

                    <div className={`flex flex-wrap items-center justify-between text-xs font-semibold pt-2 border-t ${
                      isLight ? 'border-slate-100 text-slate-500' : 'border-gray-800/50 text-gray-500'
                    }`}>
                      <span>{isRTL ? `المستلمون: ${item.recipientCount || 1} طالب` : `Recipients: ${item.recipientCount || 1} student(s)`}</span>
                      <span>{isRTL ? `تاريخ الإرسال: ${formatDate(item.createdAt)}` : `Sent: ${formatDate(item.createdAt)}`}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. Non-Admin / Standard Received Alerts View */}
        {(!isAdmin || adminTab === 'compose') && (
          <div className="flex flex-col gap-3.5 mt-4 text-start">
            <h4 className={`text-xs sm:text-sm font-black uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              {t('notif.yourNotifs')}
            </h4>
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div key={n._id} className={`p-4 sm:p-5 md:p-6 border rounded-2xl sm:rounded-3xl flex items-center justify-between gap-4 text-start transition-all ${
                  isLight ? 'bg-white border-slate-200 shadow-sm hover:shadow-md' : 'bg-[#0e101a]/70 border-gray-800/80 hover:border-gray-700/80'
                }`}>
                  <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <FiBell className="text-lg sm:text-xl" />
                    </div>
                    <div className="text-start min-w-0">
                      <h5 className={`text-sm sm:text-base md:text-lg font-black leading-snug truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{n.title}</h5>
                      <p className={`text-xs sm:text-sm md:text-base font-medium mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>{n.body}</p>
                    </div>
                  </div>
                  <span className={`text-xs sm:text-sm font-semibold shrink-0 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{formatDate(n.createdAt)}</span>
                </div>
              ))
            ) : (
              <div className={`p-8 text-center text-sm font-bold rounded-2xl sm:rounded-3xl border ${
                isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-[#0e101a]/30 border-gray-800 text-gray-500'
              }`}>
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
