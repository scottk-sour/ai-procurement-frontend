// src/components/HowItWorks.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HowItWorks.css';

const HowItWorks = () => {
  return (
    <div className="how-it-works-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Revolutionising Procurement – 100% Free for Users</h1>
          <p>AI-powered procurement that saves you time, money, and effort—completely free!</p>
        </div>
      </section>

      {/* Step-by-Step Process */}
      <div className="steps-container">
        <section className="step-section">
          <h2>Step 1: Sign Up & Set Your Preferences</h2>
          <p>Signing up is quick, easy, and completely free.</p>
          <ul>
            <li>🔹 <strong>Create an Account</strong> – Register your business in seconds.</li>
            <li>🔹 <strong>Define Your Needs</strong> – Tell us what products or services you’re looking for.</li>
            <li>🔹 <strong>Set Preferences</strong> – Choose preferred vendors or let AI suggest the best matches.</li>
          </ul>
        </section>

        <section className="step-section">
          <h2>Step 2: Request a Quote in Seconds</h2>
          <p>No phone calls or endless forms—just instant AI-powered quotes.</p>
          <ul>
            <li>🔹 <strong>Enter your request</strong> (e.g., "5 high-speed office printers with a lease option").</li>
            <li>🔹 <strong>Upload any supporting documents</strong> (optional, such as invoices or vendor contracts).</li>
            <li>🔹 <strong>Click ‘Request a Quote’</strong> – Our AI instantly starts analyzing your needs.</li>
          </ul>
        </section>

        <section className="step-section">
          <h2>Step 3: AI Matches You with the Best Vendors</h2>
          <p>Our AI scans thousands of suppliers and picks the top 3 for your needs.</p>
          <ul>
            <li>✅ Best Pricing & Discounts</li>
            <li>✅ Service Level Agreements (SLAs)</li>
            <li>✅ Warranty & Maintenance Options</li>
            <li>✅ Verified Vendor Ratings & Reviews</li>
          </ul>
          <p>AI-generated quotes are created instantly—so you can review them in seconds!</p>
        </section>

        <section className="step-section">
          <h2>Step 4: Compare & Choose the Best Quote</h2>
          <p>Get side-by-side comparisons of the best vendor quotes.</p>
          <ul>
            <li>🔹 Full cost breakdown (purchase, lease, maintenance).</li>
            <li>🔹 Delivery times & service agreements.</li>
            <li>🔹 Click on a vendor for detailed profiles and customer feedback.</li>
            <li>🔹 Accept or negotiate the quote directly within the platform.</li>
          </ul>
        </section>

        <section className="step-section">
          <h2>Step 5: Securely Finalise & Sign Contracts</h2>
          <p>Complete the procurement process **digitally and hassle-free**.</p>
          <ul>
            <li>🔹 AI-generated contracts with **built-in e-signatures**.</li>
            <li>🔹 No paperwork—finalize everything online.</li>
            <li>🔹 Track order status, estimated delivery, and vendor updates in real time.</li>
          </ul>
        </section>

        <section className="step-section">
          <h2>Step 6: Manage Everything in Your User Dashboard</h2>
          <p>Track all orders, spending, and procurement activities from a single dashboard.</p>
          <ul>
            <li>✅ View & manage current, pending, and completed orders.</li>
            <li>✅ AI-powered cost-saving insights & budget tracking.</li>
            <li>✅ **Reorder with one click** – no need to go through the full process again.</li>
          </ul>
        </section>
      </div>

      {/* Why Choose Us Section */}
      <section className="why-choose-us">
        <h2>🔍 Why Use Our AI-Powered Procurement Platform?</h2>
        <ul>
          <li>✅ <strong>100% Free for Businesses</strong> – No subscriptions, no hidden fees!</li>
          <li>✅ <strong>Instant, Fair Pricing</strong> – AI ensures **the best value deals.**</li>
          <li>✅ <strong>Side-by-Side Comparisons</strong> – No manual research required.</li>
          <li>✅ <strong>Smart Budgeting & Cost Optimization</strong> – AI helps you save money.</li>
          <li>✅ <strong>Seamless, Paperless Procurement</strong> – Fully digital with secure e-signatures.</li>
        </ul>
      </section>

      {/* Call-to-Action Section */}
      <section className="cta-section">
        <h2>🚀 Get Started Today – No Cost, No Obligation!</h2>
        <p>Sign up now and **request your first quote in seconds**—100% free!</p>
        <div className="cta-buttons">
          <Link to="/signup" className="primary-button">
            Start Now for Free
          </Link>
          <Link to="/contact" className="secondary-button">
            Contact Support
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
