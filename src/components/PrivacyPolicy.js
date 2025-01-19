// src/components/PrivacyPolicy.js
import React from 'react';
import '../styles/PrivacyPolicy.css'; // Assuming you have a corresponding CSS file for styling

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy-container">
      <h1>Privacy Policy</h1>
      <p>Last Updated: [Insert Date]</p>

      <section>
        <h2>1. Introduction</h2>
        <p>
          Welcome to [Your Platform Name]. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our platform. Please read this policy carefully. If you do not agree with the terms of this Privacy Policy, please do not access the platform.
        </p>
      </section>

      <section>
        <h2>2. Information We Collect</h2>
        <h3>2.1 Personal Information</h3>
        <p>
          When you register, log in, or use our services, we may collect the following personal information:
        </p>
        <ul>
          <li>Name</li>
          <li>Email address</li>
          <li>Phone number</li>
          <li>Billing and shipping addresses</li>
        </ul>

        <h3>2.2 Non-Personal Information</h3>
        <p>
          We may also collect non-personal information, including your device type, browser type, IP address, and how you interact with our platform.
        </p>
      </section>

      <section>
        <h2>3. How We Use Your Information</h2>
        <ul>
          <li>To provide and maintain our platform and services.</li>
          <li>To personalise your experience on the platform.</li>
          <li>To process payments and send invoices or receipts.</li>
          <li>To improve our platform and customer service.</li>
          <li>To communicate with you about updates, promotions, and events.</li>
        </ul>
      </section>

      <section>
        <h2>4. Sharing Your Information</h2>
        <p>
          We do not sell or rent your personal information to third parties. However, we may share your information in the following circumstances:
        </p>
        <ul>
          <li>With service providers who assist in providing our services.</li>
          <li>To comply with legal obligations or protect our legal rights.</li>
          <li>In connection with a merger, sale, or acquisition of our business.</li>
        </ul>
      </section>

      <section>
        <h2>5. Data Security</h2>
        <p>
          We implement appropriate technical and organisational measures to secure your information against unauthorised access, disclosure, or destruction. However, no data transmission or storage system can be guaranteed to be 100% secure.
        </p>
      </section>

      <section>
        <h2>6. Your Rights</h2>
        <p>Depending on your location, you may have the following rights:</p>
        <ul>
          <li>Access the personal information we hold about you.</li>
          <li>Request corrections to inaccurate or incomplete information.</li>
          <li>Request the deletion of your personal data.</li>
          <li>Opt out of marketing communications.</li>
        </ul>
      </section>

      <section>
        <h2>7. Cookies</h2>
        <p>
          Our platform uses cookies to enhance user experience and analyse website performance. You can adjust your browser settings to refuse cookies or alert you when cookies are being sent.
        </p>
      </section>

      <section>
        <h2>8. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Any changes will be posted on this page with a revised "Last Updated" date.
        </p>
      </section>

      <section>
        <h2>9. Contact Us</h2>
        <p>
          If you have any questions or concerns about this Privacy Policy, please contact us at:
        </p>
        <ul>
          <li>Email: [Your Email Address]</li>
          <li>Phone: [Your Phone Number]</li>
          <li>Address: [Your Company Address]</li>
        </ul>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
