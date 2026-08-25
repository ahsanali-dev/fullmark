import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiSend } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, isRTL } = useLanguage();

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const handleThemeChange = () => {
      setTheme(localStorage.getItem('theme') || 'dark');
    };
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  const isLight = theme === 'light';

  const scrollToTop = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  return (
    <footer className={`relative border-t backdrop-blur-xl py-14 px-6 md:px-12 z-20 transition-colors duration-300 ${
      isLight 
        ? 'bg-slate-100/90 border-slate-200 text-slate-600' 
        : 'bg-[#080911]/90 border-gray-900 text-gray-400'
    }`}>
      <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">

        {/* Brand Info (col-span-5) */}
        <div className="lg:col-span-5 flex flex-col gap-4 text-start">
          <div className="flex items-center gap-3 cursor-pointer select-none group w-fit" onClick={scrollToTop}>
            <img src="/assets/images/logo.png" alt="FullMark" className="h-10 md:h-11 w-auto object-contain group-hover:scale-105 transition-transform" />
            <span className={`text-xl md:text-2xl font-black tracking-wide transition-colors ${
              isLight ? 'text-slate-900 group-hover:text-red-600' : 'text-white group-hover:text-red-400'
            }`}>
              {t('nav.brand', 'FullMark')}
            </span>
          </div>
          <p className={`text-sm md:text-base font-semibold leading-relaxed max-w-md ${
            isLight ? 'text-slate-600' : 'text-gray-400'
          }`}>
            {t('footer.brandDesc', isRTL 
              ? 'تمكين الفصول الدراسية بتقنيات الذكاء الاصطناعي لاستخراج الامتحانات وبنوك الأسئلة التفاعلية ولوحات التحكم الذكية للمعلمين والطلاب وأولياء الأمور.' 
              : 'Empowering classrooms with AI-assisted assessment parsing, dynamic test banks, and comprehensive real-time dashboards for admins, teachers, and students.')}
          </p>
        </div>

        {/* Legal & Policies Links (col-span-3) */}
        <div className="lg:col-span-3 flex flex-col gap-4 text-start">
          <h4 className="text-sm md:text-base font-black uppercase tracking-wider text-blue-500 font-sans">
            {t('footer.resources', isRTL ? 'الشروط والخصوصية' : 'Legal & Policies')}
          </h4>
          <div className="flex flex-col gap-3 text-sm md:text-base font-extrabold">
            <a 
              onClick={() => navigate('/tnc')} 
              className={`transition-colors cursor-pointer ${isLight ? 'text-slate-700 hover:text-slate-900' : 'text-gray-300 hover:text-white'}`}
            >
              {t('footer.termsAndConditions', isRTL ? 'الشروط والأحكام' : 'Terms & Conditions')}
            </a>
            <a 
              onClick={() => navigate('/pp')} 
              className={`transition-colors cursor-pointer ${isLight ? 'text-slate-700 hover:text-slate-900' : 'text-gray-300 hover:text-white'}`}
            >
              {t('footer.privacyPolicy', isRTL ? 'سياسة الخصوصية' : 'Privacy Policy')}
            </a>
          </div>
        </div>

        {/* Newsletter (col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-4 text-start">
          <h4 className="text-sm md:text-base font-black uppercase tracking-wider text-emerald-500 font-sans">
            {t('footer.stayUpdated', isRTL ? 'ابق على اطلاع' : 'Stay Updated')}
          </h4>
          <p className={`text-sm md:text-base font-semibold leading-relaxed ${
            isLight ? 'text-slate-600' : 'text-gray-400'
          }`}>
            {t('footer.subscribeDesc', isRTL 
              ? 'اشترك للحصول على أحدث التحديثات حول تحسينات معالجة الامتحانات بالذكاء الاصطناعي.' 
              : 'Subscribe to get the latest updates on AI parsing enhancements and feature releases.')}
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2 mt-1">
            <div className="relative flex-grow">
              <input
                type="email"
                placeholder={t('footer.emailPlaceholder', isRTL ? 'أدخل البريد الإلكتروني' : 'Enter email address')}
                className={`w-full rounded-xl px-4 py-3 text-sm font-bold focus:outline-none transition-all ${
                  isLight
                    ? 'bg-white text-slate-900 border border-slate-300/90 placeholder-slate-400 focus:border-red-500 shadow-sm'
                    : 'bg-[#0a0b12] text-white border border-gray-800/80 placeholder-gray-500 focus:border-red-500/50 focus:shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                }`}
              />
            </div>
            <button
              type="submit"
              className="p-3.5 rounded-xl bg-gradient-to-br from-red-600 to-rose-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center border-none"
            >
              <FiSend size={16} />
            </button>
          </form>
        </div>

      </div>

      {/* Bottom copyright */}
      <div className={`w-full max-w-[1400px] mx-auto border-t mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isLight ? 'border-slate-200/90' : 'border-gray-900/60'
      }`}>
        <p className={`text-xs md:text-sm font-bold ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
          {t('footer.rights', isRTL ? '© 2026 FullMark. جميع الحقوق محفوظة.' : '© 2026 FullMark. All Rights Reserved.')}
        </p>
        <p className={`text-xs md:text-sm font-bold flex items-center gap-1 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
          {t('footer.madeWith', isRTL ? 'صنع بـ ❤️ ZZ Solutions.' : 'Made with ❤️ ZZ Solutions.')}
        </p>
      </div>
    </footer>
  );
}
