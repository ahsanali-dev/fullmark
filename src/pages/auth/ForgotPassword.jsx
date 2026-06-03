import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { motion as motionFramer } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiArrowLeft, FiSend } from 'react-icons/fi';

import toast from 'react-hot-toast';

import Background3D from '../../components/shared/Background3D';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email address is required'),
});

const ForgotPassword = () => {
  const navigate = useNavigate();

  const handleSubmit = (values, { setSubmitting }) => {
    console.log('--- Forgot Password Request ---');
    console.log('Email Address:', values.email);
    
    setTimeout(() => {
      toast.success(`Reset link sent successfully to ${values.email}!`);
      setSubmitting(false);
      navigate('/login');
    }, 1000);
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
              className="w-20 h-20 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_40px_rgba(168,85,247,0.25)]"
            >
              <FiLock size={32} />
            </motionFramer.div>
          </div>

          {/* Page Titles */}
          <div className="flex flex-col items-center mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2 leading-tight">
              Forgot Password?
            </h1>
            <p className="text-gray-400 text-sm md:text-base font-semibold tracking-wide px-4">
              Enter your email and we'll send you a reset code
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
                <div className="p-5 md:p-6 rounded-3xl mb-4 flex flex-col card-3d-auth">
                  <Input
                    name="email"
                    type="email"
                    label="Email Address"
                    placeholder="example@email.com"
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
                      {isSubmitting ? 'Sending...' : 'Send Reset Code'}
                    </Button>
                  </div>
                </div>

              </Form>
            )}
          </Formik>

          {/* Secondary steps walkthrough card */}
          <div className="p-5 md:p-6 rounded-3xl flex flex-col gap-5 card-3d-auth bg-opacity-40">
            {/* Step 1 */}
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-[0_0_10px_rgba(168,85,247,0.4)] flex-shrink-0">
                1
              </div>
              <p className="text-gray-300 text-xs md:text-sm font-semibold tracking-wide">
                Enter your registered email
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-[0_0_10px_rgba(59,130,246,0.4)] flex-shrink-0">
                2
              </div>
              <p className="text-gray-300 text-xs md:text-sm font-semibold tracking-wide">
                Check your inbox for the reset code
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shadow-[0_0_10px_rgba(16,185,129,0.4)] flex-shrink-0">
                3
              </div>
              <p className="text-gray-300 text-xs md:text-sm font-semibold tracking-wide">
                Create a new strong password
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
