// src/components/VendorSignup.js
import React, { useState } from 'react';
import axios from 'axios';
import './VendorSignup.css'; // Import CSS if you have styling for this component

const VendorSignup = () => {
  // State to hold form data and any messages
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    password: '',
    servicesOffered: '',
    phone: '',
    address: '',
  });

  const [message, setMessage] = useState(''); // Success or error message

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Make a POST request to your backend's vendor signup endpoint
      const response = await axios.post('http://localhost:5000/api/vendor-signup', formData);
      setMessage(response.data.message); // Set success message
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error signing up vendor');
    }
  };

  return (
    <div className="vendor-signup-container">
      <h2>Vendor Signup</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Business Name:
          <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} required />
        </label>
        <label>
          Email:
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </label>
        <label>
          Password:
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </label>
        <label>
          Services Offered (comma-separated):
          <input type="text" name="servicesOffered" value={formData.servicesOffered} onChange={handleChange} required />
        </label>
        <label>
          Phone:
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
        </label>
        <label>
          Address:
          <input type="text" name="address" value={formData.address} onChange={handleChange} />
        </label>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default VendorSignup;
