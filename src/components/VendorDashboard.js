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
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const name = localStorage.getItem('vendorName');
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    if (name) setVendorName(name);

    const fetchVendorDetails = async () => {
      const token = localStorage.getItem('vendorToken');
      if (!token) {
        navigate('/vendor-login');
        return;
      }
      try {
        const response = await axios.get('http://localhost:5000/api/vendors/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVendor(response.data.vendor);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.clear();
          navigate('/vendor-login');
        } else console.error('Error fetching vendor details:', error.message);
      }
    };

    fetchVendorDetails();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/vendor-login');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('vendorToken');

    try {
      const response = await axios.post('http://localhost:5000/api/vendors/upload', formData, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setUploadStatus({ message: 'File uploaded successfully!', type: 'success' });
      setVendor(response.data.vendor);
    } catch (error) {
      console.error('Error uploading file:', error.message);
      setUploadStatus({ message: 'File upload failed.', type: 'error' });
    }
  };

  return (
    <div className="vendor-dashboard-container">
      <div className="vendor-dashboard-header">
        <h1>Welcome, {vendorName}!</h1>
        <div>
          <button className="logout-button" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
          <button className="theme-toggle-button" onClick={toggleTheme}>
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
        </div>
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
        <label className="upload-label">
          <FaUpload /> Upload Documents
          <input type="file" className="file-input" onChange={handleFileUpload} />
        </label>
      </div>

      <div className="vendor-stats-widgets">
        <div className="stat-widget">
          <FaDollarSign />
          <h3>Total Revenue</h3>
          <p>${vendor?.totalRevenue || 0}</p>
        </div>
        <div className="stat-widget">
          <FaBox />
          <h3>Active Listings</h3>
          <p>{vendor?.activeListings || 0}</p>
        </div>
        <div className="stat-widget">
          <FaChartLine />
          <h3>Total Orders</h3>
          <p>{vendor?.totalOrders || 0}</p>
        </div>
      </div>

      <div className="recent-activity">
        <h2><FaBell /> Recent Activity</h2>
        <ul>
          {vendor?.uploads?.map((file, idx) => (
            <li key={idx}><FaBell /> {file.fileName}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default VendorDashboard;
