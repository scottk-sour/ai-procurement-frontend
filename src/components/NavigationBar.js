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
  { to: "/how-it-works", label: "How It Works", exact: false },
  { to: "/about-us", label: "About Us", exact: false },
  { to: "/contact", label: "Contact", exact: false },
  { to: "/faq", label: "FAQ", exact: false }
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
    }, 10);
  }, []);

  // Menu control functions
  const toggleMenu = useCallback(() => {
    setUiState(prev => ({
      ...prev,
      menuOpen: !prev.menuOpen,
      isDropdownOpen: false
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

  // Enhanced navigation handler
  const handleNavigation = useCallback((path, shouldReplace = false) => {
    try {
      closeMenu();
      closeDropdown();
      
      // Small delay to allow menu animation to start
      setTimeout(() => {
        if (shouldReplace) {
          navigate(path, { replace: true });
        } else {
          navigate(path);
        }
      }, 100);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to window.location if navigate fails
      window.location.href = path;
    }
  }, [navigate, closeMenu, closeDropdown]);

  // Authentication handlers
  const handleLogout = useCallback(() => {
    try {
      logout();
      handleNavigation("/login", true);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [logout, handleNavigation]);

  const handleVendorLogout = useCallback(() => {
    try {
      logout();
      handleNavigation("/vendor-login", true);
    } catch (error) {
      console.error('Vendor logout error:', error);
    }
  }, [logout, handleNavigation]);

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
      closeDropdown();
    }
  }, [closeMenu, closeDropdown]);

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
    setUiState(prev => ({ ...prev, isMounted: true }));
    
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Close menu on route change
  useEffect(() => {
    closeMenu();
    closeDropdown();
    window.scrollTo(0, 0);
  }, [pathname, closeMenu, closeDropdown]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutsideDropdown);
    return () => document.removeEventListener('mousedown', handleClickOutsideDropdown);
  }, [handleClickOutsideDropdown]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutsideMobileMenu);
    return () => document.removeEventListener('mousedown', handleClickOutsideMobileMenu);
  }, [handleClickOutsideMobileMenu]);

  useEffect(() => {
    if (uiState.menuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [uiState.menuOpen]);

  useEffect(() => {
    if (uiState.isDropdownOpen && dropdownRef.current) {
      const firstFocusableElement = dropdownRef.current.querySelector('a, button');
      if (firstFocusableElement) {
        firstFocusableElement.focus();
      }
    }
  }, [uiState.isDropdownOpen]);

  // Enhanced Navigation Link component
  const NavigationLink = React.memo(({ to, label, exact = false, onClick }) => {
    const handleClick = useCallback((e) => {
      e.preventDefault();
      if (onClick) onClick();
      handleNavigation(to);
    }, [to, onClick]);

    return (
      <NavLink
        to={to}
        end={exact}
        onClick={handleClick}
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        aria-current={pathname === to ? 'page' : undefined}
      >
        {label}
      </NavLink>
    );
  });

  // Enhanced Service Link component
  const ServiceLink = React.memo(({ service, className = "", onClick }) => {
    const handleClick = useCallback((e) => {
      e.preventDefault();
      if (onClick) onClick();
      handleNavigation(service.to);
    }, [service.to, onClick]);

    return (
      <NavLink
        to={service.to}
        onClick={handleClick}
        className={className}
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
    );
  });

  // Enhanced Button component for auth actions
  const AuthButton = React.memo(({ onClick, className, children, ariaLabel, type = "button" }) => (
    <button
      className={className}
      onClick={onClick}
      aria-label={ariaLabel}
      type={type}
    >
      {children}
    </button>
  ));

  // Enhanced NavLink component for auth links
  const AuthNavLink = React.memo(({ to, className, children, ariaLabel, onClick }) => {
    const handleClick = useCallback((e) => {
      e.preventDefault();
      if (onClick) onClick();
      handleNavigation(to);
    }, [to, onClick]);

    return (
      <NavLink
        to={to}
        className={className}
        onClick={handleClick}
        aria-label={ariaLabel}
      >
        {children}
      </NavLink>
    );
  });

  // Render authentication section
  const AuthenticationSection = React.memo(() => (
    <div className="navbar-auth">
      {/* User Authentication */}
      {!isUserLoggedIn ? (
        <div className="user-auth-section">
          <AuthNavLink
            to="/login"
            className="auth-link login-link"
            ariaLabel="User login"
          >
            <FaUser className="auth-icon" aria-hidden="true" />
            <span>User Login</span>
          </AuthNavLink>
          <AuthNavLink
            to="/signup"
            className="auth-link signup-link cta-button"
            ariaLabel="Create user account"
          >
            <span>User Sign Up</span>
          </AuthNavLink>
        </div>
      ) : (
        <div className="user-menu authenticated">
          <AuthNavLink
            to="/dashboard"
            className={({ isActive }) => `auth-link dashboard-link ${isActive ? 'active' : ''}`}
            ariaLabel={`${userName}'s dashboard`}
          >
            <FaUser className="auth-icon" aria-hidden="true" />
            <span className="user-name">{userName}</span>
          </AuthNavLink>
          <AuthButton
            className="auth-link logout-link"
            onClick={handleLogout}
            ariaLabel="Log out"
          >
            <span>Log Out</span>
          </AuthButton>
        </div>
      )}

      {/* Vendor Authentication */}
      {!isVendorLoggedIn ? (
        <div className="vendor-auth-section">
          <AuthNavLink
            to="/vendor-login"
            className="auth-link vendor-link"
            ariaLabel="Vendor portal login"
          >
            <FaStore className="auth-icon" aria-hidden="true" />
            <span>Vendor Login</span>
          </AuthNavLink>
          <AuthNavLink
            to="/vendor-signup"
            className="auth-link vendor-signup-link cta-button"
            ariaLabel="Create vendor account"
          >
            <span>Vendor Sign Up</span>
          </AuthNavLink>
        </div>
      ) : (
        <div className="vendor-menu authenticated">
          <AuthNavLink
            to="/vendor-dashboard"
            className={({ isActive }) => `auth-link vendor-dashboard-link ${isActive ? 'active' : ''}`}
            ariaLabel="Vendor dashboard"
          >
            <FaStore className="auth-icon" aria-hidden="true" />
            <span>Vendor Dashboard</span>
          </AuthNavLink>
          <AuthButton
            className="auth-link logout-link"
            onClick={handleVendorLogout}
            ariaLabel="Log out from vendor portal"
          >
            <span>Log Out</span>
          </AuthButton>
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
              <ServiceLink
                key={service.to}
                service={service}
                className="dropdown-item"
                onClick={closeMenu}
              />
            ))}
          </div>
          
          <div className="dropdown-footer">
            <AuthNavLink
              to="/services"
              onClick={closeMenu}
              className="dropdown-cta"
            >
              View All Services →
            </AuthNavLink>
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
              <NavigationLink
                key={link.to}
                to={link.to}
                label={link.label}
                exact={link.exact}
                onClick={closeMenu}
              />
            ))}

            {/* Mobile Services */}
            <div className="mobile-services">
              <h4 className="mobile-section-title">Services</h4>
              {SERVICE_LINKS.map((service) => (
                <ServiceLink
                  key={service.to}
                  service={service}
                  className="mobile-service-link"
                  onClick={closeMenu}
                />
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
                  <AuthNavLink
                    to="/login"
                    onClick={closeMenu}
                    className="mobile-auth-link login"
                  >
                    <FaUser className="auth-icon" aria-hidden="true" />
                    <span>User Login</span>
                  </AuthNavLink>
                  <AuthNavLink
                    to="/signup"
                    onClick={closeMenu}
                    className="mobile-auth-link signup cta-button"
                  >
                    <span>User Sign Up</span>
                  </AuthNavLink>
                </>
              ) : (
                <>
                  <AuthNavLink
                    to="/dashboard"
                    onClick={closeMenu}
                    className="mobile-auth-link dashboard"
                  >
                    <FaUser className="auth-icon" aria-hidden="true" />
                    <span>{userName}'s Dashboard</span>
                  </AuthNavLink>
                  <AuthButton
                    className="mobile-auth-link logout"
                    onClick={handleLogout}
                  >
                    <span>Log Out</span>
                  </AuthButton>
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
                <>
                  <AuthNavLink
                    to="/vendor-login"
                    onClick={closeMenu}
                    className="mobile-auth-link vendor-login"
                  >
                    <FaStore className="auth-icon" aria-hidden="true" />
                    <span>Vendor Login</span>
                  </AuthNavLink>
                  <AuthNavLink
                    to="/vendor-signup"
                    onClick={closeMenu}
                    className="mobile-auth-link vendor-signup cta-button"
                  >
                    <span>Vendor Sign Up</span>
                  </AuthNavLink>
                </>
              ) : (
                <>
                  <AuthNavLink
                    to="/vendor-dashboard"
                    onClick={closeMenu}
                    className="mobile-auth-link vendor-dashboard"
                  >
                    <FaStore className="auth-icon" aria-hidden="true" />
                    <span>Vendor Dashboard</span>
                  </AuthNavLink>
                  <AuthButton
                    className="mobile-auth-link logout"
                    onClick={handleVendorLogout}
                  >
                    <span>Log Out</span>
                  </AuthButton>
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
          <AuthNavLink
            to="/"
            onClick={closeMenu}
            className="brand-link"
            ariaLabel="TendorAI - Return to homepage"
          >
            <div className="logo-container">
              <span className="logo-text">TENDORAI</span>
              <span className="logo-tagline">AI Procurement Platform</span>
            </div>
          </AuthNavLink>
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

export default React.memo(NavigationBar);
