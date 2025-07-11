// src/components/ContactUs.js
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import styles from "./ContactUs.module.css";

// Constants
const ANIMATION_DELAY = 100;
const FORM_SUBMISSION_TIMEOUT = 2000;
const DEBOUNCE_DELAY = 300;

// Form validation rules
const VALIDATION_RULES = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s'-]+$/,
    errorMessage: "Name must contain only letters, spaces, hyphens, and apostrophes"
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 254,
    errorMessage: "Please enter a valid email address"
  },
  subject: {
    required: false,
    maxLength: 200,
    errorMessage: "Subject must be less than 200 characters"
  },
  message: {
    required: true,
    minLength: 10,
    maxLength: 2000,
    errorMessage: "Message must be between 10 and 2000 characters"
  }
};

// Contact information data
const CONTACT_INFO = [
  {
    id: 1,
    icon: "✉️",
    label: "Email",
    value: "scottk.davies@tendorai.com",
    href: "mailto:scottk.davies@tendorai.com",
    ariaLabel: "Send email to Scott Davies"
  },
  {
    id: 2,
    icon: "📞",
    label: "Phone",
    value: "07854 208418",
    href: "tel:+447854208418",
    ariaLabel: "Call Scott Davies"
  },
  {
    id: 3,
    icon: "📍",
    label: "Address",
    value: "155 Oaksfor, Coed Eva, Cwmbran, NP44 6UN",
    href: "https://maps.google.com/?q=155+Oaksfor,+Coed+Eva,+Cwmbran,+NP44+6UN",
    ariaLabel: "View address on Google Maps"
  }
];

// Custom hooks
const useIntersectionObserver = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [elementRef, setElementRef] = useState(null);

  useEffect(() => {
    if (!elementRef || !window.IntersectionObserver) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(elementRef);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
        ...options
      }
    );

    observer.observe(elementRef);

    return () => {
      if (elementRef) observer.unobserve(elementRef);
    };
  }, [elementRef, options]);

  return [setElementRef, isVisible];
};

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Utility functions
const sanitizeInput = (input) => {
  return input.trim().replace(/[<>]/g, '');
};

const validateField = (name, value) => {
  const rule = VALIDATION_RULES[name];
  if (!rule) return { isValid: true, error: "" };

  const sanitizedValue = sanitizeInput(value);

  // Required validation
  if (rule.required && !sanitizedValue) {
    return { isValid: false, error: `${name.charAt(0).toUpperCase() + name.slice(1)} is required` };
  }

  // Skip other validations if field is empty and not required
  if (!sanitizedValue && !rule.required) {
    return { isValid: true, error: "" };
  }

  // Length validation
  if (rule.minLength && sanitizedValue.length < rule.minLength) {
    return { isValid: false, error: `${name.charAt(0).toUpperCase() + name.slice(1)} must be at least ${rule.minLength} characters` };
  }

  if (rule.maxLength && sanitizedValue.length > rule.maxLength) {
    return { isValid: false, error: `${name.charAt(0).toUpperCase() + name.slice(1)} must be less than ${rule.maxLength} characters` };
  }

  // Pattern validation
  if (rule.pattern && !rule.pattern.test(sanitizedValue)) {
    return { isValid: false, error: rule.errorMessage };
  }

  return { isValid: true, error: "" };
};

// Components
const FormField = ({ 
  type = "text", 
  name, 
  label, 
  value, 
  onChange, 
  error, 
  required = false, 
  placeholder,
  as: Component = "input",
  ...props 
}) => {
  const fieldId = `field-${name}`;
  const errorId = `error-${name}`;

  return (
    <div className={styles.formGroup}>
      <label htmlFor={fieldId} className={styles.fieldLabel}>
        {label}
        {required && <span className={styles.required} aria-label="required">*</span>}
      </label>
      <Component
        type={type}
        id={fieldId}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={`${styles.inputField} ${error ? styles.inputError : ''}`}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      />
      {error && (
        <span id={errorId} className={styles.fieldError} role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

FormField.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  required: PropTypes.bool,
  placeholder: PropTypes.string,
  as: PropTypes.elementType
};

const ContactInfoItem = ({ item }) => {
  const isLink = item.href && (item.href.startsWith('mailto:') || item.href.startsWith('tel:') || item.href.startsWith('http'));

  const content = (
    <>
      <span className={styles.infoIcon} aria-hidden="true">{item.icon}</span>
      <strong>{item.label}:</strong>
      <span>{item.value}</span>
    </>
  );

  if (isLink) {
    return (
      <li className={styles.contactInfoItem}>
        <a 
          href={item.href}
          className={styles.contactLink}
          aria-label={item.ariaLabel}
          target={item.href.startsWith('http') ? '_blank' : undefined}
          rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
        >
          {content}
        </a>
      </li>
    );
  }

  return (
    <li className={styles.contactInfoItem}>
      {content}
    </li>
  );
};

ContactInfoItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    icon: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    href: PropTypes.string,
    ariaLabel: PropTypes.string
  }).isRequired
};

