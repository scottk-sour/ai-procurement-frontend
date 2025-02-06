import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './NavigationBar.css';
import { FaUser, FaStore } from 'react-icons/fa';
import { gsap } from 'gsap';

const NavigationBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ Toggles the mobile menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // ✅ Handles the dropdown animation
  useEffect(() => {
    if (isDropdownOpen) {
      gsap.fromTo(dropdownRef.current, 
        { opacity: 0, y: -10 }, 
        { opacity: 1, y: 0, duration: 0.3 }
      );
    }
  }, [isDropdownOpen]);

  return (
    <nav className="navbar">
      <div className="navbar-content">
        {/* Brand Logo */}
        <div className="navbar-brand">
          <NavLink to="/" onClick={() => setMenuOpen(false)}>
            <span className="logo">TENDORAI</span>
          </NavLink>
        </div>

        {/* Mobile Menu Toggle Button */}
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

        {/* Navigation Links */}
        <div className={`navbar-links ${menuOpen ? 'active' : ''}`}>
          <NavLink to="/" onClick={() => setMenuOpen(false)}>Home</NavLink>

          {/* ✅ Services Dropdown */}
          <div 
            className="dropdown-container"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <span className="dropdown-title">Services ▼</span>
            {isDropdownOpen && (
              <ul ref={dropdownRef} className="dropdown-menu">
                <li><NavLink to="/cctv" onClick={() => setMenuOpen(false)}>CCTV</NavLink></li>
                <li><NavLink to="/photocopiers" onClick={() => setMenuOpen(false)}>Photocopiers</NavLink></li>
                <li><NavLink to="/telecoms" onClick={() => setMenuOpen(false)}>Telecoms</NavLink></li>
              </ul>
            )}
          </div>

          <NavLink to="/about-us" onClick={() => setMenuOpen(false)}>About Us</NavLink>
          <NavLink to="/contact" onClick={() => setMenuOpen(false)}>Contact</NavLink>
          <NavLink to="/faq" onClick={() => setMenuOpen(false)}>FAQ</NavLink>

          {/* ✅ User & Vendor Login Links */}
          <NavLink to="/login" className="user-login" onClick={() => setMenuOpen(false)}>
            <FaUser /> User Login
          </NavLink>
          <NavLink to="/vendor-login" className="vendor-login" onClick={() => setMenuOpen(false)}>
            <FaStore /> Vendor Login
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
