// src/components/WhyChooseUs.js
import React from 'react';
import '../styles/WhyChooseUs.css';

const WhyChooseUs = () => {
  return (
    <div className="why-choose-us-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Revolutionising Procurement, One Quote at a Time</h1>
          <p>Smarter, faster, and more cost-effective procurement for your business.</p>
          <button className="cta-button">Get Started Now</button>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <h2>Why Choose Us?</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <img src="/assets/icons/time-saving.png" alt="Save Time" />
            <h3>Save Time</h3>
            <p>Streamline your procurement process and get quotes in seconds.</p>
          </div>
          <div className="benefit-card">
            <img src="/assets/icons/save-money.png" alt="Save Money" />
            <h3>Save Money</h3>
            <p>Receive competitive quotes and reduce costs by up to 30%.</p>
          </div>
          <div className="benefit-card">
            <img src="/assets/icons/ai-powered.png" alt="AI-Powered Matching" />
            <h3>AI-Powered Matching</h3>
            <p>Our AI intelligently matches you with the most suitable vendors.</p>
          </div>
          <div className="benefit-card">
            <img src="/assets/icons/reliable-vendors.png" alt="Reliable Vendors" />
            <h3>Reliable Vendors</h3>
            <p>Access a curated selection of trusted vendors for your needs.</p>
          </div>
        </div>
      </section>

      {/* Real Results Section */}
      <section className="real-results-section">
        <h2>Real Results</h2>
        <div className="results-content">
          <div className="stats">
            <h3>30%</h3>
            <p>Average cost savings for our clients</p>
          </div>
          <div className="stats">
            <h3>1,000+</h3>
            <p>Quotes generated in seconds</p>
          </div>
          <div className="stats">
            <h3>100+</h3>
            <p>Trusted businesses using our platform</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <h2>How It Works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <h3>Step 1</h3>
            <p>Enter your requirements in our easy-to-use form.</p>
          </div>
          <div className="step-card">
            <h3>Step 2</h3>
            <p>Receive instant, tailored quotes from trusted vendors.</p>
          </div>
          <div className="step-card">
            <h3>Step 3</h3>
            <p>Compare options and select the perfect vendor for your needs.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Save Time and Money?</h2>
        <p>Join [Your Platform Name] today and experience smarter procurement.</p>
        <button className="cta-button">Get Started Now</button>
      </section>
    </div>
  );
};

export default WhyChooseUs;
