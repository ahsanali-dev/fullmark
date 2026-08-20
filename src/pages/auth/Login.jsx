import React, { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiLogIn, FiUserPlus } from 'react-icons/fi';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginUser } from '../../redux/slices/authSlice';

import toast from 'react-hot-toast';

import Background3D from '../../components/shared/Background3D';
import RoleSelector from '../../components/auth/RoleSelector';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import AuthHeader from '../../components/auth/AuthHeader';
import { useLanguage } from '../../context/LanguageContext';

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email address is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const Login = () => {
  const [selectedRole, setSelectedRole] = useState('student');
  const [colorFlow, setColorFlow] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    const handleThemeChange = () => setTheme(localStorage.getItem('theme') || 'dark');
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  const isLight = theme === 'light';

  useEffect(() => {
    const timer = setTimeout(() => {
      setColorFlow(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    const payload = {
      email: values.email,
      password: values.password,
      role: selectedRole,
    };
    
    const loadToast = toast.loading('Logging you in...');
    try {
      const data = await dispatch(loginUser(payload)).unwrap();
      toast.dismiss(loadToast);
      toast.success(`Logged in successfully!`);
      setSubmitting(false);
      if (selectedRole === 'admin') {
        navigate('/admin/dashboard');
      } else if (selectedRole === 'teacher') {
        navigate('/teacher/dashboard');
      } else if (selectedRole === 'student') {
        navigate('/student/dashboard');
      } else if (selectedRole === 'parent') {
        navigate('/parent/dashboard');
      }
    } catch (err) {
      toast.dismiss(loadToast);
      if (err?.needsVerification) {
        toast.error('Please verify your email first.');
        navigate('/verify-otp', { state: { email: err.email } });
      } else {
        toast.error(err?.message || 'Login failed. Please check your credentials.');
      }
      setSubmitting(false);
    }
  };

  const getRoleThemeColor = () => {
    switch (selectedRole) {
      case 'student': return 'emerald';
      case 'teacher': return 'blue';
      case 'admin': return 'red';
      case 'parent': return 'purple';
      default: return 'emerald';
    }
  };

  const themeColor = getRoleThemeColor();

  return (
    <div className={`relative min-h-screen w-full overflow-hidden select-none z-0 transition-colors duration-300 ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#080911] text-gray-100'
    }`}>
      {/* Background Starry Nebula Layer */}
      {!isLight && <Background3D roleColor={selectedRole} />}

      {/* Top Header Controls */}
      <AuthHeader />

      {/* Centered Form Container */}
      <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 relative z-10">
        <div className="w-full max-w-lg z-20 flex flex-col justify-center">
          
          {/* Brand/Heading Header */}
          <div className="flex flex-col items-start mb-6 text-start">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: [0, -3, 3, 0] }}
              onClick={() => navigate('/')}
              className={`w-14 h-14 rounded-2xl bg-gradient-to-tr from-${themeColor}-600 to-indigo-600 flex items-center justify-center shadow-lg border border-white/10 mb-6 cursor-pointer`}
              style={{
                boxShadow: `0 8px 20px rgba(var(--color-${themeColor}-500), 0.3)`
              }}
            >
              <span className="text-white font-extrabold text-xl tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">FM</span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 leading-tight">
              <span className={`inline-block transition-all duration-1000 ${colorFlow ? 'color-flow-text' : (isLight ? 'text-slate-900' : 'text-white')}`}>
                {t('auth.signInTitle')}
              </span>
              <motion.span 
                animate={{ rotate: [0, 20, 0, 20, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 1 }}
                className="inline-block mx-3 origin-[70%_70%]"
              >
                👋
              </motion.span>
            </h1>
            
            <p className={`text-sm md:text-base font-medium tracking-wide ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              {t('auth.signInSubtitle')}
            </p>
          </div>

          {/* Selector Header */}
          <div className="flex items-center mb-4 mt-2">
            <motion.span 
              animate={{ 
                backgroundColor: 
                  selectedRole === 'student' ? '#10b981' : 
                  selectedRole === 'teacher' ? '#3b82f6' : 
                  selectedRole === 'admin' ? '#ef4444' : '#a855f7'
              }}
              transition={{ duration: 0.3 }}
              className="inline-block w-1.5 h-6 rounded-full mx-3 shadow-[0_0_8px_currentColor]"
            />
            <h2 className={`font-bold text-lg md:text-xl tracking-wide ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {isRTL ? "تسجيل الدخول كـ" : "Sign in as"}
            </h2>
          </div>

          {/* Role selector tabs */}
          <RoleSelector selectedRole={selectedRole} onChange={setSelectedRole} />

          {/* Main Formik login form */}
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={LoginSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="w-full">
                <motion.div
                  layout
                  className={`p-5 md:p-6 rounded-3xl mb-4 flex flex-col relative overflow-hidden transition-all duration-500 ${
                    isLight 
                      ? 'bg-white/90 border border-slate-200 shadow-xl text-slate-900' 
                      : (selectedRole === 'student' ? 'card-3d-student' :
                         selectedRole === 'teacher' ? 'card-3d-teacher' :
                         selectedRole === 'admin' ? 'card-3d-admin' : 'card-3d-parent')
                  }`}
                >
                  <Input
                    name="email"
                    type="email"
                    label={t('auth.emailLabel')}
                    placeholder={t('auth.emailPlaceholder')}
                    icon={FiMail}
                    roleColor={selectedRole}
                  />

                  <Input
                    name="password"
                    type="password"
                    label={t('auth.passwordLabel')}
                    placeholder={t('auth.passwordPlaceholder')}
                    icon={FiLock}
                    showPasswordToggle={true}
                    roleColor={selectedRole}
                  />

                  {/* Forgot Password */}
                  <div className={`w-full flex mb-4 -mt-2 ${isRTL ? 'justify-start' : 'justify-end'}`}>
                    <Link 
                      to="/forgot-password" 
                      className={`text-xs md:text-sm font-bold transition-all duration-300 ${
                        selectedRole === 'student' ? 'text-emerald-500 hover:text-emerald-600' :
                        selectedRole === 'teacher' ? 'text-blue-500 hover:text-blue-600' :
                        selectedRole === 'admin' ? 'text-red-500 hover:text-red-600' :
                        'text-purple-500 hover:text-purple-600'
                      }`}
                    >
                      {t('auth.forgotPassword')}
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    roleColor={selectedRole}
                    icon={FiLogIn}
                  >
                    {isSubmitting ? t('common.loading') : t('auth.submitSignIn')}
                  </Button>
                </motion.div>
              </Form>
            )}
          </Formik>

          {/* Create Account Link */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-full flex items-center justify-center gap-4 mb-4">
              <div className={`h-[1px] flex-1 ${isLight ? 'bg-slate-300' : 'bg-gradient-to-r from-transparent to-gray-800'}`} />
              <span className={`text-xs md:text-sm font-semibold tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                {t('auth.dontHaveAccount')}
              </span>
              <div className={`h-[1px] flex-1 ${isLight ? 'bg-slate-300' : 'bg-gradient-to-l from-transparent to-gray-800'}`} />
            </div>

            <Button
              variant="secondary"
              roleColor={selectedRole}
              icon={FiUserPlus}
              onClick={() => navigate('/register')}
              className="w-full text-sm font-semibold"
            >
              {t('auth.submitRegister')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
