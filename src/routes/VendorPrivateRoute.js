// src/routes/VendorPrivateRoute.js
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getVendorToken } from "../utils/vendorAuth";
import { jwtDecode } from "jwt-decode";

const VendorPrivateRoute = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = getVendorToken();
      console.log("🔐 Vendor Private Route Access: Stored Token =", token);

      if (!token) {
        console.log("❌ No vendorToken found, redirecting to vendor-login...");
        navigate("/vendor-login", { replace: true });
        setIsLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          console.log("❌ Token expired, redirecting to vendor-login...");
          navigate("/vendor-login", { replace: true });
          setIsLoading(false);
          return;
        }

        const response = await fetch("http://localhost:5000/api/vendors/auth/verify", {
          headers: { "Authorization": `Bearer ${token}` },
        });
        const data = await response.json();
        console.log("API Response Status (Vendor):", response.status, "OK:", response.ok, "Response:", data);

        if (response.ok && data.authenticated) {
          console.log("✅ Vendor token verified, allowing access");
          setIsAuthenticated(true);
        } else {
          console.log("❌ Token verification failed, redirecting to vendor-login...");
          navigate("/vendor-login", { replace: true });
        }
      } catch (error) {
        console.error("❌ Error verifying vendor token:", error.message);
        navigate("/vendor-login", { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, [navigate, location.pathname]);

  if (isLoading) {
    console.log("Rendering loading state for Vendor PrivateRoute...");
    return <div>Loading...</div>;
  }

  console.log("✅ VendorPrivateRoute rendering children, isAuthenticated:", isAuthenticated);
  return isAuthenticated ? children : null;
};

export default VendorPrivateRoute;