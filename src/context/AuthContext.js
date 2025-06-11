import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: null,
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    const verifyToken = async () => {
      console.log("🔄 Starting token verification at:", new Date().toISOString());
      try {
        const token = localStorage.getItem("token");
        console.log("🔍 Token:", token ? `Exists (length: ${token.length})` : "Not found");

        if (!token) {
          setAuth({ token: null, user: null, isAuthenticated: false, isLoading: false });
          return;
        }

        // Validate token format
        if (typeof token !== "string" || token.length < 10) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("userName");
          setAuth({ token: null, user: null, isAuthenticated: false, isLoading: false });
          return;
        }

        // Call backend to verify token
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${API_URL}/api/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText || "Verification failed"}`);
        }

        let data;
        try {
          data = await response.json();
          console.log("📄 Response data:", JSON.stringify(data));
        } catch (jsonError) {
          throw new Error(`Invalid JSON response: ${jsonError.message}`);
        }

        // Accept just data.user as a valid response
        if (!data.user) {
          throw new Error("Invalid verification response: Missing user data");
        }

        setAuth({
          token,
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
        });
        console.log("✅ Auth verified:", data.user);
      } catch (error) {
        console.error("❌ Token verification error:", error.message);
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userName");
        setAuth({ token: null, user: null, isAuthenticated: false, isLoading: false });
      } finally {
        setAuth((prev) => ({ ...prev, isLoading: false }));
      }
    };

    verifyToken();
    // Only run on mount and when auth.isLoading changes from true
    // eslint-disable-next-line
  }, [auth.isLoading]);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    setAuth({ token, user: userData, isAuthenticated: true, isLoading: false });
    console.log("✅ Logged in:", userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    setAuth({ token: null, user: null, isAuthenticated: false, isLoading: false });
    console.log("✅ Logged out");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
