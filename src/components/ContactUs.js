// src/components/ContactUs.js
import React, { useState } from 'react';
import './ContactUs.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic, such as sending data to a backend or email service
    setSubmitted(true);
  };

  return (
    <div className="contact-us-container">
      <h1>Contact Us</h1>
      <p>We'd love to hear from you! Fill out the form below or reach us through the provided contact information.</p>
      
      {submitted ? (
        <p>Thank you for your message! We will get back to you shortly.</p>
      ) : (
        <form onSubmit={handleSubmit} className="contact-form">
          <label>
            Name:
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </label>
          <label>
            Email:
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </label>
          <label>
            Subject:
            <input type="text" name="subject" value={formData.subject} onChange={handleChange} />
          </label>
          <label>
            Message:
            <textarea name="message" value={formData.message} onChange={handleChange} required />
          </label>
          <button type="submit">Send Message</button>
        </form>
      )}

      <div className="contact-info">
        <h2>Contact Information</h2>
        <p><strong>Email:</strong> contact@example.com</p>
        <p><strong>Phone:</strong> (123) 456-7890</p>
        <p><strong>Address:</strong> 123 Main St, City, Country</p>
      </div>
    </div>
  );
};

export default ContactUs;
