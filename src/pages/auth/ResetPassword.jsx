import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { motion as motionFramer } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiShield, FiLock, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { resetPassword } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';

import Background3D from '../../components/shared/Background3D';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ResetPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email address is required'),
  code: Yup.string()
    .length(6, 'Verification code must be exactly 6 characters')
    .required('Verification code is required'),
  newPassword: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('New Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Confirm Password is required'),
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Try to retrieve email from route state (e.g. from forgot password redirection)
  const initialEmail = location.state?.email || '';

  const handleSubmit = async (values, { setSubmitting }) => {
    const payload = {
      email: values.email,
      code: values.code,
      newPassword: values.newPassword,
    };

    try {
      await dispatch(resetPassword(payload)).unwrap();
      toast.success('Password reset successfully! Please sign in with your new password.');
      setSubmitting(false);
      navigate('/login');
    } catch (err) {
      toast.error(err || 'Failed to reset password. Please check your code.');
      setSubmitting(false);
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
              className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-[0_0_40px_rgba(239,68,68,0.25)]"
            >
              <FiLock size={32} />
            </motionFramer.div>
          </div>

          {/* Page Titles */}
          <div className="flex flex-col items-center mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2 leading-tight">
              Reset Your Password
            </h1>
            <p className="text-gray-400 text-sm md:text-base font-semibold tracking-wide px-4">
              Enter the reset code sent to your email and choose a new password
            </p>
          </div>

          {/* Main Formik card */}
          <Formik
            initialValues={{ email: initialEmail, code: '', newPassword: '', confirmPassword: '' }}
            validationSchema={ResetPasswordSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting }) => (
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
                    label="Reset Code"
                    placeholder="123456"
                    icon={FiShield}
                    roleColor="auth"
                  />

                  <Input
                    name="newPassword"
                    type="password"
                    label="New Password"
                    placeholder="••••••••"
                    icon={FiLock}
                    showPasswordToggle={true}
                    roleColor="auth"
                  />

                  <Input
                    name="confirmPassword"
                    type="password"
                    label="Confirm Password"
                    placeholder="••••••••"
                    icon={FiLock}
                    showPasswordToggle={true}
                    roleColor="auth"
                  />

                  <div className="mt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      roleColor="auth"
                      icon={FiCheck}
                    >
                      {isSubmitting ? 'Resetting...' : 'Reset Password'}
                    </Button>
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

export default ResetPassword;
