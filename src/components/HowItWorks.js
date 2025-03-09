// src/components/HowItWorks.js
import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/HowItWorks.css";

const HowItWorks = () => {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(false); // Hero visibility
  const [stepVisibility, setStepVisibility] = useState({}); // Per-step visibility
  const stepRefs = useRef([]); // Refs for IntersectionObserver

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setIsVisible(true), 100); // Hero animation trigger
  }, [pathname]);

  // IntersectionObserver for step animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = entry.target.dataset.index;
            setStepVisibility((prev) => ({ ...prev, [index]: true }));
          }
        });
      },
      { threshold: 0.3 } // Trigger when 30% of element is visible
    );

    stepRefs.current.forEach((ref) => ref && observer.observe(ref));
    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      number: "1",
      title: "Sign Up & Define Your Needs",
      text: "Create a free account in seconds and specify your procurement needs with ease.",
      items: [
        "Create your free business account.",
        "Specify product or service requirements.",
        "Set vendor preferences or let AI recommend.",
      ],
    },
    {
      number: "2",
      title: "Request Quotes Instantly",
      text: "Submit your request and receive AI-generated quotes in seconds—no lengthy forms.",
      items: [
        "Enter details (e.g., “5 office printers”).",
        "Upload documents if needed.",
        "Click “Request Quote” to activate AI.",
      ],
    },
    {
      number: "3",
      title: "AI Matches Top Vendors",
      text: "Our AI identifies your best three vendors from thousands, ensuring optimal matches.",
      items: [
        "Competitive pricing and discounts.",
        "Service level agreements (SLAs).",
        "Warranty, maintenance, and vendor ratings.",
      ],
    },
    {
      number: "4",
      title: "Compare & Select",
      text: "Review tailored quotes side-by-side for confident decision-making.",
      items: [
        "Full cost breakdowns.",
        "Delivery and service timelines.",
        "Vendor profiles and reviews.",
        "Accept or negotiate directly.",
      ],
    },
    {
      number: "5",
      title: "Finalize Securely",
      text: "Complete procurement digitally with secure, paperless processes.",
      items: [
        "AI-generated contracts with e-signatures.",
        "Fully online, paperless workflow.",
        "Real-time order tracking.",
      ],
    },
    {
      number: "6",
      title: "Manage in Your Dashboard",
      text: "Oversee all activities from a single, intuitive dashboard.",
      items: [
        "Track orders and spending.",
        "Access AI-driven cost-saving insights.",
        "Reorder with one click.",
      ],
    },
  ];

  return (
    <div className="how-it-works-page">
      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-overlay" />
        <div
          className="hero-background"
          style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/assets/images/ai2.png)` }}
          onError={(e) => {
            e.target.style.backgroundImage = "none";
            e.target.style.background = "linear-gradient(135deg, #1e3a8a, #2d4a8a)";
          }}
        />
        <div className={`hero-content ${isVisible ? "visible" : ""}`}>
          <h1 className="hero-title">Revolutionize Procurement with AI—Free for Users</h1>
          <p className="hero-subtitle">
            Unleash the power of AI to save time, reduce costs, and streamline procurement—at no cost.
          </p>
          <Link to="/signup" className="hero-button" aria-label="Start Free Today">
            Start Free Today
          </Link>
        </div>
      </header>

      {/* Steps Section */}
      <section className="steps-section">
        <div className="section-container">
          <div className="steps-timeline">
            {steps.map((step, index) => (
              <div
                key={index}
                ref={(el) => (stepRefs.current[index] = el)}
                className={`step-card ${stepVisibility[index] ? "visible" : ""}`}
                data-index={index}
              >
                <div className="step-number">{step.number}</div>
                <h2 className="step-title">{step.title}</h2>
                <p className="step-text">{step.text}</p>
                <ul className="step-list">
                  {step.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-us">
        <div className="section-container">
          <h2 className="why-title">Why Choose TENDORAI?</h2>
          <div className="why-grid">
            {[
              { icon: "💰", title: "100% Free", text: "No fees or subscriptions—smart procurement for all." },
              { icon: "⏱️", title: "Instant Quotes", text: "Best value in seconds with AI precision." },
              { icon: "🔍", title: "Effortless Comparisons", text: "Compare vendors without manual research." },
              { icon: "📉", title: "Cost Optimization", text: "AI-driven savings on every deal." },
              { icon: "📱", title: "Fully Digital", text: "Secure, paperless processes for efficiency." },
            ].map((item, index) => (
              <div
                key={index}
                className={`why-item ${stepVisibility[index] ? "visible" : ""}`}
                data-index={index}
              >
                <span className="why-icon">{item.icon}</span>
                <h3 className="why-item-title">{item.title}</h3>
                <p className="why-item-text">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="cta-section">
        <div className="section-container">
          <h2 className="cta-title">Transform Your Procurement Now—Free & Effortless</h2>
          <p className="cta-subtitle">
            Sign up today and experience AI-powered procurement with no cost or commitment.
          </p>
          <div className="cta-buttons">
            <Link to="/signup" className="primary-button" aria-label="Get Started Free">Get Started Free</Link>
            <Link to="/contact" className="secondary-button" aria-label="Contact Us">Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;