import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUser,
  FiLock,
  FiPhone,
  FiMail,
  FiCheck,
  FiX,
  FiChevronRight,
  FiCamera,
  FiChevronLeft,
  FiMoon,
  FiSun,
  FiSettings,
  FiLogOut,
  FiEdit3,
  FiGlobe
} from 'react-icons/fi';
import { Formik, Form } from 'formik';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, changePassword, updateProfile, updateTeacherProfile } from '../../redux/slices/authSlice';

import DashboardLayout from '../../components/layout/DashboardLayout';
import Input from '../../components/ui/Input';
import ModalWrapper from '../../components/shared/ModalWrapper';
import { TeacherProfileSchema, ChangePasswordSchema } from '../../schemas/authSchemas';
import { useLanguage } from '../../context/LanguageContext';

const TeacherSettings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { t, isRTL, language, changeLanguage } = useLanguage();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    avatarText: (user?.name || '').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
  });
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Sync with Redux user state
  useEffect(() => {
    if (user) {
      const updated = {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        avatarText: (user.name || '').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
      };
      setProfileData(updated);
    }
  }, [user]);

  // Sync theme
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
    window.dispatchEvent(new Event('themeChange'));
  }, [theme]);

  useEffect(() => {
    const handleThemeChange = () => {
      const currentTheme = localStorage.getItem('theme') || 'dark';
      if (currentTheme !== theme) {
        setTheme(currentTheme);
      }
    };
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, [theme]);

  const handleProfileSave = async (values, { setSubmitting }) => {
    try {
      await dispatch(updateProfile({
        name: values.name,
        phone: values.phone
      })).unwrap();

      await dispatch(updateTeacherProfile({
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

  const handleLogout = () => {
    dispatch(logoutUser());
    toast.success(isRTL ? 'تم تسجيل الخروج بنجاح!' : 'Logged out successfully!');
    navigate('/');
  };

  const isModalActive = isEditProfileOpen || isChangePasswordOpen;

  return (
    <DashboardLayout
      role="teacher"
      activeTab="settings"
      title={t('admin.settings.title')}
      subtitle={t('admin.settings.subtitle')}
      isModalOpen={isModalActive}
    >
      <div className="w-full max-w-full p-6 md:p-8 pb-32 text-start flex flex-col gap-6 animate-fade-in">

        {/* A. Hero Profile Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] p-6 text-center relative overflow-hidden shadow-2xl">
          <div className={`absolute top-6 ${isRTL ? 'right-6' : 'left-6'} flex items-center justify-center`}>
            <button
              onClick={() => navigate('/teacher/dashboard')}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
            >
              <FiChevronLeft size={20} className={isRTL ? 'rotate-180' : ''} />
            </button>
          </div>
          <div className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} flex items-center justify-center`}>
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
            >
              <FiEdit3 size={16} />
            </button>
          </div>

          <span className="text-xs font-black tracking-widest text-blue-200 uppercase block mt-2">
            {isRTL ? "ملفي الشخصي" : "My Profile"}
          </span>

          <div className="relative w-24 h-24 mx-auto mt-5 mb-4 flex items-center justify-center rounded-3xl bg-white/15 border border-white/25 shadow-lg">
            <span className="text-3xl font-black text-white tracking-wide">
              {profileData.avatarText}
            </span>
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className={`absolute -bottom-1 ${isRTL ? '-left-1' : '-right-1'} w-8 h-8 rounded-xl bg-yellow-500 text-gray-950 flex items-center justify-center border-4 border-indigo-600 hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-md`}
            >
              <FiCamera size={13} />
            </button>
          </div>

          <h3 className="text-xl md:text-2xl font-black text-white capitalize leading-tight">
            {profileData.name}
          </h3>
          <p className="text-sm text-blue-100 font-semibold mt-1">
            {profileData.email}
          </p>

          <span className="inline-flex items-center gap-1.5 px-4.5 py-1.5 rounded-full text-sm font-black bg-white/10 border border-white/20 text-white mt-4 shadow-sm">
            🎓 {isRTL ? "معلم" : "Teacher"}
          </span>
        </div>

        {/* B. About Me Section */}
        <div className="p-6 bg-[#0e101a] border border-gray-800/80 rounded-[2rem] shadow-lg flex flex-col gap-4 text-start">
          <div className="flex justify-between items-center pb-2 border-b border-gray-800/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <FiUser size={16} />
              </div>
              <h4 className="text-base font-extrabold text-white">{isRTL ? "نبذة عني" : "About Me"}</h4>
            </div>
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="text-sm font-extrabold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
            >
              {isRTL ? "تعديل" : "Edit"}
            </button>
          </div>

          <p className="text-base font-semibold text-gray-400 italic text-start">
            {profileData.bio || (isRTL ? 'لا توجد نبذة شخصية بعد. انقر على تعديل لإضافة واحدة.' : 'No bio yet. Tap Edit to add one.')}
          </p>

          <div className="flex flex-col gap-2.5 mt-2 text-sm font-semibold text-gray-400 text-start">
            <div className="flex items-center gap-3">
              <FiMail className="text-gray-500 text-sm shrink-0" />
              <span>{profileData.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <FiPhone className="text-gray-500 text-sm shrink-0" />
              <span>{profileData.phone || (isRTL ? 'غير متاح' : 'Not provided')}</span>
            </div>
          </div>
        </div>

        {/* C. Account Settings Section */}
        <div className="flex flex-col gap-4 text-start">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shadow-sm">
              <FiSettings size={15} />
            </div>
            <h4 className="text-sm font-black tracking-wide text-gray-400 uppercase">{isRTL ? "إعدادات الحساب" : "Account Settings"}</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Edit Profile Row */}
            <div
              onClick={() => setIsEditProfileOpen(true)}
              className="flex items-center justify-between p-4 bg-[#0e101a] hover:bg-[#121424] border border-gray-800/80 rounded-2xl transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4 text-start">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
                  <FiUser size={18} />
                </div>
                <div className="text-start">
                  <h5 className="text-base font-bold text-white leading-none">{isRTL ? "تعديل الملف الشخصي" : "Edit Profile"}</h5>
                  <span className="text-xs text-gray-500 font-semibold mt-1 block">{isRTL ? "الاسم، النبذة الشخصية، الصورة" : "Name, bio, photo"}</span>
                </div>
              </div>
              <FiChevronRight className={`text-gray-500 transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'}`} />
            </div>

            {/* Change Password Row */}
            <div
              onClick={() => setIsChangePasswordOpen(true)}
              className="flex items-center justify-between p-4 bg-[#0e101a] hover:bg-[#121424] border border-gray-800/80 rounded-2xl transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4 text-start">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
                  <FiLock size={18} />
                </div>
                <div className="text-start">
                  <h5 className="text-base font-bold text-white leading-none">{isRTL ? "تغيير كلمة المرور" : "Change Password"}</h5>
                  <span className="text-xs text-gray-500 font-semibold mt-1 block">{isRTL ? "تحديث كلمة المرور الخاصة بك" : "Update your password"}</span>
                </div>
              </div>
              <FiChevronRight className={`text-gray-500 transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'}`} />
            </div>

            {/* Phone Number Row */}
            <div
              onClick={() => setIsEditProfileOpen(true)}
              className="flex items-center justify-between p-4 bg-[#0e101a] hover:bg-[#121424] border border-gray-800/80 rounded-2xl transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4 text-start">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                  <FiPhone size={18} />
                </div>
                <div className="text-start">
                  <h5 className="text-base font-bold text-white leading-none">{isRTL ? "رقم الهاتف" : "Phone Number"}</h5>
                  <span className="text-xs text-gray-500 font-semibold mt-1 block">
                    {profileData.phone || (isRTL ? 'غير متاح' : 'Not provided')}
                  </span>
                </div>
              </div>
              <FiChevronRight className={`text-gray-500 transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'}`} />
            </div>
          </div>
        </div>

        {/* D. Appearance & Language Section */}
        <div className="flex flex-col gap-4 text-start">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shadow-sm">
              {theme === 'dark' ? <FiMoon size={15} /> : <FiSun size={15} />}
            </div>
            <h4 className="text-sm font-black tracking-wide text-gray-400 uppercase">{isRTL ? "المظهر واللغة" : "Appearance & Language"}</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dark Mode Row */}
            <div className="flex items-center justify-between p-4 bg-[#0e101a] border border-gray-800/80 rounded-2xl">
              <div className="flex items-center gap-4 text-start">
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center text-yellow-500 shrink-0">
                  {theme === 'dark' ? <FiMoon size={18} /> : <FiSun size={18} />}
                </div>
                <div className="text-start">
                  <h5 className="text-base font-bold text-white leading-none">{isRTL ? "الوضع الداكن" : "Dark Mode"}</h5>
                  <span className="text-xs text-gray-500 font-semibold mt-1 block">{isRTL ? "تبديل مظهر التطبيق" : "Switch app appearance"}</span>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors duration-300 focus:outline-none flex items-center ${theme === 'dark' ? 'bg-yellow-500 justify-end' : 'bg-gray-800 justify-start'
                  }`}
              >
                <motion.div
                  layout
                  className="w-6 h-6 rounded-full bg-white shadow-md"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            {/* Language Switcher Card */}
            <div className="flex items-center justify-between p-4 bg-[#0e101a] border border-gray-800/80 rounded-2xl">
              <div className="flex items-center gap-4 text-start">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
                  <FiGlobe size={18} />
                </div>
                <div className="text-start">
                  <h5 className="text-base font-bold text-white leading-none">{isRTL ? "لغة الواجهة" : "App Language"}</h5>
                  <span className="text-xs text-gray-500 font-semibold mt-1 block">{isRTL ? "العربية / English" : "English / العربية"}</span>
                </div>
              </div>

              <div className="flex items-center bg-gray-950 p-1 rounded-xl border border-gray-800">
                <button
                  type="button"
                  onClick={() => changeLanguage('en')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    language === 'en'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => changeLanguage('ar')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    language === 'ar'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  العربية
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* E. Sign Out Button */}
        <button
          onClick={handleLogout}
          className="w-full py-4 mt-6 border border-red-500/40 hover:border-red-500 bg-red-500/5 hover:bg-red-500/10 text-red-500 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all duration-300 active:scale-95 cursor-pointer shadow-sm"
        >
          <FiLogOut className="text-lg" />
          <span>{isRTL ? "تسجيل الخروج" : "Sign Out"}</span>
        </button>

      </div>

      {/* MODAL: EDIT PROFILE */}
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
              className="w-full sm:max-w-md bg-[#0c0d19] border-t sm:border border-gray-800 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 pb-10 sm:pb-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden text-start"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-gray-800 rounded-full mx-auto mb-6 sm:hidden" />

              <button
                onClick={() => setIsEditProfileOpen(false)}
                className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} text-gray-500 hover:text-white transition-colors cursor-pointer`}
              >
                <FiX size={20} />
              </button>

              <h3 className="text-xl sm:text-2xl font-black text-white mb-6 text-start">
                {isRTL ? "تعديل الملف الشخصي" : "Edit Profile"}
              </h3>

              <Formik
                initialValues={{
                  name: profileData.name,
                  phone: profileData.phone,
                  bio: profileData.bio
                }}
                validationSchema={TeacherProfileSchema}
                onSubmit={handleProfileSave}
                enableReinitialize
              >
                {({ values, handleChange, handleBlur, isSubmitting }) => (
                  <Form className="flex flex-col gap-4 mt-2 text-start">
                    <Input
                      name="name"
                      type="text"
                      label={isRTL ? "الاسم الكامل" : "Full Name"}
                      placeholder={isRTL ? "الاسم الكامل" : "Full Name"}
                      icon={FiUser}
                      roleColor="teacher"
                    />

                    <Input
                      name="phone"
                      type="text"
                      label={isRTL ? "رقم الهاتف" : "Phone Number"}
                      placeholder={isRTL ? "رقم الهاتف" : "Phone Number"}
                      icon={FiPhone}
                      roleColor="teacher"
                    />

                    <div className="w-full flex flex-col mb-2 relative text-start">
                      <div className="w-full flex flex-col relative rounded-2xl px-4 py-3 input-3d-teacher min-h-[100px] justify-start text-start">
                        <span className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1.5 pointer-events-none font-semibold text-[10px] text-blue-400 uppercase tracking-wider`}>
                          {isRTL ? "النبذة الشخصية" : "Bio"}
                        </span>
                        <textarea
                          name="bio"
                          value={values.bio || ''}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          rows={3}
                          placeholder={isRTL ? "النبذة الشخصية" : "Bio"}
                          className="w-full bg-transparent border-none text-white text-sm md:text-base font-semibold outline-none focus:ring-0 resize-none pt-4 focus:outline-none text-start"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 mt-2 bg-[#2563eb] hover:bg-blue-500 text-white rounded-2xl font-black shadow-[0_4px_20px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2 active:scale-95 transition-all duration-300 cursor-pointer disabled:opacity-55"
                    >
                      <span>{isSubmitting ? (isRTL ? "جاري الحفظ..." : "Saving...") : (isRTL ? "حفظ التغييرات" : "Save Changes")}</span>
                      <FiCheck className="text-base" />
                    </button>
                  </Form>
                )}
              </Formik>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: CHANGE PASSWORD */}
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
              className="w-full sm:max-w-md bg-[#0c0d19] border-t sm:border border-gray-800 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 pb-10 sm:pb-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden text-start"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-gray-800 rounded-full mx-auto mb-6 sm:hidden" />

              <button
                onClick={() => setIsChangePasswordOpen(false)}
                className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} text-gray-500 hover:text-white transition-colors cursor-pointer`}
              >
                <FiX size={20} />
              </button>

              <h3 className="text-xl sm:text-2xl font-black text-white mb-6 text-start">
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
                  <Form className="flex flex-col gap-4 mt-2 text-start">
                    <Input
                      name="currentPassword"
                      type="password"
                      label={isRTL ? "كلمة المرور الحالية" : "Current Password"}
                      placeholder={isRTL ? "كلمة المرور الحالية" : "Current Password"}
                      icon={FiLock}
                      showPasswordToggle={true}
                      roleColor="teacher"
                    />
                    <Input
                      name="newPassword"
                      type="password"
                      label={isRTL ? "كلمة المرور الجديدة" : "New Password"}
                      placeholder={isRTL ? "كلمة المرور الجديدة" : "New Password"}
                      icon={FiLock}
                      showPasswordToggle={true}
                      roleColor="teacher"
                    />
                    <Input
                      name="confirmPassword"
                      type="password"
                      label={isRTL ? "تأكيد كلمة المرور" : "Confirm Password"}
                      placeholder={isRTL ? "تأكيد كلمة المرور" : "Confirm Password"}
                      icon={FiLock}
                      showPasswordToggle={true}
                      roleColor="teacher"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 mt-2 bg-[#2563eb] hover:bg-blue-500 text-white rounded-2xl font-black shadow-[0_4px_20px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2 active:scale-95 transition-all duration-300 cursor-pointer disabled:opacity-55"
                    >
                      <span>{isSubmitting ? (isRTL ? "جاري التحديث..." : "Updating...") : (isRTL ? "تحديث كلمة المرور" : "Update Password")}</span>
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

export default TeacherSettings;
