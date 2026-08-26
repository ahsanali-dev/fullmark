import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiDownload, FiGlobe, FiSmartphone, FiCheckCircle, FiClock } from 'react-icons/fi';
import { FaAndroid, FaApple } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';

export default function AppDownloadModal({ isOpen, onClose }) {
  const { isRTL } = useLanguage();
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [isLight, setIsLight] = useState(() => document.documentElement.classList.contains('light'));

  useEffect(() => {
    const checkTheme = () => setIsLight(document.documentElement.classList.contains('light'));
    checkTheme();
    window.addEventListener('themeChange', checkTheme);
    return () => window.removeEventListener('themeChange', checkTheme);
  }, []);

  if (!isOpen) return null;

  const ANDROID_DOWNLOAD_URL = 'https://play.google.com/store/apps/details?id=com.app.fullmark';

  const handleAndroidDownload = () => {
    setSelectedPlatform('android');
    toast.success(isRTL ? 'جاري توجيهك إلى متجر بلاي...' : 'Redirecting to Play Store...');
    setTimeout(() => {
      window.open(ANDROID_DOWNLOAD_URL, '_blank', 'noopener,noreferrer');
    }, 400);
  };

  const handleIOSClick = () => {
    setSelectedPlatform('ios');
  };

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`relative w-full max-w-xl max-h-[90vh] sm:max-h-[85vh] rounded-3xl p-5 sm:p-8 flex flex-col gap-4 sm:gap-5 text-start overflow-hidden shadow-2xl transition-colors duration-300 ${
            isLight
              ? 'bg-white border border-slate-200 shadow-slate-300/50'
              : 'bg-[#0a0c1a] border border-cyan-500/30 shadow-[0_0_50px_rgba(34,211,238,0.2)]'
          }`}
        >
          {/* Ambient Glows */}
          <div className="absolute -top-20 -right-20 w-32 sm:w-48 h-32 sm:h-48 bg-cyan-500/15 dark:bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-32 sm:w-48 h-32 sm:h-48 bg-purple-500/15 dark:bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 rtl:right-auto rtl:left-4 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all cursor-pointer z-20 ${
              isLight
                ? 'bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
            }`}
          >
            <FiX size={16} className="sm:text-lg" />
          </button>

          {/* Fixed Header */}
          <div className={`flex items-center gap-3 sm:gap-4 shrink-0 pb-3 border-b pr-10 rtl:pr-0 rtl:pl-10 ${
            isLight ? 'border-slate-200' : 'border-gray-800/40'
          }`}>
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-500 dark:text-cyan-400 flex items-center justify-center text-xl sm:text-2xl shrink-0 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
              <FiSmartphone />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-base sm:text-xl font-black leading-tight ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                {isRTL ? "تحميل تطبيق فولمارك" : "Download FullMark App"}
              </h3>
              <p className={`text-[11px] sm:text-xs font-semibold mt-0.5 leading-tight ${
                isLight ? 'text-slate-500' : 'text-gray-400'
              }`}>
                {isRTL ? "اختر نظام التشغيل لجهازك المحمول" : "Select your mobile operating system"}
              </p>
            </div>
          </div>

          {/* Scrollable Inner Body */}
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 custom-scrollbar">
            
            {/* Platform Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              
              {/* Android Option */}
              <div
                onClick={handleAndroidDownload}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 sm:gap-4 group relative overflow-hidden ${
                  selectedPlatform === 'android'
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_25px_rgba(16,185,129,0.25)]'
                    : isLight
                    ? 'border-slate-200 bg-slate-50 hover:border-emerald-500/60 hover:bg-emerald-500/5'
                    : 'border-gray-800 bg-[#0e1126] hover:border-emerald-500/60 hover:bg-emerald-500/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                    <FaAndroid />
                  </div>
                  <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                    {isRTL ? "متجر بلاي" : "Google Play"}
                  </span>
                </div>

                <div>
                  <h4 className={`text-sm sm:text-base font-extrabold group-hover:text-emerald-500 transition-colors ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    Google Play Store
                  </h4>
                  <p className={`text-[11px] sm:text-xs font-medium mt-0.5 leading-snug ${
                    isLight ? 'text-slate-600' : 'text-gray-400'
                  }`}>
                    {isRTL ? "تطبيق أندرويد متوفر رسمياً على متجر Google Play." : "Official Android app on Google Play Store."}
                  </p>
                </div>

                <div className={`flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400 pt-2 border-t ${
                  isLight ? 'border-slate-200' : 'border-gray-800/80'
                }`}>
                  <FiDownload size={14} />
                  <span>{isRTL ? "فتح في المتجر" : "Open Play Store"}</span>
                </div>
              </div>

              {/* iOS Option */}
              <div
                onClick={handleIOSClick}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-4 group relative overflow-hidden ${
                  selectedPlatform === 'ios'
                    ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_25px_rgba(168,85,247,0.25)]'
                    : isLight
                    ? 'border-slate-200 bg-slate-50 hover:border-purple-500/60 hover:bg-purple-500/5'
                    : 'border-gray-800 bg-[#0e1126] hover:border-purple-500/60 hover:bg-purple-500/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-300 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                    <FaApple />
                  </div>
                  <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[9px] sm:text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <FiClock size={10} />
                    <span>{isRTL ? "قريباً" : "Soon"}</span>
                  </span>
                </div>

                <div>
                  <h4 className={`text-sm sm:text-base font-extrabold group-hover:text-purple-500 transition-colors ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    iOS (iPhone / iPad)
                  </h4>
                  <p className={`text-[11px] sm:text-xs font-medium mt-0.5 leading-snug ${
                    isLight ? 'text-slate-600' : 'text-gray-400'
                  }`}>
                    {isRTL ? "قيد المراجعة النهائية وسيكون متاحاً خلال أيام." : "Final review stage, available in a few days."}
                  </p>
                </div>

                <div className={`flex items-center gap-1.5 text-xs font-black text-purple-600 dark:text-purple-300 pt-2 border-t ${
                  isLight ? 'border-slate-200' : 'border-gray-800/80'
                }`}>
                  <FiGlobe size={14} />
                  <span>{isRTL ? "استعرض تفاصيل iOS" : "View Details"}</span>
                </div>
              </div>

            </div>

            {/* iOS Information Box when selected */}
            {selectedPlatform === 'ios' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3.5 sm:p-4 rounded-2xl border text-start flex flex-col gap-2 ${
                  isLight
                    ? 'bg-purple-50 border-purple-200'
                    : 'bg-gradient-to-r from-purple-500/15 via-blue-500/15 to-cyan-500/15 border-purple-500/30'
                }`}
              >
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-extrabold text-xs">
                  <FiCheckCircle size={15} />
                  <span>{isRTL ? "تطبيق iOS على وشك الانطلاق!" : "iOS App is almost ready!"}</span>
                </div>
                <p className={`text-[11px] sm:text-xs font-medium leading-relaxed ${
                  isLight ? 'text-slate-700' : 'text-gray-300'
                }`}>
                  {isRTL
                    ? "تطبيق الآيفون والآيباد سيكون متاحاً على App Store خلال أيام معدودة! في هذه الأثناء، يمكنك الاعتماد كلياً على الموقع الإلكتروني حيث يمنحك تجربة تعليمية كاملة وتفاعلية مصممة خصيصاً للهاتف."
                    : "Our iOS app will be ready on the App Store within a few days! In the meantime, you can fully rely on our website—it is 100% mobile-friendly and provides the complete interactive learning experience."}
                </p>
                <button
                  onClick={onClose}
                  className="self-end px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs transition-all cursor-pointer mt-1 shadow-sm"
                >
                  {isRTL ? "المتابعة عبر الموقع" : "Continue on Web"}
                </button>
              </motion.div>
            )}
          </div>

          {/* Fixed Footer Note */}
          <div className={`pt-2 border-t flex items-center justify-center text-[10px] sm:text-[11px] font-semibold text-center shrink-0 ${
            isLight ? 'border-slate-200 text-slate-400' : 'border-gray-800/60 text-gray-500'
          }`}>
            <span>{isRTL ? "منصة فولمارك التعليمية الذكية" : "FullMark Smart Educational Platform"}</span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}
