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

  // 5 Sub-Hero Cards using 3D rendered icon assets matching reference image exactly
  const subHeroCards = [
    {
      titleAr: "أنيميشن تفاعلي",
      titleEn: "Interactive Animations",
      descAr: "شاهد المفاهيم تتحرك أمامك",
      descEn: "Watch concepts move in front of you",
      iconImg: "/assets/icons/icon_interactive_animations.png",
      glowColor: "rgba(34, 211, 238, 0.4)",
      borderColor: "border-cyan-500/40"
    },
    {
      titleAr: "امتحانات ذكية",
      titleEn: "Smart Exams",
      descAr: "تدرّب حسب مستواك",
      descEn: "Train according to your level",
      iconImg: "/assets/icons/icon_smart_exams.png",
      glowColor: "rgba(192, 132, 252, 0.4)",
      borderColor: "border-purple-500/40"
    },
    {
      titleAr: "تحليل نقاط الضعف",
      titleEn: "Weakness Analysis",
      descAr: "اعرف ما يحتاج إلى تقوية",
      descEn: "Know what needs strengthening",
      iconImg: "/assets/icons/icon_weakness_analysis.png",
      glowColor: "rgba(56, 189, 248, 0.4)",
      borderColor: "border-sky-500/40"
    },
    {
      titleAr: "مراجعة مخصصة",
      titleEn: "Dedicated Revision",
      descAr: "ثبّت معلوماتك في الوقت المناسب",
      descEn: "Consolidate knowledge at right time",
      iconImg: "/assets/icons/icon_dedicated_revision.png",
      glowColor: "rgba(168, 85, 247, 0.4)",
      borderColor: "border-purple-500/40"
    },
    {
      titleAr: "تحديات الطلاب",
      titleEn: "Student Challenges",
      descAr: "نافس وتعلّم بطريقة ممتعة",
      descEn: "Compete & learn in a fun way",
      iconImg: "/assets/icons/icon_student_challenges.png",
      glowColor: "rgba(129, 140, 248, 0.4)",
      borderColor: "border-indigo-500/40"
    }
  ];

  const roles = [
    {
      role: 'Admin', icon: FiShield, color: '#f87171', gradient: ['rgba(239,68,68,0.15)', 'rgba(239,68,68,0.3)'],
      glow: '#ef4444', delay: 0,
      features: ['Manage teachers & students', 'Create & assign subjects', 'Platform-wide analytics', 'User role control', 'System configuration'],
    },
    {
      role: 'Teacher', icon: FiBookOpen, color: '#60a5fa', gradient: ['rgba(59,130,246,0.15)', 'rgba(59,130,246,0.3)'],
      glow: '#3b82f6', delay: 0.1,
      features: ['Question bank management', 'Schedule exams & assessments', 'Upload PDF for AI parsing', 'Subject-wise reporting', 'Student performance tracking'],
    },
    {
      role: 'Student', icon: FiAward, color: '#34d399', gradient: ['rgba(16,185,129,0.15)', 'rgba(16,185,129,0.3)'],
      glow: '#10b981', delay: 0.2,
      features: ['Attempt scheduled exams', 'View scores & feedback', 'Weakness tracker & SRS', 'Progress dashboard', 'Result history'],
    },
  ];

  return (
    <div className="min-h-screen bg-[#030614] text-gray-100 overflow-x-hidden font-sans relative">
      <Background3D roleColor="student" />

      {/* ── NAVBAR ── */}
      <Navbar activeSection={activeSection} />

      {/* ── HERO SECTION ── */}
      <section id="hero" ref={heroRef} className="relative pt-32 pb-16 px-6 md:px-12 overflow-hidden min-h-screen flex flex-col justify-center bg-gradient-to-b from-[#030614] via-[#060c24] to-[#030614]">

        {/* Ambient Glowing Background Orbs */}
        <Orb color="rgba(34,211,238,0.45)" size="550px" top="5%" left="-15%" blur="140px" delay={0} />
        <Orb color="rgba(147,51,234,0.45)" size="500px" top="15%" left="65%" blur="150px" delay={1.5} />
        <Orb color="rgba(59,130,246,0.4)" size="400px" top="55%" left="30%" blur="120px" delay={3} />

        {/* Subtle Background Grid Line Overlay */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '70px 70px' }} />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* LEFT COLUMN: HERO TRANSPARENT TEACHER & AI BOT COMPOSITION */}
          <div className="lg:col-span-6 relative flex items-center justify-center order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative w-full max-w-[580px] flex items-center justify-center"
            >
              {/* Chemistry Teacher & Full AI Smart Widgets Composition */}
              <div className="relative w-full flex items-center justify-center">
                {/* Ambient Soft Glow Behind Teacher */}
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/25 via-blue-500/20 to-purple-500/20 blur-3xl rounded-full opacity-70 pointer-events-none" />
                
                <img
                  src="/images/hero_teacher_chemistry_transparent.png"
                  alt="FullMark Chemistry Teacher & AI Assistant"
                  className="w-full h-auto object-contain pointer-events-none relative z-10 drop-shadow-[0_0_50px_rgba(34,211,238,0.35)]"
                />
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: HEADLINE, DESCRIPTION & CTAs */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left gap-6 order-1 lg:order-2">

            {/* Smart Platform Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4.5 py-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 text-xs font-black tracking-wide"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
              Smart Chemistry Platform for Tawjihi & High School Students
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-black leading-tight tracking-tight text-white"
            >
              Your Path to <span className="text-white">Full Marks</span> in <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(34,211,238,0.4)]">Chemistry</span> Starts Here
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-base sm:text-lg text-gray-400 font-semibold max-w-xl leading-relaxed"
            >
              Learn Chemistry with expert teachers through organized courses and AI-powered smart exams that reveal your exact weakness points and turn every mistake into real progress.
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
                <span>Start Now</span>
                <FiArrowRight size={18} />
              </button>

              <button
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-extrabold text-base transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Explore Chemistry Courses</span>
              </button>
            </motion.div>

          </div>

        </motion.div>

        {/* ── SUB-HERO 5 FEATURE CARDS BAR (Matching Reference Image) ── */}
        <div className="w-full max-w-[1400px] mx-auto mt-16 pt-8 border-t border-gray-800/60 relative z-10">
          
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]" />
            <h3 className="text-lg md:text-xl font-black text-white tracking-wide text-center">
              Everything You Need to Excel in Chemistry
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
                  className={`p-5 rounded-2xl border-2 ${card.borderColor} bg-[#060a1d]/90 backdrop-blur-2xl flex flex-col justify-between items-center text-center gap-3 relative overflow-hidden group transition-all duration-300 min-h-[220px]`}
                  style={{ boxShadow: `0 8px 30px ${card.glowColor}` }}
                >
                  {/* Top Left Play Icon Badge matching reference screenshot */}
                  <div className="flex items-center justify-start w-full">
                    <div className="w-8 h-8 rounded-full bg-[#08102b] border-2 border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_#22d3ee] group-hover:bg-cyan-400 group-hover:text-black transition-all">
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
                      alt={card.titleEn} 
                      className="w-22 h-22 object-contain relative z-10 filter drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]" 
                    />
                  </div>

                  {/* Text Content */}
                  <div className="text-center flex flex-col gap-1">
                    <h4 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors">
                      {card.titleEn}
                    </h4>
                    <p className="text-xs font-semibold text-gray-400 leading-snug">
                      {card.descEn}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>

      </section>

    </div>
  );
}
