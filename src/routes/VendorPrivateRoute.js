import React from 'react';
import { Navigate } from 'react-router-dom';

const VendorPrivateRoute = ({ children }) => {
  const vendorToken = localStorage.getItem('vendorToken');
  console.log("🔐 Checking Vendor Route Access: Vendor Token =", vendorToken);
  return vendorToken ? children : <Navigate to="/vendor-login" replace />;
};

export default VendorPrivateRoute;
