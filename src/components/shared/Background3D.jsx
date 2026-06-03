import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const Background3D = ({ roleColor }) => {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const starCount = 65;
    const generatedStars = Array.from({ length: starCount }).map((_, i) => ({
      id: i,
      size: Math.random() * 2 + 1,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 5,
    }));
    setStars(generatedStars);
  }, []);

  const getBlobColors = () => {
    switch (roleColor) {
      case 'student':
        return {
          blob1: 'bg-emerald-500/10 shadow-[0_0_120px_rgba(16,185,129,0.25)]',
          blob2: 'bg-teal-500/10 shadow-[0_0_120px_rgba(20,184,166,0.25)]',
        };
      case 'teacher':
        return {
          blob1: 'bg-blue-500/10 shadow-[0_0_120px_rgba(59,130,246,0.25)]',
          blob2: 'bg-indigo-500/10 shadow-[0_0_120px_rgba(99,102,241,0.25)]',
        };
      case 'admin':
        return {
          blob1: 'bg-red-500/10 shadow-[0_0_120px_rgba(239,68,68,0.25)]',
          blob2: 'bg-pink-500/10 shadow-[0_0_120px_rgba(244,63,94,0.25)]',
        };
      case 'parent':
        return {
          blob1: 'bg-purple-500/10 shadow-[0_0_120px_rgba(168,85,247,0.25)]',
          blob2: 'bg-fuchsia-500/10 shadow-[0_0_120px_rgba(217,70,239,0.25)]',
        };
      default:
        return {
          blob1: 'bg-emerald-500/10 shadow-[0_0_120px_rgba(16,185,129,0.25)]',
          blob2: 'bg-teal-500/10 shadow-[0_0_120px_rgba(20,184,166,0.25)]',
        };
    }
  };

  const blobColors = getBlobColors();

  return (
    <div className="absolute inset-0 w-full h-full space-bg z-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white pointer-events-none"
          style={{
            width: star.size,
            height: star.size,
            left: star.left,
            top: star.top,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: 'linear',
          }}
        />
      ))}

      <motion.div
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -40, 30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full filter blur-[80px] transition-all duration-1000 ${blobColors.blob1}`}
      />

      <motion.div
        animate={{
          x: [0, -40, 20, 0],
          y: [0, 30, -40, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full filter blur-[80px] transition-all duration-1000 ${blobColors.blob2}`}
      />

      <div 
        className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  );
};

export default Background3D;
