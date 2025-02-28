// src/routes/AdminPrivateRoute.js
import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminPrivateRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      let token = localStorage.getItem('adminToken');
      console.log("🔐 Admin Private Route Access: Stored Token from localStorage =", token, "Expected Token =", localStorage.getItem('adminToken'));
      if (!token) {
        console.log("❌ No adminToken found, redirecting to admin-login...");
        setIsAuthenticated(false);
        return;
      }

      // Clear any cached or outdated tokens in localStorage if mismatched
      const expectedToken = localStorage.getItem('adminToken');
      if (token !== expectedToken) {
        console.log("⚠ Token mismatch detected, updating to expected token...");
        token = expectedToken;
        localStorage.setItem('adminToken', token); // Ensure consistency
      }

      try {
        const res = await fetch('http://localhost:5000/api/auth/admin-verify', { // Adjust endpoint as needed
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("API Response Status (Admin):", res.status, "OK:", res.ok, "Response:", await res.text());
        setIsAuthenticated(res.ok); // True if status is 200-299
      } catch (error) {
        console.error('Admin Token verification failed:', error.message, "Stack:", error.stack);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    console.log("Rendering loading state for Admin PrivateRoute...");
    return <div className="loading-spinner">Loading Admin Dashboard...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/admin-login" replace />;
};

export default AdminPrivateRoute;