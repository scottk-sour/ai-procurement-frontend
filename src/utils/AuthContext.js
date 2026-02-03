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

// Hook for navigation (to be used in Router context)
export const useAuthNavigation = () => {
  const { login, logout } = useAuth();
  const navigate = React.useNavigate(); // Safe within RouterProvider context

  const loginWithNav = useCallback(
    (token, user) => {
      login(token, user);
      navigate(user.role === "vendor" ? "/vendor-dashboard" : "/dashboard");
    },
    [login, navigate]
  );

  const logoutWithNav = useCallback(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);

  return { login: loginWithNav, logout: logoutWithNav };
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    token: null,
  });

  // ✅ API Configuration
  const API_URL = process.env.NODE_ENV === "development" 
    ? "http://localhost:5000"
    : process.env.REACT_APP_API_URL || "https://ai-procurement-backend-q35u.onrender.com";

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
        // Try user verification with correct endpoint
        try {
          const userResponse = await fetch(`${API_URL}/api/auth/verify`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            if (userData?.user) {
              setAuth({
                isAuthenticated: true,
                isLoading: false,
                user: {
                  id: userData.user.userId,
                  userId: userData.user.userId,
                  email: userData.user.email,
                  name: userData.user.name || userData.user.email || "User",
                  role: userData.user.role || "user",
                },
                token,
              });
              return;
            }
          }
        } catch (userError) {
          // User verification failed, try vendor
        }

        // Try vendor verification with correct endpoint
        try {
          const vendorResponse = await fetch(`${API_URL}/api/vendors/verify`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (vendorResponse.ok) {
            const vendorData = await vendorResponse.json();
            if (vendorData?.vendor) {
              setAuth({
                isAuthenticated: true,
                isLoading: false,
                user: {
                  vendorId: vendorData.vendor.vendorId,
                  email: vendorData.vendor.email,
                  name: vendorData.vendor.vendorName || vendorData.vendor.name || vendorData.vendor.email,
                  role: "vendor",
                },
                token,
              });
              return;
            }
          }
        } catch (vendorError) {
          // Vendor verification also failed
        }

        // Both verifications failed, clear auth
        setAuth({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          token: null,
        });
        clearLocalAuth();
        
      } catch (error) {
        console.error("❌ Token verification error:", error);
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
  }, [API_URL]);

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