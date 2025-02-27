// src/components/services/Telecoms.js
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Telecoms.module.css"; // Use your existing CSS module (updated below)
import heroImage from "../../assets/images/VoIP-System-1200x900.jpg"; // Ensure this exists

const Telecoms = () => {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(false); // State for animation visibility

  useEffect(() => {
    window.scrollTo(0, 0);
    // Set visibility after a short delay for animation effect
    const timer = setTimeout(() => setIsVisible(true), 100); // Match CCTV.js delay
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className={styles.telecomsPage}>
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
          <h1 className={styles.heroTitle}>Elevate Your Communications with AI</h1>
          <p className={styles.heroSubtitle}>
            Find reliable, cost-effective telecom solutions tailored to your business needs.
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
          <h2 className={styles.sectionTitle}>Why Upgrade Your Telecoms?</h2>
          <p className={styles.sectionText}>
            Seamless communication is vital for business success. Our AI-driven platform compares VoIP, broadband, and mobile solutions from top providers, delivering unbiased recommendations to enhance productivity and cut costs.
          </p>
          <ul className={styles.benefitsList}>
            {[
              { title: "VoIP Efficiency", text: "Affordable, cloud-based calling." },
              { title: "Fibre Speed", text: "Fast, reliable internet connectivity." },
              { title: "Mobile Flexibility", text: "Plans for on-the-go teams." },
              { title: "Scalability", text: "Grow your system with ease." },
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
          <h2 className={styles.sectionTitle}>Key Telecom Features</h2>
          <div className={styles.featuresGrid}>
            {[
              { title: "Cloud VoIP", text: "Access your phone system from anywhere with any device." },
              { title: "Unified Communications", text: "Integrate voice, video, and messaging seamlessly." },
              { title: "High-Speed Broadband", text: "Reliable fibre for conferencing and large data transfers." },
              { title: "Mobile Management", text: "Securely manage devices and data usage." },
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
          <h2 className={styles.sectionTitle}>AI-Powered Insights</h2>
          <p className={styles.sectionText}>
            Our platform evaluates your call volume, bandwidth needs, and mobile usage, recommending telecom solutions with detailed cost and performance data—ensuring you get the best fit without supplier bias.
          </p>
        </div>
      </section>

      {/* Providers Section */}
      <section
        className={styles.providersSection}
        data-animation="fadeInUp"
        data-delay="1000"
        data-visible={isVisible}
      >
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Top Providers Compared</h2>
          <p className={styles.sectionText}>
            From cost-effective VoIP to robust mobile contracts, we compare leading providers’ strengths, simplifying your decision-making process with clear, actionable insights.
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
            “Switching to VoIP and fibre via this platform cut our bills by 30% and boosted team collaboration.”
          </blockquote>
          <p className={styles.testimonialAuthor}>— Charlotte Green, IT Director</p>
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
          <h2 className={styles.ctaTitle}>Ready to Enhance Your Telecoms?</h2>
          <p className={styles.ctaSubtitle}>
            Explore unbiased telecom solutions tailored to your business today.
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

export default Telecoms;