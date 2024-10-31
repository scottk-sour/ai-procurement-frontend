// src/components/VendorDashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBox, FaChartLine, FaBell, FaCog, FaDollarSign, FaSignOutAlt, FaUpload } from 'react-icons/fa';
import axios from 'axios';
import '../styles/VendorDashboard.css';

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [vendorName, setVendorName] = useState('Vendor');
  const [uploadStatus, setUploadStatus] = useState('');

  useEffect(() => {
    const name = localStorage.getItem('vendorName');
    if (name) {
      setVendorName(name);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('vendorName');
    navigate('/vendor-login');
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const response = await axios.post('http://localhost:5000/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setUploadStatus({ message: 'File uploaded successfully!', type: 'success' });
      } catch (error) {
        setUploadStatus({ message: 'File upload failed.', type: 'error' });
      }
    }
  };

  return (
    <div className="vendor-dashboard-container">
      <div className="vendor-dashboard-header">
        <h1>Welcome, {vendorName}!</h1>
        <button className="logout-button" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>

      <div className="vendor-quick-actions">
        <button className="dashboard-button" onClick={() => navigate('/manage-listings')}>
          <FaBox /> Manage Listings
        </button>
        <button className="dashboard-button" onClick={() => navigate('/view-orders')}>
          <FaChartLine /> View Orders
        </button>
        <button className="dashboard-button" onClick={() => navigate('/account-settings')}>
          <FaCog /> Account Settings
        </button>
        
        {/* Upload Documents Button */}
        <label className="upload-label">
          <FaUpload /> Upload Documents
          <input 
            type="file" 
            className="file-input" 
            onChange={handleFileUpload} 
          />
        </label>
        {uploadStatus.message && (
          <p className={`upload-status ${uploadStatus.type}`}>
            {uploadStatus.message}
          </p>
        )}
      </div>

      <div className="vendor-stats-widgets">
        <div className="stat-widget">
          <FaDollarSign className="widget-icon" />
          <h3>Total Revenue</h3>
          <p>$12,000</p>
        </div>
        <div className="stat-widget">
          <FaBox className="widget-icon" />
          <h3>Active Listings</h3>
          <p>15</p>
        </div>
        <div className="stat-widget">
          <FaChartLine className="widget-icon" />
          <h3>Total Orders</h3>
          <p>350</p>
        </div>
      </div>

      <div className="recent-activity">
        <h2><FaBell /> Recent Activity</h2>
        <ul>
          <li><FaBell /> New order received on 2024-11-01</li>
          <li><FaBell /> Listing updated on 2024-10-30</li>
          <li><FaBell /> Profile updated on 2024-10-28</li>
        </ul>
      </div>
    </div>
  );
};

export default VendorDashboard;
