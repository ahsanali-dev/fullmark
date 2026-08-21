import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGlobe, FiChevronDown, FiGrid, FiLogOut, FiUser, FiSun, FiMoon, FiMenu, FiX, FiHome, FiLayers, FiUserPlus } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { logoutUser, getMe } from '../../redux/slices/authSlice';
import { useLanguage } from '../../context/LanguageContext';

export default function Navbar({ activeSection, onNavClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { language, changeLanguage, t } = useLanguage();

  const { isAuthenticated, user, token } = useSelector((state) => state.auth);

  const isBoyleActive = location.pathname === '/boyle-law';

  const [langOpen, setLangOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  const langMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const isLight = theme === 'light';

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
      const storedTheme = localStorage.getItem('theme') || 'dark';
      if (storedTheme !== theme) {
        setTheme(storedTheme);
      }
    };
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, [theme]);

  useEffect(() => {
    if (token && !user) {
      dispatch(getMe());
    }
  }, [dispatch, token, user]);

  // Close mobile menu on page navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close dropdowns if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setLangOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !event.target.closest('#mobile-menu-btn')) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageSelect = (langCode) => {
    changeLanguage(langCode);
    setLangOpen(false);
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
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-colors duration-300 ${
        isLight
          ? 'bg-white/90 border-slate-200 shadow-md text-slate-900'
          : 'bg-[#080911]/85 border-gray-800/60 shadow-xl text-gray-100'
      }`}
    >
      <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between px-3 sm:px-6 md:px-12 py-2.5 sm:py-3.5">
        {/* BRAND LOGO */}
        <div className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0" onClick={scrollToTop}>
          <img src="/assets/images/logo.png" alt="FullMark" className="h-9 sm:h-10 w-auto object-contain group-hover:scale-105 transition-transform" />
          <span className={`hidden sm:inline text-xl font-black tracking-tight transition-colors ${isLight ? 'text-slate-900 group-hover:text-cyan-600' : 'text-white group-hover:text-cyan-400'}`}>
            FullMark<span className="text-cyan-400 font-extrabold text-base">.ai</span>
          </span>
        </div>

        {/* CENTER NAV LINKS */}
        <div className="hidden lg:flex items-center gap-7 text-sm font-extrabold">
          <a
            href="#hero"
            onClick={scrollToTop}
            className={`hover:text-cyan-500 transition-all duration-200 cursor-pointer relative py-1.5 ${
              !activeSection || activeSection === 'hero' 
                ? (isLight ? 'text-cyan-600 font-black' : 'text-cyan-400 font-black') 
                : (isLight ? 'text-slate-600' : 'text-gray-300')
            }`}
          >
            {t('nav.home')}
            {(!activeSection || activeSection === 'hero') && !isBoyleActive && (
              <motion.span layoutId="activeNavLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]" />
            )}
          </a>

          <span
            onClick={() => navigate('/boyle-law')}
            className={`hover:text-cyan-500 transition-all duration-200 cursor-pointer relative py-1.5 ${
              isBoyleActive ? (isLight ? 'text-cyan-600 font-black' : 'text-cyan-400 font-black') : (isLight ? 'text-slate-600' : 'text-gray-300')
            }`}
          >
            {t('nav.lab')}
            {isBoyleActive && (
              <motion.span layoutId="activeNavLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]" />
            )}
          </span>
        </div>

        {/* RIGHT ACTION BUTTONS */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          
          {/* THEME TOGGLE BUTTON */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center cursor-pointer transition-all shadow-sm shrink-0 ${
              isLight
                ? 'bg-slate-100 border-slate-300 text-amber-500 hover:border-amber-400 hover:bg-amber-50'
                : 'bg-gray-900/90 border-gray-700/80 text-yellow-400 hover:border-cyan-400/50 hover:bg-gray-800'
            }`}
            title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {isLight ? <FiMoon className="text-sm sm:text-base" /> : <FiSun className="text-sm sm:text-base" />}
          </button>

          {/* LANGUAGE DROPDOWN */}
          <div className="relative shrink-0" ref={langMenuRef}>
            <button
              onClick={() => {
                setLangOpen(!langOpen);
                setUserMenuOpen(false);
              }}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-black cursor-pointer transition-all shadow-sm whitespace-nowrap ${
                isLight
                  ? 'bg-slate-100 border-slate-300 text-slate-800 hover:border-cyan-500'
                  : 'bg-gray-900/90 border-gray-700/80 text-gray-200 hover:text-white hover:border-cyan-400/50'
              }`}
            >
              <FiGlobe className="text-cyan-400 text-sm" />
              <span>{language.toUpperCase()}</span>
              <FiChevronDown className={`text-gray-400 text-xs transition-transform ${langOpen ? 'rotate-180' : ''}`} />
            </button>

            {langOpen && (
              <div className={`absolute ltr:right-0 rtl:left-0 mt-2 w-36 rounded-xl border py-1.5 z-50 flex flex-col gap-1 backdrop-blur-2xl ${
                isLight ? 'bg-white border-slate-200 shadow-xl' : 'bg-[#0a0c18] border-cyan-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.8)]'
              }`}>
                <button
                  onClick={() => handleLanguageSelect('ar')}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-bold hover:bg-cyan-500/20 hover:text-cyan-600 transition-colors cursor-pointer ${
                    language === 'ar' ? 'text-cyan-500 bg-cyan-500/10' : (isLight ? 'text-slate-700' : 'text-gray-300')
                  }`}
                >
                  <span>🇸🇦</span>
                  <span>العربية (AR)</span>
                </button>
                <button
                  onClick={() => handleLanguageSelect('en')}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-bold hover:bg-cyan-500/20 hover:text-cyan-600 transition-colors cursor-pointer ${
                    language === 'en' ? 'text-cyan-500 bg-cyan-500/10' : (isLight ? 'text-slate-700' : 'text-gray-300')
                  }`}
                >
                  <span>🇬🇧</span>
                  <span>English (EN)</span>
                </button>
              </div>
            )}
          </div>

          {/* AUTH USER DROPDOWN / SIGN IN BUTTONS */}
          {(isAuthenticated || token) ? (
            <div className="relative shrink-0" ref={userMenuRef}>
              <button
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen);
                  setLangOpen(false);
                }}
                className={`flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3 py-1.5 rounded-2xl border transition-all cursor-pointer shadow-md group whitespace-nowrap ${
                  isLight
                    ? 'bg-slate-100 border-slate-300 text-slate-800 hover:border-cyan-500'
                    : 'bg-gray-900/90 border-gray-700/80 text-gray-200 hover:text-white hover:border-cyan-500/50'
                }`}
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center font-black text-white text-xs shadow-sm shrink-0">
                  {user?.name ? user.name.substring(0, 2).toUpperCase() : <FiUser size={13} />}
                </div>
                <span className={`text-xs font-black max-w-[80px] sm:max-w-[120px] truncate ${isLight ? 'text-slate-800' : 'text-white'}`}>
                  {user?.name || user?.fullName || user?.email?.split('@')[0] || t('nav.account')}
                </span>
                <FiChevronDown className={`text-xs transition-transform duration-200 ${isLight ? 'text-slate-500' : 'text-gray-400'} ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute ltr:right-0 rtl:left-0 mt-2.5 w-56 rounded-2xl border p-2 z-50 backdrop-blur-2xl ${
                      isLight 
                        ? 'bg-white/95 border-slate-200 shadow-xl text-slate-800' 
                        : 'bg-[#0b0c18] border-gray-800 shadow-[0_15px_40px_rgba(0,0,0,0.8)] text-gray-200'
                    }`}
                  >
                    {/* User Info Header */}
                    <div className={`px-3 py-2.5 border-b mb-1.5 flex flex-col gap-0.5 ${isLight ? 'border-slate-200' : 'border-gray-800/80'}`}>
                      <p className={`text-xs font-black truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {user?.name || user?.fullName || 'Logged In User'}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                          isLight ? 'bg-cyan-50 border-cyan-200 text-cyan-700' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                        }`}>
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
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer group mb-1 ${
                        isLight 
                          ? 'text-slate-700 hover:text-slate-900 hover:bg-cyan-50' 
                          : 'text-gray-200 hover:text-white hover:bg-cyan-500/15'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 group-hover:scale-105 transition-transform shrink-0">
                        <FiGrid size={14} />
                      </div>
                      <span>{t('nav.dashboard')}</span>
                    </button>

                    {/* Logout Button */}
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        dispatch(logoutUser());
                        toast.success(t('dashboard.logOut'));
                        navigate('/');
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-extrabold text-red-500 rounded-xl transition-all cursor-pointer group ${
                        isLight ? 'hover:bg-red-50' : 'hover:bg-red-500/15'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 group-hover:scale-105 transition-transform shrink-0">
                        <FiLogOut size={14} />
                      </div>
                      <span>{t('nav.logOut')}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className={`px-3 sm:px-4.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isLight
                    ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
                    : 'border-gray-700/80 bg-gray-900/60 hover:bg-gray-800 text-gray-200 hover:text-white'
                }`}
              >
                {t('nav.signIn')}
              </button>

              <button
                onClick={() => navigate('/register')}
                className="hidden sm:inline-flex px-5 py-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-black shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                {t('nav.createAccount')}
              </button>
            </>
          )}
          {/* MOBILE HAMBURGER BUTTON */}
          <button
            id="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center cursor-pointer transition-all shadow-sm shrink-0 ${
              isLight
                ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                : 'bg-gray-900/90 border-gray-700/80 text-gray-200 hover:text-white hover:border-cyan-400/50 hover:bg-gray-800'
            }`}
            title="Toggle Menu"
          >
            {mobileMenuOpen ? <FiX className="text-base" /> : <FiMenu className="text-base" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className={`lg:hidden overflow-hidden border-t px-6 py-4 flex flex-col gap-3 backdrop-blur-2xl ${
              isLight
                ? 'bg-white/95 border-slate-200 text-slate-900 shadow-xl'
                : 'bg-[#080911]/95 border-gray-800/80 text-gray-100 shadow-2xl'
            }`}
          >
            {/* Links List */}
            <div className="flex flex-col gap-1.5">
              <a
                href="#hero"
                onClick={(e) => {
                  scrollToTop();
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                  !activeSection || activeSection === 'hero'
                    ? (isLight ? 'bg-cyan-50 text-cyan-700' : 'bg-cyan-500/15 text-cyan-400')
                    : (isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-gray-800/60 text-gray-300')
                }`}
              >
                <FiHome className="text-base text-cyan-500" />
                <span>{t('nav.home')}</span>
              </a>

              <button
                onClick={() => {
                  navigate('/boyle-law');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer text-start ${
                  isBoyleActive
                    ? (isLight ? 'bg-cyan-50 text-cyan-700' : 'bg-cyan-500/15 text-cyan-400')
                    : (isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-gray-800/60 text-gray-300')
                }`}
              >
                <FiLayers className="text-base text-cyan-500" />
                <span>{t('nav.lab')}</span>
              </button>
            </div>

            {/* Mobile Auth Buttons if Not Authenticated */}
            {!(isAuthenticated || token) && (
              <div className={`pt-3 border-t flex flex-col gap-2 ${isLight ? 'border-slate-200' : 'border-gray-800'}`}>
                <button
                  onClick={() => {
                    navigate('/register');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-black shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FiUserPlus size={14} />
                  <span>{t('nav.createAccount')}</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
