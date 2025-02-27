// src/components/PrivacyPolicy.js
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../styles/PrivacyPolicy.css";

const PrivacyPolicy = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="privacy-policy-page">
      {/* Mini Hero Section */}
      <header className="privacy-hero">
        <h1 className="privacy-title">Privacy Policy</h1>
        <p className="privacy-subtitle">
          Last Updated: February 25, 2025
        </p>
      </header>

      {/* Main Content */}
      <div className="privacy-content">
        <section className="privacy-section">
          <h2>1. Introduction</h2>
          <p>
            Welcome to TENDORAI, an AI-powered procurement platform designed to connect businesses with vendors efficiently. This Privacy Policy outlines how we collect, use, disclose, and protect your information when you use our platform. We are committed to safeguarding your privacy and ensuring transparency in our data practices. If you do not agree with this policy, please refrain from using our services.
          </p>
        </section>

        <section className="privacy-section">
          <h2>2. Information We Collect</h2>
          <div className="subsection">
            <h3>2.1 Personal Information</h3>
            <p>We collect personal information you provide when you register, request quotes, or interact with our platform:</p>
            <ul className="privacy-list">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Billing and shipping addresses</li>
              <li>Company details (e.g., name, size, industry)</li>
            </ul>
          </div>
          <div className="subsection">
            <h3>2.2 Uploaded Data</h3>
            <p>When requesting quotes, you may upload documents (e.g., invoices, contracts), which may contain additional personal or business data.</p>
          </div>
          <div className="subsection">
            <h3>2.3 Usage Data</h3>
            <p>We collect non-personal data about your interactions with TENDORAI:</p>
            <ul className="privacy-list">
              <li>Device type and browser</li>
              <li>IP address and geolocation</li>
              <li>Platform usage patterns (e.g., clicks, time spent)</li>
            </ul>
          </div>
        </section>

        <section className="privacy-section">
          <h2>3. How We Use Your Information</h2>
          <p>We process your information for the following purposes:</p>
          <ul className="privacy-list">
            <li>Provide and maintain TENDORAI services, including AI-generated quotes.</li>
            <li>Personalize your experience and match you with vendors.</li>
            <li>Process transactions and deliver invoices or receipts.</li>
            <li>Enhance platform functionality and customer support.</li>
            <li>Send updates, promotions, and service-related communications (with your consent where required).</li>
            <li>Analyze usage to improve our AI algorithms and services.</li>
          </ul>
          <p>Our lawful basis for processing includes contract fulfillment, legitimate interests (e.g., service improvement), and consent where applicable.</p>
        </section>

        <section className="privacy-section">
          <h2>4. Sharing Your Information</h2>
          <p>We do not sell or rent your personal information. We may share it in these cases:</p>
          <ul className="privacy-list">
            <li><strong>Vendors:</strong> To generate quotes, we share necessary data (e.g., quote requests, uploaded documents) with vetted vendors.</li>
            <li><strong>Service Providers:</strong> With trusted partners (e.g., cloud hosting, payment processors) who assist in delivering our services, bound by strict confidentiality agreements.</li>
            <li><strong>Legal Compliance:</strong> To comply with laws, regulations, or legal requests (e.g., subpoenas).</li>
            <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets.</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>5. Data Security</h2>
          <p>
            We use industry-standard technical and organizational measures (e.g., encryption, access controls) to protect your data from unauthorized access, loss, or disclosure. However, no system is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section className="privacy-section">
          <h2>6. Data Retention</h2>
          <p>
            We retain personal data only as long as necessary to fulfill the purposes outlined in this policy (e.g., active account usage, legal obligations). Inactive account data is deleted after 2 years, and quote-related data is retained for 1 year unless otherwise requested.
          </p>
        </section>

        <section className="privacy-section">
          <h2>7. Your Rights</h2>
          <p>Under GDPR, CCPA, and other applicable laws, you may have these rights:</p>
          <ul className="privacy-list">
            <li><strong>Access:</strong> Request a copy of your data.</li>
            <li><strong>Rectification:</strong> Correct inaccurate data.</li>
            <li><strong>Erasure:</strong> Request deletion of your data (subject to legal exceptions).</li>
            <li><strong>Restriction:</strong> Limit how we process your data.</li>
            <li><strong>Portability:</strong> Receive your data in a structured format.</li>
            <li><strong>Objection:</strong> Opt out of marketing or object to certain processing.</li>
          </ul>
          <p>To exercise these rights, contact us at the details below.</p>
        </section>

        <section className="privacy-section">
          <h2>8. Cookies & Tracking</h2>
          <p>
            We use cookies and similar technologies (e.g., Google Analytics) to enhance functionality, analyze performance, and personalize content. You can manage cookie preferences via your browser settings or our cookie consent tool (if implemented).
          </p>
        </section>

        <section className="privacy-section">
          <h2>9. International Data Transfers</h2>
          <p>
            Your data may be transferred to and processed in countries outside the UK/EU (e.g., for cloud hosting). We ensure compliance with data protection laws through standard contractual clauses or adequacy decisions.
          </p>
        </section>

        <section className="privacy-section">
          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this policy periodically. Changes will be posted here with an updated “Last Updated” date. Significant updates will be communicated via email or platform notices.
          </p>
        </section>

        <section className="privacy-section">
          <h2>11. Contact Us</h2>
          <p>For questions, concerns, or to exercise your rights, reach us at:</p>
          <ul className="privacy-list contact-list">
            <li><span className="info-icon">✉️</span> <strong>Email:</strong> scottkdavies@me.com</li>
            <li><span className="info-icon">📞</span> <strong>Phone:</strong> 07854 208418</li>
            <li><span className="info-icon">📍</span> <strong>Address:</strong> 155 Oaksfor, Coed Eva, Cwmbran, NP44 6UN</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;