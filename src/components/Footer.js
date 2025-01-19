// Footer.js
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-section">
        <h4>More Information</h4>
        <ul>
          <li><Link to="/sitemap">Sitemap</Link></li>
          <li><Link to="/about-us">About Us</Link></li>
          <li><Link to="/how-it-works">How Our AI Works</Link></li>
          <li><Link to="/privacy-policy">Privacy Policy</Link></li>
        </ul>
      </div>
      
      <div className="footer-section">
        <h4>News & Content</h4>
        <ul>
          <li><Link to="/press-contacts">Press Contacts</Link></li>
          <li><Link to="/marketing">Our Marketing Activity</Link></li>
          <li><Link to="/experts">Meet the Experts</Link></li>
        </ul>
      </div>

      <div className="footer-section">
        <h4>Get in Touch</h4>
        <ul>
          <li><Link to="/contact">Contact Us</Link></li>
          <li><Link to="/careers">Careers</Link></li>
        </ul>
      </div>

      <div className="footer-section">
        <h4>Follow Us</h4>
        <ul>
          <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a></li>
          <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a></li>
          <li><a href="https://youtube.com" target="_blank" rel="noopener noreferrer">YouTube</a></li>
          <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
          <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a></li>
          <li><a href="https://tiktok.com" target="_blank" rel="noopener noreferrer">TikTok</a></li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
