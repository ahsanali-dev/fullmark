import * as Yup from 'yup';

// Admin profile edit schema
export const EditProfileSchema = Yup.object().shape({
  name: Yup.string().required('Full Name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phone: Yup.string().required('Phone number is required'),
});

// Teacher profile edit schema (has bio, no email)
export const TeacherProfileSchema = Yup.object().shape({
  name: Yup.string().required('Full Name is required'),
  phone: Yup.string().nullable(),
  bio: Yup.string().max(200, 'Bio must be less than 200 characters').nullable(),
});

// Shared Change Password schema — used in both Admin & Teacher Settings
export const ChangePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

// User creation schema (Admin)
export const UserSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, 'Name must be at least 3 characters')
    .required('Full Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email Address is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  role: Yup.string()
    .oneOf(['Student', 'Teacher', 'Parent'], 'Invalid role')
    .required('Role selection is required'),
});
