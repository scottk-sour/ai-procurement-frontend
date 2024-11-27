import React from 'react';

const Photocopiers = () => {
  return (
    <div className="photocopiers-page">
      {/* Hero Section */}
      <header
        className="hero-section"
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL}/assets/images/copiermanu.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          color: '#fff',
          textAlign: 'center',
          padding: '100px 20px',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)', // Optional overlay for better readability
            zIndex: 1,
          }}
        />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1>Photocopiers & Multi-Functional Devices</h1>
          <p>Streamline your business workflow with cutting-edge multifunction devices.</p>
        </div>
      </header>

      {/* Introduction Section */}
      <section className="content-section">
        <h2>What Are Multi-Functional Devices?</h2>
        <p>
          Multi-functional devices (MFDs) combine printing, copying, scanning, and faxing capabilities into a single
          machine. They are essential for businesses looking to save space, improve efficiency, and reduce costs.
        </p>
      </section>

      {/* Types of Photocopiers */}
      <section className="types-section">
        <h2>Types of Photocopiers</h2>
        <ul>
          <li><strong>Black and White (Monochrome):</strong> Cost-effective for basic document needs.</li>
          <li><strong>Color Copiers:</strong> Ideal for producing high-quality color documents and marketing materials.</li>
          <li><strong>Desktop Copiers:</strong> Compact machines for small offices or personal use.</li>
          <li><strong>Network Copiers:</strong> Suitable for large teams requiring high-volume, shared access.</li>
        </ul>
      </section>

      {/* Features Section */}
      <section className="features-section">
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

      {/* Call-to-Action Section */}
      <section className="cta-section">
        <h2>Ready to Upgrade Your Office Equipment?</h2>
        <div className="cta-buttons">
          <button className="cta-button">Request a Quote</button>
          <button className="cta-button secondary">Learn More</button>
        </div>
      </section>
    </div>
  );
};

export default Photocopiers;
