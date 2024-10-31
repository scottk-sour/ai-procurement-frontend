// src/components/NavigationBar.js
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './NavigationBar.css';
import { FaUser, FaStore } from 'react-icons/fa';

const NavigationBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Function to handle Dashboard click with login check
  const handleDashboardClick = () => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
    setMenuOpen(false); // Close menu if on mobile
  };

  const menuLinks = [
    { path: "/", label: "Home" },
    { path: "/request-quote", label: "Request Quote" },
    { path: "/services", label: "Services" },
    { path: "/about-us", label: "About Us" },
    { path: "/contact", label: "Contact Us" }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-content">
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

          {/* Dashboard Link with Login Check */}
          <button className="dashboard-link" onClick={handleDashboardClick}>
            Dashboard
          </button>

          {/* User Login and Vendor Login Links */}
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
