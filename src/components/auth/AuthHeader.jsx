import React, { useState, useEffect, useRef } from 'react';
import { FiSun, FiMoon, FiGlobe, FiChevronDown } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';

const AuthHeader = () => {
  const { language, setLanguage, isRTL } = useLanguage();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [langOpen, setLangOpen] = useState(false);
  const langMenuRef = useRef(null);

  useEffect(() => {
    const handleThemeChange = () => setTheme(localStorage.getItem('theme') || 'dark');
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isLight = theme === 'light';

  const toggleTheme = () => {
    const nextTheme = isLight ? 'dark' : 'light';
    localStorage.setItem('theme', nextTheme);
    window.dispatchEvent(new Event('themeChange'));
  };

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    setLangOpen(false);
  };

  return (
    <div className="absolute top-5 ltr:right-6 rtl:left-6 z-50 flex items-center gap-3">
      {/* Theme Toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-sm ${
          isLight
            ? 'bg-slate-100 border-slate-300 text-amber-500 hover:bg-slate-200'
            : 'bg-gray-900/90 border-gray-700/80 text-cyan-400 hover:border-cyan-400/50'
        }`}
        title="Toggle Theme"
      >
        {isLight ? <FiSun size={17} /> : <FiMoon size={17} />}
      </button>

      {/* Language Selector */}
      <div className="relative" ref={langMenuRef}>
        <button
          type="button"
          onClick={() => setLangOpen(!langOpen)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-black cursor-pointer transition-all shadow-sm ${
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
              type="button"
              onClick={() => handleLanguageSelect('ar')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-bold hover:bg-cyan-500/20 hover:text-cyan-600 transition-colors cursor-pointer ${
                language === 'ar' ? 'text-cyan-500 bg-cyan-500/10' : (isLight ? 'text-slate-700' : 'text-gray-300')
              }`}
            >
              <span>🇸🇦</span>
              <span>العربية (AR)</span>
            </button>
            <button
              type="button"
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
    </div>
  );
};

export default AuthHeader;
