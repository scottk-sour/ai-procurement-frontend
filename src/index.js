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

try {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // Signal that the app has loaded successfully
  window.dispatchEvent(new Event('tendorai-app-ready'));
  console.log('✅ TendorAI app rendered successfully');
} catch (error) {
  console.error('❌ Failed to render TendorAI app:', error);

  // Show error in the UI
  const errorDetails = document.getElementById('error-details');
  if (errorDetails) {
    errorDetails.textContent = `Render Error: ${error.message}\n\nStack: ${error.stack}`;
  }

  // Show the error boundary
  const loadingIndicator = document.getElementById('loading-indicator');
  const errorBoundary = document.getElementById('error-boundary');
  if (loadingIndicator) loadingIndicator.style.display = 'none';
  if (errorBoundary) errorBoundary.style.display = 'block';
}
