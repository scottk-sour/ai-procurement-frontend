// src/components/LandingPage.js
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/LandingPage.css"; // Use the existing regular CSS (updated below)

const LandingPage = () => {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(false); // State for animation visibility

  useEffect(() => {
    window.scrollTo(0, 0);
    // Set visibility after a short delay for animation effect
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <header
        className="hero-section"
        data-animation="fadeIn"
        data-visible={isVisible}
      >
        <div className="hero-overlay" />
        <div
          className="hero-background"
          style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/assets/images/landingpagepic.png)` }}
          onError={(e) => {
            e.target.style.backgroundImage = "none";
            e.target.style.background = "linear-gradient(135deg, #1e3a8a, #2d4a8a)";
          }}
          data-parallax-speed="0.3" // Optional: Add for parallax effect (handled in CSS)
        />
        <div className="hero-content">
          <h1 className="hero-title">Revolutionize Your Procurement with AI</h1>
          <p className="hero-subtitle">
            Free & Instant Access
          </p>
          <p className="hero-description">
            Connect with top vendors, get tailored quotes in minutes, and transform your business.
          </p>
          <div className="hero-buttons">
            <Link to="/login" className="hero-button primary" data-animation="fadeInUp" data-delay="200" data-visible={isVisible}>
              Login Now
            </Link>
            <Link to="/signup" className="hero-button secondary" data-animation="fadeInUp" data-delay="400" data-visible={isVisible}>
              Sign Up Free
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section
        className="features-section"
        data-animation="fadeInUp"
        data-delay="600"
        data-visible={isVisible}
      >
        <div className="section-container">
          <h2 className="section-title">Why Choose TENDORAI?</h2>
          <div className="features-grid">
            {[
              { title: "Blazing Speed", text: "Receive vendor quotes tailored to your needs in minutes, not days." },
              { title: "Trusted Network", text: "Access curated, vetted vendors you can rely on for quality." },
              { title: "Seamless Comparisons", text: "Compare quotes side-by-side for informed, cost-effective decisions." },
            ].map((feature, index) => (
              <div
                key={index}
                className="feature-card"
                data-animation="fadeInUp"
                data-delay={600 + index * 200}
                data-visible={isVisible}
              >
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-text">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        className="services-section"
        data-animation="fadeInUp"
        data-delay="1200"
        data-visible={isVisible}
      >
        <div className="section-container">
          <h2 className="section-title">Explore Our Services</h2>
          <div className="services-grid single-row">
            <Link
              to="/services/photocopiers"
              className="service-card"
              data-animation="fadeInUp"
              data-delay="1200"
              data-visible={isVisible}
            >
              <img
                src={`${process.env.PUBLIC_URL}/assets/images/photocopier.PNG`}
                loading="lazy"
                alt="Photocopiers"
                className="service-icon"
                onError={(e) => (e.target.src = `${process.env.PUBLIC_URL}/assets/images/default-placeholder.jpg`)} // Fallback
              />
              <h3>Photocopiers</h3>
              <p>Save on top-rated photocopier vendors with exclusive deals.</p>
            </Link>
            <Link
              to="/services/telecoms"
              className="service-card"
              data-animation="fadeInUp"
              data-delay="1400"
              data-visible={isVisible}
            >
              <img
                src={`${process.env.PUBLIC_URL}/assets/images/phone.PNG`}
                loading="lazy"
                alt="Telecoms"
                className="service-icon"
                onError={(e) => (e.target.src = `${process.env.PUBLIC_URL}/assets/images/default-placeholder.jpg`)} // Fallback
              />
              <h3>Telecoms</h3>
              <p>Discover tailored telecom solutions for your business needs.</p>
            </Link>
            <Link
              to="/services/cctv"
              className="service-card"
              data-animation="fadeInUp"
              data-delay="1600"
              data-visible={isVisible}
            >
              <img
                src={`${process.env.PUBLIC_URL}/assets/images/cctv.PNG`}
                loading="lazy"
                alt="CCTV"
                className="service-icon"
                onError={(e) => (e.target.src = `${process.env.PUBLIC_URL}/assets/images/default-placeholder.jpg`)} // Fallback
              />
              <h3>CCTV</h3>
              <p>Secure your assets with top CCTV solutions from trusted vendors.</p>
            </Link>
            <Link
              to="/services/it"
              className="service-card"
              data-animation="fadeInUp"
              data-delay="1800"
              data-visible={isVisible}
            >
              <img
                src={`${process.env.PUBLIC_URL}/assets/images/wifi.PNG`}
                loading="lazy"
                alt="IT Solutions"
                className="service-icon"
                onError={(e) => (e.target.src = `${process.env.PUBLIC_URL}/assets/images/default-placeholder.jpg`)} // Fallback
              />
              <h3>IT Solutions</h3>
              <p>Explore cutting-edge IT services with the best vendor deals.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Trusted by Leading Companies Section */}
      <section
        className="trust-section"
        data-animation="fadeInUp"
        data-delay="2200"
        data-visible={isVisible}
      >
        <div className="section-container">
          <h2 className="section-title">Trusted by Leading Companies</h2>
          <div className="trusted-companies">
            {[
              { name: "WalesWest", role: "Trusted Partner", quote: "An essential platform that connects us to reliable vendors and optimizes our procurement process.", logo: "waleswest.png" },
              { name: "Mon Motors", role: "Procurement Specialist", quote: "A great tool for finding trusted vendors quickly. Highly recommend!", logo: "monmotors.png" },
              { name: "Ascari", role: "Chief Financial Officer", quote: "The best solution for comparing vendor quotes and making cost-effective decisions.", logo: "Ascari.png" },
              { name: "GoCompare", role: "CEO", quote: "Our go-to platform for finding the right vendors with ease.", logo: "GoCompare.png" },
            ].map((company, index) => (
              <div
                key={index}
                className="company-card"
                data-animation="fadeInUp"
                data-delay={2200 + index * 200}
                data-visible={isVisible}
              >
                <img
                  src={`${process.env.PUBLIC_URL}/assets/images/${company.logo}`}
                  alt={company.name}
                  className="company-logo"
                  loading="lazy"
                  onError={(e) => (e.target.src = `${process.env.PUBLIC_URL}/assets/images/default-placeholder.jpg`)} // Fallback
                />
                <div className="company-info">
                  <h3 className="company-name">{company.name}</h3>
                  <p className="company-role">{company.role}</p>
                  <p className="company-quote">{company.quote}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Footer */}
      <footer
        className="cta-footer"
        data-animation="fadeInUp"
        data-delay="3000"
        data-visible={isVisible}
      >
        <div className="section-container">
          <h2 className="cta-title">Ready to Transform Your Procurement?</h2>
          <Link to="/signup" className="cta-button footer-cta primary" data-animation="fadeInUp" data-delay="3200" data-visible={isVisible}>
            Sign Up Now—It’s Free
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;