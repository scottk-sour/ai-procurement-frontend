import React, { useState } from 'react';
import { FaQuoteRight, FaBalanceScale, FaUserCog, FaBell, FaTasks } from 'react-icons/fa';
import '../styles/Dashboard.css';

const Dashboard = () => {
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

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h3>Dashboard</h3>
        <ul>
          <li><FaQuoteRight /> Request a Quote</li>
          <li><FaBalanceScale /> Compare Vendors</li>
          <li><FaUserCog /> Manage Account</li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content">
        <h1 className="dashboard-title">Welcome to Your Dashboard!</h1>
        <p className="dashboard-subtitle">Manage your activities and stay updated.</p>

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

        {/* Toggle Buttons for All Widgets */}
        <div className="widget-controls">
          <button onClick={() => toggleSection('recentActivity')} className="control-button">
            Toggle Recent Activity
          </button>
          <button onClick={() => toggleSection('pendingQuotes')} className="control-button">
            Toggle Pending Quotes
          </button>
          <button onClick={() => toggleSection('alerts')} className="control-button">
            Toggle Alerts
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
