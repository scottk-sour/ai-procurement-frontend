import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

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

// Helper function to show error
function showError(message, stack) {
  console.error('❌ Error:', message);
  const errorDetails = document.getElementById('error-details');
  if (errorDetails) {
    errorDetails.textContent = `${message}\n\nStack: ${stack || 'N/A'}`;
  }
  const loadingIndicator = document.getElementById('loading-indicator');
  const errorBoundary = document.getElementById('error-boundary');
  if (loadingIndicator) loadingIndicator.style.display = 'none';
  if (errorBoundary) errorBoundary.style.display = 'block';
}

// Step 1: Test basic React rendering
console.log('🚀 Step 1: Testing basic React rendering...');

try {
  const root = createRoot(container);

  // Step 2: Try importing App
  console.log('🚀 Step 2: Importing App component...');

  // First, render a simple component to verify React works
  root.render(
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🚀 React is loading...</h1>
      <p>If you see this, React is working. Now loading the app...</p>
    </div>
  );

  // Signal basic render success
  window.dispatchEvent(new Event('tendorai-app-ready'));

  // Now try to load the full App
  import('./App')
    .then((module) => {
      console.log('✅ Step 2 complete: App imported successfully');
      const App = module.default;

      // Step 3: Render App
      console.log('🚀 Step 3: Rendering App...');

      try {
        root.render(
          <React.StrictMode>
            <App />
          </React.StrictMode>
        );

        console.log('✅ TendorAI app rendered successfully');
      } catch (renderError) {
        showError(`Render Error: ${renderError.message}`, renderError.stack);
      }
    })
    .catch((importError) => {
      showError(`Import Error: ${importError.message}`, importError.stack);
    });
} catch (error) {
  showError(`Init Error: ${error.message}`, error.stack);
}
