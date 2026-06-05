import * as Yup from 'yup';

export const QuestionSchema = Yup.object().shape({
  subjectId: Yup.string().required('Please select a subject'),
  text: Yup.string()
    .min(5, 'Question must be at least 5 characters')
    .required('Question text is required'),
  optionA: Yup.string().required('Option A is required'),
  optionB: Yup.string().required('Option B is required'),
  optionC: Yup.string().required('Option C is required'),
  optionD: Yup.string().required('Option D is required'),
  correctOption: Yup.string()
    .oneOf(['A', 'B', 'C', 'D'], 'Invalid correct option')
    .required('Correct option is required'),
});
