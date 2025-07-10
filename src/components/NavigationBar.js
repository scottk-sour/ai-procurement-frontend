import React, { useState, useRef, useEffect, useCallback } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FaUser, FaStore, FaChevronDown, FaBars, FaTimes, FaShieldAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import { useAuth } from "../context/AuthContext";
import './NavigationBar.css';

// Constants
const SERVICE_LINKS = [
  { 
    to: "/services/photocopiers", 
    label: "Photocopiers & Printers", 
    description: "Advanced office printing solutions and multifunction devices",
    icon: "🖨️"
  },
  { 
    to: "/services/telecoms", 
    label: "Telecoms & Communications", 
    description: "Business phone systems and unified communications",
    icon: "📞"
  },
  { 
    to: "/services/cctv", 
    label: "CCTV & Security", 
    description: "Comprehensive security camera and monitoring systems",
    icon: "🔒"
  },
  { 
    to: "/services/it", 
    label: "IT Solutions & Support", 
    description: "Complete technology infrastructure and support services",
    icon: "💻"
  }
];

const NAVIGATION_LINKS = [
  { to: "/", label: "Home", exact: true },
  { to: "/how-it-works", label: "How It Works", exact: false },
  { to: "/about-us", label: "About Us", exact: false },
  { to: "/contact", label: "Contact", exact: false },
  { to: "/faq", label: "FAQ", exact: false }
];

