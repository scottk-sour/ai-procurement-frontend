// src/components/MeetTheExperts.js
import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/MeetTheExperts.css";

const MeetTheExperts = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="experts-page">
      {/* Mini Hero Section */}
      <header className="experts-hero">
        <h1 className="experts-title">Meet Our Experts</h1>
        <p className="experts-subtitle">
          Our skilled team drives TENDORAI’s mission to revolutionize procurement with AI expertise.
        </p>
      </header>

      {/* Intro Section */}
      <section className="experts-intro-section">
        <div className="section-container">
          <p className="section-text">
            With decades of combined experience in AI, procurement, sales, and customer success, our specialists are here to empower your business. From streamlining vendor sourcing to optimizing workflows, we’re committed to your success.
          </p>
        </div>
      </section>

      {/* Experts Grid */}
      <section className="experts-grid-section">
        <div className="section-container">
          <div className="experts-grid">
            {/* Expert 1 */}
            <div className="expert-card">
              <img
                src={`${process.env.PUBLIC_URL}/assets/images/placeholder-jane.jpg`} // Use local placeholder or real image
                alt="Jane Doe"
                className="expert-image"
                onError={(e) => (e.target.src = `${process.env.PUBLIC_URL}/assets/images/default-placeholder.jpg`)} // Fallback
              />
              <h2 className="expert-name">Jane Doe</h2>
              <p className="expert-role">AI Sales Advisor</p>
              <p className="expert-bio">
                Jane leverages 10+ years in enterprise sales to enhance B2B pipelines, specializing in tech and service sectors.
              </p>
              <Link to="/contact" className="expert-cta">Contact Jane</Link>
            </div>

            {/* Expert 2 */}
            <div className="expert-card">
              <img
                src={`${process.env.PUBLIC_URL}/assets/images/placeholder-john.jpg`} // Use local placeholder or real image
                alt="John Smith"
                className="expert-image"
                onError={(e) => (e.target.src = `${process.env.PUBLIC_URL}/assets/images/default-placeholder.jpg`)} // Fallback
              />
              <h2 className="expert-name">John Smith</h2>
              <p className="expert-role">Procurement Lead</p>
              <p className="expert-bio">
                With 15 years in global procurement, John uses AI to cut costs and optimize supply chains across industries.
              </p>
              <Link to="/contact" className="expert-cta">Contact John</Link>
            </div>

            {/* Expert 3 */}
            <div className="expert-card">
              <img
                src={`${process.env.PUBLIC_URL}/assets/images/placeholder-emily.jpg`} // Use local placeholder or real image
                alt="Emily Clarke"
                className="expert-image"
                onError={(e) => (e.target.src = `${process.env.PUBLIC_URL}/assets/images/default-placeholder.jpg`)} // Fallback
              />
              <h2 className="expert-name">Emily Clarke</h2>
              <p className="expert-role">CX Strategist</p>
              <p className="expert-bio">
                Emily boosts customer journeys with AI insights, excelling in e-commerce and service-based solutions.
              </p>
              <Link to="/contact" className="expert-cta">Contact Emily</Link>
            </div>

            {/* Expert 4 */}
            <div className="expert-card">
              <img
                src={`${process.env.PUBLIC_URL}/assets/images/placeholder-michael.jpg`} // Use local placeholder or real image
                alt="Michael Brown"
                className="expert-image"
                onError={(e) => (e.target.src = `${process.env.PUBLIC_URL}/assets/images/default-placeholder.jpg`)} // Fallback
              />
              <h2 className="expert-name">Michael Brown</h2>
              <p className="expert-role">Data Specialist</p>
              <p className="expert-bio">
                Michael harnesses AI and data science to deliver insights, with expertise spanning finance and healthcare.
              </p>
              <Link to="/contact" className="expert-cta">Contact Michael</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="experts-cta-section">
        <div className="section-container">
          <h2 className="cta-title">Ready to Collaborate?</h2>
          <p className="cta-subtitle">
            Connect with our experts to explore how TENDORAI can transform your procurement strategy.
          </p>
          <div className="cta-buttons">
            <Link to="/contact" className="cta-button primary">Schedule a Call</Link>
            <Link to="/how-it-works" className="cta-button secondary">Learn More</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MeetTheExperts;