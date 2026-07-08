import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);

  if (isAuthenticated && token && user) {
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'teacher':
        return <Navigate to="/teacher/dashboard" replace />;
      case 'student':
        return <Navigate to="/student/dashboard" replace />;
      case 'parent':
        return <Navigate to="/parent/dashboard" replace />;
      default:
        return children ? children : <Outlet />;
    }
  }

  return children ? children : <Outlet />;
};

export default PublicRoute;
