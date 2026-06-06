import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Landing from '../pages/Landing';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Dashboard from '../pages/admin/Dashboard';
import Users from '../pages/admin/Users';
import Content from '../pages/admin/Content';
import Reports from '../pages/admin/Reports';
import Settings from '../pages/admin/Settings';

import TeacherDashboard from '../pages/teacher/Dashboard';
import TeacherSubjects from '../pages/teacher/Subjects';
import TeacherQuestions from '../pages/teacher/Questions';
import TeacherExams from '../pages/teacher/Exams';
import TeacherSettings from '../pages/teacher/Settings';
import TeacherAddQuestion from '../pages/teacher/AddQuestion';
import TeacherSubjectDetails from '../pages/teacher/SubjectDetails';
import TeacherEditQuestion from '../pages/teacher/EditQuestion';
import TeacherCreateExam from '../pages/teacher/CreateExam';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/admin/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/admin/users',
    element: <Users />,
  },
  {
    path: '/admin/content',
    element: <Content />,
  },
  {
    path: '/admin/reports',
    element: <Reports />,
  },
  {
    path: '/admin/settings',
    element: <Settings />,
  },
  {
    path: '/teacher/dashboard',
    element: <TeacherDashboard />,
  },
  {
    path: '/teacher/subjects',
    element: <TeacherSubjects />,
  },
  {
    path: '/teacher/subjects/:subjectId',
    element: <TeacherSubjectDetails />,
  },
  {
    path: '/teacher/subjects/:subjectId/add-question',
    element: <TeacherAddQuestion />,
  },
  {
    path: '/teacher/subjects/select/add-question',
    element: <TeacherAddQuestion />,
  },
  {
    path: '/teacher/subjects/:subjectId/edit-question/:questionId',
    element: <TeacherEditQuestion />,
  },
  {
    path: '/teacher/subjects/:subjectId/create-exam',
    element: <TeacherCreateExam />,
  },
  {
    path: '/teacher/questions',
    element: <TeacherQuestions />,
  },
  {
    path: '/teacher/exams',
    element: <TeacherExams />,
  },
  {
    path: '/teacher/settings',
    element: <TeacherSettings />,
  },
  {
    path: '/teacher',
    element: <Navigate to="/teacher/dashboard" replace />,
  },
  {
    path: '/admin',
    element: <Navigate to="/admin/dashboard" replace />,
  },
  // {
  //   path: '/',
  //   element: <Navigate to="/login" replace />,
  // },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);

const AppRoutes = () => {
  return <RouterProvider router={router} />;
};

export default AppRoutes;
