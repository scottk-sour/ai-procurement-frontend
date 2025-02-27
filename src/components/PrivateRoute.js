// File: src/routes/PrivateRoute.js
import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * PrivateRoute component
 * - Verifies an authentication token (userToken) from localStorage against the server.
 * - Displays a loading indicator during verification.
 * - If authenticated, renders child routes via <Outlet />.
 * - Otherwise, redirects to the login page.
 */
const PrivateRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('userToken'); // Updated to use userToken
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsAuthenticated(res.ok); // True if status is 200-299
      } catch (error) {
        console.error('Token verification failed:', error.message);
        setIsAuthenticated(false); // Fail safely on network/auth errors
      }
    };

    checkAuth();

    // No cleanup needed since this runs once on mount
  }, []); // Empty dependency array ensures it runs only on mount

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  // Render child routes if authenticated, redirect to login if not
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;