const HeroSection = () => {
  const [ref, isVisible] = useIntersectionObserver();

  return (
    <header 
      ref={ref}
      className={`${styles.contactHero} ${isVisible ? styles.visible : ''}`}
      role="banner"
    >
      <h1 className={styles.contactTitle}>Get in Touch</h1>
      <p className={styles.contactSubtitle}>
        We're here to assist you—reach out with any questions or feedback!
      </p>
    </header>
  );
};

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  
  const [errors, setErrors] = useState({});
  const [formStatus, setFormStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ref, isVisible] = useIntersectionObserver();
  const formRef = useRef(null);
  
  // Debounce form data for validation
  const debouncedFormData = useDebounce(formData, DEBOUNCE_DELAY);

  // Validate individual fields on change (debounced)
  useEffect(() => {
    const newErrors = {};
    Object.keys(debouncedFormData).forEach(field => {
      if (debouncedFormData[field] || errors[field]) {
        const validation = validateField(field, debouncedFormData[field]);
        if (!validation.isValid) {
          newErrors[field] = validation.error;
        }
      }
    });
    setErrors(newErrors);
  }, [debouncedFormData]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear form status on change
    if (formStatus.type) {
      setFormStatus({ type: "", message: "" });
    }
  }, [formStatus.type]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(formData).forEach(field => {
      const validation = validateField(field, formData[field]);
      if (!validation.isValid) {
        newErrors[field] = validation.error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData]);

  const submitForm = useCallback(async (sanitizedData) => {
    // Simulate API call - replace with actual implementation
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate random success/failure for demo
        if (Math.random() > 0.1) {
          resolve({ success: true, message: "Thank you! We'll get back to you soon." });
        } else {
          reject(new Error("Failed to send message. Please try again."));
        }
      }, FORM_SUBMISSION_TIMEOUT);
    });
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setFormStatus({ 
        type: "error", 
        message: "Please correct the errors above." 
      });
      
      // Focus first error field
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const fieldElement = formRef.current?.querySelector(`#field-${firstErrorField}`);
        fieldElement?.focus();
      }
      return;
    }

    setIsSubmitting(true);
    setFormStatus({ type: "", message: "" });

    try {
      // Sanitize form data
      const sanitizedData = {};
      Object.keys(formData).forEach(key => {
        sanitizedData[key] = sanitizeInput(formData[key]);
      });

      const result = await submitForm(sanitizedData);
      
      setFormStatus({ 
        type: "success", 
        message: result.message 
      });
      
      // Reset form on success
      setFormData({ name: "", email: "", subject: "", message: "" });
      setErrors({});
      
      // Scroll to status message
      const statusElement = formRef.current?.querySelector(`.${styles.formStatus}`);
      statusElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch (error) {
      console.error('Form submission error:', error);
      setFormStatus({ 
        type: "error", 
        message: error.message || "An error occurred. Please try again." 
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, errors, validateForm, submitForm]);

  const isFormValid = useMemo(() => {
    return Object.keys(errors).length === 0 && 
           formData.name && 
           formData.email && 
           formData.message;
  }, [errors, formData]);

  return (
    <section 
      ref={ref}
      className={`${styles.contactFormSection} ${isVisible ? styles.visible : ''}`}
      aria-labelledby="contact-form-title"
    >
      <h2 id="contact-form-title" className={styles.srOnly}>Contact Form</h2>
      
      {formStatus.type && (
        <div 
          className={`${styles.formStatus} ${styles[formStatus.type]}`}
          role={formStatus.type === 'error' ? 'alert' : 'status'}
          aria-live="polite"
        >
          {formStatus.message}
        </div>
      )}

      <form 
        ref={formRef}
        onSubmit={handleSubmit} 
        className={styles.contactForm}
        noValidate
      >
        <FormField
          name="name"
          label="Name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
          placeholder="Your Name"
          autoComplete="name"
        />

        <FormField
          type="email"
          name="email"
          label="Email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
          placeholder="your.email@example.com"
          autoComplete="email"
        />

        <FormField
          name="subject"
          label="Subject"
          value={formData.subject}
          onChange={handleChange}
          error={errors.subject}
          placeholder="Subject (Optional)"
          autoComplete="off"
        />

        <FormField
          as="textarea"
          name="message"
          label="Message"
          value={formData.message}
          onChange={handleChange}
          error={errors.message}
          required
          placeholder="How can we help you?"
          rows={6}
          className={styles.textareaField}
        />

        <button 
          type="submit" 
          className={`${styles.submitButton} ${!isFormValid ? styles.disabled : ''}`}
          disabled={isSubmitting || !isFormValid}
          aria-describedby={isSubmitting ? "submit-status" : undefined}
        >
          {isSubmitting ? (
            <>
              <span className={styles.spinner} aria-hidden="true" />
              Sending...
            </>
          ) : (
            "Send Message"
          )}
        </button>
        
        {isSubmitting && (
          <span id="submit-status" className={styles.srOnly}>
            Form is being submitted, please wait.
          </span>
        )}
      </form>
    </section>
  );
};

const ContactInfo = () => {
  const [ref, isVisible] = useIntersectionObserver();

  const contactItems = useMemo(() => 
    CONTACT_INFO.map(item => (
      <ContactInfoItem key={item.id} item={item} />
    )), []
  );

  return (
    <section 
      ref={ref}
      className={`${styles.contactInfoSection} ${isVisible ? styles.visible : ''}`}
      aria-labelledby="contact-info-title"
    >
      <div className={styles.contactInfoCard}>
        <h2 id="contact-info-title" className={styles.contactInfoTitle}>
          Contact Details
        </h2>
        <ul className={styles.contactInfoList} role="list">
          {contactItems}
        </ul>
      </div>
    </section>
  );
};

// Main Component
const ContactUs = () => {
  const { pathname } = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    scrollToTop();
    
    const timer = setTimeout(() => {
      setMounted(true);
    }, ANIMATION_DELAY);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!mounted) {
    return (
      <div className={`${styles.contactUsPage} ${styles.loading}`} aria-label="Loading contact page">
        <div className={styles.loadingSpinner} aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className={styles.contactUsPage} role="main">
      <HeroSection />
      
      <div className={styles.contactContent}>
        <ContactForm />
        <ContactInfo />
      </div>
    </div>
  );
};

export default ContactUs;
