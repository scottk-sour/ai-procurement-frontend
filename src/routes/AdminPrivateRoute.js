import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const AdminPrivateRoute = ({ children }) => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("adminToken");
    console.log("🔐 Checking Admin Route Access: Token =", storedToken);
    setToken(storedToken);
  }, []);

  return token ? children : <Navigate to="/admin-login" replace />;
};

export default AdminPrivateRoute; // ✅ Make sure this is a default export
