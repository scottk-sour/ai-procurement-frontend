import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    console.log("🔐 Checking Private Route Access: Token =", storedToken);
    setToken(storedToken);
  }, []);

  return token ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
