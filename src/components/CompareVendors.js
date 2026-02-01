import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./CompareVendors.css";
import { FaStar, FaStarHalfAlt, FaRegStar, FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import { motion } from "framer-motion";
import { debounce } from "lodash";
import { ErrorBoundary } from "react-error-boundary";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://ai-procurement-backend-q35u.onrender.com";

const CompareVendorsErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="error-fallback">
    <FaExclamationTriangle className="error-icon" />
    <h2>Unable to Load Quote Comparison</h2>
    <p className="error-message">{error.message}</p>
    <button onClick={resetErrorBoundary} className="retry-button">
      <FaSpinner className="button-icon" />
      Try Again
    </button>
    <button onClick={() => window.location.href = '/dashboard'} className="secondary-button">
      Return to Dashboard
    </button>
  </div>
);

const CompareVendors = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const quote = location.state?.quote;

  const quoteRequestId = location.state?.quoteRequestId;
  const passedCompanyName = location.state?.companyName;
  const passedQuotesCount = location.state?.quotesCount;

  const [vendors, setVendors] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [filters, setFilters] = useState({
    priceRange: [0, 10000],
    rating: 0,
    type: "",
    minSpeed: ""
  });
  const [sortBy, setSortBy] = useState("price");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quoteCompanyName, setQuoteCompanyName] = useState("");
  const [hasFetched, setHasFetched] = useState(false);
  const [isSubmittingQuotes, setIsSubmittingQuotes] = useState(false);
  const [recommendationType, setRecommendationType] = useState('user_generated_quotes');
  const [aiPowered, setAiPowered] = useState(true);

  useEffect(() => {
    if (!auth?.isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
  }, [navigate, auth?.isAuthenticated]);

  const fetchUserQuotes = useCallback(async () => {
    if (hasFetched || !auth?.token || !auth?.user?.userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const userId = auth.user.userId || auth.user.id;
      
      let endpoint;
      let fetchDescription;
      
      if (quoteRequestId) {
        endpoint = `${API_BASE_URL}/api/quotes/requests/${quoteRequestId}`;
        fetchDescription = `specific quote request: ${quoteRequestId}`;
      } else {
        endpoint = `${API_BASE_URL}/api/quotes/user/${userId}`;
        fetchDescription = `all quotes for user: ${userId}`;
      }

      const quotesResponse = await fetch(endpoint, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        },
      });

      if (!quotesResponse.ok) {
        if (quotesResponse.status === 401) {
          navigate('/login', { replace: true });
          return;
        }
        if (quotesResponse.status === 403) {
          throw new Error('Access denied. Please check your authentication.');
        }
        throw new Error(`Failed to fetch ${fetchDescription} (${quotesResponse.status})`);
      }

      const responseData = await quotesResponse.json();

      if (!responseData.success) {
        throw new Error(responseData.message || 'Failed to fetch quotes');
      }

      let quotes = [];
      let companyName = passedCompanyName || 'Your Company';
      
      if (quoteRequestId) {
        const quoteRequest = responseData.quoteRequest || responseData.data;
        quotes = quoteRequest?.quotes || [];
        companyName = quoteRequest?.companyName || passedCompanyName || 'Your Company';
      } else {
        quotes = responseData.quotes || [];
        companyName = quotes[0]?.companyName || 'Your Company';
      }

      if (quotes.length === 0) {
        setVendors([]);
        setQuoteCompanyName(companyName);
        setError(quoteRequestId 
          ? 'No quotes found for this request. The AI may still be generating matches. Please check back in a few minutes.'
          : 'No quotes found. Please submit a quote request first.'
        );
        setHasFetched(true);
        return;
      }

      const vendorsFromQuotes = quotes.map((quote, index) => {
        try {
          const vendor = quote.vendor || {};
          const product = quote.product || quote.productSummary || {};
          const costs = quote.costs || {};
          const monthlyPrices = costs.monthlyCosts || {};
          const matchScore = quote.matchScore || {};
          const recommendation = quote.recommendation || {};

          return {
            id: quote._id || `quote-${index}`,
            vendor: vendor.name || vendor.company || product.manufacturer || `Vendor ${index + 1}`,
            price: monthlyPrices.totalMonthlyCost || costs.totalMonthlyCost || 0,
            speed: product.speed || product.ppm || 0,
            rating: (matchScore.total || 0) * 5,
            website: vendor.website || '#',
            aiRecommendation: matchScore.reasoning?.[0] || "AI-generated quote",
            savingsInfo: matchScore.reasoning?.find(r => r.includes('savings')) || null,
            description: product.model ? `${product.manufacturer} ${product.model}` : 'Professional solution',
            features: product.features || [],
            paperSizes: product.paperSizes || [],
            contactInfo: {
              email: vendor.email || vendor.contactInfo?.email,
              phone: vendor.phone || vendor.contactInfo?.phone
            },
            quoteId: quote._id,
            matchScore: matchScore.total || 0,
            confidence: matchScore.confidence || 'Medium',
            monthlyBreakdown: {
              lease: monthlyPrices.leaseCost || 0,
              service: monthlyPrices.serviceCost || 0,
              cpc: monthlyPrices.totalCpcCost || 0,
              total: monthlyPrices.totalMonthlyCost || 0
            },
            leaseOptions: quote.leaseOptions || [],
            productDetails: product,
            vendorDetails: vendor,
            ranking: quote.ranking || index + 1,
            aiMatchScore: matchScore.total,
            aiConfidence: matchScore.confidence,
            aiReasoning: matchScore.reasoning || [],
            // NEW: AI recommendation enhancements
            whyRecommended: recommendation.whyRecommended || quote.whyRecommended || [],
            tradeoffs: recommendation.tradeoffs || quote.tradeoffs || [],
            tco3Year: costs.tco3Year || recommendation.costInfo?.tco3Year || 0,
            tco5Year: costs.tco5Year || recommendation.costInfo?.tco5Year || 0,
            serviceLevel: vendor.serviceLevel || product.service?.level || 'Standard',
            responseTime: vendor.responseTime || product.service?.responseTime || 'Next day',
            recommendationType: 'user_generated_quotes',
            isAiPowered: true,
            companyName: quote.companyName,
            monthlyVolume: quote.monthlyVolume
          };
        } catch (formatError) {
          console.warn(`⚠️ Error formatting quote ${index}:`, formatError, quote);
          return {
            id: `error-quote-${index}`,
            vendor: `Quote ${index + 1}`,
            price: 0,
            speed: 0,
            rating: 0,
            website: '#',
            aiRecommendation: "Error in quote data",
            savingsInfo: null,
            description: "Data formatting error",
            features: [],
            contactInfo: {},
            ranking: index + 1,
            recommendationType: 'error',
            isAiPowered: true
          };
        }
      });

      vendorsFromQuotes.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

      setVendors(vendorsFromQuotes);
      setQuoteCompanyName(companyName);
      setRecommendationType('user_generated_quotes');
      setAiPowered(true);
      setHasFetched(true);
    } catch (error) {
      console.error("❌ Error fetching quotes:", error);
      setError(error.message);
      setVendors([]);
      setQuoteCompanyName(passedCompanyName || 'Your Company');
      setRecommendationType('error');
      setAiPowered(false);
    } finally {
      setIsLoading(false);
    }
  }, [hasFetched, auth?.token, auth?.user?.userId, auth?.user?.id, navigate, quoteRequestId, passedCompanyName]);

  useEffect(() => {
    if (auth?.isAuthenticated) {
      fetchUserQuotes();
    }
  }, [fetchUserQuotes, auth?.isAuthenticated]);

  const debouncedSearch = useMemo(
    () => debounce((query) => {
      setSearchQuery(query);
    }, 300),
    []
  );

  const handleSearch = useCallback((query) => {
    debouncedSearch(query);
  }, [debouncedSearch]);

  const handleVendorSelect = useCallback((vendorId) => {
    setSelectedVendors((prev) =>
      prev.includes(vendorId)
        ? prev.filter((id) => id !== vendorId)
        : [...prev, vendorId]
    );
  }, []);

  const handleRequestQuotes = useCallback(async () => {
    if (selectedVendors.length === 0) {
      alert('Please select at least one quote to contact the vendor about.');
      return;
    }

    setIsSubmittingQuotes(true);

    try {
      const selectedQuotes = vendors.filter(v => selectedVendors.includes(v.id));
      const contactPromises = [];

      for (const quote of selectedQuotes) {
        const contactPromise = fetch(`${API_BASE_URL}/api/quotes/contact`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`
          },
          body: JSON.stringify({
            quoteId: quote.quoteId,
            vendorName: quote.vendor,
            message: `Customer inquiry about quote for ${quoteCompanyName}. Monthly volume: ${quote.monthlyVolume?.total || 'N/A'} pages.`
          }),
        });
        contactPromises.push(contactPromise);
      }

      const results = await Promise.allSettled(contactPromises);
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value.ok).length;
      const failureCount = results.length - successCount;

      if (successCount > 0) {
        alert(`Successfully contacted ${successCount} vendor(s) about your quotes!`);
        setSelectedVendors([]);
        
        setTimeout(() => {
          navigate('/quotes?status=contacted');
        }, 1500);
      } else {
        throw new Error(`Failed to contact vendors (${failureCount} failures)`);
      }
    } catch (error) {
      console.error("❌ Error contacting vendors:", error);
      alert(`Failed to contact vendors: ${error.message}. Please try again.`);
    } finally {
      setIsSubmittingQuotes(false);
    }
  }, [selectedVendors, vendors, quoteCompanyName, auth?.token, navigate]);

  const handleAcceptQuote = useCallback(async (vendorId) => {
    const vendor = vendors.find(v => v.id === vendorId);
    if (!vendor) return;

    if (!window.confirm(`Accept quote from ${vendor.vendor} for £${vendor.price?.toFixed(2)}/month?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/quotes/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          quoteId: vendor.quoteId,
          vendorName: vendor.vendor
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to accept quote: ${response.status}`);
      }

      alert(`Quote from ${vendor.vendor} accepted successfully!`);
      
      setHasFetched(false);
      fetchUserQuotes();
    } catch (error) {
      console.error("❌ Error accepting quote:", error);
      alert(`Failed to accept quote: ${error.message}`);
    }
  }, [vendors, auth?.token, fetchUserQuotes]);

  const filteredVendors = useMemo(() => {
    let list = [...vendors];

    if (searchQuery) {
      list = list.filter((v) =>
        v.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    list = list.filter((v) =>
      (v.price || 0) >= filters.priceRange[0] &&
      (v.price || 0) <= filters.priceRange[1]
    );

    if (filters.rating > 0) {
      list = list.filter((v) => (v.rating || 0) >= filters.rating);
    }

    if (filters.minSpeed) {
      list = list.filter((v) =>
        v.speed && v.speed >= parseInt(filters.minSpeed)
      );
    }

    list.sort((a, b) => {
      switch (sortBy) {
        case "price":
          return (a.price || 0) - (b.price || 0);
        case "speed":
          return (b.speed || 0) - (a.speed || 0);
        case "rating":
          return (b.matchScore || 0) - (a.matchScore || 0);
        default:
          return 0;
      }
    });

    return list;
  }, [vendors, searchQuery, filters, sortBy]);

  const renderStars = useCallback((rating) => {
    if (typeof rating !== "number" || rating < 0) {
      return <span className="rating-na">N/A</span>;
    }

    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <span className="star-rating">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className="star full-star" />
        ))}
        {halfStar && <FaStarHalfAlt className="star half-star" />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} className="star empty-star" />
        ))}
        <span className="rating-text">({rating.toFixed(1)})</span>
      </span>
    );
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <motion.div
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <FaSpinner />
        </motion.div>
        <p className="loading-text">Loading your AI-generated quotes...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={CompareVendorsErrorFallback}>
      <div className="compare-vendors-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="compare-vendors-title">
            Compare AI-Generated Quotes for {quoteCompanyName}
          </h1>

          <div className="vendors-info">
            <p>
              {filteredVendors.length > 0 ? (
                <>
                  We found {filteredVendors.length} AI-generated quote{filteredVendors.length !== 1 ? 's' : ''} for your requirements.
                  <span className="ai-badge">🤖 AI-Powered Matching</span>
                </>
              ) : (
                'No quotes available for comparison.'
              )}
            </p>
            {error && (
              <div className="warning-message">
                <FaExclamationTriangle />
                <span>{error}</span>
              </div>
            )}
          </div>

          {vendors.length === 0 ? (
            <div className="no-vendors-message">
              <h3>No quotes available for comparison</h3>
              <p>
                {error ? error : 'You need to submit a quote request first to get AI-generated quotes to compare.'}
              </p>
              <div className="no-vendors-actions">
                <button
                  className="secondary-button"
                  onClick={() => navigate('/quote-request')}
                >
                  Submit Quote Request
                </button>
                <button
                  className="secondary-button"
                  onClick={() => navigate('/quotes')}
                >
                  View All Quotes
                </button>
                <button
                  className="secondary-button"
                  onClick={() => window.location.reload()}
                >
                  Refresh
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="filters-section">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search quotes..."
                  onChange={(e) => handleSearch(e.target.value)}
                />

                <select
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="price">Sort by Price (Low to High)</option>
                  <option value="speed">Sort by Speed (High to Low)</option>
                  <option value="rating">Sort by Match Score (High to Low)</option>
                </select>

                <div className="price-filter">
                  <label>Max Price: £{filters.priceRange[1]}</label>
                  <input
                    type="range"
                    className="price-range"
                    min="0"
                    max="1000"
                    value={filters.priceRange[1]}
                    onChange={(e) =>
                      setFilters({ ...filters, priceRange: [0, parseInt(e.target.value)] })
                    }
                  />
                </div>

                <select
                  className="rating-filter"
                  value={filters.rating}
                  onChange={(e) => setFilters({ ...filters, rating: parseInt(e.target.value) })}
                >
                  <option value="0">All Match Scores</option>
                  <option value="3">3+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="5">5 Stars Only</option>
                </select>

                <input
                  type="number"
                  className="speed-filter"
                  placeholder="Min Speed (PPM)"
                  value={filters.minSpeed}
                  onChange={(e) => setFilters({ ...filters, minSpeed: e.target.value })}
                />
              </div>

              {filteredVendors.length === 0 ? (
                <div className="no-vendors-message">
                  <h3>No quotes match your current filters</h3>
                  <p>Try adjusting your search criteria.</p>
                  <button
                    className="secondary-button"
                    onClick={() => {
                      setFilters({
                        priceRange: [0, 1000],
                        rating: 0,
                        type: "",
                        minSpeed: ""
                      });
                      setSearchQuery("");
                    }}
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="comparison-table">
                    <table>
                      <thead>
                        <tr>
                          <th className="spec-column">Specification</th>
                          {filteredVendors.map((vendor) => (
                            <th key={vendor.id} className="vendor-column">
                              <div className={`vendor-header ${vendor.ranking === 1 ? 'best-match' : ''}`}>
                                <input
                                  type="checkbox"
                                  checked={selectedVendors.includes(vendor.id)}
                                  onChange={() => handleVendorSelect(vendor.id)}
                                  aria-label={`Select ${vendor.vendor}`}
                                />
                                <span className="vendor-name">
                                  {vendor.vendor}
                                  <span className="ai-indicator">🤖</span>
                                  {vendor.ranking === 1 && (
                                    <span className="best-match-badge">★ Best Match</span>
                                  )}
                                  <div className={`ranking-badge ${vendor.ranking === 1 ? 'rank-1' : ''}`}>
                                    Rank #{vendor.ranking}
                                  </div>
                                </span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="spec-label">Monthly Price</td>
                          {filteredVendors.map((vendor) => (
                            <td key={`${vendor.id}-price`} className="price-cell">
                              <strong>£{vendor.price?.toFixed(2) || 'N/A'}</strong>
                              {vendor.monthlyBreakdown && (
                                <div className="price-breakdown">
                                  <small>
                                    Lease: £{vendor.monthlyBreakdown.lease?.toFixed(2)}<br/>
                                    Service: £{vendor.monthlyBreakdown.service?.toFixed(2)}<br/>
                                    CPC: £{vendor.monthlyBreakdown.cpc?.toFixed(2)}
                                  </small>
                                </div>
                              )}
                            </td>
                          ))}
                        </tr>

                        <tr>
                          <td className="spec-label">Speed (PPM)</td>
                          {filteredVendors.map((vendor) => (
                            <td key={`${vendor.id}-speed`}>
                              {vendor.speed || 'N/A'}
                            </td>
                          ))}
                        </tr>

                        <tr>
                          <td className="spec-label">AI Match Score</td>
                          {filteredVendors.map((vendor) => (
                            <td key={`${vendor.id}-rating`}>
                              {renderStars(vendor.rating)}
                              <div className="match-score">
                                <small>
                                  {vendor.matchScore 
                                    ? `${(vendor.matchScore * 100).toFixed(1)}% match` 
                                    : 'N/A'}
                                </small>
                              </div>
                            </td>
                          ))}
                        </tr>

                        <tr>
                          <td className="spec-label">AI Recommendation</td>
                          {filteredVendors.map((vendor) => (
                            <td key={`${vendor.id}-ai`} className="ai-recommendation">
                              {vendor.aiRecommendation || 'AI-generated quote'}
                              <div className="ai-confidence">
                                <small>Confidence: {vendor.aiConfidence}</small>
                              </div>
                            </td>
                          ))}
                        </tr>

                        <tr>
                          <td className="spec-label">Product Details</td>
                          {filteredVendors.map((vendor) => (
                            <td key={`${vendor.id}-product`} className="product-details">
                              <div>{vendor.description}</div>
                              {vendor.features && vendor.features.length > 0 && (
                                <div className="features-list">
                                  <small>{vendor.features.slice(0, 3).join(', ')}</small>
                                </div>
                              )}
                            </td>
                          ))}
                        </tr>

                        {/* NEW: Why This Match */}
                        <tr>
                          <td className="spec-label">Why This Match</td>
                          {filteredVendors.map((vendor) => (
                            <td key={`${vendor.id}-why`} className="why-recommended">
                              {vendor.whyRecommended && vendor.whyRecommended.length > 0 ? (
                                <ul className="match-reasons">
                                  {vendor.whyRecommended.map((reason, idx) => (
                                    <li key={idx}>
                                      <span className="checkmark">✓</span> {reason}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <small>AI-generated recommendation</small>
                              )}
                            </td>
                          ))}
                        </tr>

                        {/* NEW: Tradeoffs (for rank 2-3) */}
                        {filteredVendors.some(v => v.tradeoffs && v.tradeoffs.length > 0) && (
                          <tr>
                            <td className="spec-label">vs Best Match</td>
                            {filteredVendors.map((vendor) => (
                              <td key={`${vendor.id}-tradeoffs`} className="tradeoffs">
                                {vendor.tradeoffs && vendor.tradeoffs.length > 0 ? (
                                  <ul className="tradeoffs-list">
                                    {vendor.tradeoffs.map((tradeoff, idx) => (
                                      <li key={idx}>
                                        <span className="comparison-icon">⚖️</span> {tradeoff}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  vendor.ranking === 1 ? (
                                    <span className="best-option">This is the best match</span>
                                  ) : (
                                    <small>-</small>
                                  )
                                )}
                              </td>
                            ))}
                          </tr>
                        )}

                        {/* NEW: Machine Specifications */}
                        <tr>
                          <td className="spec-label">Specifications</td>
                          {filteredVendors.map((vendor) => (
                            <td key={`${vendor.id}-specs`} className="machine-specs">
                              <div className="spec-item">
                                <strong>Speed:</strong> {vendor.speed || 'N/A'} ppm
                              </div>
                              {vendor.paperSizes && vendor.paperSizes.length > 0 && (
                                <div className="spec-item">
                                  <strong>Paper:</strong> {vendor.paperSizes.join(', ')}
                                </div>
                              )}
                              {vendor.features && vendor.features.length > 0 && (
                                <div className="spec-item">
                                  <strong>Features:</strong>
                                  <div className="features-grid">
                                    {vendor.features.slice(0, 6).map((feature, idx) => (
                                      <span key={idx} className="feature-badge">
                                        ✓ {feature}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </td>
                          ))}
                        </tr>

                        {/* NEW: TCO Comparison */}
                        {filteredVendors.some(v => v.tco3Year > 0 || v.tco5Year > 0) && (
                          <tr>
                            <td className="spec-label">Total Cost of Ownership</td>
                            {filteredVendors.map((vendor) => (
                              <td key={`${vendor.id}-tco`} className="tco-cell">
                                {vendor.tco3Year > 0 && (
                                  <div className="tco-item">
                                    <strong>3-Year Total:</strong> £{vendor.tco3Year.toLocaleString()}
                                  </div>
                                )}
                                {vendor.tco5Year > 0 && (
                                  <div className="tco-item">
                                    <strong>5-Year Total:</strong> £{vendor.tco5Year.toLocaleString()}
                                  </div>
                                )}
                                {vendor.tco3Year === 0 && vendor.tco5Year === 0 && (
                                  <small>Not available</small>
                                )}
                              </td>
                            ))}
                          </tr>
                        )}

                        {/* NEW: Vendor Details */}
                        <tr>
                          <td className="spec-label">Vendor Details</td>
                          {filteredVendors.map((vendor) => (
                            <td key={`${vendor.id}-vendor-details`} className="vendor-details">
                              <div className="vendor-info-item">
                                <strong>Company:</strong> {vendor.vendor}
                              </div>
                              {vendor.serviceLevel && (
                                <div className="vendor-info-item">
                                  <strong>Service Level:</strong> {vendor.serviceLevel}
                                </div>
                              )}
                              {vendor.responseTime && (
                                <div className="vendor-info-item">
                                  <strong>Response Time:</strong> {vendor.responseTime}
                                </div>
                              )}
                              {vendor.contactInfo?.email && (
                                <div className="vendor-info-item">
                                  <strong>Email:</strong> <a href={`mailto:${vendor.contactInfo.email}`}>{vendor.contactInfo.email}</a>
                                </div>
                              )}
                            </td>
                          ))}
                        </tr>

                        <tr>
                          <td className="spec-label">Actions</td>
                          {filteredVendors.map((vendor) => (
                            <td key={`${vendor.id}-actions`} className="actions-cell">
                              <button
                                className="accept-quote-btn"
                                onClick={() => handleAcceptQuote(vendor.id)}
                              >
                                Accept Quote
                              </button>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <motion.button
                    className="request-quote-button"
                    onClick={handleRequestQuotes}
                    disabled={selectedVendors.length === 0 || isSubmittingQuotes}
                    whileHover={{ scale: selectedVendors.length > 0 ? 1.02 : 1 }}
                    whileTap={{ scale: selectedVendors.length > 0 ? 0.98 : 1 }}
                  >
                    {isSubmittingQuotes ? (
                      <>
                        <FaSpinner className="fa-spin button-icon" />
                        Contacting Vendors...
                      </>
                    ) : (
                      <>
                        Contact Selected Vendors ({selectedVendors.length})
                      </>
                    )}
                  </motion.button>

                  {selectedVendors.length > 0 && (
                    <div className="selected-vendors-info">
                      <p>
                        Selected: {selectedVendors.map(id =>
                          vendors.find(v => v.id === id)?.vendor
                        ).join(', ')}
                      </p>
                    </div>
                  )}

                  {/* NEW: Alternatives suggestion banner */}
                  {(() => {
                    // Extract alternatives from metadata of any quote
                    const alternatives = filteredVendors[0]?.metadata?.alternatives ||
                                       filteredVendors.find(v => v.metadata?.alternatives)?.metadata?.alternatives;

                    return alternatives ? (
                      <motion.div
                        className="alternatives-banner"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <div className="banner-icon">💡</div>
                        <div className="banner-content">
                          <h4>Alternative Suggestion</h4>
                          <p>{alternatives}</p>
                        </div>
                      </motion.div>
                    ) : null;
                  })()}
                </>
              )}
            </>
          )}

          <div className="navigation-buttons">
            <button 
              className="secondary-button" 
              onClick={() => navigate('/quotes')}
            >
              ← Back to All Quotes
            </button>
            
            {quoteRequestId && (
              <button 
                className="secondary-button" 
                onClick={() => navigate(`/quote-request/${quoteRequestId}`)}
              >
                View Request Details
              </button>
            )}
            
            <button 
              className="secondary-button" 
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    </ErrorBoundary>
  );
};

export default CompareVendors;
