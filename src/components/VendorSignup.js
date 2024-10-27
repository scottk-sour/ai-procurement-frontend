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
    businessName: '',
    email: '',
    password: '',
    servicesOffered: [],
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
      servicesOffered: selectedOptions.map(option => option.value), // Store only values
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/vendor-signup', formData);
      setMessage(response.data.message);
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
