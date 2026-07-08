import React from 'react';
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

const VerifyOtpSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email address is required'),
  code: Yup.string()
    .length(6, 'Verification code must be exactly 6 characters')
    .required('Verification code is required'),
});

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Try to retrieve email from route state (e.g. from register redirection)
  const initialEmail = location.state?.email || '';

  const handleSubmit = async (values, { setSubmitting }) => {
    const payload = {
      email: values.email,
      code: values.code,
    };

    const loadToast = toast.loading('Verifying code...');
    try {
      const data = await dispatch(verifyOtp(payload)).unwrap();
      toast.dismiss(loadToast);
      toast.success('Email verified successfully! Logging you in...');
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
      toast.error(err || 'Verification failed. Please check the code.');
      setSubmitting(false);
    }
  };

  const handleResend = async (email, setSubmitting) => {
    if (!email) {
      toast.error('Please enter your email address first.');
      return;
    }

    const loadToast = toast.loading('Resending verification code...');
    try {
      await dispatch(resendOtp({ email })).unwrap();
      toast.dismiss(loadToast);
      toast.success('A new verification code has been sent!');
    } catch (err) {
      toast.dismiss(loadToast);
      toast.error(err || 'Failed to resend verification code.');
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden select-none z-0">
      {/* Background Starry Nebula Layer */}
      <Background3D roleColor="auth" />

      {/* Centered Form Container */}
      <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 relative z-10">
        <div className="w-full max-w-lg z-20 flex flex-col justify-center">
          
          {/* Header with Back button */}
          <div className="flex items-center mb-6">
            <motionFramer.button 
              type="button"
              onClick={() => navigate('/login')}
              whileHover={{ scale: 1.05, borderColor: 'rgba(255,255,255,0.2)' }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-xl border border-gray-800 flex items-center justify-center text-white bg-gray-950/40 hover:bg-gray-800/60 transition-colors cursor-pointer"
            >
              <FiArrowLeft size={20} />
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
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2 leading-tight">
              Verify Your Email
            </h1>
            <p className="text-gray-400 text-sm md:text-base font-semibold tracking-wide px-4">
              Enter the 6-digit verification code sent to your inbox
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
                <div className="p-5 md:p-6 rounded-3xl mb-4 flex flex-col card-3d-auth">
                  <Input
                    name="email"
                    type="email"
                    label="Email Address"
                    placeholder="example@email.com"
                    icon={FiMail}
                    roleColor="auth"
                    disabled={!!initialEmail}
                  />

                  <Input
                    name="code"
                    type="text"
                    label="Verification Code"
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
                      {isSubmitting ? 'Verifying...' : 'Verify Code'}
                    </Button>

                    <button
                      type="button"
                      onClick={() => handleResend(values.email)}
                      className="w-full py-3.5 rounded-2xl border border-gray-800 text-gray-400 hover:text-white font-bold text-sm bg-transparent hover:bg-gray-950/20 active:scale-95 transition-all cursor-pointer"
                    >
                      Resend Verification Code
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
