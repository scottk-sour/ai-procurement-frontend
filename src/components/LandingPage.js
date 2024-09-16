// src/components/LandingPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <header className="hero-section">
        <h1 className="hero-title">
          Get Tailored Vendor Quotes Instantly with AI-Powered Procurement
        </h1>
        <p className="hero-description">
          Connect with top vendors and get quotes in minutes.
        </p>
        <div className="hero-buttons">
          <Link to="/login" className="cta-button primary">Login</Link>
          <Link to="/signup" className="cta-button secondary">Sign Up</Link>
        </div>
      </header>
      <section className="features-section">
        <h2>Why Choose Our Platform?</h2>
        <div className="features">
          <div className="feature">
            <h3>Fast and Efficient</h3>
            <p>Get vendor quotes tailored to your needs in just minutes.</p>
          </div>
          <div className="feature">
            <h3>Trusted Vendors</h3>
            <p>We connect you with the best vendors in the market.</p>
          </div>
          <div className="feature">
            <h3>Easy Comparisons</h3>
            <p>Compare quotes side-by-side to make informed decisions.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
