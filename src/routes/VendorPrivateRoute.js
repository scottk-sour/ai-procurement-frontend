// src/routes/VendorPrivateRoute.js
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const VendorPrivateRoute = () => {
  const { auth } = useAuth();

  // Handle loading state (while checking token/session)
  if (!auth || auth.isLoading) {
    return <div className="loading-spinner">Loading Vendor Dashboard...</div>;
  }

  // Authenticated and has correct role
  const isVendor = auth.isAuthenticated && auth.user?.role === "vendor";

  if (!isVendor) {
    // Not a vendor or not logged in
    return <Navigate to="/vendor-login" replace />;
  }

  // Authenticated as vendor; render the protected route
  return <Outlet />;
};

export default VendorPrivateRoute;
