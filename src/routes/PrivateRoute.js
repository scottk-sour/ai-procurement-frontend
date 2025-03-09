import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getAuthToken } from '../utils/auth'; // Ensure this function returns your user token

const PrivateRoute = () => {
  // isLoggedIn starts as null to indicate "loading"
  const [isLoggedIn, setLoggedIn] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      console.log("🔐 Stored Token from localStorage =", token);
      if (!token) {
        console.log("❌ No token found, redirecting to login...");
        setLoggedIn(false);
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const responseText = await res.text();
        console.log("API Response Status (User):", res.status, "OK:", res.ok, "Response:", responseText);
        if (res.ok) {
          setLoggedIn(true);
        } else {
          throw new Error(`Token verification failed with status: ${res.status}`);
        }
      } catch (error) {
        console.error('User Token verification failed:', error.message, "Stack:", error.stack);
        setError('Authentication failed. Please log in again.');
        setLoggedIn(false);
      }
    };

    checkAuth();
  }, []);

  // While checking authentication, render a loading state.
  if (isLoggedIn === null) {
    console.log("Rendering loading state for PrivateRoute...");
    return <div className="loading-spinner">Loading User Dashboard...</div>;
  }

  // If an error occurred, render an error message.
  if (error) {
    console.log("Rendering error state:", error);
    return (
      <div className="error-message">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  // If authenticated, render the nested routes via Outlet.
  // Otherwise, redirect to the login page.
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
