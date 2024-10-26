// src/components/NavigationBar.js
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './NavigationBar.css'; // Make sure to have CSS linked for styling
import { FaUser, FaStore } from 'react-icons/fa'; // Icons for users and vendors

const NavigationBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const menuLinks = [
    { path: "/", label: "Home" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/request-quote", label: "Request Quote" },
    { path: "/services", label: "Services" },
    { path: "/about-us", label: "About Us" },
    { path: "/contact", label: "Contact Us" }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-content"> {/* Wrapper for centering content */}
        <div className="navbar-brand">
          <NavLink to="/" end className={({ isActive }) => isActive ? "active-link" : ""}>
            <span className="logo">Logo</span>
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
          {menuLinks.map((link, index) => (
            <NavLink
              key={index}
              to={link.path}
              className={({ isActive }) => isActive ? "active-link" : ""}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          
          {/* User Login and Vendor Login Links */}
          <NavLink to="/login" className="user-login" onClick={() => setMenuOpen(false)}>
            <FaUser /> User Login
          </NavLink>
          <NavLink to="/vendor-login" className="vendor-login" onClick={() => setMenuOpen(false)}>
            <FaStore /> Vendor Login
          </NavLink>
        </div>
      </div> {/* Closing navbar-content */}
    </nav>
  );
};

export default NavigationBar;
