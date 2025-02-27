// src/components/VendorLogin.js
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./Login.css"; // Continue using Login.css for consistency

const VendorLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false); // State for animation visibility

  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Scroll to top on page load, debug mount, and set visibility
  useEffect(() => {
    window.scrollTo(0, 0);
    console.log("VendorLogin component mounted");
    const timer = setTimeout(() => setIsVisible(true), 100); // Match other services' delay
    return () => clearTimeout(timer);
  }, [pathname]);

  // Redirect if already logged in as a vendor (vendorToken exists)
  useEffect(() => {
    const vendorToken = localStorage.getItem("vendorToken");
    if (vendorToken) {
      console.log("Vendor token found, redirecting to vendor dashboard");
      navigate("/vendor-dashboard");
    }
  }, [navigate]);

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
      const response = await fetch("http://localhost:5000/api/vendors/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("✅ Vendor login successful, storing vendorToken...");
        localStorage.setItem("vendorToken", data.token); // Store as vendorToken
        localStorage.setItem("vendorName", data.name || "Vendor");
        localStorage.setItem("vendorId", data.vendorId);
        console.log("🔍 Stored Vendor Token:", localStorage.getItem("vendorToken"));
        console.log("🛠️ Navigating to vendor dashboard...");
        navigate("/vendor-dashboard");
      } else {
        console.error("❌ Vendor login failed:", data.message);
        setError(data.message || "Invalid email or password.");
      }
    } catch (error) {
      console.error("❌ Error during vendor login:", error);
      setError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vendor-login-page" data-animation="fadeInUp" data-visible={isVisible}>
      {/* Hero Section */}
      <header className="vendor-login-hero" data-animation="fadeIn" data-delay="200" data-visible={isVisible}>
        <h1 className="vendor-login-title">Vendor Portal Login</h1>
        <p className="vendor-login-subtitle">
          Securely access your TENDORAI vendor dashboard to manage procurement opportunities.
        </p>
        <span className="vendor-badge">Vendor Portal</span>
      </header>

      {/* Login Form */}
      <section className="vendor-login-section" data-animation="fadeInUp" data-delay="400" data-visible={isVisible}>
        <div className="section-container">
          <form onSubmit={handleLogin} className="vendor-login-form">
            {error && <div className={`form-status error`}>{error}</div>}

            <div className="form-group" data-animation="fadeInUp" data-delay="500" data-visible={isVisible}>
              <label htmlFor="email">Email <span className="required">*</span></label>
              <input
                type="email"
                id="email"
                placeholder="Enter your vendor email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email" // Added for accessibility
                className="input-field"
              />
            </div>

            <div className="form-group password-group" data-animation="fadeInUp" data-delay="600" data-visible={isVisible}>
              <label htmlFor="password">Password <span className="required">*</span></label>
              <div className="password-input-wrapper">
                <input
                  type={passwordVisible ? "text" : "password"}
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password" // Added for accessibility
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

            <button type="submit" className="submit-button" disabled={loading} data-animation="fadeInUp" data-delay="700" data-visible={isVisible}>
              {loading ? (
                <span className="loading-spinner">Loading...</span>
              ) : (
                "Log In"
              )}
            </button>

            <p className="signup-link" data-animation="fadeInUp" data-delay="800" data-visible={isVisible}>
              Don’t have a vendor account? <Link to="/vendor-signup">Sign up here</Link>
            </p>
          </form>
        </div>
      </section>
    </div>
  );
};

export default VendorLogin;