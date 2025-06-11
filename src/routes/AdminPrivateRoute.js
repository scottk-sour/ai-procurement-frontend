// src/routes/AdminPrivateRoute.js
import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const AdminPrivateRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      // Get admin token from localStorage
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/auth/admin-verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsAuthenticated(res.ok); // True if 2xx
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    // Loading state
    return <div className="loading-spinner">Loading Admin Dashboard...</div>;
  }

  // Authenticated: render nested routes. Not: redirect to /admin-login.
  return isAuthenticated ? <Outlet /> : <Navigate to="/admin-login" replace />;
};

export default AdminPrivateRoute;
