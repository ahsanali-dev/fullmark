import * as Yup from 'yup';

// Used in Admin Dashboard → Add User Modal
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

// Used in Admin Dashboard → Add Subject Modal & Admin Content → Add/Edit Subject Modal
export const SubjectSchema = Yup.object().shape({
  title: Yup.string()
    .min(2, 'Title must be at least 2 characters')
    .required('Subject Title is required'),
  description: Yup.string()
    .min(5, 'Description must be at least 5 characters')
    .required('Description is required'),
  teacher: Yup.string().required('Please assign a teacher'),
});
