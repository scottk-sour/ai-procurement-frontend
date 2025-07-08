// src/components/Footer.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  FaFacebook, 
  FaTwitter, 
  FaYoutube, 
  FaLinkedin, 
  FaInstagram, 
  FaTiktok,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaArrowRight,
  FaCheckCircle
} from "react-icons/fa";
import "../styles/Footer.css";

const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus("loading");
    
    try {
      // Replace with your actual newsletter endpoint
      const response = await fetch("https://formspree.io/f/xblgkvnk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email,
          source: "footer_newsletter",
          timestamp: new Date().toISOString()
        }),
      });
      
      if (response.ok) {
        setStatus("success");
        setEmail("");
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch (error) {
      console.error("Newsletter signup error:", error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <div className="newsletter-signup">
      <h4 className="newsletter-title">Stay Updated</h4>
      <p className="newsletter-description">
        Get the latest updates on new features and procurement insights.
      </p>
      
      {status === "success" ? (
        <div className="newsletter-success">
          <FaCheckCircle className="success-icon" />
          <span>Thank you for subscribing!</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="newsletter-form">
          <div className="input-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="newsletter-input"
              required
              disabled={status === "loading"}
            />
            <button 
              type="submit" 
              className="newsletter-btn"
              disabled={status === "loading" || !email}
            >
              {status === "loading" ? "..." : <FaArrowRight />}
            </button>
          </div>
          {status === "error" && (
            <p className="error-message">Failed to subscribe. Please try again.</p>
          )}
        </form>
      )}
    </div>
  );
};

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = {
    company: [
      { label: "About Us", to: "/about-us" },
      { label: "How It Works", to: "/how-it-works" },
      { label: "Careers", to: "/careers" },
      { label: "Press & Media", to: "/press" },
      { label: "Partner Programme", to: "/partners" }
    ],
    services: [
      { label: "Photocopiers", to: "/services/photocopiers" },
      { label: "Telecoms", to: "/services/telecoms" },
      { label: "CCTV & Security", to: "/services/cctv" },
      { label: "IT Solutions", to: "/services/it" },
      { label: "Custom Procurement", to: "/services/custom" }
    ],
    resources: [
      { label: "Help Centre", to: "/help" },
      { label: "FAQ", to: "/faq" },
      { label: "API Documentation", to: "/api-docs" },
      { label: "Procurement Guide", to: "/guide" },
      { label: "Vendor Resources", to: "/vendor-resources" }
    ],
    legal: [
      { label: "Privacy Policy", to: "/privacy-policy" },
      { label: "Terms of Service", to: "/terms" },
      { label: "Cookie Policy", to: "/cookies" },
      { label: "Data Protection", to: "/data-protection" },
      { label: "Accessibility", to: "/accessibility" }
    ]
  };

  const socialLinks = [
    { icon: FaLinkedin, href: "https://linkedin.com/company/tendorai", label: "LinkedIn" },
    { icon: FaTwitter, href: "https://twitter.com/tendorai", label: "Twitter" },
    { icon: FaFacebook, href: "https://facebook.com/tendorai", label: "Facebook" },
    { icon: FaInstagram, href: "https://instagram.com/tendorai", label: "Instagram" },
    { icon: FaYoutube, href: "https://youtube.com/tendorai", label: "YouTube" },
    { icon: FaTiktok, href: "https://tiktok.com/@tendorai", label: "TikTok" }
  ];

  const contactInfo = [
    {
      icon: FaMapMarkerAlt,
      text: "London, United Kingdom",
      link: null
    },
    {
      icon: FaEnvelope,
      text: "hello@tendorai.com",
      link: "mailto:hello@tendorai.com"
    },
    {
      icon: FaPhone,
      text: "+44 20 7946 0958",
      link: "tel:+442079460958"
    }
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-main">
          {/* Brand Section */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span className="logo-text">TENDORAI</span>
            </Link>
            <p className="footer-tagline">
              Revolutionising procurement with AI-powered vendor matching and intelligent quote comparisons.
            </p>
            
            {/* Contact Info */}
            <div className="contact-info">
              {contactInfo.map((item, index) => (
                <div key={index} className="contact-item">
                  <item.icon className="contact-icon" />
                  {item.link ? (
                    <a href={item.link} className="contact-link">
                      {item.text}
                    </a>
                  ) : (
                    <span className="contact-text">{item.text}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="social-links">
              <h4 className="social-title">Follow Us</h4>
              <div className="social-icons">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                    aria-label={`Follow us on ${social.label}`}
                  >
                    <social.icon />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Links Sections */}
          <div className="footer-links">
            <div className="footer-section">
              <h4 className="footer-heading">Company</h4>
              <ul className="footer-nav">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <Link to={link.to} className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-heading">Services</h4>
              <ul className="footer-nav">
                {footerLinks.services.map((link, index) => (
                  <li key={index}>
                    <Link to={link.to} className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-heading">Resources</h4>
              <ul className="footer-nav">
                {footerLinks.resources.map((link, index) => (
                  <li key={index}>
                    <Link to={link.to} className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-heading">Legal</h4>
              <ul className="footer-nav">
                {footerLinks.legal.map((link, index) => (
                  <li key={index}>
                    <Link to={link.to} className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="footer-newsletter">
            <NewsletterSignup />
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="footer-copyright">
              <p>&copy; {currentYear} TendorAI Limited. All rights reserved.</p>
              <p className="company-info">
                Registered in England and Wales. Company No. 12345678
              </p>
            </div>
            
            <div className="footer-certifications">
              <div className="certification-item">
                <span className="cert-badge">🔒</span>
                <span className="cert-text">ISO 27001 Certified</span>
              </div>
              <div className="certification-item">
                <span className="cert-badge">✓</span>
                <span className="cert-text">GDPR Compliant</span>
              </div>
              <div className="certification-item">
                <span className="cert-badge">🛡️</span>
                <span className="cert-text">Cyber Essentials</span>
              </div>
            </div>

            <div className="footer-lang">
              <select className="language-selector" defaultValue="en-GB">
                <option value="en-GB">🇬🇧 English (UK)</option>
                <option value="en-US">🇺🇸 English (US)</option>
                <option value="fr-FR">🇫🇷 Français</option>
                <option value="de-DE">🇩🇪 Deutsch</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;