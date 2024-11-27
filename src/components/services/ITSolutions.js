import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/ITSolutions.css'; // Add CSS specific to this page if needed

const ITSolutions = () => {
  return (
    <div className="it-solutions-page">
      <h1>IT Solutions</h1>
      <p>Comprehensive IT services to support and grow your business.</p>

      <section className="features-section">
        <h2>Services We Provide:</h2>
        <ul>
          <li>24/7 IT support and troubleshooting</li>
          <li>Cloud services and data storage</li>
          <li>Cybersecurity solutions for peace of mind</li>
        </ul>
      </section>

      <div className="cta-section">
        <Link to="/request-quote" className="cta-button">Discover IT Services</Link>
      </div>
    </div>
  );
};

export default ITSolutions;
