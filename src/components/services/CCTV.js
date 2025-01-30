import React from 'react';
import { Link } from 'react-router-dom';
import styles from './CCTV.module.css';
import heroImage from '../../assets/images/Camera.png';

const CCTV = () => {
  return (
    <div className={styles.cctvPage}>
      {/* Hero Section */}
      <header
        className={styles.heroSection}
        style={{
          backgroundImage: `url(${heroImage})`, // Using the imported PNG image
          backgroundSize: 'cover', // Ensure the image covers the hero section
          backgroundPosition: 'center', // Center the image within the section
        }}
      >
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1>Secure Your Premises with AI-Driven CCTV Solutions</h1>
          <p>Discover how modern, intelligent surveillance can protect and optimise your business.</p>
          <Link to="/signup" className={styles.heroButton}>
            Explore Security Options
          </Link>
        </div>
      </header>

      {/* Introduction Section */}
      <section className={styles.introSection}>
        <h2>Why Invest in CCTV?</h2>
        <p>
          CCTV (Closed-Circuit Television) systems act as a powerful deterrent against theft and vandalism, 
          while also providing real-time monitoring and evidence gathering. Our AI-driven platform compares 
          systems from multiple manufacturers, helping you find a setup that matches your security requirements.
        </p>
        <ul className={styles.benefitsList}>
          <li><strong>Scalability:</strong> Add cameras and features as your premises grow.</li>
          <li><strong>Remote Access:</strong> Monitor live feeds from anywhere, at any time.</li>
          <li><strong>Cost Efficiency:</strong> Compare models to find the best long-term value.</li>
          <li><strong>Data-Driven Insights:</strong> Use intelligent analytics to spot trends or suspicious activities.</li>
        </ul>
      </section>

      {/* System Features Section */}
      <section className={styles.systemFeatures}>
        <h2>Key Features of Modern CCTV Systems</h2>
        <ul>
          <li><strong>High-Definition or 4K Resolution:</strong> Clear, detailed footage for reliable identification.</li>
          <li><strong>Night Vision & Low-Light Performance:</strong> Round-the-clock visibility, even in dim conditions.</li>
          <li><strong>Motion Detection & Smart Alerts:</strong> Receive notifications on your phone or email for unusual activity.</li>
          <li><strong>Remote Monitoring:</strong> Access live or recorded footage from a secure platform, wherever you are.</li>
          <li><strong>Scalable Storage:</strong> Store footage locally or in the cloud, depending on your preference.</li>
        </ul>
      </section>

      {/* AI Insights Section */}
      <section className={styles.aiInsightsSection}>
        <h2>AI-Driven Security Analysis</h2>
        <p>
          Our platform uses advanced algorithms to match your needs with the right CCTV solutions. By considering your
          property size, risk profile, and budget, it provides an objective, data-backed recommendation—without bias
          towards a particular manufacturer. From simple single-camera setups to enterprise-scale deployments, 
          we’ve got you covered.
        </p>
      </section>

      {/* Manufacturers Section */}
      <section className={styles.manufacturersSection}>
        <h2>Comparing Top Brands</h2>
        <p>
          Different manufacturers offer unique strengths—some focus on rugged outdoor cameras, 
          while others excel at AI-based analytics or integrated cloud services. Our goal is to help you navigate 
          these differences so you can choose the features that truly matter to your operation.
        </p>
      </section>

      {/* Testimonial Section */}
      <section className={styles.testimonialSection}>
        <blockquote>
          “We were losing stock to theft until we installed a system recommended by the AI platform. 
          The process was quick, straightforward, and we’re already seeing a safer workplace.”
        </blockquote>
        <p className={styles.testimonialAuthor}>— James Walker, Warehouse Manager</p>
      </section>

      {/* Call to Action Section */}
      <section className={styles.ctaSection}>
        <h2>Ready to Strengthen Your Security?</h2>
        <p>
          Enter your requirements into our platform and discover which CCTV systems best fit your business.
        </p>
        <div className={styles.ctaButtons}>
          <Link to="/signup" className={styles.primaryButton}>
            Start Your AI-Guided Search
          </Link>
          <button className={styles.secondaryButton}>
            Learn More
          </button>
        </div>
      </section>
    </div>
  );
};

export default CCTV;
