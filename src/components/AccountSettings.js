// src/components/AccountSettings.js
import React, { useState } from 'react';
import { useAuth } from "../context/AuthContext"; // ✅ ADDED LINE

const AccountSettings = () => {
  const { auth } = useAuth(); // ✅ USE THE AUTH CONTEXT

  const [vendorDetails, setVendorDetails] = useState({
    companyName: auth?.user?.name || 'Company Name', // Now uses context if available
    email: auth?.user?.email || 'vendor@example.com',
    phone: auth?.user?.phone || '123-456-7890',
    address: auth?.user?.address || '1234 Vendor St, Business City, BC',
    password: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVendorDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement API call to save updated details to the backend
  };

  return (
    <div className="account-settings-container" style={styles.container}>
      <h2 style={styles.heading}>Account Settings</h2>
      <form onSubmit={handleFormSubmit} style={styles.form}>
        <div style={styles.field}>
          <label style={styles.label}>Company Name:</label>
          <input
            type="text"
            name="companyName"
            value={vendorDetails.companyName}
            onChange={handleInputChange}
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Email:</label>
          <input
            type="email"
            name="email"
            value={vendorDetails.email}
            onChange={handleInputChange}
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Phone:</label>
          <input
            type="text"
            name="phone"
            value={vendorDetails.phone}
            onChange={handleInputChange}
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Address:</label>
          <input
            type="text"
            name="address"
            value={vendorDetails.address}
            onChange={handleInputChange}
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Password:</label>
          <input
            type="password"
            name="password"
            value={vendorDetails.password}
            onChange={handleInputChange}
            style={styles.input}
          />
        </div>

        <button type="submit" style={styles.button}>Save Changes</button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
  },
  heading: {
    textAlign: 'center',
    color: '#007bff',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  field: {
    marginBottom: '15px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '5px',
    display: 'block',
  },
  input: {
    width: '100%',
    padding: '8px',
    fontSize: '14px',
    borderRadius: '4px',
    border: '1px solid #ddd',
  },
  button: {
    padding: '10px 15px',
    fontSize: '16px',
    color: '#fff',
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default AccountSettings;
