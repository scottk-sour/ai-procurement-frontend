// src/components/VendorSignup.js
import React, { useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import './VendorSignup.css';

const servicesOptions = [
  { value: 'Printing', label: 'Printing' },
  { value: 'Telecom', label: 'Telecom' },
  { value: 'IT Support', label: 'IT Support' },
  { value: 'CCTV', label: 'CCTV' },
  // Add more options as needed
];

const VendorSignup = () => {
  const [formData, setFormData] = useState({
    name: '', // Updated from businessName to name
    email: '',
    password: '',
    services: [], // Updated from servicesOffered to services
    phone: '',
    address: '',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleServicesChange = (selectedOptions) => {
    setFormData({
      ...formData,
      services: selectedOptions.map(option => option.value), // Updated key to services
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Updated API endpoint to match backend route
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
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Business Name:
          {/* Updated input name from businessName to name */}
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
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
