import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Dashboard from '../pages/admin/Dashboard';
import Users from '../pages/admin/Users';
import Content from '../pages/admin/Content';
import Reports from '../pages/admin/Reports';
import Settings from '../pages/admin/Settings';

const router = createBrowserRouter([
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
    path: '/admin',
    element: <Navigate to="/admin/dashboard" replace />,
  },
  {
    path: '/',
    element: <Navigate to="/login" replace />,
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
