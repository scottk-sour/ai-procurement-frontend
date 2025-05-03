// src/components/Login.js
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import "./Login.css";
import { setToken, setUserId, logout } from "../utils/auth";
import { useAuth } from "../utils/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const { setLoggedIn } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    window.scrollTo(0, 0);
    console.log("Login component mounted at:", pathname, "Search Params:", searchParams.toString());
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    if (token && storedRole && pathname === "/login") {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const isExpired = decoded.exp * 1000 < Date.now();
        if (isExpired) {
          console.log("⚠ Expired token found, clearing localStorage");
          logout();
        } else {
          console.log(`✅ ${storedRole} token found, redirecting to ${storedRole === "user" ? "dashboard" : "vendor-dashboard"}`);
          navigate(storedRole === "user" ? "/dashboard" : "/vendor-dashboard", { replace: true });
        }
      } catch (err) {
        console.error("❌ Error decoding token:", err.message);
        logout();
      }
    }
  }, [navigate, pathname]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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
      const endpoint = role === "user" ? "/api/users/login" : "/api/vendors/login";
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`✅ ${role} login successful, storing token and role...`);
        setToken(data.token);
        setUserId(data[role === "user" ? "userId" : "vendorId"]);
        localStorage.setItem("userName", data[role === "user" ? "name" : "vendorName"] || role.charAt(0).toUpperCase() + role.slice(1));
        localStorage.setItem("role", role);
        setLoggedIn(true);
        console.log(`Tracking ${role} login success for ${email}`);
        navigate(role === "user" ? "/dashboard" : "/vendor-dashboard", { replace: true });
      } else {
        console.error(`❌ ${role} login failed:`, data.message);
        const errorMsg = response.status === 429
          ? "Too many login attempts. Please try again later."
          : data.message || "Invalid email or password.";
        setError(errorMsg);
      }
    } catch (error) {
      console.error(`❌ Error during ${role} login:`, error);
      setError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`login-page ${role === "vendor" ? "vendor-login-page" : ""}`} data-animation="fadeInUp" data-visible={isVisible}>
      <header className={`login-hero ${role === "vendor" ? "vendor-login-hero" : ""}`} data-animation="fadeIn" data-delay="200" data-visible={isVisible}>
        <h1 className={`login-title ${role === "vendor" ? "vendor-login-title" : ""}`}>
          {role === "user" ? "User Login" : "Vendor Login"} for TENDORAI
        </h1>
        <p className={`login-subtitle ${role === "vendor" ? "vendor-login-subtitle" : ""}`}>
          Securely access your TENDORAI account to explore AI-powered procurement.
        </p>
        {role === "vendor" && (
          <span className="vendor-badge">Vendor Portal</span>
        )}
      </header>
      <section className={`login-section ${role === "vendor" ? "vendor-login-section" : ""}`} data-animation="fadeInUp" data-delay="400" data-visible={isVisible}>
        <div className="section-container">
          <div className="role-toggle">
            <button
              className={`role-button ${role === "user" ? "active" : ""}`}
              onClick={() => setRole("user")}
              aria-label="Switch to user login"
            >
              User
            </button>
            <button
              className={`role-button ${role === "vendor" ? "active" : ""}`}
              onClick={() => setRole("vendor")}
              aria-label="Switch to vendor login"
            >
              Vendor
            </button>
          </div>
          <form onSubmit={handleLogin} className={`login-form ${role === "vendor" ? "vendor-login-form" : ""}`}>
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
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="toggle-password"
                  aria-label={passwordVisible ? "Hide password" : "Show password"}
                >
                  {passwordVisible ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? <span className="loading-spinner">Logging In...</span> : "Log In"}
            </button>
            <p className="signup-link">
              Don’t have an account?{" "}
              <a href={`/${role}/signup`} onClick={(e) => { e.preventDefault(); navigate(`/${role}/signup`, { replace: false }); }}>
                Sign up here
              </a>
            </p>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Login;