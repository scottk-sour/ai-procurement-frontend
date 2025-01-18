import React from 'react';
import { Link } from 'react-router-dom';  // 1. Import Link from react-router-dom
import styles from './Photocopiers.module.css';

const Photocopiers = () => {
  return (
    <div className={styles.photocopiersPage}>
      {/* Hero Section */}
      <header
        className={styles.heroSection}
        style={{
          backgroundImage: 'url("placeholder-hero.jpg")', // Placeholder hero image
        }}
      >
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1>Optimise Your Printing & Discover Cost Savings</h1>
          <p>Compare and learn about multifunctional devices—without bias.</p>
          {/* Updated hero button to link to /signup */}
          <Link to="/signup" className={styles.heroButton}>
            Start Your AI-Guided Search
          </Link>
        </div>
      </header>

      {/* Introduction Section */}
      <section className={styles.introSection}>
        <h2>Why Use Our AI Platform?</h2>
        <p>
          Our artificial intelligence platform scours the market to find printers and multifunctional devices that match
          your needs, saving you both time and money. Rather than pushing a single manufacturer, we aggregate data from
          various sources to help you compare:
        </p>
        <ul className={styles.benefitsList}>
          <li><strong>Cost Efficiency:</strong> Identify machines that fit your budget and print volume.</li>
          <li><strong>Ease of Use:</strong> Narrow down options with user-friendly interfaces and automated settings.</li>
          <li><strong>Advanced Features:</strong> Explore extras like hole punching, “follow-me” print, and more.</li>
          <li><strong>Sustainability:</strong> Filter by energy-saving modes and eco-friendly consumables.</li>
        </ul>
      </section>

      {/* Manufacturers & Device Features Section */}
      <section className={styles.manufacturersSection}>
        <h2>Understanding Different Manufacturers & Models</h2>
        <p>
          Each manufacturer offers a variety of models suited to specific business needs. Some excel at high-speed duplex
          printing, while others focus on superior colour accuracy or expanded finishing options (e.g. stapling, hole
          punching). Our AI platform helps you assess:
        </p>
        <ul>
          <li><strong>Print Speeds (PPM):</strong> How quickly documents are printed (pages per minute).</li>
          <li><strong>Resolution (DPI):</strong> The level of detail in both monochrome and colour prints.</li>
          <li><strong>Connectivity:</strong> Features like wireless printing, Ethernet, cloud connectivity, and mobile apps.</li>
          <li><strong>Security Features:</strong> Follow-me printing, access control, and data encryption to protect sensitive information.</li>
        </ul>
        <p>
          Rather than directing you to one brand over another, we provide a balanced overview of each manufacturer’s
          strengths, letting you decide which device is the best fit for your office or organisation.
        </p>
      </section>

      {/* AI Insights Section */}
      <section className={styles.aiInsightsSection}>
        <h2>AI-Driven Insights</h2>
        <p>
          Our platform’s AI analyses your monthly volume, paper sizes, desired finishing options, and more. It then
          compiles a shortlist of devices across multiple manufacturers, showing you the projected total cost of ownership,
          energy consumption, and how each model aligns with your specific requirements. You gain the knowledge you need
          to make an informed decision, without the sales pitch.
        </p>
      </section>

      {/* Accessories & Finishing Section */}
      <section className={styles.accessoriesSection}>
        <h2>Available Accessories & Finishing Options</h2>
        <ul>
          <li><strong>Hole Punching:</strong> Create professionally bound documents with minimal hassle.</li>
          <li><strong>Stapling & Booklet Making:</strong> Produce brochures, booklets, and collated reports automatically.</li>
          <li><strong>Follow-Me Printing:</strong> Securely print documents by releasing them only when you’re at the machine.</li>
          <li><strong>Large Capacity Paper Trays:</strong> Keep printing without frequent paper reloads.</li>
        </ul>
        <p>
          Whether you require advanced finishing for marketing materials or simple convenience features, your AI-guided
          results ensure you find a device with the exact functions you need.
        </p>
      </section>

      {/* Testimonial */}
      <section className={styles.testimonialSection}>
        <blockquote>
          “We reduced our yearly printing expenses by 25% using the AI platform to compare different machines. It was
          quick, unbiased, and gave us data we never even considered before.”
        </blockquote>
        <p className={styles.testimonialAuthor}>— Alex Roberts, IT Manager</p>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <h2>Ready to Explore Your Options?</h2>
        <p>Start comparing models from top manufacturers, all in one place. No hidden agendas—just actionable insights.</p>
        <div className={styles.ctaButtons}>
          {/* Updated primary button to Link to /signup */}
          <Link to="/signup" className={styles.primaryButton}>
            Let the AI Find My Ideal Device
          </Link>
          <button className={styles.secondaryButton}>
            Learn More
          </button>
        </div>
      </section>
    </div>
  );
};

export default Photocopiers;
