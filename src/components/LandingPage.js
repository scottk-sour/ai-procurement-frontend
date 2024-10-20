// src/components/LandingPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import NavigationBar from './NavigationBar'; // Import the NavigationBar component
import TestimonialCarousel from './TestimonialCarousel';
import '../styles/LandingPage.css'; // Import LandingPage CSS (ensure the path is correct)

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Navigation Bar */}
      <NavigationBar /> {/* Use the NavigationBar component */}

      {/* Hero Section */}
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
            <img src="https://placehold.co/400x300?text=Photocopiers" loading="lazy" alt="Photocopiers" className="service-icon" />
            <h3>Photocopiers</h3>
            <p>Save on top-rated photocopier vendors with special deals.</p>
          </Link>
          <Link to="/services/telecoms" className="service-card">
            <img src="https://placehold.co/400x300?text=Telecoms" loading="lazy" alt="Telecoms" className="service-icon" />
            <h3>Telecoms</h3>
            <p>Discover the best telecom solutions tailored to your business.</p>
          </Link>
          <Link to="/services/cctv" className="service-card">
            <img src="https://placehold.co/400x300?text=CCTV" loading="lazy" alt="CCTV" className="service-icon" />
            <h3>CCTV</h3>
            <p>Find the right CCTV solutions to protect your assets.</p>
          </Link>
          <Link to="/services/it" className="service-card">
            <img src="https://placehold.co/400x300?text=IT+Solutions" loading="lazy" alt="IT Solutions" className="service-icon" />
            <h3>IT Solutions</h3>
            <p>Explore IT services and vendors offering the best deals.</p>
          </Link>
        </div>
      </section>

      {/* Trust and Testimonials Section */}
      <section className="trust-section">
        <h2>Trusted by Leading Companies</h2>
        <TestimonialCarousel />
      </section>

      {/* Call to Action */}
      <footer className="cta-footer">
        <h2>Ready to Get Started?</h2>
        <Link to="/signup" className="cta-button footer-cta">Sign Up Now</Link>
      </footer>
    </div>
  );
};

export default LandingPage;
