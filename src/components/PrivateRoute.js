import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  // Get token and role from localStorage
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // Log the current state for debugging
  console.log("🔐 User Private Route Access: Stored Token =", token, "Role =", role);

  // Check if the user is authenticated and has the correct role
  const isAuthenticated = token && role === 'user';

  if (!isAuthenticated) {
    console.log("❌ Authentication failed: No token or incorrect role. Redirecting to /login...");
    return <Navigate to="/login" replace />;
  }

  console.log("✅ User authenticated with correct role. Rendering protected route...");
  return <Outlet />;
};

export default PrivateRoute;