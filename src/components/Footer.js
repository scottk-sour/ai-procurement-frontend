// src/components/Footer.js
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom'; // Import useLocation for scroll behavior
import '../styles/Footer.css'; // Use your existing regular CSS (updated below)
import { FaFacebook, FaTwitter, FaYoutube, FaLinkedin, FaInstagram, FaTiktok } from 'react-icons/fa'; // Add social icons

const Footer = () => {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(false); // State for animation visibility

  useEffect(() => {
    window.scrollTo(0, 0);
    // Set visibility with a smooth animation delay for premium entrance
    const timer = setTimeout(() => setIsVisible(true), 150);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <footer className="footer" data-animation="fadeInUp" data-visible={isVisible}>
      <div className="footer-container">
        <div className="footer-section" data-animation="slideInFromLeft" data-delay="200" data-visible={isVisible}>
          <h4 className="footer-heading">More Information</h4>
          <ul className="footer-links">
            <li>
              <Link to="/sitemap" className="footer-link" aria-label="Sitemap">
                Sitemap
              </Link>
            </li>
            <li>
              <Link to="/about-us" className="footer-link" aria-label="About Us">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/how-it-works" className="footer-link" aria-label="How Our AI Works">
                How Our AI Works
              </Link>
            </li>
            <li>
              <Link to="/privacy-policy" className="footer-link" aria-label="Privacy Policy">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        <div className="footer-section" data-animation="slideInFromLeft" data-delay="400" data-visible={isVisible}>
          <h4 className="footer-heading">News & Content</h4>
          <ul className="footer-links">
            <li>
              <Link to="/press-contacts" className="footer-link" aria-label="Press Contacts">
                Press Contacts
              </Link>
            </li>
            <li>
              <Link to="/marketing" className="footer-link" aria-label="Our Marketing Activity">
                Our Marketing Activity
              </Link>
            </li>
            <li>
              <Link to="/experts" className="footer-link" aria-label="Meet the Experts">
                Meet the Experts
              </Link>
            </li>
          </ul>
        </div>

        <div className="footer-section" data-animation="slideInFromLeft" data-delay="600" data-visible={isVisible}>
          <h4 className="footer-heading">Get in Touch</h4>
          <ul className="footer-links">
            <li>
              <Link to="/contact" className="footer-link" aria-label="Contact Us">
                Contact Us
              </Link>
            </li>
            <li>
              <Link to="/careers" className="footer-link" aria-label="Careers">
                Careers
              </Link>
            </li>
          </ul>
        </div>

        <div className="footer-section" data-animation="slideInFromLeft" data-delay="800" data-visible={isVisible}>
          <h4 className="footer-heading">Follow Us</h4>
          <div className="footer-social">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label="Facebook"
            >
              <FaFacebook />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label="Twitter"
            >
              <FaTwitter />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label="YouTube"
            >
              <FaYoutube />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label="LinkedIn"
            >
              <FaLinkedin />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label="TikTok"
            >
              <FaTiktok />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;