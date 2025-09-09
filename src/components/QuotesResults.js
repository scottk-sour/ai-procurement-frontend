import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, 
  FiFilter, 
  FiRefreshCw, 
  FiPlus, 
  FiEye, 
  FiBarChart3,
  FiCalendar,
  FiDollarSign,
  FiBuilding,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle
} from 'react-icons/fi';
import { getAuthToken } from '../utils/auth';
import { useAnalytics } from '../utils/analytics';
import './QuotesResults.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://ai-procurement-backend-q35u.onrender.com';

const QuotesResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const analytics = useAnalytics();

  // State management
  const [quotes, setQuotes] = useState([]);
  const [filteredQuotes, setFilteredQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [retryCount, setRetryCount] = useState(0);

  // URL state
  const status = searchParams.get('status') || 'all';
  const page = parseInt(searchParams.get('page')) || 1;

  // Constants
  const ITEMS_PER_PAGE = 12;
  const MAX_RETRY_ATTEMPTS = 3;

  const statusConfig = useMemo(() => ({
    all: { label: 'All Quotes', icon: FiBarChart3, color: '#6b7280' },
    pending: { label: 'Pending', icon: FiClock, color: '#f59e0b' },
    matched: { label: 'Matched', icon: FiCheckCircle, color: '#10b981' },
    completed: { label: 'Completed', icon: FiCheckCircle, color: '#3b82f6' },
    rejected: { label: 'Rejected', icon: FiXCircle, color: '#ef4444' }
  }), []);

  // Fetch quotes with retry logic
  const fetchQuotes = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const token = getAuthToken();
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        throw new Error('Authentication required');
      }

      const queryParams = new URLSearchParams({
        userId,
        page: page.toString(),
        limit: '50',
        ...(status !== 'all' && { status })
      });

      const response = await fetch(
        `${API_BASE_URL}/api/quotes/requests?${queryParams}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch quotes: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const quotesData = data.requests || data.quotes || data.data || [];
      
      setQuotes(quotesData);
      setRetryCount(0);
      
      // Analytics tracking
      analytics.trackEvent('QuotesViewed', { 
        status, 
        count: quotesData.length,
        page 
      });

    } catch (err) {
      console.error('Error fetching quotes:', err);
      setError(err.message);
      
      // Auto-retry with exponential backoff
      if (retryCount < MAX_RETRY_ATTEMPTS) {
        const retryDelay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchQuotes(isRefresh);
        }, retryDelay);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [status, page, navigate, analytics, retryCount]);

  // Filter and sort quotes
  useEffect(() => {
    let filtered = [...quotes];
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(quote => 
        quote.companyName?.toLowerCase().includes(query) ||
        quote.serviceType?.toLowerCase().includes(query) ||
        quote.category?.toLowerCase().includes(query) ||
        quote.description?.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'oldest':
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case 'price-high':
          return (b.estimatedPrice || 0) - (a.estimatedPrice || 0);
        case 'price-low':
          return (a.estimatedPrice || 0) - (b.estimatedPrice || 0);
        case 'company':
          return (a.companyName || '').localeCompare(b.companyName || '');
        default:
          return 0;
      }
    });

    setFilteredQuotes(filtered);
  }, [quotes, searchQuery, sortBy]);

  // Fetch data on mount and dependency changes
  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  // URL state management
  const updateURL = useCallback((newStatus, newPage = 1) => {
    const params = new URLSearchParams();
    if (newStatus !== 'all') params.set('status', newStatus);
    if (newPage !== 1) params.set('page', newPage.toString());
    setSearchParams(params);
  }, [setSearchParams]);

  // Event handlers
  const handleStatusChange = useCallback((newStatus) => {
    analytics.trackEvent('QuoteFilterChanged', { from: status, to: newStatus });
    updateURL(newStatus);
  }, [status, analytics, updateURL]);

  const handleRefresh = useCallback(() => {
    analytics.trackEvent('QuotesRefreshed', { status });
    fetchQuotes(true);
  }, [fetchQuotes, status, analytics]);

  const handleQuoteClick = useCallback((quote) => {
    analytics.trackEvent('QuoteViewed', { 
      quoteId: quote._id, 
      status: quote.status,
      source: 'quotes-list'
    });
    navigate(`/quotes/${quote._id}`);
  }, [navigate, analytics]);

  const handleCompareVendors = useCallback((quote) => {
    analytics.trackEvent('CompareVendorsClicked', { 
      quoteId: quote._id,
      vendorCount: quote.matchedVendors?.length || 0
    });
    navigate('/compare-vendors', { state: { quote } });
  }, [navigate, analytics]);

  // Status badge component
  const StatusBadge = ({ status: quoteStatus }) => {
    const config = statusConfig[quoteStatus] || statusConfig.all;
    const Icon = config.icon;
    
    return (
      <span 
        className="status-badge"
        style={{ backgroundColor: config.color }}
      >
        <Icon size={12} />
        {quoteStatus?.toUpperCase() || 'UNKNOWN'}
      </span>
    );
  };

  // Quote card component
  const QuoteCard = ({ quote, index }) => (
    <motion.div
      className="quote-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)' }}
    >
      <div className="quote-card-header">
        <div className="quote-title-section">
          <h3 className="quote-title">
            {quote.companyName || quote.title || 'Quote Request'}
          </h3>
          <StatusBadge status={quote.status} />
        </div>
        <div className="quote-meta">
          <span className="quote-id">#{quote._id?.slice(-6) || 'N/A'}</span>
        </div>
      </div>
      
      <div className="quote-details">
        <div className="detail-row">
          <FiBuilding className="detail-icon" />
          <span className="detail-label">Company:</span>
          <span className="detail-value">{quote.companyName || 'N/A'}</span>
        </div>
        
        <div className="detail-row">
          <FiBarChart3 className="detail-icon" />
          <span className="detail-label">Service:</span>
          <span className="detail-value">{quote.serviceType || quote.category || 'N/A'}</span>
        </div>
        
        {quote.estimatedPrice && (
          <div className="detail-row">
            <FiDollarSign className="detail-icon" />
            <span className="detail-label">Est. Price:</span>
            <span className="detail-value price">£{quote.estimatedPrice.toLocaleString()}</span>
          </div>
        )}
        
        <div className="detail-row">
          <FiCalendar className="detail-icon" />
          <span className="detail-label">Submitted:</span>
          <span className="detail-value">
            {quote.createdAt 
              ? new Date(quote.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })
              : 'Unknown'
            }
          </span>
        </div>
        
        {quote.matchedVendors && quote.matchedVendors.length > 0 && (
          <div className="matched-vendors">
            <div className="vendors-header">
              <FiCheckCircle className="detail-icon success" />
              <span className="vendors-count">
                {quote.matchedVendors.length} Vendor{quote.matchedVendors.length !== 1 ? 's' : ''} Matched
              </span>
            </div>
            <div className="vendors-preview">
              {quote.matchedVendors.slice(0, 2).map((vendor, idx) => (
                <div key={idx} className="vendor-preview">
                  <span className="vendor-name">{vendor.vendorName}</span>
                  <span className="vendor-price">£{vendor.price?.toLocaleString()}</span>
                </div>
              ))}
              {quote.matchedVendors.length > 2 && (
                <span className="vendor-more">+{quote.matchedVendors.length - 2} more</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="quote-actions">
        <motion.button 
          className="action-button secondary"
          onClick={() => handleQuoteClick(quote)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiEye size={16} />
          View Details
        </motion.button>
        
        {quote.status === 'matched' && quote.matchedVendors?.length > 0 && (
          <motion.button 
            className="action-button primary"
            onClick={() => handleCompareVendors(quote)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiBarChart3 size={16} />
            Compare Vendors
          </motion.button>
        )}
      </div>
    </motion.div>
  );

  // Loading state
  if (loading && !refreshing) {
    return (
      <div className="quotes-container">
        <div className="loading-state">
          <motion.div
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <FiRefreshCw size={32} />
          </motion.div>
          <p>Loading your quotes...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !loading) {
    return (
      <div className="quotes-container">
        <div className="error-state">
          <FiAlertCircle size={48} className="error-icon" />
          <h3>Unable to load quotes</h3>
          <p>{error}</p>
          {retryCount < MAX_RETRY_ATTEMPTS && (
            <p className="retry-info">Retrying automatically... ({retryCount + 1}/{MAX_RETRY_ATTEMPTS})</p>
          )}
          <motion.button 
            className="action-button primary"
            onClick={() => fetchQuotes()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiRefreshCw size={16} />
            Try Again
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="quotes-container">
      {/* Header */}
      <div className="quotes-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Quote Requests</h1>
            <p className="header-subtitle">
              Manage and track your procurement quotes
            </p>
          </div>
          <div className="header-actions">
            <motion.button 
              className="action-button secondary"
              onClick={handleRefresh}
              disabled={refreshing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: "linear" }}
              >
                <FiRefreshCw size={16} />
              </motion.div>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </motion.button>
            
            <motion.button 
              className="action-button primary"
              onClick={() => navigate('/request-quote')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiPlus size={16} />
              New Quote Request
            </motion.button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="quotes-controls">
        {/* Filter Tabs */}
        <div className="filter-tabs">
          {Object.entries(statusConfig).map(([key, config]) => {
            const Icon = config.icon;
            const isActive = status === key;
            const count = key === 'all' ? quotes.length : quotes.filter(q => q.status === key).length;
            
            return (
              <motion.button
                key={key}
                className={`filter-tab ${isActive ? 'active' : ''}`}
                onClick={() => handleStatusChange(key)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon size={16} />
                {config.label}
                {count > 0 && <span className="count-badge">{count}</span>}
              </motion.button>
            );
          })}
        </div>

        {/* Search and Sort */}
        <div className="search-sort-controls">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search quotes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="sort-controls">
            <FiFilter className="sort-icon" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-high">Price: High to Low</option>
              <option value="price-low">Price: Low to High</option>
              <option value="company">Company A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="quotes-content">
        <AnimatePresence mode="wait">
          {filteredQuotes.length === 0 ? (
            <motion.div
              key="empty"
              className="empty-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <FiBarChart3 size={64} className="empty-icon" />
              <h3>No quotes found</h3>
              <p>
                {searchQuery 
                  ? `No quotes match "${searchQuery}". Try adjusting your search.`
                  : status === 'all' 
                    ? "You haven't submitted any quote requests yet." 
                    : `No ${status} quotes found.`
                }
              </p>
              {!searchQuery && (
                <motion.button 
                  className="action-button primary"
                  onClick={() => navigate('/request-quote')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiPlus size={16} />
                  Submit Your First Quote Request
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="quotes"
              className="quotes-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {filteredQuotes.map((quote, index) => (
                <QuoteCard key={quote._id || index} quote={quote} index={index} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Summary */}
      {filteredQuotes.length > 0 && (
        <div className="results-summary">
          <p>
            Showing {filteredQuotes.length} of {quotes.length} quote{quotes.length !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
      )}
    </div>
  );
};

export default QuotesResults;
