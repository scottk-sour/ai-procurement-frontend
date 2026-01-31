// src/components/VendorQuoteRequest.js
// Multi-step quote request form for vendor-specific quotes (public - no auth required)

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FaArrowLeft, FaArrowRight, FaCheck, FaSpinner, FaBuilding,
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaPoundSign,
  FaFileAlt, FaCog, FaUser, FaCheckCircle, FaExclamationCircle
} from 'react-icons/fa';
import '../styles/VendorQuoteRequest.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://ai-procurement-backend-q35u.onrender.com';

const STEPS = [
  { id: 1, title: 'Requirements', icon: FaCog, description: 'What do you need?' },
  { id: 2, title: 'Volume & Setup', icon: FaFileAlt, description: 'Current situation' },
  { id: 3, title: 'Timeline', icon: FaClock, description: 'When & budget' },
  { id: 4, title: 'Contact', icon: FaUser, description: 'Your details' }
];

const SERVICE_OPTIONS = [
  { value: 'Photocopiers', label: 'Photocopiers & Printers', description: 'Office printing solutions' },
  { value: 'Telecoms', label: 'Telecoms & Phone Systems', description: 'Business phone systems' },
  { value: 'CCTV', label: 'CCTV & Security', description: 'Security camera systems' },
  { value: 'IT', label: 'IT Services & Support', description: 'IT infrastructure' },
  { value: 'Security', label: 'Security Systems', description: 'Access control & alarms' },
  { value: 'Software', label: 'Software Solutions', description: 'Business software' },
  { value: 'Other', label: 'Other Services', description: 'Other requirements' }
];

const EQUIPMENT_OPTIONS = {
  Photocopiers: [
    { value: 'mono-desktop', label: 'Desktop B&W Printer' },
    { value: 'color-desktop', label: 'Desktop Colour Printer' },
    { value: 'mono-mfp', label: 'B&W Multifunction' },
    { value: 'color-mfp', label: 'Colour Multifunction' },
    { value: 'production', label: 'Production Printer' },
    { value: 'wide-format', label: 'Wide Format' }
  ],
  Telecoms: [
    { value: 'pbx', label: 'PBX Phone System' },
    { value: 'voip', label: 'VoIP System' },
    { value: 'cloud-phone', label: 'Cloud Phone System' },
    { value: 'handsets', label: 'Handsets Only' },
    { value: 'conference', label: 'Conference System' }
  ],
  CCTV: [
    { value: 'ip-camera', label: 'IP Cameras' },
    { value: 'analog-camera', label: 'Analog Cameras' },
    { value: 'nvr', label: 'NVR System' },
    { value: 'complete-system', label: 'Complete System' }
  ],
  IT: [
    { value: 'servers', label: 'Servers' },
    { value: 'networking', label: 'Networking' },
    { value: 'cloud', label: 'Cloud Services' },
    { value: 'support', label: 'IT Support' },
    { value: 'cybersecurity', label: 'Cybersecurity' }
  ],
  Security: [
    { value: 'access-control', label: 'Access Control' },
    { value: 'intruder-alarm', label: 'Intruder Alarms' },
    { value: 'fire-alarm', label: 'Fire Alarms' },
    { value: 'intercom', label: 'Intercom Systems' }
  ],
  Software: [
    { value: 'erp', label: 'ERP Software' },
    { value: 'crm', label: 'CRM Software' },
    { value: 'accounting', label: 'Accounting Software' },
    { value: 'document-management', label: 'Document Management' }
  ],
  Other: [
    { value: 'other', label: 'Other - please specify' }
  ]
};

const VOLUME_OPTIONS = [
  { value: 'low', label: 'Low (< 5,000/month)', description: 'Small office' },
  { value: 'medium', label: 'Medium (5,000 - 20,000/month)', description: 'Growing business' },
  { value: 'high', label: 'High (20,000 - 50,000/month)', description: 'Large office' },
  { value: 'enterprise', label: 'Enterprise (50,000+/month)', description: 'Multi-site' }
];

const SETUP_OPTIONS = [
  { value: 'none', label: 'No current equipment' },
  { value: 'outdated', label: 'Outdated equipment (5+ years)' },
  { value: 'leased', label: 'Currently leased - ending soon' },
  { value: 'owned', label: 'Own equipment - looking to upgrade' },
  { value: 'multiple', label: 'Multiple devices to consolidate' }
];

const FEATURE_OPTIONS = [
  { value: 'scanning', label: 'Document Scanning' },
  { value: 'cloud', label: 'Cloud Integration' },
  { value: 'mobile', label: 'Mobile Printing' },
  { value: 'security', label: 'Secure Print' },
  { value: 'finishing', label: 'Stapling/Binding' },
  { value: 'fax', label: 'Fax Capability' }
];

