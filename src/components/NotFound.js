// src/components/NotFound.js
// Enhanced 404 page with helpful navigation

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaHome, FaSearch, FaArrowLeft, FaEnvelope } from 'react-icons/fa';
import '../styles/NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  const popularLinks = [
    { label: 'Find Suppliers', to: '/suppliers', icon: FaSearch },
    { label: 'Photocopier Quotes', to: '/services/photocopiers' },
    { label: 'Telecoms Solutions', to: '/services/telecoms' },
    { label: 'CCTV & Security', to: '/services/cctv' },
    { label: 'IT Services', to: '/services/it' },
    { label: 'How It Works', to: '/how-it-works' },
  ];

  return (
    <div className="not-found">
      <Helmet>
        <title>Page Not Found | TendorAI</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="not-found__container">
        {/* Animated 404 */}
        <div className="not-found__visual">
          <div className="not-found__number">
            <span className="not-found__digit">4</span>
            <span className="not-found__digit not-found__digit--animated">0</span>
            <span className="not-found__digit">4</span>
          </div>
        </div>

        {/* Content */}
        <div className="not-found__content">
          <h1 className="not-found__title">Page Not Found</h1>
          <p className="not-found__description">
            Sorry, the page you're looking for doesn't exist or has been moved.
            Let's get you back on track.
          </p>

          {/* Action Buttons */}
          <div className="not-found__actions">
            <button
              onClick={() => navigate(-1)}
              className="not-found__btn not-found__btn--secondary"
            >
              <FaArrowLeft /> Go Back
            </button>
            <Link to="/" className="not-found__btn not-found__btn--primary">
              <FaHome /> Back to Home
            </Link>
          </div>
        </div>

        {/* Popular Links */}
        <div className="not-found__links">
          <h2>Popular Pages</h2>
          <div className="not-found__links-grid">
            {popularLinks.map((link, index) => (
              <Link key={index} to={link.to} className="not-found__link">
                {link.icon && <link.icon />}
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="not-found__help">
          <p>
            Still can't find what you're looking for?
            <Link to="/contact" className="not-found__contact-link">
              <FaEnvelope /> Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
