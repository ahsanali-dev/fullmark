import React, { useState } from 'react';
import { useField, useFormikContext } from 'formik';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Input = ({ label, icon: Icon, showPasswordToggle, roleColor, ...props }) => {
  const formikContext = useFormikContext();
  const isFormik = !!formikContext;

  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  let field = {};
  let meta = {};
  let isError = false;
  let hasValue = false;

  if (isFormik) {
    const [formikField, formikMeta] = useField(props);
    field = formikField;
    meta = formikMeta;
    isError = meta.touched && meta.error;
    hasValue = field.value !== undefined && field.value !== '';
  } else {
    field = {
      name: props.name,
      value: props.value,
      onChange: props.onChange,
      onBlur: props.onBlur,
    };
    isError = props.error && props.touched;
    hasValue = props.value !== undefined && props.value !== '';
  }

  const isFloating = isFocused || hasValue;

  // Class mapping for input styles
  const getInput3DClass = () => {
    if (isError) return 'border border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.3)] bg-red-950/10';
    switch (roleColor) {
      case 'student': return 'input-3d-student';
      case 'teacher': return 'input-3d-teacher';
      case 'admin': return 'input-3d-admin';
      case 'parent': return 'input-3d-parent';
      case 'auth': return 'input-3d-auth';
      default: return 'input-3d-student';
    }
  };

  // Color mapping for texts
  const getThemeTextColors = () => {
    switch (roleColor) {
      case 'student': return { text: '#10b981', icon: 'text-emerald-400' };
      case 'teacher': return { text: '#3b82f6', icon: 'text-blue-400' };
      case 'admin': return { text: '#ef4444', icon: 'text-red-400' };
      case 'parent': return { text: '#a855f7', icon: 'text-purple-400' };
      case 'auth': return { text: '#818cf8', icon: 'text-indigo-400' };
      default: return { text: '#10b981', icon: 'text-emerald-400' };
    }
  };

  const themeColors = getThemeTextColors();
  const inputType = props.type === 'password' && showPassword ? 'text' : props.type;

  return (
    <div className="w-full flex flex-col mb-4 relative select-none">

      {/* Input container wrapper with 3D feel */}
      <div
        className={`w-full flex items-center relative rounded-2xl transition-all duration-300 h-15 px-4 ${getInput3DClass()}`}
      >
        {/* Left Icon */}
        {Icon && (
          <div className={`flex items-center justify-center transition-colors duration-300 z-10 ${isError ? 'text-red-400/80' : isFocused ? themeColors.icon : 'text-gray-500'
            }`}>
            <Icon size={20} className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
          </div>
        )}

        {/* Input & Floating Label Container */}
        <div className="flex-1 relative h-full flex items-center">

          {/* Absolute floating label using Framer Motion */}
          <motion.span
            animate={{
              y: isFloating ? -30.5 : 0,
              x: isFloating ? -28 : 0,
              scale: isFloating ? 0.8 : 1,
              color: isError ? '#ef4444' : isFloating ? themeColors.text : '#9ca3af'
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute left-3 pointer-events-none font-semibold text-sm md:text-base tracking-wide origin-left z-10"
          >
            {label}
          </motion.span>

          {/* Actual Input Field */}
          <input
            {...field}
            {...props}
            type={inputType}
            placeholder={isFocused ? props.placeholder : ''}
            onFocus={(e) => {
              setIsFocused(true);
              if (props.onFocus) props.onFocus(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              if (isFormik && field.onBlur) {
                field.onBlur(e);
              }
              if (props.onBlur) props.onBlur(e);
            }}
            className="w-full h-full bg-transparent border-none text-white text-sm md:text-base font-semibold px-3 outline-none focus:ring-0 focus:outline-none z-0"
          />
        </div>

        {/* Password Eye Toggle */}
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-gray-500 hover:text-gray-300 transition-colors focus:outline-none ml-2 z-10 cursor-pointer"
          >
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        )}
      </div>

      {/* Error Message Container (absolute positioning to prevent layout jump) */}
      <div className="h-4 mt-0.5 pl-2 relative">
        <AnimatePresence>
          {isError && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-red-400 text-xs font-bold flex items-center absolute"
            >
              <span className="inline-block w-1 h-1 rounded-full bg-red-400 mr-1.5 animate-pulse"></span>
              {isFormik ? meta.error : props.error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Input;
