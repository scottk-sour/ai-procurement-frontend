// src/components/services/Photocopiers.js
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Photocopiers.module.css"; // Use your existing CSS module (updated below)
import heroImage from "../../assets/images/Best-photocopiers.png"; // Ensure this exists

const Photocopiers = () => {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(false); // State for animation visibility

  useEffect(() => {
    window.scrollTo(0, 0);
    // Set visibility after a short delay for animation effect
    const timer = setTimeout(() => setIsVisible(true), 100); // Match CCTV.js delay
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className={styles.photocopiersPage}>
      {/* Hero Section */}
      <header className={styles.heroSection} data-animation="fadeIn" data-visible={isVisible}>
        <div className={styles.heroOverlay} />
        <div
          className={styles.heroBackground}
          style={{ backgroundImage: `url(${heroImage})` }}
          onError={(e) => {
            e.target.style.backgroundImage = "none";
            e.target.style.background = "linear-gradient(135deg, #1e3a8a, #2d4a8a)"; // TENDORAI fallback
          }}
          data-parallax-speed="0.3" // Optional: Add for parallax effect (handled in CSS)
        />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Elevate Your Printing with Premium Photocopiers</h1>
          <p className={styles.heroSubtitle}>
            Discover cutting-edge, cost-effective photocopiers tailored to revolutionize your business efficiency—free and instant.
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
          <h2 className={styles.sectionTitle}>Why Elevate with Photocopiers?</h2>
          <p className={styles.sectionText}>
            Multifunction photocopiers provide robust efficiency by reducing costs, enabling high-quality printing, and delivering critical document management. Our AI-driven platform simplifies the process, connecting you with top-tier systems perfectly matched to your specific needs.
          </p>
          <ul className={styles.benefitsList}>
            {[
              { title: "Cost Efficiency", text: "Optimize budgets with AI-driven print volume analysis." },
              { title: "Ease of Use", text: "Intuitive interfaces for seamless operation." },
              { title: "Versatility", text: "All-in-one print, scan, and copy solutions." },
              { title: "Sustainability", text: "Eco-conscious options with reduced energy consumption." },
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
          <h2 className={styles.sectionTitle}>Key Features of Modern Photocopiers</h2>
          <div className={styles.featuresGrid}>
            {[
              { title: "Blazing-Speed Printing", text: "High-performance output up to 100 PPM for elite offices." },
              { title: "Crystal-Clear Resolution", text: "Ultra-sharp 1200 DPI prints in vibrant color and monochrome." },
              { title: "Advanced Connectivity", text: "Seamless wireless, cloud, and mobile app integration." },
              { title: "Fortified Security", text: "Follow-me printing, PIN access, and AES-256 encryption." },
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
          <h2 className={styles.sectionTitle}>AI-Powered Precision Insights</h2>
          <p className={styles.sectionText}>
            Our platform harnesses advanced AI to analyze your print volume, paper specifications, and finishing needs—delivering unbiased recommendations from leading photocopier systems. From small offices to enterprise solutions, we ensure you get the perfect fit, instantly and free.
          </p>
        </div>
      </section>

      {/* Finishing Section (Renamed from Manufacturers for consistency) */}
      <section
        className={styles.finishingSection}
        data-animation="fadeInUp"
        data-delay="1000"
        data-visible={isVisible}
      >
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Premium Finishing & Accessories</h2>
          <p className={styles.sectionText}>
            We evaluate top finishing options, highlighting strengths like precision binding or high-capacity trays, so you can choose accessories that align with your priorities—no guesswork required.
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
            “Our printing efficiency soared with TENDORAI’s AI-recommended photocopiers—cutting costs by 30% and enhancing quality beyond expectation.”
          </blockquote>
          <p className={styles.testimonialAuthor}>— Alex Roberts, IT Manager</p>
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
          <h2 className={styles.ctaTitle}>Transform Your Printing Today</h2>
          <p className={styles.ctaSubtitle}>
            Input your needs and let our AI match you with the ideal photocopier solution—free and effortless.
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

export default Photocopiers;