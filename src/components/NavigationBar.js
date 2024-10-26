import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './NavigationBar.css'; // Make sure to have CSS linked for styling

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
      <div className="navbar-brand">
        <NavLink to="/" end className={({ isActive }) => isActive ? "active-link" : ""}>
          {/* Replace with logo image if available */}
          <span className="logo">Logo</span>
        </NavLink>
      </div>

      {/* Hamburger Menu */}
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

      {/* Navbar Links */}
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
      </div>
    </nav>
  );
};

export default NavigationBar;
