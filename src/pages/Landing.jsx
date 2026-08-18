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

  // 5 Sub-Hero Cards matching the reference design
  const subHeroCards = [
    {
      title: "Interactive Animations",
      desc: "Watch concepts move right in front of your eyes",
      icon: FiActivity,
      gradient: "from-cyan-500/20 to-blue-600/20",
      borderColor: "border-cyan-500/40",
      glowColor: "rgba(34, 211, 238, 0.3)"
    },
    {
      title: "Smart Exams",
      desc: "Train & adapt according to your target level",
      icon: FiClipboard,
      gradient: "from-blue-600/20 to-indigo-600/20",
      borderColor: "border-blue-500/40",
      glowColor: "rgba(59, 130, 246, 0.3)"
    },
    {
      title: "Weakness Analysis",
      desc: "Discover exactly what needs strengthening",
      icon: FiTarget,
      gradient: "from-purple-600/20 to-pink-600/20",
      borderColor: "border-purple-500/40",
      glowColor: "rgba(168, 85, 247, 0.3)"
    },
    {
      title: "Personalized Review",
      desc: "Retain your knowledge at optimal schedules",
      icon: FiCalendar,
      gradient: "from-indigo-600/20 to-blue-500/20",
      borderColor: "border-indigo-500/40",
      glowColor: "rgba(99, 102, 241, 0.3)"
    },
    {
      title: "Student Challenges",
      desc: "Compete and learn in a fun interactive way",
      icon: FiAward,
      gradient: "from-fuchsia-600/20 to-purple-600/20",
      borderColor: "border-fuchsia-500/40",
      glowColor: "rgba(217, 70, 239, 0.3)"
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
    <div className="min-h-screen bg-[#06070d] text-gray-100 overflow-x-hidden font-sans relative">
      <Background3D roleColor="student" />

      {/* ── NAVBAR ── */}
      <Navbar activeSection={activeSection} />

      {/* ── HERO SECTION ── */}
      <section id="hero" ref={heroRef} className="relative pt-32 pb-16 px-6 md:px-12 overflow-hidden min-h-screen flex flex-col justify-center">

        {/* Ambient Glowing Background Orbs */}
        <Orb color="rgba(34,211,238,0.4)" size="550px" top="5%" left="-15%" blur="140px" delay={0} />
        <Orb color="rgba(147,51,234,0.45)" size="500px" top="15%" left="65%" blur="150px" delay={1.5} />
        <Orb color="rgba(59,130,246,0.35)" size="400px" top="55%" left="30%" blur="120px" delay={3} />

        {/* Subtle Background Grid Line Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '70px 70px' }} />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* LEFT COLUMN: HERO TRANSPARENT TEACHER & AI BOT COMPOSITION */}
          <div className="lg:col-span-6 relative flex items-center justify-center order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative w-full max-w-[580px] flex items-center justify-center"
            >
              {/* 100% Transparent Background Composition Image (No floating HTML badges) */}
              <img
                src="/images/hero_teacher_chemistry_transparent.png"
                alt="FullMark Chemistry Teacher & AI Assistant"
                className="w-full h-auto object-contain drop-shadow-[0_0_60px_rgba(34,211,238,0.25)] pointer-events-none"
              />
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

        {/* ── SUB-HERO 5 FEATURE CARDS BAR (Matching Navbar Width) ── */}
        <div className="w-full max-w-[1400px] mx-auto mt-16 pt-8 border-t border-gray-800/60 relative z-10">
          
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <h3 className="text-base md:text-lg font-black text-white tracking-wide text-center">
              Everything You Need to Excel in Chemistry <span className="text-cyan-400">•</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {subHeroCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * idx }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className={`p-5 rounded-3xl border ${card.borderColor} bg-gradient-to-b ${card.gradient} bg-[#0a0c18]/90 backdrop-blur-xl flex flex-col justify-between gap-4 relative overflow-hidden group shadow-lg`}
                  style={{ boxShadow: `0 10px 30px ${card.glowColor}` }}
                >
                  {/* Top Left Play Icon Badge matching reference image */}
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white group-hover:bg-cyan-400 group-hover:text-black transition-all">
                      <FiPlayCircle size={18} />
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-300">
                      <Icon size={20} />
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="text-left flex flex-col gap-1">
                    <h4 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors">
                      {card.title}
                    </h4>
                    <p className="text-xs font-semibold text-gray-400 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>

      </section>

      {/* ── LIVE INTERACTIVE SIMULATOR SECTION (Matching Navbar Width) ── */}
      <section className="relative py-16 px-6 md:px-12">
        <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center flex flex-col gap-3"
          >
            <span className="text-xs font-black uppercase tracking-widest text-cyan-400">Live Simulator</span>
            <h2 className="text-3xl md:text-5xl font-black text-white">Experience the Platform Interface</h2>
            <p className="text-gray-400 font-semibold max-w-xl mx-auto">Interact with our live simulated portals for Admin, Teacher, and Student roles.</p>
          </motion.div>
          <InteractiveDemo />
        </div>
      </section>

      {/* ── PLATFORM STATS SECTION (Matching Navbar Width) ── */}
      <section id="stats" className="relative py-20 px-6 md:px-12">
        <div className="w-full max-w-[1400px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { val: 1200, suffix: '+', label: 'Active Students', color: '#22d3ee', glow: '#06b6d4' },
              { val: 85, suffix: '+', label: 'Expert Teachers', color: '#60a5fa', glow: '#3b82f6' },
              { val: 3500, suffix: '+', label: 'Questions in Bank', color: '#c084fc', glow: '#a855f7' },
              { val: 98, suffix: '%', label: 'Success Rate', color: '#34d399', glow: '#10b981' },
            ].map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative p-6 rounded-3xl text-center overflow-hidden"
                style={{ background: `radial-gradient(circle at top, ${s.glow}20 0%, #0a0c18 60%)`, border: `1px solid ${s.glow}35`, boxShadow: `0 0 30px ${s.glow}20` }}
              >
                <div className="text-3xl md:text-4xl font-black mb-1" style={{ color: s.color }}>
                  <Counter target={s.val} suffix={s.suffix} />
                </div>
                <div className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PORTAL ROLES SECTION (Matching Navbar Width) ── */}
      <section id="roles" className="relative py-20 px-6 md:px-12">
        <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="text-center flex flex-col gap-3">
            <span className="text-xs font-black uppercase tracking-widest text-purple-400">Three Tailored Portals</span>
            <h2 className="text-3xl md:text-5xl font-black text-white">One Complete Ecosystem</h2>
            <p className="text-gray-400 font-semibold max-w-xl mx-auto">Every role gets dedicated tools designed specifically for their goals.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((r) => <RoleCard key={r.role} {...r} />)}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER (Matching Navbar Width) ── */}
      <section className="py-20 px-6 md:px-12 relative z-10">
        <div className="w-full max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-[2.5rem] p-10 md:p-14 text-center overflow-hidden bg-gradient-to-br from-blue-950/60 via-[#0a0c18] to-purple-950/60 border border-cyan-500/30 shadow-[0_0_80px_rgba(34,211,238,0.15)]"
          >
            <div className="relative z-10 flex flex-col items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center font-black text-white text-2xl shadow-[0_0_30px_rgba(34,211,238,0.5)]">FM</div>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">Ready to Achieve Full Marks<br />in Chemistry & Beyond?</h2>
              <p className="text-gray-400 font-semibold max-w-md">Join FullMark today and experience AI-driven weakness tracking assessment.</p>
              <button
                onClick={() => navigate('/register')}
                className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-base shadow-[0_0_40px_rgba(79,70,229,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span>Get Started Now</span>
                <FiArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ SECTION (Matching Navbar Width) ── */}
      <section className="py-20 px-6 md:px-12 relative">
        <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center flex flex-col gap-3"
          >
            <span className="text-xs font-black uppercase tracking-widest text-cyan-400">Questions & Answers</span>
            <h2 className="text-3xl md:text-5xl font-black text-white">Frequently Asked Questions</h2>
            <p className="text-gray-400 font-semibold max-w-xl mx-auto">Everything you need to know about FullMark platform features.</p>
          </motion.div>
          <FaqAccordion />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
}
