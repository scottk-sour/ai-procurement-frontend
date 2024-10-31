// src/components/Dashboard.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaQuoteRight, FaBalanceScale, FaUserCog, FaBell, FaTasks } from 'react-icons/fa';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  // State for toggling visibility of sections
  const [showSections, setShowSections] = useState({
    recentActivity: true,
    pendingQuotes: true,
    alerts: true,
  });

  // Toggle function for each section
  const toggleSection = (section) => {
    setShowSections((prevState) => ({
      ...prevState,
      [section]: !prevState[section],
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h3>Dashboard</h3>
        <ul>
          <li onClick={() => navigate('/request-quote')}><FaQuoteRight /> Request a Quote</li>
          <li onClick={() => navigate('/compare-vendors')}><FaBalanceScale /> Compare Vendors</li>
          <li onClick={() => navigate('/manage-account')}><FaUserCog /> Manage Account</li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content">
        <h1 className="dashboard-title">Welcome to Your Dashboard!</h1>
        <p className="dashboard-subtitle">Manage your activities and stay updated.</p>

        {/* Quick Actions */}
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

        {/* Widgets */}
        <div className="widgets-container">
          {showSections.recentActivity && (
            <section className="widget">
              <div className="widget-header">
                <h2><FaTasks /> Recent Activity</h2>
                <button onClick={() => toggleSection('recentActivity')} className="toggle-button">Hide</button>
              </div>
              <div className="widget-content">
                <p>Quote requested on 2024-10-01</p>
                <p>Quote comparison completed on 2024-10-02</p>
                <p>Account updated on 2024-10-03</p>
              </div>
            </section>
          )}

          {showSections.pendingQuotes && (
            <section className="widget">
              <div className="widget-header">
                <h2><FaQuoteRight /> Pending Quotes</h2>
                <button onClick={() => toggleSection('pendingQuotes')} className="toggle-button">Hide</button>
              </div>
              <div className="widget-content">
                <p>No pending quotes.</p>
              </div>
            </section>
          )}

          {showSections.alerts && (
            <section className="widget">
              <div className="widget-header">
                <h2><FaBell /> Alerts</h2>
                <button onClick={() => toggleSection('alerts')} className="toggle-button">Hide</button>
              </div>
              <div className="widget-content">
                <p>No alerts at the moment.</p>
              </div>
            </section>
          )}
        </div>

        {/* Logout Button */}
        <button className="logout" onClick={handleLogout}>
          Logout
        </button>
      </main>
    </div>
  );
};

export default Dashboard;
