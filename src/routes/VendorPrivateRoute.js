// src/routes/VendorPrivateRoute.js
import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const VendorPrivateRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      let token = localStorage.getItem('vendorToken'); // Adjust token key if different
      console.log("🔐 Vendor Private Route Access: Stored Token from localStorage =", token, "Expected Token =", localStorage.getItem('vendorToken'));
      if (!token) {
        console.log("❌ No vendorToken found, redirecting to vendor-login...");
        setIsAuthenticated(false);
        return;
      }

      // Clear any cached or outdated tokens in localStorage if mismatched
      const expectedToken = localStorage.getItem('vendorToken');
      if (token !== expectedToken) {
        console.log("⚠ Token mismatch detected, updating to expected token...");
        token = expectedToken;
        localStorage.setItem('vendorToken', token); // Ensure consistency
      }

      try {
        const res = await fetch('http://localhost:5000/api/auth/vendor-verify', { // Adjust endpoint as needed
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("API Response Status (Vendor):", res.status, "OK:", res.ok, "Response:", await res.text());
        setIsAuthenticated(res.ok); // True if status is 200-299
      } catch (error) {
        console.error('Vendor Token verification failed:', error.message, "Stack:", error.stack);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    console.log("Rendering loading state for Vendor PrivateRoute...");
    return <div className="loading-spinner">Loading Vendor Dashboard...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/vendor-login" replace />;
};

export default VendorPrivateRoute;