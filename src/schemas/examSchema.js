import * as Yup from 'yup';

export const ExamSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, 'Title must be at least 3 characters')
    .required('Exam title is required'),
  subjectId: Yup.string().required('Please select a subject'),
  duration: Yup.number()
    .positive('Duration must be positive')
    .required('Duration in minutes is required'),
  date: Yup.string().required('Exam date is required'),
  questionsCount: Yup.number()
    .min(1, 'Select at least 1 question')
    .required('Number of questions is required'),
});
