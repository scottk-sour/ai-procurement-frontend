import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./CompareVendors.css";
import { FaStar, FaStarHalfAlt, FaRegStar, FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import { motion } from "framer-motion";
import { debounce } from "lodash";
import { ErrorBoundary } from "react-error-boundary";
import { useAuth } from "../context/AuthContext";

// Production API URL - FIXED
const API_BASE_URL = process.env.REACT_APP_API_URL || "https://ai-procurement-backend-q35u.onrender.com";

const CompareVendorsErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="error-fallback">
    <FaExclamationTriangle className="error-icon" />
    <h2>Unable to Load Vendor Comparison</h2>
    <p className="error-message">{error.message}</p>
    <button onClick={resetErrorBoundary} className="retry-button">
      <FaSpinner className="button-icon" />
      Try Again
    </button>
    <button 
      onClick={() => window.location.href = '/dashboard'} 
      className="secondary-button"
    >
      Return to Dashboard
    </button>
  </div>
);

const CompareVendors = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const quote = location.state?.quote;

  // State management
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

  // Authentication check
  useEffect(() => {
    if (!auth?.isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
    
    if (!quote) {
      console.error("No quote data found - redirecting to request quote page");
      navigate("/request-quote", { replace: true });
      return;
    }
  }, [quote, navigate, auth?.isAuthenticated]);

  // Fetch vendors with improved error handling
  const fetchVendors = useCallback(async () => {
    if (hasFetched || !auth?.token || !auth?.user?.userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const userId = auth.user.userId || auth.user.id;
      
      console.log('🔍 Fetching vendor recommendations for user:', userId);
      
      const vendorsResponse = await fetch(`${API_BASE_URL}/api/vendors/recommend?userId=${userId}`, {
        method: 'GET',
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${auth.token}` 
        },
      });

      if (!vendorsResponse.ok) {
        if (vendorsResponse.status === 401) {
          navigate('/login', { replace: true });
          return;
        }
        throw new Error(`Failed to fetch vendor recommendations (${vendorsResponse.status})`);
      }
      
      const responseData = await vendorsResponse.json();
      console.log('📋 Vendor recommendations response:', responseData);
      
      const recommendations = responseData.recommendations || responseData.data || [];
      
      if (!Array.isArray(recommendations)) {
        throw new Error('Invalid recommendations data format');
      }

      const formattedVendors = recommendations.map((rec, index) => ({
        id: rec.id || `vendor-${index}`,
        vendor: rec.vendorName || rec.name || `Vendor ${index + 1}`,
        price: typeof rec.price === 'number' ? rec.price : parseFloat(rec.price) || 0,
        speed: typeof rec.speed === 'number' ? rec.speed : parseFloat(rec.speed) || 0,
        rating: rec.score ? Math.min(5, Math.max(0, (rec.score / 20))) : Math.random() * 2 + 3, // Score 0-100 mapped to 0-5 stars
        website: rec.website || '#',
        aiRecommendation: rec.aiRecommendation || "AI Recommended",
        savingsInfo: rec.savingsInfo || null,
        description: rec.description || '',
        features: rec.features || [],
        contactInfo: rec.contactInfo || {}
      }));

      setVendors(formattedVendors);
      setQuoteCompanyName(quote?.companyName || 'Your Company');
      setHasFetched(true);
      
      console.log('✅ Successfully loaded', formattedVendors.length, 'vendor recommendations');
      
    } catch (error) {
      console.error("❌ Error fetching vendor recommendations:", error);
      setError(error.message);
      
      // Fallback: Create mock vendors based on quote data
      const mockVendors = createMockVendors(quote);
      setVendors(mockVendors);
      setQuoteCompanyName(quote?.companyName || 'Your Company');
      
    } finally {
      setIsLoading(false);
    }
  }, [hasFetched, quote, auth?.token, auth?.user?.userId, navigate]);

  // Create mock vendors as fallback
  const createMockVendors = (quoteData) => {
    const basePrice = quoteData?.budget?.maxLeasePrice || 500;
    const serviceType = quoteData?.serviceType || 'Photocopiers';
    
    return [
      {
        id: 'mock-1',
        vendor: `${serviceType} Pro Solutions`,
        price: basePrice * 0.9,
        speed: 45,
        rating: 4.5,
        website: '#',
        aiRecommendation: "Best Value",
        savingsInfo: `Save £${Math.round(basePrice * 0.1)}/month`
      },
      {
        id: 'mock-2',
        vendor: `Premium ${serviceType} Services`,
        price: basePrice * 1.1,
        speed: 60,
        rating: 4.8,
        website: '#',
        aiRecommendation: "Premium Quality",
        savingsInfo: "Enterprise Grade"
      },
      {
        id: 'mock-3',
        vendor: `Budget ${serviceType} Solutions`,
        price: basePrice * 0.7,
        speed: 30,
        rating: 4.0,
        website: '#',
        aiRecommendation: "Budget Friendly",
        savingsInfo: `Save £${Math.round(basePrice * 0.3)}/month`
      }
    ];
  };

  useEffect(() => {
    if (auth?.isAuthenticated && quote) {
      fetchVendors();
    }
  }, [fetchVendors, auth?.isAuthenticated, quote]);

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((query) => {
      setSearchQuery(query);
    }, 300),
    []
  );

  const handleSearch = useCallback((query) => {
    debouncedSearch(query);
  }, [debouncedSearch]);

  // Vendor selection
  const handleVendorSelect = useCallback((vendorId) => {
    setSelectedVendors((prev) => 
      prev.includes(vendorId) 
        ? prev.filter((id) => id !== vendorId) 
        : [...prev, vendorId]
    );
  }, []);

  // Request quotes from selected vendors
  const handleRequestQuotes = useCallback(async () => {
    if (selectedVendors.length === 0) {
      alert('Please select at least one vendor to request quotes from.');
      return;
    }

    setIsSubmittingQuotes(true);
    
    try {
      const selectedVendorData = vendors.filter(v => selectedVendors.includes(v.id));
      
      const requestData = {
        quoteId: quote?._id,
        userId: auth?.user?.userId || auth?.user?.id,
        selectedVendors: selectedVendorData.map(v => ({
          vendorId: v.id,
          vendorName: v.vendor,
          price: v.price
        })),
        companyName: quoteCompanyName,
        serviceType: quote?.serviceType,
        requestSource: 'vendor_comparison'
      };

      console.log('📤 Submitting quote requests:', requestData);

      const response = await fetch(`${API_BASE_URL}/api/quotes/request-selected`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${auth.token}` 
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login', { replace: true });
          return;
        }
        throw new Error(`Quote request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Quote requests submitted successfully:', result);
      
      alert(`Successfully requested quotes from ${selectedVendors.length} vendor(s)!`);
      setSelectedVendors([]);
      
      // Navigate to quotes page to see results
      setTimeout(() => {
        navigate('/quotes?status=pending');
      }, 1500);
      
    } catch (error) {
      console.error("❌ Error requesting quotes:", error);
      alert(`Failed to request quotes: ${error.message}. Please try again.`);
    } finally {
      setIsSubmittingQuotes(false);
    }
  }, [selectedVendors, vendors, quote, quoteCompanyName, auth?.token, auth?.user, navigate]);

  // Filter and sort vendors
  const filteredVendors = useMemo(() => {
    let list = [...vendors];
    
    // Search filter
    if (searchQuery) {
      list = list.filter((v) => 
        v.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Price range filter
    list = list.filter((v) => 
      (v.price || 0) >= filters.priceRange[0] && 
      (v.price || 0) <= filters.priceRange[1]
    );
    
    // Rating filter
    if (filters.rating > 0) {
      list = list.filter((v) => (v.rating || 0) >= filters.rating);
    }
    
    // Speed filter
    if (filters.minSpeed) {
      list = list.filter((v) => 
        v.speed && v.speed >= parseInt(filters.minSpeed)
      );
    }
    
    // Sort
    list.sort((a, b) => {
      switch (sortBy) {
        case "price":
          return (a.price || 0) - (b.price || 0);
        case "speed":
          return (b.speed || 0) - (a.speed || 0);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });
    
    return list;
  }, [vendors, searchQuery, filters, sortBy]);

  // Render star rating
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

  // Loading state
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
        <p className="loading-text">Finding the best vendors for your requirements...</p>
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
            Compare Top Vendors for {quoteCompanyName}
          </h1>

          <div className="vendors-info">
            <p>
              We analyzed {vendors.length} vendors and found {filteredVendors.length} matches 
              {quote?.serviceType && ` for ${quote.serviceType}`}.
            </p>
            {error && (
              <div className="warning-message">
                <FaExclamationTriangle />
                <span>Using demo data due to API unavailability</span>
              </div>
            )}
          </div>

          <div className="filters-section">
            <input 
              type="text" 
              className="search-input"
              placeholder="Search vendors..." 
              onChange={(e) => handleSearch(e.target.value)} 
            />
            
            <select 
              className="sort-select"
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="price">Sort by Price (Low to High)</option>
              <option value="speed">Sort by Speed (High to Low)</option>
              <option value="rating">Sort by Rating (High to Low)</option>
            </select>
            
            <div className="price-filter">
              <label>Max Price: £{filters.priceRange[1]}</label>
              <input 
                type="range" 
                className="price-range"
                min="0" 
                max="10000" 
                value={filters.priceRange[1]} 
                onChange={(e) => setFilters({ 
                  ...filters, 
                  priceRange: [0, parseInt(e.target.value)] 
                })} 
              />
            </div>
            
            <select 
              className="rating-filter"
              value={filters.rating} 
              onChange={(e) => setFilters({ 
                ...filters, 
                rating: parseInt(e.target.value) 
              })}
            >
              <option value="0">All Ratings</option>
              <option value="3">3 Stars & Up</option>
              <option value="4">4 Stars & Up</option>
              <option value="5">5 Stars Only</option>
            </select>
            
            <input 
              type="number" 
              className="speed-filter"
              placeholder="Min Speed (PPM)" 
              value={filters.minSpeed} 
              onChange={(e) => setFilters({ 
                ...filters, 
                minSpeed: e.target.value 
              })} 
            />
          </div>

          {filteredVendors.length === 0 ? (
            <div className="no-vendors-message">
              <h3>No vendors match your current filters</h3>
              <p>Try adjusting your search criteria or submit a new quote request.</p>
              <button 
                className="secondary-button"
                onClick={() => {
                  setFilters({ priceRange: [0, 10000], rating: 0, type: "", minSpeed: "" });
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
                          <div className="vendor-header">
                            <input
                              type="checkbox"
                              checked={selectedVendors.includes(vendor.id)}
                              onChange={() => handleVendorSelect(vendor.id)}
                              aria-label={`Select ${vendor.vendor}`}
                            />
                            <span className="vendor-name">{vendor.vendor}</span>
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
                          £{vendor.price?.toFixed(2) || 'N/A'}
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
                      <td className="spec-label">Rating</td>
                      {filteredVendors.map((vendor) => (
                        <td key={`${vendor.id}-rating`}>
                          {renderStars(vendor.rating)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="spec-label">AI Recommendation</td>
                      {filteredVendors.map((vendor) => (
                        <td key={`${vendor.id}-ai`} className="ai-recommendation">
                          {vendor.aiRecommendation || 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="spec-label">Savings Info</td>
                      {filteredVendors.map((vendor) => (
                        <td key={`${vendor.id}-savings`} className="savings-info">
                          {vendor.savingsInfo || 'Standard pricing'}
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
                    Submitting Requests...
                  </>
                ) : (
                  <>
                    Request Quotes from Selected ({selectedVendors.length})
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
            </>
          )}

          <div className="navigation-buttons">
            <button 
              className="secondary-button"
              onClick={() => navigate('/quotes')}
            >
              Back to Quotes
            </button>
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
