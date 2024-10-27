import React, { useState } from 'react';
import './Dashboard.css';

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
          <li>Request a Quote</li>
          <li>Compare Vendors</li>
          <li>Manage Account</li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content">
        <h1>Welcome to Your Dashboard!</h1>

        {/* Conditional rendering of widgets */}
        {showSections.recentActivity && (
          <section className="widget">
            <h2>Recent Activity</h2>
            <p>No recent activity.</p>
          </section>
        )}

        {showSections.pendingQuotes && (
          <section className="widget">
            <h2>Pending Quotes</h2>
            <p>No pending quotes.</p>
          </section>
        )}

        {showSections.alerts && (
          <section className="widget">
            <h2>Alerts</h2>
            <p>No alerts at the moment.</p>
          </section>
        )}

        {/* Toggle Buttons */}
        <div className="widget-controls">
          <button onClick={() => toggleSection('recentActivity')}>
            Toggle Recent Activity
          </button>
          <button onClick={() => toggleSection('pendingQuotes')}>
            Toggle Pending Quotes
          </button>
          <button onClick={() => toggleSection('alerts')}>
            Toggle Alerts
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
