/**
 * NavigationBar.js
 * Production-ready navigation component for TendorAI
 */

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaStore,
  FaChevronDown,
  FaBars,
  FaTimes,
  FaShieldAlt,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import "./NavigationBar.css";

/* ----------------------------- Config / Content ---------------------------- */
const SERVICE_LINKS = [
  {
    to: "/services/photocopiers",
    label: "Photocopiers & Printers",
    description: "Advanced office printing solutions and multifunction devices",
    icon: "🖨️",
  },
  {
    to: "/services/telecoms",
    label: "Telecoms & Communications",
    description: "Business phone systems and unified communications",
    icon: "📞",
  },
  {
    to: "/services/cctv",
    label: "CCTV & Security",
    description: "Comprehensive security camera and monitoring systems",
    icon: "🔒",
  },
  {
    to: "/services/it",
    label: "IT Solutions & Support",
    description: "Complete technology infrastructure and support services",
    icon: "💻",
  },
];

const NAVIGATION_LINKS = [
  { to: "/", label: "Home", exact: true },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/about-us", label: "About Us" },
  { to: "/contact", label: "Contact" },
  { to: "/faq", label: "FAQ" },
];

/* ----------------------------- Helper components --------------------------- */

const NavLinkItem = React.memo(function NavLinkItem({
  to,
  label,
  exact = false,
  onClick,
  className = "",
}) {
  return (
    <NavLink
      to={to}
      end={exact}
      onClick={onClick}
      className={({ isActive }) =>
        `nav-link ${isActive ? "active" : ""} ${className}`
      }
    >
      {label}
    </NavLink>
  );
});

