import { useEffect } from "react";

export const useAnalytics = () => {
  const trackEvent = (event, data) => {
    console.log(`📊 Analytics Event: ${event}`, data);
    // Add actual analytics implementation here (e.g., Google Analytics, Segment, or TENDORAI backend logging)
    // Example: fetch('/api/analytics', { method: 'POST', body: JSON.stringify({ event, data }) });
  };

  return { trackEvent };
};