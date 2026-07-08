import React from 'react';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaChalkboardTeacher, FaShieldAlt, FaUsers } from 'react-icons/fa';

const roles = [
  { id: 'student', name: 'Student', icon: FaGraduationCap, color: 'student', themeColor: 'emerald' },
  { id: 'teacher', name: 'Teacher', icon: FaChalkboardTeacher, color: 'teacher', themeColor: 'blue' },
  { id: 'admin', name: 'Admin', icon: FaShieldAlt, color: 'admin', themeColor: 'red' },
  { id: 'parent', name: 'Parent', icon: FaUsers, color: 'parent', themeColor: 'purple' },
];

const RoleSelector = ({ selectedRole, onChange, excludeAdmin = false }) => {
  const filteredRoles = excludeAdmin ? roles.filter(r => r.id !== 'admin') : roles;

  return (
    <div className="w-full mb-8">
      <div className={`grid ${excludeAdmin ? 'grid-cols-3' : 'grid-cols-4'} gap-3 md:gap-4`}>
        {filteredRoles.map((role) => {
          const isActive = selectedRole === role.id;
          const Icon = role.icon;

          const getActiveStyles = () => {
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
                  : 'bg-slate-900/40 border-gray-800 text-gray-500 hover:text-gray-300 hover:border-gray-700'
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
