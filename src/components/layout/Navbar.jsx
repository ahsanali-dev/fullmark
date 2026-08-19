import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGlobe, FiChevronDown, FiGrid, FiLogOut, FiUser } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { logoutUser, getMe } from '../../redux/slices/authSlice';

export default function Navbar({ activeSection, onNavClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { isAuthenticated, user, token } = useSelector((state) => state.auth);

  const isBoyleActive = location.pathname === '/boyle-law';

  const [langOpen, setLangOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('EN');

  const langMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    if (token && !user) {
      dispatch(getMe());
    }
  }, [dispatch, token, user]);

  useEffect(() => {
    if (document.cookie.includes('googtrans=/en/ar')) {
      setCurrentLang('AR');
    } else {
      setCurrentLang('EN');
    }
  }, []);

  // Close dropdowns if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setLangOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (langCode) => {
    const langUpper = langCode.toUpperCase();
    setCurrentLang(langUpper);
    setLangOpen(false);

    const targetCookie = langCode === 'ar' ? '/en/ar' : '/en/en';
    document.cookie = `googtrans=${targetCookie}; path=/;`;
    document.cookie = `googtrans=${targetCookie}; path=/; domain=${window.location.hostname};`;

    const selectElem = document.querySelector('.goog-te-combo');
    if (selectElem) {
      selectElem.value = langCode;
      selectElem.dispatchEvent(new Event('change'));
    } else {
      window.location.reload();
    }
  };

  const scrollToTop = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const handleNavClick = (sectionId, e) => {
    e.preventDefault();
    if (onNavClick) {
      onNavClick(sectionId);
    } else {
      if (location.pathname === '/') {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate(`/#${sectionId}`);
      }
    }
  };

  const getDashboardPath = (role) => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'teacher':
        return '/teacher/dashboard';
      case 'parent':
        return '/parent/dashboard';
      case 'student':
      default:
        return '/student/dashboard';
    }
  };

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-[#080911]/85 backdrop-blur-xl border-b border-gray-800/60 shadow-xl"
    >
      <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between px-6 md:px-12 py-3.5">
        {/* BRAND LOGO */}
        <div className="flex items-center gap-2.5 cursor-pointer select-none group" onClick={scrollToTop}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center font-black text-white text-sm shadow-[0_0_20px_rgba(59,130,246,0.5)] group-hover:scale-105 transition-transform">
            FM
          </div>
          <span className="text-xl font-black text-white tracking-tight group-hover:text-cyan-400 transition-colors">
            FullMark<span className="text-cyan-400 font-extrabold text-base">.ai</span>
          </span>
        </div>

        {/* CENTER NAV LINKS */}
        <div className="hidden lg:flex items-center gap-7 text-sm font-extrabold">
          <a
            href="#hero"
            onClick={scrollToTop}
            className={`hover:text-cyan-400 transition-all duration-200 cursor-pointer relative py-1.5 ${!activeSection || activeSection === 'hero' ? 'text-cyan-400' : 'text-gray-300'}`}
          >
            Home
            {(!activeSection || activeSection === 'hero') && !isBoyleActive && (
              <motion.span layoutId="activeNavLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]" />
            )}
          </a>

          <a
            href="#teachers"
            onClick={(e) => handleNavClick('roles', e)}
            className={`hover:text-cyan-400 transition-all duration-200 cursor-pointer relative py-1.5 ${activeSection === 'roles' ? 'text-cyan-400' : 'text-gray-300'}`}
          >
            About Teachers
          </a>

          <a
            href="#features"
            onClick={(e) => handleNavClick('features', e)}
            className={`hover:text-cyan-400 transition-all duration-200 cursor-pointer relative py-1.5 ${activeSection === 'features' ? 'text-cyan-400' : 'text-gray-300'}`}
          >
            Chemistry Courses
          </a>

          <a
            href="#stats"
            onClick={(e) => handleNavClick('stats', e)}
            className={`hover:text-cyan-400 transition-all duration-200 cursor-pointer relative py-1.5 ${activeSection === 'stats' ? 'text-cyan-400' : 'text-gray-300'}`}
          >
            Smart Exams
          </a>

          <span
            onClick={() => navigate('/boyle-law')}
            className={`hover:text-cyan-400 transition-all duration-200 cursor-pointer relative py-1.5 ${isBoyleActive ? 'text-cyan-400' : 'text-gray-300'}`}
          >
            Contact Us
          </span>
        </div>

        {/* RIGHT ACTION BUTTONS */}
        <div className="flex items-center gap-3">
          {/* LANGUAGE DROPDOWN */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => {
                setLangOpen(!langOpen);
                setUserMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900/90 border border-gray-700/80 text-xs font-black text-gray-200 hover:text-white hover:border-cyan-400/50 cursor-pointer transition-all shadow-sm"
            >
              <FiGlobe className="text-cyan-400 text-sm" />
              <span>{currentLang}</span>
              <FiChevronDown className={`text-gray-400 text-xs transition-transform ${langOpen ? 'rotate-180' : ''}`} />
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-2 w-36 rounded-xl bg-[#0a0c18] border border-cyan-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.8)] py-1.5 z-50 flex flex-col gap-1 backdrop-blur-2xl">
                <button
                  onClick={() => changeLanguage('en')}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-bold text-left hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors cursor-pointer ${currentLang === 'EN' ? 'text-cyan-400 bg-cyan-500/10' : 'text-gray-300'}`}
                >
                  <span>🇬🇧</span>
                  <span>English (EN)</span>
                </button>
                <button
                  onClick={() => changeLanguage('ar')}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-bold text-left hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors cursor-pointer ${currentLang === 'AR' ? 'text-cyan-400 bg-cyan-500/10' : 'text-gray-300'}`}
                >
                  <span>🇸🇦</span>
                  <span>العربية (AR)</span>
                </button>
              </div>
            )}
          </div>

          {/* AUTH USER DROPDOWN / SIGN IN BUTTONS */}
          {(isAuthenticated || token) ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen);
                  setLangOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-gray-900/90 border border-gray-700/80 hover:border-cyan-500/50 text-gray-200 hover:text-white transition-all cursor-pointer shadow-md group"
              >
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center font-black text-white text-xs shadow-sm">
                  {user?.name ? user.name.substring(0, 2).toUpperCase() : <FiUser size={13} />}
                </div>
                <span className="text-xs font-black max-w-[120px] truncate text-white">
                  {user?.name || user?.fullName || user?.email?.split('@')[0] || 'Account'}
                </span>
                <FiChevronDown className={`text-gray-400 text-xs transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2.5 w-56 rounded-2xl bg-[#0b0c18] border border-gray-800 shadow-[0_15px_40px_rgba(0,0,0,0.8)] p-2 z-50 backdrop-blur-2xl text-left"
                  >
                    {/* User Info Header */}
                    <div className="px-3 py-2.5 border-b border-gray-800/80 mb-1.5 flex flex-col gap-0.5">
                      <p className="text-xs font-black text-white truncate">
                        {user?.name || user?.fullName || 'Logged In User'}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                          {user?.role || 'User'}
                        </span>
                      </div>
                    </div>

                    {/* Dashboard Navigation Button */}
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate(getDashboardPath(user?.role));
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-extrabold text-gray-200 hover:text-white hover:bg-cyan-500/15 rounded-xl transition-all cursor-pointer group mb-1 text-left"
                    >
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform shrink-0">
                        <FiGrid size={14} />
                      </div>
                      <span>Go to Dashboard</span>
                    </button>

                    {/* Logout Button */}
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        dispatch(logoutUser());
                        toast.success('Logged out successfully!');
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-extrabold text-red-400 hover:bg-red-500/15 rounded-xl transition-all cursor-pointer group text-left"
                    >
                      <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-105 transition-transform shrink-0">
                        <FiLogOut size={14} />
                      </div>
                      <span>Log Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="px-4.5 py-2 rounded-2xl border border-gray-700/80 bg-gray-900/60 hover:bg-gray-800 text-gray-200 hover:text-white text-xs font-black transition-all cursor-pointer"
              >
                Sign In
              </button>

              <button
                onClick={() => navigate('/register')}
                className="px-5 py-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-black shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                Create Account
              </button>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
