// src/components/VendorLogin.js
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link, useSearchParams } from "react-router-dom";
import "./Login.css";
import { setVendorToken, setVendorId, getVendorToken } from '../utils/vendorAuth';

const VendorLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();

  // Initial setup effect (scroll and fade-in)
  useEffect(() => {
    window.scrollTo(0, 0);
    console.log("VendorLogin component mounted at:", pathname, "Search Params:", searchParams.toString());
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Token check effect (redirect only if on /vendor-login and not already navigating)
  useEffect(() => {
    const token = getVendorToken();
    if (token && pathname === "/vendor-login") {
      console.log("Vendor token found, redirecting to dashboard");
      navigate("/vendor-dashboard", { replace: true });
    }
  }, [navigate, pathname]); // Removed dependency on navigate alone to prevent loop

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

    const requestBody = { email, password };
    console.log("Sending login request with:", requestBody);

    try {
      const response = await fetch("http://localhost:5000/api/vendors/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (response.ok) {
        console.log("✅ Vendor login successful, storing token...");
        setVendorToken(data.token);
        setVendorId(data.vendorId);
        localStorage.setItem("vendorName", data.name || "Vendor");
        console.log("🔍 Stored Vendor Token:", getVendorToken());
        console.log("🛠️ Navigating to vendor dashboard...");
        navigate("/vendor-dashboard", { replace: true });
      } else {
        console.error("❌ Vendor login failed:", data.message, "Status:", response.status);
        setError(data.message || "Invalid email or password.");
      }
    } catch (error) {
      console.error("❌ Network error during vendor login:", error.message);
      setError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vendor-login-page" data-animation="fadeInUp" data-visible={isVisible}>
      <header className="vendor-login-hero" data-animation="fadeIn" data-delay="200" data-visible={isVisible}>
        <h1 className="vendor-login-title">Vendor Login for TENDORAI</h1>
        <p className="vendor-login-subtitle">
          Securely access your TENDORAI vendor account to manage listings.
        </p>
        <span className="vendor-badge">Vendor Portal</span>
      </header>
      <section className="vendor-login-section" data-animation="fadeInUp" data-delay="400" data-visible={isVisible}>
        <div className="section-container">
          <form onSubmit={handleLogin} className="vendor-login-form">
            {error && <div className="form-status error">{error}</div>}
            <div className="form-group">
              <label htmlFor="email">Email <span className="required">*</span></label>
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
              <label htmlFor="password">Password <span className="required">*</span></label>
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
              Don’t have an account? <Link to="/vendor-signup">Sign up here</Link>
            </p>
          </form>
        </div>
      </section>
    </div>
  );
};

export default VendorLogin;