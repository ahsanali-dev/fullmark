export const defaultResultsData = [
  {
    attemptId: 'attempt-mock-1',
    id: 'exam-2',
    name: 'exam 2',
    subject: 'chemistry',
    score: 100,
    status: 'Passed',
    date: 'Jun 14, 2026',
    timeSpentSeconds: 10,
    selectedAnswers: { 0: 'A', 1: 'C' },
    questions: [
      {
        id: 'e2-q1',
        text: 'hdjdjdjdjd',
        difficulty: 'Easy',
        options: [
          { key: 'A', text: 'g' },
          { key: 'B', text: 'g' },
          { key: 'C', text: 'y' },
          { key: 'D', text: 'h' }
        ],
        correctOption: 'A'
      },
      {
        id: 'e2-q2',
        text: 'fghh',
        difficulty: 'Easy',
        image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop&q=60',
        options: [
          { key: 'A', text: 'fgh', image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&auto=format&fit=crop&q=60' },
          { key: 'B', text: 'fgh', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&auto=format&fit=crop&q=60' },
          { key: 'C', text: 'ffg', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&auto=format&fit=crop&q=60' },
          { key: 'D', text: 'fgg' }
        ],
        correctOption: 'C'
      }
    ]
  },
  {
    attemptId: 'attempt-mock-2',
    id: 'chem-test-1',
    name: 'chemistry test 1',
    subject: 'chemistry',
    score: 50,
    status: 'Failed',
    date: 'Jun 14, 2026',
    timeSpentSeconds: 11,
    selectedAnswers: { 0: 'A', 1: 'B' },
    questions: [
      {
        id: 'ct1-q1',
        text: 'What is the chemical symbol for gold?',
        difficulty: 'Easy',
        options: [
          { key: 'A', text: 'Au' },
          { key: 'B', text: 'Ag' },
          { key: 'C', text: 'Fe' },
          { key: 'D', text: 'Pb' }
        ],
        correctOption: 'A'
      },
      {
        id: 'ct1-q2',
        text: 'What is the atomic number of Hydrogen?',
        difficulty: 'Easy',
        options: [
          { key: 'A', text: '1' },
          { key: 'B', text: '2' },
          { key: 'C', text: '3' },
          { key: 'D', text: '4' }
        ],
        correctOption: 'A'
      }
    ]
  },
  {
    attemptId: 'attempt-mock-3',
    id: 'exam-2',
    name: 'exam 2',
    subject: 'chemistry',
    score: 50,
    status: 'Failed',
    date: 'Jun 14, 2026',
    timeSpentSeconds: 15,
    selectedAnswers: { 0: 'B', 1: 'C' },
    questions: [
      {
        id: 'e2-q1',
        text: 'hdjdjdjdjd',
        difficulty: 'Easy',
        options: [
          { key: 'A', text: 'g' },
          { key: 'B', text: 'g' },
          { key: 'C', text: 'y' },
          { key: 'D', text: 'h' }
        ],
        correctOption: 'A'
      },
      {
        id: 'e2-q2',
        text: 'fghh',
        difficulty: 'Easy',
        image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop&q=60',
        options: [
          { key: 'A', text: 'fgh', image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&auto=format&fit=crop&q=60' },
          { key: 'B', text: 'fgh', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&auto=format&fit=crop&q=60' },
          { key: 'C', text: 'ffg', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&auto=format&fit=crop&q=60' },
          { key: 'D', text: 'fgg' }
        ],
        correctOption: 'C'
      }
    ]
  }
];
