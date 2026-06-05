// Central export point for all shared schemas
export { QuestionSchema } from './questionSchema';
export { ExamSchema } from './examSchema';
export { SubjectSchema as AdminSubjectSchema, UserSchema } from './adminSchemas';
export { SubjectSchema } from './subjectSchema';
export {
  EditProfileSchema,
  TeacherProfileSchema,
  ChangePasswordSchema,
} from './authSchemas';
