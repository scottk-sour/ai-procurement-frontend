// src/components/services/CCTV.js
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./CCTV.module.css"; // Use your existing CSS module (updated below)
import heroImage from "../../assets/images/Camera.png"; // Ensure this exists

const CCTV = () => {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(false); // State for animation visibility

  useEffect(() => {
    window.scrollTo(0, 0);
    // Set visibility after a short delay for animation effect
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className={styles.cctvPage}>
      {/* Hero Section */}
      <header className={styles.heroSection} data-animation="fadeIn" data-visible={isVisible}>
        <div className={styles.heroOverlay} />
        <div
          className={styles.heroBackground}
          style={{ backgroundImage: `url(${heroImage})` }}
          onError={(e) => {
            e.target.style.backgroundImage = "none";
            e.target.style.background = "linear-gradient(135deg, #1e3a8a, #2d4a8a)";
          }}
          data-parallax-speed="0.3" // Optional: Add for parallax effect (handled in CSS)
        />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Secure Your Business with AI-Driven CCTV</h1>
          <p className={styles.heroSubtitle}>
            Discover intelligent surveillance solutions tailored to protect and optimize your premises—free and instant.
          </p>
          <Link to="/signup" className={styles.heroButton}>
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Introduction Section */}
      <section
        className={styles.introSection}
        data-animation="fadeInUp"
        data-delay="200"
        data-visible={isVisible}
      >
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Why Choose CCTV?</h2>
          <p className={styles.sectionText}>
            Closed-Circuit Television (CCTV) systems provide robust security by deterring theft, enabling real-time monitoring, and delivering critical evidence. Our AI-driven platform simplifies the process, connecting you with top-tier systems perfectly matched to your specific needs.
          </p>
          <ul className={styles.benefitsList}>
            {[
              { title: "Scalability", text: "Expand coverage as your business grows effortlessly." },
              { title: "Remote Access", text: "Monitor feeds anytime, anywhere, securely." },
              { title: "Cost Efficiency", text: "Find the best value through AI-powered comparisons." },
              { title: "Smart Insights", text: "Leverage AI analytics for proactive security and insights." },
            ].map((benefit, index) => (
              <li key={index} className={styles.benefitItem}>
                <strong>{benefit.title}:</strong> {benefit.text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Features Section */}
      <section
        className={styles.featuresSection}
        data-animation="fadeInUp"
        data-delay="400"
        data-visible={isVisible}
      >
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Key Features of Modern CCTV</h2>
          <div className={styles.featuresGrid}>
            {[
              { title: "Ultra-High Resolution", text: "Capture clear, detailed footage with HD or 4K cameras for precise identification." },
              { title: "Night Vision", text: "Ensure visibility in low-light conditions with advanced infrared technology." },
              { title: "Smart Detection", text: "Receive instant alerts for motion or anomalies via phone or email." },
              { title: "Remote Monitoring", text: "Access live and recorded footage securely from any device, anywhere." },
            ].map((feature, index) => (
              <div
                key={index}
                className={styles.featureItem}
                data-animation="fadeInUp"
                data-delay={400 + index * 200}
                data-visible={isVisible}
              >
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureText}>{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Insights Section */}
      <section
        className={styles.aiInsightsSection}
        data-animation="fadeInUp"
        data-delay="800"
        data-visible={isVisible}
      >
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>AI-Enhanced Security</h2>
          <p className={styles.sectionText}>
            Our platform harnesses advanced AI to analyze your security needs—property size, risk factors, and budget—delivering unbiased recommendations from leading CCTV systems. From small setups to enterprise solutions, we ensure you get the perfect fit, instantly and free.
          </p>
        </div>
      </section>

      {/* Manufacturers Section */}
      <section
        className={styles.manufacturersSection}
        data-animation="fadeInUp"
        data-delay="1000"
        data-visible={isVisible}
      >
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Top Brands Compared</h2>
          <p className={styles.sectionText}>
            We evaluate leading manufacturers, highlighting strengths like durability, analytics, or cloud integration, so you can choose a system that aligns with your priorities—no guesswork required.
          </p>
        </div>
      </section>

      {/* Testimonial Section */}
      <section
        className={styles.testimonialSection}
        data-animation="fadeInUp"
        data-delay="1200"
        data-visible={isVisible}
      >
        <div className={styles.sectionContainer}>
          <blockquote className={styles.testimonialQuote}>
            “After losing stock to theft, we used TENDORAI to find a CCTV system fast. It’s transformed our workplace safety and efficiency.”
          </blockquote>
          <p className={styles.testimonialAuthor}>— James Walker, Warehouse Manager</p>
        </div>
      </section>

      {/* Call to Action Section */}
      <section
        className={styles.ctaSection}
        data-animation="fadeInUp"
        data-delay="1400"
        data-visible={isVisible}
      >
        <div className={styles.sectionContainer}>
          <h2 className={styles.ctaTitle}>Secure Your Business Today</h2>
          <p className={styles.ctaSubtitle}>
            Input your needs and let our AI match you with the ideal CCTV solution—free and effortless.
          </p>
          <div className={styles.ctaButtons}>
            <Link to="/signup" className={styles.primaryButton}>Start Now</Link>
            <Link to="/how-it-works" className={styles.secondaryButton}>Learn More</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CCTV;