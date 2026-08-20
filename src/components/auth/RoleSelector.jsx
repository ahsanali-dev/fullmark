import React from 'react';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaChalkboardTeacher, FaShieldAlt, FaUsers } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';

const RoleSelector = ({ selectedRole, onChange, excludeAdmin = false }) => {
  const { t } = useLanguage();
  const [isLight, setIsLight] = React.useState(() => localStorage.getItem('theme') === 'light');

  React.useEffect(() => {
    const handleThemeChange = () => setIsLight(localStorage.getItem('theme') === 'light');
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  const roles = [
    { id: 'student', name: t('auth.studentRole'), icon: FaGraduationCap, color: 'student', themeColor: 'emerald' },
    { id: 'teacher', name: t('auth.teacherRole'), icon: FaChalkboardTeacher, color: 'teacher', themeColor: 'blue' },
    { id: 'admin', name: 'Admin', icon: FaShieldAlt, color: 'admin', themeColor: 'red' },
    { id: 'parent', name: t('auth.parentRole'), icon: FaUsers, color: 'parent', themeColor: 'purple' },
  ];

  const filteredRoles = excludeAdmin ? roles.filter(r => r.id !== 'admin') : roles;

  return (
    <div className="w-full mb-8">
      <div className={`grid ${excludeAdmin ? 'grid-cols-3' : 'grid-cols-4'} gap-3 md:gap-4`}>
        {filteredRoles.map((role) => {
          const isActive = selectedRole === role.id;
          const Icon = role.icon;

          const getActiveStyles = () => {
            if (isLight) {
              switch (role.id) {
                case 'student': return 'bg-emerald-50 text-emerald-700 border-emerald-400 shadow-md';
                case 'teacher': return 'bg-blue-50 text-blue-700 border-blue-400 shadow-md';
                case 'admin': return 'bg-red-50 text-red-700 border-red-400 shadow-md';
                case 'parent': return 'bg-purple-50 text-purple-700 border-purple-400 shadow-md';
                default: return '';
              }
            }
            switch (role.id) {
              case 'student':
                return 'toggle-3d-active-student bg-emerald-950/40 text-emerald-400 border-emerald-500/50';
              case 'teacher':
                return 'toggle-3d-active-teacher bg-blue-950/40 text-blue-400 border-blue-500/50';
              case 'admin':
                return 'toggle-3d-active-admin bg-red-950/40 text-red-400 border-red-500/50';
              case 'parent':
                return 'toggle-3d-active-parent bg-purple-950/40 text-purple-400 border-purple-500/50';
              default:
                return '';
            }
          };

          return (
            <motion.button
              key={role.id}
              type="button"
              onClick={() => onChange(role.id)}
              whileHover={{ y: -3, scale: 1.03 }}
              whileTap={{ y: 1, scale: 0.97 }}
              className={`relative flex flex-col items-center justify-center p-3 md:p-4 rounded-2xl border transition-all duration-300 cursor-pointer h-24 ${
                isActive 
                  ? `${getActiveStyles()}` 
                  : (isLight 
                      ? 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 shadow-sm' 
                      : 'bg-slate-900/40 border-gray-800 text-gray-500 hover:text-gray-300 hover:border-gray-700'
                    )
              }`}
            >
              <div className={`mb-2 transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>
                <Icon size={24} className={isActive ? 'drop-shadow-[0_0_8px_currentColor]' : ''} />
              </div>

              <span className={`text-[11px] md:text-sm font-semibold tracking-wider ${isActive ? 'font-bold' : 'font-medium'}`}>
                {role.name}
              </span>

              {isActive && (
                <motion.div
                  layoutId="activeRoleIndicator"
                  className={`absolute -bottom-1 left-1/4 right-1/4 h-1 rounded-full ${
                    role.id === 'student' ? 'bg-emerald-400' :
                    role.id === 'teacher' ? 'bg-blue-400' :
                    role.id === 'admin' ? 'bg-red-400' : 'bg-purple-400'
                  }`}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default RoleSelector;
