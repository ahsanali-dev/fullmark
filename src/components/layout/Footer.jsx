import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiGithub, FiTwitter, FiLinkedin, FiYoutube, FiSend } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const scrollToTop = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const handleQuickLink = (sectionId, e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  return (
    <footer className="relative border-t border-gray-900 bg-[#080911]/90 backdrop-blur-xl py-16 px-6 md:px-12 z-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">

        {/* Brand Info (col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-5 text-start">
          <div className="flex items-center gap-3 cursor-pointer select-none group w-fit" onClick={scrollToTop}>
            <img src="/assets/images/logo.png" alt="FullMark" className="h-9 w-auto object-contain group-hover:scale-105 transition-transform" />
            <span className="text-lg font-black text-white tracking-wide group-hover:text-red-400 transition-colors">{t('nav.brand')}</span>
          </div>
          <p className="text-xs font-semibold text-gray-500 leading-relaxed max-w-sm">
            {t('footer.brandDesc')}
          </p>
          {/* Social Icons */}
          <div className="flex items-center gap-3 mt-2">
            {[
              { Icon: FiGithub, href: 'https://github.com' },
              { Icon: FiTwitter, href: 'https://twitter.com' },
              { Icon: FiLinkedin, href: 'https://linkedin.com' },
              { Icon: FiYoutube, href: 'https://youtube.com' }
            ].map((s, idx) => (
              <a
                key={idx}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-gray-900/50 border border-gray-800/80 flex items-center justify-center text-gray-500 hover:text-white hover:border-gray-700 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.03)` }}
              >
                <s.Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links (col-span-2) */}
        <div className="lg:col-span-2 flex flex-col gap-4 text-start">
          <h4 className="text-xs font-black uppercase tracking-wider text-red-500 font-sans">{t('footer.platform')}</h4>
          <div className="flex flex-col gap-2.5 text-xs font-bold text-gray-500">
            <a href="#features" onClick={(e) => handleQuickLink('features', e)} className="hover:text-white transition-colors">{t('footer.features')}</a>
            <a href="#roles" onClick={(e) => handleQuickLink('roles', e)} className="hover:text-white transition-colors">{t('footer.portals')}</a>
            <a href="#stats" onClick={(e) => handleQuickLink('stats', e)} className="hover:text-white transition-colors">{t('footer.stats')}</a>
            <a onClick={() => navigate('/login')} className="hover:text-white transition-colors cursor-pointer">{t('footer.loginPanel')}</a>
          </div>
        </div>

        {/* Support / Docs (col-span-2) */}
        <div className="lg:col-span-2 flex flex-col gap-4 text-start">
          <h4 className="text-xs font-black uppercase tracking-wider text-blue-500 font-sans">{t('footer.resources')}</h4>
          <div className="flex flex-col gap-2.5 text-xs font-bold text-gray-500">
            <a href="#" className="hover:text-white transition-colors">{t('footer.documentation')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('footer.helpCenter')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('footer.apiRef')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('footer.privacyPolicy')}</a>
          </div>
        </div>

        {/* Newsletter (col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-4 text-start">
          <h4 className="text-xs font-black uppercase tracking-wider text-emerald-500 font-sans">{t('footer.stayUpdated')}</h4>
          <p className="text-xs font-semibold text-gray-500 leading-relaxed">
            {t('footer.subscribeDesc')}
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2 mt-1">
            <div className="relative flex-grow">
              <input
                type="email"
                placeholder={t('footer.emailPlaceholder')}
                className="w-full bg-[#0a0b12] text-white border border-gray-800/80 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-red-500/50 focus:shadow-[0_0_15px_rgba(239,68,68,0.1)] transition-all"
              />
            </div>
            <button
              type="submit"
              className="p-3 rounded-xl bg-gradient-to-br from-red-600 to-rose-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center border-none"
            >
              <FiSend size={15} />
            </button>
          </form>
        </div>

      </div>

      {/* Bottom copyright */}
      <div className="max-w-7xl mx-auto border-t border-gray-900/60 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[10px] text-gray-600 font-semibold">
          {t('footer.rights')}
        </p>
        <p className="text-[10px] text-gray-600 font-semibold flex items-center gap-1">
          {t('footer.madeWith')}
        </p>
      </div>
    </footer>
  );
}
