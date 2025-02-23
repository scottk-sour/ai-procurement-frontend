import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  // Check for authentication; adjust this logic as needed.
  const isAuthenticated = Boolean(localStorage.getItem('token'));

  // If the user is authenticated, render the child routes (via <Outlet />)
  // Otherwise, navigate to the login page.
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
