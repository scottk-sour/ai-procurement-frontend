// Simplified QuoteResults.js - Remove problematic dependencies
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/QuotesResults.css';
// Simple utility functions inline
const formatCurrency = (amount) => {
  if (typeof amount !== "number" || isNaN(amount)) return "£0.00";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
};
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
const validateQuoteAction = (quote, action) => {
  if (!quote || !quote._id) {
    return { isValid: false, message: 'Invalid quote data' };
  }
  if (!['generated', 'pending'].includes(quote.status)) {
    return { isValid: false, message: 'Quote is no longer actionable' };
  }
  return { isValid: true, message: '' };
};
// Simple Loading Spinner Component
const LoadingSpinner = ({ message = "Loading..." }) => (
  <div style={{ textAlign: 'center', padding: '2rem' }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '4px solid #f3f4f6',
      borderTop: '4px solid #3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 1rem'
    }} />
    <p>{message}</p>
    <style jsx>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);
// Simple Empty State Component
const EmptyState = ({ title, description, actionLabel, onAction }) => (
  <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '8px' }}>
    <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📄</div>
    <h3 style={{ marginBottom: '0.5rem' }}>{title}</h3>
    <p style={{ color: '#6b7280', marginBottom: '2rem' }}>{description}</p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        style={{
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.375rem',
          cursor: 'pointer'
        }}
      >
        {actionLabel}
      </button>
    )}
  </div>
);
// Constants
const QUOTES_PER_PAGE = 12;
const FILTER_DEBOUNCE_DELAY = 300;
const QuoteResults = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, token, isAuthenticated } = useAuth();
  // Core state
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Action states
  const [actionLoading, setActionLoading] = useState({});
  // Filter and pagination state
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || 'all',
    search: searchParams.get('search') || '',
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  // Simple toast function
  const showToast = useCallback((message, type = 'info') => {
    console.log(`${type.toUpperCase()}: ${message}`);
    alert(`${message}`);
  }, []);
  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/quotes' } });
      return;
    }
  }, [isAuthenticated, navigate]);
  // Fetch quotes
  const fetchQuotes = useCallback(async () => {
    if (!user?.id || !token) return;
    try {
      setLoading(true);
      setError(null);
      const queryParams = new URLSearchParams({
        userId: user.id,
        page: pagination.currentPage.toString(),
        limit: QUOTES_PER_PAGE.toString(),
      });
      const response = await fetch(`/api/quotes/requests?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error(`Failed to fetch quotes: ${response.status}`);
      }
      const data = await response.json();
     
      // Extract quotes from quote requests
      const quotesData = [];
      const quoteRequests = data.quoteRequests || [];
     
      quoteRequests.forEach(request => {
        if (request.quotes && Array.isArray(request.quotes)) {
          request.quotes.forEach(quote => {
            if (quote && quote._id) {
              quotesData.push({
                ...quote,
                quoteRequestId: request._id,
                companyName: request.companyName,
                isActionable: ['generated', 'pending'].includes(quote.status)
              });
            }
          });
        }
      });
      setQuotes(quotesData);
      setPagination(prev => ({
        ...prev,
        totalItems: quotesData.length,
        totalPages: Math.ceil(quotesData.length / QUOTES_PER_PAGE)
      }));
    } catch (err) {
      console.error('Error fetching quotes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id, token, pagination.currentPage, navigate]);
  // Filter quotes
  const filteredQuotes = useMemo(() => {
    let filtered = [...quotes];
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(quote => quote.status === filters.status);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(quote =>
        (quote.vendor?.name?.toLowerCase() || '').includes(searchLower) ||
        (quote.productSummary?.manufacturer?.toLowerCase() || '').includes(searchLower)
      );
    }
    return filtered;
  }, [quotes, filters]);
  // Execute quote actions
  const executeQuoteAction = useCallback(async (quote, action, payload = {}) => {
    const actionKey = quote._id;
    setActionLoading(prev => ({ ...prev, [actionKey]: action }));
   
    try {
      const response = await fetch(`/api/quotes/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quoteId: quote._id,
          vendorName: quote.vendor?.name || 'Vendor',
          ...payload
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${action} quote`);
      }
      showToast(`Quote ${action}ed successfully!`, 'success');
      fetchQuotes(); // Refresh quotes
    } catch (err) {
      console.error(`Error ${action} quote:`, err);
      showToast(`Failed to ${action} quote: ${err.message}`, 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: null }));
    }
  }, [token, showToast, fetchQuotes]);
  // Action handlers
  const handleQuickAccept = useCallback(async (quote) => {
    const validation = validateQuoteAction(quote, 'accept');
    if (!validation.isValid) {
      showToast(validation.message, 'error');
      return;
    }
   
    if (window.confirm(`Accept quote from ${quote.vendor?.name || 'this vendor'}?`)) {
      await executeQuoteAction(quote, 'accept');
    }
  }, [executeQuoteAction, showToast]);
  const handleQuickDecline = useCallback(async (quote) => {
    const validation = validateQuoteAction(quote, 'decline');
    if (!validation.isValid) {
      showToast(validation.message, 'error');
      return;
    }
   
    if (window.confirm(`Decline quote from ${quote.vendor?.name || 'this vendor'}?`)) {
      await executeQuoteAction(quote, 'decline');
    }
  }, [executeQuoteAction, showToast]);
  // Initial fetch
  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);
  // Loading state
  if (loading && quotes.length === 0) {
    return (
      <div className="quote-results-container">
        <LoadingSpinner message="Loading your quotes..." />
      </div>
    );
  }
  // Error state
  if (error && quotes.length === 0) {
    return (
      <div className="quote-results-container">
        <div className="error-state">
          <h2>Error Loading Quotes</h2>
          <p>{error}</p>
          <button onClick={() => fetchQuotes()} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="quote-results-container">
      {/* Header */}
      <div className="results-header">
        <div className="header-content">
          <h1>Your Quotes</h1>
          <p>Review and manage your quotes</p>
        </div>
        <div className="header-actions">
          <button
            onClick={() => navigate('/quote-request')}
            className="btn-primary"
          >
            Request New Quotes
          </button>
        </div>
      </div>
      {/* Simple Filters */}
      <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="all">All Statuses</option>
            <option value="generated">Generated</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
         
          <input
            type="text"
            placeholder="Search quotes..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', flex: 1 }}
          />
        </div>
      </div>
      {/* Quote Cards */}
      {filteredQuotes.length === 0 ? (
        <EmptyState
          title="No quotes found"
          description="You don't have any quotes yet or none match your filters."
          actionLabel="Request Your First Quotes"
          onAction={() => navigate('/quote-request')}
        />
      ) : (
        <div className="quotes-grid">
          {filteredQuotes.map((quote) => (
            <div key={quote._id} className="quote-card">
              {/* Quote Header */}
              <div className="quote-card-header">
                <div className="vendor-info">
                  <h3 className="vendor-name">
                    {quote.vendor?.name || 'Unknown Vendor'}
                  </h3>
                  <div className="quote-meta">
                    <span className={`status-badge status-${quote.status}`}>
                      {quote.status || 'Unknown'}
                    </span>
                  </div>
                </div>
               
                {quote.aiScore && (
                  <div className="quote-score">
                    <span className="score-value">{quote.aiScore}%</span>
                    <span className="score-label">AI Score</span>
                  </div>
                )}
              </div>
              {/* Product Summary */}
              {quote.productSummary && (
                <div className="product-summary">
                  <h4 className="product-name">
                    {quote.productSummary.manufacturer} {quote.productSummary.model}
                  </h4>
                </div>
              )}
              {/* Cost Summary */}
              {quote.costs && (
                <div className="cost-summary">
                  <div className="monthly-cost">
                    <span className="cost-amount">
                      {formatCurrency(quote.costs.monthlyCosts?.totalMonthlyCost || 0)}
                    </span>
                    <span className="cost-period">/month</span>
                  </div>
                </div>
              )}
              {/* Actions */}
              <div className="quote-actions">
                {quote.isActionable ? (
                  <div className="action-buttons">
                    <button
                      onClick={() => handleQuickAccept(quote)}
                      disabled={actionLoading[quote._id] === 'accept'}
                      className="btn-accept-small"
                    >
                      {actionLoading[quote._id] === 'accept' ? 'Accepting...' : 'Accept'}
                    </button>
                    <button
                      onClick={() => handleQuickDecline(quote)}
                      disabled={actionLoading[quote._id] === 'decline'}
                      className="btn-decline-small"
                    >
                      {actionLoading[quote._id] === 'decline' ? 'Declining...' : 'Decline'}
                    </button>
                    <button
                      onClick={() => navigate(`/quote-details/${quote._id}`)}
                      className="btn-contact-small"
                    >
                      View Details
                    </button>
                  </div>
                ) : (
                  <div className="status-info">
                    <span className="status-text">
                      Quote {quote.status === 'accepted' ? 'Accepted' : 'Declined'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default QuoteResults;
