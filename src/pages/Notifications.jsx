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
  FiChevronLeft,
  FiAlertCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout';
import { 
  fetchNotifications, 
  markAllNotificationsRead, 
  markNotificationRead, 
  deleteNotification 
} from '../redux/slices/notificationsSlice';
import Skeleton from 'react-loading-skeleton';

const Notifications = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  const role = user?.role || 'student';

  const { notifications, isLoading } = useSelector((state) => state.notifications);

  // Modal State for Delete
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null, // null for "all", otherwise notification ID
  });

  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  // Format date helper
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recently';
    
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Icon selector based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'exam_result':
        return { icon: FiClipboard, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'new_lesson':
        return { icon: FiBookOpen, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
      case 'coupon_used':
        return { icon: FiTag, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' };
      case 'enrollment':
        return { icon: FiUser, color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' };
      case 'system':
        return { icon: FiShield, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      case 'reminder':
        return { icon: FiClock, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' };
      default:
        return { icon: FiBell, color: 'text-gray-400 bg-gray-500/10 border-gray-500/20' };
    }
  };

  const handleMarkRead = (id, isRead) => {
    if (!isRead) {
      dispatch(markNotificationRead(id));
    }
  };

  const handleOpenDeleteModal = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteModal.id === 'all') {
        // Clear all notifications
        // Note: Backend doesn't have "delete all" but we can iterate or mark all read.
        // Let's implement clearing all in UI and triggering markAllNotificationsRead
        await dispatch(markAllNotificationsRead()).unwrap();
        toast.success('All notifications marked as read');
      } else {
        await dispatch(deleteNotification(deleteModal.id)).unwrap();
        toast.success('Notification deleted successfully');
      }
    } catch (err) {
      toast.error(err || 'Operation failed');
    } finally {
      setIsDeleting(false);
      setDeleteModal({ isOpen: false, id: null });
    }
  };

  const hasUnread = notifications.some(n => !n.isRead);

  // Theme support
  const [isLight, setIsLight] = useState(localStorage.getItem('theme') === 'light');

  useEffect(() => {
    const handleThemeChange = () => {
      setIsLight(localStorage.getItem('theme') === 'light');
    };
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  const textPrimary = isLight ? 'text-[#0f172a]' : 'text-white';
  const textSecondary = isLight ? 'text-gray-600' : 'text-gray-400';
  const cardBg = isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#0f111a]/65 border-gray-800/80';

  return (
    <DashboardLayout
      role={role}
      activeTab=""
      title="Notifications"
      subtitle="Stay updated with recent alerts 🔔"
      showBackButton
      onBackClick={() => navigate(`/${role}/dashboard`)}
      headerActions={
        hasUnread && (
          <button
            onClick={() => dispatch(markAllNotificationsRead())}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-black hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            <FiCheckCircle />
            Mark All Read
          </button>
        )
      }
    >
      <div className="max-w-4xl mx-auto p-6 md:p-8 text-left pb-32">
        
        {/* Banner Card */}
        <div className={`p-6 rounded-[2.5rem] ${cardBg} backdrop-blur-xl mb-6 relative overflow-hidden flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] shrink-0">
              <FiBell size={26} className="animate-swing" />
            </div>
            <div>
              <h3 className={`text-xl font-black ${textPrimary}`}>Alerts & Notifications</h3>
              <p className={`text-xs font-semibold ${textSecondary}`}>
                You have {notifications.filter(n => !n.isRead).length} unread notifications.
              </p>
            </div>
          </div>

          {notifications.length > 0 && (
            <button
              onClick={() => handleOpenDeleteModal('all')}
              disabled={isLoading}
              className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer disabled:opacity-50"
              title="Clear all"
            >
              <FiTrash2 size={18} />
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex flex-col gap-3">
          {isLoading ? (
            // Skeleton Loader
            [1, 2, 3, 4].map((i) => (
              <div key={i} className={`p-4 rounded-3xl ${cardBg} flex gap-4 items-center animate-pulse`}>
                <div className="w-11 h-11 rounded-xl bg-gray-800 shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-800 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-800 rounded w-2/3" />
                </div>
              </div>
            ))
          ) : notifications.length > 0 ? (
            <AnimatePresence initial={false}>
              {notifications.map((n) => {
                const iconConfig = getNotificationIcon(n.type);
                const Icon = iconConfig.icon;
                return (
                  <motion.div
                    key={n._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    onClick={() => handleMarkRead(n._id, n.isRead)}
                    className={`p-4 sm:p-5 rounded-3xl border flex gap-4 items-start transition-all relative group cursor-pointer ${
                      n.isRead 
                        ? `${isLight ? 'bg-gray-50/50 border-gray-200' : 'bg-transparent border-gray-900/60'} opacity-75` 
                        : `${isLight ? 'bg-indigo-50/20 border-indigo-100' : 'bg-[#141727]/75 border-gray-800/80'} shadow-[0_4px_20px_rgba(0,0,0,0.15)]`
                    }`}
                  >
                    {/* Unread indicator */}
                    {!n.isRead && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
                    )}

                    {/* Icon */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${iconConfig.color}`}>
                      <Icon size={18} />
                    </div>

                    {/* Text content */}
                    <div className="flex-1 min-w-0 pr-8">
                      <p className={`text-sm sm:text-base font-black ${textPrimary} truncate`}>
                        {n.title}
                      </p>
                      <p className={`text-xs sm:text-sm font-bold ${textSecondary} mt-1 leading-relaxed`}>
                        {n.body}
                      </p>
                      <span className="text-[10px] font-semibold text-gray-500 mt-2 flex items-center gap-1">
                        <FiClock size={11} />
                        {formatDate(n.createdAt)}
                      </span>
                    </div>

                    {/* Delete button (shows on hover/tap) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDeleteModal(n._id);
                      }}
                      className="absolute right-4 top-4 sm:top-1/2 sm:-translate-y-1/2 p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer focus:opacity-100"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          ) : (
            // Empty State
            <div className={`p-12 text-center rounded-[2.5rem] border ${cardBg} flex flex-col items-center justify-center gap-4`}>
              <div className="w-16 h-16 rounded-full bg-gray-500/5 flex items-center justify-center text-gray-500">
                <FiBell size={28} className="opacity-40" />
              </div>
              <div>
                <h4 className={`text-lg font-black ${textPrimary}`}>All Caught Up!</h4>
                <p className={`text-sm font-semibold ${textSecondary} mt-1`}>
                  You don't have any notifications right now.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteModal.isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-[#0f111a] border border-gray-800 rounded-[2.5rem] p-6 max-w-md w-full text-center shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-scale-up">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-4">
                <FiAlertCircle size={28} />
              </div>
              <h3 className="text-xl font-black text-white">
                {deleteModal.id === 'all' ? 'Mark All Read?' : 'Delete Notification?'}
              </h3>
              <p className="text-sm text-gray-400 font-semibold mt-2">
                {deleteModal.id === 'all'
                  ? 'Are you sure you want to mark all notifications as read?'
                  : 'Are you sure you want to delete this notification? This action cannot be undone.'}
              </p>
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  onClick={() => setDeleteModal({ isOpen: false, id: null })}
                  disabled={isDeleting}
                  className="px-5 py-3 rounded-2xl bg-gray-800/40 hover:bg-gray-800 border border-gray-700 text-gray-300 font-bold text-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-5 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
