import React, { useState } from 'react';
import './Dashboard.css'; // Make sure to create and link this CSS file for styling

const Dashboard = () => {
  const [widgets, setWidgets] = useState({
    recentActivity: true,
    pendingQuotes: true,
    alerts: true,
  });

  const toggleWidget = (widget) => {
    setWidgets({ ...widgets, [widget]: !widgets[widget] });
  };

  return (
    <div className="dashboard-container">
      {/* Navigation Pane */}
      <aside className="sidebar">
        <h3>Dashboard</h3>
        <ul>
          <li>Request a Quote</li>
          <li>Compare Vendors</li>
          <li>Manage Account</li>
        </ul>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-content">
        <h1>Welcome to Your Dashboard!</h1>

        {widgets.recentActivity && (
          <section className="widget">
            <h2>Recent Activity</h2>
            <p>No recent activity.</p>
          </section>
        )}

        {widgets.pendingQuotes && (
          <section className="widget">
            <h2>Pending Quotes</h2>
            <p>No pending quotes.</p>
          </section>
        )}

        {widgets.alerts && (
          <section className="widget">
            <h2>Alerts</h2>
            <p>No alerts at the moment.</p>
          </section>
        )}

        <div className="widget-controls">
          <button onClick={() => toggleWidget('recentActivity')}>
            Toggle Recent Activity
          </button>
          <button onClick={() => toggleWidget('pendingQuotes')}>
            Toggle Pending Quotes
          </button>
          <button onClick={() => toggleWidget('alerts')}>
            Toggle Alerts
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
