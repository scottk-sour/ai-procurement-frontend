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
  const [vendor, setVendor] = useState(null);

  // Fetch vendor details on component mount
  useEffect(() => {
    const name = localStorage.getItem('vendorName');
    if (name) {
      setVendorName(name);
    }

    const fetchVendorDetails = async () => {
      const token = localStorage.getItem('vendorToken');
      if (token) {
        try {
          const response = await axios.get('http://localhost:5000/api/vendors/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setVendor(response.data.vendor);
        } catch (error) {
          if (error.response?.status === 401) {
            localStorage.removeItem('vendorToken');
            localStorage.removeItem('vendorName');
            navigate('/vendor-login');
          } else {
            console.error('Error fetching vendor details:', error.message);
          }
        }
      } else {
        navigate('/vendor-login');
      }
    };

    fetchVendorDetails();
  }, [navigate]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('vendorName');
    navigate('/vendor-login');
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('vendorToken');
      if (!token) {
        setUploadStatus({ message: 'Please log in to upload files.', type: 'error' });
        navigate('/vendor-login');
        return;
      }

      try {
        const response = await axios.post('http://localhost:5000/api/vendors/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
        });

        setUploadStatus({ message: 'File uploaded successfully!', type: 'success' });
        setVendor(response.data.vendor);
      } catch (error) {
        if (error.response?.status === 401) {
          setUploadStatus({ message: 'Session expired. Please log in again.', type: 'error' });
          localStorage.removeItem('vendorToken');
          navigate('/vendor-login');
        } else {
          console.error('Error uploading file:', error.response?.data || error.message);
          setUploadStatus({ message: 'File upload failed.', type: 'error' });
        }
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
            style={{ display: 'none' }}
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
          {vendor?.uploads?.map((file, index) => (
            <li key={index}><FaBell /> Uploaded file: {file}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default VendorDashboard;
