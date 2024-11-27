import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Telecoms.css'; // Add CSS specific to this page if needed

const Telecoms = () => {
  return (
    <div className="telecoms-page">
      <h1>Telecom Solutions</h1>
      <p>Reliable communication systems to keep your business connected.</p>

      <section className="features-section">
        <h2>What We Offer:</h2>
        <ul>
          <li>VoIP systems for seamless communication</li>
          <li>Affordable call rates and packages</li>
          <li>24/7 technical support and maintenance</li>
        </ul>
      </section>

      <div className="cta-section">
        <Link to="/request-quote" className="cta-button">Explore Telecoms Deals</Link>
      </div>
    </div>
  );
};

export default Telecoms;
