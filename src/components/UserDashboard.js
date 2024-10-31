// src/components/UserDashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaQuoteRight, FaBalanceScale, FaUserCog, FaBell, FaTasks, FaUpload } from 'react-icons/fa';
import '../styles/UserDashboard.css';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    const name = localStorage.getItem('userName');
    if (name) {
      setUserName(name);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('File uploaded:', file.name);
      // Additional logic for file upload processing can be added here
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {userName}!</h1>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>

      <div className="quick-actions">
        <button className="dashboard-button" onClick={() => navigate('/request-quote')}>
          <FaQuoteRight /> Request a Quote
        </button>
        <button className="dashboard-button" onClick={() => navigate('/compare-vendors')}>
          <FaBalanceScale /> Compare Vendors
        </button>
        <button className="dashboard-button" onClick={() => navigate('/manage-account')}>
          <FaUserCog /> Manage Account
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
      </div>
      
      <div className="recent-activity">
        <h2><FaTasks /> Recent Activity</h2>
        <ul>
          <li><FaBell /> Quote requested on 2024-10-01</li>
          <li><FaBell /> Quote comparison completed on 2024-10-02</li>
          <li><FaBell /> Account updated on 2024-10-03</li>
        </ul>
      </div>

      {/* Alerts/Notifications Section */}
      <div className="alerts-section">
        <h2><FaBell /> Notifications & Alerts</h2>
        <div className="alert-item">
          <span className="alert-icon"><FaBell /></span>
          <span className="alert-text">Pending action on a recent quote.</span>
          <button className="alert-action" onClick={() => navigate('/pending-quotes')}>
            View
          </button>
        </div>
        <div className="alert-item">
          <span className="alert-icon"><FaBell /></span>
          <span className="alert-text">Renewal due for your current service.</span>
          <button className="alert-action" onClick={() => navigate('/manage-account')}>
            Renew
          </button>
        </div>
        <div className="alert-item">
          <span className="alert-icon"><FaBell /></span>
          <span className="alert-text">New messages awaiting response.</span>
          <button className="alert-action" onClick={() => navigate('/messages')}>
            Reply
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
