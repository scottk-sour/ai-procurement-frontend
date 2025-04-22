import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./CompareVendors.css";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { motion } from "framer-motion";
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
    type: "",
    minSpeed: "",
  });
  const [sortBy, setSortBy] = useState("price");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [quoteCompanyName, setQuoteCompanyName] = useState("");
  const [hasFetched, setHasFetched] = useState(false);

  const analytics = useAnalytics();

  const fetchVendors = useCallback(async () => {
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

      const quotes = await quotesResponse.json();
      console.log("🔍 API Response for Quotes:", JSON.stringify(quotes, null, 2));

      if (!Array.isArray(quotes) || quotes.length === 0) {
        console.error("❌ No valid quotes found for user");
        setVendors([]);
        setIsLoading(false);
        return;
      }

      const latestQuote = quotes.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )[0];
      setQuoteCompanyName(latestQuote.companyName);
      console.log("🔍 Latest Quote:", JSON.stringify(latestQuote, null, 2));

      const searchParams = new URLSearchParams({
        maxLeaseCost: latestQuote.max_lease_price,
        minMonoCpc: 0,
        minColorCpc: latestQuote.colour === "Color" ? 0 : undefined,
        ...(latestQuote.type && { type: latestQuote.type }),
        ...(latestQuote.min_speed && { minSpeed: latestQuote.min_speed }),
      }).toString();

      const vendorsResponse = await fetch(
        `http://localhost:5000/api/vendors/search-quotes?${searchParams}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!vendorsResponse.ok) {
        throw new Error(`Search API responded with status: ${vendorsResponse.status}`);
      }

      const vendorQuotes = await vendorsResponse.json();
      console.log("🔍 Vendor Quotes:", JSON.stringify(vendorQuotes.quotes, null, 2));

      const enhancedVendors = vendorQuotes.quotes.map((quote) => ({
        vendor: quote.company,
        price: quote.leaseCost,
        rating: 0,
        aiRecommendation: "Recommended by AI",
        speed: quote.speed || null,
        model: quote.model,
        type: quote.type || "N/A",
        monoCpc: quote.monoCpc !== undefined ? quote.monoCpc : "N/A",
        colorCpc: quote.colorCpc !== undefined ? quote.colorCpc : "N/A",
        provider: quote.provider || "Unknown",
        vendorId: quote.vendorId,
      }));

      console.log("🔍 Setting vendors state with:", enhancedVendors.length, "vendors");
      setVendors(enhancedVendors);
      setHasFetched(true);
    } catch (error) {
      console.error("❌ Error fetching vendors:", error.message);
      setVendors([]);
    } finally {
      setIsLoading(false);
    }
  }, [analytics, hasFetched]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const debouncedSearch = useMemo(
    () =>
      debounce((query) => {
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

  const handleRequestQuotes = useCallback(async () => {
    if (selectedVendors.length === 0) return;

    console.log("📤 Requesting quotes for vendors:", selectedVendors);
    analytics.trackEvent("RequestQuotes", { selectedVendors });

    try {
      const userId = localStorage.getItem("userId");
      const token = getAuthToken();
      const response = await fetch("http://localhost:5000/api/quotes/request-selected", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          selectedVendors: selectedVendors,
          quoteCompanyName: quoteCompanyName,
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

  const filteredVendors = useMemo(() => {
    let filtered = [...vendors];
    console.log("🔍 Filtering vendors, initial count:", filtered.length);

    if (searchQuery) {
      filtered = filtered.filter((vendor) =>
        (vendor.vendor || "").toLowerCase().includes(searchQuery.toLowerCase())
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

    if (filters.type) {
      filtered = filtered.filter((vendor) =>
        (vendor.type || "").toLowerCase() === filters.type.toLowerCase()
      );
      console.log("🔍 After type filter:", filtered.length);
    }

    if (filters.minSpeed) {
      filtered = filtered.filter((vendor) =>
        vendor.speed ? vendor.speed >= parseInt(filters.minSpeed) : false
      );
      console.log("🔍 After minSpeed filter:", filtered.length);
    }

    return filtered.sort((a, b) => {
      if (sortBy === "price") return (Number(a.price) || 0) - (Number(b.price) || 0);
      if (sortBy === "speed") return (b.speed || 0) - (a.speed || 0);
      return 0;
    });
  }, [vendors, searchQuery, filters, sortBy]);

  const renderStars = (rating) => {
    if (typeof rating !== "number" || isNaN(rating) || rating < 0) {
      return <span style={{ color: "gray" }}>N/A</span>;
    }

    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <span className="star-rating" role="img" aria-label={`Rating: ${rating} out of 5 stars`}>
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

  console.log("🔍 Render: vendors:", JSON.stringify(filteredVendors, null, 2));
  console.log("🔍 Render: Entering render phase with vendors length:", filteredVendors.length);

  return (
    <ErrorBoundary FallbackComponent={CompareVendorsErrorFallback}>
      <div className="compare-vendors-container" role="main" aria-label="Vendor comparison tool">
        <h1 className="compare-vendors-title">Compare Top Vendors for {quoteCompanyName}</h1>

        {/* New info message */}
        <div className="vendors-info">
          <p>
            We cross-referenced {vendors.length} companies and found {filteredVendors.length} that match your criteria.
          </p>
        </div>

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
            <option value="speed">Sort by Speed</option>
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
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="type-filter"
          >
            <option value="">All Types</option>
            <option value="A4">A4</option>
            <option value="A3">A3</option>
          </select>
          <input
            type="number"
            placeholder="Min Speed (PPM)"
            value={filters.minSpeed}
            onChange={(e) => setFilters({ ...filters, minSpeed: e.target.value })}
            className="speed-filter"
          />
        </div>

        {filteredVendors.length === 0 ? (
          <div className="no-vendors-message" role="alert" aria-label="No vendors available">
            No vendors found for this quote. Try submitting a new quote request or adjusting filters.
          </div>
        ) : (
          <>
            <div className="comparison-table">
              <table>
                <thead>
                  <tr>
                    <th>Specification</th>
                    {filteredVendors.map((vendor) => (
                      <th key={`${vendor.vendorId}-${vendor.model}`}>
                        <input
                          type="checkbox"
                          checked={selectedVendors.includes(vendor.vendorId)}
                          onChange={() => handleVendorSelect(vendor.vendorId)}
                        />
                        {vendor.vendor}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Model</td>
                    {filteredVendors.map((vendor) => (
                      <td key={`${vendor.vendorId}-${vendor.model}`}>{vendor.model || "N/A"}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Type</td>
                    {filteredVendors.map((vendor) => (
                      <td key={`${vendor.vendorId}-${vendor.model}`}>{vendor.type || "N/A"}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Speed (PPM)</td>
                    {filteredVendors.map((vendor) => (
                      <td key={`${vendor.vendorId}-${vendor.model}`}>
                        {vendor.speed ? `${vendor.speed} PPM` : "N/A"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Price (£)</td>
                    {filteredVendors.map((vendor) => (
                      <td key={`${vendor.vendorId}-${vendor.model}`}>
                        £{vendor.price || "N/A"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td title="Cost per black-and-white copy in pence">Mono CPC (p)</td>
                    {filteredVendors.map((vendor) => (
                      <td key={`${vendor.vendorId}-${vendor.model}`} title="Cost per black-and-white copy in pence">
                        {vendor.monoCpc !== "N/A" ? `${vendor.monoCpc} p` : "N/A"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td title="Cost per color copy in pence">Color CPC (p)</td>
                    {filteredVendors.map((vendor) => (
                      <td key={`${vendor.vendorId}-${vendor.model}`} title="Cost per color copy in pence">
                        {vendor.colorCpc !== "N/A" ? `${vendor.colorCpc} p` : "N/A"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Provider</td>
                    {filteredVendors.map((vendor) => (
                      <td key={`${vendor.vendorId}-${vendor.model}`}>{vendor.provider || "N/A"}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Rating</td>
                    {filteredVendors.map((vendor) => (
                      <td key={`${vendor.vendorId}-${vendor.model}`}>{renderStars(vendor.rating)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>AI Recommendation</td>
                    {filteredVendors.map((vendor) => (
                      <td key={`${vendor.vendorId}-${vendor.model}`}>
                        {vendor.aiRecommendation || "N/A"}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <motion.button
              className="request-quote-button"
              onClick={handleRequestQuotes}
              disabled={selectedVendors.length === 0}
              whileHover={{ scale: 1.05, boxShadow: "0 6px 16px rgba(37, 99, 235, 0.5)" }}
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
