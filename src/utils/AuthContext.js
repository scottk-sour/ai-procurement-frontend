// src/context/AuthContext.js

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getAuthToken, setToken, logout as clearLocalAuth } from "../utils/auth"; // adjust path as needed

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    isLoading: true,
    user: null,    // { userId, vendorId, email, name, role }
    token: null,
  });

  // Validate token with backend on mount
  useEffect(() => {
    const checkToken = async () => {
      const token = getAuthToken();
      if (!token) {
        setAuth({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          token: null,
        });
        return;
      }
      try {
        // Check both endpoints in case of user/vendor
        let resp = await fetch("/api/auth/verify", {
          headers: { Authorization: `Bearer ${token}` },
        });
        let data = await resp.json();

        if (resp.ok && data?.user) {
          setAuth({
            isAuthenticated: true,
            isLoading: false,
            user: {
              ...data.user,    // userId/vendorId/email/role
              name: data.user.name || data.user.vendorName || data.user.email || "User",
            },
            token,
          });
          return;
        }

        // Try vendor endpoint if not found on user
        resp = await fetch("/api/vendors/verify", {
          headers: { Authorization: `Bearer ${token}` },
        });
        data = await resp.json();
        if (resp.ok && data?.vendor) {
          setAuth({
            isAuthenticated: true,
            isLoading: false,
            user: {
              vendorId: data.vendor.vendorId,
              email: data.vendor.email,
              name: data.vendor.vendorName || data.vendor.name || data.vendor.email,
              role: "vendor",
            },
            token,
          });
          return;
        }

        // Token invalid or unrecognized
        setAuth({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          token: null,
        });
        clearLocalAuth();
      } catch (error) {
        setAuth({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          token: null,
        });
        clearLocalAuth();
      }
    };
    checkToken();
  }, []);

  // Centralized login handler (call this after successful login)
  const login = useCallback((token, user) => {
    setToken(token); // Save to localStorage
    setAuth({
      isAuthenticated: true,
      isLoading: false,
      user,
      token,
    });
  }, []);

  // Centralized logout
  const logout = useCallback(() => {
    clearLocalAuth();
    setAuth({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      token: null,
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
