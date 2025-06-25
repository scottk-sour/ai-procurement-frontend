// src/components/NavigationBar.js
import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import './NavigationBar.css';
import { FaUser, FaStore } from 'react-icons/fa';
import { gsap } from 'gsap';
import { useAuth } from "../context/AuthContext";

const NavigationBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dropdownContainerRef = useRef(null);
  const navbarRef = useRef(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { auth, logout } = useAuth();

  const isUserLoggedIn = auth.isAuthenticated && auth.user?.role === "user";
  const isVendorLoggedIn = auth.isAuthenticated && auth.user?.role === "vendor";

  const toggleMenu = () => setMenuOpen(prev => !prev);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Animate navbar in
    if (navbarRef.current) {
      gsap.fromTo(
        navbarRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
      );
    }

    // Animate dropdown open
    if (isDropdownOpen && dropdownRef.current) {
      gsap.fromTo(
        dropdownRef.current,
        { opacity: 0, y: -10, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' }
      );
    }

    // Animate mobile menu open
    if (menuOpen) {
      const linksEl = document.querySelector('.navbar-links.active');
      if (linksEl) {
        gsap.fromTo(
          linksEl,
          { opacity: 0, height: 0 },
          { opacity: 1, height: 'auto', duration: 0.5, ease: 'power2.out' }
        );
      }
    }
  }, [isDropdownOpen, menuOpen, pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const onClickOutside = e => {
      if (dropdownContainerRef.current && !dropdownContainerRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Keyboard accessibility for dropdown
  const handleKeyDown = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      setIsDropdownOpen(prev => !prev);
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  return (
    <nav className="navbar" ref={navbarRef}>
      <div className="navbar-content">
        <div className="navbar-brand">
          <NavLink to="/" onClick={() => setMenuOpen(false)}>
            <span className="logo">TENDORAI</span>
          </NavLink>
        </div>

        <button
          className="hamburger"
          onClick={toggleMenu}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        <div className={`navbar-links ${menuOpen ? 'active' : ''}`}>
          <NavLink to="/" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'active-link' : ''}>
            Home
          </NavLink>
          <NavLink to="/how-it-works" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'active-link' : ''}>
            How It Works
          </NavLink>

          <div
            className="dropdown-container"
            ref={dropdownContainerRef}
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            <span className="dropdown-title" role="button" aria-haspopup="true" aria-expanded={isDropdownOpen}>
              Services ▼
            </span>
            {isDropdownOpen && (
              <ul ref={dropdownRef} className="dropdown-menu">
                {[
                  { to: '/services/cctv', label: 'CCTV' },
                  { to: '/services/photocopiers', label: 'Photocopiers' },
                  { to: '/services/telecoms', label: 'Telecoms' },
                  { to: '/services/it', label: 'IT Solutions' },
                ].map(({ to, label }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      onClick={() => { setMenuOpen(false); setIsDropdownOpen(false); }}
                      className={({ isActive }) => isActive ? 'active-link' : ''}
                    >
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <NavLink to="/about-us" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'active-link' : ''}>
            About Us
          </NavLink>
          <NavLink to="/contact" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'active-link' : ''}>
            Contact
          </NavLink>
          <NavLink to="/faq" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'active-link' : ''}>
            FAQ
          </NavLink>

          {!isUserLoggedIn ? (
            <NavLink to="/login" className="user-login" onClick={() => setMenuOpen(false)}>
              <FaUser /> User Login
            </NavLink>
          ) : (
            <>
              <NavLink to="/dashboard" onClick={() => setMenuOpen(false)} className="user-login active">
                <FaUser /> Dashboard
              </NavLink>
              <button
                className="user-login"
                onClick={() => { logout(); setMenuOpen(false); navigate('/login'); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit' }}
              >
                <FaUser /> Logout
              </button>
            </>
          )}

          {!isVendorLoggedIn ? (
            <NavLink to="/vendor-login" className="vendor-login" onClick={() => setMenuOpen(false)}>
              <FaStore /> Vendor Login
            </NavLink>
          ) : (
            <>
              <NavLink to="/vendor-dashboard" onClick={() => setMenuOpen(false)} className="vendor-login active">
                <FaStore /> Vendor Dashboard
              </NavLink>
              <button
                className="vendor-login"
                onClick={() => { logout(); setMenuOpen(false); navigate('/vendor-login'); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit' }}
              >
                <FaStore /> Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
