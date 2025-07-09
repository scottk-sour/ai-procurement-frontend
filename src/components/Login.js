import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

// Constants
const VALIDATION_RULES = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Please enter a valid email address"
  },
  password: {
    minLength: 6,
    message: "Password must be at least 6 characters long"
  }
};

const API_CONFIG = {
  timeout: 30000, // 30 seconds
  retries: 3,
  baseURL: process.env.NODE_ENV === "development" 
    ? "http://localhost:5000"
    : process.env.REACT_APP_API_URL || "https://ai-procurement-backend-q35u.onrender.com"
};

const ERROR_MESSAGES = {
  network: "Unable to connect to server. Please check your connection and try again.",
  timeout: "Request timed out. Please try again.",
  server: "Server error. Please try again later or contact support.",
  rateLimit: "Too many login attempts. Please wait before trying again.",
  maintenance: "Service temporarily unavailable. Please try again later.",
  validation: "Please check your input and try again.",
  unauthorized: "Invalid email or password. Please check your credentials.",
  forbidden: "Access denied. Please contact support if this persists.",
  cors: "Connection issue detected. Please contact support.",
  default: "An unexpected error occurred. Please try again."
};

const Login = () => {
  // State management
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  
  const [uiState, setUiState] = useState({
    passwordVisible: false,
    loading: false,
    error: "",
    success: "",
    isVisible: false,
    retryCount: 0
  });

  // Refs
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const formRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  // Hooks
  const { auth, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Computed values - FIXED: Now properly constructs the full URL
  const loginEndpoint = `${API_CONFIG.baseURL}/api/users/login`;
  const redirectPath = location.state?.from || "/dashboard";

  // Helper functions
  const validateEmail = useCallback((email) => {
    return VALIDATION_RULES.email.pattern.test(email);
  }, []);

  const validateForm = useCallback(() => {
    const emailValue = formData.email;
    const passwordValue = formData.password;
    
    if (!emailValue.trim()) {
      return { isValid: false, error: "Email is required" };
    }
    if (!validateEmail(emailValue)) {
      return { isValid: false, error: VALIDATION_RULES.email.message };
    }
    if (!passwordValue.trim()) {
      return { isValid: false, error: "Password is required" };
    }
    if (passwordValue.length < VALIDATION_RULES.password.minLength) {
      return { isValid: false, error: VALIDATION_RULES.password.message };
    }
    return { isValid: true };
  }, [formData.email, formData.password, validateEmail]);

  // Get appropriate error message based on status code
  const getErrorMessage = useCallback((status, data) => {
    switch (status) {
      case 400:
        return data.message || ERROR_MESSAGES.validation;
      case 401:
        return ERROR_MESSAGES.unauthorized;
      case 403:
        return ERROR_MESSAGES.forbidden;
      case 429:
        return ERROR_MESSAGES.rateLimit;
      case 500:
        return ERROR_MESSAGES.server;
      case 503:
        return ERROR_MESSAGES.maintenance;
      default:
        return data.message || data.error || ERROR_MESSAGES.default;
    }
  }, []);

  // Make login request with retry logic
  const makeLoginRequest = useCallback(async (email, password, retryCount = 0) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    try {
      console.log("🔍 Making login request to:", loginEndpoint);

      const response = await fetch(loginEndpoint, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          // Add origin header for better CORS handling
          "Origin": window.location.origin
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log("📡 Response status:", response.status);
      console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()));

      // Check if response is actually JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text();
        console.error("❌ Non-JSON response received:", textResponse);
        return { 
          success: false, 
          error: response.status === 503 
            ? ERROR_MESSAGES.maintenance 
            : "Server returned an unexpected response format" 
        };
      }

      const data = await response.json();

      // Success response
      if (response.ok) {
        return { success: true, data };
      }

      // Handle specific error status codes
      const errorMessage = getErrorMessage(response.status, data);
      return { success: false, error: errorMessage, status: response.status };

    } catch (error) {
      clearTimeout(timeoutId);
      
      console.error("❌ Login request error:", error);
      
      // Handle different types of errors
      if (error.name === 'AbortError') {
        return { success: false, error: ERROR_MESSAGES.timeout };
      }
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        // Retry logic for network errors
        if (retryCount < API_CONFIG.retries) {
          console.log(`🔄 Retrying login request (attempt ${retryCount + 1}/${API_CONFIG.retries})`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
          return makeLoginRequest(email, password, retryCount + 1);
        }
        return { success: false, error: ERROR_MESSAGES.network };
      }
      
      if (error.message.includes('CORS')) {
        return { success: false, error: ERROR_MESSAGES.cors };
      }

      // Handle JSON parsing errors
      if (error.message.includes('Unexpected token')) {
        return { success: false, error: ERROR_MESSAGES.maintenance };
      }
      
      return { success: false, error: error.message || ERROR_MESSAGES.default };
    }
  }, [loginEndpoint, getErrorMessage]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Clear any existing errors
    setUiState(prev => ({ ...prev, error: "", success: "" }));
    
    // Validate form
    const validation = validateForm();
    if (!validation.isValid) {
      setUiState(prev => ({ ...prev, error: validation.error }));
      return;
    }

    setUiState(prev => ({ ...prev, loading: true }));

    try {
      console.log("🔍 Attempting login:", {
        endpoint: loginEndpoint,
        email: formData.email,
        timestamp: new Date().toISOString()
      });

      const result = await makeLoginRequest(formData.email, formData.password);

      if (result.success) {
        // Store authentication data
        const { token, userId, role = "user", name, email } = result.data;
        
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("userName", name || "User");
        localStorage.setItem("userId", userId);

        // Update auth context
        login(token, {
          userId,
          role,
          name: name || "User",
          email: email || formData.email
        });

        console.log("✅ Login successful:", {
          userId,
          role,
          email: email || formData.email
        });

        setUiState(prev => ({ 
          ...prev, 
          success: "Login successful! Redirecting...",
          error: ""
        }));

        // Redirect after short delay for user feedback
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 1000);

      } else {
        console.error("❌ Login failed:", result.error);
        setUiState(prev => ({ 
          ...prev, 
          error: result.error,
          retryCount: prev.retryCount + 1
        }));
      }
    } catch (err) {
      console.error("❌ Login network error:", err);
      const errorMessage = err.name === "TypeError" && err.message.includes("fetch")
        ? "Cannot connect to server. Please check your connection or try again later."
        : "A network error occurred. Please try again.";
      
      setUiState(prev => ({ 
        ...prev, 
        error: errorMessage,
        retryCount: prev.retryCount + 1
      }));
    } finally {
      setUiState(prev => ({ ...prev, loading: false }));
    }
  }, [formData, validateForm, makeLoginRequest, login, navigate, redirectPath, loginEndpoint]);

  // Handle input changes
  const handleInputChange = useCallback((field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors on input change
    if (uiState.error) {
      setUiState(prev => ({ ...prev, error: "" }));
    }
  }, [uiState.error]);

  // Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setUiState(prev => ({ ...prev, passwordVisible: !prev.passwordVisible }));
  }, []);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !uiState.loading) {
      handleSubmit(e);
    }
  }, [handleSubmit, uiState.loading]);

  // Effects
  useEffect(() => {
    // Scroll to top and show page
    window.scrollTo(0, 0);
    const timer = setTimeout(() => {
      setUiState(prev => ({ ...prev, isVisible: true }));
    }, 100);
    return () => clearTimeout(timer);
  }, [location]);

  useEffect(() => {
    // Redirect if already authenticated
    if (auth?.isAuthenticated && auth.user?.role === "user") {
      navigate(redirectPath, { replace: true });
    }
  }, [auth, navigate, redirectPath]);

  useEffect(() => {
    // Focus on email input when component mounts
    if (emailRef.current && uiState.isVisible) {
      emailRef.current.focus();
    }
  }, [uiState.isVisible]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Prevent form submission if already loading
  useEffect(() => {
    const form = formRef.current;
    if (form && uiState.loading) {
      const preventSubmit = (e) => e.preventDefault();
      form.addEventListener('submit', preventSubmit);
      return () => form.removeEventListener('submit', preventSubmit);
    }
  }, [uiState.loading]);

  // Auto-clear success/error messages
  useEffect(() => {
    if (uiState.success) {
      const timer = setTimeout(() => {
        setUiState(prev => ({ ...prev, success: "" }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [uiState.success]);

  // Render component
  return (
    <div 
      className={`login-page ${uiState.isVisible ? 'visible' : ''}`}
      data-testid="login-container"
    >
      <header className="login-hero">
        <div className="login-hero-content">
          <h1 className="login-title">Welcome to TendorAI</h1>
          <p className="login-subtitle">
            Sign in to access your AI-powered procurement dashboard and streamline your sourcing process.
          </p>
        </div>
      </header>

      <main className="login-section">
        <div className="section-container">
          <form 
            ref={formRef}
            onSubmit={handleSubmit} 
            className="login-form" 
            data-testid="login-form"
            noValidate
            autoComplete="on"
          >
            {/* Status Messages */}
            {uiState.error && (
              <div 
                className="form-status error" 
                role="alert" 
                data-testid="login-error"
                aria-live="polite"
              >
                <span aria-hidden="true">⚠️</span>
                {uiState.error}
              </div>
            )}

            {uiState.success && (
              <div 
                className="form-status success" 
                role="status" 
                data-testid="login-success"
                aria-live="polite"
              >
                <span aria-hidden="true">✅</span>
                {uiState.success}
              </div>
            )}

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email">
                Email Address <span className="required" aria-label="required">*</span>
              </label>
              <input
                ref={emailRef}
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleInputChange('email')}
                onKeyDown={handleKeyDown}
                required
                autoComplete="email"
                className="input-field"
                disabled={uiState.loading}
                data-testid="email-input"
                aria-describedby={uiState.error ? "login-error" : undefined}
                spellCheck="false"
                autoCapitalize="none"
              />
            </div>

            {/* Password Field */}
            <div className="form-group password-group">
              <label htmlFor="password">
                Password <span className="required" aria-label="required">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  ref={passwordRef}
                  type={uiState.passwordVisible ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  onKeyDown={handleKeyDown}
                  required
                  autoComplete="current-password"
                  className="input-field"
                  disabled={uiState.loading}
                  data-testid="password-input"
                  aria-describedby={uiState.error ? "login-error" : undefined}
                  minLength={VALIDATION_RULES.password.minLength}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="toggle-password"
                  aria-label={uiState.passwordVisible ? "Hide password" : "Show password"}
                  disabled={uiState.loading}
                  data-testid="toggle-password"
                  tabIndex={0}
                >
                  {uiState.passwordVisible ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-button"
              disabled={uiState.loading || !formData.email.trim() || !formData.password.trim()}
              data-testid="login-button"
              aria-describedby={uiState.loading ? "loading-status" : undefined}
            >
              {uiState.loading ? (
                <span className="loading-spinner" id="loading-status" aria-live="polite">
                  Signing you in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>

            <p className="signup-link">
              Don't have an account?{" "}
              <a
                href="/signup"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/signup", { replace: false });
                }}
              >
                Sign up here
              </a>
            </p>
          </form>

          {/* Rate Limit Info */}
          {uiState.retryCount > 0 && (
            <div className="retry-info" data-testid="retry-info">
              <p>
                Multiple failed attempts detected. Please wait a moment before trying again.
              </p>
            </div>
          )}

          {/* Development Debug Info */}
          {process.env.NODE_ENV === "development" && (
            <div className="debug-info" data-testid="debug-info">
              <strong>🔧 Development Debug Info:</strong>
              <br />
              <strong>API Base URL:</strong> {API_CONFIG.baseURL}
              <br />
              <strong>Login Endpoint:</strong> {loginEndpoint}
              <br />
              <strong>Redirect Path:</strong> {redirectPath}
              <br />
              <strong>Environment:</strong> {process.env.NODE_ENV}
              <br />
              <strong>Auth State:</strong> {auth?.isAuthenticated ? "Authenticated" : "Not authenticated"}
              <br />
              <strong>User Role:</strong> {auth?.user?.role || "None"}
              <br />
              <strong>Form Valid:</strong> {validateForm().isValid ? "Yes" : "No"}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Performance optimization with React.memo
const MemoizedLogin = React.memo(Login);

// Error boundary wrapper component
class LoginErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Login component error:', error, errorInfo);
    
    // In production, you might want to log this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="login-page">
          <div className="login-section">
            <div className="section-container">
              <div className="login-form">
                <div className="form-status error">
                  <span aria-hidden="true">💥</span>
                  Something went wrong. Please refresh the page and try again.
                  {process.env.NODE_ENV === 'development' && (
                    <details style={{ marginTop: '1rem' }}>
                      <summary>Error Details (Development Only)</summary>
                      <pre style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                        {this.state.error?.toString()}
                      </pre>
                    </details>
                  )}
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="submit-button"
                  style={{ marginTop: '1rem' }}
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Export wrapped component
const LoginWithErrorBoundary = () => (
  <LoginErrorBoundary>
    <MemoizedLogin />
  </LoginErrorBoundary>
);

export default LoginWithErrorBoundary;
