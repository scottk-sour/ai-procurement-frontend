import React, { useState, useRef, useEffect, useCallback } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaStore,
  FaChevronDown,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import "./NavigationBar.css";

const SERVICE_LINKS = [
  { to: "/services/photocopiers", label: "Photocopiers & Printers", description: "Office printing solutions", icon: "🖨️" },
  { to: "/services/telecoms", label: "Telecoms & Communications", description: "Business phone systems", icon: "📞" },
  { to: "/services/cctv", label: "CCTV & Security", description: "Security systems", icon: "🔒" },
  { to: "/services/it", label: "IT Solutions & Support", description: "IT infrastructure & support", icon: "💻" }
];

const NAVIGATION_LINKS = [
  { to: "/", label: "Home", exact: true },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/about-us", label: "About Us" },
  { to: "/contact", label: "Contact" },
  { to: "/faq", label: "FAQ" },
];

const NavigationBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const dropdownRef = useRef(null);
  const moreRef = useRef(null);
  const mobileNavRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { auth, logout } = useAuth();

  const isUserLoggedIn = auth?.isAuthenticated && auth.user?.role === "user";
  const isVendorLoggedIn = auth?.isAuthenticated && auth.user?.role === "vendor";
  const userName = auth?.user?.name || "User";

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 20);
  }, []);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
    setIsMoreOpen(false);
  };

  const handleLogout = useCallback(() => {
    logout();
    closeMenu();
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  const handleVendorLogout = useCallback(() => {
    logout();
    closeMenu();
    navigate("/vendor-login", { replace: true });
  }, [logout, navigate]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setIsMoreOpen(false);
      }
      if (mobileNavRef.current && !mobileNavRef.current.contains(e.target)) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const NavigationLink = ({ to, label, exact = false, onClick, className = "" }) => (
    <NavLink
      to={to}
      end={exact}
      onClick={onClick}
      className={({ isActive }) => `nav-link ${isActive ? "active" : ""} ${className}`}
    >
      {label}
    </NavLink>
  );

  const ServiceLink = ({ service, onClick, className = "" }) => (
    <NavLink
      to={service.to}
      onClick={onClick}
      className={({ isActive }) => `dropdown-item ${isActive ? "active" : ""} ${className}`}
    >
      <div className="dropdown-item-content">
        <span className="dropdown-item-icon">{service.icon}</span>
        <div className="dropdown-item-text">
          <span className="dropdown-item-title">{service.label}</span>
          <span className="dropdown-item-desc">{service.description}</span>
        </div>
      </div>
    </NavLink>
  );

  return (
    <>
      <nav className={`navbar ${isScrolled ? "navbar-scrolled" : ""}`}>
        <div className="navbar-container">
          {/* Logo */}
          <div className="navbar-brand">
            <NavLink to="/" className="brand-link" onClick={closeMenu}>
              <span className="logo-text">TENDORAI</span>
              <span className="logo-tagline">AI Procurement</span>
            </NavLink>
          </div>

          {/* Main Navigation */}
          <div className="navbar-nav">
            {NAVIGATION_LINKS.slice(0, 2).map((link) => (
              <NavigationLink key={link.to} {...link} />
            ))}

            {/* Services Dropdown */}
            <div
              className="dropdown-container"
              ref={dropdownRef}
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <span className="nav-link dropdown-trigger">
                Services <FaChevronDown className={`dropdown-icon ${isDropdownOpen ? "open" : ""}`} />
              </span>
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-grid">
                    {SERVICE_LINKS.map((service) => (
                      <ServiceLink key={service.to} service={service} onClick={closeMenu} />
                    ))}
                  </div>
                  <div className="dropdown-footer">
                    <NavLink to="/services" onClick={closeMenu} className="dropdown-cta">
                      View All →
                    </NavLink>
                  </div>
                </div>
              )}
            </div>

            {NAVIGATION_LINKS.slice(2, 4).map((link) => (
              <NavigationLink key={link.to} {...link} />
            ))}

            {/* More Dropdown (handles overflow) */}
            <div
              className="dropdown-container"
              ref={moreRef}
              onMouseEnter={() => setIsMoreOpen(true)}
              onMouseLeave={() => setIsMoreOpen(false)}
            >
              <span className="nav-link dropdown-trigger">
                More <FaChevronDown className={`dropdown-icon ${isMoreOpen ? "open" : ""}`} />
              </span>
              {isMoreOpen && (
                <div className="dropdown-menu small-menu">
                  {NAVIGATION_LINKS.slice(4).map((link) => (
                    <NavigationLink key={link.to} {...link} onClick={closeMenu} className="dropdown-item" />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Auth */}
          <div className="navbar-auth">
            {!isUserLoggedIn ? (
              <>
                <NavLink to="/login" className="auth-link" onClick={closeMenu}><FaUser /> Login</NavLink>
                <NavLink to="/signup" className="auth-link primary" onClick={closeMenu}>Sign Up</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/dashboard" className="auth-link" onClick={closeMenu}><FaUser /> {userName}</NavLink>
                <button className="auth-link danger" onClick={handleLogout}>Logout</button>
              </>
            )}

            {!isVendorLoggedIn ? (
              <NavLink to="/vendor-login" className="auth-link" onClick={closeMenu}><FaStore /> Vendors</NavLink>
            ) : (
              <>
                <NavLink to="/vendor-dashboard" className="auth-link" onClick={closeMenu}><FaStore /> Dashboard</NavLink>
                <button className="auth-link danger" onClick={handleVendorLogout}>Logout</button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <>
          <div className="mobile-nav-overlay" onClick={closeMenu} />
          <div ref={mobileNavRef} className="mobile-nav active">
            <div className="mobile-nav-content">
              {NAVIGATION_LINKS.map((link) => (
                <NavigationLink key={link.to} {...link} onClick={closeMenu} className="mobile-nav-link" />
              ))}
              <div className="mobile-services">
                <h4>Services</h4>
                {SERVICE_LINKS.map((service) => (
                  <ServiceLink key={service.to} service={service} onClick={closeMenu} className="mobile-service-link" />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default React.memo(NavigationBar);
