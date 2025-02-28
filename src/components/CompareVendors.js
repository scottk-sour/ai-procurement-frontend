import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./CompareVendors.css";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion"; // For animations
import { debounce } from "lodash"; // For performance optimization
import { ErrorBoundary } from "react-error-boundary"; // For error handling
import { useAnalytics } from "../utils/analytics"; // Custom hook for analytics (to be created)
import { useAIRecommendations } from "../utils/aiRecommendations"; // Custom hook for AI (to be created)

const CompareVendorsErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="error-fallback">
    <h2>❌ An error occurred while loading vendors</h2>
    <p>{error.message}</p>
    <button onClick={resetErrorBoundary} className="retry-button">
      Try Again
    </button>
  </div>
);

const CompareVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [filters, setFilters] = useState({
    priceRange: [0, 10000],
    rating: 0,
    location: "",
    serviceLevel: "",
  });
  const [sortBy, setSortBy] = useState("price");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const vendorsPerPage = 6;

  const analytics = useAnalytics(); // Track user interactions
  const { getAIRecommendations } = useAIRecommendations(); // AI-driven suggestions

  // ✅ Fetch Recommended Vendors from API with AI-driven suggestions
  useEffect(() => {
    const fetchVendors = async () => {
      setIsLoading(true);
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          console.error("❌ No userId found in localStorage");
          setIsLoading(false);
          return;
        }

        console.log(`📡 Fetching vendors for userId: ${userId}`);
        analytics.trackEvent("FetchVendors", { userId });

        const response = await fetch(
          `http://localhost:5000/api/quotes/user?userId=${userId}`
        );

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        console.log("🔍 API Response for Vendors:", JSON.stringify(data, null, 2));

        if (!data.quotes || !Array.isArray(data.quotes)) {
          console.error("❌ Invalid API response format:", data);
          setVendors([]);
          setIsLoading(false);
          return;
        }

        // Fetch AI recommendations
        const enhancedVendors = await getAIRecommendations(data.quotes, userId);
        setVendors(enhancedVendors);
        setIsLoading(false);
      } catch (error) {
        console.error("❌ Error fetching vendors:", error.message);
        setVendors([]);
        setIsLoading(false);
      }
    };

    fetchVendors();
  }, [analytics, getAIRecommendations]);

  // ✅ Debounced search handler for performance
  const handleSearch = useCallback(
    debounce((query) => {
      setSearchQuery(query);
      analytics.trackEvent("SearchVendors", { query });
    }, 300),
    [analytics]
  );

  // ✅ Handle Vendor Selection with animation feedback and analytics
  const handleVendorSelect = (vendorId) => {
    setSelectedVendors((prevSelected) =>
      prevSelected.includes(vendorId)
        ? prevSelected.filter((id) => id !== vendorId)
        : [...prevSelected, vendorId]
    );
    analytics.trackEvent("SelectVendor", { vendorId });
  };

  // ✅ Filter and Sort Vendors with performance optimization
  const filteredAndSortedVendors = useMemo(() => {
    let filtered = [...vendors];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((vendor) =>
        vendor.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply price range filter
    filtered = filtered.filter(
      (vendor) =>
        (vendor.price || 0) >= filters.priceRange[0] &&
        (vendor.price || 0) <= filters.priceRange[1]
    );

    // Apply rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(
        (vendor) => (vendor.rating || 0) >= filters.rating
      );
    }

    // Apply location and service level filters
    if (filters.location) {
      filtered = filtered.filter((vendor) =>
        vendor.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    if (filters.serviceLevel) {
      filtered = filtered.filter((vendor) =>
        vendor.serviceLevel
          ?.toLowerCase()
          .includes(filters.serviceLevel.toLowerCase())
      );
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      if (sortBy === "price") return (a.price || 0) - (b.price || 0);
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "responseTime")
        return (a.responseTime || Infinity) - (b.responseTime || Infinity);
      return 0;
    });
  }, [vendors, searchQuery, filters, sortBy]);

  // ✅ Pagination Logic
  const indexOfLastVendor = currentPage * vendorsPerPage;
  const indexOfFirstVendor = indexOfLastVendor - vendorsPerPage;
  const currentVendors = filteredAndSortedVendors.slice(
    indexOfFirstVendor,
    indexOfLastVendor
  );
  const totalPages = Math.ceil(filteredAndSortedVendors.length / vendorsPerPage);

  // ✅ Generate Star Ratings with accessibility
  const renderStars = (rating) => {
    if (typeof rating !== "number" || isNaN(rating) || rating < 0) {
      return <p style={{ color: "gray" }} aria-label="Rating not available">Not Available</p>;
    }

    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <div className="star-rating" role="img" aria-label={`Rating: ${rating} out of 5 stars`}>
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={i} className="star full-star" aria-hidden="true" />
        ))}
        {halfStar && <FaStarHalfAlt className="star half-star" aria-hidden="true" />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={i} className="star empty-star" aria-hidden="true" />
        ))}
      </div>
    );
  };

  // ✅ Loading State
  if (isLoading) {
    return (
      <div className="loading-container">
        <motion.div
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={CompareVendorsErrorFallback}>
      <div className="compare-vendors-container" role="main" aria-label="Vendor comparison tool">
        <h1 className="compare-vendors-title">Compare Top Vendors</h1>

        {/* Filters and Search */}
        <div className="filters-section" role="search">
          <input
            type="text"
            placeholder="Search vendors..."
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
            aria-label="Search vendors"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
            aria-label="Sort vendors"
          >
            <option value="price">Sort by Price</option>
            <option value="rating">Sort by Rating</option>
            <option value="responseTime">Sort by Response Time</option>
          </select>
          <input
            type="range"
            min="0"
            max="10000"
            value={filters.priceRange[1]}
            onChange={(e) =>
              setFilters({ ...filters, priceRange: [0, parseInt(e.target.value)] })
            }
            className="price-range"
            aria-label="Price range filter"
          />
          <select
            value={filters.rating}
            onChange={(e) =>
              setFilters({ ...filters, rating: parseInt(e.target.value) })
            }
            className="rating-filter"
            aria-label="Rating filter"
          >
            <option value="0">All Ratings</option>
            <option value="3">3 Stars & Up</option>
            <option value="4">4 Stars & Up</option>
            <option value="5">5 Stars</option>
          </select>
          <input
            type="text"
            placeholder="Filter by location..."
            value={filters.location}
            onChange={(e) =>
              setFilters({ ...filters, location: e.target.value })
            }
            className="location-filter"
            aria-label="Location filter"
          />
          <input
            type="text"
            placeholder="Filter by service level..."
            value={filters.serviceLevel}
            onChange={(e) =>
              setFilters({ ...filters, serviceLevel: e.target.value })
            }
            className="service-filter"
            aria-label="Service level filter"
          />
        </div>

        {vendors.length === 0 ? (
          <p className="no-vendors-message" role="alert">
            No vendors found. Try again later.
          </p>
        ) : (
          <>
            <motion.div
              className="vendor-cards"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              role="list"
            >
              <AnimatePresence>
                {currentVendors.map((vendor) => (
                  <motion.div
                    key={vendor._id}
                    className={`vendor-card ${
                      selectedVendors.includes(vendor._id) ? "selected" : ""
                    }`}
                    onClick={() => handleVendorSelect(vendor._id)}
                    onKeyPress={(e) => e.key === "Enter" && handleVendorSelect(vendor._id)} // Keyboard accessibility
                    tabIndex={0}
                    role="button"
                    aria-label={`Select ${vendor.name}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <h3>{vendor.name}</h3>
                    <p>
                      <strong>Price:</strong> £{vendor.price || "Not Available"}
                    </p>
                    <p>
                      <strong>Service Level:</strong>{" "}
                      {vendor.serviceLevel || "Not Available"}
                    </p>
                    <p>
                      <strong>Response Time:</strong>{" "}
                      {vendor.responseTime || "Not Available"} hrs
                    </p>
                    <p>
                      <strong>Location:</strong> {vendor.location || "Not Available"}
                    </p>
                    <p>
                      <strong>Years in Business:</strong>{" "}
                      {vendor.yearsInBusiness || "Not Available"}
                    </p>
                    <p>
                      <strong>Support:</strong> {vendor.support || "Not Available"}
                    </p>
                    <p>
                      <strong>Rating:</strong> {renderStars(vendor.rating)}
                    </p>
                    <p>
                      <strong>AI Recommendation:</strong> {vendor.aiRecommendation}
                    </p>
                    <motion.button
                      className="profile-button"
                      whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(249, 115, 22, 0.4)" }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={`View profile for ${vendor.name}`}
                    >
                      View Profile
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            <div className="pagination" role="navigation" aria-label="Pagination">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-button"
                aria-label="Previous page"
              >
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="pagination-button"
                aria-label="Next page"
              >
                Next
              </button>
            </div>

            {/* Request Quotes Action */}
            <motion.button
              className="request-quote-button"
              disabled={selectedVendors.length === 0}
              whileHover={{ scale: 1.05, boxShadow: "0 6px 16px rgba(230, 97, 0, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Request quotes from ${selectedVendors.length} selected vendors`}
            >
              Request Quotes from Selected ({selectedVendors.length})
            </motion.button>
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};

// Custom Hooks (to be created in utils folder)
const useAnalytics = () => {
  // Implementation for tracking events (e.g., using a service like Google Analytics or custom logging)
  const trackEvent = (event, data) => {
    console.log(`📊 Analytics Event: ${event}`, data);
    // Add actual analytics implementation here (e.g., fetch to backend or third-party service)
  };
  return { trackEvent };
};

const useAIRecommendations = () => {
  const getAIRecommendations = async (quotes, userId) => {
    // Simulate AI recommendations (replace with actual API call to TENDORAI's backend AI)
    const enhancedVendors = quotes.map((vendor) => ({
      ...vendor,
      aiRecommendation:
        Math.random() > 0.5
          ? "Highly Recommended for Your Needs"
          : "Good Match, Consider Reviewing",
    }));
    return enhancedVendors;
  };
  return { getAIRecommendations };
};

export default CompareVendors;