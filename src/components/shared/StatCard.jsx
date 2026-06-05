import React from 'react';

/**
 * StatCard — Reusable metric/stat display card
 *
 * Props:
 *   value       {string|number}  — main number to display
 *   label       {string}         — label below number e.g. "Students"
 *   icon        {ReactNode}      — icon element
 *   colorClass  {string}         — tailwind border color class e.g. 'border-blue-500/15'
 *   iconBg      {string}         — tailwind classes for icon container
 *   iconColor   {string}         — tailwind text-color for icon
 *   onClick     {function}       — optional click handler (makes card clickable)
 *   className   {string}         — extra tailwind classes
 */
const StatCard = ({
  value,
  label,
  icon,
  colorClass = 'border-gray-800/80',
  iconBg = 'bg-blue-500/10 border border-blue-500/20',
  iconColor = 'text-blue-400',
  onClick,
  className = '',
}) => {
  const isClickable = typeof onClick === 'function';

  const base = `p-4 bg-[#0e101a]/90 ${colorClass} rounded-3xl flex flex-col items-center justify-center text-center shadow-lg transition-all ${className}`;
  const clickable = isClickable
    ? 'cursor-pointer hover:translate-y-[-2px] group hover:border-opacity-60'
    : '';

  return (
    <div className={`${base} ${clickable}`} onClick={onClick}>
      <div
        className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center ${iconColor} mb-3 ${isClickable ? 'group-hover:scale-105 transition-transform' : ''}`}
      >
        {icon}
      </div>
      <span className="text-xl md:text-2xl font-extrabold text-white leading-none">
        {value}
      </span>
      <span className="text-[9px] md:text-[10px] font-bold text-gray-500 tracking-wider mt-1 uppercase">
        {label}
      </span>
    </div>
  );
};

export default StatCard;
