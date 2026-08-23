import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiAward,
  FiStar,
  FiBookOpen,
  FiBell,
  FiSun,
  FiMoon,
  FiLogOut,
  FiChevronRight,
  FiChevronLeft,
  FiCamera,
  FiLock,
  FiGlobe,
  FiUsers,
  FiCopy,
  FiCheck,
  FiX,
  FiCheckCircle,
  FiClock,
  FiVolume2
} from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, changePassword, updateProfile } from '../../redux/slices/authSlice';
import { fetchStudentProfile, fetchLinkCode, fetchMySubjects } from '../../redux/slices/studentSlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Input from '../../components/ui/Input';
import { ChangePasswordSchema } from '../../schemas/authSchemas';
import { useLanguage } from '../../context/LanguageContext';

const StudentProfileSchema = Yup.object().shape({
  name: Yup.string().required('Full Name is required'),
  phone: Yup.string().nullable(),
  bio: Yup.string().max(200, 'Bio must be less than 200 characters').nullable(),
});

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, isRTL, language, setLanguage: changeAppLanguage } = useLanguage();

  // Select state from redux thunks
  const user = useSelector((state) => state.auth.user);
  const { profile: studentProfile, linkCode, mySubjects } = useSelector((state) => state.student);

  // Profile fields state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');

  const [isLight, setIsLight] = useState(() => {
    return localStorage.getItem('theme') === 'light' || document.documentElement.classList.contains('light');
  });

  useEffect(() => {
    const handleThemeChange = () => {
      setIsLight(localStorage.getItem('theme') === 'light' || document.documentElement.classList.contains('light'));
    };
    handleThemeChange();
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  useEffect(() => {
    dispatch(fetchStudentProfile());
    dispatch(fetchLinkCode());
    dispatch(fetchMySubjects());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setBio(user.bio || '');
    }
  }, [user]);

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(language === 'ar' ? 'Arabic' : 'English');
  const [tempLanguage, setTempLanguage] = useState(language === 'ar' ? 'Arabic' : 'English');

  useEffect(() => {
    setSelectedLanguage(language === 'ar' ? 'Arabic' : 'English');
    setTempLanguage(language === 'ar' ? 'Arabic' : 'English');
  }, [language]);

  // Switch Toggles state
  const [pushNotifications, setPushNotifications] = useState(true);
  const [examReminders, setExamReminders] = useState(true);
  const [resultAlerts, setResultAlerts] = useState(true);
  const [soundEffects, setSoundEffects] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  // Theme Sync
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
    window.dispatchEvent(new Event('themeChange'));
  }, [theme]);

  // Copy Parent Code logic
  const handleCopyCode = () => {
    if (!linkCode) {
      toast.error(isRTL ? 'رمز الدعوة ليس جاهزاً بعد' : 'Invite code is not ready yet');
      return;
    }
    navigator.clipboard.writeText(linkCode);
    toast.success(isRTL ? 'تم نسخ رمز دعوة ولي الأمر! 📋' : 'Parent invite code copied! 📋');
  };

  // Profile form submission
  const handleProfileSave = async (values, { setSubmitting }) => {
    try {
      await dispatch(updateProfile({
        name: values.name,
        phone: values.phone,
        bio: values.bio
      })).unwrap();
      toast.success(isRTL ? 'تم تحديث إعدادات الملف الشخصي!' : 'Profile settings updated!');
      setIsEditProfileOpen(false);
    } catch (err) {
      toast.error(err || (isRTL ? 'فشل تحديث إعدادات الملف الشخصي.' : 'Failed to update profile settings.'));
    } finally {
      if (setSubmitting) setSubmitting(false);
    }
  };

  // Change Password form submission
  const handleUpdatePassword = async (values, { resetForm, setSubmitting }) => {
    const loadToast = toast.loading(isRTL ? 'جاري تحديث كلمة المرور...' : 'Updating password...');
    try {
      await dispatch(changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      })).unwrap();
      toast.dismiss(loadToast);
      toast.success(isRTL ? 'تم تحديث كلمة المرور بنجاح!' : 'Password updated successfully!');
      setIsChangePasswordOpen(false);
      resetForm();
    } catch (err) {
      toast.dismiss(loadToast);
      toast.error(err || (isRTL ? 'فشل تحديث كلمة المرور.' : 'Failed to update password.'));
    } finally {
      if (setSubmitting) setSubmitting(false);
    }
  };

  // Apply Language choice
  const handleApplyLanguage = () => {
    const langCode = tempLanguage === 'Arabic' ? 'ar' : 'en';
    changeAppLanguage(langCode);
    setSelectedLanguage(tempLanguage);
    setIsLanguageOpen(false);
    toast.success(tempLanguage === 'Arabic' ? 'تم تغيير اللغة إلى العربية!' : `Language set to ${tempLanguage}!`);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    toast.success(isRTL ? 'تم تسجيل الخروج بنجاح!' : 'Logged out successfully!');
    navigate('/');
  };

  // Initials for avatar
  const avatarInitials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'ST';

  const isModalActive = isEditProfileOpen || isChangePasswordOpen || isLanguageOpen;

  // Gamification metrics from studentProfile
  const points = studentProfile?.totalPoints || 0;
  const streak = studentProfile?.streakDays || 0;
  const averageScore = studentProfile?.averageScore || 0;
  const totalExams = studentProfile?.totalExamsTaken || 0;
  const passedExams = studentProfile?.totalExamsPassed || 0;
  const enrolledCoursesCount = mySubjects?.length || 0;
  const badgesCount = studentProfile?.badges?.length || 0;

  return (
    <DashboardLayout
      role="student"
      activeTab="profile"
      title={isRTL ? "الإعدادات" : "Settings"}
      subtitle={isRTL ? "تخصيص ملف الطالب وخيارات النظام" : "Customize student profile and system options"}
      disableScroll={true}
      isModalOpen={isModalActive}
    >
      {/* Main Container - Full Width layout matching teacher settings */}
      <div className="h-full flex flex-col px-4 md:px-8 py-4 overflow-hidden gap-5 animate-fade-in relative transition-all duration-300 text-start">

        {/* Scrollable Panel */}
        <div className="flex-1 overflow-y-auto pr-1 pb-36 flex flex-col gap-6">

          {/* 1. Hero Profile Banner */}
          <div className="w-full bg-gradient-to-br from-purple-700/90 to-indigo-600/90 text-white rounded-3xl p-6 text-center relative overflow-hidden shadow-[0_15px_30px_rgba(139,92,246,0.2)] shrink-0 preserve-white">
            {/* Banner Background decorative elements */}
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/5 border border-white/10" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5 border border-white/10" />

            {/* Header controls inside banner */}
            <div className="flex items-center justify-between z-10 relative">
              <button
                onClick={() => navigate('/student/dashboard')}
                className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all duration-300 cursor-pointer active:scale-95 border border-white/10"
              >
                {isRTL ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
              </button>
              <span className="text-sm font-black tracking-wide uppercase text-white preserve-white">{isRTL ? "ملفي الشخصي" : "My Profile"}</span>
              <button
                onClick={() => setIsEditProfileOpen(true)}
                className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all duration-300 cursor-pointer active:scale-95 border border-white/10"
              >
                <FiUser size={16} />
              </button>
            </div>

            {/* Avatar & User Details */}
            <div className="flex flex-col items-center gap-3 z-10 relative mt-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-[2rem] bg-white/15 border border-white/25 flex items-center justify-center text-white text-3xl font-black shadow-[0_0_25px_rgba(139,92,246,0.3)] preserve-white">
                  {avatarInitials}
                </div>
                <button
                  onClick={() => setIsEditProfileOpen(true)}
                  className={`absolute bottom-0 ${isRTL ? 'left-0' : 'right-0'} w-8 h-8 rounded-xl bg-yellow-500 text-gray-900 border-2 border-indigo-600 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg`}
                >
                  <FiCamera size={14} className="stroke-[2.5]" />
                </button>
              </div>
              <div className="flex flex-col items-center">
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight capitalize tracking-wide preserve-white">{name}</h3>
                <span className="text-xs sm:text-sm font-semibold text-white/90 mt-1 preserve-white-sub">{email}</span>
              </div>
            </div>

            {/* Horizontal Badge Tags Row */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 z-10 relative">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 text-[10px] font-extrabold tracking-wide uppercase text-white shadow-sm preserve-white">
                <FiBookOpen size={11} className="text-blue-200" /> {isRTL ? "طالب" : "Student"}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 text-[10px] font-extrabold tracking-wide uppercase text-white shadow-sm preserve-white">
                <FiStar size={11} className="text-yellow-300" /> {averageScore}% {isRTL ? "متوسط" : "avg"}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 text-[10px] font-extrabold tracking-wide uppercase text-white shadow-sm preserve-white">
                <FaFire size={11} className="text-pink-300" /> {streak}{isRTL ? "يوم متتالي" : "d streak"}
              </span>
            </div>
          </div>

          {/* 2. About Me & Learning Summary split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
            {/* About Me Card */}
            <div className={`p-6 border rounded-[2rem] shadow-lg flex flex-col gap-4 text-start ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c0d19]/40 border-gray-800/80'
              }`}>
              <div className={`flex justify-between items-center pb-2 border-b ${isLight ? 'border-slate-200' : 'border-gray-800/40'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <FiUser size={16} />
                  </div>
                  <h4 className={`text-sm font-extrabold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>{isRTL ? "نبذة عني" : "About Me"}</h4>
                </div>
                <button
                  onClick={() => setIsEditProfileOpen(true)}
                  className="text-xs font-extrabold text-purple-600 dark:text-purple-400 hover:text-purple-500 transition-colors cursor-pointer"
                >
                  {isRTL ? "تعديل" : "Edit"}
                </button>
              </div>

              {/* Bio display commented out for now */}
              {/* <p className={`text-xs font-semibold italic leading-relaxed ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                {bio ? `"${bio}"` : (isRTL ? 'لا يوجد نبذة شخصية بعد. اضغط تعديل للإضافة.' : 'No bio yet. Tap Edit to add one.')}
              </p> */}

              <div className={`flex flex-col gap-2.5 mt-2 text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                <div className="flex items-center gap-3">
                  <FiMail className={`${isLight ? 'text-slate-400' : 'text-gray-500'} text-sm shrink-0`} />
                  <span>{email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FiPhone className={`${isLight ? 'text-slate-400' : 'text-gray-500'} text-sm shrink-0`} />
                  <span>{phone || (isRTL ? 'غير مدخل' : 'Not provided')}</span>
                </div>
              </div>
            </div>

            {/* Learning summary Card */}
            <div className={`p-6 border rounded-[2rem] shadow-lg flex flex-col gap-4 text-start justify-between ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c0d19]/40 border-gray-800/80'
              }`}>
              <div className={`flex items-center gap-3 pb-2 border-b ${isLight ? 'border-slate-200' : 'border-gray-800/40'}`}>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <FiStar size={16} />
                </div>
                <h4 className={`text-sm font-extrabold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>{isRTL ? "ملخص التقدم" : "Progress Summary"}</h4>
              </div>

              <div className="flex flex-col gap-2.5 my-2">
                <div className={`flex items-center justify-between text-xs font-bold ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                  <span>{isRTL ? "المواد المسجلة" : "Enrolled Courses"}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{enrolledCoursesCount}</span>
                </div>
                <div className={`w-full h-2.5 rounded-full overflow-hidden border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-gray-950/60 border-gray-900'}`}>
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500 shadow-[0_0_10px_#10b981]"
                    style={{ width: `${Math.min(100, Math.max(5, enrolledCoursesCount * 25))}%` }}
                  />
                </div>
              </div>

              <div className={`flex items-center justify-between text-xs font-bold border-t pt-2.5 mt-1 ${isLight ? 'border-slate-200 text-slate-600' : 'border-gray-800/40 text-gray-500'}`}>
                <span>{isRTL ? "مجموع النقاط المكتسبة" : "Total Accumulated Points"}</span>
                <span className="text-yellow-600 dark:text-yellow-500 font-black">{points} {isRTL ? "نقطة" : "Points"}</span>
              </div>
            </div>
          </div>

          {/* 3. Metrics grid */}
          <div className="flex flex-col gap-3 shrink-0 text-start">
            <h3 className={`text-xs sm:text-sm md:text-base font-black uppercase tracking-wider pl-1 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
              {isRTL ? "مقاييس الأداء" : "Performance Metrics"}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border flex flex-col items-center justify-center text-center shadow-md ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c0d19]/40 border-gray-800'
                }`}>
                <span className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400 leading-none mb-1.5">{averageScore}%</span>
                <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{isRTL ? "متوسط الدرجات" : "Avg Score"}</span>
              </div>
              <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border flex flex-col items-center justify-center text-center shadow-md ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c0d19]/40 border-gray-800'
                }`}>
                <span className="text-xl sm:text-2xl md:text-3xl font-black text-purple-600 dark:text-purple-400 leading-none mb-1.5">{totalExams}</span>
                <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{isRTL ? "الاختبارات المجتازة" : "Exams taken"}</span>
              </div>
              <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border flex flex-col items-center justify-center text-center shadow-md ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c0d19]/40 border-gray-800'
                }`}>
                <span className="text-xl sm:text-2xl md:text-3xl font-black text-blue-600 dark:text-blue-400 leading-none mb-1.5">{enrolledCoursesCount}</span>
                <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{isRTL ? "المواد النشطة" : "Active Courses"}</span>
              </div>
              <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border flex flex-col items-center justify-center text-center shadow-md ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c0d19]/40 border-gray-800'
                }`}>
                <span className="text-xl sm:text-2xl md:text-3xl font-black text-yellow-600 dark:text-yellow-500 leading-none mb-1.5">{passedExams}</span>
                <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{isRTL ? "عدد مرات النجاح" : "Passed count"}</span>
              </div>
            </div>
          </div>

          {/* 4. Account Settings Section (3 Column Grid Desktop) */}
          <div className="flex flex-col gap-3 shrink-0 text-start">
            <div className="flex items-center gap-2 mb-1 pl-1">
              <div className="w-7 h-7 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <FiUser size={15} />
              </div>
              <h3 className={`text-xs sm:text-sm md:text-base font-black uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{isRTL ? "الحساب" : "Account"}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Edit Profile */}
              <div
                onClick={() => setIsEditProfileOpen(true)}
                className={`flex items-center justify-between p-4 sm:p-5 border rounded-2xl sm:rounded-3xl cursor-pointer transition-all group text-start ${isLight ? 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm' : 'bg-[#0c0d19]/40 hover:bg-[#121424] border-gray-800/80'
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                    <FiUser className="text-lg sm:text-xl" />
                  </div>
                  <div>
                    <h5 className={`text-sm sm:text-base md:text-lg font-black leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>{isRTL ? "تعديل الملف الشخصي" : "Edit Profile"}</h5>
                    <span className={`text-xs sm:text-sm font-semibold mt-1 block ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{isRTL ? "الاسم، الهاتف" : "Name, phone"}</span>
                  </div>
                </div>
                {isRTL ? <FiChevronLeft className="text-gray-500 group-hover:-translate-x-0.5 transition-transform" /> : <FiChevronRight className="text-gray-500 group-hover:translate-x-0.5 transition-transform" />}
              </div>

              {/* Change Password */}
              <div
                onClick={() => setIsChangePasswordOpen(true)}
                className={`flex items-center justify-between p-4 sm:p-5 border rounded-2xl sm:rounded-3xl cursor-pointer transition-all group text-start ${isLight ? 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm' : 'bg-[#0c0d19]/40 hover:bg-[#121424] border-gray-800/80'
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <FiLock className="text-lg sm:text-xl" />
                  </div>
                  <div>
                    <h5 className={`text-sm sm:text-base md:text-lg font-black leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>{isRTL ? "تغيير كلمة المرور" : "Change Password"}</h5>
                    <span className={`text-xs sm:text-sm font-semibold mt-1 block ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{isRTL ? "تحديث كلمة المرور" : "Update security password"}</span>
                  </div>
                </div>
                {isRTL ? <FiChevronLeft className="text-gray-500 group-hover:-translate-x-0.5 transition-transform" /> : <FiChevronRight className="text-gray-500 group-hover:translate-x-0.5 transition-transform" />}
              </div>

              {/* Language Selection */}
              <div
                onClick={() => { setTempLanguage(selectedLanguage); setIsLanguageOpen(true); }}
                className={`flex items-center justify-between p-4 sm:p-5 border rounded-2xl sm:rounded-3xl cursor-pointer transition-all group text-start ${isLight ? 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm' : 'bg-[#0c0d19]/40 hover:bg-[#121424] border-gray-800/80'
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <FiGlobe className="text-lg sm:text-xl" />
                  </div>
                  <div>
                    <h5 className={`text-sm sm:text-base md:text-lg font-black leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>{isRTL ? "اللغة" : "Language"}</h5>
                    <span className={`text-xs sm:text-sm font-semibold mt-1 block ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{isRTL ? 'العربية / English' : `${selectedLanguage} / العربية`}</span>
                  </div>
                </div>
                {isRTL ? <FiChevronLeft className="text-gray-500 group-hover:-translate-x-0.5 transition-transform" /> : <FiChevronRight className="text-gray-500 group-hover:translate-x-0.5 transition-transform" />}
              </div>
            </div>
          </div>

          {/* 5. Family & Badges Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0 text-start">
            {/* Link a parent card */}
            <div className={`p-6 md:p-7 border rounded-[2rem] shadow-lg flex flex-col gap-4 text-start justify-between ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c0d19]/40 border-gray-800/80'
              }`}>
              <div className={`flex items-center gap-3 pb-2.5 border-b ${isLight ? 'border-slate-200' : 'border-gray-800/40'}`}>
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <FiUsers size={18} />
                </div>
                <h4 className={`text-base sm:text-lg font-black uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>{isRTL ? "ربط العائلة" : "Family Linking"}</h4>
              </div>

              <p className={`text-xs sm:text-sm md:text-base font-medium leading-relaxed ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                {isRTL ? "قم بربط حساب ولي الأمر لمتابعة تقدمك ودرجات الاختبارات وسجل الدراسة." : "Connect a parent account to follow your progress, exam scores, and study completion history."}
              </p>

              <div className={`flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl mt-1 border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-gray-950/65 border-gray-800'
                }`}>
                <span className={`text-sm sm:text-base font-black tracking-widest pl-1 ${isLight ? 'text-slate-900' : 'text-white'}`}># {linkCode || 'FM-8UTT2N'}</span>
                <button
                  onClick={handleCopyCode}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_4px_15px_rgba(139,92,246,0.3)]"
                >
                  <FiCopy size={13} /> {isRTL ? "نسخ الرمز" : "Copy Code"}
                </button>
              </div>
            </div>

            {/* Badges showcase */}
            <div className={`p-6 md:p-7 border rounded-[2rem] shadow-lg flex flex-col gap-4 text-start ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c0d19]/40 border-gray-800/80'
              }`}>
              <div className={`flex justify-between items-center pb-2.5 border-b ${isLight ? 'border-slate-200' : 'border-gray-800/40'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                    <FiAward size={18} />
                  </div>
                  <h4 className={`text-base sm:text-lg font-black uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>{isRTL ? "أوسمتي" : "My Badges"}</h4>
                </div>
                <span className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-xs font-black text-yellow-600 dark:text-yellow-500">
                  {badgesCount} {isRTL ? "مكتسبة" : "earned"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3.5 mt-2">
                {studentProfile?.badges && studentProfile.badges.length > 0 ? (
                  studentProfile.badges.slice(0, 3).map((b, idx) => (
                    <div key={idx} className={`flex flex-col items-center gap-2.5 p-3 rounded-2xl border text-center ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-gray-950/40 border-gray-800'
                      }`}>
                      <div className="w-10 h-10 rounded-full bg-yellow-500/15 border border-yellow-500/25 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                        <FiAward size={16} />
                      </div>
                      <span className={`text-xs sm:text-sm font-bold capitalize truncate w-full ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>{b.label}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className={`flex flex-col items-center gap-2.5 p-3 rounded-2xl border text-center ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-gray-950/40 border-gray-800'
                      }`}>
                      <div className="w-10 h-10 rounded-full bg-yellow-500/15 border border-yellow-500/25 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                        <FiBookOpen size={16} />
                      </div>
                      <span className={`text-xs sm:text-sm font-bold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>{isRTL ? "الاختبار الأول" : "First Exam"}</span>
                    </div>
                    <div className={`flex flex-col items-center gap-2.5 p-3 rounded-2xl border text-center ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-gray-950/40 border-gray-800'
                      }`}>
                      <div className="w-10 h-10 rounded-full bg-pink-500/15 border border-pink-500/25 flex items-center justify-center text-pink-600 dark:text-pink-400">
                        <FiStar size={16} />
                      </div>
                      <span className={`text-xs sm:text-sm font-bold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>{isRTL ? "درجة كاملة" : "Perfect Score"}</span>
                    </div>
                    <div className={`flex flex-col items-center gap-2.5 p-3 rounded-2xl border text-center ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-gray-950/40 border-gray-800'
                      }`}>
                      <div className="w-10 h-10 rounded-full bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <FaFire size={16} />
                      </div>
                      <span className={`text-xs sm:text-sm font-bold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>{isRTL ? "تتابع 7 أيام" : "7-Day Streak"}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 6. Notifications & Sound grid (4 Column Grid Desktop) */}
          <div className="flex flex-col gap-3 shrink-0 text-start">
            <div className="flex items-center gap-2 mb-1 pl-1">
              <div className="w-7 h-7 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <FiBell size={15} />
              </div>
              <h3 className={`text-xs sm:text-sm md:text-base font-black uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{isRTL ? "التنبيهات وخيارات الإشعارات" : "Notifications & Alert Toggles"}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Push notifications */}
              <div className={`flex items-center justify-between p-4 sm:p-5 border rounded-2xl sm:rounded-3xl ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c0d19]/40 border-gray-800'
                }`}>
                <div className="text-start">
                  <h5 className={`text-sm sm:text-base font-black leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>{isRTL ? "إشعارات التطبيق" : "Push"}</h5>
                  <span className={`text-xs sm:text-sm font-medium mt-1 block ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{isRTL ? "تلقي تنبيهات التطبيق" : "Receive app alerts"}</span>
                </div>
                <button
                  onClick={() => setPushNotifications(!pushNotifications)}
                  className={`w-11 h-7 rounded-full p-1 cursor-pointer transition-all duration-300 flex items-center ${pushNotifications ? 'bg-purple-600 justify-end' : (isLight ? 'bg-slate-300 border border-slate-400 justify-start' : 'bg-gray-800 border border-gray-700 justify-start')}`}
                >
                  <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                </button>
              </div>

              {/* Exam Reminders */}
              <div className={`flex items-center justify-between p-4 sm:p-5 border rounded-2xl sm:rounded-3xl ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c0d19]/40 border-gray-800'
                }`}>
                <div className="text-start">
                  <h5 className={`text-sm sm:text-base font-black leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>{isRTL ? "التذكيرات" : "Reminders"}</h5>
                  <span className={`text-xs sm:text-sm font-medium mt-1 block ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{isRTL ? "التنبيه قبل الاختبارات" : "Get warned before exams"}</span>
                </div>
                <button
                  onClick={() => setExamReminders(!examReminders)}
                  className={`w-11 h-7 rounded-full p-1 cursor-pointer transition-all duration-300 flex items-center ${examReminders ? 'bg-blue-600 justify-end' : (isLight ? 'bg-slate-300 border border-slate-400 justify-start' : 'bg-gray-800 border border-gray-700 justify-start')}`}
                >
                  <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                </button>
              </div>

              {/* Result alerts */}
              <div className={`flex items-center justify-between p-4 sm:p-5 border rounded-2xl sm:rounded-3xl ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c0d19]/40 border-gray-800'
                }`}>
                <div className="text-start">
                  <h5 className={`text-sm sm:text-base font-black leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>{isRTL ? "تنبيهات النتائج" : "Result Alerts"}</h5>
                  <span className={`text-xs sm:text-sm font-medium mt-1 block ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{isRTL ? "الإشعار عند صدور النتيجة" : "Notify when scored"}</span>
                </div>
                <button
                  onClick={() => setResultAlerts(!resultAlerts)}
                  className={`w-11 h-7 rounded-full p-1 cursor-pointer transition-all duration-300 flex items-center ${resultAlerts ? 'bg-emerald-500 justify-end' : (isLight ? 'bg-slate-300 border border-slate-400 justify-start' : 'bg-gray-800 border border-gray-700 justify-start')}`}
                >
                  <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                </button>
              </div>

              {/* Sound Effects */}
              <div className={`flex items-center justify-between p-4 sm:p-5 border rounded-2xl sm:rounded-3xl ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c0d19]/40 border-gray-800'
                }`}>
                <div className="text-start">
                  <h5 className={`text-sm sm:text-base font-black leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>{isRTL ? "الأصوات" : "Sounds"}</h5>
                  <span className={`text-xs sm:text-sm font-medium mt-1 block ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{isRTL ? "تشغيل التنبيهات الصوتية" : "Play audio cues"}</span>
                </div>
                <button
                  onClick={() => setSoundEffects(!soundEffects)}
                  className={`w-11 h-7 rounded-full p-1 cursor-pointer transition-all duration-300 flex items-center ${soundEffects ? 'bg-gray-600 justify-end' : (isLight ? 'bg-slate-300 border border-slate-400 justify-start' : 'bg-gray-800 border border-gray-700 justify-start')}`}
                >
                  <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                </button>
              </div>
            </div>
          </div>

          {/* 7. Appearance section */}
          <div className="flex flex-col gap-3 shrink-0 text-start">
            <div className="flex items-center gap-2 mb-1 pl-1">
              <div className="w-7 h-7 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
                <FiSun size={15} />
              </div>
              <h3 className={`text-xs sm:text-sm md:text-base font-black uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{isRTL ? "المظهر" : "Appearance"}</h3>
            </div>

            <div className={`w-full border rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex items-center justify-between ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c0d19]/40 border-gray-800/80'
              }`}>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-600 dark:text-yellow-400 shadow-sm shrink-0">
                  {theme === 'dark' ? <FiMoon className="text-lg sm:text-xl" /> : <FiSun className="text-lg sm:text-xl" />}
                </div>
                <div className="text-start">
                  <h4 className={`text-sm sm:text-base md:text-lg font-black leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>{isRTL ? "الوضع الداكن" : "Dark Mode"}</h4>
                  <p className={`text-xs sm:text-sm font-medium mt-1 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{isRTL ? "تغيير ثيم التطبيق" : "Switch app appearance theme"}</p>
                </div>
              </div>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-all duration-300 flex items-center ${theme === 'dark' ? 'bg-yellow-500 justify-end' : (isLight ? 'bg-slate-300 border border-slate-400 justify-start' : 'bg-gray-800 border border-gray-700 justify-start')}`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-md" />
              </button>
            </div>
          </div>

          {/* 8. Support Row (4 column Grid Desktop) */}
          <div className="flex flex-col gap-3 shrink-0 text-start">
            <div className="flex items-center gap-2 mb-1 pl-1">
              <div className="w-7 h-7 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <FiGlobe size={15} />
              </div>
              <h3 className={`text-xs sm:text-sm md:text-base font-black uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{isRTL ? "الدعم والمساعدة" : "Support"}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`flex items-center justify-between p-4 sm:p-5 border rounded-2xl sm:rounded-3xl cursor-pointer transition-all group text-start ${isLight ? 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm' : 'bg-[#0c0d19]/40 hover:bg-[#121424] border-gray-800'
                }`}>
                <div>
                  <h5 className={`text-sm sm:text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{isRTL ? "مركز المساعدة" : "Help Center"}</h5>
                  <span className={`text-xs sm:text-sm font-medium mt-1 block ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{isRTL ? "الأسئلة الشائعة والإرشادات" : "FAQs & guides"}</span>
                </div>
                {isRTL ? <FiChevronLeft className="text-gray-500 group-hover:-translate-x-0.5 transition-all" /> : <FiChevronRight className="text-gray-500 group-hover:translate-x-0.5 transition-all" />}
              </div>

              <div className={`flex items-center justify-between p-4 sm:p-5 border rounded-2xl sm:rounded-3xl cursor-pointer transition-all group text-start ${isLight ? 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm' : 'bg-[#0c0d19]/40 hover:bg-[#121424] border-gray-800'
                }`}>
                <div>
                  <h5 className={`text-sm sm:text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{isRTL ? "تواصل معنا" : "Contact Us"}</h5>
                  <span className={`text-xs sm:text-sm font-medium mt-1 block ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{isRTL ? "التواصل مع فريق الدعم" : "Reach our support team"}</span>
                </div>
                {isRTL ? <FiChevronLeft className="text-gray-500 group-hover:-translate-x-0.5 transition-all" /> : <FiChevronRight className="text-gray-500 group-hover:translate-x-0.5 transition-all" />}
              </div>

              <div className={`flex items-center justify-between p-4 sm:p-5 border rounded-2xl sm:rounded-3xl cursor-pointer transition-all group text-start ${isLight ? 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm' : 'bg-[#0c0d19]/40 hover:bg-[#121424] border-gray-800'
                }`}>
                <div>
                  <h5 className={`text-sm sm:text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{isRTL ? "الآراء والملاحظات" : "Feedback"}</h5>
                  <span className={`text-xs sm:text-sm font-medium mt-1 block ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{isRTL ? "تقييم تجربة التطبيق" : "Rate app experience"}</span>
                </div>
                {isRTL ? <FiChevronLeft className="text-gray-500 group-hover:-translate-x-0.5 transition-all" /> : <FiChevronRight className="text-gray-500 group-hover:translate-x-0.5 transition-all" />}
              </div>

              <div className={`flex items-center justify-between p-4 sm:p-5 border rounded-2xl sm:rounded-3xl cursor-pointer transition-all group text-start ${isLight ? 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm' : 'bg-[#0c0d19]/40 hover:bg-[#121424] border-gray-800'
                }`}>
                <div>
                  <h5 className={`text-sm sm:text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{isRTL ? "حول التطبيق" : "About"}</h5>
                  <span className={`text-xs sm:text-sm font-medium mt-1 block ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>FullMark v1.0.0</span>
                </div>
                {isRTL ? <FiChevronLeft className="text-gray-500 group-hover:-translate-x-0.5 transition-all" /> : <FiChevronRight className="text-gray-500 group-hover:translate-x-0.5 transition-all" />}
              </div>
            </div>
          </div>

          {/* 9. Sign Out Button */}
          <button
            onClick={handleLogout}
            className="w-full py-4 mt-4 border border-red-500/40 hover:border-red-500 bg-red-500/5 hover:bg-red-500/10 text-red-500 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all duration-300 active:scale-95 cursor-pointer shadow-sm shrink-0"
          >
            <FiLogOut className="text-lg" />
            <span>{isRTL ? "تسجيل الخروج" : "Sign Out"}</span>
          </button>

        </div>

      </div>

      {/* EDIT PROFILE MODAL */}
      <AnimatePresence>
        {isEditProfileOpen && (
          <div
            className="fixed inset-0 bg-[#020205]/70 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4 transition-all duration-300 animate-fade-in"
            onClick={() => setIsEditProfileOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 100, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 100, opacity: 0 }}
              className={`w-full sm:max-w-md border-t sm:border rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 pb-10 sm:pb-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden text-start ${isLight ? 'bg-white border-slate-200' : 'bg-[#0c0d19] border-gray-800'
                }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`w-12 h-1.5 rounded-full mx-auto mb-6 sm:hidden ${isLight ? 'bg-slate-300' : 'bg-gray-800'}`} />

              <button
                onClick={() => setIsEditProfileOpen(false)}
                className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} text-gray-500 hover:text-white transition-colors cursor-pointer`}
              >
                <FiX size={20} />
              </button>

              <h3 className={`text-xl sm:text-2xl font-black mb-6 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {isRTL ? "تعديل الملف الشخصي" : "Edit Profile"}
              </h3>

              <Formik
                initialValues={{
                  name: name,
                  phone: phone,
                  bio: bio
                }}
                validationSchema={StudentProfileSchema}
                onSubmit={handleProfileSave}
                enableReinitialize
              >
                {({ values, handleChange, handleBlur, isSubmitting }) => (
                  <Form className="flex flex-col gap-4 mt-2">
                    <Input
                      name="name"
                      type="text"
                      label={isRTL ? "الاسم الكامل" : "Full Name"}
                      placeholder="Ali"
                      icon={FiUser}
                      roleColor="student"
                    />

                    <Input
                      name="phone"
                      type="text"
                      label={isRTL ? "رقم الهاتف" : "Phone Number"}
                      placeholder="+966 50 123 4567"
                      icon={FiPhone}
                      roleColor="student"
                    />

                    {/* Bio input field commented out for now */}
                    {/* <div className="w-full flex flex-col mb-2 relative">
                      <div className={`w-full flex flex-col relative rounded-2xl px-4 py-3 border min-h-[100px] justify-start focus-within:border-purple-500/50 transition-colors ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-gray-950/40 border-gray-800/80'
                        }`}>
                        <span className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1.5 pointer-events-none font-semibold text-[10px] text-purple-600 dark:text-purple-400 uppercase tracking-wider`}>
                          {isRTL ? "نبذة عني" : "Bio"}
                        </span>
                        <textarea
                          name="bio"
                          value={values.bio || ''}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          rows={3}
                          placeholder={isRTL ? "اكتب نبذة قصيرة عن نفسك" : "Tell us about yourself"}
                          className={`w-full bg-transparent border-none text-sm md:text-base font-semibold outline-none focus:ring-0 resize-none pt-4 focus:outline-none ${isLight ? 'text-slate-900' : 'text-white'
                            }`}
                        />
                      </div>
                    </div> */}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 mt-2 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white rounded-2xl font-black shadow-[0_4px_20px_rgba(139,92,246,0.25)] flex items-center justify-center gap-2 active:scale-95 transition-all duration-300 cursor-pointer disabled:opacity-55"
                    >
                      <span>{isRTL ? "حفظ التغييرات" : "Save Changes"}</span>
                      <FiCheck className="text-base" />
                    </button>
                  </Form>
                )}
              </Formik>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CHANGE PASSWORD MODAL */}
      <AnimatePresence>
        {isChangePasswordOpen && (
          <div
            className="fixed inset-0 bg-[#020205]/70 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4 transition-all duration-300 animate-fade-in"
            onClick={() => setIsChangePasswordOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 100, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 100, opacity: 0 }}
              className={`w-full sm:max-w-md border-t sm:border rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 pb-10 sm:pb-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden text-start ${isLight ? 'bg-white border-slate-200' : 'bg-[#0c0d19] border-gray-800'
                }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`w-12 h-1.5 rounded-full mx-auto mb-6 sm:hidden ${isLight ? 'bg-slate-300' : 'bg-gray-800'}`} />

              <button
                onClick={() => setIsChangePasswordOpen(false)}
                className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} text-gray-500 hover:text-white transition-colors cursor-pointer`}
              >
                <FiX size={20} />
              </button>

              <h3 className={`text-xl sm:text-2xl font-black mb-6 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {isRTL ? "تغيير كلمة المرور" : "Change Password"}
              </h3>

              <Formik
                initialValues={{
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: '',
                }}
                validationSchema={ChangePasswordSchema}
                onSubmit={handleUpdatePassword}
              >
                {({ isSubmitting }) => (
                  <Form className="flex flex-col gap-4 mt-2">
                    <Input
                      name="currentPassword"
                      type="password"
                      label={isRTL ? "كلمة المرور الحالية" : "Current Password"}
                      placeholder={isRTL ? "كلمة المرور الحالية" : "Current Password"}
                      icon={FiLock}
                      showPasswordToggle={true}
                      roleColor="student"
                    />
                    <Input
                      name="newPassword"
                      type="password"
                      label={isRTL ? "كلمة المرور الجديدة" : "New Password"}
                      placeholder={isRTL ? "كلمة المرور الجديدة" : "New Password"}
                      icon={FiLock}
                      showPasswordToggle={true}
                      roleColor="student"
                    />
                    <Input
                      name="confirmPassword"
                      type="password"
                      label={isRTL ? "تأكيد كلمة المرور" : "Confirm Password"}
                      placeholder={isRTL ? "تأكيد كلمة المرور" : "Confirm Password"}
                      icon={FiLock}
                      showPasswordToggle={true}
                      roleColor="student"
                    />

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 mt-2 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white rounded-2xl font-black shadow-[0_4px_20px_rgba(139,92,246,0.25)] flex items-center justify-center gap-2 active:scale-95 transition-all duration-300 cursor-pointer disabled:opacity-55"
                    >
                      <span>{isRTL ? "تحديث كلمة المرور" : "Update Password"}</span>
                      <FiCheck className="text-base" />
                    </button>
                  </Form>
                )}
              </Formik>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LANGUAGE SELECTOR SHEET */}
      <AnimatePresence>
        {isLanguageOpen && (
          <div
            className="fixed inset-0 bg-[#020205]/70 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4 transition-all duration-300 animate-fade-in"
            onClick={() => setIsLanguageOpen(false)}
          >
            <motion.div
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 200, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className={`w-full sm:max-w-md border-t sm:border rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 pb-10 sm:pb-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden text-start ${isLight ? 'bg-white border-slate-200' : 'bg-[#0c0d19] border-gray-800'
                }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`w-12 h-1.5 rounded-full mx-auto mb-6 sm:hidden ${isLight ? 'bg-slate-300' : 'bg-gray-800'}`} />

              <button
                onClick={() => setIsLanguageOpen(false)}
                className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} text-gray-500 hover:text-white transition-colors cursor-pointer`}
              >
                <FiX size={20} />
              </button>

              <h3 className={`text-xl font-black text-center mb-6 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {isRTL ? "اختر اللغة" : "Select Language"}
              </h3>

              <div className="flex flex-col gap-3 mt-4">
                {/* English choice */}
                <button
                  onClick={() => setTempLanguage('English')}
                  className={`w-full p-4 rounded-2xl border transition-all text-start flex items-center justify-between cursor-pointer ${tempLanguage === 'English'
                    ? 'bg-purple-500/5 border-purple-500 shadow-md shadow-purple-500/5'
                    : isLight ? 'bg-slate-50 border-slate-200 hover:border-slate-300' : 'bg-gray-950/40 border-gray-800 hover:border-gray-700/80'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🇬🇧</span>
                    <span className={`text-xs sm:text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>English</span>
                  </div>
                  {tempLanguage === 'English' && (
                    <span className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-white shrink-0">
                      <FiCheck size={12} />
                    </span>
                  )}
                </button>

                {/* Arabic choice */}
                <button
                  onClick={() => setTempLanguage('Arabic')}
                  className={`w-full p-4 rounded-2xl border transition-all text-start flex items-center justify-between cursor-pointer ${tempLanguage === 'Arabic'
                    ? 'bg-purple-500/5 border-purple-500 shadow-md shadow-purple-500/5'
                    : isLight ? 'bg-slate-50 border-slate-200 hover:border-slate-300' : 'bg-gray-950/40 border-gray-800 hover:border-gray-700/80'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🇸🇦</span>
                    <span className={`text-xs sm:text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Arabic — العربية</span>
                  </div>
                  {tempLanguage === 'Arabic' && (
                    <span className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-white shrink-0">
                      <FiCheck size={12} />
                    </span>
                  )}
                </button>
              </div>

              {/* Apply action button */}
              <button
                onClick={handleApplyLanguage}
                className="w-full py-4 mt-6 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white rounded-2xl font-black shadow-[0_4px_20px_rgba(139,92,246,0.25)] flex items-center justify-center gap-2 active:scale-95 transition-all duration-300 cursor-pointer"
              >
                <span>{isRTL ? "تطبيق" : "Apply"}</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default Profile;
