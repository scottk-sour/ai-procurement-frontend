// src/components/Footer.js
import React from "react";
import { Link } from "react-router-dom";
import "../styles/Footer.css";
import { FaFacebook, FaTwitter, FaYoutube, FaLinkedin, FaInstagram, FaTiktok } from "react-icons/fa";

const Footer = () => {
  console.log("✅ Footer rendering"); // Debug log
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4 className="footer-heading">More Information</h4>
          <ul className="footer-links">
            <li><Link to="/sitemap" className="footer-link">Sitemap</Link></li>
            <li><Link to="/about-us" className="footer-link">About Us</Link></li>
            <li><Link to="/how-it-works" className="footer-link">How Our AI Works</Link></li>
            <li><Link to="/privacy-policy" className="footer-link">Privacy Policy</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">News & Content</h4>
          <ul className="footer-links">
            <li><Link to="/press-contacts" className="footer-link">Press Contacts</Link></li>
            <li><Link to="/marketing" className="footer-link">Our Marketing Activity</Link></li>
            <li><Link to="/experts" className="footer-link">Meet the Experts</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Get in Touch</h4>
          <ul className="footer-links">
            <li><Link to="/contact" className="footer-link">Contact Us</Link></li>
            <li><Link to="/careers" className="footer-link">Careers</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Follow Us</h4>
          <div className="footer-social">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link"><FaFacebook /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link"><FaTwitter /></a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-link"><FaYoutube /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link"><FaLinkedin /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link"><FaInstagram /></a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="social-link"><FaTiktok /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;