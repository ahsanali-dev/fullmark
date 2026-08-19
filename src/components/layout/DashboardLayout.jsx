import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiGrid, 
  FiUsers, 
  FiBookOpen, 
  FiBarChart2, 
  FiSettings, 
  FiSun, 
  FiMoon, 
  FiBell, 
  FiLogOut, 
  FiChevronUp, 
  FiChevronDown,
  FiChevronLeft,
  FiFileText,
  FiUser,
  FiShield,
  FiHelpCircle,
  FiHome,
  FiClipboard,
  FiTag
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../redux/slices/authSlice';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  deleteNotification,
} from '../../redux/slices/notificationsSlice';

const DashboardLayout = ({ role = 'admin', children, activeTab = 'dashboard', title, subtitle, disableScroll, isModalOpen = false, showBackButton = false, onBackClick, headerActions }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recently';
    const diff = new Date() - d;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Get color theme based on role
  const getRoleConfig = () => {
    switch (role) {
      case 'student':
        return {
          color: 'emerald',
          avatarText: 'AL',
          roleName: 'Student',
          gradientClass: 'from-emerald-600 to-teal-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]',
          badgeClass: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
          dotClass: 'bg-emerald-500',
          activeMenuClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]',
          menus: [
            { id: 'dashboard', label: 'Home', icon: FiHome },
            { id: 'courses', label: 'Courses', icon: FiBookOpen },
            { id: 'weaknesses', label: 'Weaknesses', icon: FiHelpCircle },
            { id: 'exams', label: 'Exams', icon: FiClipboard },
            { id: 'results', label: 'Results', icon: FiBarChart2 },
            { id: 'profile', label: 'Profile', icon: FiUser }
          ]
        };
      case 'teacher':
        return {
          color: 'blue',
          avatarText: 'TR',
          roleName: 'Teacher',
          gradientClass: 'from-blue-600 to-indigo-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]',
          badgeClass: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
          dotClass: 'bg-blue-500',
          activeMenuClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]',
          menus: [
            { id: 'dashboard', label: 'Home', icon: FiHome },
            { id: 'subjects', label: 'Subjects', icon: FiBookOpen },
            { id: 'questions', label: 'Questions', icon: FiHelpCircle },
            { id: 'exams', label: 'Exams', icon: FiClipboard },
            { id: 'notifications/compose', label: 'Announce', icon: FiBell },
            { id: 'settings', label: 'Profile', icon: FiUser }
          ]
        };
      case 'parent':
        return {
          color: 'purple',
          avatarText: 'PT',
          roleName: 'Parent',
          gradientClass: 'from-purple-600 to-fuchsia-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]',
          badgeClass: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
          dotClass: 'bg-purple-500',
          activeMenuClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]',
          menus: [
            { id: 'dashboard', label: 'Home', icon: FiHome },
            { id: 'children', label: 'Children', icon: FiUsers },
            { id: 'attendance', label: 'Analysis', icon: FiBarChart2 },
            { id: 'reports', label: 'Reports', icon: FiFileText },
            { id: 'settings', label: 'Profile', icon: FiUser }
          ]
        };
      case 'admin':
      default:
        return {
          color: 'red',
          avatarText: 'AP',
          roleName: 'Admin',
          gradientClass: 'from-red-600 to-rose-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]',
          badgeClass: 'bg-red-500/10 border-red-500/20 text-red-400',
          dotClass: 'bg-red-500',
          activeMenuClass: 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]',
          menus: [
            { id: 'dashboard', label: 'Dashboard', icon: FiGrid },
            { id: 'users', label: 'Users', icon: FiUsers },
            { id: 'content', label: 'Content', icon: FiBookOpen },
            { id: 'coupons', label: 'Coupons', icon: FiTag },
            { id: 'reports', label: 'Reports', icon: FiBarChart2 },
            { id: 'settings', label: 'Settings', icon: FiSettings }
          ]
        };
    }
  };

  const config = getRoleConfig();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications } = useSelector((state) => state.notifications);
  const user = useSelector((state) => state.auth.user);
  const desktopUserMenuRef = useRef(null);
  const mobileUserMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  const [profileName, setProfileName] = useState('User');
  const [profileAvatar, setProfileAvatar] = useState(config.avatarText);

  useEffect(() => {
    const loadProfile = () => {
      if (user?.name || user?.fullName || user?.email) {
        const dynamicName = user.name || user.fullName || user.email.split('@')[0];
        setProfileName(dynamicName);
        const initials = dynamicName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().substring(0, 2);
        setProfileAvatar(initials || config.avatarText);
        return;
      }

      if (role === 'teacher') {
        const stored = localStorage.getItem('teacher_profile');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.name) {
              setProfileName(parsed.name);
              setProfileAvatar(parsed.name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().substring(0, 2));
              return;
            }
          } catch {}
        }
        setProfileName('Teacher');
        setProfileAvatar('TR');
      } else if (role === 'student') {
        const storedName = localStorage.getItem('student_profile_name');
        if (storedName) {
          setProfileName(storedName);
          const initials = storedName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().substring(0, 2);
          setProfileAvatar(initials || 'ST');
        } else {
          setProfileName('Student');
          setProfileAvatar('ST');
        }
      } else if (role === 'parent') {
        const stored = localStorage.getItem('parent_profile');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.name) {
              setProfileName(parsed.name);
              setProfileAvatar(parsed.initials || 'PT');
              return;
            }
          } catch {}
        }
        setProfileName('Parent');
        setProfileAvatar('PT');
      } else {
        setProfileName(role === 'admin' ? 'Admin Panel' : 'User');
        setProfileAvatar(config.avatarText);
      }
    };
    loadProfile();
    window.addEventListener('storage', loadProfile);
    window.addEventListener('profileUpdate', loadProfile);
    return () => {
      window.removeEventListener('storage', loadProfile);
      window.removeEventListener('profileUpdate', loadProfile);
    };
  }, [role, config.avatarText, user]);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
    window.dispatchEvent(new Event('themeChange'));
  }, [theme]);

  useEffect(() => {
    const handleThemeChange = () => {
      const storedTheme = localStorage.getItem('theme') || 'dark';
      if (storedTheme !== theme) {
        setTheme(storedTheme);
      }
    };
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, [theme]);

  // Close dropdowns if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutsideDesktop = !desktopUserMenuRef.current || !desktopUserMenuRef.current.contains(event.target);
      const clickedOutsideMobile = !mobileUserMenuRef.current || !mobileUserMenuRef.current.contains(event.target);
      
      if (clickedOutsideDesktop && clickedOutsideMobile) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    toast.success('Logged out successfully!');
    navigate('/');
  };



  const getHeaderTitle = () => {
    if (title) return title;
    switch (activeTab) {
      case 'dashboard':
        return 'Admin Panel';
      case 'users':
        return 'User Management';
      case 'content':
        return 'Content Library';
      case 'coupons':
        return 'Coupon Management';
      case 'reports':
        return 'Platform Reports';
      case 'settings':
        return 'System Settings';
      default:
        return 'Admin Panel';
    }
  };

  return (
    <div className="h-screen bg-[#080911] text-gray-100 flex font-sans select-none w-full overflow-hidden">
      
      {/* 1. DESKTOP SIDEBAR */}
      <aside className={`hidden lg:flex flex-col w-64 border-r border-gray-800 bg-[#0c0d19]/80 backdrop-blur-xl p-6 justify-between shrink-0 transition-all duration-300 ${
        isModalOpen ? 'blur-sm pointer-events-none' : ''
      }`}>
        <div className="flex flex-col gap-8">
          {/* Logo / Header */}
          <div 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group hover:opacity-90 transition-opacity"
            title="Go to Landing Page"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-white text-lg bg-gradient-to-r ${config.gradientClass} group-hover:scale-105 transition-transform duration-200`}>
              FM
            </div>
            <div>
              <h2 className="font-extrabold tracking-wide text-white text-lg group-hover:text-white/90 transition-colors">FullMark</h2>
              <span className="text-[10px] text-gray-500 font-bold tracking-wider uppercase">Portal Access</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            {config.menus.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(`/${role}/${item.id}`)}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
                    isActive 
                      ? config.activeMenuClass 
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/20 border border-transparent'
                  }`}
                >
                  <Icon className="text-lg" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Desktop Bottom User Profile Dropdown */}
        <div className="relative" ref={desktopUserMenuRef}>
          {showUserMenu && (
            <div className="absolute bottom-full left-0 w-full mb-3 bg-[#111222] border border-gray-800 rounded-2xl p-2 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl animate-fade-in">
              {(role === 'teacher' || role === 'student' || role === 'parent') && (
                <button
                  onClick={() => {
                    const profileRoute = role === 'teacher' ? '/teacher/settings' : role === 'student' ? '/student/profile' : '/parent/settings';
                    navigate(profileRoute);
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-300 hover:bg-gray-800/40 rounded-xl transition-all duration-200 cursor-pointer mb-1 text-left"
                >
                  <FiUser className="text-base" />
                  My Profile
                </button>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 cursor-pointer text-left"
              >
                <FiLogOut className="text-base" />
                Log Out
              </button>
            </div>
          )}
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center justify-between p-3.5 bg-gray-950/40 hover:bg-gray-800/40 border border-gray-800 rounded-2xl transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm bg-gradient-to-r ${config.gradientClass}`}>
                {profileAvatar}
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white leading-tight">{profileName}</p>
                <p className="text-xs text-gray-500">{config.roleName}</p>
              </div>
            </div>
            {showUserMenu ? <FiChevronDown className="text-gray-400" /> : <FiChevronUp className="text-gray-400" />}
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT CONTAINER */}
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full">
        
        {/* Top Header Section */}
        <header className={`px-6 py-4 md:px-8 flex items-center justify-between border-b border-gray-800/50 bg-[#080911]/70 backdrop-blur-md shrink-0 z-10 transition-all duration-300 ${
          isModalOpen ? 'blur-sm pointer-events-none' : ''
        }`}>
          <div className="flex items-center gap-3 sm:gap-4 text-left">
            {showBackButton && (
              <button 
                onClick={onBackClick || (() => navigate(-1))}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border border-gray-800 bg-gray-950/30 hover:bg-gray-800/30 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 cursor-pointer shrink-0"
              >
                <FiChevronLeft className="text-lg" />
              </button>
            )}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2 sm:gap-3">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-white whitespace-nowrap leading-tight">{getHeaderTitle()}</h1>
                <span className={`flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-extrabold shadow-[0_0_10px_rgba(0,0,0,0.1)] ${config.badgeClass}`}>
                  <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full animate-pulse ${config.dotClass}`} />
                  {config.roleName}
                </span>
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-gray-500 tracking-wider flex items-center gap-1.5 uppercase leading-none">
                {subtitle ? subtitle : 'Platform Overview 🛠️'}
              </span>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {headerActions}
            {/* Theme Toggle */}
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border border-gray-800 bg-gray-950/30 hover:bg-gray-800/30 flex items-center justify-center text-yellow-500 transition-all duration-300 cursor-pointer"
            >
              {theme === 'dark' ? <FiSun className="text-base sm:text-lg" /> : <FiMoon className="text-base sm:text-lg" />}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border border-gray-800 bg-gray-950/30 hover:bg-gray-800/30 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 relative cursor-pointer"
              >
                <FiBell className="text-base sm:text-lg" />
                {notifications.some(n => !n.isRead) && (
                  <span className="absolute top-3 right-3 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-[#111222] border border-gray-800 rounded-3xl p-4 shadow-[0_10px_45px_rgba(0,0,0,0.6)] backdrop-blur-xl z-50 animate-fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-800/50 mb-2">
                    <h4 className="text-sm font-black text-white">Notifications</h4>
                    {notifications.some(n => !n.isRead) && (
                      <button 
                        onClick={() => {
                          dispatch(markAllNotificationsRead());
                          toast.success('All notifications marked as read!');
                        }}
                        className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? (
                      <>
                        {notifications.map((n) => {
                          const isStudent = n.type === 'student' || n.type === 'enrollment';
                          const isSystem = n.type === 'system';
                          const isExam = n.type === 'exam_result';
                          return (
                            <div 
                              key={n._id}
                              onClick={() => {
                                if (!n.isRead) {
                                  dispatch(markNotificationRead(n._id));
                                }
                              }}
                              className={`p-3 rounded-2xl border flex gap-3 text-left transition-all cursor-pointer ${
                                n.isRead 
                                  ? 'bg-transparent border-gray-800/40 opacity-60' 
                                  : 'bg-[#16172b]/60 border-gray-800'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                isStudent 
                                  ? 'bg-emerald-500/10 text-emerald-400' 
                                  : isSystem 
                                  ? 'bg-blue-500/10 text-blue-400' 
                                  : 'bg-purple-500/10 text-purple-400'
                              }`}>
                                {isStudent ? <FiUser size={14} /> : isSystem ? <FiShield size={14} /> : isExam ? <FiClipboard size={14} /> : <FiBookOpen size={14} />}
                              </div>
                              <div className="flex flex-col min-w-0 flex-1">
                                <p className="text-xs font-bold text-white leading-snug truncate">{n.title}</p>
                                <p className="text-[10px] font-semibold text-gray-400 truncate mt-0.5">{n.body}</p>
                                <span className="text-[8px] font-semibold text-gray-500 mt-1">{formatTime(n.createdAt)}</span>
                              </div>
                            </div>
                          );
                        })}
                        <button
                          onClick={() => {
                            setShowNotifications(false);
                            navigate(`/${role}/notifications`);
                          }}
                          className="w-full text-center py-2 mt-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors border-t border-gray-800/40 cursor-pointer"
                        >
                          View all notifications
                        </button>
                      </>
                    ) : (
                      <p className="text-xs text-gray-500 text-center py-4 font-bold">No notifications</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Mobile User Profile Trigger */}
            <div className="relative lg:hidden" ref={mobileUserMenuRef}>
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-bold text-white text-xs sm:text-sm transition-transform active:scale-95 cursor-pointer bg-gradient-to-r ${config.gradientClass}`}
              >
                {profileAvatar}
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-3 w-48 bg-[#111222] border border-gray-800 rounded-2xl p-2 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl z-50">
                  <div className="px-3.5 py-2.5 border-b border-gray-800/50 mb-1">
                    <p className="text-xs font-bold text-white leading-tight text-left">{profileName}</p>
                    <p className="text-[10px] text-gray-500 text-left">{config.roleName}</p>
                  </div>
                  {(role === 'teacher' || role === 'student' || role === 'parent') && (
                    <button
                      onClick={() => {
                        const profileRoute = role === 'teacher' ? '/teacher/settings' : role === 'student' ? '/student/profile' : '/parent/settings';
                        navigate(profileRoute);
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-2 text-sm font-bold text-gray-300 hover:bg-gray-800/40 rounded-xl transition-all duration-200 cursor-pointer text-left mb-1"
                    >
                      <FiUser className="text-sm" />
                      My Profile
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 cursor-pointer text-left"
                  >
                    <FiLogOut className="text-sm" />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Children - Scrollable area */}
        <div className={`flex-1 w-full min-h-0 ${disableScroll ? 'h-full overflow-hidden flex flex-col' : 'overflow-y-auto pb-24 lg:pb-8'}`}>
          {children}
        </div>

      </main>

      {/* 3. MOBILE BOTTOM NAVIGATION BAR */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 h-22 bg-[#0c0d19]/90 border-t border-gray-800/80 backdrop-blur-xl flex items-center justify-around px-2 z-40 pb-2 transition-all duration-300 ${
        isModalOpen ? 'blur-sm pointer-events-none' : ''
      }`}>
        {config.menus.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(`/${role}/${item.id}`)}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 px-3 rounded-2xl transition-all duration-300 cursor-pointer ${
                isActive 
                  ? `${config.badgeClass} shadow-[0_0_12px_rgba(0,0,0,0.05)]` 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon className="text-lg" />
              <span className="text-[9px] font-bold tracking-wide uppercase">{item.label}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
};

export default DashboardLayout;
