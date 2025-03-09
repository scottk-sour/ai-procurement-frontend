import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./CompareVendors.css";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { debounce } from "lodash";
import { ErrorBoundary } from "react-error-boundary";
import { useAnalytics } from "../utils/analytics";
import { getAuthToken } from "../utils/auth";

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
  const [quoteCompanyName, setQuoteCompanyName] = useState("");
  const [hasFetched, setHasFetched] = useState(false);
  const vendorsPerPage = 6;

  const analytics = useAnalytics();

  const fetchVendors = async () => {
    if (hasFetched) {
      console.log("🔍 Skipping redundant fetch");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      const token = getAuthToken();
      if (!userId || !token) {
        console.error("❌ No userId or token found in localStorage");
        setIsLoading(false);
        return;
      }

      console.log(`📡 Fetching quotes for userId: ${userId}`);
      analytics.trackEvent("FetchVendors", { userId });

      const quotesResponse = await fetch(
        `http://localhost:5000/api/quotes/user?userId=${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!quotesResponse.ok) {
        throw new Error(`Server responded with status: ${quotesResponse.status}`);
      }

      const data = await quotesResponse.json();
      console.log("🔍 API Response for Quotes:", JSON.stringify(data, null, 2));

      if (!Array.isArray(data)) {
        console.error("❌ Invalid API response format:", data);
        setVendors([]);
        setIsLoading(false);
        return;
      }

      if (data.length === 0) {
        console.log("🔍 No quotes found for user");
        setVendors([]);
        setIsLoading(false);
        return;
      }

      const validQuotes = data.filter(
        (quote) => quote.preferredVendor && typeof quote.preferredVendor === "string"
      );
      if (validQuotes.length === 0) {
        console.error("❌ No quotes with preferred vendors found");
        setVendors([]);
        setIsLoading(false);
        return;
      }

      const latestQuote = validQuotes.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )[0];
      setQuoteCompanyName(latestQuote.companyName);
      console.log("🔍 Latest Quote:", JSON.stringify(latestQuote, null, 2));

      // Fetch AI recommendations from backend API
      const aiResponse = await fetch("http://localhost:5000/api/quotes/ai/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quotes: validQuotes, userId }),
      });
      if (!aiResponse.ok) {
        throw new Error(`AI API responded with status: ${aiResponse.status}`);
      }
      const enhancedVendors = await aiResponse.json();
      console.log("🔍 Enhanced Vendors:", JSON.stringify(enhancedVendors, null, 2));
      console.log("🔍 Setting vendors state with:", enhancedVendors.length, "vendors");
      setVendors(enhancedVendors || []);
      setHasFetched(true);
    } catch (error) {
      console.error("❌ Error fetching vendors:", error.message);
      setVendors([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const debouncedSearch = useMemo(
    () => debounce((query) => {
      setSearchQuery(query);
      analytics.trackEvent("SearchVendors", { query });
    }, 300),
    [analytics]
  );

  const handleSearch = useCallback((query) => debouncedSearch(query), [debouncedSearch]);

  const handleVendorSelect = useCallback(
    (vendorId) => {
      setSelectedVendors((prevSelected) =>
        prevSelected.includes(vendorId)
          ? prevSelected.filter((id) => id !== vendorId)
          : [...prevSelected, vendorId]
      );
      analytics.trackEvent("SelectVendor", { vendorId });
    },
    [analytics]
  );

  const handleVisitWebsite = useCallback(
    (website) => {
      if (!website) {
        console.error("❌ No website URL provided for vendor");
        return;
      }
      console.log(`🔍 Visiting website: ${website}`);
      analytics.trackEvent("VisitVendorWebsite", { website });
      window.open(website, "_blank", "noopener,noreferrer");
    },
    [analytics]
  );

  const handleRequestQuotes = useCallback(async () => {
    if (selectedVendors.length === 0) return;

    console.log("📤 Requesting quotes for vendors:", selectedVendors);
    analytics.trackEvent("RequestQuotes", { selectedVendors });

    try {
      const userId = localStorage.getItem("userId");
      const token = getAuthToken();
      const response = await fetch("http://localhost:5000/api/quotes/request-selected", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          selectedVendors,
          quoteCompanyName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Quote request response:", data);
      alert("Quotes requested successfully!");
      setSelectedVendors([]);
    } catch (error) {
      console.error("❌ Error requesting quotes:", error.message);
      alert("Failed to request quotes. Please try again.");
    }
  }, [selectedVendors, quoteCompanyName, analytics]);

  const filteredAndSortedVendors = useMemo(() => {
    let filtered = [...vendors];
    console.log("🔍 Filtering vendors, initial count:", filtered.length);

    if (searchQuery) {
      filtered = filtered.filter((vendor) =>
        (vendor.name || vendor.vendor || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
      console.log("🔍 After searchQuery filter:", filtered.length);
    }

    filtered = filtered.filter(
      (vendor) =>
        (Number(vendor.price) || 0) >= filters.priceRange[0] &&
        (Number(vendor.price) || 0) <= filters.priceRange[1]
    );
    console.log("🔍 After priceRange filter:", filtered.length);

    if (filters.rating > 0) {
      filtered = filtered.filter((vendor) => (vendor.rating || 0) >= filters.rating);
      console.log("🔍 After rating filter:", filtered.length);
    }

    if (filters.location) {
      filtered = filtered.filter((vendor) =>
        (vendor.location || "").toLowerCase().includes(filters.location.toLowerCase())
      );
      console.log("🔍 After location filter:", filtered.length);
    }

    if (filters.serviceLevel) {
      filtered = filtered.filter((vendor) =>
        (vendor.serviceLevel || "").toLowerCase().includes(filters.serviceLevel.toLowerCase())
      );
      console.log("🔍 After serviceLevel filter:", filtered.length);
    }

    return filtered.sort((a, b) => {
      if (sortBy === "price") return (Number(a.price) || 0) - (Number(b.price) || 0);
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "responseTime")
        return (a.responseTime || Infinity) - (b.responseTime || Infinity);
      return 0;
    });
  }, [vendors, searchQuery, filters, sortBy]);

  const indexOfLastVendor = currentPage * vendorsPerPage;
  const indexOfFirstVendor = indexOfLastVendor - vendorsPerPage;
  const currentVendors = filteredAndSortedVendors.slice(indexOfFirstVendor, indexOfLastVendor);
  const totalPages = Math.ceil(filteredAndSortedVendors.length / vendorsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const renderStars = (rating) => {
    if (typeof rating !== "number" || isNaN(rating) || rating < 0) {
      return <span style={{ color: "gray" }}>Not Available</span>;
    }

    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <span
        className="star-rating"
        role="img"
        aria-label={`Rating: ${rating} out of 5 stars`}
      >
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className="star full-star" />
        ))}
        {halfStar && <FaStarHalfAlt className="star half-star" />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} className="star empty-star" />
        ))}
      </span>
    );
  };

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

  console.log("🔍 Render: vendors:", JSON.stringify(vendors, null, 2));
  console.log("🔍 Render: filteredAndSortedVendors:", JSON.stringify(filteredAndSortedVendors, null, 2));
  console.log("🔍 Render: currentVendors:", JSON.stringify(currentVendors, null, 2));
  console.log("🔍 Render: Entering render phase with vendors length:", vendors.length);

  return (
    <ErrorBoundary FallbackComponent={CompareVendorsErrorFallback}>
      <div className="compare-vendors-container" role="main" aria-label="Vendor comparison tool">
        <h1 className="compare-vendors-title">Compare Top Vendors</h1>

        <div className="filters-section" role="search" aria-label="Vendor filters and search">
          <input
            type="text"
            placeholder="Search vendors..."
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
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
          />
          <select
            value={filters.rating}
            onChange={(e) => setFilters({ ...filters, rating: parseInt(e.target.value) })}
            className="rating-filter"
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
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            className="location-filter"
          />
          <input
            type="text"
            placeholder="Filter by service level..."
            value={filters.serviceLevel}
            onChange={(e) => setFilters({ ...filters, serviceLevel: e.target.value })}
            className="service-filter"
          />
        </div>

        {currentVendors.length === 0 ? (
          <div className="no-vendors-message" role="alert" aria-label="No vendors available">
            No vendors found for this quote. Try submitting a new quote request or adjusting filters.
          </div>
        ) : (
          <>
            <motion.div
              className="vendor-cards"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              role="list"
              aria-label="Vendor list"
            >
              <AnimatePresence>
                {currentVendors.map((vendor, index) => (
                  <motion.div
                    key={vendor.vendor || index}
                    className={`vendor-card ${
                      selectedVendors.includes(vendor.vendor) ? "selected" : ""
                    }`}
                    onClick={() => handleVendorSelect(vendor.vendor)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleVendorSelect(vendor.vendor)
                    }
                    tabIndex={0}
                    role="button"
                    aria-label={`Select vendor ${vendor.vendor}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <h2>{quoteCompanyName || "Vendor Recommendations"}</h2>
                    <span><strong>Vendor Name:</strong> {vendor.vendor || "Not Available"}</span>
                    <span><strong>Price:</strong> £{vendor.price || "Not Available"}</span>
                    <span><strong>Speed:</strong> {vendor.speed || "N/A"} ppm</span>
                    <span><strong>Rating:</strong> {renderStars(vendor.rating)}</span>
                    <span><strong>AI Recommendation:</strong> {vendor.aiRecommendation || "Not Available"}</span>
                    <motion.button
                      className="profile-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVisitWebsite(vendor.website);
                      }}
                      whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(249, 115, 22, 0.4)" }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={`Visit website for ${vendor.vendor}`}
                    >
                      Visit Website
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            <div className="pagination" role="navigation" aria-label="Pagination">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Next
              </button>
            </div>

            <motion.button
              className="request-quote-button"
              onClick={handleRequestQuotes}
              disabled={selectedVendors.length === 0}
              whileHover={{ scale: 1.05, boxShadow: "0 6px 16px rgba(230, 97, 0, 0.5)" }}
              whileTap={{ scale: 0.95 }}
            >
              Request Quotes from Selected ({selectedVendors.length})
            </motion.button>
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default CompareVendors;