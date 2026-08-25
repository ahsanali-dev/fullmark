import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiShield, FiLock, FiEye, FiServer,
  FiUserCheck, FiDatabase, FiPrinter, FiSearch,
  FiArrowLeft, FiHelpCircle, FiKey, FiCpu, FiFileText
} from 'react-icons/fi';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useLanguage } from '../context/LanguageContext';

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const { t, language, isRTL, translations } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('all');

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const handleThemeChange = () => {
      setTheme(localStorage.getItem('theme') || 'dark');
    };
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  const isLight = theme === 'light';
  const ppData = translations?.pp || {};

  const sections = [
    {
      id: 'collection',
      icon: FiDatabase,
      title: t('pp.sections.collection.title'),
      badge: t('pp.sections.collection.badge'),
      badgeColor: 'sky',
      content: ppData.sections?.collection?.bullets || []
    },
    {
      id: 'usage',
      icon: FiCpu,
      title: t('pp.sections.usage.title'),
      badge: t('pp.sections.usage.badge'),
      badgeColor: 'emerald',
      content: ppData.sections?.usage?.bullets || []
    },
    {
      id: 'parental-privacy',
      icon: FiUserCheck,
      title: t('pp.sections.parentalPrivacy.title'),
      badge: t('pp.sections.parentalPrivacy.badge'),
      badgeColor: 'purple',
      content: ppData.sections?.parentalPrivacy?.bullets || []
    },
    {
      id: 'parsing-security',
      icon: FiServer,
      title: t('pp.sections.parsingSecurity.title'),
      badge: t('pp.sections.parsingSecurity.badge'),
      badgeColor: 'indigo',
      content: ppData.sections?.parsingSecurity?.bullets || []
    },
    {
      id: 'sharing',
      icon: FiLock,
      title: t('pp.sections.sharing.title'),
      badge: t('pp.sections.sharing.badge'),
      badgeColor: 'rose',
      content: ppData.sections?.sharing?.bullets || []
    },
    {
      id: 'rights',
      icon: FiKey,
      title: t('pp.sections.rights.title'),
      badge: t('pp.sections.rights.badge'),
      badgeColor: 'amber',
      content: ppData.sections?.rights?.bullets || []
    },
    {
      id: 'cookies',
      icon: FiEye,
      title: t('pp.sections.cookies.title'),
      badge: t('pp.sections.cookies.badge'),
      badgeColor: 'blue',
      content: ppData.sections?.cookies?.bullets || []
    },
    {
      id: 'updates',
      icon: FiFileText,
      title: t('pp.sections.updates.title'),
      badge: t('pp.sections.updates.badge'),
      badgeColor: 'slate',
      content: ppData.sections?.updates?.bullets || []
    }
  ];

  const filteredSections = sections.filter(sec => {
    const matchesSection = activeSection === 'all' || sec.id === activeSection;
    const matchesSearch = !searchQuery || 
      sec.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      sec.content.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSection && matchesSearch;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`min-h-screen overflow-x-hidden font-sans transition-colors duration-300 ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#030614] text-gray-100'
    }`}>
      {/* Navbar */}
      <Navbar activeSection="" />

      {/* Main Container */}
      <main className="pt-28 pb-20 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">

        {/* Back Link & Print */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className={`inline-flex items-center gap-2 text-xs font-bold transition-colors ${
              isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-white'
            }`}
          >
            <FiArrowLeft size={16} className={isRTL ? 'rotate-180' : ''} />
            <span>{t('pp.backHome')}</span>
          </Link>

          <button
            onClick={handlePrint}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isLight
                ? 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700 shadow-sm'
                : 'border-gray-800 bg-gray-900/60 hover:bg-gray-800 text-gray-300'
            }`}
          >
            <FiPrinter size={14} />
            <span>{t('pp.printDocument')}</span>
          </button>
        </div>

        {/* Hero Header */}
        <div className={`relative rounded-3xl p-8 sm:p-12 mb-10 overflow-hidden border ${
          isLight 
            ? 'bg-gradient-to-br from-white via-emerald-50/50 to-teal-50/30 border-slate-200 shadow-xl' 
            : 'bg-gradient-to-br from-[#061817] via-[#08131e] to-[#040612] border-emerald-500/20 shadow-2xl'
        }`}>
          {/* Background Ambient Orbs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold mb-4">
              <FiShield size={14} />
              <span>{t('pp.badge')}</span>
            </div>

            <h1 className={`text-3xl sm:text-5xl font-black tracking-tight mb-4 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              {t('pp.title')}
            </h1>

            <p className={`text-sm sm:text-base font-semibold leading-relaxed mb-6 ${
              isLight ? 'text-slate-600' : 'text-gray-300'
            }`}>
              {t('pp.subtitle')}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-400">
              <span className={`px-3 py-1 rounded-lg border ${
                isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-gray-900 border-gray-800 text-gray-300'
              }`}>
                {t('pp.lastUpdated')}
              </span>
              <span className={`px-3 py-1 rounded-lg border ${
                isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-gray-900 border-gray-800 text-gray-300'
              }`}>
                {t('pp.securityStandard')}
              </span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">

          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('pp.searchPlaceholder')}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-bold focus:outline-none transition-all ${
                isLight
                  ? 'bg-white border-slate-300 focus:border-emerald-500 text-slate-900 shadow-sm'
                  : 'bg-gray-900/80 border-gray-800 focus:border-emerald-500 text-white'
              }`}
            />
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveSection('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                activeSection === 'all'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : isLight
                    ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    : 'bg-gray-900/60 text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              {t('pp.allTopics')}
            </button>
            {sections.slice(0, 5).map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                  activeSection === sec.id
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                    : isLight
                      ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      : 'bg-gray-900/60 text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                {sec.title.split('.')[1] || sec.title}
              </button>
            ))}
          </div>

        </div>

        {/* Policy Content Grid */}
        <div className="space-y-6">
          {filteredSections.length > 0 ? (
            filteredSections.map((sec, idx) => {
              const IconComp = sec.icon;
              return (
                <motion.div
                  key={sec.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className={`p-6 sm:p-8 rounded-2xl border transition-all duration-300 ${
                    isLight
                      ? 'bg-white border-slate-200 shadow-md hover:shadow-lg'
                      : 'bg-[#060a1d]/90 border-gray-800/90 shadow-lg hover:border-emerald-500/30'
                  }`}
                >
                  {/* Section Title */}
                  <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-gray-800/40">
                    <div className="flex items-center gap-3.5">
                      <div className={`p-2.5 rounded-xl ${
                        isLight ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        <IconComp size={22} />
                      </div>
                      <h2 className={`text-lg sm:text-xl font-black ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}>
                        {sec.title}
                      </h2>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                      isLight
                        ? 'bg-slate-100 text-slate-700 border border-slate-300'
                        : 'bg-gray-900 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {sec.badge}
                    </span>
                  </div>

                  {/* Section Bullet Points */}
                  <ul className="space-y-3">
                    {sec.content.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs sm:text-sm font-semibold leading-relaxed text-gray-300">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 mt-2 shrink-0 shadow-[0_0_8px_#10b981]" />
                        <span className={isLight ? 'text-slate-700' : 'text-gray-300'}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })
          ) : (
            <div className={`text-center py-16 rounded-2xl border ${
              isLight ? 'bg-white border-slate-200' : 'bg-gray-900/40 border-gray-800'
            }`}>
              <FiSearch size={36} className="mx-auto text-gray-500 mb-3" />
              <p className="text-sm font-bold text-gray-400">
                {t('pp.noResults')}
              </p>
            </div>
          )}
        </div>

        {/* Privacy Officer Contact Banner */}
        <div className={`mt-12 p-8 rounded-3xl border text-center flex flex-col items-center gap-4 ${
          isLight
            ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-slate-900'
            : 'bg-gradient-to-r from-[#061817] to-[#0a1628] border-emerald-500/30 text-white'
        }`}>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <FiLock size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black">{t('pp.helpTitle')}</h3>
            <p className={`text-xs font-semibold mt-1 max-w-xl mx-auto ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              {t('pp.helpDesc')}
            </p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs shadow-lg hover:scale-105 transition-all cursor-pointer"
          >
            {t('pp.contactOfficer')}
          </button>
        </div>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
