import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Navbar({ activeSection, onNavClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isBoyleActive = location.pathname === '/boyle-law';

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
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-[#080911]/70 backdrop-blur-xl border-b border-gray-800/50"
    >
      <div className="flex items-center gap-3 cursor-pointer select-none group" onClick={scrollToTop}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-500 flex items-center justify-center font-black text-white text-sm shadow-[0_0_20px_rgba(239,68,68,0.5)] group-hover:scale-105 transition-transform">FM</div>
        <span className="text-lg font-black text-white tracking-wide group-hover:text-red-400 transition-colors">FullMark</span>
      </div>
      <div className="hidden md:flex items-center gap-8 text-sm font-bold">
        <a 
          href="#stats" 
          onClick={(e) => handleNavClick('stats', e)}
          className={`hover:text-white transition-all duration-300 cursor-pointer relative py-1 ${activeSection === 'stats' && !isBoyleActive ? 'text-white' : 'text-gray-400'}`}
        >
          Stats
          {activeSection === 'stats' && !isBoyleActive && (
            <motion.span layoutId="activeNavLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
          )}
        </a>
        <a 
          href="#roles" 
          onClick={(e) => handleNavClick('roles', e)}
          className={`hover:text-white transition-all duration-300 cursor-pointer relative py-1 ${activeSection === 'roles' && !isBoyleActive ? 'text-white' : 'text-gray-400'}`}
        >
          Portals
          {activeSection === 'roles' && !isBoyleActive && (
            <motion.span layoutId="activeNavLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
          )}
        </a>
        <a 
          href="#features" 
          onClick={(e) => handleNavClick('features', e)}
          className={`hover:text-white transition-all duration-300 cursor-pointer relative py-1 ${activeSection === 'features' && !isBoyleActive ? 'text-white' : 'text-gray-400'}`}
        >
          Features
          {activeSection === 'features' && !isBoyleActive && (
            <motion.span layoutId="activeNavLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
          )}
        </a>
        <span
          onClick={() => navigate('/boyle-law')}
          className={`hover:text-white transition-all duration-300 cursor-pointer relative py-1 ${isBoyleActive ? 'text-white font-bold' : 'text-gray-400'}`}
        >
          Boyle's Law Lab
          {isBoyleActive && (
            <motion.span layoutId="activeNavLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
          )}
        </span>
      </div>
      <button
        onClick={() => navigate('/login')}
        className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 text-white text-sm font-black shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
      >
        Get Started
      </button>
    </motion.nav>
  );
}
