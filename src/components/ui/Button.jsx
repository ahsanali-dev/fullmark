import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  roleColor = 'student', 
  variant = 'primary', // 'primary' | 'secondary'
  icon: Icon,
  disabled = false,
  className = '',
  ...props 
}) => {
  
  const getStyles = () => {
    if (variant === 'secondary') {
      const getSecondaryColors = () => {
        switch (roleColor) {
          case 'student': return 'border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.12)] hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]';
          case 'teacher': return 'border border-blue-500/40 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/60 shadow-[0_0_15px_rgba(59,130,246,0.12)] hover:shadow-[0_0_20px_rgba(59,130,246,0.25)]';
          case 'admin': return 'border border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.12)] hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]';
          case 'parent': return 'border border-purple-500/40 text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.12)] hover:shadow-[0_0_20px_rgba(168,85,247,0.25)]';
          case 'auth': return 'border border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/60 shadow-[0_0_15px_rgba(99,102,241,0.12)] hover:shadow-[0_0_20px_rgba(99,102,241,0.25)]';
          default: return 'border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.12)] hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]';
        }
      };
      return {
        btnClass: `${getSecondaryColors()} transition-all duration-300`,
        activeScale: 0.98,
      };
    }

    switch (roleColor) {
      case 'student':
        return {
          btnClass: 'btn-3d-student text-white',
          activeScale: 0.97,
        };
      case 'teacher':
        return {
          btnClass: 'btn-3d-teacher text-white',
          activeScale: 0.97,
        };
      case 'admin':
        return {
          btnClass: 'btn-3d-admin text-white',
          activeScale: 0.97,
        };
      case 'parent':
        return {
          btnClass: 'btn-3d-parent text-white',
          activeScale: 0.97,
        };
      case 'auth':
        return {
          btnClass: 'btn-3d-auth-gradient text-white',
          activeScale: 0.97,
        };
      default:
        return {
          btnClass: 'btn-3d-student text-white',
          activeScale: 0.97,
        };
    }
  };

  const { btnClass, activeScale } = getStyles();

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: activeScale }}
      className={`w-full py-4 px-6 rounded-full flex items-center justify-center gap-3 select-none text-base font-bold tracking-wide cursor-pointer ${btnClass} ${disabled ? 'opacity-50 cursor-not-allowed transform-none' : ''} ${className}`}
      {...props}
    >
      {Icon && <Icon className="text-xl drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.4)] animate-pulse" />}
      <span className="drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.5)]">
        {children}
      </span>
    </motion.button>
  );
};

export default Button;
