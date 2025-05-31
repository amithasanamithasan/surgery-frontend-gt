import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, requiredRoles }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  const userStatus = localStorage.getItem('user_status');
  const userRole = parseInt(localStorage.getItem('role'), 10);

  if (!isAuthenticated || userStatus === '0') {
    return <Navigate to="/" />;
  }

  if (requiredRoles && !requiredRoles.includes(userRole)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default PrivateRoute;
