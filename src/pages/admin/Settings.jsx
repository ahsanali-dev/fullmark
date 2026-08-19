import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiChevronLeft,
  FiEdit2,
  FiCamera,
  FiShield,
  FiLock,
  FiCheckCircle,
  FiStar,
  FiUser,
  FiMail,
  FiPhone,
  FiMoon,
  FiSun,
  FiGrid,
  FiBookOpen,
  FiBarChart2,
  FiLogOut,
  FiChevronRight,
  FiCheck
} from 'react-icons/fi';
import { MdPalette } from 'react-icons/md';
import toast from 'react-hot-toast';
import { Formik, Form } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, changePassword, updateProfile } from '../../redux/slices/authSlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Input from '../../components/ui/Input';
import ModalWrapper from '../../components/shared/ModalWrapper';
import { EditProfileSchema, ChangePasswordSchema } from '../../schemas/authSchemas';

// Schemas imported from src/schemas/authSchemas.js

const Settings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  // App Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });

  // Synchronize internal state with external theme changes
  useEffect(() => {
    const handleThemeChange = () => {
      setIsDarkMode(localStorage.getItem('theme') !== 'light');
    };
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  // Theme Toggler
  const toggleTheme = () => {
    const nextTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', nextTheme);
    window.dispatchEvent(new Event('themeChange'));
    toast.success(`Switched to ${nextTheme === 'light' ? 'Light' : 'Dark'} Mode!`);
  };

  // User Profile State
  const [profileData, setProfileData] = useState({
    name: user?.name || 'super admin',
    email: user?.email || 'admin@gmail.com',
    phone: user?.phone || '6629694'
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email,
        phone: user.phone || ''
      });
    }
  }, [user]);

  // Modal / Bottom Sheet States
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Handle Edit Profile Save
  const handleSaveProfile = async (values, { setSubmitting }) => {
    try {
      await dispatch(updateProfile({
        name: values.name,
        phone: values.phone
      })).unwrap();
      setIsEditProfileOpen(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err || 'Failed to update profile.');
    } finally {
      if (setSubmitting) setSubmitting(false);
    }
  };

  // Handle Change Password Save
  const handleUpdatePassword = async (values, { resetForm, setSubmitting }) => {
    const loadToast = toast.loading('Updating password...');
    try {
      await dispatch(changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      })).unwrap();
      toast.dismiss(loadToast);
      toast.success('Password updated successfully!');
      setIsChangePasswordOpen(false);
      resetForm();
    } catch (err) {
      toast.dismiss(loadToast);
      toast.error(err || 'Failed to update password.');
    } finally {
      if (setSubmitting) setSubmitting(false);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    toast.success('Logged out successfully!');
    navigate('/');
  };

  const isModalOpen = isEditProfileOpen || isChangePasswordOpen;

  return (
    <DashboardLayout
      role="admin"
      activeTab="settings"
      title="System Settings"
      subtitle="Configure Platform Options"
      disableScroll={true}
      isModalOpen={isModalOpen}
    >
      <div className="h-full flex flex-col px-4 md:px-8 py-4 overflow-hidden gap-5 animate-fade-in relative transition-all duration-300">

        {/* Scrollable Settings Panel */}
        <div className="flex-1 overflow-y-auto pr-1 pb-36 flex flex-col gap-6">

          {/* 1. Profile Banner Hero */}
          <div className="w-full bg-gradient-to-br from-red-700/90 to-rose-600/90 text-white rounded-3xl p-6 relative overflow-hidden flex flex-col gap-6 shadow-[0_15px_30px_rgba(239,68,68,0.2)] shrink-0">
            {/* Banner Background decorative elements */}
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/5 border border-white/10" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5 border border-white/10" />

            {/* Header controls inside banner */}
            <div className="flex items-center justify-between z-10">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all duration-300 cursor-pointer active:scale-95 border border-white/10"
              >
                <FiChevronLeft size={20} />
              </button>
              <span className="text-sm font-black tracking-wide uppercase text-white/90">My Profile</span>
              <button
                onClick={() => {
                  setIsEditProfileOpen(true);
                }}
                className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all duration-300 cursor-pointer active:scale-95 border border-white/10"
              >
                <FiEdit2 size={16} />
              </button>
            </div>

            {/* Avatar & User Details */}
            <div className="flex flex-col items-center gap-3 z-10">
              <div className="relative">
                <div className="w-24 h-24 rounded-[2rem] bg-white/15 border border-white/25 flex items-center justify-center text-white text-3xl font-black shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)]">
                  {profileData.name.substring(0, 2).toUpperCase()}
                </div>
                <button
                  onClick={() => setIsEditProfileOpen(true)}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-yellow-500 text-gray-900 border-2 border-red-600 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
                >
                  <FiCamera size={14} className="stroke-[2.5]" />
                </button>
              </div>
              <div className="flex flex-col items-center">
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight capitalize tracking-wide">{profileData.name}</h3>
                <span className="text-xs sm:text-sm font-semibold text-white/70 mt-1">{profileData.email}</span>
              </div>
            </div>

            {/* Horizontal Badge Tags Row */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-1 z-10">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-[10px] font-extrabold tracking-wide uppercase text-white shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                Super Admin
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-[10px] font-extrabold tracking-wide uppercase text-white shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Since May 2026
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-[10px] font-extrabold tracking-wide uppercase text-white shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                23h ago
              </span>
            </div>

          </div>

          {/* 2. Admin Privileges Grid */}
          <div className="flex flex-col gap-3 shrink-0">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider text-left pl-1">
              Admin Privileges
            </h3>
            <div className="grid grid-cols-4 gap-2">
              <div className="flex flex-col items-center justify-center p-3 bg-red-500/5 border border-red-500/10 rounded-2xl gap-1.5 shadow-[inset_0_1px_5px_rgba(239,68,68,0.02)]">
                <FiShield className="text-red-500 text-lg sm:text-xl" />
                <span className="text-[10px] font-black text-red-500 whitespace-nowrap">Super Admin</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl gap-1.5 shadow-[inset_0_1px_5px_rgba(16,185,129,0.02)]">
                <FiLock className="text-emerald-500 text-lg sm:text-xl" />
                <span className="text-[10px] font-black text-emerald-500 whitespace-nowrap">Full Access</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-blue-500/5 border border-blue-500/10 rounded-2xl gap-1.5 shadow-[inset_0_1px_5px_rgba(59,130,246,0.02)]">
                <FiCheckCircle className="text-blue-500 text-lg sm:text-xl" />
                <span className="text-[10px] font-black text-blue-500 whitespace-nowrap">Verified</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl gap-1.5 shadow-[inset_0_1px_5px_rgba(234,179,8,0.02)]">
                <FiStar className="text-yellow-500 text-lg sm:text-xl" />
                <span className="text-[10px] font-black text-yellow-500 whitespace-nowrap">Trusted</span>
              </div>
            </div>
          </div>

          {/* 3. Account Management Rows */}
          <div className="flex flex-col gap-3 shrink-0">
            <div className="flex items-center gap-2 mb-1 pl-1">
              <div className="w-6 h-6 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <FiUser size={13} />
              </div>
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider">Account</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Edit Profile Row */}
              <button
                onClick={() => {
                  setIsEditProfileOpen(true);
                }}
                className="w-full bg-[#0c0d19]/40 border border-gray-800/80 rounded-2xl p-4 flex items-center justify-between hover:border-red-500/20 hover:bg-[#121324] transition-all duration-300 group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shadow-sm">
                    <FiUser size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white leading-tight">Edit Profile</h4>
                    <p className="text-xs text-gray-500 font-semibold mt-1">Name, photo, contact info</p>
                  </div>
                </div>
                <FiChevronRight className="text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300" />
              </button>

              {/* Change Password Row */}
              <button
                onClick={() => setIsChangePasswordOpen(true)}
                className="w-full bg-[#0c0d19]/40 border border-gray-800/80 rounded-2xl p-4 flex items-center justify-between hover:border-blue-500/20 hover:bg-[#121324] transition-all duration-300 group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-sm">
                    <FiLock size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white leading-tight">Change Password</h4>
                    <p className="text-xs text-gray-500 font-semibold mt-1">Update your password</p>
                  </div>
                </div>
                <FiChevronRight className="text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300" />
              </button>

              {/* Phone Number Row */}
              <button
                onClick={() => {
                  setIsEditProfileOpen(true);
                }}
                className="w-full bg-[#0c0d19]/40 border border-gray-800/80 rounded-2xl p-4 flex items-center justify-between hover:border-emerald-500/20 hover:bg-[#121324] transition-all duration-300 group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-sm">
                    <FiPhone size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white leading-tight">Phone Number</h4>
                    <p className="text-xs text-gray-500 font-semibold mt-1">{profileData.phone}</p>
                  </div>
                </div>
                <FiChevronRight className="text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300" />
              </button>

            </div>
          </div>

          {/* 4. Appearance Row */}
          <div className="flex flex-col gap-3 shrink-0">
            <div className="flex items-center gap-2 mb-1 pl-1">
              <div className="w-6 h-6 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <MdPalette size={13} />
              </div>
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider">Appearance</h3>
            </div>

            {/* Theme Toggle Card */}
            <div className="w-full bg-[#0c0d19]/40 border border-gray-800/80 rounded-2xl p-4 flex items-center justify-between transition-all duration-300">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 shadow-sm">
                  {isDarkMode ? <FiMoon size={18} /> : <FiSun size={18} />}
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-black text-white leading-tight">
                    {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                  </h4>
                  <p className="text-xs text-gray-500 font-semibold mt-1">Switch app appearance</p>
                </div>
              </div>

              {/* Slider Toggle */}
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-6.5 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none shadow-md ${isDarkMode ? 'bg-[#ca8a04]' : 'bg-black border border-gray-400'
                  }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow-lg transition duration-300 ease-in-out ${isDarkMode ? 'translate-x-5.5' : 'translate-x-0'
                    }`}
                />
              </button>
            </div>
          </div>

          {/* 5. Quick Access Grid */}
          <div className="flex flex-col gap-3 shrink-0">
            <div className="flex items-center gap-2 mb-1 pl-1">
              <div className="w-6 h-6 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <FiGrid size={13} />
              </div>
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider">Quick Access</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* User Management */}
              <button
                onClick={() => navigate('/admin/users')}
                className="w-full bg-[#0c0d19]/40 border border-gray-800/80 rounded-2xl p-4 flex items-center justify-between hover:border-emerald-500/20 hover:bg-[#121324] transition-all duration-300 group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-sm">
                    <FiGrid size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white leading-tight">User Management</h4>
                    <p className="text-xs text-gray-500 font-semibold mt-1">View and manage all users</p>
                  </div>
                </div>
                <FiChevronRight className="text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300" />
              </button>

              {/* Subject Management */}
              <button
                onClick={() => navigate('/admin/content')}
                className="w-full bg-[#0c0d19]/40 border border-gray-800/80 rounded-2xl p-4 flex items-center justify-between hover:border-blue-500/20 hover:bg-[#121324] transition-all duration-300 group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-sm">
                    <FiBookOpen size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white leading-tight">Subject Management</h4>
                    <p className="text-xs text-gray-500 font-semibold mt-1">Manage subjects and content</p>
                  </div>
                </div>
                <FiChevronRight className="text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300" />
              </button>

              {/* Platform Reports */}
              <button
                onClick={() => navigate('/admin/reports')}
                className="w-full bg-[#0c0d19]/40 border border-gray-800/80 rounded-2xl p-4 flex items-center justify-between hover:border-cyan-500/20 hover:bg-[#121324] transition-all duration-300 group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-sm">
                    <FiBarChart2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white leading-tight">Platform Reports</h4>
                    <p className="text-xs text-gray-500 font-semibold mt-1">Analytics and insights</p>
                  </div>
                </div>
                <FiChevronRight className="text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300" />
              </button>

            </div>
          </div>

          {/* 6. Sign Out Button */}
          <button
            onClick={handleLogout}
            className="w-full py-4 border border-red-500/30 hover:border-red-500/60 bg-red-500/5 hover:bg-red-500/10 rounded-2xl font-black text-red-500 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer mt-4"
          >
            <FiLogOut className="text-lg" />
            <span>Sign Out</span>
          </button>

        </div>

      </div>

      {/* MODAL 1: EDIT PROFILE BOTTOM SHEET */}
      {isEditProfileOpen && (
        <div
          className="fixed inset-0 bg-[#020205]/70 backdrop-blur-md z-50 flex items-end sm:items-center justify-center transition-all duration-300 animate-fade-in"
          onClick={() => setIsEditProfileOpen(false)}
        >
          <div
            className="w-full sm:max-w-md bg-[#0c0d19] border-t sm:border border-gray-800 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 pb-10 sm:pb-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden transition-transform duration-300 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-gray-800 rounded-full mx-auto mb-6 sm:hidden" />

            <h3 className="text-xl sm:text-2xl font-black text-white mb-6 text-left">
              Edit Profile
            </h3>

            <Formik
              initialValues={{
                name: profileData.name,
                email: profileData.email,
                phone: profileData.phone,
              }}
              validationSchema={EditProfileSchema}
              onSubmit={handleSaveProfile}
              enableReinitialize
            >
              {({ handleSubmit }) => (
                <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <Input
                    name="name"
                    type="text"
                    label="Full Name"
                    placeholder="Full Name"
                    icon={FiUser}
                    roleColor="admin"
                  />
                  <Input
                    name="email"
                    type="email"
                    label="Email"
                    placeholder="Email Address"
                    icon={FiMail}
                    roleColor="admin"
                  />
                  <Input
                    name="phone"
                    type="text"
                    label="Phone"
                    placeholder="Phone Number"
                    icon={FiPhone}
                    roleColor="admin"
                  />
                  <button
                    type="submit"
                    className="w-full py-4 mt-2 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white rounded-2xl font-black shadow-[0_4px_20px_rgba(239,68,68,0.25)] flex items-center justify-center gap-2 active:scale-95 transition-all duration-300 cursor-pointer"
                  >
                    <span>Save Changes</span>
                    <FiCheck className="text-base" />
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}

      {/* MODAL 2: CHANGE PASSWORD BOTTOM SHEET */}
      {isChangePasswordOpen && (
        <div
          className="fixed inset-0 bg-[#020205]/70 backdrop-blur-md z-50 flex items-end sm:items-center justify-center transition-all duration-300 animate-fade-in"
          onClick={() => setIsChangePasswordOpen(false)}
        >
          <div
            className="w-full sm:max-w-md bg-[#0c0d19] border-t sm:border border-gray-800 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 pb-10 sm:pb-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden transition-transform duration-300 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-gray-800 rounded-full mx-auto mb-6 sm:hidden" />

            <h3 className="text-xl sm:text-2xl font-black text-white mb-6 text-left">
              Change Password
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
              {({ handleSubmit }) => (
                <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <Input
                    name="currentPassword"
                    type="password"
                    label="Current Password"
                    placeholder="Current Password"
                    icon={FiLock}
                    showPasswordToggle={true}
                    roleColor="admin"
                  />
                  <Input
                    name="newPassword"
                    type="password"
                    label="New Password"
                    placeholder="New Password"
                    icon={FiLock}
                    showPasswordToggle={true}
                    roleColor="admin"
                  />
                  <Input
                    name="confirmPassword"
                    type="password"
                    label="Confirm Password"
                    placeholder="Confirm Password"
                    icon={FiLock}
                    showPasswordToggle={true}
                    roleColor="admin"
                  />
                  <button
                    type="submit"
                    className="w-full py-4 mt-2 bg-[#2563eb] hover:bg-blue-500 text-white rounded-2xl font-black shadow-[0_4px_20px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2 active:scale-95 transition-all duration-300 cursor-pointer"
                  >
                    <span>Update Password</span>
                    <FiCheck className="text-base" />
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Settings;
