// src/components/LandingPage.js

import React from 'react';
import { Link } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import '../styles/LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Navigation Bar */}
      <NavigationBar />

      {/* Hero Section */}
      <header
        className="hero-section"
        style={{
          background: `linear-gradient(
            rgba(0, 0, 0, 0.6),
            rgba(0, 0, 0, 0.6)
          ), url("${process.env.PUBLIC_URL}/assets/images/landingpagepic.png") 
          no-repeat center center`,
          backgroundSize: 'cover',
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          color: '#fff',
        }}
      >
        <h1 className="hero-title">
          Get Tailored Vendor Quotes Instantly with AI-Powered Procurement
        </h1>
        <p className="hero-description">
          Connect with top vendors and get quotes in minutes.
        </p>
        <div className="hero-buttons">
          <Link to="/login" className="cta-button primary">
            Login
          </Link>
          <Link to="/signup" className="cta-button secondary">
            Sign Up
          </Link>
        </div>
      </header>

      {/* Features Section */}
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

      {/* Services Section */}
      <section className="services-section">
        <h2>Our Services</h2>
        <div className="services-grid">
          <Link to="/services/photocopiers" className="service-card">
            <img
              src={`${process.env.PUBLIC_URL}/assets/images/photocopier.PNG`}
              loading="lazy"
              alt="Photocopiers"
              className="service-icon"
            />
            <h3>Photocopiers</h3>
            <p>Save on top-rated photocopier vendors with special deals.</p>
          </Link>
          <Link to="/services/telecoms" className="service-card">
            <img
              src={`${process.env.PUBLIC_URL}/assets/images/phone.PNG`}
              loading="lazy"
              alt="Telecoms"
              className="service-icon"
            />
            <h3>Telecoms</h3>
            <p>Discover the best telecom solutions tailored to your business.</p>
          </Link>
          <Link to="/services/cctv" className="service-card">
            <img
              src={`${process.env.PUBLIC_URL}/assets/images/cctv.PNG`}
              loading="lazy"
              alt="CCTV"
              className="service-icon"
            />
            <h3>CCTV</h3>
            <p>Find the right CCTV solutions to protect your assets.</p>
          </Link>
          <Link to="/services/it" className="service-card">
            <img
              src={`${process.env.PUBLIC_URL}/assets/images/wifi.PNG`}
              loading="lazy"
              alt="IT Solutions"
              className="service-icon"
            />
            <h3>IT Solutions</h3>
            <p>Explore IT services and vendors offering the best deals.</p>
          </Link>
        </div>
      </section>

      {/* Trusted by Leading Companies Section */}
      <section className="trust-section">
        <h2>Trusted by Leading Companies</h2>
        <div className="trusted-companies">
          <div className="company-card">
            <img
              src={`${process.env.PUBLIC_URL}/assets/images/waleswest.png`}
              alt="WalesWest"
              className="company-logo"
            />
            <div className="company-info">
              <h3>WalesWest</h3>
              <p className="company-role">Trusted Partner</p>
              <p>
                "An essential platform that connects us to reliable vendors and optimises our
                procurement process."
              </p>
            </div>
          </div>
          <div className="company-card">
            <img
              src={`${process.env.PUBLIC_URL}/assets/images/monmotors.png`}
              alt="Mon Motors"
              className="company-logo"
            />
            <div className="company-info">
              <h3>Mon Motors</h3>
              <p className="company-role">Procurement Specialist</p>
              <p>
                "A great tool for finding trusted vendors quickly. Highly recommend!"
              </p>
            </div>
          </div>
          <div className="company-card">
            <img
              src={`${process.env.PUBLIC_URL}/assets/images/Ascari.png`}
              alt="Ascari"
              className="company-logo"
            />
            <div className="company-info">
              <h3>Ascari</h3>
              <p className="company-role">Chief Financial Officer</p>
              <p>
                "The best solution for comparing vendor quotes and making cost-effective
                decisions."
              </p>
            </div>
          </div>
          <div className="company-card">
            <img
              src={`${process.env.PUBLIC_URL}/assets/images/GoCompare.png`}
              alt="GoCompare"
              className="company-logo"
            />
            <div className="company-info">
              <h3>GoCompare</h3>
              <p className="company-role">CEO</p>
              <p>
                "Our go-to platform for finding the right vendors with ease."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <footer className="cta-footer">
        <h2>Ready to Get Started?</h2>
        <Link to="/signup" className="cta-button footer-cta">
          Sign Up Now
        </Link>
      </footer>
    </div>
  );
};

export default LandingPage;
