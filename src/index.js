// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'; // This imports the global styles
import App from './App'; // Import the main App component

// Render the App component into the root div in index.html
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root') // Finds the element with the ID of 'root' in public/index.html
);
