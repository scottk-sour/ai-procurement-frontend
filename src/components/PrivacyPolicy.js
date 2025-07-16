// src/components/PrivacyPolicy.js
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "../styles/PrivacyPolicy.css";

const PrivacyPolicy = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Privacy Policy - TENDORAI",
    "description": "TENDORAI's comprehensive privacy policy outlining how we collect, use, and protect your personal information on our AI-powered procurement platform.",
    "url": `${window.location.origin}/privacy-policy`,
    "dateModified": "2025-02-25",
    "publisher": {
      "@type": "Organization",
      "name": "TENDORAI",
      "email": "scottkdavies@me.com"
    }
  };

  return (
    <>
      <Helmet>
        <title>Privacy Policy | TENDORAI - AI-Powered Procurement Platform</title>
        <meta 
          name="description" 
          content="Learn how TENDORAI protects your privacy and handles your data on our AI-powered procurement platform. Last updated February 25, 2025." 
        />
        <meta name="keywords" content="privacy policy, data protection, TENDORAI, AI procurement, GDPR, CCPA" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${window.location.origin}/privacy-policy`} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="privacy-policy-page">
        {/* Mini Hero Section */}
        <header className="privacy-hero">
          <div className="privacy-hero-content">
            <h1 className="privacy-title">Privacy Policy</h1>
            <p className="privacy-subtitle">
              Last Updated: <time dateTime="2025-02-25">February 25, 2025</time>
            </p>
          </div>
        </header>

        {/* Table of Contents */}
        <nav className="privacy-toc" aria-label="Privacy Policy Contents">
          <div className="privacy-toc-content">
            <h2 className="privacy-toc-title">Table of Contents</h2>
            <ol className="privacy-toc-list">
              <li><a href="#introduction" className="privacy-toc-link">Introduction</a></li>
              <li><a href="#information-we-collect" className="privacy-toc-link">Information We Collect</a></li>
              <li><a href="#how-we-use-information" className="privacy-toc-link">How We Use Your Information</a></li>
              <li><a href="#sharing-information" className="privacy-toc-link">Sharing Your Information</a></li>
              <li><a href="#data-security" className="privacy-toc-link">Data Security</a></li>
              <li><a href="#data-retention" className="privacy-toc-link">Data Retention</a></li>
              <li><a href="#your-rights" className="privacy-toc-link">Your Rights</a></li>
              <li><a href="#cookies-tracking" className="privacy-toc-link">Cookies & Tracking</a></li>
              <li><a href="#international-transfers" className="privacy-toc-link">International Data Transfers</a></li>
              <li><a href="#policy-changes" className="privacy-toc-link">Changes to This Policy</a></li>
              <li><a href="#contact-us" className="privacy-toc-link">Contact Us</a></li>
            </ol>
          </div>
        </nav>

        {/* Main Content */}
        <main className="privacy-content">
          <section id="introduction" className="privacy-section">
            <h2>1. Introduction</h2>
            <p>
              Welcome to TENDORAI, an AI-powered procurement platform designed to connect businesses with vendors efficiently. This Privacy Policy outlines how we collect, use, disclose, and protect your information when you use our platform. We are committed to safeguarding your privacy and ensuring transparency in our data practices.
            </p>
            <p>
              <strong>Important:</strong> If you do not agree with this policy, please refrain from using our services. By using TENDORAI, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.
            </p>
          </section>

          <section id="information-we-collect" className="privacy-section">
            <h2>2. Information We Collect</h2>
            
            <div className="subsection">
              <h3>2.1 Personal Information</h3>
              <p>We collect personal information you provide when you register, request quotes, or interact with our platform:</p>
              <ul className="privacy-list" role="list">
                <li>Full name and professional title</li>
                <li>Email address and phone number</li>
                <li>Billing and shipping addresses</li>
                <li>Company details (name, size, industry, tax identification)</li>
                <li>Payment information (processed securely through third-party providers)</li>
                <li>Profile preferences and communication settings</li>
              </ul>
            </div>

            <div className="subsection">
              <h3>2.2 Uploaded Data</h3>
              <p>When requesting quotes, you may upload documents such as:</p>
              <ul className="privacy-list" role="list">
                <li>Invoices and purchase orders</li>
                <li>Technical specifications and requirements</li>
                <li>Contracts and agreements</li>
                <li>Product images and documentation</li>
              </ul>
              <p><strong>Note:</strong> These documents may contain additional personal or business-sensitive data, which we handle with strict confidentiality.</p>
            </div>

            <div className="subsection">
              <h3>2.3 Usage Data</h3>
              <p>We automatically collect non-personal data about your interactions with TENDORAI:</p>
              <ul className="privacy-list" role="list">
                <li>Device type, operating system, and browser information</li>
                <li>IP address and approximate geolocation</li>
                <li>Platform usage patterns (clicks, time spent, pages visited)</li>
                <li>Search queries and quote requests</li>
                <li>Performance metrics and error logs</li>
              </ul>
            </div>
          </section>

          <section id="how-we-use-information" className="privacy-section">
            <h2>3. How We Use Your Information</h2>
            <p>We process your information for the following legitimate purposes:</p>
            <ul className="privacy-list" role="list">
              <li><strong>Service Delivery:</strong> Provide and maintain TENDORAI services, including AI-generated quotes and vendor matching</li>
              <li><strong>Personalization:</strong> Customize your experience and improve quote accuracy</li>
              <li><strong>Transaction Processing:</strong> Handle payments, deliver invoices, and manage orders</li>
              <li><strong>Customer Support:</strong> Respond to inquiries and provide technical assistance</li>
              <li><strong>Communications:</strong> Send updates, promotions, and service-related notifications (with your consent)</li>
              <li><strong>Platform Improvement:</strong> Analyze usage patterns to enhance our AI algorithms and user experience</li>
              <li><strong>Legal Compliance:</strong> Meet regulatory requirements and protect against fraud</li>
            </ul>
            <p>
              <strong>Legal Basis:</strong> Our processing is based on contract fulfillment, legitimate business interests, legal compliance, and your explicit consent where required by law.
            </p>
          </section>

          <section id="sharing-information" className="privacy-section">
            <h2>4. Sharing Your Information</h2>
            <p><strong>We do not sell, rent, or trade your personal information.</strong> We may share it only in these specific cases:</p>
            <ul className="privacy-list" role="list">
              <li><strong>Vetted Vendors:</strong> We share necessary quote request data with pre-approved vendors to generate accurate quotes</li>
              <li><strong>Service Providers:</strong> Trusted third parties (cloud hosting, payment processors, analytics) bound by strict confidentiality agreements</li>
              <li><strong>Legal Requirements:</strong> When required by law, court orders, or to protect our rights and safety</li>
              <li><strong>Business Transfers:</strong> In case of merger, acquisition, or asset sale (with prior notice)</li>
              <li><strong>Your Consent:</strong> Any other sharing requires your explicit permission</li>
            </ul>
          </section>

          <section id="data-security" className="privacy-section">
            <h2>5. Data Security</h2>
            <p>We implement comprehensive security measures to protect your information:</p>
            <ul className="privacy-list" role="list">
              <li><strong>Encryption:</strong> Data encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
              <li><strong>Access Controls:</strong> Multi-factor authentication and role-based access</li>
              <li><strong>Regular Audits:</strong> Security assessments and penetration testing</li>
              <li><strong>Compliance:</strong> SOC 2 Type II and ISO 27001 certified infrastructure</li>
              <li><strong>Incident Response:</strong> 24/7 monitoring and rapid response protocols</li>
            </ul>
            <p>
              <strong>Disclaimer:</strong> While we use industry-standard security measures, no system is 100% secure. We cannot guarantee absolute security but commit to promptly addressing any security incidents.
            </p>
          </section>

          <section id="data-retention" className="privacy-section">
            <h2>6. Data Retention</h2>
            <p>We retain your data only as long as necessary for the purposes outlined in this policy:</p>
            <ul className="privacy-list" role="list">
              <li><strong>Active Accounts:</strong> Data retained while your account remains active</li>
              <li><strong>Inactive Accounts:</strong> Automatically deleted after 24 months of inactivity</li>
              <li><strong>Quote Data:</strong> Retained for 12 months for service quality and legal compliance</li>
              <li><strong>Financial Records:</strong> Kept for 7 years as required by law</li>
              <li><strong>Marketing Data:</strong> Deleted immediately upon unsubscription</li>
            </ul>
            <p>You may request earlier deletion of your data, subject to legal and contractual obligations.</p>
          </section>

          <section id="your-rights" className="privacy-section">
            <h2>7. Your Rights</h2>
            <p>Under GDPR, CCPA, and other applicable privacy laws, you have the following rights:</p>
            <ul className="privacy-list" role="list">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
              <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
              <li><strong>Restriction:</strong> Limit how we process your data</li>
              <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
              <li><strong>Objection:</strong> Opt out of marketing or object to processing based on legitimate interests</li>
              <li><strong>Withdraw Consent:</strong> Revoke consent for processing at any time</li>
            </ul>
            <p>
              To exercise these rights, contact us using the information below. We will respond within 30 days (or as required by applicable law). You also have the right to lodge a complaint with your local data protection authority.
            </p>
          </section>

          <section id="cookies-tracking" className="privacy-section">
            <h2>8. Cookies & Tracking</h2>
            <p>We use cookies and similar technologies to enhance your experience:</p>
            <ul className="privacy-list" role="list">
              <li><strong>Essential Cookies:</strong> Required for basic platform functionality</li>
              <li><strong>Analytics Cookies:</strong> Google Analytics and similar tools for usage insights</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Marketing Cookies:</strong> Personalize content and advertisements (with consent)</li>
            </ul>
            <p>
              You can manage cookie preferences through your browser settings or our cookie consent tool. Note that disabling essential cookies may affect platform functionality.
            </p>
          </section>

          <section id="international-transfers" className="privacy-section">
            <h2>9. International Data Transfers</h2>
            <p>
              Your data may be transferred to and processed in countries outside the UK/EU for cloud hosting and service delivery. We ensure compliance with data protection laws through:
            </p>
            <ul className="privacy-list" role="list">
              <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
              <li>Adequacy decisions for certain countries</li>
              <li>Binding Corporate Rules where applicable</li>
              <li>Your explicit consent for specific transfers</li>
            </ul>
          </section>

          <section id="policy-changes" className="privacy-section">
            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy to reflect changes in our practices or legal requirements. When we make significant changes, we will:
            </p>
            <ul className="privacy-list" role="list">
              <li>Post the updated policy on this page with a new "Last Updated" date</li>
              <li>Send email notifications to registered users</li>
              <li>Display prominent notices on our platform</li>
              <li>Provide a summary of key changes</li>
            </ul>
            <p>Continued use of our services after policy updates constitutes acceptance of the revised terms.</p>
          </section>

          <section id="contact-us" className="privacy-section">
            <h2>11. Contact Us</h2>
            <p>For privacy-related questions, data requests, or concerns, please contact us:</p>
            <div className="contact-info">
              <div className="contact-item">
                <span className="info-icon" aria-hidden="true">✉️</span>
                <div>
                  <strong>Email:</strong> 
                  <a href="mailto:scottkdavies@me.com" className="contact-link">scottkdavies@me.com</a>
                </div>
              </div>
              <div className="contact-item">
                <span className="info-icon" aria-hidden="true">📞</span>
                <div>
                  <strong>Phone:</strong> 
                  <a href="tel:+447854208418" className="contact-link">+44 7854 208418</a>
                </div>
              </div>
              <div className="contact-item">
                <span className="info-icon" aria-hidden="true">📍</span>
                <div>
                  <strong>Address:</strong> 
                  <address className="contact-address">
                    155 Oaksfor, Coed Eva<br />
                    Cwmbran, NP44 6UN<br />
                    United Kingdom
                  </address>
                </div>
              </div>
            </div>
            <p>
              <strong>Response Time:</strong> We aim to respond to all privacy inquiries within 48 hours and data requests within 30 days.
            </p>
          </section>
        </main>

        {/* Footer */}
        <footer className="privacy-footer">
          <div className="privacy-footer-content">
            <p>&copy; 2025 TENDORAI. All rights reserved.</p>
            <p>
              <a href="/terms" className="footer-link">Terms of Service</a> | 
              <a href="/cookies" className="footer-link">Cookie Policy</a> | 
              <a href="/security" className="footer-link">Security</a>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default PrivacyPolicy;
