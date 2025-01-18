import React from 'react';
import { Link } from 'react-router-dom';  // Import Link for navigation
import styles from './Telecoms.module.css'; // Adjust path as needed

const Telecoms = () => {
  return (
    <div className={styles.telecomsPage}>
      {/* Hero Section */}
      <header
        className={styles.heroSection}
        style={{
          backgroundImage: 'url("placeholder-hero-telecoms.jpg")', // Replace with your own image
        }}
      >
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1>Transform Your Communications with AI-Guided Solutions</h1>
          <p>Discover cost-effective and reliable telecoms, from VoIP to high-speed broadband, all without bias.</p>
          {/* Hero button now links to /signup */}
          <Link to="/signup" className={styles.heroButton}>
            Explore Telecoms Options
          </Link>
        </div>
      </header>

      {/* Introduction Section */}
      <section className={styles.introSection}>
        <h2>Why Modern Telecoms Matter</h2>
        <p>
          Effective communication is the backbone of any business. Whether you’re a small enterprise or a global firm, 
          having a robust telecoms system can boost productivity, enhance customer service, and reduce overheads. 
          Our AI-driven platform helps you navigate:
        </p>
        <ul className={styles.benefitsList}>
          <li><strong>VoIP Systems:</strong> Affordable calls and flexible cloud-based features.</li>
          <li><strong>Fibre Broadband:</strong> Lightning-fast connectivity to handle data-heavy tasks.</li>
          <li><strong>Mobile Solutions:</strong> Tailored plans for employees on the go.</li>
          <li><strong>Scalability & Growth:</strong> Add lines or upgrade services as your needs evolve.</li>
        </ul>
      </section>

      {/* Telecoms Features Section */}
      <section className={styles.featuresSection}>
        <h2>Key Features of Modern Telecoms</h2>
        <ul>
          <li><strong>Cloud-Based VoIP:</strong> Access your phone system from anywhere, using any device.</li>
          <li><strong>Unified Communications:</strong> Integrate voice, video, and messaging into one cohesive platform.</li>
          <li><strong>High-Speed Fibre & Broadband:</strong> Ensure reliability for streaming, conferencing, and large file transfers.</li>
          <li><strong>Mobile Device Management:</strong> Securely manage smartphones, tablets, and data usage.</li>
          <li><strong>Scalable Packages:</strong> Add or remove lines and services without major upfront costs.</li>
        </ul>
      </section>

      {/* AI Insights Section */}
      <section className={styles.aiInsightsSection}>
        <h2>AI-Driven Comparisons</h2>
        <p>
          Our platform analyses your current call volumes, bandwidth usage, and mobile device requirements to recommend
          the ideal telecoms plan—free from supplier bias. Whether you need advanced call routing, unlimited data, 
          or enterprise-level security, our AI pinpoints the best-fit solutions from leading providers.
        </p>
      </section>

      {/* Providers Section */}
      <section className={styles.providersSection}>
        <h2>Leading Providers & Their Strengths</h2>
        <p>
          Different providers prioritise different features—some excel in cost-effective fibre broadband, while others 
          focus on comprehensive VoIP bundles or robust mobile contracts. Our platform helps you compare them all, 
          saving you the hassle of juggling multiple quotes and sales pitches.
        </p>
      </section>

      {/* Testimonial Section */}
      <section className={styles.testimonialSection}>
        <blockquote>
          “Switching to cloud-based VoIP and fibre broadband through the AI platform was seamless. 
          Our team now collaborates better, and we’ve cut monthly phone bills by nearly 30%.”
        </blockquote>
        <p className={styles.testimonialAuthor}>— Charlotte Green, IT Director</p>
      </section>

      {/* Call to Action Section */}
      <section className={styles.ctaSection}>
        <h2>Ready to Upgrade Your Telecoms?</h2>
        <p>
          Input your requirements to see unbiased recommendations for VoIP, mobiles, broadband, and more. 
          Get the technology that suits your budget and performance needs.
        </p>
        <div className={styles.ctaButtons}>
          {/* Primary button now links to /signup */}
          <Link to="/signup" className={styles.primaryButton}>
            Start Your AI-Guided Telecoms Search
          </Link>
          <button className={styles.secondaryButton}>
            Learn More
          </button>
        </div>
      </section>
    </div>
  );
};

export default Telecoms;
