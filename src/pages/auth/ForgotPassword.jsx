import React, { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { motion as motionFramer } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiArrowLeft, FiSend } from 'react-icons/fi';

import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { forgotPassword } from '../../redux/slices/authSlice';

import Background3D from '../../components/shared/Background3D';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import AuthHeader from '../../components/auth/AuthHeader';
import { useLanguage } from '../../context/LanguageContext';

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email address is required'),
});

const ForgotPassword = () => {
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

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await dispatch(forgotPassword({ email: values.email })).unwrap();
      toast.success(`Reset code sent to ${values.email}!`);
      setSubmitting(false);
      navigate('/reset-password', { state: { email: values.email } });
    } catch (err) {
      toast.error(err || 'Failed to send reset code.');
      setSubmitting(false);
    }
  };

  return (
    <div className={`relative min-h-screen w-full overflow-hidden select-none z-0 transition-colors duration-300 ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#080911] text-gray-100'
    }`}>
      {/* Background Starry Nebula Layer */}
      {!isLight && <Background3D roleColor="auth" />}

      {/* Top Header Controls */}
      <AuthHeader />

      {/* Centered Form Container */}
      <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 relative z-10">
        <div className="w-full max-w-lg z-20 flex flex-col justify-center">
          
          {/* Header with Back button */}
          <div className="flex items-center mb-6">
            <motionFramer.button 
              type="button"
              onClick={() => navigate('/login')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                isLight 
                  ? 'border-slate-300 text-slate-700 bg-white hover:bg-slate-100 shadow-sm' 
                  : 'border-gray-800 text-white bg-gray-950/40 hover:bg-gray-800/60'
              }`}
            >
              <FiArrowLeft size={20} className={isRTL ? "rotate-180" : ""} />
            </motionFramer.button>
          </div>

          {/* Glowing Top Lock Icon */}
          <div className="flex justify-center mb-6">
            <motionFramer.div 
              initial={{ scale: 0.9, opacity: 0, y: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                y: [0, -12, 0]
              }}
              transition={{ 
                y: {
                  repeat: Infinity,
                  duration: 3,
                  ease: "easeInOut"
                },
                scale: { type: 'spring', stiffness: 300, damping: 20 },
                opacity: { type: 'spring', stiffness: 300, damping: 20 }
              }}
              className="w-20 h-20 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_40px_rgba(168,85,247,0.25)]"
            >
              <FiLock size={32} />
            </motionFramer.div>
          </div>

          {/* Page Titles */}
          <div className="flex flex-col items-center mb-8 text-center">
            <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight mb-2 leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {t('auth.forgotPassword')}
            </h1>
            <p className={`text-sm md:text-base font-semibold tracking-wide px-4 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              {t('auth.resetPasswordDesc')}
            </p>
          </div>

          {/* Main Formik card */}
          <Formik
            initialValues={{ email: '' }}
            validationSchema={ForgotPasswordSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="w-full">
                
                {/* 3D Indigo Theme Card */}
                <div className={`p-5 md:p-6 rounded-3xl mb-4 flex flex-col text-start ${
                  isLight ? 'bg-white/90 border border-slate-200 shadow-xl text-slate-900' : 'card-3d-auth'
                }`}>
                  <Input
                    name="email"
                    type="email"
                    label={t('auth.emailLabel')}
                    placeholder={t('auth.emailPlaceholder')}
                    icon={FiMail}
                    roleColor="auth"
                  />

                  <div className="mt-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      roleColor="auth"
                      icon={FiSend}
                    >
                      {isSubmitting ? t('common.loading') : t('auth.sendResetCode')}
                    </Button>
                  </div>
                </div>

              </Form>
            )}
          </Formik>

          {/* Secondary steps walkthrough card */}
          <div className={`p-5 md:p-6 rounded-3xl flex flex-col gap-5 text-start ${
            isLight ? 'bg-white/80 border border-slate-200 shadow-md text-slate-800' : 'card-3d-auth bg-opacity-40'
          }`}>
            {/* Step 1 */}
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-[0_0_10px_rgba(168,85,247,0.4)] flex-shrink-0">
                1
              </div>
              <p className={`text-xs md:text-sm font-semibold tracking-wide ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                {t('auth.resetStep1')}
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-[0_0_10px_rgba(59,130,246,0.4)] flex-shrink-0">
                2
              </div>
              <p className={`text-xs md:text-sm font-semibold tracking-wide ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                {t('auth.resetStep2')}
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shadow-[0_0_10px_rgba(16,185,129,0.4)] flex-shrink-0">
                3
              </div>
              <p className={`text-xs md:text-sm font-semibold tracking-wide ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                {t('auth.resetStep3')}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
