import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const { auth, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ❌ Removed API_URL constant; we'll call /api/... directly

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [location]);

  useEffect(() => {
    if (!auth || auth.isLoading) return;
    if (auth.isAuthenticated && auth.user?.role === "user") {
      const from = location.state?.from || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [auth, navigate, location]);

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 🔍 Debug logging
    console.log("🔍 Environment check:");
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("Current origin:", window.location.origin);

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      // 🛣️ Use relative path—Vercel will proxy /api to your backend
      const loginUrl = "/api/users/login";
      console.log("🔍 Making login request to:", loginUrl);

      const response = await fetch(loginUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      console.log("📡 Response status:", response.status);
      console.log(
        "📡 Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      const data = await response.json();
      console.log("Login response:", response.status, data);

      if (response.ok) {
        login(data.token, {
          userId: data.userId,
          role: data.role || "user",
          name: data.name || "User",
        });

        localStorage.setItem("role", "user");
        localStorage.setItem("userName", data.name || "User");
        localStorage.setItem("userId", data.userId);

        navigate(location.state?.from || "/dashboard", { replace: true });
      } else {
        const errorMsg =
          response.status === 429
            ? "Too many login attempts. Please try again later."
            : response.status === 500
            ? "Server error. Please try again later."
            : data.message || "Invalid email or password.";
        setError(errorMsg);
      }
    } catch (err) {
      console.error("Login network error:", err);
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        setError(
          "Cannot connect to server. Please check your connection or try again later."
        );
      } else {
        setError("A network error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="login-page"
      data-animation="fadeInUp"
      data-visible={isVisible}
    >
      <header
        className="login-hero"
        data-animation="fadeIn"
        data-delay="200"
        data-visible={isVisible}
      >
        <h1 className="login-title">User Login for TENDORAI</h1>
        <p className="login-subtitle">
          Securely access your TENDORAI account to explore AI-powered procurement.
        </p>
      </header>

      <section
        className="login-section"
        data-animation="fadeInUp"
        data-delay="400"
        data-visible={isVisible}
      >
        <div className="section-container">
          <form onSubmit={handleLogin} className="login-form">
            {error && <div className="form-status error">{error}</div>}

            <div className="form-group">
              <label htmlFor="email">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="input-field"
                disabled={loading}
              />
            </div>

            <div className="form-group password-group">
              <label htmlFor="password">
                Password <span className="required">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  type={passwordVisible ? "text" : "password"}
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="input-field"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="toggle-password"
                  aria-label={
                    passwordVisible ? "Hide password" : "Show password"
                  }
                  disabled={loading}
                >
                  {passwordVisible ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? (
                <span className="loading-spinner">Logging In...</span>
              ) : (
                "Log In"
              )}
            </button>

            <p className="signup-link">
              Don’t have an account?{" "}
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

          {/* ✅ Debug info in development */}
          {process.env.NODE_ENV === "development" && (
            <div
              style={{
                marginTop: "20px",
                padding: "10px",
                backgroundColor: "#f0f0f0",
                fontSize: "12px",
                borderRadius: "4px",
              }}
            >
              <strong>Debug Info:</strong>
              <br />
              Login Endpoint: /api/users/login
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Login;
