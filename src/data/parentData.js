// -----------------------------------------------
// PARENT MOCK DATA
// -----------------------------------------------

export const getStoredChildren = () => {
  const stored = localStorage.getItem('parent_children');
  if (stored) return JSON.parse(stored);
  const initial = [
    {
      id: 'child-1',
      name: 'ali',
      initials: 'AL',
      linkCode: 'FM-ALI001',
      streak: 8,
      points: 40,
      courses: ['chemistry'],
      exams: [
        {
          id: 'e1',
          name: 'exam 2',
          subject: 'chemistry',
          date: 'Jun 14, 2026',
          score: 100,
          totalQuestions: 2,
          correctAnswers: 2,
          duration: 0,
          status: 'Passed',
        },
        {
          id: 'e2',
          name: 'chemistry test 1',
          subject: 'chemistry',
          date: 'Jun 14, 2026',
          score: 50,
          totalQuestions: 2,
          correctAnswers: 1,
          duration: 0,
          status: 'Failed',
        },
        {
          id: 'e3',
          name: 'exam 2',
          subject: 'chemistry',
          date: 'Jun 14, 2026',
          score: 50,
          totalQuestions: 2,
          correctAnswers: 1,
          duration: 0,
          status: 'Failed',
        },
      ],
      subjects: [
        {
          name: 'chemistry',
          examScores: [50, 50, 100],   // individual exam scores
          avgScore: 67,
          improvement: 50,
        },
      ],
    },
    {
      id: 'child-2',
      name: 'zohan',
      initials: 'ZO',
      linkCode: 'FM-ZOH002',
      streak: 0,
      points: 0,
      courses: [],
      exams: [],
      subjects: [],
    },
  ];
  localStorage.setItem('parent_children', JSON.stringify(initial));
  return initial;
};

export const setStoredChildren = (children) => {
  localStorage.setItem('parent_children', JSON.stringify(children));
  window.dispatchEvent(new Event('storage'));
};

export const getStoredParentProfile = () => {
  const stored = localStorage.getItem('parent_profile');
  if (stored) return JSON.parse(stored);
  const initial = {
    name: 'ali faraz',
    email: 'alifaraz933@gmail.com',
    phone: '',
    initials: 'AF',
  };
  localStorage.setItem('parent_profile', JSON.stringify(initial));
  return initial;
};

export const setStoredParentProfile = (profile) => {
  localStorage.setItem('parent_profile', JSON.stringify(profile));
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new Event('profileUpdate'));
};