const TIMELINE_OPTIONS = [
  { value: 'urgent', label: 'Urgent (within 2 weeks)', icon: '🚀' },
  { value: 'soon', label: 'Soon (1-3 months)', icon: '📅' },
  { value: 'planning', label: 'Planning (3-6 months)', icon: '📋' },
  { value: 'future', label: 'Future (6+ months)', icon: '🔮' }
];

const CONTRACT_OPTIONS = [
  { value: 'lease', label: 'Lease/Rental', description: 'Monthly payments, maintenance included' },
  { value: 'purchase', label: 'Outright Purchase', description: 'One-time payment' },
  { value: 'managed', label: 'Managed Service', description: 'All-inclusive per-page' },
  { value: 'flexible', label: 'Open to Options', description: 'Show me what\'s available' }
];

const BUDGET_OPTIONS = [
  { value: 'under-100', label: 'Under £100/month' },
  { value: '100-250', label: '£100 - £250/month' },
  { value: '250-500', label: '£250 - £500/month' },
  { value: '500-1000', label: '£500 - £1,000/month' },
  { value: 'over-1000', label: 'Over £1,000/month' },
  { value: 'discuss', label: 'Prefer to discuss' }
];

const VendorQuoteRequest = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Requirements
    service: '',
    equipmentType: '',

    // Step 2: Volume & Setup
    monthlyVolume: '',
    currentSetup: '',
    features: [],

    // Step 3: Timeline & Budget
    timeline: '',
    contractPreference: '',
    budgetRange: '',

    // Step 4: Contact Details
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    postcode: '',
    message: ''
  });

  const [errors, setErrors] = useState({});

  // Fetch vendor details
  useEffect(() => {
    const fetchVendor = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/public/vendors/${vendorId}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Vendor not found');
        }

        if (data.data.canReceiveQuotes === false) {
          throw new Error('This supplier is not currently accepting quote requests');
        }

        setVendor(data.data);

        // Pre-select service if vendor has one primary service
        if (data.data.services?.length === 1) {
          const service = data.data.services[0];
          const matchedService = SERVICE_OPTIONS.find(s =>
            service.toLowerCase().includes(s.value.toLowerCase())
          );
          if (matchedService) {
            setFormData(prev => ({ ...prev, service: matchedService.value }));
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, [vendorId]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleFeatureToggle = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.service) newErrors.service = 'Please select a service';
        break;
      case 2:
        if (!formData.monthlyVolume) newErrors.monthlyVolume = 'Please select volume';
        break;
      case 3:
        if (!formData.timeline) newErrors.timeline = 'Please select a timeline';
        break;
      case 4:
        if (!formData.companyName?.trim()) newErrors.companyName = 'Company name is required';
        if (!formData.contactName?.trim()) newErrors.contactName = 'Contact name is required';
        if (!formData.email?.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email';
        }
        if (!formData.phone?.trim()) {
          newErrors.phone = 'Phone number is required';
        }
        if (!formData.postcode?.trim()) {
          newErrors.postcode = 'Postcode is required';
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setSubmitting(true);
    setError(null);

    try {
      const requestBody = {
        vendorId,
        ...formData,
        source: {
          page: window.location.pathname,
          referrer: document.referrer
        }
      };

      // Debug: Log request body before sending
      console.log('[VendorQuoteRequest] Submitting:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${API_BASE_URL}/api/vendor-leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit quote request');
      }

      setSubmitted(true);

      // Track conversion
      try {
        await fetch(`${API_BASE_URL}/api/analytics/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vendorId,
            eventType: 'quote_request',
            source: { page: window.location.pathname }
          })
        });
      } catch (e) {
        // Silent fail for analytics
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="quote-request quote-request--loading">
        <FaSpinner className="quote-request__spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  // Error state
  if (error && !vendor) {
    return (
      <div className="quote-request quote-request--error">
        <FaExclamationCircle className="quote-request__error-icon" />
        <h2>Unable to Request Quote</h2>
        <p>{error}</p>
        <Link to="/suppliers" className="quote-request__back-btn">
          <FaArrowLeft /> Browse Suppliers
        </Link>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div className="quote-request quote-request--success">
        <div className="quote-request__success-content">
          <FaCheckCircle className="quote-request__success-icon" />
          <h2>Quote Request Submitted!</h2>
          <p>Thank you for your enquiry. <strong>{vendor?.company}</strong> will be in touch shortly.</p>

          <div className="quote-request__success-summary">
            <h3>What happens next?</h3>
            <ul>
              <li><FaCheck /> Your request has been sent to {vendor?.company}</li>
              <li><FaCheck /> They will review your requirements</li>
              <li><FaCheck /> Expect a response within 24-48 hours</li>
            </ul>
          </div>

          <div className="quote-request__success-actions">
            <Link to="/suppliers" className="quote-request__btn quote-request__btn--secondary">
              Browse More Suppliers
            </Link>
            <Link to={`/suppliers/profile/${vendorId}`} className="quote-request__btn quote-request__btn--primary">
              Back to {vendor?.company}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quote-request">
      <Helmet>
        <title>Request Quote from {vendor?.company} | TendorAI</title>
        <meta name="description" content={`Request a free quote from ${vendor?.company} for ${vendor?.services?.join(', ')}`} />
      </Helmet>

      {/* Header */}
      <div className="quote-request__header">
        <div className="quote-request__container">
          <Link to={`/suppliers/profile/${vendorId}`} className="quote-request__back">
            <FaArrowLeft /> Back to {vendor?.company}
          </Link>

          <div className="quote-request__vendor-info">
            {vendor?.logoUrl ? (
              <img src={vendor.logoUrl} alt={vendor.company} className="quote-request__vendor-logo" />
            ) : (
              <div className="quote-request__vendor-logo quote-request__vendor-logo--placeholder">
                {vendor?.company?.charAt(0)}
              </div>
            )}
            <div>
              <h1>Request a Quote</h1>
              <p>from <strong>{vendor?.company}</strong></p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="quote-request__progress">
        <div className="quote-request__container">
          <div className="quote-request__steps">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <div
                  key={step.id}
                  className={`quote-request__step ${isCompleted ? 'quote-request__step--completed' : ''} ${isCurrent ? 'quote-request__step--current' : ''}`}
                >
                  <div className="quote-request__step-indicator">
                    {isCompleted ? <FaCheck /> : <StepIcon />}
                  </div>
                  <div className="quote-request__step-info">
                    <span className="quote-request__step-title">{step.title}</span>
                    <span className="quote-request__step-desc">{step.description}</span>
                  </div>
                  {index < STEPS.length - 1 && <div className="quote-request__step-connector" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="quote-request__content">
        <div className="quote-request__container">
          {error && (
            <div className="quote-request__error-message">
              <FaExclamationCircle /> {error}
            </div>
          )}

          {/* Step 1: Requirements */}
          {currentStep === 1 && (
            <div className="quote-request__form-step">
              <h2>What do you need?</h2>
              <p>Select the type of service you're looking for</p>

              <div className="quote-request__field">
                <label>Service Type *</label>
                <div className="quote-request__options quote-request__options--grid">
                  {SERVICE_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      className={`quote-request__option ${formData.service === option.value ? 'quote-request__option--selected' : ''}`}
                      onClick={() => handleInputChange('service', option.value)}
                    >
                      <span className="quote-request__option-label">{option.label}</span>
                      <span className="quote-request__option-desc">{option.description}</span>
                    </button>
                  ))}
                </div>
                {errors.service && <span className="quote-request__error">{errors.service}</span>}
              </div>

              {formData.service && EQUIPMENT_OPTIONS[formData.service] && (
                <div className="quote-request__field">
                  <label>Equipment Type (Optional)</label>
                  <div className="quote-request__options quote-request__options--list">
                    {EQUIPMENT_OPTIONS[formData.service].map(option => (
                      <button
                        key={option.value}
                        type="button"
                        className={`quote-request__option quote-request__option--small ${formData.equipmentType === option.value ? 'quote-request__option--selected' : ''}`}
                        onClick={() => handleInputChange('equipmentType', option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Volume & Setup */}
          {currentStep === 2 && (
            <div className="quote-request__form-step">
              <h2>Tell us about your usage</h2>
              <p>This helps us understand your requirements</p>

              <div className="quote-request__field">
                <label>Monthly Volume *</label>
                <div className="quote-request__options quote-request__options--list">
                  {VOLUME_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      className={`quote-request__option ${formData.monthlyVolume === option.value ? 'quote-request__option--selected' : ''}`}
                      onClick={() => handleInputChange('monthlyVolume', option.value)}
                    >
                      <span className="quote-request__option-label">{option.label}</span>
                      <span className="quote-request__option-desc">{option.description}</span>
                    </button>
                  ))}
                </div>
                {errors.monthlyVolume && <span className="quote-request__error">{errors.monthlyVolume}</span>}
              </div>

              <div className="quote-request__field">
                <label>Current Setup</label>
                <div className="quote-request__options quote-request__options--list">
                  {SETUP_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      className={`quote-request__option quote-request__option--small ${formData.currentSetup === option.value ? 'quote-request__option--selected' : ''}`}
                      onClick={() => handleInputChange('currentSetup', option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="quote-request__field">
                <label>Required Features</label>
                <div className="quote-request__checkboxes">
                  {FEATURE_OPTIONS.map(option => (
                    <label key={option.value} className="quote-request__checkbox">
                      <input
                        type="checkbox"
                        checked={formData.features.includes(option.value)}
                        onChange={() => handleFeatureToggle(option.value)}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Timeline & Budget */}
          {currentStep === 3 && (
            <div className="quote-request__form-step">
              <h2>When do you need this?</h2>
              <p>Let us know your timeline and budget preferences</p>

              <div className="quote-request__field">
                <label>Timeline *</label>
                <div className="quote-request__options quote-request__options--grid-2">
                  {TIMELINE_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      className={`quote-request__option ${formData.timeline === option.value ? 'quote-request__option--selected' : ''}`}
                      onClick={() => handleInputChange('timeline', option.value)}
                    >
                      <span className="quote-request__option-icon">{option.icon}</span>
                      <span className="quote-request__option-label">{option.label}</span>
                    </button>
                  ))}
                </div>
                {errors.timeline && <span className="quote-request__error">{errors.timeline}</span>}
              </div>

              <div className="quote-request__field">
                <label>Contract Preference</label>
                <div className="quote-request__options quote-request__options--list">
                  {CONTRACT_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      className={`quote-request__option ${formData.contractPreference === option.value ? 'quote-request__option--selected' : ''}`}
                      onClick={() => handleInputChange('contractPreference', option.value)}
                    >
                      <span className="quote-request__option-label">{option.label}</span>
                      <span className="quote-request__option-desc">{option.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="quote-request__field">
                <label>Budget Range</label>
                <div className="quote-request__options quote-request__options--grid-3">
                  {BUDGET_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      className={`quote-request__option quote-request__option--small ${formData.budgetRange === option.value ? 'quote-request__option--selected' : ''}`}
                      onClick={() => handleInputChange('budgetRange', option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Contact Details */}
          {currentStep === 4 && (
            <div className="quote-request__form-step">
              <h2>Your Contact Details</h2>
              <p>So {vendor?.company} can reach you</p>

              <div className="quote-request__form-grid">
                <div className="quote-request__field">
                  <label htmlFor="companyName">
                    <FaBuilding /> Company Name *
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="Your company name"
                    className={errors.companyName ? 'quote-request__input--error' : ''}
                  />
                  {errors.companyName && <span className="quote-request__error">{errors.companyName}</span>}
                </div>

                <div className="quote-request__field">
                  <label htmlFor="contactName">
                    <FaUser /> Contact Name *
                  </label>
                  <input
                    type="text"
                    id="contactName"
                    value={formData.contactName}
                    onChange={(e) => handleInputChange('contactName', e.target.value)}
                    placeholder="Your full name"
                    className={errors.contactName ? 'quote-request__input--error' : ''}
                  />
                  {errors.contactName && <span className="quote-request__error">{errors.contactName}</span>}
                </div>

                <div className="quote-request__field">
                  <label htmlFor="email">
                    <FaEnvelope /> Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                    className={errors.email ? 'quote-request__input--error' : ''}
                  />
                  {errors.email && <span className="quote-request__error">{errors.email}</span>}
                </div>

                <div className="quote-request__field">
                  <label htmlFor="phone">
                    <FaPhone /> Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="01onal 123456"
                    className={errors.phone ? 'quote-request__input--error' : ''}
                  />
                  {errors.phone && <span className="quote-request__error">{errors.phone}</span>}
                </div>

                <div className="quote-request__field">
                  <label htmlFor="postcode">
                    <FaMapMarkerAlt /> Postcode *
                  </label>
                  <input
                    type="text"
                    id="postcode"
                    value={formData.postcode}
                    onChange={(e) => handleInputChange('postcode', e.target.value.toUpperCase())}
                    placeholder="SW1A 1AA"
                    className={errors.postcode ? 'quote-request__input--error' : ''}
                  />
                  {errors.postcode && <span className="quote-request__error">{errors.postcode}</span>}
                </div>
              </div>

              <div className="quote-request__field quote-request__field--full">
                <label htmlFor="message">
                  <FaFileAlt /> Additional Message (Optional)
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Any specific requirements or questions..."
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="quote-request__nav">
            {currentStep > 1 && (
              <button
                type="button"
                className="quote-request__btn quote-request__btn--secondary"
                onClick={handleBack}
              >
                <FaArrowLeft /> Back
              </button>
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                className="quote-request__btn quote-request__btn--primary"
                onClick={handleNext}
              >
                Continue <FaArrowRight />
              </button>
            ) : (
              <button
                type="button"
                className="quote-request__btn quote-request__btn--submit"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <FaSpinner className="quote-request__btn-spinner" /> Submitting...
                  </>
                ) : (
                  <>
                    Submit Request <FaCheck />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorQuoteRequest;
