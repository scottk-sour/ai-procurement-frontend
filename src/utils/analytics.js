import { useCallback } from 'react';
import { getAuthToken } from './auth'; // Import for token consistency

export const useAnalytics = () => {
  const trackEvent = useCallback(async (event, data) => {
    console.log(`📊 Analytics Event: ${event}`, data);

    // Optional: Send event to backend for logging
    try {
      const token = getAuthToken();
      if (token) {
        const response = await fetch('http://localhost:5000/api/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ event, data, timestamp: new Date().toISOString() }),
        });

        if (!response.ok) {
          console.error(`Failed to log analytics event: ${event}`, response.status);
        }
      } else {
        console.warn('No token found, analytics event not sent to backend');
      }
    } catch (error) {
      console.error('Error sending analytics event:', error);
    }
  }, []); // Empty dependency array since there are no dependencies

  return { trackEvent };
};