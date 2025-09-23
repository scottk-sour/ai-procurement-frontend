/**
 * NavigationBar.js
 * Production-ready navigation component for TendorAI
 *
 * Features:
 * - Dynamic overflow handling -> moves excessive nav links into a "More" dropdown
 * - Accessible dropdowns (Services & More) with keyboard support
 * - Mobile nav with overlay and scroll-lock
 * - User/Vendor auth display + logout flows
 * - Debounced ResizeObserver + window resize for performance
 *
 * Usage:
 * import NavigationBar from './NavigationBar';
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

  // Overflow state: items moved from main nav into "More"
  const [overflowIndices, setOverflowIndices] = useState([]);

  // refs
  const navContainerRef = useRef(null);
  const navLinksRef = useRef([]); // array of refs for each nav link
  const brandRef = useRef(null);
  const authRef = useRef(null);
  const servicesRef = useRef(null);
  const moreRef = useRef(null);
  const mobileNavRef = useRef(null);

  // Clean up ref list
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

  // Close on route change
  useEffect(() => {
    closeAll();
  }, [location.pathname, closeAll]);

  // Scroll state for styling
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Escape key to close
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeAll();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeAll]);

  // Click outside for dropdowns / mobile nav
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
      if (mobileNavRef.current && !mobileNavRef.current.contains(e.target)) {
        // don't close mobile if clicked the toggle - handled elsewhere
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Scroll lock when mobile menu open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  /* ---------------------- Dynamic overflow algorithm --------------------- */
  // Purpose: compute which nav items fit in the center area and which must move to "More"
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

    // available space in the center area: total width minus brand and auth and small margins
    const total = Math.ceil(container.getBoundingClientRect().width);
    const safety = 24; // small padding buffer
    const availableCenter = Math.max(0, total - brandWidth - authWidth - safety);

    // compute cumulative widths for nav link nodes
    const widths = (navLinksRef.current || []).map((el) =>
      el ? Math.ceil(el.getBoundingClientRect().width) : 0
    );

    // Always keep services width accounted for (we show the services trigger in the center)
    // Our nav links are the NAVIGATION_LINKS array. We'll try to fit them left-to-right.
    // If they don't fit, we mark their indices as overflowed.
    const resultOverflow = [];
    let used = servicesWidth; // services trigger included among center items
    for (let i = 0; i < widths.length; i++) {
      used += widths[i];
      if (used > availableCenter) {
        // Mark this and all following as overflow
        for (let j = i; j < widths.length; j++) resultOverflow.push(j);
        break;
      }
      // small gap accounted for implicitly
    }

    // Save state only when changed to avoid re-renders
    const same =
      resultOverflow.length === overflowIndices.length &&
      resultOverflow.every((v, idx) => overflowIndices[idx] === v);
    if (!same) setOverflowIndices(resultOverflow);
  }, [overflowIndices]);

  // Debounce helper
  const debounce = (fn, ms = 120) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  };

  // Resize observer + window resize
  useLayoutEffect(() => {
    if (!navContainerRef.current) return;
    const ro = new ResizeObserver(debounce(() => measureOverflow(), 100));
    ro.observe(navContainerRef.current);

    // Also observe brand/auth to react to their width changes (fonts, contents)
    if (brandRef.current) ro.observe(brandRef.current);
    if (authRef.current) ro.observe(authRef.current);

    // initial measure
    measureOverflow();

    window.addEventListener("resize", debounce(measureOverflow, 80));
    // remeasure after fonts load or images
    const idle = setTimeout(measureOverflow, 300);

    return () => {
      ro.disconnect();
      clearTimeout(idle);
      window.removeEventListener("resize", debounce(measureOverflow, 80));
    };
  }, [measureOverflow]);

  /* ---------------------- Render helpers & layout ------------------------- */

  // Build arrays for rendering: which nav links are primary (fit) vs overflow (More)
  const primaryNavItems = useMemo(() => {
    return NAVIGATION_LINKS.filter((_, idx) => !overflowIndices.includes(idx));
  }, [overflowIndices]);

  const overflowNavItems = useMemo(() => {
    return NAVIGATION_LINKS.filter((_, idx) => overflowIndices.includes(idx));
  }, [overflowIndices]);

  // Utility: get ref for each nav link
  const setNavLinkRef = (el, idx) => {
    navLinksRef.current[idx] = el;
  };

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

          {/* NAV CENTER - dynamic */}
          <div className="navbar-nav" aria-hidden={isMenuOpen}>
            {/* Render first N items (primaryNavItems) */}
            {NAVIGATION_LINKS.map((link, idx) => {
              // If index is overflowed, we still render a hidden element for measurement,
              // but placed with visibility: hidden and no pointer events (so measurement works).
              const isOverflowed = overflowIndices.includes(idx);
              const shouldRender =
                !isOverflowed && primaryNavItems.find((l) => l.to === link.to);

              // Render a visible item if it's among primary
              return shouldRender ? (
                <NavLinkItem
                  key={link.to}
                  to={link.to}
                  label={link.label}
                  exact={!!link.exact}
                  onClick={closeAll}
                  className="center-nav-item"
                  ref={null}
                />
              ) : null;
            })}

            {/* Services dropdown trigger (always visible in center) */}
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
                aria-controls="services-menu"
                onClick={() => setIsServicesOpen((s) => !s)}
                type="button"
              >
                Services <FaChevronDown className={`dropdown-icon ${isServicesOpen ? "open" : ""}`} />
              </button>

              {isServicesOpen && (
                <div
                  id="services-menu"
                  role="menu"
                  className="dropdown-menu services-menu"
                >
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

            {/* Render the remaining primary items after Services */}
            {NAVIGATION_LINKS.map((link, idx) => {
              const isOverflowed = overflowIndices.includes(idx);
              const shouldRender =
                !isOverflowed &&
                primaryNavItems.find((l) => l.to === link.to) &&
                // prevent duplicates: some were already rendered before services earlier
                !NAVIGATION_LINKS.slice(0, 2).includes(link);

              if (!shouldRender) return null;
              return (
                <NavLinkItem
                  key={link.to}
                  to={link.to}
                  label={link.label}
                  exact={!!link.exact}
                  onClick={closeAll}
                  className="center-nav-item"
                />
              );
            })}

            {/* More dropdown (if overflowed items exist) */}
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
                  aria-controls="more-menu"
                  onClick={() => setIsMoreOpen((s) => !s)}
                  type="button"
                >
                  More <FaChevronDown className={`dropdown-icon ${isMoreOpen ? "open" : ""}`} />
                </button>

                {isMoreOpen && (
                  <div id="more-menu" role="menu" className="dropdown-menu small-menu">
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

          {/* AUTH / CTA group */}
          <div className="navbar-auth" ref={authRef}>
            {/* USER */}
            {!isUserLoggedIn ? (
              <div className="user-auth-section">
                <NavLink
                  to="/login"
                  className="auth-link login-link"
                  onClick={closeAll}
                >
                  <FaUser className="auth-icon" aria-hidden /> <span>User Login</span>
                </NavLink>

                <NavLink
                  to="/signup"
                  className="auth-link signup-link cta-button"
                  onClick={closeAll}
                >
                  <span>User Sign Up</span>
                </NavLink>
              </div>
            ) : (
              <div className="user-menu authenticated">
                <NavLink
                  to="/dashboard"
                  className="auth-link dashboard-link"
                  onClick={closeAll}
                >
                  <FaUser className="auth-icon" aria-hidden />
                  <span className="user-name">{userName}</span>
                </NavLink>

                <button
                  className="auth-link logout-link"
                  onClick={handleLogout}
                  aria-label="Log out"
                >
                  <span>Log Out</span>
                </button>
              </div>
            )}

            {/* VENDOR */}
            {!isVendorLoggedIn ? (
              <div className="vendor-auth-section">
                <NavLink
                  to="/vendor-login"
                  className="auth-link vendor-link"
                  onClick={closeAll}
                >
                  <FaStore className="auth-icon" aria-hidden />
                  <span>Vendor Login</span>
                </NavLink>

                <NavLink
                  to="/vendor-signup"
                  className="auth-link vendor-signup-link cta-button"
                  onClick={closeAll}
                >
                  <span>Vendor Sign Up</span>
                </NavLink>
              </div>
            ) : (
              <div className="vendor-menu authenticated">
                <NavLink
                  to="/vendor-dashboard"
                  className="auth-link vendor-dashboard-link"
                  onClick={closeAll}
                >
                  <FaStore className="auth-icon" aria-hidden />
                  <span>Vendor Dashboard</span>
                </NavLink>

                <button
                  className="auth-link logout-link"
                  onClick={handleVendorLogout}
                  aria-label="Vendor log out"
                >
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>

      {/* MOBILE NAV (drawer) */}
      {isMenuOpen && (
        <>
          <div className="mobile-nav-overlay" onClick={closeAll} />
          <div id="mobile-nav" ref={mobileNavRef} className="mobile-nav active" role="dialog" aria-modal="true">
            <div className="mobile-nav-content">
              <nav className="mobile-nav-section" aria-label="Mobile primary">
                {NAVIGATION_LINKS.map((link, idx) => (
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

              {/* Auth blocks on mobile */}
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
                      <FaEnvelope className="contact-icon" /> <span>hello@tendorai.com</span>
                    </a>
                    <a href="tel:+442079460958" className="mobile-contact-link">
                      <FaPhone className="contact-icon" /> <span>+44 20 7946 0958</span>
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
