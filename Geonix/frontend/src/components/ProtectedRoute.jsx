import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  // If not logged in, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If role is specified and doesn't match, redirect to appropriate dashboard
  if (requiredRole && userRole !== requiredRole) {
    if (userRole === 'hr') {
      return <Navigate to="/hr" replace />;
    } else if (userRole === 'employee') {
      return <Navigate to="/employee" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
}
