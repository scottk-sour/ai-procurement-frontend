import React from 'react';
import '../../styles/Photocopiers.css'; // Ensure this CSS file exists and is correctly linked

const Photocopiers = () => {
  return (
    <div className="photocopiers-page">
      {/* Hero Section with Background Image */}
      <header className="photocopiers-hero">
        <div className="overlay">
          <h1>Photocopiers & Multi-Functional Devices</h1>
          <p>Streamline your business workflow with cutting-edge multifunction devices.</p>
        </div>
      </header>

      {/* About Section */}
      <section className="about-photocopiers">
        <h2>What Are Multi-Functional Devices?</h2>
        <p>
          Multi-functional devices (MFDs) combine printing, copying, scanning, and faxing capabilities into a single
          machine. They are essential for businesses looking to save space, improve efficiency, and reduce costs.
        </p>
      </section>

      {/* Types of Photocopiers */}
      <section className="types-of-photocopiers">
        <h2>Types of Photocopiers</h2>
        <ul>
          <li>
            <strong>Black and White (Monochrome):</strong> Cost-effective for basic document needs.
          </li>
          <li>
            <strong>Color Copiers:</strong> Ideal for producing high-quality color documents and marketing materials.
          </li>
          <li>
            <strong>Desktop Copiers:</strong> Compact machines for small offices or personal use.
          </li>
          <li>
            <strong>Network Copiers:</strong> Suitable for large teams requiring high-volume, shared access.
          </li>
        </ul>
      </section>

      {/* Key Features */}
      <section className="key-features">
        <h2>Key Features of Multi-Functional Devices</h2>
        <ul>
          <li>High-speed printing and copying for busy environments</li>
          <li>Scan-to-email and cloud storage capabilities</li>
          <li>Duplex (double-sided) printing to save paper</li>
          <li>Wireless and mobile printing for convenience</li>
          <li>User-friendly touchscreen interfaces</li>
          <li>Secure printing to protect sensitive documents</li>
        </ul>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <h2>Why Choose Multi-Functional Devices?</h2>
        <ul>
          <li>Consolidates multiple devices into one, saving office space</li>
          <li>Cost-effective over separate machines</li>
          <li>Improved productivity with advanced features</li>
          <li>Eco-friendly options reduce energy consumption</li>
        </ul>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Upgrade Your Office Equipment?</h2>
        <p>Contact us today to explore our range of multi-functional devices and get a customized quote.</p>
        <button className="cta-button">Request a Quote</button>
      </section>
    </div>
  );
};

export default Photocopiers;
