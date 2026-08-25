import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  FiArrowRight, FiShield, FiBookOpen,
  FiCheckCircle, FiClipboard, FiPlayCircle,
  FiTarget, FiCalendar, FiActivity, FiAward
} from 'react-icons/fi';
import Background3D from '../components/shared/Background3D';
import { InteractiveDemo } from '../components/shared/InteractiveDemo';
import { FaqAccordion } from '../components/shared/FaqAccordion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useLanguage } from '../context/LanguageContext';

/* ─── Floating Orb Background Effect ────────────────────────── */
const Orb = ({ color, size, top, left, blur, delay }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none z-0"
    style={{
      width: size, height: size,
      top, left,
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      filter: `blur(${blur})`,
      opacity: 0.4,
    }}
    animate={{ y: [0, -25, 0], scale: [1, 1.05, 1] }}
    transition={{ duration: 7 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
  />
);

/* ─── Animated Counter Component ────────────────────────────── */
const Counter = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 25);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count}{suffix}</span>;
};

/* ─── Role Card ─────────────────────────────────────────────── */
const RoleCard = ({ role, icon: Icon, color, gradient, glow, features, delay }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{ perspective: 1000 }}
    >
      <motion.div
        animate={{ rotateY: hovered ? 4 : 0, rotateX: hovered ? -4 : 0, scale: hovered ? 1.03 : 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative p-7 rounded-3xl border flex flex-col gap-5 cursor-default h-full"
        style={{
          background: `radial-gradient(circle at top left, ${gradient[0]} 0%, #080911 60%)`,
          borderColor: gradient[1],
          boxShadow: hovered ? `0 0 50px ${glow}, 0 25px 50px rgba(0,0,0,0.7)` : `0 0 20px ${glow}44`,
        }}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${glow}20`, border: `1.5px solid ${glow}50`, boxShadow: `0 0 20px ${glow}40` }}>
            <Icon size={26} style={{ color }} />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">{role}</h3>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>{role} Portal</span>
          </div>
        </div>

        <ul className="flex flex-col gap-2.5">
          {features.map((f, i) => (
            <motion.li key={i} className="flex items-center gap-3 text-sm font-semibold text-gray-300">
              <FiCheckCircle size={15} style={{ color, flexShrink: 0 }} />
              {f}
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
};

/* ─── Main Landing Page ──────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const sections = ['hero', 'features', 'roles', 'stats'];
    const observerOptions = { root: null, rootMargin: '-30% 0px -50% 0px', threshold: 0.1 };
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id === 'hero' ? '' : entry.target.id);
        }
      });
    };
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const handleThemeChange = () => {
      setTheme(localStorage.getItem('theme') || 'dark');
    };
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  const isLight = theme === 'light';

  // 5 Sub-Hero Cards using 3D rendered icon assets matching reference image exactly
  const subHeroCards = [
    {
      title: t('landing.interactiveAnimations'),
      desc: t('landing.interactiveAnimationsDesc'),
      iconImg: "/assets/icons/icon_interactive_animations.png",
      glowColor: isLight ? "rgba(14, 165, 233, 0.2)" : "rgba(34, 211, 238, 0.4)",
      borderColor: isLight ? "border-sky-300/80" : "border-cyan-500/40"
    },
    {
      title: t('landing.smartExams'),
      desc: t('landing.smartExamsDesc'),
      iconImg: "/assets/icons/icon_smart_exams.png",
      glowColor: isLight ? "rgba(168, 85, 247, 0.2)" : "rgba(192, 132, 252, 0.4)",
      borderColor: isLight ? "border-purple-300/80" : "border-purple-500/40"
    },
    {
      title: t('landing.weaknessAnalysis'),
      desc: t('landing.weaknessAnalysisDesc'),
      iconImg: "/assets/icons/icon_weakness_analysis.png",
      glowColor: isLight ? "rgba(56, 189, 248, 0.2)" : "rgba(56, 189, 248, 0.4)",
      borderColor: isLight ? "border-sky-300/80" : "border-sky-500/40"
    },
    {
      title: t('landing.dedicatedRevision'),
      desc: t('landing.dedicatedRevisionDesc'),
      iconImg: "/assets/icons/icon_dedicated_revision.png",
      glowColor: isLight ? "rgba(168, 85, 247, 0.2)" : "rgba(168, 85, 247, 0.4)",
      borderColor: isLight ? "border-purple-300/80" : "border-purple-500/40"
    },
    {
      title: t('landing.studentChallenges'),
      desc: t('landing.studentChallengesDesc'),
      iconImg: "/assets/icons/icon_student_challenges.png",
      glowColor: isLight ? "rgba(99, 102, 241, 0.2)" : "rgba(129, 140, 248, 0.4)",
      borderColor: isLight ? "border-indigo-300/80" : "border-indigo-500/40"
    }
  ];

  return (
    <div className={`min-h-screen overflow-x-hidden font-sans relative transition-colors duration-300 ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#030614] text-gray-100'
    }`}>
      {!isLight && <Background3D roleColor="student" />}

      {/* ── NAVBAR ── */}
      <Navbar activeSection={activeSection} />

      {/* ── HERO SECTION ── */}
      <section id="hero" ref={heroRef} className={`relative pt-32 pb-16 px-6 md:px-12 overflow-hidden min-h-screen flex flex-col justify-center transition-colors duration-300 ${
        isLight ? 'bg-gradient-to-b from-slate-50 via-slate-100/80 to-slate-50' : 'bg-gradient-to-b from-[#030614] via-[#060c24] to-[#030614]'
      }`}>

        {/* Ambient Glowing Background Orbs */}
        <Orb color={isLight ? "rgba(56,189,248,0.25)" : "rgba(34,211,238,0.45)"} size="550px" top="5%" left="-15%" blur="140px" delay={0} />
        <Orb color={isLight ? "rgba(192,132,252,0.25)" : "rgba(147,51,234,0.45)"} size="500px" top="15%" left="65%" blur="150px" delay={1.5} />
        <Orb color={isLight ? "rgba(99,102,241,0.2)" : "rgba(59,130,246,0.4)"} size="400px" top="55%" left="30%" blur="120px" delay={3} />

        {/* Subtle Background Grid Line Overlay */}
        <div className={`absolute inset-0 pointer-events-none ${isLight ? 'opacity-[0.03]' : 'opacity-[0.04]'}`} style={{ backgroundImage: `linear-gradient(${isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.4)'} 1px, transparent 1px), linear-gradient(90deg, ${isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.4)'} 1px, transparent 1px)`, backgroundSize: '70px 70px' }} />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* LEFT COLUMN (In RTL): HERO TRANSPARENT TEACHER & AI BOT COMPOSITION */}
          <div className="lg:col-span-6 relative flex items-center justify-center order-2 lg:order-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative w-full max-w-[580px] flex items-center justify-center"
            >
              {/* Chemistry Teacher & Full AI Smart Widgets Composition */}
              <div className={`relative w-full flex items-center justify-center p-3 md:p-6 rounded-[2.5rem] transition-all duration-500 ${
                isLight 
                  ? 'bg-gradient-to-b from-[#090d2a]/95 via-[#05081c]/95 to-[#030412]/95 border border-cyan-500/30 shadow-[0_25px_60px_-15px_rgba(14,165,233,0.25)]' 
                  : 'bg-transparent'
              }`}>
                {/* Ambient Soft Glow Behind Teacher */}
                <div className={`absolute inset-0 blur-3xl rounded-[2.5rem] pointer-events-none ${
                  isLight ? 'bg-gradient-to-tr from-cyan-500/30 via-blue-500/20 to-purple-500/20 opacity-90' : 'bg-gradient-to-tr from-cyan-500/25 via-blue-500/20 to-purple-500/20 opacity-70'
                }`} />
                
                <img
                  src="/images/hero_teacher_chemistry_transparent.png"
                  alt="FullMark Chemistry Teacher & AI Assistant"
                  className="w-full h-auto object-contain pointer-events-none relative z-10 drop-shadow-[0_0_50px_rgba(34,211,238,0.35)]"
                />
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN (In RTL): HEADLINE, DESCRIPTION & CTAs */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-start gap-6 order-1 lg:order-1">

            {/* Smart Platform Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`inline-flex items-center gap-2 px-4.5 py-2 rounded-full border text-xs font-black tracking-wide ${
                isLight ? 'border-sky-300 bg-sky-100/80 text-sky-800' : 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
              {t('landing.heroBadge')}
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className={`text-4xl sm:text-6xl lg:text-7xl font-black leading-tight tracking-tight ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              {t('landing.heroHeadline1')}
              <span className={isLight ? 'text-slate-900' : 'text-white'}>{t('landing.heroHeadlineBold')}</span>
              {t('landing.heroHeadlineIn')}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(34,211,238,0.4)]">
                {t('landing.heroHeadlineChem')}
              </span>
              {t('landing.heroHeadlineEnd')}
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className={`text-base sm:text-lg font-semibold max-w-xl leading-relaxed ${
                isLight ? 'text-slate-600' : 'text-gray-400'
              }`}
            >
              {t('landing.heroDesc')}
            </motion.p>

            {/* Call To Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 mt-2 w-full sm:w-auto"
            >
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-base shadow-[0_0_35px_rgba(79,70,229,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{t('landing.startNow')}</span>
                <FiArrowRight size={18} className={isRTL ? "rotate-180" : ""} />
              </button>

              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className={`w-full sm:w-auto px-7 py-4 rounded-2xl border font-extrabold text-base transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  isLight
                    ? 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100'
                    : 'border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300'
                }`}
              >
                <span>{t('hero.exploreCourses')}</span>
              </button>
            </motion.div>

          </div>

        </motion.div>

        {/* ── SUB-HERO 5 FEATURE CARDS BAR (Matching Reference Image) ── */}
        <div className={`w-full max-w-[1400px] mx-auto mt-16 pt-8 border-t relative z-10 ${
          isLight ? 'border-slate-200' : 'border-gray-800/60'
        }`}>
          
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]" />
            <h3 className={`text-lg md:text-xl font-black tracking-wide text-center ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              {t('landing.everythingTitle')}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4.5">
            {subHeroCards.map((card, idx) => {
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.08 * idx }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className={`p-5 rounded-2xl border-2 ${card.borderColor} ${
                    isLight
                      ? 'bg-white/90 backdrop-blur-2xl shadow-xl text-slate-900'
                      : 'bg-[#060a1d]/90 backdrop-blur-2xl text-white'
                  } flex flex-col justify-between items-center text-center gap-3 relative overflow-hidden group transition-all duration-300 min-h-[220px]`}
                  style={{ boxShadow: `0 8px 30px ${card.glowColor}` }}
                >
                  {/* Top Left Play Icon Badge matching reference screenshot */}
                  <div className="flex items-center justify-start w-full">
                    <div className={`w-8 h-8 rounded-full border-2 border-cyan-400 flex items-center justify-center text-cyan-500 shadow-[0_0_12px_#22d3ee] group-hover:bg-cyan-400 group-hover:text-black transition-all ${
                      isLight ? 'bg-sky-50' : 'bg-[#08102b]'
                    }`}>
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current ml-0.5">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* Center High-Resolution 3D Rendered Graphic */}
                  <div className="relative w-24 h-24 flex items-center justify-center my-1 group-hover:scale-110 transition-transform duration-300">
                    <div className="absolute inset-0 blur-2xl rounded-full opacity-60 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: card.glowColor }} />
                    <img 
                      src={card.iconImg} 
                      alt={card.title} 
                      className="w-22 h-22 object-contain relative z-10 filter drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]" 
                    />
                  </div>

                  {/* Text Content */}
                  <div className="text-center flex flex-col gap-1">
                    <h4 className={`text-base font-black group-hover:text-cyan-500 transition-colors ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}>
                      {card.title}
                    </h4>
                    <p className={`text-xs font-semibold leading-snug ${
                      isLight ? 'text-slate-600' : 'text-gray-400'
                    }`}>
                      {card.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>

      </section>

      {/* Footer */}
      <Footer />

    </div>
  );
}
