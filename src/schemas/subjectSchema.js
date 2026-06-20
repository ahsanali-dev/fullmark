import * as Yup from 'yup';

export const SubjectSchema = Yup.object().shape({
  title: Yup.string()
    .min(2, 'Title must be at least 2 characters')
    .required('Subject Title is required'),
  description: Yup.string()
    .min(5, 'Description must be at least 5 characters')
    .required('Description is required'),
  teacher: Yup.string().required('Please assign a teacher'),
  price: Yup.number()
    .min(0, 'Price must be 0 or greater')
    .required('Price is required'),
});
