import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/QuotesResults.css';

// Hard-coded production URL to match your backend logs
const PRODUCTION_API_URL = 'https://ai-procurement-backend-q35u.onrender.com';

// Constants
const QUOTES_PER_PAGE = 12;

// ✅ FIXED: Loading spinner component (removed jsx styling)
const LoadingSpinner = ({ message = "Loading..." }) => {
  // Inject keyframes if not already present
  React.useEffect(() => {
    const styleId = 'spinner-keyframes';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
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
    </div>
  );
};

// Empty state component
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

const QuoteResults = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { auth } = useAuth();
  const isAuthenticated = auth?.isAuthenticated;
  const user = auth?.user;
  const token = auth?.token;

  const [quoteRequests, setQuoteRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(Date.now());
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || 'all',
    search: searchParams.get('search') || '',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/quotes' } });
    }
  }, [isAuthenticated, navigate]);

  // Fetch quotes (now fetches quote requests)
  const fetchQuotes = useCallback(async (silent = false) => {
    const userId = user?.userId || user?.id;
    if (!userId || !token) return;

    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);

      const queryParams = new URLSearchParams({
        userId: userId,
        submittedBy: userId,
        page: 1,
        limit: 50
      });

      const response = await fetch(`${PRODUCTION_API_URL}/api/quotes/requests?${queryParams}`, {
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
        throw new Error(`Failed to fetch quote requests: ${response.status}`);
      }

      const data = await response.json();
      setQuoteRequests(data.quoteRequests || []);
      setLastFetchTime(Date.now());

    } catch (err) {
      console.error('Error fetching quote requests:', err);
      setError(err.message);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [user?.userId, user?.id, token, navigate]);

  // ✅ FIXED: Polling with correct dependencies
  useEffect(() => {
    const hasProcessingRequests = quoteRequests.some(req => 
      req.status === 'pending' || 
      (req.aiAnalysis && !req.aiAnalysis.processed) ||
      req.status === 'processing'
    );

    let interval;
    if (hasProcessingRequests && quoteRequests.length > 0) {
      interval = setInterval(() => {
        fetchQuotes(true);
      }, 30000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [lastFetchTime, fetchQuotes, quoteRequests]); // ✅ Added fetchQuotes and quoteRequests

  // Initial fetch on component mount
  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  // Filter quote requests based on search and status
  const filteredQuoteRequests = useMemo(() => {
    let filtered = [...quoteRequests];

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(req => req.status === filters.status);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(req =>
        (req.companyName?.toLowerCase() || '').includes(searchLower)
      );
    }
    return filtered;
  }, [quoteRequests, filters]);

  // Get processing status message
  const getStatusMessage = (request) => {
    const quotesCount = request.quotes?.length || 0;
    
    if (request.status === 'processing' || (request.aiAnalysis && !request.aiAnalysis.processed)) {
      return 'AI matching in progress...';
    } else if (quotesCount === 0 && request.status === 'pending') {
      return 'Waiting for vendor responses...';
    } else if (quotesCount > 0) {
      return `${quotesCount} quote${quotesCount > 1 ? 's' : ''} received`;
    } else {
      return 'Processing...';
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-UK', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Unknown';
    }
  };
  // --- Render Logic ---
  if (loading) {
    return (
      <div className="quote-results-container">
        <LoadingSpinner message="Loading your quote requests..." />
      </div>
    );
  }

  if (error) {
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
          <h1>Your Quote Requests</h1>
          <p>Review and manage the status of your requests ({quoteRequests.length} total)</p>
        </div>
        <div className="header-actions">
          <button onClick={() => navigate('/quote-request')} className="btn-primary">
            Request New Quotes
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <input
            type="text"
            placeholder="Search by company name..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', flex: 1 }}
          />

          <button
            onClick={() => fetchQuotes()}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              border: '1px solid #ddd',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Quote request cards or empty state */}
      {filteredQuoteRequests.length === 0 ? (
        <EmptyState
          title="No requests found"
          description="You don't have any requests yet or none match your filters."
          actionLabel="Request Your First Quotes"
          onAction={() => navigate('/quote-request')}
        />
      ) : (
        <div className="quotes-grid">
          {filteredQuoteRequests.map(request => {
            const statusMessage = getStatusMessage(request);
            const quotesCount = request.quotes?.length || 0;

            return (
              <div key={request._id} className="quote-card">
                <div className="quote-card-header">
                  <div className="vendor-info">
                    <h3 className="vendor-name">{request.companyName || 'Unknown Company'}</h3>
                    <div className="quote-meta">
                      <span className={`status-badge status-${request.status}`}>
                        {request.status || 'Unknown'}
                      </span>
                      <span className="date-submitted">
                        {formatDate(request.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="product-summary">
                  <h4 className="product-name">
                    {request.serviceType || 'Photocopiers'} Request
                  </h4>
                  <div className="request-details">
                    <p className="monthly-cost">
                      <strong>Budget: £{request.budget?.maxLeasePrice || '0'}/month</strong>
                    </p>
                    <p className="volume-info">
                      Monthly Volume: {request.monthlyVolume?.total || 0} pages
                    </p>
                    {request.monthlyVolume && (
                      <p className="volume-breakdown">
                        ({request.monthlyVolume.mono || 0} mono, {request.monthlyVolume.colour || 0} colour)
                      </p>
                    )}
                  </div>
                </div>

                <div className="quote-actions">
                  <div className="status-info">
                    <span className={`status-text ${quotesCount > 0 ? 'has-quotes' : 'processing'}`}>
                      {statusMessage}
                    </span>
                  </div>
                  
                  {/* ✅ FIXED: Navigate to /compare-vendors with state */}
                  <div className="action-buttons">
                    {quotesCount > 0 && (
                      <button
                        onClick={() => navigate('/compare-vendors', { 
                          state: { 
                            quoteRequestId: request._id,
                            companyName: request.companyName,
                            serviceType: request.serviceType,
                            quotesCount: quotesCount
                          } 
                        })}
                        className="btn-contact-small"
                      >
                        Compare {quotesCount} Quote{quotesCount > 1 ? 's' : ''} →
                      </button>
                    )}
                    
                    <button
                      onClick={() => navigate(`/quote-request/${request._id}`)}
                      className="btn-secondary-small"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuoteResults;
