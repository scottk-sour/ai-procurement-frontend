// src/utils/analytics.js
// Production-ready analytics tracking utility

const API_URL = process.env.REACT_APP_API_URL || 'https://ai-procurement-backend-q35u.onrender.com';

// Generate a session ID for visitor tracking (stored in sessionStorage)
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('tendorai_session');
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem('tendorai_session', sessionId);
  }
  return sessionId;
};

/**
 * Track an analytics event (public, no auth required)
 * @param {string} vendorId - The vendor ID
 * @param {string} eventType - Event type: view, click, quote_request, contact, website_click, phone_click, search_impression
 * @param {object} source - Source information (page, referrer, searchQuery, category, location)
 * @param {object} metadata - Additional metadata
 */
export const trackEvent = async (vendorId, eventType, source = {}, metadata = {}) => {
  if (!vendorId || !eventType) return;

  try {
    const response = await fetch(`${API_URL}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vendorId,
        eventType,
        sessionId: getSessionId(),
        source: {
          page: source.page || window.location.pathname,
          referrer: source.referrer || document.referrer || 'direct',
          searchQuery: source.searchQuery,
          category: source.category,
          location: source.location,
          campaign: source.campaign
        },
        metadata
      })
    });

    if (!response.ok) {
      console.warn('Analytics tracking failed:', response.status);
    }
  } catch (error) {
    // Silent fail - analytics should never break the app
    console.warn('Analytics tracking error:', error.message);
  }
};

/**
 * Track a profile view
 * @param {string} vendorId - The vendor ID
 * @param {object} context - Optional context (searchQuery, category, etc.)
 */
export const trackProfileView = (vendorId, context = {}) => {
  return trackEvent(vendorId, 'view', {
    page: window.location.pathname,
    searchQuery: context.searchQuery,
    category: context.category,
    location: context.location
  });
};

/**
 * Track a search impression (vendor appeared in search results)
 * @param {string} vendorId - The vendor ID
 * @param {number} position - Position in search results
 * @param {string} searchQuery - The search query
 * @param {string} category - Service category
 * @param {string} location - Location searched
 */
export const trackSearchImpression = (vendorId, position, searchQuery, category, location) => {
  return trackEvent(vendorId, 'search_impression', {
    searchQuery,
    category,
    location
  }, {
    position
  });
};

/**
 * Track a website click
 * @param {string} vendorId - The vendor ID
 */
export const trackWebsiteClick = (vendorId) => {
  return trackEvent(vendorId, 'website_click');
};

/**
 * Track a phone click
 * @param {string} vendorId - The vendor ID
 */
export const trackPhoneClick = (vendorId) => {
  return trackEvent(vendorId, 'phone_click');
};

/**
 * Track a quote request
 * @param {string} vendorId - The vendor ID
 * @param {object} details - Quote request details
 */
export const trackQuoteRequest = (vendorId, details = {}) => {
  return trackEvent(vendorId, 'quote_request', {}, {
    quoteRequestId: details.quoteId,
    value: details.estimatedValue
  });
};

/**
 * Track contact action (email, form submission)
 * @param {string} vendorId - The vendor ID
 */
export const trackContact = (vendorId) => {
  return trackEvent(vendorId, 'contact');
};

/**
 * Track multiple search impressions at once (for search results pages)
 * @param {Array} vendors - Array of vendor objects with _id
 * @param {string} searchQuery - The search query
 * @param {string} category - Service category
 * @param {string} location - Location searched
 */
export const trackSearchImpressions = (vendors, searchQuery, category, location) => {
  if (!vendors || vendors.length === 0) return;

  // Use batch endpoint for efficiency
  const events = vendors.map((vendor, index) => ({
    vendorId: vendor._id || vendor.id,
    eventType: 'search_impression',
    sessionId: getSessionId(),
    source: {
      page: window.location.pathname,
      searchQuery,
      category,
      location
    },
    metadata: {
      position: index + 1
    }
  }));

  fetch(`${API_URL}/api/analytics/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ events })
  }).catch(() => {
    // Silent fail
  });
};

// Legacy hook for backwards compatibility
export const useAnalytics = () => {
  return {
    trackEvent,
    trackProfileView,
    trackWebsiteClick,
    trackPhoneClick,
    trackQuoteRequest,
    trackContact,
    trackSearchImpression,
    trackSearchImpressions
  };
};

export default {
  trackEvent,
  trackProfileView,
  trackWebsiteClick,
  trackPhoneClick,
  trackQuoteRequest,
  trackContact,
  trackSearchImpression,
  trackSearchImpressions
};
