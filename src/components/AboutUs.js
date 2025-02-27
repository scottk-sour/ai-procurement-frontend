// src/components/AboutUs.js
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/AboutUs.css"; // Use your existing regular CSS (updated below)
import heroImage from "../assets/images/team.png"; // Ensure this exists

const AboutUs = () => {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(false); // State for animation visibility

  useEffect(() => {
    window.scrollTo(0, 0);
    // Set visibility after a short delay for animation effect
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className="about-us-page">
      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-overlay" />
        <div
          className="hero-background"
          style={{ backgroundImage: `url(${heroImage})` }}
          onError={(e) => {
            e.target.style.backgroundImage = "none";
            e.target.style.background = "linear-gradient(135deg, #1e3a8a, #2d4a8a)";
          }}
          data-parallax-speed="0.3" // Optional: Add for parallax effect (handled in CSS)
        />
        <div className="hero-content">
          <h1 className="hero-title">Discover TENDORAI’s Vision</h1>
          <p className="hero-subtitle">
            I’m Scott Davies, founder of TENDORAI—redefining procurement with AI innovation.
          </p>
          <Link to="/how-it-works" className="hero-button">
            Explore Our Journey
          </Link>
        </div>
      </header>

      {/* About Me Section */}
      <section
        className="about-me-section"
        data-animation="fadeInUp"
        data-delay="0"
        data-visible={isVisible}
      >
        <div className="section-container">
          <h2 className="section-title">Meet Our Founder</h2>
          <p className="section-text">
            With over 25 years of expertise in sales, procurement, and digital marketing, I’ve witnessed the inefficiencies plaguing businesses—hours wasted on vendor searches, unreliable quotes, and outdated processes. In 2023, I launched TENDORAI to revolutionize procurement with AI, empowering companies to save time, slash costs, and forge trusted partnerships worldwide.
          </p>
          <p className="founder-signature">— Scott Davies, Founder</p>
        </div>
      </section>

      {/* Mission Section */}
      <section
        className="mission-section"
        data-animation="fadeInUp"
        data-delay="200"
        data-visible={isVisible}
      >
        <div className="section-container">
          <h2 className="section-title">Our Mission</h2>
          <p className="section-text">
            At TENDORAI, we’re committed to transforming procurement into a seamless, cost-effective journey. Our AI platform connects businesses with vetted vendors, delivering precise, instant solutions—freeing you to focus on growth and innovation.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section
        className="story-section"
        data-animation="fadeInUp"
        data-delay="400"
        data-visible={isVisible}
      >
        <div className="section-container">
          <h2 className="section-title">Our Journey</h2>
          <p className="section-text">
            TENDORAI was born from a vision to solve procurement’s persistent challenges. Leveraging decades of industry insight and a passion for technology, I built an AI-driven platform that’s transformed hundreds of businesses since 2023—streamlining workflows, reducing costs, and fostering reliable vendor relationships globally.
          </p>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section
        className="why-choose-us-section"
        data-animation="fadeInUp"
        data-delay="600"
        data-visible={isVisible}
      >
        <div className="section-container">
          <h2 className="section-title">Why Choose TENDORAI?</h2>
          <div className="features-grid">
            {[
              { title: "Precision Matching", text: "AI tailors vendor matches to your exact needs with unmatched accuracy." },
              { title: "Instant Quotes", text: "Competitive offers delivered in seconds, saving you time and effort." },
              { title: "Trusted Network", text: "Curated, vetted vendors you can rely on for quality and reliability." },
              { title: "User-Centric Design", text: "Built for simplicity, efficiency, and a seamless user experience." },
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

      {/* Core Values Section */}
      <section
        className="core-values-section"
        data-animation="fadeInUp"
        data-delay="1000"
        data-visible={isVisible}
      >
        <div className="section-container">
          <h2 className="section-title">Our Core Values</h2>
          <div className="values-grid">
            {[
              { title: "Transparency", text: "Open, honest dealings at every step of your journey." },
              { title: "Efficiency", text: "Maximizing your time and resources with cutting-edge solutions." },
              { title: "Innovation", text: "Driving progress through AI and forward-thinking technology." },
              { title: "Customer Success", text: "Your growth and satisfaction are our top priorities." },
            ].map((value, index) => (
              <div
                key={index}
                className="value-card"
                data-animation="fadeInUp"
                data-delay={1000 + index * 200}
                data-visible={isVisible}
              >
                <h3 className="value-title">{value.title}</h3>
                <p className="value-text">{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section
        className="vision-section"
        data-animation="fadeInUp"
        data-delay="1400"
        data-visible={isVisible}
      >
        <div className="section-container">
          <h2 className="section-title">Our Vision</h2>
          <p className="section-text">
            We aim to redefine procurement globally, making it effortless, accessible, and intelligent for businesses everywhere. By expanding our vendor network and advancing AI technology, TENDORAI leads the digital procurement revolution, empowering a smarter future.
          </p>
        </div>
      </section>

      {/* Call to Action Section */}
      <section
        className="cta-section"
        data-animation="fadeInUp"
        data-delay="1600"
        data-visible={isVisible}
      >
        <div className="section-container">
          <h2 className="cta-title">Join the AI Procurement Revolution</h2>
          <p className="cta-subtitle">
            Ready to transform your vendor sourcing? Let’s partner to unlock TENDORAI’s power for your business.
          </p>
          <div className="cta-buttons">
            <Link to="/contact" className="cta-button primary">Get in Touch Now</Link>
            <Link to="/how-it-works" className="cta-button secondary">Learn More</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;