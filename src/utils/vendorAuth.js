// src/utils/vendorAuth.js

// Save Vendor Token to Local Storage
export const setVendorToken = (token) => {
    localStorage.setItem("vendorToken", token);
  };
  
  // Retrieve Vendor Token
  export const getVendorToken = () => {
    return localStorage.getItem("vendorToken");
  };
  
  // Save Vendor ID
  export const setVendorId = (vendorId) => {
    localStorage.setItem("vendorId", vendorId);
  };
  
  // Retrieve Vendor ID
  export const getVendorId = () => {
    return localStorage.getItem("vendorId");
  };
  
  // Logout Vendor (optional, but useful)
  export const logoutVendor = () => {
    localStorage.removeItem("vendorToken");
    localStorage.removeItem("vendorId");
  };