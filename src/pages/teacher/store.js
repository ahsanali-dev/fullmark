export const getStoredSubjects = () => {
  const data = localStorage.getItem('teacher_subjects');
  if (data) return JSON.parse(data);
  const initial = [
    { id: 'sub-test-2', title: 'test 2', description: 'Advanced logic and reasoning systems', questionsCount: 0, studentsCount: 0, examsCount: 0 },
    { id: 'sub-test', title: 'test', description: 'Core diagnostics and introductory syllabus', questionsCount: 0, studentsCount: 0, examsCount: 0 }
  ];
  localStorage.setItem('teacher_subjects', JSON.stringify(initial));
  return initial;
};

export const setStoredSubjects = (subjects) => {
  localStorage.setItem('teacher_subjects', JSON.stringify(subjects));
  window.dispatchEvent(new Event('storage'));
};

export const getStoredQuestions = () => {
  const data = localStorage.getItem('teacher_questions');
  if (data) return JSON.parse(data);
  const initial = [
    { id: 'q-1', subjectId: 'sub-test-2', text: 'What is the correct syntax for declaring a state hook in React?', optionA: 'const [state, setState] = useState(initial)', optionB: 'const state = useState(initial)', optionC: 'const {state, setState} = state()', optionD: 'const state = setState(initial)', correctOption: 'A' },
    { id: 'q-2', subjectId: 'sub-test', text: 'Which HTML element is used to insert a line break?', optionA: '<lb>', optionB: '<br>', optionC: '<break>', optionD: '<newline>', correctOption: 'B' }
  ];
  localStorage.setItem('teacher_questions', JSON.stringify(initial));
  return initial;
};

export const setStoredQuestions = (questions) => {
  localStorage.setItem('teacher_questions', JSON.stringify(questions));
  window.dispatchEvent(new Event('storage'));
};

export const getStoredExams = () => {
  const data = localStorage.getItem('teacher_exams');
  if (data) return JSON.parse(data);
  const initial = [
    { id: 'ex-1', title: 'Midterm Assessment 1', subjectId: 'sub-test-2', duration: 45, date: '2026-06-15', questionsCount: 10, status: 'upcoming' }
  ];
  localStorage.setItem('teacher_exams', JSON.stringify(initial));
  return initial;
};

export const setStoredExams = (exams) => {
  localStorage.setItem('teacher_exams', JSON.stringify(exams));
  window.dispatchEvent(new Event('storage'));
};

export const getStoredProfile = () => {
  const data = localStorage.getItem('teacher_profile');
  if (data) return JSON.parse(data);
  const initial = {
    name: 'Ahsan Ali',
    email: 'ahsandev987@gmail.com',
    phone: '',
    bio: '',
    avatarText: 'AA'
  };
  localStorage.setItem('teacher_profile', JSON.stringify(initial));
  return initial;
};

export const setStoredProfile = (profile) => {
  localStorage.setItem('teacher_profile', JSON.stringify(profile));
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new Event('profileUpdate'));
};

export const getStoredLessons = () => {
  const data = localStorage.getItem('teacher_lessons');
  if (data) return JSON.parse(data);
  const initial = [];
  localStorage.setItem('teacher_lessons', JSON.stringify(initial));
  return initial;
};

export const setStoredLessons = (lessons) => {
  localStorage.setItem('teacher_lessons', JSON.stringify(lessons));
  window.dispatchEvent(new Event('storage'));
};
