import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import styles from './ITServices.module.css'; // Adjust the path/name as needed
import backgroundImage from '../../assets/images/ITSupport.png'; // Import your background image

const ITServices = () => {
  return (
    <div className={styles.itServicesPage}>
      {/* Hero Section */}
      <header
        className={styles.heroSection}
        style={{
          backgroundImage: `url(${backgroundImage})`, // Set the imported image as the background
        }}
      >
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1>Empower Your Business with Modern IT Solutions</h1>
          <p>
            Discover flexible software, reliable hardware, and expert support—tailored by our AI platform.
          </p>
          {/* Updated hero button: Link to /signup */}
          <Link to="/signup" className={styles.heroButton}>
            Begin Your AI-Guided IT Search
          </Link>
        </div>
      </header>

      {/* Introduction Section */}
      <section className={styles.introSection}>
        <h2>Why Invest in the Right IT Setup?</h2>
        <p>
          In today’s digital-first environment, a robust IT infrastructure is essential to keep your operations 
          running smoothly. From office hardware to cloud-based software and professional support, our platform 
          evaluates it all—so you don’t have to. Easily compare:
        </p>
        <ul className={styles.benefitsList}>
          <li><strong>Hardware Essentials:</strong> PCs, servers, networking gear, and peripherals.</li>
          <li><strong>Software Solutions:</strong> Productivity suites, security tools, and custom applications.</li>
          <li><strong>IT Support Packages:</strong> On-site assistance, remote help desk, and proactive maintenance.</li>
          <li><strong>Scalability & Upgrades:</strong> Adapt your IT setup as your business grows.</li>
        </ul>
      </section>

      {/* IT Features Section */}
      <section className={styles.featuresSection}>
        <h2>Key Aspects of Modern IT Systems</h2>
        <ul>
          <li><strong>Cloud Integration:</strong> Collaborate effortlessly across distributed teams and store data securely.</li>
          <li><strong>Virtualisation & Containerisation:</strong> Improve resource utilisation and deployment speed.</li>
          <li><strong>Cybersecurity & Compliance:</strong> Protect critical data while meeting industry standards.</li>
          <li><strong>Mobile & Remote Access:</strong> Enable employees to work productively from any location.</li>
          <li><strong>Automated Updates & Patching:</strong> Reduce downtime with seamless, scheduled maintenance.</li>
        </ul>
      </section>

      {/* AI Insights Section */}
      <section className={styles.aiInsightsSection}>
        <h2>AI-Driven Recommendations</h2>
        <p>
          Our platform analyses your business size, security requirements, and budget to recommend the most suitable 
          hardware and software combinations. From selecting laptops for a small team to designing an enterprise-grade 
          server network, you’ll receive unbiased, data-informed suggestions without the typical sales pressure.
        </p>
      </section>

      {/* Support Services Section */}
      <section className={styles.supportSection}>
        <h2>IT Support Services</h2>
        <p>
          Whether you prefer in-house assistance or fully outsourced support, it’s crucial to choose a reliable partner
          who can resolve issues quickly and minimise downtime. Our AI system helps you compare:
        </p>
        <ul>
          <li><strong>Help Desk & Remote Support:</strong> Instant troubleshooting and software updates.</li>
          <li><strong>On-Site Assistance:</strong> For hardware maintenance, installations, and complex repairs.</li>
          <li><strong>Proactive Monitoring:</strong> Identify potential threats before they escalate.</li>
          <li><strong>Training & Onboarding:</strong> Ensure your team gets the most out of new systems.</li>
        </ul>
      </section>

      {/* Testimonial Section */}
      <section className={styles.testimonialSection}>
        <blockquote>
          “After using the AI tool to standardise our hardware and software, we’ve cut support tickets by 40%. 
          Our staff productivity is at an all-time high.”
        </blockquote>
        <p className={styles.testimonialAuthor}>— Marcus Hill, Operations Manager</p>
      </section>

      {/* Call to Action Section */}
      <section className={styles.ctaSection}>
        <h2>Ready to Level Up Your IT?</h2>
        <p>
          Enter your requirements to see unbiased recommendations for software, hardware, and support solutions.
          Get the technology that fits your workflows—and your budget.
        </p>
        <div className={styles.ctaButtons}>
          {/* Replace button with <Link> to navigate to /signup */}
          <Link to="/signup" className={styles.primaryButton}>
            Begin Your AI-Guided IT Search
          </Link>
          <button className={styles.secondaryButton}>
            Learn More
          </button>
        </div>
      </section>
    </div>
  );
};

export default ITServices;
