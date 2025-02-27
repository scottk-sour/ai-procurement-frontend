// src/components/services/ITServices.js
import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./ITServices.module.css";
import backgroundImage from "../../assets/images/ITS.png"; // Ensure this exists

const ITServices = () => {
  // Scroll to top on route change
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className={styles.itServicesPage}>
      {/* Hero Section */}
      <header className={styles.heroSection}>
        <div className={styles.heroOverlay} />
        <div
          className={styles.heroBackground}
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Elevate Your IT Infrastructure</h1>
          <p className={styles.heroSubtitle}>
            Unlock tailored software, hardware, and support with our AI-driven platform.
          </p>
          <Link to="/signup" className={styles.heroButton}>
            Start Your IT Journey
          </Link>
        </div>
      </header>

      {/* Introduction Section */}
      <section className={styles.introSection}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Why Optimize Your IT?</h2>
          <p className={styles.sectionText}>
            A modern IT setup is the backbone of efficiency and security. Our AI platform compares solutions across hardware, software, and support, delivering unbiased recommendations to power your business.
          </p>
          <div className={styles.benefitsGrid}>
            <div className={styles.benefitItem}>
              <h3>Hardware Essentials</h3>
              <p>PCs, servers, and networking gear for seamless operations.</p>
            </div>
            <div className={styles.benefitItem}>
              <h3>Software Solutions</h3>
              <p>Productivity tools and security suites tailored to you.</p>
            </div>
            <div className={styles.benefitItem}>
              <h3>Expert Support</h3>
              <p>Reliable assistance to minimize downtime.</p>
            </div>
            <div className={styles.benefitItem}>
              <h3>Scalability</h3>
              <p>Grow your IT as your business expands.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Key IT Features</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureItem}>
              <h3>Cloud Integration</h3>
              <p>Secure collaboration and storage across teams.</p>
            </div>
            <div className={styles.featureItem}>
              <h3>Virtualization</h3>
              <p>Optimize resources with efficient deployment.</p>
            </div>
            <div className={styles.featureItem}>
              <h3>Cybersecurity</h3>
              <p>Protect data and meet compliance standards.</p>
            </div>
            <div className={styles.featureItem}>
              <h3>Remote Access</h3>
              <p>Enable productivity from anywhere.</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Insights Section */}
      <section className={styles.aiInsightsSection}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>AI-Powered IT Insights</h2>
          <p className={styles.sectionText}>
            Our platform analyzes your business size, security needs, and budget, recommending IT solutions—from team laptops to enterprise servers—without sales bias, just data-driven precision.
          </p>
        </div>
      </section>

      {/* Support Services Section */}
      <section className={styles.supportSection}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>IT Support Options</h2>
          <div className={styles.supportGrid}>
            <div className={styles.supportItem}>
              <h3>Help Desk</h3>
              <p>Instant remote troubleshooting and updates.</p>
            </div>
            <div className={styles.supportItem}>
              <h3>On-Site Support</h3>
              <p>Hands-on assistance for complex issues.</p>
            </div>
            <div className={styles.supportItem}>
              <h3>Monitoring</h3>
              <p>Proactive threat detection and prevention.</p>
            </div>
            <div className={styles.supportItem}>
              <h3>Training</h3>
              <p>Maximize system use with expert onboarding.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className={styles.testimonialSection}>
        <div className={styles.sectionContainer}>
          <blockquote className={styles.testimonialQuote}>
            “Standardizing our IT with this platform slashed support tickets by 40% and boosted productivity.”
          </blockquote>
          <p className={styles.testimonialAuthor}>— Marcus Hill, Operations Manager</p>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className={styles.ctaSection}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.ctaTitle}>Upgrade Your IT Today</h2>
          <p className={styles.ctaSubtitle}>
            Get tailored IT solutions with zero hassle—start now and see the difference.
          </p>
          <div className={styles.ctaButtons}>
            <Link to="/signup" className={styles.primaryButton}>Get Started</Link>
            <Link to="/how-it-works" className={styles.secondaryButton}>Learn More</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ITServices;