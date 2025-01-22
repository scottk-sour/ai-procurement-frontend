// src/components/VendorSignup.js
import React, { useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import './VendorSignup.css';

const servicesOptions = [
  { value: 'CCTV', label: 'CCTV' },
  { value: 'Photocopiers', label: 'Photocopiers' },
  { value: 'IT', label: 'IT Support' },
  { value: 'Telecoms', label: 'Telecoms' },
  // Add more options if needed
];

const VendorSignup = () => {
  const [formData, setFormData] = useState({
    name: '', // Matches backend "name"
    company: '', // Added "company" to match backend requirements
    email: '',
    password: '',
    services: [], // Matches backend "services"
    phone: '', // Optional, depending on your backend model
    address: '', // Optional, depending on your backend model
  });
  const [message, setMessage] = useState('');

  // Handle input field changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle services multi-select
  const handleServicesChange = (selectedOptions) => {
    setFormData({
      ...formData,
      services: selectedOptions.map(option => option.value),
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send form data to backend
      const response = await axios.post('http://localhost:5000/api/vendors/signup', formData);
      setMessage(response.data.message || 'Vendor registered successfully!');
    } catch (error) {
      console.error('Error signing up vendor:', error);
      setMessage(error.response?.data?.message || 'Error signing up vendor');
    }
  };

  return (
    <div className="vendor-signup-container">
      <h2>Vendor Signup</h2>
      {message && <p className={`message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Vendor Name:
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </label>
        <label>
          Company Name:
          <input type="text" name="company" value={formData.company} onChange={handleChange} required />
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
          Services Offered:
          <Select
            isMulti
            options={servicesOptions}
            onChange={handleServicesChange}
            placeholder="Select services"
            className="services-select"
          />
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
