import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  FiArrowRight, FiShield, FiBookOpen, FiUsers,
  FiCheckCircle, FiZap, FiBarChart2, FiAward,
  FiFileText, FiHelpCircle, FiStar, FiChevronDown,
  FiUploadCloud, FiClipboard, FiGrid,
  FiGithub, FiTwitter, FiLinkedin, FiYoutube, FiSend
} from 'react-icons/fi';
import Background3D from '../components/shared/Background3D';
import { InteractiveDemo } from '../components/shared/InteractiveDemo';
import { FaqAccordion } from '../components/shared/FaqAccordion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

/* ─── Floating Orb ─────────────────────────────────────────── */
const Orb = ({ color, size, top, left, blur, delay }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      width: size, height: size,
      top, left,
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      filter: `blur(${blur})`,
      opacity: 0.35,
    }}
    animate={{ y: [0, -30, 0], scale: [1, 1.08, 1] }}
    transition={{ duration: 7 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
  />
);

/* ─── Animated Counter ─────────────────────────────────────── */
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
          boxShadow: hovered ? `0 0 50px ${glow}, 0 25px 50px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)` : `0 0 20px ${glow}55, 0 20px 40px rgba(0,0,0,0.6)`,
        }}
      >
        {/* Glow accent top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px" style={{ background: `linear-gradient(90deg, transparent, ${gradient[1]}, transparent)` }} />

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
            <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: delay + i * 0.07 }}
              className="flex items-center gap-3 text-sm font-semibold text-gray-300">
              <FiCheckCircle size={15} style={{ color, flexShrink: 0 }} />
              {f}
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
};

/* ─── Feature Tile ──────────────────────────────────────────── */
const FeatureTile = ({ icon: Icon, title, desc, color, glow, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -4 }}
    className="p-5 rounded-2xl border border-gray-800/80 bg-[#0e101a]/80 flex flex-col gap-3 group"
  >
    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${glow}15`, border: `1.5px solid ${glow}30` }}>
      <Icon size={20} style={{ color }} />
    </div>
    <h4 className="text-sm font-black text-white">{title}</h4>
    <p className="text-xs text-gray-500 font-semibold leading-relaxed">{desc}</p>
  </motion.div>
);

/* ─── Main Landing ──────────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const [activeSection, setActiveSection] = useState('');

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveSection('');
  };

  useEffect(() => {
    const sections = ['hero', 'features', 'roles', 'stats'];
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -50% 0px',
      threshold: 0.1
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target.id === 'hero') {
            setActiveSection('');
          } else {
            setActiveSection(entry.target.id);
          }
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

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 350);
    }
  }, []);

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
      features: ['Attempt scheduled exams', 'View scores & feedback', 'Study material access', 'Progress dashboard', 'Result history'],
    },
  ];

  const features = [
    { icon: FiZap, title: 'AI Question Parsing', desc: 'Upload any PDF and let AI extract questions automatically.', color: '#facc15', glow: '#eab308', delay: 0 },
    { icon: FiClipboard, title: 'Exam Scheduling', desc: 'Schedule, manage and auto-grade assessments in seconds.', color: '#60a5fa', glow: '#3b82f6', delay: 0.05 },
    { icon: FiBarChart2, title: 'Deep Analytics', desc: 'Real-time platform reports for admins and teachers.', color: '#a78bfa', glow: '#8b5cf6', delay: 0.1 },
    { icon: FiHelpCircle, title: 'MCQ Engine', desc: 'Build rich question banks with multiple choice & difficulty levels.', color: '#34d399', glow: '#10b981', delay: 0.15 },
    { icon: FiUploadCloud, title: 'PDF Import', desc: 'Seamlessly import curriculum content from PDF documents.', color: '#f87171', glow: '#ef4444', delay: 0.2 },
    { icon: FiGrid, title: 'Multi-Role System', desc: 'Admin, Teacher & Student portals — one unified platform.', color: '#fb923c', glow: '#f97316', delay: 0.25 },
  ];

  return (
    <div className="min-h-screen bg-[#080911] text-gray-100 overflow-x-hidden font-sans relative">
      <Background3D roleColor="admin" />

      {/* ── NAVBAR ── */}
      <Navbar activeSection={activeSection} />

      {/* ── HERO ── */}
      <section id="hero" ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 overflow-hidden">

        {/* Background orbs */}
        <Orb color="rgba(239,68,68,0.6)" size="500px" top="10%" left="-10%" blur="120px" delay={0} />
        <Orb color="rgba(59,130,246,0.6)" size="450px" top="20%" left="70%" blur="130px" delay={1.5} />
        <Orb color="rgba(168,85,247,0.4)" size="350px" top="60%" left="40%" blur="100px" delay={3} />
        <Orb color="rgba(16,185,129,0.35)" size="300px" top="70%" left="10%" blur="90px" delay={2} />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-center lg:text-left px-4">

          {/* LEFT: TEXT CONTENT */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start gap-6">

            {/* Badge */}
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 bg-red-500/5 text-red-400 text-xs font-black uppercase tracking-widest self-center lg:self-start">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Next-Gen Assessment Platform
            </motion.div>

            {/* Headline */}
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl sm:text-7xl lg:text-8xl font-black leading-none tracking-tight">
              <span className="text-white">Full</span>
              <span className="color-flow-text">Mark</span>
              <br />
              <span className="text-3xl sm:text-4xl lg:text-5xl text-gray-400 font-bold mt-2 block">
                Smart Education Platform
              </span>
            </motion.h1>

            {/* Sub */}
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
              className="text-base md:text-lg text-gray-400 font-semibold max-w-xl leading-relaxed">
              Empower admins, teachers & students with a unified portal. Create exams, manage questions, track performance — all in one place.
            </motion.p>

            {/* CTAs */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 mt-2 w-full sm:w-auto justify-center lg:justify-start">
              <button
                onClick={() => navigate('/login')}
                className="group flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 text-white font-black text-sm shadow-[0_0_40px_rgba(239,68,68,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                Launch Platform
                <FiArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => document.getElementById('roles').scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-gray-700 text-gray-300 font-black text-sm hover:border-gray-500 hover:text-white transition-all cursor-pointer"
              >
                Explore Portals
              </button>
            </motion.div>
          </div>

          {/* RIGHT: 3D PREVIEW GRAPHICS */}
          <div className="lg:col-span-5 relative w-full h-[450px] flex items-center justify-center mt-8 lg:mt-0">
            {/* 3D Perspective Wrapper */}
            <div className="w-full max-w-[400px] h-[340px] relative" style={{ perspective: 1200 }}>
              <motion.div
                initial={{ transform: 'rotateY(-25deg) rotateX(15deg) translateZ(0px)', opacity: 0 }}
                animate={{ transform: 'rotateY(-15deg) rotateX(10deg) translateZ(0px)', opacity: 1 }}
                transition={{ duration: 1 }}
                className="w-full h-full rounded-3xl border border-red-500/20 bg-gradient-to-br from-gray-950 via-[#0e101a] to-gray-950 p-5 shadow-[0_30px_70px_rgba(0,0,0,0.8),0_0_50px_rgba(239,68,68,0.1)] relative"
              >
                {/* Accent lines/corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-500/40 rounded-tl-3xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-blue-500/40 rounded-br-3xl" />

                {/* Title Bar mock */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-800/60 mb-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500/60" />
                    <span className="w-2 h-2 rounded-full bg-yellow-500/60" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500/60" />
                  </div>
                  <span className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Dashboard V1.0</span>
                </div>

                {/* Dashboard mock graphs */}
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center bg-gray-900/50 p-3 rounded-2xl border border-gray-800/40">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                        <FiBookOpen size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Recent Quiz</p>
                        <p className="text-xs font-black text-white">Mathematics Midterm</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">Active</span>
                  </div>

                  <div className="bg-gray-900/50 p-3 rounded-2xl border border-gray-800/40 flex flex-col gap-2">
                    <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                      <span>AVERAGE STUDENT SCORE</span>
                      <span className="text-emerald-400">88.4%</span>
                    </div>
                    {/* Glowing progress bar */}
                    <div className="h-2 w-full bg-gray-950 rounded-full overflow-hidden p-0.5 border border-gray-900">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '88%' }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="h-full rounded-full bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-900/30 p-2.5 rounded-xl border border-gray-850 flex flex-col">
                      <span className="text-[8px] text-gray-500 font-bold uppercase">Evaluated</span>
                      <span className="text-sm font-black text-white">412 Students</span>
                    </div>
                    <div className="bg-gray-900/30 p-2.5 rounded-xl border border-gray-850 flex flex-col">
                      <span className="text-[8px] text-gray-500 font-bold uppercase">Accuracy</span>
                      <span className="text-sm font-black text-emerald-400">99.2% AI</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Orbiting elements */}
              {/* Floating Card 1: AI Parser */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-6 p-3 rounded-2xl bg-[#090911]/90 border border-emerald-500/30 shadow-[0_15px_30px_rgba(0,0,0,0.6),0_0_20px_rgba(16,185,129,0.15)] flex items-center gap-2 z-25 max-w-[170px]"
              >
                <div className="w-5 h-5 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <FiCheckCircle size={12} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] text-gray-500 font-bold uppercase">AI Parsing</span>
                  <span className="text-[10px] font-black text-white">PDF Imported!</span>
                </div>
              </motion.div>

              {/* Floating Card 2: Exams count */}
              <motion.div
                animate={{ y: [0, 14, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-8 -left-6 p-3 rounded-2xl bg-[#090911]/90 border border-blue-500/30 shadow-[0_15px_30px_rgba(0,0,0,0.6),0_0_20px_rgba(59,130,246,0.15)] flex items-center gap-2.5 z-25"
              >
                <div className="w-5 h-5 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <FiStar size={12} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] text-gray-500 font-bold uppercase">Active Portals</span>
                  <span className="text-[10px] font-black text-white">Admin + Teacher</span>
                </div>
              </motion.div>

              {/* Floating Badge 3: A+ Grade */}
              <motion.div
                animate={{ y: [0, -10, 0], x: [0, 8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-1/2 -left-12 p-2.5 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-black text-xs shadow-[0_10px_25px_rgba(168,85,247,0.4)] flex items-center justify-center w-10 h-10 border border-purple-400/30 z-20"
              >
                A+
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── INTERACTIVE PLAYGROUND ── */}
      <section className="relative py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col gap-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center flex flex-col gap-3"
          >
            <span className="text-xs font-black uppercase tracking-widest text-red-400">Live Simulator</span>
            <h2 className="text-3xl md:text-5xl font-black text-white">Experience the Interface</h2>
            <p className="text-gray-500 font-semibold max-w-xl mx-auto">Click the views below to interact with our simulated portal dashboards in real-time.</p>
          </motion.div>
          <InteractiveDemo />
        </div>
      </section>

      {/* ── STATS ── */}
      <section id="stats" className="relative py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { val: 500, suffix: '+', label: 'Students', color: '#34d399', glow: '#10b981' },
              { val: 50, suffix: '+', label: 'Teachers', color: '#60a5fa', glow: '#3b82f6' },
              { val: 1000, suffix: '+', label: 'Questions', color: '#facc15', glow: '#eab308' },
              { val: 200, suffix: '+', label: 'Exams Created', color: '#f87171', glow: '#ef4444' },
            ].map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative p-6 rounded-3xl text-center overflow-hidden"
                style={{ background: `radial-gradient(circle at top, ${s.glow}15 0%, #0e101a 60%)`, border: `1px solid ${s.glow}25`, boxShadow: `0 0 30px ${s.glow}15` }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-20" style={{ background: `linear-gradient(90deg,transparent,${s.glow},transparent)` }} />
                <div className="text-3xl md:text-4xl font-black mb-1" style={{ color: s.color }}>
                  <Counter target={s.val} suffix={s.suffix} />
                </div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLE CARDS ── */}
      <section id="roles" className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto flex flex-col gap-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="text-center flex flex-col gap-3">
            <span className="text-xs font-black uppercase tracking-widest text-red-400">Three Portals</span>
            <h2 className="text-3xl md:text-5xl font-black text-white">One Unified Platform</h2>
            <p className="text-gray-500 font-semibold max-w-xl mx-auto">Every role gets a tailor-made experience with the tools they need.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((r) => <RoleCard key={r.role} {...r} />)}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="relative py-20 px-6">
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="max-w-6xl mx-auto flex flex-col gap-12 relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="text-center flex flex-col gap-3">
            <span className="text-xs font-black uppercase tracking-widest text-blue-400">Platform Features</span>
            <h2 className="text-3xl md:text-5xl font-black text-white">Everything You Need</h2>
            <p className="text-gray-500 font-semibold max-w-xl mx-auto">Built for modern education — powerful tools, beautiful design.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => <FeatureTile key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col gap-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="text-center flex flex-col gap-3">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400">How It Works</span>
            <h2 className="text-3xl md:text-5xl font-black text-white">Get Started in Minutes</h2>
          </motion.div>
          <div className="flex flex-col gap-4">
            {[
              { step: '01', title: 'Admin sets up the platform', desc: 'Create subjects, assign teachers, and onboard students in the admin panel.', color: '#f87171' },
              { step: '02', title: 'Teachers build question banks', desc: 'Add MCQ questions manually or upload PDFs for AI-based extraction.', color: '#60a5fa' },
              { step: '03', title: 'Exams are scheduled', desc: 'Schedule assessments with duration, date, and question count control.', color: '#a78bfa' },
              { step: '04', title: 'Students attempt & get results', desc: 'Students take exams and instantly receive scores and detailed feedback.', color: '#34d399' },
            ].map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex items-start gap-5 p-6 rounded-3xl border border-gray-800/60 bg-[#0e101a]/60"
              >
                <div className="text-2xl font-black shrink-0" style={{ color: s.color, textShadow: `0 0 20px ${s.color}80` }}>{s.step}</div>
                <div>
                  <h4 className="text-base font-black text-white mb-1">{s.title}</h4>
                  <p className="text-sm text-gray-500 font-semibold">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-[2.5rem] p-10 md:p-14 text-center overflow-hidden"
            style={{ background: 'radial-gradient(circle at 50% 0%, rgba(239,68,68,0.2) 0%, #0c0d19 60%)', border: '1px solid rgba(239,68,68,0.3)', boxShadow: '0 0 80px rgba(239,68,68,0.15)' }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent" />
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-red-600/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-blue-600/10 blur-3xl" />
            <div className="relative z-10 flex flex-col items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-rose-500 flex items-center justify-center font-black text-white text-2xl shadow-[0_0_30px_rgba(239,68,68,0.6)]">FM</div>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">Ready to Transform<br />Your Classroom?</h2>
              <p className="text-gray-400 font-semibold max-w-md">Join FullMark today and experience the future of digital assessments.</p>
              <button
                onClick={() => navigate('/login')}
                className="group flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 text-white font-black text-sm shadow-[0_0_40px_rgba(239,68,68,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                Start Now — It's Free
                <FiArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section className="py-20 px-6 relative">
        <div className="max-w-4xl mx-auto flex flex-col gap-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center flex flex-col gap-3"
          >
            <span className="text-xs font-black uppercase tracking-widest text-purple-400">Questions & Answers</span>
            <h2 className="text-3xl md:text-5xl font-black text-white font-sans">Frequently Asked Questions</h2>
            <p className="text-gray-500 font-semibold max-w-xl mx-auto">Everything you need to know about FullMark platform features.</p>
          </motion.div>
          <FaqAccordion />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
}
