import React, { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { motion as motionFramer } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiShield, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { verifyOtp, resendOtp } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';

import Background3D from '../../components/shared/Background3D';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import AuthHeader from '../../components/auth/AuthHeader';
import { useLanguage } from '../../context/LanguageContext';

const VerifyOtpSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email address is required'),
  code: Yup.string()
    .length(6, 'Verification code must be exactly 6 characters')
    .required('Verification code is required'),
});

const VerifyOtp = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    const handleThemeChange = () => setTheme(localStorage.getItem('theme') || 'dark');
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  const isLight = theme === 'light';

  // Try to retrieve email from route state (e.g. from register redirection)
  const initialEmail = location.state?.email || '';

  const handleSubmit = async (values, { setSubmitting }) => {
    const payload = {
      email: values.email,
      code: values.code,
    };

    const loadToast = toast.loading(t('auth.verifyingCode'));
    try {
      const data = await dispatch(verifyOtp(payload)).unwrap();
      toast.dismiss(loadToast);
      toast.success(t('auth.emailVerifiedSuccess'));
      setSubmitting(false);

      // Redirect user based on role
      const role = data?.user?.role || 'student';
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'teacher') {
        navigate('/teacher/dashboard');
      } else if (role === 'student') {
        navigate('/student/dashboard');
      } else if (role === 'parent') {
        navigate('/parent/dashboard');
      }
    } catch (err) {
      toast.dismiss(loadToast);
      toast.error(err || t('auth.verificationFailed'));
      setSubmitting(false);
    }
  };

  const handleResend = async (email, setSubmitting) => {
    if (!email) {
      toast.error(t('auth.enterEmailFirst'));
      return;
    }

    const loadToast = toast.loading(t('auth.resendingCode'));
    try {
      await dispatch(resendOtp({ email })).unwrap();
      toast.dismiss(loadToast);
      toast.success(t('auth.codeResentSuccess'));
    } catch (err) {
      toast.dismiss(loadToast);
      toast.error(err || t('auth.failedToResendCode'));
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

          {/* Glowing Top Shield Icon */}
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
              className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_40px_rgba(99,102,241,0.25)]"
            >
              <FiShield size={32} />
            </motionFramer.div>
          </div>

          {/* Page Titles */}
          <div className="flex flex-col items-center mb-8 text-center">
            <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight mb-2 leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {t('auth.verifyEmailTitle')}
            </h1>
            <p className={`text-sm md:text-base font-semibold tracking-wide px-4 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              {t('auth.verifyEmailDesc')}
            </p>
          </div>

          {/* Main Formik card */}
          <Formik
            initialValues={{ email: initialEmail, code: '' }}
            validationSchema={VerifyOtpSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, values }) => (
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
                    disabled={!!initialEmail}
                  />

                  <Input
                    name="code"
                    type="text"
                    label={t('auth.verificationCodeLabel')}
                    placeholder="123456"
                    icon={FiShield}
                    roleColor="auth"
                  />

                  <div className="mt-4 flex flex-col gap-3">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      roleColor="auth"
                      icon={FiCheck}
                    >
                      {isSubmitting ? t('common.loading') : t('auth.verifyCodeButton')}
                    </Button>

                    <button
                      type="button"
                      onClick={() => handleResend(values.email)}
                      className={`w-full py-3.5 rounded-2xl border font-bold text-sm bg-transparent active:scale-95 transition-all cursor-pointer ${
                        isLight 
                          ? 'border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100' 
                          : 'border-gray-800 text-gray-400 hover:text-white hover:bg-gray-950/20'
                      }`}
                    >
                      {t('auth.resendCode')}
                    </button>
                  </div>
                </div>

              </Form>
            )}
          </Formik>

        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
