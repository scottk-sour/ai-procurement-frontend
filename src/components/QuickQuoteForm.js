// src/components/QuickQuoteForm.js
// Quick quote request form modal

import React, { useState } from 'react';
import { FaTimes, FaSpinner, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import '../styles/QuickQuoteForm.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://ai-procurement-backend-q35u.onrender.com';

const SERVICE_OPTIONS = [
  'Photocopiers & Printers',
  'Telecoms & Phone Systems',
  'CCTV & Security',
  'IT Services',
  'Office Equipment',
  'Other'
];

const QuickQuoteForm = ({ vendor, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    service: vendor?.services?.[0] || '',
    message: '',
    postcode: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.companyName.trim()) return 'Company name is required';
    if (!formData.contactName.trim()) return 'Contact name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Please enter a valid email';
    if (!formData.phone.trim()) return 'Phone number is required';
    if (!formData.service) return 'Please select a service';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Track quote request
      if (vendor?.id) {
        try {
          await fetch(`${API_BASE_URL}/api/analytics/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              vendorId: vendor.id,
              eventType: 'quote_request',
              source: { page: window.location.pathname }
            })
          });
        } catch (e) {
          // Silent fail for analytics
        }
      }

      // Submit quote request
      const response = await fetch(`${API_BASE_URL}/api/submit-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          vendorId: vendor?.id,
          vendorName: vendor?.company,
          source: 'vendor_profile'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit request');
      }

      setSuccess(true);

      if (onSuccess) {
        setTimeout(() => {
          onSuccess(data);
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (success) {
    return (
      <div className="quote-modal" onClick={onClose}>
        <div className="quote-modal__content quote-modal__content--success" onClick={e => e.stopPropagation()}>
          <FaCheckCircle className="quote-modal__success-icon" />
          <h2>Quote Request Submitted!</h2>
          <p>
            Thank you for your interest in {vendor?.company || 'this supplier'}.
            We've received your request and will be in touch shortly.
          </p>
          <button onClick={onClose} className="quote-modal__close-btn">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quote-modal" onClick={onClose}>
      <div className="quote-modal__content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="quote-modal__header">
          <div>
            <h2>Request a Quote</h2>
            {vendor && <p>From {vendor.company}</p>}
          </div>
          <button className="quote-modal__close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="quote-modal__form">
          {error && (
            <div className="quote-modal__error">
              <FaExclamationCircle /> {error}
            </div>
          )}

          <div className="quote-modal__row">
            <div className="quote-modal__field">
              <label htmlFor="companyName">Company Name *</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Your company name"
                required
              />
            </div>

            <div className="quote-modal__field">
              <label htmlFor="contactName">Contact Name *</label>
              <input
                type="text"
                id="contactName"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                placeholder="Your name"
                required
              />
            </div>
          </div>

          <div className="quote-modal__row">
            <div className="quote-modal__field">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@company.com"
                required
              />
            </div>

            <div className="quote-modal__field">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="07123 456789"
                required
              />
            </div>
          </div>

          <div className="quote-modal__row">
            <div className="quote-modal__field">
              <label htmlFor="service">Service Required *</label>
              <select
                id="service"
                name="service"
                value={formData.service}
                onChange={handleChange}
                required
              >
                <option value="">Select a service</option>
                {SERVICE_OPTIONS.map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </div>

            <div className="quote-modal__field">
              <label htmlFor="postcode">Postcode</label>
              <input
                type="text"
                id="postcode"
                name="postcode"
                value={formData.postcode}
                onChange={handleChange}
                placeholder="e.g., SW1A 1AA"
                maxLength={10}
              />
            </div>
          </div>

          <div className="quote-modal__field quote-modal__field--full">
            <label htmlFor="message">Additional Details</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us about your requirements..."
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="quote-modal__actions">
            <button
              type="button"
              onClick={onClose}
              className="quote-modal__btn quote-modal__btn--secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="quote-modal__btn quote-modal__btn--primary"
            >
              {loading ? (
                <>
                  <FaSpinner className="quote-modal__spinner" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </button>
          </div>

          <p className="quote-modal__disclaimer">
            By submitting this form, you agree to our privacy policy.
            Your information will only be shared with the selected supplier.
          </p>
        </form>
      </div>
    </div>
  );
};

export default QuickQuoteForm;
