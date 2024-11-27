import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/CCTV.css'; // Add CSS specific to this page if needed

const CCTV = () => {
  return (
    <div className="cctv-page">
      <h1>CCTV Security Systems</h1>
      <p>Protect your assets with high-quality surveillance solutions.</p>

      <section className="features-section">
        <h2>Our CCTV Systems Offer:</h2>
        <ul>
          <li>High-definition video recording</li>
          <li>Remote monitoring from your devices</li>
          <li>Customizable solutions for businesses of all sizes</li>
        </ul>
      </section>

      <div className="cta-section">
        <Link to="/request-quote" className="cta-button">Get a CCTV Quote</Link>
      </div>
    </div>
  );
};

export default CCTV;
