import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiGlobe, FiChevronDown } from 'react-icons/fi';

export default function Navbar({ activeSection, onNavClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isBoyleActive = location.pathname === '/boyle-law';

  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('EN');

  useEffect(() => {
    if (document.cookie.includes('googtrans=/en/ar')) {
      setCurrentLang('AR');
    } else {
      setCurrentLang('EN');
    }
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
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
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
        </div>
      </div>
    </motion.nav>
  );
}
