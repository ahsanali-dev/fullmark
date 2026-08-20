import React, { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { motion as motionFramer, AnimatePresence } from 'framer-motion';
import { 
  FiMail, 
  FiLock, 
  FiUser, 
  FiArrowLeft, 
  FiArrowRight, 
  FiCheck, 
  FiPhone,
  FiUserCheck 
} from 'react-icons/fi';

import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { registerUser } from '../../redux/slices/authSlice';

import Background3D from '../../components/shared/Background3D';
import RoleSelector from '../../components/auth/RoleSelector';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import AuthHeader from '../../components/auth/AuthHeader';
import { useLanguage } from '../../context/LanguageContext';

const RegisterSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(3, 'Name must be at least 3 characters')
    .required('Full Name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email address is required'),
  phoneNumber: Yup.string().optional(),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
  agreeToTerms: Yup.boolean()
    .oneOf([true], 'You must agree to the Terms & Conditions')
    .required('You must agree to the Terms & Conditions'),
});

const Register = () => {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('student');
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

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      navigate('/login');
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    const payload = {
      name: values.fullName,
      email: values.email,
      phone: values.phoneNumber || undefined,
      password: values.password,
      role: selectedRole,
    };
    
    const loadToast = toast.loading(t('auth.creatingAccount'));
    try {
      await dispatch(registerUser(payload)).unwrap();
      toast.dismiss(loadToast);
      toast.success(t('auth.accountCreatedSuccess'));
      setSubmitting(false);
      navigate('/verify-otp', { state: { email: values.email } });
    } catch (err) {
      toast.dismiss(loadToast);
      toast.error(err || t('auth.registrationFailed'));
      setSubmitting(false);
    }
  };

  return (
    <div className={`relative min-h-screen w-full overflow-hidden select-none z-0 transition-colors duration-300 ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#080911] text-gray-100'
    }`}>
      {/* Background Starry Layer */}
      {!isLight && <Background3D roleColor={selectedRole} />}

      {/* Top Header Controls */}
      <AuthHeader />

      {/* Centered Form Container */}
      <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 relative z-10">
        <div className="w-full max-w-lg z-20 flex flex-col justify-center">
          
          {/* Header Layout */}
          <div className="flex items-center gap-5 mb-6 text-start">
            <motionFramer.button 
              type="button"
              onClick={handleBack}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                isLight 
                  ? 'border-slate-300 text-slate-700 bg-white hover:bg-slate-100 shadow-sm' 
                  : 'border-gray-800 text-white bg-gray-950/40 hover:bg-gray-800/60'
              }`}
            >
              <FiArrowLeft size={20} className={isRTL ? "rotate-180" : ""} />
            </motionFramer.button>

            <div>
              <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight leading-none mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {t('auth.createTitle')}
              </h1>
              <p className={`text-sm md:text-base font-semibold tracking-wide ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                {t('auth.createSubtitle')}
              </p>
            </div>
          </div>

          {/* Role Selector */}
          <RoleSelector selectedRole={selectedRole} onChange={setSelectedRole} excludeAdmin={true} />

          {/* Progress Tracker Bar */}
          <div className="flex items-center justify-center mb-8 px-4">
            <div className="flex items-center justify-between w-full max-w-sm relative">
              
              {/* Line Connectors */}
              <div className="absolute top-5 left-5 right-5 h-[3px] -z-10">
                <div className="w-full h-full bg-gray-800 rounded relative">
                  <motionFramer.div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded"
                    initial={{ width: '0%' }}
                    animate={{ width: step === 2 ? '100%' : '0%' }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                  />
                </div>
              </div>

              {/* Step 1 Circle */}
              <div className="flex flex-col items-center">
                <motionFramer.div 
                  animate={{ 
                    background: step === 2 
                      ? 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)' 
                      : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    boxShadow: '0 0 15px rgba(99,102,241,0.4)'
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                >
                  {step === 2 ? <FiCheck size={16} /> : '1'}
                </motionFramer.div>
                <span className={`text-xs font-bold mt-2 select-none ${step === 2 ? 'text-indigo-400' : 'text-indigo-300'}`}>
                  {t('auth.personalInfo')}
                </span>
              </div>

              {/* Step 2 Circle */}
              <div className="flex flex-col items-center">
                <motionFramer.div 
                  animate={{ 
                    background: step === 2 
                      ? 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)' 
                      : (isLight ? '#f1f5f9' : '#111827'),
                    borderColor: step === 2 ? '#6366f1' : (isLight ? '#cbd5e1' : '#1f2937'),
                    color: step === 2 ? '#ffffff' : (isLight ? '#64748b' : '#ffffff'),
                    boxShadow: step === 2 ? '0 0 15px rgba(99,102,241,0.4)' : 'none'
                  }}
                  className="w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm"
                >
                  2
                </motionFramer.div>
                <span className={`text-xs font-bold mt-2 select-none ${step === 2 ? 'text-indigo-400' : (isLight ? 'text-slate-500' : 'text-gray-500')}`}>
                  {t('auth.credentials')}
                </span>
              </div>

            </div>
          </div>

          {/* Formik Setup */}
          <Formik
            initialValues={{ 
              fullName: '', 
              email: '', 
              phoneNumber: '', 
              password: '', 
              confirmPassword: '', 
              agreeToTerms: false 
            }}
            validationSchema={RegisterSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, validateForm, setFieldTouched, values, setFieldValue, errors, touched }) => (
              <Form className="w-full">
                
                {/* 3D Indigo Theme Card */}
                <motionFramer.div
                  layout
                  className={`p-5 md:p-6 rounded-3xl mb-4 flex flex-col relative overflow-hidden transition-all duration-500 text-start ${
                    isLight ? 'bg-white/90 border border-slate-200 shadow-xl text-slate-900' : 'card-3d-auth'
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {step === 1 ? (
                      <motionFramer.div
                        key="step-1"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Card Header inside Step */}
                        <div className="flex items-center gap-3 mb-6">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isLight ? 'bg-blue-50 border border-blue-200 text-blue-600' : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                          }`}>
                            <FiUser size={20} />
                          </div>
                          <h2 className={`font-bold text-lg md:text-xl ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {t('auth.personalInfo')}
                          </h2>
                        </div>

                        <Input
                          name="fullName"
                          type="text"
                          label={t('auth.fullNameLabel')}
                          placeholder={t('auth.fullNamePlaceholder')}
                          icon={FiUser}
                          roleColor={selectedRole}
                        />

                        <Input
                          name="email"
                          type="email"
                          label={t('auth.emailLabel')}
                          placeholder={t('auth.emailPlaceholder')}
                          icon={FiMail}
                          roleColor={selectedRole}
                        />

                        <Input
                          name="phoneNumber"
                          type="text"
                          label={t('auth.phoneLabel')}
                          placeholder="+962 77 123 4567"
                          icon={FiPhone}
                          roleColor={selectedRole}
                        />

                        <div className="mt-4">
                          <Button
                            type="button"
                            roleColor={selectedRole}
                            icon={FiArrowRight}
                            onClick={async () => {
                              setFieldTouched('fullName', true);
                              setFieldTouched('email', true);
                              const step1Errors = await validateForm();
                              if (!step1Errors.fullName && !step1Errors.email) {
                                setStep(2);
                              }
                            }}
                          >
                            {t('auth.continue')}
                          </Button>
                        </div>
                      </motionFramer.div>
                    ) : (
                      <motionFramer.div
                        key="step-2"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Card Header inside Step */}
                        <div className="flex items-center gap-3 mb-6">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isLight ? 'bg-indigo-50 border border-indigo-200 text-indigo-600' : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
                          }`}>
                            <FiLock size={20} />
                          </div>
                          <h2 className={`font-bold text-lg md:text-xl ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {t('auth.credentials')}
                          </h2>
                        </div>

                        <Input
                          name="password"
                          type="password"
                          label={t('auth.passwordLabel')}
                          placeholder={t('auth.passwordPlaceholder')}
                          icon={FiLock}
                          showPasswordToggle={true}
                          roleColor={selectedRole}
                        />

                        <Input
                          name="confirmPassword"
                          type="password"
                          label={t('auth.confirmPasswordLabel')}
                          placeholder="••••••••"
                          icon={FiLock}
                          showPasswordToggle={true}
                          roleColor={selectedRole}
                        />

                        {/* Custom Themed Terms of Service Checkbox */}
                        <div className="mb-6 flex flex-col">
                          <label className={`flex items-center gap-3 cursor-pointer text-xs md:text-sm select-none ${
                            isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-white'
                          }`}>
                            <div className="relative">
                              <input
                                type="checkbox"
                                name="agreeToTerms"
                                checked={values.agreeToTerms}
                                onChange={(e) => setFieldValue('agreeToTerms', e.target.checked)}
                                className={`w-5 h-5 rounded border focus:ring-0 focus:outline-none transition-colors duration-200 appearance-none flex items-center justify-center cursor-pointer ${
                                  isLight ? 'border-slate-300 bg-slate-100' : 'border-gray-700 bg-gray-900/60'
                                } checked:bg-${selectedRole === 'student' ? 'emerald' : selectedRole === 'teacher' ? 'blue' : 'purple'}-600`}
                              />
                              {values.agreeToTerms && (
                                <FiCheck className="absolute top-1 left-1 text-white pointer-events-none" size={12} />
                              )}
                            </div>
                            <span className="leading-tight">
                              {t('auth.agreeTerms')}
                            </span>
                          </label>
                          {touched.agreeToTerms && errors.agreeToTerms && (
                            <span className="text-red-400 text-xs font-bold mt-1">
                              {errors.agreeToTerms}
                            </span>
                          )}
                        </div>

                        <Button
                          type="submit"
                          disabled={isSubmitting || !values.agreeToTerms}
                          roleColor={selectedRole}
                          icon={FiUserCheck}
                        >
                          {isSubmitting ? t('common.loading') : t('auth.submitRegister')}
                        </Button>
                      </motionFramer.div>
                    )}
                  </AnimatePresence>

                </motionFramer.div>
              </Form>
            )}
          </Formik>

          {/* Sign In Link */}
          <div className="text-center mt-4">
            <p className={`text-xs md:text-sm font-semibold tracking-wide select-none ${isLight ? 'text-slate-600' : 'text-gray-500'}`}>
              {t('auth.alreadyHaveAccount')}{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-indigo-500 hover:text-indigo-600 font-bold transition-colors cursor-pointer outline-none focus:outline-none"
              >
                {t('nav.signIn')}
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
