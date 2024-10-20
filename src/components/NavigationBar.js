import React, { useState } from 'react';
import { NavLink } from 'react-router-dom'; // Use NavLink for active styling

const NavigationBar = () => {
  const [menuOpen, setMenuOpen] = useState(false); // State to control menu visibility

  const toggleMenu = () => {
    setMenuOpen(!menuOpen); // Toggle the menu state
  };

  // Define the menu links to avoid repetition and simplify future changes
  const menuLinks = [
    { path: "/", label: "Home" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/request-quote", label: "Request Quote" },
    { path: "/services", label: "Services" },
    { path: "/about", label: "About Us" },
    { path: "/contact", label: "Contact Us" }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <NavLink to="/" exact activeClassName="active-link">Home</NavLink>
        {/* Optionally, add a logo here */}
      </div>

      {/* Hamburger Button */}
      <button 
        className="hamburger" 
        onClick={toggleMenu} 
        aria-label="Toggle Menu" 
        aria-expanded={menuOpen}
      >
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </button>

      {/* Navbar Links */}
      <div className={`navbar-links ${menuOpen ? 'active' : ''}`}>
        {menuLinks.map((link, index) => (
          <NavLink key={index} to={link.path} activeClassName="active-link" onClick={() => setMenuOpen(false)}>
            {link.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default NavigationBar;
