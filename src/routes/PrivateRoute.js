// src/routes/PrivateRoute.js
import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      let token = localStorage.getItem('userToken');
      console.log("🔐 User Private Route Access: Stored Token from localStorage =", token, "Expected Token =", localStorage.getItem('userToken'));
      if (!token) {
        console.log("❌ No userToken found, redirecting to login...");
        setIsAuthenticated(false);
        return;
      }

      // Clear any cached or outdated tokens in localStorage if mismatched
      const expectedToken = localStorage.getItem('userToken');
      if (token !== expectedToken) {
        console.log("⚠ Token mismatch detected, updating to expected token...");
        token = expectedToken;
        localStorage.setItem('userToken', token); // Ensure consistency
      }

      try {
        const res = await fetch('http://localhost:5000/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("API Response Status (User):", res.status, "OK:", res.ok, "Response:", await res.text());
        setIsAuthenticated(res.ok); // True if status is 200-299
      } catch (error) {
        console.error('User Token verification failed:', error.message, "Stack:", error.stack);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    console.log("Rendering loading state for User PrivateRoute...");
    return <div className="loading-spinner">Loading User Dashboard...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;