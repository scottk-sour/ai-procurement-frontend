import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Unregister stale service workers causing blank screen on first load
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
      console.log('🧹 Unregistered stale service worker');
    });
  });
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
