// src/components/VendorSignup.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./VendorSignup.css"; // Use the existing VendorSignup.css for consistency

const servicesOptions = [
  { value: "CCTV", label: "CCTV" },
  { value: "Photocopiers", label: "Photocopiers" },
  { value: "IT", label: "IT Support" },
  { value: "Telecoms", label: "Telecoms" },
];

const VendorSignup = () => {
  const [formData, setFormData] = useState({
    name: "", // Vendor Name
    company: "", // Company Name
    email: "",
    password: "",
    services: [], // Array of selected services
    phone: "",
    address: "",
    location: "",
    price: "", // Average price for service
    serviceLevel: "", // e.g., "Premium", "Standard"
    responseTime: "", // in hours
    yearsInBusiness: "", // Number of years
    support: "", // e.g., "24/7", "Business Hours"
  });
  const [passwordVisible, setPasswordVisible] = useState(false); // Password visibility state
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false); // State for animation visibility

  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Scroll to top on page load, debug mount, and set visibility
  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setIsVisible(true), 100); // Match other services' delay
    return () => clearTimeout(timer);
  }, [pathname]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error || message) setError(""); setMessage(""); // Clear feedback on change
  };

  const handleServicesChange = (selectedOptions) => {
    setFormData((prev) => ({
      ...prev,
      services: selectedOptions.map((option) => option.value),
    }));
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const { name, company, email, password, services, phone, address, location, price, serviceLevel, responseTime, yearsInBusiness, support } = formData;

    if (!name || !company || !email || !password || !services.length) {
      setError("Please complete all required fields.");
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/auth/vendor/signup",
        {
          name,
          company,
          email,
          password,
          services,
          phone: phone || null, // Use null or empty string if optional
          address: address || null,
          location: location || null,
          price: price ? parseFloat(price) : null, // Convert to number if provided
          serviceLevel: serviceLevel || null,
          responseTime: responseTime ? parseInt(responseTime, 10) : null, // Convert to integer if provided
          yearsInBusiness: yearsInBusiness ? parseInt(yearsInBusiness, 10) : null, // Convert to integer if provided
          support: support || null,
        }
      );
      setMessage("Vendor registration successful! Redirecting to login...");
      setTimeout(() => navigate("/vendor-login"), 2000);
    } catch (error) {
      console.error("Error signing up vendor:", error);
      setError(error.response?.data?.message || "Error signing up vendor. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vendor-signup-page" data-animation="fadeInUp" data-visible={isVisible}>
      {/* Hero Section */}
      <header className="vendor-signup-hero" data-animation="fadeIn" data-delay="200" data-visible={isVisible}>
        <h1 className="vendor-signup-title">Become a TENDORAI Vendor</h1>
        <p className="vendor-signup-subtitle">
          Join our network to offer your services and connect with businesses through AI.
        </p>
      </header>

      {/* Signup Form */}
      <section className="vendor-signup-section" data-animation="fadeInUp" data-delay="400" data-visible={isVisible}>
        <div className="section-container">
          <form onSubmit={handleSubmit} className="vendor-signup-form">
            {error && <div className={`form-status error`}>{error}</div>}
            {message && <div className={`form-status success`}>{message}</div>}

            <div className="form-group" data-animation="fadeInUp" data-delay="500" data-visible={isVisible}>
              <label htmlFor="name">Vendor Name <span className="required">*</span></label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

            <div className="form-group" data-animation="fadeInUp" data-delay="600" data-visible={isVisible}>
              <label htmlFor="company">Company Name <span className="required">*</span></label>
              <input
                type="text"
                id="company"
                name="company"
                placeholder="Enter your company name"
                value={formData.company}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

            <div className="form-group" data-animation="fadeInUp" data-delay="700" data-visible={isVisible}>
              <label htmlFor="email">Email <span className="required">*</span></label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field"
              />
              {formData.email && !validateEmail(formData.email) && (
                <p className="validation-error">Please enter a valid email address.</p>
              )}
            </div>

            <div className="form-group password-group" data-animation="fadeInUp" data-delay="800" data-visible={isVisible}>
              <label htmlFor="password">Password <span className="required">*</span></label>
              <div className="password-input-wrapper">
                <input
                  type={passwordVisible ? "text" : "password"} // Use passwordVisible
                  id="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)} // Use setPasswordVisible
                  className="toggle-password"
                >
                  {passwordVisible ? "Hide" : "Show"} {/* Use passwordVisible */}
                </button>
              </div>
            </div>

            <div className="form-group" data-animation="fadeInUp" data-delay="900" data-visible={isVisible}>
              <label htmlFor="services">Services Offered <span className="required">*</span></label>
              <Select
                isMulti
                options={servicesOptions}
                onChange={handleServicesChange}
                placeholder="Select services you offer"
                className="services-select"
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: "#e5e7eb", /* Matching other services */
                    borderRadius: "10px", /* Larger radius for luxury */
                    boxShadow: "none",
                    "&:hover": { borderColor: "#f97316" }, /* TENDORAI orange */
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused ? "#f9fafb" : "white",
                    color: "#1e3a8a", /* Deeper TENDORAI blue */
                  }),
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: "#f9fafb",
                    borderRadius: "6px",
                  }),
                  multiValueLabel: (base) => ({
                    ...base,
                    color: "#1e3a8a",
                  }),
                  multiValueRemove: (base) => ({
                    ...base,
                    color: "#f97316",
                    ":hover": {
                      backgroundColor: "#fee2e2",
                      color: "#ea580c",
                    },
                  }),
                }}
              />
            </div>

            <div className="form-group" data-animation="fadeInUp" data-delay="1000" data-visible={isVisible}>
              <label htmlFor="phone">Phone (Optional)</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div className="form-group" data-animation="fadeInUp" data-delay="1100" data-visible={isVisible}>
              <label htmlFor="address">Address (Optional)</label>
              <input
                type="text"
                id="address"
                name="address"
                placeholder="Enter your business address"
                value={formData.address}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div className="form-group" data-animation="fadeInUp" data-delay="1200" data-visible={isVisible}>
              <label htmlFor="location">Location (Optional)</label>
              <input
                type="text"
                id="location"
                name="location"
                placeholder="Enter your location"
                value={formData.location}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div className="form-group" data-animation="fadeInUp" data-delay="1300" data-visible={isVisible}>
              <label htmlFor="price">Average Price for Service (Optional)</label>
              <input
                type="number"
                id="price"
                name="price"
                placeholder="Enter average price"
                value={formData.price}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div className="form-group" data-animation="fadeInUp" data-delay="1400" data-visible={isVisible}>
              <label htmlFor="serviceLevel">Service Level (Optional)</label>
              <input
                type="text"
                id="serviceLevel"
                name="serviceLevel"
                placeholder="e.g., Premium, Standard"
                value={formData.serviceLevel}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div className="form-group" data-animation="fadeInUp" data-delay="1500" data-visible={isVisible}>
              <label htmlFor="responseTime">Response Time (in hours, Optional)</label>
              <input
                type="number"
                id="responseTime"
                name="responseTime"
                placeholder="Enter response time in hours"
                value={formData.responseTime}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div className="form-group" data-animation="fadeInUp" data-delay="1600" data-visible={isVisible}>
              <label htmlFor="yearsInBusiness">Years in Business (Optional)</label>
              <input
                type="number"
                id="yearsInBusiness"
                name="yearsInBusiness"
                placeholder="Enter number of years"
                value={formData.yearsInBusiness}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div className="form-group" data-animation="fadeInUp" data-delay="1700" data-visible={isVisible}>
              <label htmlFor="support">Support Details (Optional)</label>
              <input
                type="text"
                id="support"
                name="support"
                placeholder="e.g., 24/7, Business Hours"
                value={formData.support}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <button type="submit" className="submit-button" disabled={loading} data-animation="fadeInUp" data-delay="1800" data-visible={isVisible}>
              {loading ? (
                <span className="loading-spinner">Registering...</span>
              ) : (
                "Sign Up"
              )}
            </button>

            <p className="login-link" data-animation="fadeInUp" data-delay="1900" data-visible={isVisible}>
              Already have a vendor account? <Link to="/vendor-login">Log in here</Link>
            </p>
          </form>
        </div>
      </section>
    </div>
  );
};

export default VendorSignup;