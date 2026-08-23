import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, updateProfile } from '../../redux/slices/authSlice';
import { 
  fetchParentProfile, 
  fetchChildrenList, 
  unlinkChild 
} from '../../redux/slices/parentsSlice';
import {
  FiEdit3,
  FiX,
  FiCheck,
  FiUser,
  FiMail,
  FiPhone,
  FiChevronRight,
  FiLogOut,
  FiBell,
  FiMoon,
  FiSun,
  FiStar,
  FiShield,
  FiTrash2,
  FiUsers,
  FiCalendar,
  FiEye,
  FiGlobe
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import { useLanguage } from '../../context/LanguageContext';

/* ─── Toggle Switch ─────────────────────────────────────────── */
const Toggle = ({ value, onChange, activeColor = 'bg-purple-500', isRTL = false, isLight = false }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={`relative w-12 h-6 rounded-full transition-all duration-300 cursor-pointer shrink-0 ${
      value ? activeColor : (isLight ? 'bg-slate-300 border border-slate-400' : 'bg-gray-700')
    }`}
  >
    <span
      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${
        value 
          ? (isRTL ? 'right-6' : 'left-6') 
          : (isRTL ? 'right-0.5' : 'left-0.5')
      }`}
    />
  </button>
);

const ParentSettings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, isRTL, language, changeLanguage } = useLanguage();

  const user = useSelector((state) => state.auth.user);
  const { children, childSubjects, childResultsData, isLoading, isActionLoading } = useSelector((state) => state.parent);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  const [pushNotifs, setPushNotifs] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  // Confirmation modal states
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [childToUnlink, setChildToUnlink] = useState(null);
  const [isUnlinking, setIsUnlinking] = useState(false);

  // Load parent stats and children on mount
  useEffect(() => {
    dispatch(fetchParentProfile());
    dispatch(fetchChildrenList()).unwrap().then((kids) => {
      if (kids && kids.length > 0) {
        kids.forEach((k) => {
          dispatch(fetchChildSubjects(k._id));
          dispatch(fetchChildResults({ childId: k._id }));
        });
      }
    });
  }, [dispatch]);

  // Sync state values when user object changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  // Sync theme with the rest of the app
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
    window.dispatchEvent(new Event('themeChange'));
  }, [theme]);

  // Stats derived from children
  const totalExams = children.reduce((acc, c) => acc + (c.totalExams || 0), 0);
  const avgScore = children.length > 0
    ? Math.round(
        children.reduce((acc, c) => {
          if (c.avgScore > 0) return acc + c.avgScore;
          const subjAvg = childSubjects && childSubjects.length > 0
            ? (childSubjects.reduce((sum, s) => sum + (s.averageScore || 0), 0) / childSubjects.length)
            : 0;
          const resultAvg = childResultsData?.stats?.avgScore || 0;
          return acc + (subjAvg || resultAvg || 0);
        }, 0) / children.length
      )
    : 0;

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error(isRTL ? 'الاسم مطلوب' : 'Name is required');
      return;
    }
    try {
      await dispatch(updateProfile({ name, email, phone })).unwrap();
      setIsEditOpen(false);
      toast.success(isRTL ? 'تم تحديث الملف الشخصي بنجاح!' : 'Profile updated successfully!');
    } catch (err) {
      toast.error(err || (isRTL ? 'فشل تحديث إعدادات الملف الشخصي' : 'Failed to update profile settings'));
    }
  };

  const handleUnlink = (childId) => {
    setChildToUnlink(childId);
    setIsConfirmOpen(true);
  };

  const handleConfirmUnlink = async () => {
    if (!childToUnlink) return;
    setIsUnlinking(true);
    try {
      const res = await dispatch(unlinkChild(childToUnlink)).unwrap();
      toast.success(res?.message || (isRTL ? 'تم إلغاء ربط الابن بنجاح' : 'Child unlinked successfully'));
      setIsConfirmOpen(false);
      setChildToUnlink(null);
    } catch (err) {
      toast.error(err || (isRTL ? 'فشل إلغاء ربط الابن' : 'Failed to unlink child'));
    } finally {
      setIsUnlinking(false);
    }
  };

  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'PA';
  const isDark = theme === 'dark';
  const isModalOpen = isEditOpen || isConfirmOpen;

  return (
    <DashboardLayout
      role="parent"
      activeTab="settings"
      title={t('admin.settings.title')}
      subtitle={t('admin.settings.subtitle')}
      isModalOpen={isModalOpen}
    >
      <div className={`flex flex-col pb-36 lg:pb-16 transition-all duration-300 text-start ${isModalOpen ? 'blur-sm pointer-events-none' : ''}`}>

        {/* ── HERO BANNER ── */}
        <div className="relative bg-gradient-to-br from-purple-700/90 to-indigo-600/90 mx-5 mt-4 rounded-3xl overflow-hidden shadow-[0_15px_30px_rgba(139,92,246,0.2)] preserve-white">
          {/* Decorative circles */}
          <div className={`absolute -top-8 ${isRTL ? '-left-8' : '-right-8'} w-32 h-32 rounded-full bg-white/5 border border-white/10 pointer-events-none`} />
          <div className={`absolute -bottom-6 ${isRTL ? '-right-6' : '-left-6'} w-24 h-24 rounded-full bg-white/5 border border-white/10 pointer-events-none`} />

          {/* Edit button */}
          <button
            onClick={() => {
              if (user) {
                setName(user.name || '');
                setEmail(user.email || '');
                setPhone(user.phone || '');
              }
              setIsEditOpen(true);
            }}
            className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} w-10 h-10 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer z-10`}
          >
            <FiEdit3 size={16} />
          </button>

          {/* Avatar + Info */}
          <div className="flex flex-col items-center gap-3 pt-6 px-6 pb-5 relative z-10 text-center">
            <div className="w-24 h-24 rounded-[2rem] bg-white/15 border-2 border-white/30 flex items-center justify-center font-black text-3xl text-white shadow-[0_0_25px_rgba(139,92,246,0.3)]">
              {initials}
            </div>
            <div>
              <h2 className="text-2xl font-black text-white capitalize">{user?.name}</h2>
              <p className="text-white/70 text-sm font-semibold mt-0.5">{user?.email}</p>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white text-[10px] font-extrabold tracking-wide uppercase">
                <FiUsers size={11} /> {isRTL ? "ولي أمر" : "Parent"}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white text-[10px] font-extrabold tracking-wide uppercase">
                <FiCalendar size={11} /> {isRTL ? "حساب نشط" : "Active Account"}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white text-[10px] font-extrabold tracking-wide uppercase">
                <FiEye size={11} /> {children.length} {isRTL ? "أبناء مرتبطين" : "Children Linked"}
              </span>
            </div>
          </div>

          {/* Stats row — inside the hero card */}
          <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/15 relative z-10">
            {[
              { label: isRTL ? 'الأبناء' : 'Children', value: children.length, icon: FiEye, iconBg: 'bg-white/15', iconColor: 'text-emerald-300' },
              { label: isRTL ? 'الاختبارات المجراة' : 'Exams Taken', value: totalExams, icon: FiCalendar, iconBg: 'bg-white/15', iconColor: 'text-blue-300' },
              { label: isRTL ? 'متوسط النسبة' : 'Avg Score', value: `${avgScore}%`, icon: FiStar, iconBg: 'bg-white/15', iconColor: 'text-yellow-300' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex flex-col items-center justify-center gap-1.5 py-4 px-2">
                  <div className={`w-9 h-9 rounded-full ${s.iconBg} flex items-center justify-center`}>
                    <Icon className={s.iconColor} size={16} />
                  </div>
                  <span className="text-xl font-black text-white">{s.value}</span>
                  <span className="text-[9px] font-bold text-white/50 uppercase tracking-wide">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── CONTENT SECTIONS ── */}
        <div className="flex flex-col gap-6 px-5 mt-6">

          {/* ── My Children ── */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5 px-1">
              <div className="w-7 h-7 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <FiUsers size={15} />
              </div>
              <h3 className="text-xs sm:text-sm md:text-base font-black text-gray-400 uppercase tracking-wider text-start">{isRTL ? "أبنائي" : "My Children"}</h3>
            </div>
            {isLoading && children.length === 0 ? (
              <TableRowSkeleton />
            ) : children.length === 0 ? (
              <div className="p-8 text-center bg-[#0c0d19]/40 border border-gray-800 rounded-3xl">
                <p className="text-sm sm:text-base font-bold text-gray-500">{isRTL ? "لم يتم ربط أية أبناء بعد." : "No children linked yet."}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {children.map((c) => {
                  const childInitials = c.name ? c.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'ST';
                  return (
                    <div
                      key={c._id}
                      className="flex items-center gap-4 p-4 sm:p-5 bg-[#0c0d19]/40 hover:bg-[#121424] border border-gray-800/80 rounded-2xl sm:rounded-3xl transition-all"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-black text-lg text-white shrink-0">
                        {childInitials}
                      </div>
                      <div className="flex-1 min-w-0 text-start">
                        <p className="text-sm sm:text-base font-black text-white capitalize">{c.name}</p>
                        <p className="text-xs text-gray-500 font-semibold mt-0.5">{c.totalExams || 0} {isRTL ? "اختبارات مجراة" : "exams taken"}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="px-2.5 py-0.5 rounded-md bg-orange-500/15 border border-orange-500/20 text-orange-400 text-xs font-black">
                            {c.avgScore || 0}% {isRTL ? "متوسط" : "avg"}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/20 text-amber-400 text-xs font-black">
                            {c.streak || 0} {isRTL ? "أيام حماسة" : "d streak"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => navigate('/parent/children')}
                          className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black hover:bg-emerald-500/20 transition-all cursor-pointer"
                        >
                          {isRTL ? "عرض" : "View"}
                        </button>
                        <button
                          disabled={isActionLoading}
                          onClick={() => handleUnlink(c._id)}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition-all cursor-pointer disabled:opacity-55"
                          title={isRTL ? "إلغاء ربط الابن" : "Unlink child"}
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Preferences ── */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5 px-1">
              <div className="w-7 h-7 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <FiBell size={15} />
              </div>
              <h3 className="text-xs sm:text-sm md:text-base font-black text-gray-400 uppercase tracking-wider text-start">{isRTL ? "التفضيلات" : "Preferences"}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Push Notifications */}
              <div className="flex items-center justify-between p-4 sm:p-5 bg-[#0c0d19]/40 border border-gray-800/80 rounded-2xl sm:rounded-3xl">
                <div className="flex items-center gap-4 text-start">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 shrink-0">
                    <FiBell className="text-lg sm:text-xl" />
                  </div>
                  <div>
                    <h5 className="text-sm sm:text-base md:text-lg font-black text-white leading-tight">{isRTL ? "إشعارات التنبيه" : "Push Notifications"}</h5>
                    <span className="text-xs sm:text-sm text-gray-500 font-semibold mt-1 block">{isRTL ? "استلام تقارير الأبناء" : "Receive sibling reports"}</span>
                  </div>
                </div>
                <Toggle value={pushNotifs} onChange={setPushNotifs} activeColor="bg-purple-500" isRTL={isRTL} isLight={!isDark} />
              </div>

              {/* Dark Mode */}
              <div className="flex items-center justify-between p-4 sm:p-5 bg-[#0c0d19]/40 border border-gray-800/80 rounded-2xl sm:rounded-3xl">
                <div className="flex items-center gap-4 text-start">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 shrink-0">
                    {isDark ? <FiMoon className="text-lg sm:text-xl" /> : <FiSun className="text-lg sm:text-xl" />}
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base md:text-lg font-black text-white leading-tight">{isRTL ? "الوضع الداكن" : "Dark Mode"}</h4>
                    <p className="text-xs sm:text-sm text-gray-500 font-semibold mt-1">{isRTL ? "تبديل مظهر اللوحة" : "Switch dashboard theme"}</p>
                  </div>
                </div>
                <Toggle value={isDark} onChange={(val) => setTheme(val ? 'dark' : 'light')} activeColor="bg-yellow-500" isRTL={isRTL} isLight={!isDark} />
              </div>

              {/* Language Switcher Card */}
              <div className="flex items-center justify-between p-4 sm:p-5 bg-[#0c0d19]/40 border border-gray-800/80 rounded-2xl sm:rounded-3xl">
                <div className="flex items-center gap-4 text-start">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                    <FiGlobe className="text-lg sm:text-xl" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base md:text-lg font-black text-white leading-tight">{isRTL ? "لغة الواجهة" : "App Language"}</h4>
                    <p className="text-xs sm:text-sm text-gray-500 font-semibold mt-1">{isRTL ? "العربية / English" : "English / العربية"}</p>
                  </div>
                </div>
                <div className="flex items-center bg-gray-950 p-1 rounded-xl border border-gray-800">
                  <button
                    type="button"
                    onClick={() => changeLanguage('en')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      language === 'en'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => changeLanguage('ar')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      language === 'ar'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    AR
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── About ── */}
          <div className="flex flex-col gap-3 text-start">
            <div className="flex items-center gap-2.5 px-1">
              <div className="w-7 h-7 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <FiShield size={15} />
              </div>
              <h3 className="text-xs sm:text-sm md:text-base font-black text-gray-400 uppercase tracking-wider">{isRTL ? "حول المنصة" : "About"}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => toast(isRTL ? 'شكراً لك على ملاحظاتك! 🌟' : 'Thank you for your feedback! 🌟')}
                className="flex items-center justify-between p-4 sm:p-5 bg-[#0c0d19]/40 hover:bg-[#121424] border border-gray-800/80 rounded-2xl sm:rounded-3xl cursor-pointer transition-all group text-start"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center text-yellow-400 shrink-0">
                    <FiStar className="text-lg sm:text-xl" />
                  </div>
                  <div>
                    <h5 className="text-sm sm:text-base md:text-lg font-black text-white leading-tight">{isRTL ? "تقييم التطبيق" : "Rate the App"}</h5>
                    <span className="text-xs sm:text-sm text-gray-500 font-semibold mt-1 block">{isRTL ? "مشاركة ملاحظاتك" : "Share feedback"}</span>
                  </div>
                </div>
                <FiChevronRight className={`text-gray-400 group-hover:translate-x-0.5 transition-transform shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={() => toast(isRTL ? 'فول مارك — منصة متابعة الأبناء v1.0.0' : 'FullMark — Sibling Tracker Platform v1.0.0')}
                className="flex items-center justify-between p-4 sm:p-5 bg-[#0c0d19]/40 hover:bg-[#121424] border border-gray-800/80 rounded-2xl sm:rounded-3xl cursor-pointer transition-all group text-start"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 shrink-0">
                    <FiShield className="text-lg sm:text-xl" />
                  </div>
                  <div>
                    <h5 className="text-sm sm:text-base md:text-lg font-black text-white leading-tight">{isRTL ? "عن فول مارك" : "About FullMark"}</h5>
                    <span className="text-xs sm:text-sm text-gray-500 font-semibold mt-1 block">{isRTL ? "الإصدار 1.0.0" : "Version 1.0.0"}</span>
                  </div>
                </div>
                <FiChevronRight className={`text-gray-400 group-hover:translate-x-0.5 transition-transform shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* ── Sign Out ── */}
          <button
            onClick={() => {
              dispatch(logoutUser());
              toast.success(isRTL ? 'تم تسجيل الخروج بنجاح!' : 'Signed out successfully!');
              navigate('/');
            }}
            className="w-full py-4 mt-2 border border-red-500/40 hover:border-red-500 bg-red-500/5 hover:bg-red-500/10 text-red-500 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all duration-300 active:scale-95 cursor-pointer shadow-sm"
          >
            <FiLogOut size={18} />
            <span>{isRTL ? "تسجيل الخروج" : "Sign Out"}</span>
          </button>

        </div>

      </div>

      {/* ── EDIT PROFILE MODAL ── */}
      {isEditOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setIsEditOpen(false)}
        >
          <div
            className="bg-[#0f1020] border border-gray-800 rounded-3xl p-6 w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.8)] animate-fade-in relative text-start"
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setIsEditOpen(false)}
              className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} w-8 h-8 rounded-full bg-gray-800/60 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer`}
            >
              <FiX size={16} />
            </button>

            <h3 className={`text-xl font-black text-white mb-5 ${isRTL ? 'pl-8' : 'pr-8'}`}>{isRTL ? "تعديل الملف الشخصي" : "Edit Profile"}</h3>

            <div className="flex flex-col gap-4">
              {[
                { key: 'name', label: isRTL ? 'الاسم الكامل' : 'Full Name', icon: FiUser, type: 'text', value: name, setter: setName },
                { key: 'email', label: isRTL ? 'البريد الإلكتروني' : 'Email Address', icon: FiMail, type: 'email', value: email, setter: setEmail, disabled: true },
                { key: 'phone', label: isRTL ? 'رقم الهاتف' : 'Phone Number', icon: FiPhone, type: 'tel', value: phone, setter: setPhone },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.key}
                    className={`flex items-center gap-3 px-4 py-3.5 bg-[#0c0d19] border border-gray-700 rounded-2xl focus-within:border-purple-500/60 transition-colors ${f.disabled ? 'opacity-60' : ''}`}
                  >
                    <Icon className="text-purple-400 shrink-0" size={15} />
                    <div className="flex flex-col flex-1 min-w-0 text-start">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-0.5">{f.label}</span>
                      <input
                        type={f.type}
                        value={f.value}
                        onChange={e => f.setter(e.target.value)}
                        disabled={f.disabled}
                        className="bg-transparent border-none outline-none text-white text-sm font-semibold placeholder:text-gray-700 focus:ring-0 w-full focus:outline-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsEditOpen(false)}
                className="flex-1 py-3.5 rounded-2xl border border-gray-700 text-gray-300 hover:border-gray-600 hover:text-white font-bold text-sm transition-all cursor-pointer"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black text-sm shadow-[0_4px_20px_rgba(168,85,247,0.3)] flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <FiCheck size={15} /> {isRTL ? "حفظ" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setChildToUnlink(null);
        }}
        onConfirm={handleConfirmUnlink}
        title={isRTL ? "إلغاء ربط الابن" : "Unlink Sibling"}
        message={isRTL ? "هل أنت تأكد من إلغاء ربط هذا الابن؟ سيؤدي ذلك إلى إزالة الوصول إلى تقارير أدائه واختباراته." : "Are you sure you want to unlink this child? This will remove access to their performance and exam reports."}
        confirmText={isRTL ? "إلغاء الربط" : "Unlink"}
        cancelText={isRTL ? "إلغاء" : "Cancel"}
        isDanger={true}
        isLoading={isUnlinking}
      />
    </DashboardLayout>
  );
};

export default ParentSettings;
