// src/components/ContactUs.js
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import styles from "./ContactUs.module.css"; // Ensure this matches the file name exactly

const ContactUs = () => {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [formStatus, setFormStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // State for animation visibility

  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    // Set visibility after a short delay for animation effect
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [pathname]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formStatus.type) setFormStatus({ type: "", message: "" }); // Clear status on change
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, message } = formData;

    if (!name || !email || !message) {
      setFormStatus({ type: "error", message: "Please fill out all required fields." });
      return;
    }

    if (!validateEmail(email)) {
      setFormStatus({ type: "error", message: "Please enter a valid email address." });
      return;
    }

    setIsSubmitting(true);
    // Simulate form submission (replace with actual backend call)
    setTimeout(() => {
      setFormStatus({ type: "success", message: "Thank you! We’ll get back to you soon." });
      setFormData({ name: "", email: "", subject: "", message: "" });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className={styles.contactUsPage} data-animation="fadeInUp" data-visible={isVisible}>
      {/* Mini Hero Section */}
      <header className={styles.contactHero} data-animation="fadeIn" data-delay="200" data-visible={isVisible}>
        <h1 className={styles.contactTitle}>Get in Touch</h1>
        <p className={styles.contactSubtitle}>
          We’re here to assist you—reach out with any questions or feedback!
        </p>
      </header>

      {/* Main Content */}
      <div className={styles.contactContent}>
        <section className={styles.contactFormSection} data-animation="fadeInUp" data-delay="400" data-visible={isVisible}>
          {formStatus.type && (
            <div className={`${styles.formStatus} ${styles[formStatus.type]}`}>
              {formStatus.message}
            </div>
          )}
          <form onSubmit={handleSubmit} className={styles.contactForm}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Name <span className={styles.required}>*</span></label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Your Name"
                className={styles.inputField}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email <span className={styles.required}>*</span></label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Your Email"
                className={styles.inputField}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Subject (Optional)"
                className={styles.inputField}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="message">Message <span className={styles.required}>*</span></label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="How can we help you?"
                className={styles.textareaField}
              />
            </div>
            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </section>

        <section className={styles.contactInfoSection} data-animation="fadeInUp" data-delay="600" data-visible={isVisible}>
          <div className={styles.contactInfoCard}>
            <h2 className={styles.contactInfoTitle}>Contact Details</h2>
            <ul className={styles.contactInfoList}>
              <li>
                <span className={styles.infoIcon}>✉️</span>
                <strong>Email:</strong> scottk.davies@tendorai.com
              </li>
              <li>
                <span className={styles.infoIcon}>📞</span>
                <strong>Phone:</strong> 07854 208418
              </li>
              <li>
                <span className={styles.infoIcon}>📍</span>
                <strong>Address:</strong> 155 Oaksfor, Coed Eva, Cwmbran, NP44 6UN
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ContactUs;