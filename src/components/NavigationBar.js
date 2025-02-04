import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './NavigationBar.css';
import { FaUser, FaStore } from 'react-icons/fa';

const NavigationBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // ✅ Toggles the mobile menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // ✅ Ensures users are logged in before accessing dashboard
  const handleDashboardClick = () => {
    const token = localStorage.getItem('userToken'); // Ensure token is correctly referenced
    if (token) {
      navigate('/dashboard');
    } else {
      alert('⚠ You must be logged in to access the dashboard.');
      navigate('/login');
    }
    setMenuOpen(false);
  };

  // ✅ Checks authentication before navigating to Request a Quote
  const handleRequestQuoteClick = () => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      alert('⚠ You must be logged in to request a quote.');
      navigate('/login'); // Redirects to login first
    } else {
      navigate('/request-quote');
    }
    setMenuOpen(false);
  };

  // ✅ Define menu links dynamically
  const menuLinks = [
    { path: "/services", label: "Services" },
    { path: "/about-us", label: "About Us" },
    { path: "/contact", label: "Contact Us" },
    { path: "/faq", label: "FAQ" }
  ];

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

          {/* ✅ Request Quote Link with Authentication Check */}
          <button className="request-quote-link" onClick={handleRequestQuoteClick}>
            Request a Quote
          </button>

          {/* ✅ Dashboard Link with Authentication Check */}
          <button className="dashboard-link" onClick={handleDashboardClick}>
            Dashboard
          </button>

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
