import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = () => {
  const { auth } = useAuth();

  // Show loading while auth is being verified
  if (auth.isLoading) {
    return (
      <div className="loading-spinner" style={{ 
        textAlign: "center", 
        marginTop: "3rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh"
      }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid #f3f3f3",
          borderTop: "4px solid #3498db",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "1rem"
        }}></div>
        <p>Verifying authentication...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the protected route
  return <Outlet />;
};

export default PrivateRoute;
