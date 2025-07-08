import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FaUser, FaStore, FaChevronDown, FaBars, FaTimes, FaShieldAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import { useAuth } from "../context/AuthContext";
import './NavigationBar.css';

// Constants
const SCROLL_THRESHOLD = 20;
const ESCAPE_KEY = 'Escape';
const ENTER_KEY = 'Enter';
const SPACE_KEY = ' ';

// Service configuration
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

// Navigation links configuration
const NAVIGATION_LINKS = [
  { to: "/", label: "Home", exact: true },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/about-us", label: "About Us" },
  { to: "/contact", label: "Contact" },
  { to: "/faq", label: "FAQ" }
];

const NavigationBar = () => {
  // State management
  const [uiState, setUiState] = useState({
    menuOpen: false,
    isDropdownOpen: false,
    isScrolled: false,
    isMounted: false
  });

  // Refs
  const dropdownRef = useRef(null);
  const dropdownContainerRef = useRef(null);
  const navbarRef = useRef(null);
  const mobileNavRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  // Hooks
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { auth, logout } = useAuth();

  // Memoized values
  const isUserLoggedIn = useMemo(() => 
    auth?.isAuthenticated && auth.user?.role === "user", 
    [auth?.isAuthenticated, auth?.user?.role]
  );

  const isVendorLoggedIn = useMemo(() => 
    auth?.isAuthenticated && auth.user?.role === "vendor", 
    [auth?.isAuthenticated, auth?.user?.role]
  );

  const userName = useMemo(() => 
    auth?.user?.name || "User", 
    [auth?.user?.name]
  );

  // Optimized scroll handler with throttling
  const handleScroll = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      const scrollPosition = window.scrollY;
      const shouldBeScrolled = scrollPosition > SCROLL_THRESHOLD;
      
      setUiState(prev => {
        if (prev.isScrolled !== shouldBeScrolled) {
          return { ...prev, isScrolled: shouldBeScrolled };
        }
        return prev;
      });
    }, 10); // Throttle to 10ms
  }, []);

  // Menu control functions
  const toggleMenu = useCallback(() => {
    setUiState(prev => ({
      ...prev,
      menuOpen: !prev.menuOpen,
      isDropdownOpen: false // Close dropdown when opening mobile menu
    }));
  }, []);

  const closeMenu = useCallback(() => {
    setUiState(prev => ({
      ...prev,
      menuOpen: false,
      isDropdownOpen: false
    }));
  }, []);

  const toggleDropdown = useCallback(() => {
    setUiState(prev => ({
      ...prev,
      isDropdownOpen: !prev.isDropdownOpen
    }));
  }, []);

  const openDropdown = useCallback(() => {
    setUiState(prev => ({
      ...prev,
      isDropdownOpen: true
    }));
  }, []);

  const closeDropdown = useCallback(() => {
    setUiState(prev => ({
      ...prev,
      isDropdownOpen: false
    }));
  }, []);

  // Authentication handlers
  const handleLogout = useCallback(() => {
    try {
      logout();
      closeMenu();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [logout, closeMenu, navigate]);

  const handleVendorLogout = useCallback(() => {
    try {
      logout();
      closeMenu();
      navigate("/vendor-login", { replace: true });
    } catch (error) {
      console.error('Vendor logout error:', error);
    }
  }, [logout, closeMenu, navigate]);

  // Keyboard event handlers
  const handleDropdownKeyDown = useCallback((event) => {
    switch (event.key) {
      case ENTER_KEY:
      case SPACE_KEY:
        event.preventDefault();
        toggleDropdown();
        break;
      case ESCAPE_KEY:
        closeDropdown();
        break;
      default:
        break;
    }
  }, [toggleDropdown, closeDropdown]);

  const handleGlobalKeyDown = useCallback((event) => {
    if (event.key === ESCAPE_KEY) {
      closeMenu();
    }
  }, [closeMenu]);

  // Click outside handlers
  const handleClickOutsideDropdown = useCallback((event) => {
    if (
      dropdownContainerRef.current &&
      !dropdownContainerRef.current.contains(event.target)
    ) {
      closeDropdown();
    }
  }, [closeDropdown]);

  const handleClickOutsideMobileMenu = useCallback((event) => {
    if (
      uiState.menuOpen &&
      mobileNavRef.current &&
      navbarRef.current &&
      !navbarRef.current.contains(event.target) &&
      !mobileNavRef.current.contains(event.target)
    ) {
      closeMenu();
    }
  }, [uiState.menuOpen, closeMenu]);

  // Effects
  useEffect(() => {
    // Mark component as mounted
    setUiState(prev => ({ ...prev, isMounted: true }));
    
    // Scroll to top on route change
    window.scrollTo(0, 0);
    
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [pathname]);

  useEffect(() => {
    // Scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    // Global keyboard event listener
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);

  useEffect(() => {
    // Click outside dropdown listener
    document.addEventListener('mousedown', handleClickOutsideDropdown);
    return () => document.removeEventListener('mousedown', handleClickOutsideDropdown);
  }, [handleClickOutsideDropdown]);

  useEffect(() => {
    // Click outside mobile menu listener
    document.addEventListener('mousedown', handleClickOutsideMobileMenu);
    return () => document.removeEventListener('mousedown', handleClickOutsideMobileMenu);
  }, [handleClickOutsideMobileMenu]);

  useEffect(() => {
    // Manage body scroll when mobile menu is open
    if (uiState.menuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // Prevent scroll jump
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [uiState.menuOpen]);

  // Focus management for accessibility
  useEffect(() => {
    if (uiState.isDropdownOpen && dropdownRef.current) {
      const firstFocusableElement = dropdownRef.current.querySelector('a, button');
      if (firstFocusableElement) {
        firstFocusableElement.focus();
      }
    }
  }, [uiState.isDropdownOpen]);

  // Render navigation link component
  const NavigationLink = React.memo(({ to, label, exact = false, onClick = closeMenu }) => (
    <NavLink
      to={to}
      end={exact}
      onClick={onClick}
      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
      aria-current={pathname === to ? 'page' : undefined}
    >
      {label}
    </NavLink>
  ));

  // Render authentication section
  const AuthenticationSection = React.memo(() => (
    <div className="navbar-auth">
      {/* User Authentication */}
      {!isUserLoggedIn ? (
        <div className="user-auth-section">
          <NavLink 
            to="/login" 
            className="auth-link login-link"
            aria-label="User login"
          >
            <FaUser className="auth-icon" aria-hidden="true" />
            <span>Log In</span>
          </NavLink>
          <NavLink 
            to="/signup" 
            className="auth-link signup-link cta-button"
            aria-label="Create free account"
          >
            <span>Sign Up Free</span>
          </NavLink>
        </div>
      ) : (
        <div className="user-menu authenticated">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `auth-link dashboard-link ${isActive ? 'active' : ''}`}
            aria-label={`${userName}'s dashboard`}
          >
            <FaUser className="auth-icon" aria-hidden="true" />
            <span className="user-name">{userName}</span>
          </NavLink>
          <button
            className="auth-link logout-link"
            onClick={handleLogout}
            aria-label="Log out"
            type="button"
          >
            <span>Log Out</span>
          </button>
        </div>
      )}

      {/* Vendor Authentication */}
      {!isVendorLoggedIn ? (
        <NavLink 
          to="/vendor-login" 
          className="auth-link vendor-link"
          aria-label="Vendor portal login"
        >
          <FaStore className="auth-icon" aria-hidden="true" />
          <span>Vendor Portal</span>
        </NavLink>
      ) : (
        <div className="vendor-menu authenticated">
          <NavLink
            to="/vendor-dashboard"
            className={({ isActive }) => `auth-link vendor-dashboard-link ${isActive ? 'active' : ''}`}
            aria-label="Vendor dashboard"
          >
            <FaStore className="auth-icon" aria-hidden="true" />
            <span>Vendor Dashboard</span>
          </NavLink>
          <button
            className="auth-link logout-link"
            onClick={handleVendorLogout}
            aria-label="Log out from vendor portal"
            type="button"
          >
            <span>Log Out</span>
          </button>
        </div>
      )}
    </div>
  ));

  // Render services dropdown
  const ServicesDropdown = React.memo(() => (
    <div
      className="dropdown-container"
      ref={dropdownContainerRef}
      onMouseEnter={openDropdown}
      onMouseLeave={closeDropdown}
      onKeyDown={handleDropdownKeyDown}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
      aria-expanded={uiState.isDropdownOpen}
      aria-label="Services menu"
    >
      <span className="nav-link dropdown-trigger">
        Services 
        <FaChevronDown 
          className={`dropdown-icon ${uiState.isDropdownOpen ? 'open' : ''}`} 
          aria-hidden="true"
        />
      </span>
      
      {uiState.isDropdownOpen && (
        <div 
          ref={dropdownRef} 
          className="dropdown-menu"
          role="menu"
          aria-label="Services submenu"
        >
          <div className="dropdown-header">
            <h4>Our Services</h4>
            <p>Find the right suppliers for your business needs</p>
          </div>
          
          <div className="dropdown-grid" role="none">
            {SERVICE_LINKS.map((service) => (
              <NavLink
                key={service.to}
                to={service.to}
                onClick={closeMenu}
                className="dropdown-item"
                role="menuitem"
                tabIndex={uiState.isDropdownOpen ? 0 : -1}
              >
                <div className="dropdown-item-content">
                  <span className="dropdown-item-icon" aria-hidden="true">
                    {service.icon}
                  </span>
                  <div className="dropdown-item-text">
                    <span className="dropdown-item-title">{service.label}</span>
                    <span className="dropdown-item-desc">{service.description}</span>
                  </div>
                </div>
              </NavLink>
            ))}
          </div>
          
          <div className="dropdown-footer">
            <NavLink 
              to="/services" 
              onClick={closeMenu} 
              className="dropdown-cta"
              role="menuitem"
              tabIndex={uiState.isDropdownOpen ? 0 : -1}
            >
              View All Services →
            </NavLink>
          </div>
        </div>
      )}
    </div>
  ));

  // Render mobile navigation
  const MobileNavigation = React.memo(() => (
    <>
      <div 
        ref={mobileNavRef}
        className={`mobile-nav ${uiState.menuOpen ? 'active' : ''}`}
        aria-hidden={!uiState.menuOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        <div className="mobile-nav-content">
          {/* Mobile Navigation Links */}
          <nav className="mobile-nav-section" role="navigation" aria-label="Main navigation">
            {NAVIGATION_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.exact}
                onClick={closeMenu}
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                aria-current={pathname === link.to ? 'page' : undefined}
              >
                {link.label}
              </NavLink>
            ))}

            {/* Mobile Services */}
            <div className="mobile-services">
              <h4 className="mobile-section-title">Services</h4>
              {SERVICE_LINKS.map((service) => (
                <NavLink
                  key={service.to}
                  to={service.to}
                  onClick={closeMenu}
                  className="mobile-service-link"
                >
                  <span className="mobile-service-icon" aria-hidden="true">
                    {service.icon}
                  </span>
                  <div className="mobile-service-content">
                    <span className="mobile-service-title">{service.label}</span>
                    <span className="mobile-service-desc">{service.description}</span>
                  </div>
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Mobile Authentication */}
          <div className="mobile-auth-section">
            {/* User Authentication */}
            <div className="mobile-user-auth">
              <h4 className="mobile-section-title">
                <FaUser className="section-icon" aria-hidden="true" />
                User Account
              </h4>
              {!isUserLoggedIn ? (
                <>
                  <NavLink
                    to="/login"
                    onClick={closeMenu}
                    className="mobile-auth-link login"
                  >
                    <FaUser className="auth-icon" aria-hidden="true" />
                    <span>Log In</span>
                  </NavLink>
                  <NavLink
                    to="/signup"
                    onClick={closeMenu}
                    className="mobile-auth-link signup cta-button"
                  >
                    <span>Sign Up Free</span>
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink
                    to="/dashboard"
                    onClick={closeMenu}
                    className="mobile-auth-link dashboard"
                  >
                    <FaUser className="auth-icon" aria-hidden="true" />
                    <span>{userName}'s Dashboard</span>
                  </NavLink>
                  <button
                    className="mobile-auth-link logout"
                    onClick={handleLogout}
                    type="button"
                  >
                    <span>Log Out</span>
                  </button>
                </>
              )}
            </div>

            {/* Vendor Authentication */}
            <div className="mobile-vendor-auth">
              <h4 className="mobile-section-title">
                <FaStore className="section-icon" aria-hidden="true" />
                Vendor Portal
              </h4>
              {!isVendorLoggedIn ? (
                <NavLink
                  to="/vendor-login"
                  onClick={closeMenu}
                  className="mobile-auth-link vendor-login"
                >
                  <FaStore className="auth-icon" aria-hidden="true" />
                  <span>Vendor Log In</span>
                </NavLink>
              ) : (
                <>
                  <NavLink
                    to="/vendor-dashboard"
                    onClick={closeMenu}
                    className="mobile-auth-link vendor-dashboard"
                  >
                    <FaStore className="auth-icon" aria-hidden="true" />
                    <span>Vendor Dashboard</span>
                  </NavLink>
                  <button
                    className="mobile-auth-link logout"
                    onClick={handleVendorLogout}
                    type="button"
                  >
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
                <FaShieldAlt className="tagline-icon" aria-hidden="true" />
                Revolutionising procurement with AI
              </p>
              <div className="mobile-contact">
                <a 
                  href="mailto:hello@tendorai.com" 
                  className="mobile-contact-link"
                  aria-label="Send email to hello@tendorai.com"
                >
                  <FaEnvelope className="contact-icon" aria-hidden="true" />
                  <span>hello@tendorai.com</span>
                </a>
                <a 
                  href="tel:+442079460958" 
                  className="mobile-contact-link"
                  aria-label="Call +44 20 7946 0958"
                >
                  <FaPhone className="contact-icon" aria-hidden="true" />
                  <span>+44 20 7946 0958</span>
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {uiState.menuOpen && (
        <div 
          className="mobile-nav-overlay" 
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}
    </>
  ));

  return (
    <nav 
      className={`navbar ${uiState.isScrolled ? 'navbar-scrolled' : ''} ${uiState.isMounted ? 'mounted' : ''}`} 
      ref={navbarRef}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="navbar-container">
        {/* Brand Logo */}
        <div className="navbar-brand">
          <NavLink 
            to="/" 
            onClick={closeMenu} 
            className="brand-link"
            aria-label="TendorAI - Return to homepage"
          >
            <div className="logo-container">
              <span className="logo-text">TENDORAI</span>
              <span className="logo-tagline">AI Procurement Platform</span>
            </div>
          </NavLink>
        </div>

        {/* Desktop Navigation */}
        <nav className="navbar-nav" role="navigation" aria-label="Main navigation">
          {NAVIGATION_LINKS.slice(0, 2).map((link) => (
            <NavigationLink key={link.to} {...link} />
          ))}
          
          <ServicesDropdown />
          
          {NAVIGATION_LINKS.slice(2).map((link) => (
            <NavigationLink key={link.to} {...link} />
          ))}
        </nav>

        {/* Authentication Section */}
        <AuthenticationSection />

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={toggleMenu}
          aria-label={uiState.menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={uiState.menuOpen}
          aria-controls="mobile-navigation"
          type="button"
        >
          {uiState.menuOpen ? (
            <FaTimes aria-hidden="true" />
          ) : (
            <FaBars aria-hidden="true" />
          )}
        </button>

        {/* Mobile Navigation */}
        <MobileNavigation />
      </div>
    </nav>
  );
};

// Export memoized component for performance
export default React.memo(NavigationBar);