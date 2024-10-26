// src/components/UserDashboard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './UserDashboard.css';

const UserDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <h1>Welcome to Your Dashboard!</h1>
      
      <div className="quick-actions">
        <button className="dashboard-button" onClick={() => navigate('/request-quote')}>
          Request a Quote
        </button>
        <button className="dashboard-button" onClick={() => navigate('/compare-vendors')}>
          Compare Vendors
        </button>
        <button className="dashboard-button" onClick={() => navigate('/manage-account')}>
          Manage Account
        </button>
      </div>
      
      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <ul>
          <li>Quote requested on 2024-10-01</li>
          <li>Quote comparison completed on 2024-10-02</li>
          <li>Account updated on 2024-10-03</li>
        </ul>
      </div>

      <button className="dashboard-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default UserDashboard;
