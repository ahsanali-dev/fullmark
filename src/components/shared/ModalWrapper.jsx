import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ModalWrapper — Shared reusable modal/bottom-sheet component
 *
 * Props:
 *   isOpen        {boolean}   — show/hide modal
 *   onClose       {function}  — called when backdrop or X is clicked
 *   title         {string}    — modal heading
 *   subtitle      {string}    — optional subheading below title
 *   maxWidth      {string}    — tailwind max-w class, default 'sm:max-w-md'
 *   children      {ReactNode} — form / content inside modal
 *   showClose     {boolean}   — show X button, default true
 */
const ModalWrapper = ({
  isOpen,
  onClose,
  title,
  subtitle,
  maxWidth = 'sm:max-w-md',
  children,
  showClose = true,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#020205]/70 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4 transition-all duration-300 animate-fade-in"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 100, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className={`w-full ${maxWidth} bg-[#0c0d19] border-t sm:border border-gray-800 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 pb-10 sm:pb-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden text-left`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile drag handle */}
            <div className="w-12 h-1.5 bg-gray-800 rounded-full mx-auto mb-6 sm:hidden" />

            {/* Close Button */}
            {showClose && (
              <button
                onClick={onClose}
                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={20}
                  height={20}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}

            {/* Title & Subtitle */}
            {title && (
              <h3 className="text-xl sm:text-2xl font-black text-white mb-1 pr-8">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-gray-500 mb-6 font-semibold">{subtitle}</p>
            )}

            {/* Content */}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ModalWrapper;
