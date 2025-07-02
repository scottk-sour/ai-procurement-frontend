// src/context/AuthContext.js

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  getAuthToken,
  setToken,
  logout as clearLocalAuth,
} from "../utils/auth";

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
    user: null, // { userId, vendorId, email, name, role }
    token: null,
  });

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
        // Try user endpoint
        let resp = await fetch("/api/auth/verify", {
          headers: { Authorization: `Bearer ${token}` },
        });
        let data = await resp.json();

        if (resp.ok && data?.user) {
          setAuth({
            isAuthenticated: true,
            isLoading: false,
            user: {
              ...data.user,
              name:
                data.user.name ||
                data.user.vendorName ||
                data.user.email ||
                "User",
            },
            token,
          });
          return;
        }

        // Try vendor endpoint
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
              name:
                data.vendor.vendorName ||
                data.vendor.name ||
                data.vendor.email,
              role: "vendor",
            },
            token,
          });
          return;
        }

        // Token invalid
        setAuth({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          token: null,
        });
        clearLocalAuth();
      } catch (error) {
        console.error("Token verification failed:", error);
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

  const login = useCallback((token, user) => {
    setToken(token);
    setAuth({
      isAuthenticated: true,
      isLoading: false,
      user,
      token,
    });
  }, []);

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
