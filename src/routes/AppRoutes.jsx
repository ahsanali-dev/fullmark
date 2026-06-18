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

import StudentDashboard from '../pages/student/StudentDashboard';
import StudentCourses from '../pages/student/Courses';
import StudentCourseDetails from '../pages/student/CourseDetails';
import StudentCourseLessons from '../pages/student/CourseLessons';
import StudentLessonPlayer from '../pages/student/LessonPlayer';
import StudentExams from '../pages/student/Exams';
import StudentTakeExam from '../pages/student/TakeExam';
import StudentResults from '../pages/student/Results';
import StudentResultDetails from '../pages/student/ResultDetails';
import StudentProfile from '../pages/student/Profile';

import ParentDashboard from '../pages/parent/Dashboard';
import ParentChildren from '../pages/parent/Children';
import ParentAnalysis from '../pages/parent/Analysis';
import ParentReports from '../pages/parent/Reports';
import ParentSettings from '../pages/parent/Settings';

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
    path: '/student/dashboard',
    element: <StudentDashboard />,
  },
  {
    path: '/student/courses',
    element: <StudentCourses />,
  },
  {
    path: '/student/courses/:courseId',
    element: <StudentCourseDetails />,
  },
  {
    path: '/student/courses/:courseId/lessons',
    element: <StudentCourseLessons />,
  },
  {
    path: '/student/courses/:courseId/lessons/:lessonId',
    element: <StudentLessonPlayer />,
  },
  {
    path: '/student/exams',
    element: <StudentExams />,
  },
  {
    path: '/student/exams/:examId',
    element: <StudentTakeExam />,
  },
  {
    path: '/student/results',
    element: <StudentResults />,
  },
  {
    path: '/student/results/:attemptId',
    element: <StudentResultDetails />,
  },
  {
    path: '/student/profile',
    element: <StudentProfile />,
  },
  {
    path: '/parent/dashboard',
    element: <ParentDashboard />,
  },
  {
    path: '/parent/children',
    element: <ParentChildren />,
  },
  {
    path: '/parent/attendance',
    element: <ParentAnalysis />,
  },
  {
    path: '/parent/reports',
    element: <ParentReports />,
  },
  {
    path: '/parent/settings',
    element: <ParentSettings />,
  },
  {
    path: '/student',
    element: <Navigate to="/student/dashboard" replace />,
  },
  {
    path: '/parent',
    element: <Navigate to="/parent/dashboard" replace />,
  },
  {
    path: '/teacher',
    element: <Navigate to="/teacher/dashboard" replace />,
  },
  {
    path: '/admin',
    element: <Navigate to="/admin/dashboard" replace />,
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);

const AppRoutes = () => {
  return <RouterProvider router={router} />;
};

export default AppRoutes;
