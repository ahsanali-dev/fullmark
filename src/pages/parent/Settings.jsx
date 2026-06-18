import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getStoredParentProfile, setStoredParentProfile, getStoredChildren } from '../../data/parentData';

/* ─── Section Header ────────────────────────────────────────── */
const SectionHeader = ({ icon: Icon, label, iconBg }) => (
  <div className="flex items-center gap-3 mb-3 mt-2">
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white ${iconBg}`}>
      <Icon size={16} />
    </div>
    <span className="text-base font-black text-white">{label}</span>
  </div>
);

/* ─── Settings Row ───────────────────────────────────────────── */
const SettingsRow = ({ icon: Icon, iconBg, label, subtitle, rightEl, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-4 bg-[#111520] border border-gray-800/60 rounded-2xl text-left transition-all cursor-pointer ${
      onClick ? 'hover:border-gray-700 active:scale-[0.99]' : 'cursor-default'
    }`}
  >
    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
      <Icon size={16} className="text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className={`text-sm font-extrabold leading-tight ${danger ? 'text-red-400' : 'text-white'}`}>{label}</p>
      {subtitle && <p className="text-[11px] text-gray-500 font-semibold mt-0.5">{subtitle}</p>}
    </div>
    {rightEl}
  </button>
);

/* ─── Toggle Switch ─────────────────────────────────────────── */
const Toggle = ({ value, onChange, activeColor = 'bg-purple-500' }) => (
  <button
    onClick={() => onChange(!value)}
    className={`relative w-12 h-6 rounded-full transition-all duration-300 cursor-pointer shrink-0 ${value ? activeColor : 'bg-gray-700'}`}
  >
    <span
      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${value ? 'left-6' : 'left-0.5'}`}
    />
  </button>
);

/* ═══════════════════════════════════════════════════════════════ */
const ParentSettings = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => getStoredParentProfile());
  const [children] = useState(() => getStoredChildren());
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ ...profile });
  const [pushNotifs, setPushNotifs] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

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

  useEffect(() => {
    const sync = () => {
      const t = localStorage.getItem('theme') || 'dark';
      if (t !== theme) setTheme(t);
    };
    window.addEventListener('themeChange', sync);
    return () => window.removeEventListener('themeChange', sync);
  }, [theme]);

  // Stats derived from children
  const allExams = children.flatMap(c => c.exams || []);
  const totalExams = allExams.length;
  const avgScore = totalExams > 0
    ? Math.round(allExams.reduce((s, e) => s + e.score, 0) / totalExams)
    : 0;

  const handleSave = () => {
    const updated = {
      ...editForm,
      initials: editForm.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2),
    };
    setStoredParentProfile(updated);
    setProfile(updated);
    setIsEditOpen(false);
    toast.success('Profile updated successfully!');
  };

  const isDark = theme === 'dark';
  const isModalOpen = isEditOpen;

  return (
    <DashboardLayout
      role="parent"
      activeTab="settings"
      title="My Profile"
      subtitle="Parent account settings"
      isModalOpen={isModalOpen}
    >
      <div className={`flex flex-col pb-36 lg:pb-16 transition-all duration-300 ${isModalOpen ? 'blur-sm pointer-events-none' : ''}`}>

        {/* ── PURPLE GRADIENT HERO (with stats inside) ── */}
        <div className="relative bg-gradient-to-br from-purple-700/90 to-indigo-600/90 mx-5 mt-4 rounded-3xl overflow-hidden shadow-[0_15px_30px_rgba(139,92,246,0.2)]">
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5 border border-white/10 pointer-events-none" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5 border border-white/10 pointer-events-none" />

          {/* Edit button */}
          <button
            onClick={() => { setEditForm({ ...profile }); setIsEditOpen(true); }}
            className="absolute top-4 right-4 w-10 h-10 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer z-10"
          >
            <FiEdit3 size={16} />
          </button>

          {/* Avatar + Info */}
          <div className="flex flex-col items-center gap-3 pt-6 px-6 pb-5 relative z-10 text-center">
            <div className="w-24 h-24 rounded-[2rem] bg-white/15 border-2 border-white/30 flex items-center justify-center font-black text-3xl text-white shadow-[0_0_25px_rgba(139,92,246,0.3)]">
              {profile.initials || 'AF'}
            </div>
            <div>
              <h2 className="text-2xl font-black text-white capitalize">{profile.name}</h2>
              <p className="text-white/70 text-sm font-semibold mt-0.5">{profile.email || 'p@gmail.com'}</p>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white text-[10px] font-extrabold tracking-wide uppercase">
                <FiUsers size={11} /> Parent
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white text-[10px] font-extrabold tracking-wide uppercase">
                <FiCalendar size={11} /> Since June 2026
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white text-[10px] font-extrabold tracking-wide uppercase">
                <FiEye size={11} /> {children.length} children
              </span>
            </div>
          </div>

          {/* Stats row — inside the hero card */}
          <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/15 relative z-10">
            {[
              { label: 'Children', value: children.length, icon: FiEye, iconBg: 'bg-white/15', iconColor: 'text-emerald-300' },
              { label: 'Exams', value: totalExams, icon: FiCalendar, iconBg: 'bg-white/15', iconColor: 'text-blue-300' },
              { label: 'Avg Score', value: `${avgScore}%`, icon: FiStar, iconBg: 'bg-white/15', iconColor: 'text-yellow-300' },
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
            <div className="flex items-center gap-2 pl-1">
              <div className="w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <FiUsers size={13} />
              </div>
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider">My Children</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {children.map((c) => {
                const cExams = c.exams || [];
                const cAvg = cExams.length > 0
                  ? Math.round(cExams.reduce((s, e) => s + e.score, 0) / cExams.length)
                  : 0;
                return (
                  <div
                    key={c.id}
                    className="flex items-center gap-4 p-4 bg-[#0c0d19]/40 hover:bg-[#121424] border border-gray-800/80 rounded-2xl transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-black text-base text-white shrink-0">
                      {c.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-white capitalize">{c.name}</p>
                      <p className="text-[11px] text-gray-500 font-semibold">{cExams.length} exams taken</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-orange-500/15 border border-orange-500/20 text-orange-400 text-[10px] font-black">
                          {cAvg}% avg
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/20 text-amber-400 text-[10px] font-black">
                          {c.streak || 0}d streak
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/parent/attendance')}
                      className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black hover:bg-emerald-500/20 transition-all cursor-pointer shrink-0"
                    >
                      View
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Notifications & Appearance ── */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 pl-1">
              <div className="w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <FiBell size={13} />
              </div>
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider">Preferences</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Push Notifications */}
              <div className="flex items-center justify-between p-4 bg-[#0c0d19]/40 border border-gray-800/80 rounded-2xl">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400">
                    <FiBell size={16} />
                  </div>
                  <div className="text-left">
                    <h5 className="text-sm font-bold text-white leading-none">Push Notifications</h5>
                    <span className="text-[10px] text-gray-500 font-semibold mt-1 block">Receive app notifications</span>
                  </div>
                </div>
                <Toggle value={pushNotifs} onChange={setPushNotifs} activeColor="bg-purple-500" />
              </div>

              {/* Dark Mode */}
              <div className="flex items-center justify-between p-4 bg-[#0c0d19]/40 border border-gray-800/80 rounded-2xl">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
                    {isDark ? <FiMoon size={18} /> : <FiSun size={18} />}
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-black text-white leading-tight">Dark Mode</h4>
                    <p className="text-[10px] text-gray-500 font-semibold mt-1">Switch app appearance</p>
                  </div>
                </div>
                <Toggle value={isDark} onChange={(val) => setTheme(val ? 'dark' : 'light')} activeColor="bg-yellow-500" />
              </div>
            </div>
          </div>

          {/* ── About ── */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 pl-1">
              <div className="w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <FiShield size={13} />
              </div>
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider">About</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => toast('Thank you for your feedback! 🌟')}
                className="flex items-center justify-between p-4 bg-[#0c0d19]/40 hover:bg-[#121424] border border-gray-800/80 rounded-2xl cursor-pointer transition-all group text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center text-yellow-400">
                    <FiStar size={18} />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white leading-none">Rate the App</h5>
                    <span className="text-[10px] text-gray-500 font-semibold mt-1 block">Share your feedback</span>
                  </div>
                </div>
                <FiChevronRight className="text-gray-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>

              <button
                onClick={() => toast('FullMark — Academic Management Platform v1.0.0')}
                className="flex items-center justify-between p-4 bg-[#0c0d19]/40 hover:bg-[#121424] border border-gray-800/80 rounded-2xl cursor-pointer transition-all group text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400">
                    <FiShield size={18} />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white leading-none">About FullMark</h5>
                    <span className="text-[10px] text-gray-500 font-semibold mt-1 block">Version 1.0.0</span>
                  </div>
                </div>
                <FiChevronRight className="text-gray-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>
            </div>
          </div>

          {/* ── Account ── */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 pl-1">
              <div className="w-6 h-6 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <FiShield size={13} />
              </div>
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider">Account</h3>
            </div>
            <button
              onClick={() => toast.error('Account deletion requires admin confirmation.')}
              className="flex items-center justify-between p-4 bg-[#0c0d19]/40 hover:bg-[#121424] border border-gray-800/80 rounded-2xl cursor-pointer transition-all group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-400">
                  <FiTrash2 size={18} />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-red-400 leading-none">Delete Account</h5>
                  <span className="text-[10px] text-gray-500 font-semibold mt-1 block">Permanently remove your account</span>
                </div>
              </div>
              <FiChevronRight className="text-gray-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>
          </div>

          {/* ── Sign Out ── */}
          <button
            onClick={() => { toast.success('Signed out successfully!'); navigate('/login'); }}
            className="w-full py-4 mt-2 border border-red-500/40 hover:border-red-500 bg-red-500/5 hover:bg-red-500/10 text-red-500 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all duration-300 active:scale-95 cursor-pointer"
          >
            <FiLogOut size={18} />
            <span>Sign Out</span>
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
            className="bg-[#0f1020] border border-gray-800 rounded-3xl p-6 w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.8)] animate-fade-in relative text-left"
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setIsEditOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-800/60 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              <FiX size={16} />
            </button>

            <h3 className="text-xl font-black text-white mb-5 pr-8">Edit Profile</h3>

            <div className="flex flex-col gap-4">
              {[
                { key: 'name', label: 'Full Name', icon: FiUser, type: 'text', placeholder: 'ali faraz' },
                { key: 'email', label: 'Email Address', icon: FiMail, type: 'email', placeholder: 'p@gmail.com' },
                { key: 'phone', label: 'Phone Number', icon: FiPhone, type: 'tel', placeholder: '+92 300 0000000' },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.key}
                    className="flex items-center gap-3 px-4 py-3.5 bg-[#0c0d19] border border-gray-700 rounded-2xl focus-within:border-purple-500/60 transition-colors"
                  >
                    <Icon className="text-purple-400 shrink-0" size={15} />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-0.5">{f.label}</span>
                      <input
                        type={f.type}
                        value={editForm[f.key] || ''}
                        onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })}
                        placeholder={f.placeholder}
                        className="bg-transparent border-none outline-none text-white text-sm font-semibold placeholder:text-gray-700 focus:ring-0 w-full"
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
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black text-sm shadow-[0_4px_20px_rgba(168,85,247,0.3)] flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <FiCheck size={15} /> Save
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ParentSettings;
