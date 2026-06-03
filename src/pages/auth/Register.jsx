import React, { useState } from 'react';
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

import Background3D from '../../components/shared/Background3D';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

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
  const navigate = useNavigate();

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      navigate('/login');
    }
  };

  const handleSubmit = (values, { setSubmitting }) => {
    const payload = {
      fullName: values.fullName,
      email: values.email,
      phoneNumber: values.phoneNumber,
      password: values.password,
      role: 'student', // default registration role
    };
    
    console.log('--- Register Form Submission Success ---');
    console.log('Registered User Data:', payload);
    
    setTimeout(() => {
      toast.success(`Account created successfully for ${values.fullName}!`);
      setSubmitting(false);
      navigate('/login');
    }, 1000);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden select-none z-0">
      {/* Background Starry Layer (Uses Indigo 'auth' theme colors) */}
      <Background3D roleColor="auth" />

      {/* Centered Form Container */}
      <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 relative z-10">
        <div className="w-full max-w-lg z-20 flex flex-col justify-center">
          
          {/* Header Layout */}
          <div className="flex items-center gap-5 mb-8">
            <motionFramer.button 
              type="button"
              onClick={handleBack}
              whileHover={{ scale: 1.05, borderColor: 'rgba(255,255,255,0.2)' }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-xl border border-gray-800 flex items-center justify-center text-white bg-gray-950/40 hover:bg-gray-800/60 transition-colors cursor-pointer"
            >
              <FiArrowLeft size={20} />
            </motionFramer.button>

            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-none mb-1">
                Create Account
              </h1>
              <p className="text-gray-400 text-sm md:text-base font-semibold tracking-wide">
                Join the FullMark universe
              </p>
            </div>
          </div>

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
                  Personal Info
                </span>
              </div>

              {/* Step 2 Circle */}
              <div className="flex flex-col items-center">
                <motionFramer.div 
                  animate={{ 
                    background: step === 2 
                      ? 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)' 
                      : '#111827',
                    borderColor: step === 2 ? '#6366f1' : '#1f2937',
                    boxShadow: step === 2 ? '0 0 15px rgba(99,102,241,0.4)' : 'none'
                  }}
                  className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-white font-bold text-sm"
                >
                  2
                </motionFramer.div>
                <span className={`text-xs font-bold mt-2 select-none ${step === 2 ? 'text-indigo-300' : 'text-gray-500'}`}>
                  Credentials
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
                  className="p-5 md:p-6 rounded-3xl mb-4 flex flex-col relative overflow-hidden transition-all duration-500 card-3d-auth"
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
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                            <FiUser size={20} />
                          </div>
                          <h2 className="text-white font-bold text-lg md:text-xl">Personal Info</h2>
                        </div>

                        <Input
                          name="fullName"
                          type="text"
                          label="Full Name"
                          placeholder="Ahmad Al-Khalidi"
                          icon={FiUser}
                          roleColor="auth"
                        />

                        <Input
                          name="email"
                          type="email"
                          label="Email Address"
                          placeholder="example@email.com"
                          icon={FiMail}
                          roleColor="auth"
                        />

                        <Input
                          name="phoneNumber"
                          type="text"
                          label="Phone Number (optional)"
                          placeholder="+962 77 123 4567"
                          icon={FiPhone}
                          roleColor="auth"
                        />

                        <div className="mt-4">
                          <Button
                            type="button"
                            roleColor="auth"
                            icon={FiArrowRight}
                            onClick={async () => {
                              // Touch fields to reveal any initial errors
                              setFieldTouched('fullName', true);
                              setFieldTouched('email', true);
                              const step1Errors = await validateForm();
                              if (!step1Errors.fullName && !step1Errors.email) {
                                setStep(2);
                              }
                            }}
                          >
                            Continue
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
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <FiLock size={20} />
                          </div>
                          <h2 className="text-white font-bold text-lg md:text-xl">Credentials</h2>
                        </div>

                        <Input
                          name="password"
                          type="password"
                          label="Password"
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

                        {/* Custom Themed Terms of Service Checkbox */}
                        <div className="mb-6 pl-1 flex flex-col">
                          <label className="flex items-center gap-3 cursor-pointer text-gray-400 hover:text-white text-xs md:text-sm select-none">
                            <div className="relative">
                              <input
                                type="checkbox"
                                name="agreeToTerms"
                                checked={values.agreeToTerms}
                                onChange={(e) => setFieldValue('agreeToTerms', e.target.checked)}
                                className="w-5 h-5 rounded border border-gray-700 bg-gray-900/60 focus:ring-0 focus:outline-none transition-colors duration-200 appearance-none flex items-center justify-center cursor-pointer checked:bg-indigo-600 checked:border-indigo-500"
                              />
                              {values.agreeToTerms && (
                                <FiCheck className="absolute top-1 left-1 text-white pointer-events-none" size={12} />
                              )}
                            </div>
                            <span className="leading-tight">
                              I agree to the <a href="#terms" className="text-indigo-400 hover:underline font-bold">Terms of Service</a> and <a href="#privacy" className="text-indigo-400 hover:underline font-bold">Privacy Policy</a>
                            </span>
                          </label>
                          {touched.agreeToTerms && errors.agreeToTerms && (
                            <span className="text-red-400 text-xs font-bold mt-1 ml-8">
                              {errors.agreeToTerms}
                            </span>
                          )}
                        </div>

                        <Button
                          type="submit"
                          disabled={isSubmitting || !values.agreeToTerms}
                          roleColor="auth"
                          icon={FiUserCheck}
                        >
                          {isSubmitting ? 'Creating Account...' : 'Create Account'}
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
            <p className="text-gray-500 text-xs md:text-sm font-semibold tracking-wide select-none">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors cursor-pointer outline-none focus:outline-none"
              >
                Sign In
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