const NavigationBar = () => {
  // Simplified state management
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Refs
  const dropdownRef = useRef(null);
  const mobileNavRef = useRef(null);

  // Hooks
  const location = useLocation();
  const navigate = useNavigate();
  const { auth, logout } = useAuth();

  // Derived state
  const isUserLoggedIn = auth?.isAuthenticated && auth.user?.role === "user";
  const isVendorLoggedIn = auth?.isAuthenticated && auth.user?.role === "vendor";
  const userName = auth?.user?.name || "User";

  // Scroll handler
  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 20);
  }, []);

  // Menu handlers
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };

  // Authentication handlers
  const handleLogout = useCallback(() => {
    try {
      logout();
      closeMenu();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = "/login";
    }
  }, [logout, navigate]);

  const handleVendorLogout = useCallback(() => {
    try {
      logout();
      closeMenu();
      navigate("/vendor-login", { replace: true });
    } catch (error) {
      console.error('Vendor logout error:', error);
      window.location.href = "/vendor-login";
    }
  }, [logout, navigate]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (mobileNavRef.current && !mobileNavRef.current.contains(event.target) && isMenuOpen) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Scroll listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Close menu on route change
  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  // Body scroll lock
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Simple Navigation Link component
  const NavigationLink = ({ to, label, exact = false, onClick, className = "" }) => (
    <NavLink
      to={to}
      end={exact}
      onClick={onClick}
      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''} ${className}`}
    >
      {label}
    </NavLink>
  );

  // Service Link component
  const ServiceLink = ({ service, onClick, className = "" }) => (
    <NavLink
      to={service.to}
      onClick={onClick}
      className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''} ${className}`}
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
      <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
        <div className="navbar-container">
          {/* Brand Logo */}
          <div className="navbar-brand">
            <NavLink to="/" className="brand-link" onClick={closeMenu}>
              <div className="logo-container">
                <span className="logo-text">TENDORAI</span>
                <span className="logo-tagline">AI Procurement Platform</span>
              </div>
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <nav className="navbar-nav">
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
                Services 
                <FaChevronDown className={`dropdown-icon ${isDropdownOpen ? 'open' : ''}`} />
              </span>
              
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <h4>Our Services</h4>
                    <p>Find the right suppliers for your business needs</p>
                  </div>
                  
                  <div className="dropdown-grid">
                    {SERVICE_LINKS.map((service) => (
                      <ServiceLink
                        key={service.to}
                        service={service}
                        onClick={closeMenu}
                      />
                    ))}
                  </div>
                  
                  <div className="dropdown-footer">
                    <NavLink to="/services" onClick={closeMenu} className="dropdown-cta">
                      View All Services →
                    </NavLink>
                  </div>
                </div>
              )}
            </div>
            
            {NAVIGATION_LINKS.slice(2).map((link) => (
              <NavigationLink key={link.to} {...link} />
            ))}
          </nav>

          {/* Authentication Section */}
          <div className="navbar-auth">
            {/* User Authentication */}
            {!isUserLoggedIn ? (
              <div className="user-auth-section">
                <NavLink to="/login" className="auth-link login-link" onClick={closeMenu}>
                  <FaUser className="auth-icon" />
                  <span>User Login</span>
                </NavLink>
                <NavLink to="/signup" className="auth-link signup-link cta-button" onClick={closeMenu}>
                  <span>User Sign Up</span>
                </NavLink>
              </div>
            ) : (
              <div className="user-menu authenticated">
                <NavLink 
                  to="/dashboard" 
                  className={({ isActive }) => `auth-link dashboard-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <FaUser className="auth-icon" />
                  <span className="user-name">{userName}</span>
                </NavLink>
                <button className="auth-link logout-link" onClick={handleLogout}>
                  <span>Log Out</span>
                </button>
              </div>
            )}

            {/* Vendor Authentication */}
            {!isVendorLoggedIn ? (
              <div className="vendor-auth-section">
                <NavLink to="/vendor-login" className="auth-link vendor-link" onClick={closeMenu}>
                  <FaStore className="auth-icon" />
                  <span>Vendor Login</span>
                </NavLink>
                <NavLink to="/vendor-signup" className="auth-link vendor-signup-link cta-button" onClick={closeMenu}>
                  <span>Vendor Sign Up</span>
                </NavLink>
              </div>
            ) : (
              <div className="vendor-menu authenticated">
                <NavLink 
                  to="/vendor-dashboard" 
                  className={({ isActive }) => `auth-link vendor-dashboard-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <FaStore className="auth-icon" />
                  <span>Vendor Dashboard</span>
                </NavLink>
                <button className="auth-link logout-link" onClick={handleVendorLogout}>
                  <span>Log Out</span>
                </button>
              </div>
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

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <>
          <div className="mobile-nav-overlay" onClick={closeMenu} />
          <div ref={mobileNavRef} className={`mobile-nav ${isMenuOpen ? 'active' : ''}`}>
            <div className="mobile-nav-content">
              {/* Mobile Navigation Links */}
              <nav className="mobile-nav-section">
                {NAVIGATION_LINKS.map((link) => (
                  <NavigationLink
                    key={link.to}
                    {...link}
                    onClick={closeMenu}
                    className="mobile-nav-link"
                  />
                ))}

                {/* Mobile Services */}
                <div className="mobile-services">
                  <h4 className="mobile-section-title">Services</h4>
                  {SERVICE_LINKS.map((service) => (
                    <ServiceLink
                      key={service.to}
                      service={service}
                      onClick={closeMenu}
                      className="mobile-service-link"
                    />
                  ))}
                </div>
              </nav>

              {/* Mobile Authentication */}
              <div className="mobile-auth-section">
                {/* User Authentication */}
                <div className="mobile-user-auth">
                  <h4 className="mobile-section-title">
                    <FaUser className="section-icon" />
                    User Account
                  </h4>
                  {!isUserLoggedIn ? (
                    <>
                      <NavLink to="/login" onClick={closeMenu} className="mobile-auth-link login">
                        <FaUser className="auth-icon" />
                        <span>User Login</span>
                      </NavLink>
                      <NavLink to="/signup" onClick={closeMenu} className="mobile-auth-link signup">
                        <span>User Sign Up</span>
                      </NavLink>
                    </>
                  ) : (
                    <>
                      <NavLink to="/dashboard" onClick={closeMenu} className="mobile-auth-link dashboard">
                        <FaUser className="auth-icon" />
                        <span>{userName}'s Dashboard</span>
                      </NavLink>
                      <button className="mobile-auth-link logout" onClick={handleLogout}>
                        <span>Log Out</span>
                      </button>
                    </>
                  )}
                </div>

                {/* Vendor Authentication */}
                <div className="mobile-vendor-auth">
                  <h4 className="mobile-section-title">
                    <FaStore className="section-icon" />
                    Vendor Portal
                  </h4>
                  {!isVendorLoggedIn ? (
                    <>
                      <NavLink to="/vendor-login" onClick={closeMenu} className="mobile-auth-link vendor-login">
                        <FaStore className="auth-icon" />
                        <span>Vendor Login</span>
                      </NavLink>
                      <NavLink to="/vendor-signup" onClick={closeMenu} className="mobile-auth-link vendor-signup">
                        <span>Vendor Sign Up</span>
                      </NavLink>
                    </>
                  ) : (
                    <>
                      <NavLink to="/vendor-dashboard" onClick={closeMenu} className="mobile-auth-link vendor-dashboard">
                        <FaStore className="auth-icon" />
                        <span>Vendor Dashboard</span>
                      </NavLink>
                      <button className="mobile-auth-link logout" onClick={handleVendorLogout}>
                        <span>Log Out</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Mobile Footer */}
              <footer className="mobile-nav-footer">
                <div className="mobile-footer-content">
                  <p className="mobile-tagline">
                    <FaShieldAlt className="tagline-icon" />
                    Revolutionising procurement with AI
                  </p>
                  <div className="mobile-contact">
                    <a href="mailto:hello@tendorai.com" className="mobile-contact-link">
                      <FaEnvelope className="contact-icon" />
                      <span>hello@tendorai.com</span>
                    </a>
                    <a href="tel:+442079460958" className="mobile-contact-link">
                      <FaPhone className="contact-icon" />
                      <span>+44 20 7946 0958</span>
                    </a>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default NavigationBar;
