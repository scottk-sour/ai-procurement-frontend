import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FaUser, FaStore } from 'react-icons/fa';
import { gsap } from 'gsap';
import { useAuth } from "../context/AuthContext";
import './NavigationBar.css';

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

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    // Navbar animation
    if (!navbarRef.current) {
      console.log('Oops, navbarRef is missing!');
    } else {
      try {
        gsap.fromTo(
          navbarRef.current,
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
        );
      } catch (error) {
        console.error('GSAP navbar animation error:', error);
      }
    }

    // Dropdown animation
    if (isDropdownOpen && !dropdownRef.current) {
      console.log('Oops, dropdownRef is missing!');
    } else if (isDropdownOpen && dropdownRef.current) {
      try {
        gsap.fromTo(
          dropdownRef.current,
          { opacity: 0, y: -10, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' }
        );
      } catch (error) {
        console.error('GSAP dropdown animation error:', error);
      }
    }

    // Mobile menu animation
    if (menuOpen && !navbarRef.current) {
      console.log('Oops, navbarRef is missing for mobile menu!');
    } else if (menuOpen && navbarRef.current) {
      const linksEl = navbarRef.current.querySelector('.navbar-links.active');
      if (!linksEl) {
        console.log('Oops, mobile menu links element is missing!');
      } else {
        try {
          gsap.fromTo(
            linksEl,
            { opacity: 0, height: 0 },
            { opacity: 1, height: 'auto', duration: 0.5, ease: 'power2.out' }
          );
        } catch (error) {
          console.error('GSAP mobile menu animation error:', error);
        }
      }
    }
  }, [isDropdownOpen, menuOpen, pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownContainerRef.current &&
        !dropdownContainerRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      setIsDropdownOpen((prev) => !prev);
    } else if (event.key === 'Escape') {
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
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        <div className={`navbar-links ${menuOpen ? 'active' : ''}`}>
          <NavLink
            to="/"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) => (isActive ? 'active-link' : '')}
          >
            Home
          </NavLink>

          <NavLink
            to="/how-it-works"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) => (isActive ? 'active-link' : '')}
          >
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
            <span>Services ▼</span>
            {isDropdownOpen && (
              <ul ref={dropdownRef} className="dropdown-menu">
                <li>
                  <NavLink
                    to="/services/cctv"
                    onClick={() => {
                      setMenuOpen(false);
                      setIsDropdownOpen(false);
                    }}
                    className={({ isActive }) => (isActive ? 'active-link' : '')}
                  >
                    CCTV
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/services/photocopiers"
                    onClick={() => {
                      setMenuOpen(false);
                      setIsDropdownOpen(false);
                    }}
                    className={({ isActive }) => (isActive ? 'active-link' : '')}
                  >
                    Photocopiers
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/services/telecoms"
                    onClick={() => {
                      setMenuOpen(false);
                      setIsDropdownOpen(false);
                    }}
                    className={({ isActive }) => (isActive ? 'active-link' : '')}
                  >
                    Telecoms
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/services/it"
                    onClick={() => {
                      setMenuOpen(false);
                      setIsDropdownOpen(false);
                    }}
                    className={({ isActive }) => (isActive ? 'active-link' : '')}
                  >
                    IT Solutions
                  </NavLink>
                </li>
              </ul>
            )}
          </div>

          <NavLink
            to="/about-us"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) => (isActive ? 'active-link' : '')}
          >
            About Us
          </NavLink>
          <NavLink
            to="/contact"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) => (isActive ? 'active-link' : '')}
          >
            Contact
          </NavLink>
          <NavLink
            to="/faq"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) => (isActive ? 'active-link' : '')}
          >
            FAQ
          </NavLink>

          {!isUserLoggedIn ? (
            <NavLink
              to="/login"
              className="user-login"
              onClick={() => setMenuOpen(false)}
            >
              <FaUser /> User Login
            </NavLink>
          ) : (
            <>
              <NavLink
                to="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="user-login active"
              >
                <FaUser /> Dashboard
              </NavLink>
              <button
                className="user-login"
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                  navigate("/login", { replace: false });
                }}
              >
                <FaUser /> Logout
              </button>
            </>
          )}

          {!isVendorLoggedIn ? (
            <NavLink
              to="/vendor-login"
              className="vendor-login"
              onClick={() => setMenuOpen(false)}
            >
              <FaStore /> Vendor Login
            </NavLink>
          ) : (
            <>
              <NavLink
                to="/vendor-dashboard"
                onClick={() => setMenuOpen(false)}
                className="vendor-login active"
              >
                <FaStore /> Vendor Dashboard
              </NavLink>
              <button
                className="vendor-login"
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                  navigate("/vendor-login", { replace: false });
                }}
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