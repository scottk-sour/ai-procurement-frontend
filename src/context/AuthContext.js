// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true
  });

  // Initialize auth state from localStorage on app load
  useEffect(() => {
    const initializeAuth = async () => {
      // Check for vendor token first
      const vendorToken = localStorage.getItem('vendorToken');
      const role = localStorage.getItem('role');
      const vendorId = localStorage.getItem('vendorId');
      const userName = localStorage.getItem('userName');

      // Check for regular user token
      const userToken = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (vendorToken && role === 'vendor') {
        await verifyVendorToken(vendorToken, vendorId, userName);
      } else if (userToken) {
        await verifyUserToken(userToken, userId);
      } else {
        setAuth(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, []);

  // Verify vendor token
  const verifyVendorToken = async (token, vendorId, userName) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/vendors/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAuth({
          isAuthenticated: true,
          user: {
            userId: vendorId || data.vendor?.vendorId,
            name: userName || data.vendor?.vendorName,
            email: data.vendor?.email,
            role: 'vendor'
          },
          token: token,
          isLoading: false
        });
      } else {
        // Clear invalid tokens
        localStorage.removeItem('vendorToken');
        localStorage.removeItem('role');
        localStorage.removeItem('vendorId');
        localStorage.removeItem('userName');
        
        setAuth({
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('❌ Vendor token verification error:', error);
      setAuth({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false
      });
    }
  };

  // Verify user token
  const verifyUserToken = async (token, userId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAuth({
          isAuthenticated: true,
          user: {
            userId: userId || data.user?.userId,
            name: data.user?.name,
            email: data.user?.email,
            role: 'user'
          },
          token: token,
          isLoading: false
        });
      } else {
        // Clear invalid tokens
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        
        setAuth({
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('❌ User token verification error:', error);
      setAuth({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false
      });
    }
  };

  // Login function (works for both users and vendors)
  const login = useCallback((token, userData) => {
    setAuth({
      isAuthenticated: true,
      user: userData,
      token: token,
      isLoading: false
    });

    // Store in localStorage based on role
    if (userData?.role === 'vendor') {
      localStorage.setItem('vendorToken', token);
      localStorage.setItem('role', 'vendor');
      localStorage.setItem('vendorId', userData.userId);
      localStorage.setItem('userName', userData.name);
    } else {
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userData.userId);
      localStorage.setItem('userName', userData.name);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    // Clear all auth-related localStorage items
    localStorage.removeItem('token');
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('vendorId');
    localStorage.removeItem('userName');
    localStorage.removeItem('role');

    setAuth({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false
    });
  }, []);

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    return auth.user?.role === role;
  }, [auth.user?.role]);

  // Get current token (vendor or user)
  const getCurrentToken = useCallback(() => {
    if (auth.user?.role === 'vendor') {
      return localStorage.getItem('vendorToken') || auth.token;
    }
    return localStorage.getItem('token') || auth.token;
  }, [auth.token, auth.user?.role]);

  const contextValue = {
    auth,
    login,
    logout,
    hasRole,
    getCurrentToken,
    isVendor: auth.user?.role === 'vendor',
    isUser: auth.user?.role === 'user'
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
