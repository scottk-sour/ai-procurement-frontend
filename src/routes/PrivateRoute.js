import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getAuthToken } from '../utils/auth'; // Must return user token

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const PrivateRoute = () => {
  const [isLoggedIn, setLoggedIn] = useState(null); // null = loading, false = not logged in, true = logged in
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      console.log("🔐 Stored Token from localStorage =", token);
      if (!token) {
        setLoggedIn(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Optionally check for role here if you want
        if (res.ok) {
          setLoggedIn(true);
        } else {
          setLoggedIn(false);
        }
      } catch (error) {
        setError('Authentication failed. Please log in again.');
        setLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  if (isLoggedIn === null) {
    // Loading state
    return (
      <div className="loading-spinner" style={{ textAlign: "center", marginTop: "3rem" }}>
        Loading User Dashboard...
      </div>
    );
  }

  if (error) {
    // Error state
    return (
      <div className="error-message" style={{ color: "red", textAlign: "center", marginTop: "2rem" }}>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  // Authenticated: render child route
  // Not authenticated: redirect to /login
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
