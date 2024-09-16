// src/components/NavigationBar.js
import React from 'react';
import { Link } from 'react-router-dom';

const NavigationBar = () => {
  return (
    <nav>
      <ul style={{ display: 'flex', listStyle: 'none', gap: '1rem', padding: '1rem', backgroundColor: '#333', color: '#fff' }}>
        <li>
          <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Home</Link>
        </li>
        <li>
          <Link to="/dashboard" style={{ color: '#fff', textDecoration: 'none' }}>Dashboard</Link>
        </li>
        <li>
          <Link to="/request-quote" style={{ color: '#fff', textDecoration: 'none' }}>Request Quote</Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavigationBar;
