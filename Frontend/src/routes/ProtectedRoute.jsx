// This component acts as a guard for our routes. It checks if a user
// is authenticated and has the required role before rendering the page.

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();

  // 1. If user is not logged in, redirect to the login page.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. If user is logged in but their role is not in the allowedRoles array,
  //    redirect them to a default page (or a "Not Authorized" page).
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If an agent tries to access an admin page, send them to their dashboard.
    // If an admin tries to access an agent page, send them to theirs.
    return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
  }

  // 3. If everything is fine, render the actual page component.
  //    <Outlet /> is a placeholder provided by React Router.
  return <Outlet />;
};

export default ProtectedRoute;