const ServiceLinkItem = React.memo(function ServiceLinkItem({
  service,
  onClick,
  className = "",
}) {
  return (
    <NavLink
      to={service.to}
      onClick={onClick}
      className={({ isActive }) =>
        `dropdown-item ${isActive ? "active" : ""} ${className}`
      }
    >
      <div className="dropdown-item-content">
        <span className="dropdown-item-icon" aria-hidden>
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
/* ----------------------------- Main component ------------------------------ */

const NavigationBar = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Auth state helpers
  const isUserLoggedIn = auth?.isAuthenticated && auth.user?.role === "user";
  const isVendorLoggedIn =
    auth?.isAuthenticated && auth.user?.role === "vendor";
  const userName = auth?.user?.name || "User";

  // UI state
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Overflow state
  const [overflowIndices, setOverflowIndices] = useState([]);

  // refs
  const navContainerRef = useRef(null);
  const navLinksRef = useRef([]);
  const brandRef = useRef(null);
  const authRef = useRef(null);
  const servicesRef = useRef(null);
  const moreRef = useRef(null);
  const mobileNavRef = useRef(null);

  navLinksRef.current = [];

  // Toggles
  const toggleMenu = useCallback(() => setIsMenuOpen((s) => !s), []);
  const closeAll = useCallback(() => {
    setIsMenuOpen(false);
    setIsServicesOpen(false);
    setIsMoreOpen(false);
  }, []);

  // Logout helpers
  const handleLogout = useCallback(() => {
    try {
      logout();
      closeAll();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
      window.location.href = "/login";
    }
  }, [logout, closeAll, navigate]);

  const handleVendorLogout = useCallback(() => {
    try {
      logout();
      closeAll();
      navigate("/vendor-login", { replace: true });
    } catch (err) {
      console.error("Vendor logout error:", err);
      window.location.href = "/vendor-login";
    }
  }, [logout, closeAll, navigate]);

  // **FIXED: Request Quote Navigation**
  const handleRequestQuote = useCallback(() => {
    closeAll();
    navigate("/request-quote");
  }, [closeAll, navigate]);

  // Close on route change
  useEffect(() => {
    closeAll();
  }, [location.pathname, closeAll]);

  // Scroll state
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeAll();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeAll]);

  // Click outside
  useEffect(() => {
    const onClick = (e) => {
      if (
        servicesRef.current &&
        !servicesRef.current.contains(e.target) &&
        !e.target.closest(".dropdown-trigger-services")
      ) {
        setIsServicesOpen(false);
      }
      if (
        moreRef.current &&
        !moreRef.current.contains(e.target) &&
        !e.target.closest(".dropdown-trigger-more")
      ) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);
  /* ---------------------- Dynamic overflow algorithm --------------------- */
  const measureOverflow = useCallback(() => {
    const container = navContainerRef.current;
    if (!container) return;

    const brandWidth = brandRef.current
      ? Math.ceil(brandRef.current.getBoundingClientRect().width)
      : 0;
    const authWidth = authRef.current
      ? Math.ceil(authRef.current.getBoundingClientRect().width)
      : 0;
    const servicesWidth = servicesRef.current
      ? Math.ceil(servicesRef.current.getBoundingClientRect().width)
      : 0;

    const total = Math.ceil(container.getBoundingClientRect().width);
    const safety = 24;
    const availableCenter = Math.max(0, total - brandWidth - authWidth - safety);

    const widths = (navLinksRef.current || []).map((el) =>
      el ? Math.ceil(el.getBoundingClientRect().width) : 0
    );

    const resultOverflow = [];
    let used = servicesWidth;
    for (let i = 0; i < widths.length; i++) {
      used += widths[i];
      if (used > availableCenter) {
        for (let j = i; j < widths.length; j++) resultOverflow.push(j);
        break;
      }
    }

    const same =
      resultOverflow.length === overflowIndices.length &&
      resultOverflow.every((v, idx) => overflowIndices[idx] === v);
    if (!same) setOverflowIndices(resultOverflow);
  }, [overflowIndices]);

  const debounce = (fn, ms = 120) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  };

  useLayoutEffect(() => {
    if (!navContainerRef.current) return;
    const ro = new ResizeObserver(debounce(() => measureOverflow(), 100));
    ro.observe(navContainerRef.current);

    if (brandRef.current) ro.observe(brandRef.current);
    if (authRef.current) ro.observe(authRef.current);

    measureOverflow();

    window.addEventListener("resize", debounce(measureOverflow, 80));
    const idle = setTimeout(measureOverflow, 300);

    return () => {
      ro.disconnect();
      clearTimeout(idle);
      window.removeEventListener("resize", debounce(measureOverflow, 80));
    };
  }, [measureOverflow]);

  const primaryNavItems = useMemo(() => {
    return NAVIGATION_LINKS.filter((_, idx) => !overflowIndices.includes(idx));
  }, [overflowIndices]);

  const overflowNavItems = useMemo(() => {
    return NAVIGATION_LINKS.filter((_, idx) => overflowIndices.includes(idx));
  }, [overflowIndices]);

  return (
    <>
      <nav
        className={`navbar ${isScrolled ? "navbar-scrolled" : ""}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="navbar-container" ref={navContainerRef}>
          {/* BRAND */}
          <div className="navbar-brand" ref={brandRef}>
            <NavLink to="/" className="brand-link" onClick={closeAll}>
              <div className="logo-container">
                <span className="logo-text">TENDORAI</span>
                <span className="logo-tagline">AI Procurement Platform</span>
              </div>
            </NavLink>
          </div>

          {/* NAV CENTER */}
          <div className="navbar-nav" aria-hidden={isMenuOpen}>
            {NAVIGATION_LINKS.map((link, idx) => {
              const isOverflowed = overflowIndices.includes(idx);
              const shouldRender =
                !isOverflowed && primaryNavItems.find((l) => l.to === link.to);

              return shouldRender ? (
                <NavLinkItem
                  key={link.to}
                  to={link.to}
                  label={link.label}
                  exact={!!link.exact}
                  onClick={closeAll}
                  className="center-nav-item"
                />
              ) : null;
            })}
{/* Services dropdown */}
            <div
              className="dropdown-container services-container"
              ref={servicesRef}
              onMouseEnter={() => setIsServicesOpen(true)}
              onMouseLeave={() => setIsServicesOpen(false)}
            >
              <button
                className="nav-link dropdown-trigger dropdown-trigger-services"
                aria-haspopup="true"
                aria-expanded={isServicesOpen}
                onClick={() => setIsServicesOpen((s) => !s)}
                type="button"
              >
                Services <FaChevronDown className={`dropdown-icon ${isServicesOpen ? "open" : ""}`} />
              </button>

              {isServicesOpen && (
                <div role="menu" className="dropdown-menu services-menu">
                  <div className="dropdown-header">
                    <h4>Our Services</h4>
                    <p>Find the right suppliers for your business needs</p>
                  </div>

                  <div className="dropdown-grid">
                    {SERVICE_LINKS.map((s) => (
                      <ServiceLinkItem
                        key={s.to}
                        service={s}
                        onClick={closeAll}
                      />
                    ))}
                  </div>

                  <div className="dropdown-footer">
                    <NavLink
                      to="/services"
                      onClick={closeAll}
                      className="dropdown-cta"
                    >
                      View All Services →
                    </NavLink>
                  </div>
                </div>
              )}
            </div>

            {/* More dropdown */}
            {overflowNavItems.length > 0 && (
              <div
                className="dropdown-container more-container"
                ref={moreRef}
                onMouseEnter={() => setIsMoreOpen(true)}
                onMouseLeave={() => setIsMoreOpen(false)}
              >
                <button
                  className="nav-link dropdown-trigger dropdown-trigger-more"
                  aria-haspopup="true"
                  aria-expanded={isMoreOpen}
                  onClick={() => setIsMoreOpen((s) => !s)}
                  type="button"
                >
                  More <FaChevronDown className={`dropdown-icon ${isMoreOpen ? "open" : ""}`} />
                </button>

                {isMoreOpen && (
                  <div role="menu" className="dropdown-menu small-menu">
                    {overflowNavItems.map((link) => (
                      <NavLinkItem
                        key={link.to}
                        to={link.to}
                        label={link.label}
                        exact={!!link.exact}
                        onClick={closeAll}
                        className="dropdown-item"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AUTH SECTION */}
          <div className="navbar-auth" ref={authRef}>
            {!isUserLoggedIn ? (
              <div className="user-auth-section">
                <NavLink
                  to="/login"
                  className="auth-link login-link"
                  onClick={closeAll}
                >
                  <FaUser className="auth-icon" /> Login
                </NavLink>

                <NavLink
                  to="/signup"
                  className="auth-link signup-link cta-button"
                  onClick={closeAll}
                >
                  Sign Up
                </NavLink>
              </div>
            ) : (
              <div className="user-menu authenticated">
                {/* **FIXED: Request Quote Button** */}
                <button
                  className="auth-link request-quote-button cta-button"
                  onClick={handleRequestQuote}
                  aria-label="Request a quote"
                >
                  Request Quote
                </button>

                <NavLink
                  to="/dashboard"
                  className="auth-link dashboard-link"
                  onClick={closeAll}
                >
                  <FaUser className="auth-icon" />
                  {userName}
                </NavLink>

                <button
                  className="auth-link logout-link"
                  onClick={handleLogout}
                  aria-label="Log out"
                >
                  Log Out
                </button>
              </div>
            )}

            {!isVendorLoggedIn && (
              <div className="vendor-auth-section">
                <NavLink
                  to="/vendor-login"
                  className="auth-link vendor-link"
                  onClick={closeAll}
                >
                  <FaStore className="auth-icon" />
                  Vendor
                </NavLink>
              </div>
            )}

            {isVendorLoggedIn && (
              <div className="vendor-menu authenticated">
                <NavLink
                  to="/vendor-dashboard"
                  className="auth-link vendor-dashboard-link"
                  onClick={closeAll}
                >
                  <FaStore className="auth-icon" />
                  Vendor
                </NavLink>

                <button
                  className="auth-link logout-link"
                  onClick={handleVendorLogout}
                >
                  Log Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>
{/* MOBILE NAV */}
      {isMenuOpen && (
        <>
          <div className="mobile-nav-overlay" onClick={closeAll} />
          <div id="mobile-nav" ref={mobileNavRef} className="mobile-nav active" role="dialog" aria-modal="true">
            <div className="mobile-nav-content">
              <nav className="mobile-nav-section" aria-label="Mobile primary">
                {NAVIGATION_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={closeAll}
                    className="mobile-nav-link"
                    aria-current={location.pathname === link.to ? "page" : undefined}
                  >
                    {link.label}
                  </NavLink>
                ))}

                <div className="mobile-services">
                  <h4 className="mobile-section-title">Services</h4>
                  {SERVICE_LINKS.map((s) => (
                    <NavLink
                      key={s.to}
                      to={s.to}
                      onClick={closeAll}
                      className="mobile-service-link"
                    >
                      <span className="mobile-service-icon" aria-hidden>{s.icon}</span>
                      <div className="mobile-service-content">
                        <span className="mobile-service-title">{s.label}</span>
                        <span className="mobile-service-desc">{s.description}</span>
                      </div>
                    </NavLink>
                  ))}
                </div>
              </nav>

              {/* Mobile Auth */}
              <div className="mobile-auth-section">
                <div className="mobile-user-auth">
                  <h4 className="mobile-section-title"><FaUser className="section-icon" />User Account</h4>
                  {!isUserLoggedIn ? (
                    <>
                      <NavLink to="/login" onClick={closeAll} className="mobile-auth-link login">Login</NavLink>
                      <NavLink to="/signup" onClick={closeAll} className="mobile-auth-link signup">Sign Up</NavLink>
                    </>
                  ) : (
                    <>
                      {/* **FIXED: Mobile Request Quote Button** */}
                      <button 
                        onClick={() => { handleRequestQuote(); closeAll(); }} 
                        className="mobile-auth-link request-quote"
                      >
                        Request Quote
                      </button>
                      <NavLink to="/dashboard" onClick={closeAll} className="mobile-auth-link dashboard">{userName}'s Dashboard</NavLink>
                      <button onClick={() => { handleLogout(); closeAll(); }} className="mobile-auth-link logout">Log Out</button>
                    </>
                  )}
                </div>

                <div className="mobile-vendor-auth">
                  <h4 className="mobile-section-title"><FaStore className="section-icon" />Vendor Portal</h4>
                  {!isVendorLoggedIn ? (
                    <>
                      <NavLink to="/vendor-login" onClick={closeAll} className="mobile-auth-link vendor-login">Vendor Login</NavLink>
                      <NavLink to="/vendor-signup" onClick={closeAll} className="mobile-auth-link vendor-signup">Vendor Sign Up</NavLink>
                    </>
                  ) : (
                    <>
                      <NavLink to="/vendor-dashboard" onClick={closeAll} className="mobile-auth-link vendor-dashboard">Vendor Dashboard</NavLink>
                      <button onClick={() => { handleVendorLogout(); closeAll(); }} className="mobile-auth-link logout">Log Out</button>
                    </>
                  )}
                </div>
              </div>

              <footer className="mobile-nav-footer">
                <div className="mobile-footer-content">
                  <p className="mobile-tagline"><FaShieldAlt className="tagline-icon" />Revolutionising procurement with AI</p>
                  <div className="mobile-contact">
                    <a href="mailto:hello@tendorai.com" className="mobile-contact-link">
                      <FaEnvelope className="contact-icon" /> hello@tendorai.com
                    </a>
                    <a href="tel:+442079460958" className="mobile-contact-link">
                      <FaPhone className="contact-icon" /> +44 20 7946 0958
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

export default React.memo(NavigationBar);
