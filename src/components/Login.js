import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link, useSearchParams } from "react-router-dom";
import "./Login.css";
import { setToken, setUserId } from "../utils/auth";
import { useAuth } from "../utils/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    const role = localStorage.getItem("role");
    if (token && role === "user") {
      console.log("✅ User token and role found, redirecting to dashboard");
      navigate("/dashboard", { replace: false });
    } else if (token && role !== "user") {
      console.log("❌ Token found but role is not 'user', staying on login");
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
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("✅ User login successful, storing token and role...");
        setToken(data.token);
        setUserId(data.userId);
        localStorage.setItem("userName", data.name || "User");
        localStorage.setItem("role", "user");
        setLoggedIn(true);
        console.log("🔍 Stored User Token:", localStorage.getItem("token"));
        console.log("🔍 Stored Role:", localStorage.getItem("role"));
        console.log("🛠️ Navigating to dashboard...");
        navigate("/dashboard", { replace: false });
      } else {
        console.error("❌ User login failed:", data.message);
        setError(data.message || "Invalid email or password.");
      }
    } catch (error) {
      console.error("❌ Error during user login:", error);
      setError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" data-animation="fadeInUp" data-visible={isVisible}>
      <header className="login-hero" data-animation="fadeIn" data-delay="200" data-visible={isVisible}>
        <h1 className="login-title">User Login for TENDORAI</h1>
        <p className="login-subtitle">
          Securely access your TENDORAI account to explore AI-powered procurement.
        </p>
      </header>
      <section className="login-section" data-animation="fadeInUp" data-delay="400" data-visible={isVisible}>
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
              <Link to="/signup" onClick={() => navigate("/signup", { replace: false })}>
                Sign up here
              </Link>
            </p>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Login;