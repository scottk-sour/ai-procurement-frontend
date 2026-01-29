// src/components/SearchResults.js
// Search results page with vendor cards and filters

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaFilter, FaSort, FaTimes, FaSpinner, FaExclamationCircle } from 'react-icons/fa';
import HeroSearch from './HeroSearch';
import VendorCard from './VendorCard';
import '../styles/SearchResults.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://ai-procurement-backend-q35u.onrender.com';

const SORT_OPTIONS = [
  { value: 'distance', label: 'Nearest First' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'tier', label: 'Premium First' },
];

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract search parameters
  const postcode = searchParams.get('postcode') || '';
  const category = searchParams.get('category') || '';
  const distance = searchParams.get('distance') || '50';

  // State
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    hasMore: false
  });
  const [sortBy, setSortBy] = useState('distance');
  const [showFilters, setShowFilters] = useState(false);
  const [searchInfo, setSearchInfo] = useState(null);

  // Fetch vendors
  const fetchVendors = useCallback(async (page = 1) => {
    if (!postcode) {
      setError('Please enter a postcode to search');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        postcode,
        distance,
        page: page.toString(),
        limit: '12'
      });

      if (category) {
        params.set('category', category);
      }

      const response = await fetch(`${API_BASE_URL}/api/public/vendors?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch vendors');
      }

      if (data.success) {
        setVendors(page === 1 ? data.data.vendors : [...vendors, ...data.data.vendors]);
        setPagination(data.data.pagination);
        setSearchInfo(data.data.search);
      } else {
        throw new Error(data.message || 'No vendors found');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to search. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [postcode, category, distance, vendors]);

  // Initial fetch
  useEffect(() => {
    fetchVendors(1);
  }, [postcode, category, distance]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle new search
  const handleSearch = ({ postcode: newPostcode, category: newCategory, distance: newDistance }) => {
    const params = new URLSearchParams();
    if (newPostcode) params.set('postcode', newPostcode);
    if (newCategory) params.set('category', newCategory);
    if (newDistance) params.set('distance', newDistance);
    setSearchParams(params);
  };

  // Handle quote request
  const handleQuoteRequest = (vendor) => {
    navigate('/quote-request', {
      state: {
        preselectedVendor: vendor.id,
        category: category || vendor.services?.[0]
      }
    });
  };

  // Load more
  const handleLoadMore = () => {
    if (pagination.hasMore && !loading) {
      fetchVendors(pagination.page + 1);
    }
  };

  // Sort vendors
  const sortedVendors = [...vendors].sort((a, b) => {
    switch (sortBy) {
      case 'distance':
        const distA = a.distance?.km ?? Infinity;
        const distB = b.distance?.km ?? Infinity;
        return distA - distB;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'tier':
        const tierOrder = { enterprise: 4, managed: 3, basic: 2, free: 1 };
        return (tierOrder[b.tier] || 0) - (tierOrder[a.tier] || 0);
      default:
        return 0;
    }
  });

  // SEO title
  const seoTitle = category
    ? `${category.charAt(0).toUpperCase() + category.slice(1)} Suppliers near ${postcode} | TendorAI`
    : `Business Suppliers near ${postcode} | TendorAI`;

  return (
    <div className="search-results">
      <Helmet>
        <title>{seoTitle}</title>
        <meta
          name="description"
          content={`Find verified ${category || 'business'} suppliers within ${distance}km of ${postcode}. Compare quotes and reviews from ${pagination.total} local suppliers.`}
        />
      </Helmet>

      {/* Search Header */}
      <div className="search-results__header">
        <div className="search-results__container">
          <HeroSearch
            variant="compact"
            initialPostcode={postcode}
            initialCategory={category}
            initialDistance={distance}
            onSearch={handleSearch}
          />
        </div>
      </div>

      {/* Results Section */}
      <div className="search-results__main">
        <div className="search-results__container">
          {/* Results Header */}
          <div className="search-results__toolbar">
            <div className="search-results__count">
              {loading ? (
                <span>Searching...</span>
              ) : (
                <>
                  <strong>{pagination.total}</strong> suppliers found
                  {searchInfo?.postcode && (
                    <span className="search-results__location">
                      within {searchInfo.maxDistance}km of {searchInfo.postcode}
                    </span>
                  )}
                </>
              )}
            </div>

            <div className="search-results__controls">
              {/* Sort */}
              <div className="search-results__sort">
                <FaSort />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="search-results__sort-select"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Toggle (Mobile) */}
              <button
                className="search-results__filter-toggle"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter />
                Filters
              </button>
            </div>
          </div>

          {/* Error State */}
          {error && !loading && (
            <div className="search-results__error">
              <FaExclamationCircle />
              <p>{error}</p>
              <button onClick={() => fetchVendors(1)}>Try Again</button>
            </div>
          )}

          {/* Loading State */}
          {loading && vendors.length === 0 && (
            <div className="search-results__loading">
              <FaSpinner className="search-results__spinner" />
              <p>Finding suppliers near you...</p>
            </div>
          )}

          {/* No Results */}
          {!loading && !error && vendors.length === 0 && (
            <div className="search-results__empty">
              <h2>No suppliers found</h2>
              <p>
                We couldn't find any suppliers matching your criteria.
                Try expanding your search radius or changing the category.
              </p>
            </div>
          )}

          {/* Results Grid */}
          {sortedVendors.length > 0 && (
            <div className="search-results__grid">
              {sortedVendors.map((vendor) => (
                <VendorCard
                  key={vendor.id}
                  vendor={vendor}
                  showDistance={!!searchInfo?.postcode}
                  onQuoteRequest={handleQuoteRequest}
                />
              ))}
            </div>
          )}

          {/* Load More */}
          {pagination.hasMore && (
            <div className="search-results__load-more">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="search-results__load-more-btn"
              >
                {loading ? (
                  <>
                    <FaSpinner className="search-results__spinner" />
                    Loading...
                  </>
                ) : (
                  `Load More (${pagination.total - vendors.length} remaining)`
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Overlay */}
      {showFilters && (
        <div className="search-results__filters-overlay">
          <div className="search-results__filters-content">
            <div className="search-results__filters-header">
              <h3>Filters</h3>
              <button onClick={() => setShowFilters(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="search-results__filters-body">
              <HeroSearch
                variant="default"
                initialPostcode={postcode}
                initialCategory={category}
                initialDistance={distance}
                onSearch={(params) => {
                  handleSearch(params);
                  setShowFilters(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
