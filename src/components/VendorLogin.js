import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const VendorLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { auth, login } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [location]);

  useEffect(() => {
    if (!auth || auth.isLoading) return;
    if (auth.isAuthenticated && auth.user?.role === "vendor") {
      navigate(location.state?.from || "/vendor-dashboard", { replace: true });
    } else if (auth.isAuthenticated && auth.user?.role === "user") {
      navigate("/dashboard", { replace: true });
    }
  }, [auth, navigate, location]);

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
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/vendors/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("vendorToken", data.token);
        localStorage.setItem("role", "vendor");
        localStorage.setItem("userName", data.name || "Vendor");
        localStorage.setItem("vendorId", data.vendorId);

        login(data.token, {
          userId: data.vendorId,
          role: "vendor",
          name: data.name || "Vendor",
        });

        setPassword(""); // Clear for security
        navigate(location.state?.from || "/vendor-dashboard", { replace: true });
      } else {
        const errMsg =
          response.status === 401
            ? "Invalid email or password."
            : data.message || "Login failed.";
        setError(errMsg);
      }
    } catch (err) {
      setError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vendor-login-page" data-animation="fadeInUp" data-visible={isVisible}>
      <header
        className="vendor-login-hero"
        data-animation="fadeIn"
        data-delay="200"
        data-visible={isVisible}
      >
        <div className="hero-content">
          <h1 className="vendor-login-title">Vendor Login for TENDORAI</h1>
          <p className="vendor-login-subtitle">
            Securely access your TENDORAI vendor account to manage listings.
          </p>
        </div>
        <span className="vendor-badge">Vendor Portal</span>
      </header>

      <section
        className="vendor-login-section"
        data-animation="fadeInUp"
        data-delay="400"
        data-visible={isVisible}
      >
        <div className="section-container">
          <form onSubmit={handleLogin} className="vendor-login-form">
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
                  aria-label={passwordVisible ? "Hide password" : "Show password"}
                  disabled={loading}
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
              <a
                href="/vendor-signup"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/vendor-signup");
                }}
              >
                Sign up here
              </a>
            </p>
          </form>
        </div>
      </section>
    </div>
  );
};

export default VendorLogin;
