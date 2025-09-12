// components/QuoteResults.js - Production-ready version with enhanced features
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useAnalytics } from '../hooks/useAnalytics';
import { debounce } from '../utils/debounce';
import { formatCurrency, formatDate, formatRelativeTime } from '../utils/formatters';
import { validateQuoteAction } from '../utils/validators';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBoundary from '../components/common/ErrorBoundary';
import ConfirmationModal from '../components/common/ConfirmationModal';
import QuoteCard from '../components/quotes/QuoteCard';
import QuoteFilters from '../components/quotes/QuoteFilters';
import EmptyState from '../components/common/EmptyState';
import './QuoteResults.css';

// Constants
const QUOTES_PER_PAGE = 12;
const FILTER_DEBOUNCE_DELAY = 300;
const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds
const MAX_RETRY_ATTEMPTS = 3;

const QuoteResults = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, token, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { trackEvent } = useAnalytics();

  // Core state
  const [quotes, setQuotes] = useState([]);
  const [filteredQuotes, setFilteredQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Action states
  const [actionLoading, setActionLoading] = useState({});
  const [selectedQuotes, setSelectedQuotes] = useState(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Filter and pagination state
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || 'all',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
    search: searchParams.get('search') || '',
    vendor: searchParams.get('vendor') || 'all',
    priceRange: {
      min: searchParams.get('minPrice') || '',
      max: searchParams.get('maxPrice') || ''
    },
    urgency: searchParams.get('urgency') || 'all'
  });

  const [pagination, setPagination] = useState({
    currentPage: parseInt(searchParams.get('page')) || 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null,
    quote: null,
    message: '',
    onConfirm: null
  });

  // Refs
  const abortControllerRef = useRef(null);
  const autoRefreshRef = useRef(null);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/quotes' } });
      return;
    }
  }, [isAuthenticated, navigate]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'priceRange') {
        if (value.min) params.set('minPrice', value.min);
        if (value.max) params.set('maxPrice', value.max);
      } else if (value && value !== 'all' && value !== '') {
        params.set(key, value);
      }
    });
    if (pagination.currentPage > 1) {
      params.set('page', pagination.currentPage.toString());
    }
    setSearchParams(params, { replace: true });
  }, [filters, pagination.currentPage, setSearchParams]);

  // Fetch quotes with error handling and retry logic
  const fetchQuotes = useCallback(async (showLoadingState = true) => {
    if (!user?.id || !token) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    try {
      if (showLoadingState) {
        setLoading(true);
      }
      setError(null);

      // Build query parameters
      const queryParams = new URLSearchParams({
        userId: user.id,
        submittedBy: user.id,
        page: pagination.currentPage.toString(),
        limit: QUOTES_PER_PAGE.toString(),
        status: filters.status
      });

      // Remove empty params
      for (const [key, value] of queryParams.entries()) {
        if (!value || value === 'all' || value === '') {
          queryParams.delete(key);
        }
      }

      const response = await fetch(`/api/quotes/requests?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error(`Failed to fetch quote requests: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Validate response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format');
      }

      // Extract quotes from quote requests
      const quotesData = [];
      const quoteRequests = data.quoteRequests || [];
      quoteRequests.forEach(request => {
        if (request.quotes && Array.isArray(request.quotes)) {
          request.quotes.forEach(quote => {
            quotesData.push({
              ...quote,
              quoteRequestId: request._id,
              companyName: request.companyName,
              monthlyVolume: request.monthlyVolume,
              requestBudget: request.budget,
              isActionable: quote.status === 'generated' // Add actionable flag based on quote status
            });
          });
        }
      });

      console.log('📋 Extracted quotes:', quotesData); // Debug log

      const paginationData = data.pagination || {};
      setQuotes(quotesData);
      setPagination(prev => ({
        ...prev,
        totalPages: paginationData.totalPages || Math.ceil((paginationData.totalItems || quoteRequests.length) / QUOTES_PER_PAGE),
        totalItems: paginationData.totalItems || quoteRequests.length,
        hasNextPage: paginationData.hasNextPage || false,
        hasPrevPage: paginationData.hasPrevPage || false
      }));
      setRetryCount(0);

      // Track successful load
      trackEvent('quotes_loaded', {
        count: quotesData.length,
        filters: filters,
        page: pagination.currentPage
      });
    } catch (err) {
      if (err.name === 'AbortError') {
        return; // Request was cancelled
      }
      console.error('Error fetching quotes:', err);
      setError(err.message);

      // Retry logic
      if (retryCount < MAX_RETRY_ATTEMPTS) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchQuotes(false), 1000 * Math.pow(2, retryCount));
      }

      // Track error
      trackEvent('quotes_load_error', {
        error: err.message,
        retryCount: retryCount
      });
    } finally {
      if (showLoadingState) {
        setLoading(false);
      }
    }
  }, [user?.id, token, filters, pagination.currentPage, navigate, trackEvent, retryCount]);

  // Debounced filter change handler
  const debouncedFilterChange = useMemo(
    () => debounce((newFilters) => {
      setFilters(newFilters);
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    }, FILTER_DEBOUNCE_DELAY),
    []
  );

  // Filter quotes client-side for better UX
  useEffect(() => {
    let filtered = [...quotes];

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(quote => quote.status === filters.status);
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(quote =>
        quote.vendor?.name?.toLowerCase().includes(searchLower) ||
        quote.productSummary?.manufacturer?.toLowerCase().includes(searchLower) ||
        quote.productSummary?.model?.toLowerCase().includes(searchLower) ||
        quote._id.toLowerCase().includes(searchLower)
      );
    }

    // Apply vendor filter
    if (filters.vendor && filters.vendor !== 'all') {
      filtered = filtered.filter(quote => quote.vendor?.name === filters.vendor);
    }

    // Apply price range filter
    if (filters.priceRange.min || filters.priceRange.max) {
      const min = parseFloat(filters.priceRange.min) || 0;
      const max = parseFloat(filters.priceRange.max) || Infinity;
      filtered = filtered.filter(quote => {
        const price = quote.costs?.monthlyCosts?.totalMonthlyCost || 0;
        return price >= min && price <= max;
      });
    }

    // Apply urgency filter
    if (filters.urgency && filters.urgency !== 'all') {
      filtered = filtered.filter(quote => quote.quoteRequest?.urgency?.timeframe === filters.urgency);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
      switch (filters.sortBy) {
        case 'price':
          return sortOrder * ((a.costs?.monthlyCosts?.totalMonthlyCost || 0) - (b.costs?.monthlyCosts?.totalMonthlyCost || 0));
        case 'createdAt':
          return sortOrder * (new Date(a.createdAt) - new Date(b.createdAt));
        default:
          return 0;
      }
    });

    setFilteredQuotes(filtered);
  }, [quotes, filters]);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefreshRef.current) {
      clearInterval(autoRefreshRef.current);
    }
    autoRefreshRef.current = setInterval(() => {
      fetchQuotes(false); // Silent refresh
    }, AUTO_REFRESH_INTERVAL);
    return () => {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
      }
    };
  }, [fetchQuotes]);

  // Initial fetch
  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
      }
    };
  }, []);

  // Action handlers with improved error handling
  const handleQuickAccept = useCallback(async (quote) => {
    const validation = validateQuoteAction(quote, 'accept');
    if (!validation.isValid) {
      showToast(validation.message, 'error');
      return;
    }
    setConfirmModal({
      isOpen: true,
      type: 'accept',
      quote,
      message: `Accept quote from ${quote.vendor?.name || 'this vendor'}?\n\nMonthly Cost: ${formatCurrency(quote.costs?.monthlyCosts?.totalMonthlyCost)}\nProduct: ${quote.productSummary?.manufacturer} ${quote.productSummary?.model}\n\nAn order will be created and the vendor will contact you.`,
      onConfirm: () => executeQuoteAction(quote, 'accept')
    });
  }, [showToast]);

  const handleQuickDecline = useCallback(async (quote) => {
    const validation = validateQuoteAction(quote, 'decline');
    if (!validation.isValid) {
      showToast(validation.message, 'error');
      return;
    }
    const reason = prompt(
      'Please let us know why you\'re declining this quote (optional):\n\n' +
      'Common reasons:\n' +
      '• Price too high\n' +
      '• Found better alternative\n' +
      '• Requirements changed\n' +
      '• Budget constraints\n' +
      '• Timing not right'
    );

    if (reason === null) return; // User cancelled
    setConfirmModal({
      isOpen: true,
      type: 'decline',
      quote,
      message: `Decline quote from ${quote.vendor?.name || 'this vendor'}?`,
      onConfirm: () => executeQuoteAction(quote, 'decline', { reason })
    });
  }, [showToast]);

  const handleQuickContact = useCallback(async (quote) => {
    const message = prompt(
      `Send a message to ${quote.vendor?.name || 'the vendor'}:\n\n` +
      'You can ask questions about the product, request a demo, or discuss your requirements.'
    );

    if (!message?.trim()) return;
    await executeQuoteAction(quote, 'contact', { message });
  }, []);

  // Execute quote actions with proper error handling
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
      const data = await response.json();

      // Update local state optimistically
      if (action === 'accept') {
        setQuotes(prev => prev.map(q =>
          q._id === quote._id
            ? {
                ...q,
                status: 'accepted',
                statusDisplay: 'Accepted',
                decisionDetails: {
                  acceptedAt: new Date().toISOString(),
                  acceptedBy: user.id
                }
              }
            : q
        ));
        showToast(`Quote accepted! Order #${data.order?.id} created.`, 'success');
      } else if (action === 'decline') {
        setQuotes(prev => prev.map(q =>
          q._id === quote._id
            ? {
                ...q,
                status: 'rejected',
                statusDisplay: 'Declined',
                decisionDetails: {
                  rejectedAt: new Date().toISOString(),
                  rejectedBy: user.id,
                  rejectionReason: payload.reason || 'No reason provided'
                }
              }
            : q
        ));
        showToast('Quote declined successfully.', 'success');
      } else if (action === 'contact') {
        showToast('Message sent! The vendor will contact you within 2-4 hours.', 'success');
      }

      // Track action
      trackEvent(`quote_${action}`, {
        quoteId: quote._id,
        vendorName: quote.vendor?.name,
        cost: quote.costs?.monthlyCosts?.totalMonthlyCost
      });
    } catch (err) {
      console.error(`Error ${action} quote:`, err);
      showToast(`Failed to ${action} quote: ${err.message}`, 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: null }));
      setConfirmModal({ isOpen: false, type: null, quote: null, message: '', onConfirm: null });
    }
  }, [token, user.id, showToast, trackEvent]);

  // Bulk actions
  const handleBulkAction = useCallback(async (action) => {
    if (selectedQuotes.size === 0) {
      showToast('Please select quotes first', 'warning');
      return;
    }
    setBulkActionLoading(true);
    const promises = Array.from(selectedQuotes).map(quoteId => {
      const quote = quotes.find(q => q._id === quoteId);
      return quote ? executeQuoteAction(quote, action) : null;
    }).filter(Boolean);
    try {
      await Promise.allSettled(promises);
      setSelectedQuotes(new Set());
    } finally {
      setBulkActionLoading(false);
    }
  }, [selectedQuotes, quotes, executeQuoteAction, showToast]);

  // Selection handlers
  const handleSelectQuote = useCallback((quoteId) => {
    setSelectedQuotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(quoteId)) {
        newSet.delete(quoteId);
      } else {
        newSet.add(quoteId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const actionableQuotes = filteredQuotes.filter(q => q.isActionable);
    const allSelected = actionableQuotes.every(q => selectedQuotes.has(q._id));

    if (allSelected) {
      setSelectedQuotes(new Set());
    } else {
      setSelectedQuotes(new Set(actionableQuotes.map(q => q._id)));
    }
  }, [filteredQuotes, selectedQuotes]);

  // Filter handler
  const handleFilterChange = useCallback((newFilters) => {
    debouncedFilterChange(newFilters);
  }, [debouncedFilterChange]);

  // Pagination handlers
  const handlePageChange = useCallback((page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Memoized computed values
  const displayQuotes = useMemo(() => {
    return filteredQuotes.length > 0 ? filteredQuotes : quotes;
  }, [filteredQuotes, quotes]);

  const actionableQuotesCount = useMemo(() => {
    return displayQuotes.filter(q => q.isActionable).length;
  }, [displayQuotes]);

  const selectedQuotesCount = selectedQuotes.size;

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
          <div className="error-actions">
            <button onClick={() => fetchQuotes()} className="btn-primary">
              Try Again
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-secondary">
              Back to Dashboard
            </button>
          </div>
          {retryCount > 0 && (
            <p className="retry-info">Retry attempt {retryCount} of {MAX_RETRY_ATTEMPTS}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="quote-results-container">
        {/* Header */}
        <div className="results-header">
          <div className="header-content">
            <h1>Your Quotes</h1>
            <p>Review and manage your printer quotes</p>
            {pagination.totalItems > 0 && (
              <div className="results-summary">
                <span className="total-count">{pagination.totalItems} total quotes</span>
                {actionableQuotesCount > 0 && (
                  <span className="actionable-count">{actionableQuotesCount} actionable</span>
                )}
                {selectedQuotesCount > 0 && (
                  <span className="selected-count">{selectedQuotesCount} selected</span>
                )}
              </div>
            )}
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
        {/* Filters */}
        <QuoteFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          totalQuotes={pagination.totalItems}
          loading={loading}
        />
        {/* Bulk Actions */}
        {selectedQuotesCount > 0 && (
          <div className="bulk-actions-bar">
            <div className="bulk-actions-info">
              <span>{selectedQuotesCount} quote{selectedQuotesCount !== 1 ? 's' : ''} selected</span>
              <button
                onClick={() => setSelectedQuotes(new Set())}
                className="btn-clear-selection"
              >
                Clear Selection
              </button>
            </div>
            <div className="bulk-actions-buttons">
              <button
                onClick={() => handleBulkAction('accept')}
                disabled={bulkActionLoading}
                className="btn-bulk-accept"
              >
                {bulkActionLoading ? 'Processing...' : 'Accept Selected'}
              </button>
              <button
                onClick={() => handleBulkAction('decline')}
                disabled={bulkActionLoading}
                className="btn-bulk-decline"
              >
                {bulkActionLoading ? 'Processing...' : 'Decline Selected'}
              </button>
            </div>
          </div>
        )}
        {/* Quote Cards */}
        {displayQuotes.length === 0 ? (
          <EmptyState
            title="No quotes found"
            description={
              Object.values(filters).some(f => f && f !== 'all')
                ? "No quotes match your current filters. Try adjusting your search criteria."
                : "You don't have any quotes yet. Request quotes from vendors to see them here."
            }
            actionLabel={
              Object.values(filters).some(f => f && f !== 'all')
                ? "Clear Filters"
                : "Request Your First Quotes"
            }
            onAction={() => {
              if (Object.values(filters).some(f => f && f !== 'all')) {
                setFilters({
                  status: 'all',
                  sortBy: 'createdAt',
                  sortOrder: 'desc',
                  search: '',
                  vendor: 'all',
                  priceRange: { min: '', max: '' },
                  urgency: 'all'
                });
              } else {
                navigate('/quote-request');
              }
            }}
          />
        ) : (
          <>
            <div className="quotes-grid">
              {displayQuotes.map((quote) => (
                <QuoteCard
                  key={quote._id}
                  quote={quote}
                  isSelected={selectedQuotes.has(quote._id)}
                  onSelect={handleSelectQuote}
                  onQuickAccept={handleQuickAccept}
                  onQuickDecline={handleQuickDecline}
                  onQuickContact={handleQuickContact}
                  actionLoading={actionLoading[quote._id]}
                  showSelection={actionableQuotesCount > 1}
                />
              ))}
            </div>
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pagination-container">
                <div className="pagination-info">
                  Showing {((pagination.currentPage - 1) * QUOTES_PER_PAGE) + 1} to{' '}
                  {Math.min(pagination.currentPage * QUOTES_PER_PAGE, pagination.totalItems)} of{' '}
                  {pagination.totalItems} quotes
                </div>
                <div className="pagination-controls">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="btn-pagination"
                  >
                    Previous
                  </button>

                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const page = index + 1;
                    const isCurrentPage = page === pagination.currentPage;
                    const showPage =
                      page === 1 ||
                      page === pagination.totalPages ||
                      Math.abs(page - pagination.currentPage) <= 2;

                    if (!showPage) {
                      if (page === 2 || page === pagination.totalPages - 1) {
                        return <span key={page} className="pagination-ellipsis">...</span>;
                      }
                      return null;
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`btn-pagination ${isCurrentPage ? 'active' : ''}`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="btn-pagination"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          title={`${confirmModal.type === 'accept' ? 'Accept' : 'Decline'} Quote`}
          message={confirmModal.message}
          confirmLabel={confirmModal.type === 'accept' ? 'Accept Quote' : 'Decline Quote'}
          confirmVariant={confirmModal.type === 'accept' ? 'primary' : 'danger'}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal({ isOpen: false, type: null, quote: null, message: '', onConfirm: null })}
        />
        {/* Loading overlay for actions */}
        {Object.values(actionLoading).some(Boolean) && (
          <div className="action-loading-overlay">
            <LoadingSpinner size="small" message="Processing..." />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default QuoteResults;
