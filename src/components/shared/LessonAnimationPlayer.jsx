import React, { useState, useRef } from 'react';
import { FiMaximize2, FiMinimize2, FiLayers, FiExternalLink } from 'react-icons/fi';
import { getImageUrl } from '../../utils/imageUrl';
import { useLanguage } from '../../context/LanguageContext';

const LessonAnimationPlayer = ({
  animationUrl = null,
  animationTitle = null,
  animationTitleAr = null,
  previewBlobUrl = null,
  className = '',
  aspectRatio = '16/10'
}) => {
  const { isRTL } = useLanguage();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  if (!animationUrl && !previewBlobUrl) {
    return null;
  }

  const title = (isRTL ? animationTitleAr || animationTitle : animationTitle || animationTitleAr) ||
    (isRTL ? 'الرسوم المتحركة التفاعلية' : 'Interactive Animation');

  // Resolve src: use local object URL if previewing before upload, otherwise static uploads URL
  const src = previewBlobUrl || getImageUrl(animationUrl);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className={`w-full rounded-3xl bg-[#080911] border border-gray-800/80 shadow-2xl overflow-hidden flex flex-col relative ${className}`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-[#0d0f1e] border-b border-gray-800/60 z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <FiLayers size={16} />
          </div>
          <span className="text-xs md:text-sm font-extrabold text-white truncate" title={title}>
            {title}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl bg-gray-800/60 hover:bg-gray-700/80 text-gray-300 hover:text-white transition-all cursor-pointer border border-gray-700/50 flex items-center justify-center"
            title={isRTL ? "فتح في نافذة جديدة" : "Open in new window"}
          >
            <FiExternalLink size={15} />
          </a>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-gray-800/60 hover:bg-gray-700/80 text-gray-300 hover:text-white transition-all cursor-pointer border border-gray-700/50 flex items-center justify-center"
            title={isFullscreen ? (isRTL ? "إنهاء الشاشة الكاملة" : "Exit Fullscreen") : (isRTL ? "ملء الشاشة" : "Fullscreen")}
          >
            {isFullscreen ? <FiMinimize2 size={15} /> : <FiMaximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div
        className="w-full relative bg-black flex-1 min-h-[380px] sm:min-h-[440px] md:min-h-[500px]"
        style={{ aspectRatio: isFullscreen ? 'auto' : aspectRatio }}
      >
        <iframe
          src={src}
          /*
            CRITICAL SECURITY REQUIREMENT:
            sandbox MUST be "allow-scripts" ONLY!
            NEVER add "allow-same-origin" alongside "allow-scripts" or fetch/inject raw HTML into the DOM.
          */
          sandbox="allow-scripts"
          allowFullScreen
          title={title}
          className="w-full h-full border-0 bg-black block min-h-[380px] sm:min-h-[440px] md:min-h-[500px]"
        />
      </div>
    </div>
  );
};

export default LessonAnimationPlayer;
