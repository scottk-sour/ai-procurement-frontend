// src/components/Footer.js
import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-section">
        <h4>More Information</h4>
        <ul>
          <li><a href="/partners">Our Partners</a></li>
          <li><a href="/sitemap">Sitemap</a></li>
          <li><a href="/work-with-us">Who We Work With</a></li>
          <li><a href="/make-money">How We Make Money</a></li>
          <li><a href="/about-us">About Us</a></li>
          <li><a href="/editorial-guidelines">Our Editorial Guidelines</a></li>
        </ul>
      </div>
      
      <div className="footer-section">
        <h4>News & Content</h4>
        <ul>
          <li><a href="/press-contacts">Press Contacts</a></li>
          <li><a href="/marketing">Our Marketing Activity</a></li>
          <li><a href="/experts">Meet the Experts</a></li>
        </ul>
      </div>

      <div className="footer-section">
        <h4>Get in Touch</h4>
        <ul>
          <li><a href="/contact">Contact Us</a></li>
          <li><a href="/careers">Careers</a></li>
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
