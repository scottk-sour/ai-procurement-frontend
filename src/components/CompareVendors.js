import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  const location = useLocation();
  const navigate = useNavigate();
  const quote = location.state?.quote;

  const [vendors, setVendors] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [filters, setFilters] = useState({ priceRange: [0, 10000], rating: 0, type: "", minSpeed: "" });
  const [sortBy, setSortBy] = useState("price");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [quoteCompanyName, setQuoteCompanyName] = useState("");
  const [hasFetched, setHasFetched] = useState(false);

  const analytics = useAnalytics();

  useEffect(() => {
    if (!quote) {
      console.error("No quote found - redirecting.");
      navigate("/request-quote");
    }
  }, [quote, navigate]);

  const fetchVendors = useCallback(async () => {
    if (hasFetched) return;
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const userId = localStorage.getItem("userId");
      if (!token || !userId) throw new Error("Missing authentication or user ID.");

      const vendorsResponse = await fetch(`http://localhost:5000/api/vendors/recommend?userId=${userId}`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      if (!vendorsResponse.ok) throw new Error(`Vendor recommendation failed: ${vendorsResponse.status}`);
      const { recommendations } = await vendorsResponse.json();

      setVendors(recommendations.map((rec) => ({
        vendor: rec.vendorName,
        price: rec.price,
        speed: rec.speed,
        rating: rec.score ? (rec.score / 20).toFixed(1) : 0, // Score 0-100 mapped to 0-5 stars
        website: rec.website,
        aiRecommendation: "Recommended by AI",
        savingsInfo: rec.savingsInfo,
      })));

      setQuoteCompanyName(quote.companyName);
      setHasFetched(true);
    } catch (error) {
      console.error("❌ Error fetching AI vendor recommendations:", error.message);
      setVendors([]);
    } finally {
      setIsLoading(false);
    }
  }, [hasFetched, quote]);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  const debouncedSearch = useMemo(() => debounce((query) => {
    setSearchQuery(query);
    analytics.trackEvent("SearchVendors", { query });
  }, 300), [analytics]);

  const handleSearch = useCallback((query) => debouncedSearch(query), [debouncedSearch]);

  const handleVendorSelect = useCallback((vendorName) => {
    setSelectedVendors((prev) => 
      prev.includes(vendorName) ? prev.filter((v) => v !== vendorName) : [...prev, vendorName]
    );
    analytics.trackEvent("SelectVendor", { vendorName });
  }, [analytics]);

  const handleRequestQuotes = useCallback(async () => {
    if (selectedVendors.length === 0) return;
    try {
      const userId = localStorage.getItem("userId");
      const token = getAuthToken();
      const response = await fetch("http://localhost:5000/api/quotes/request-selected", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, selectedVendors, quoteCompanyName }),
      });
      if (!response.ok) throw new Error(`Quote request failed: ${response.status}`);
      await response.json();
      alert("Quotes requested successfully!");
      setSelectedVendors([]);
    } catch (error) {
      console.error("❌ Error requesting quotes:", error.message);
      alert("Failed to request quotes. Please try again.");
    }
  }, [selectedVendors, quoteCompanyName]);

  const filteredVendors = useMemo(() => {
    let list = [...vendors];
    if (searchQuery) list = list.filter((v) => v.vendor?.toLowerCase().includes(searchQuery.toLowerCase()));
    list = list.filter((v) => (v.price ?? 0) >= filters.priceRange[0] && (v.price ?? 0) <= filters.priceRange[1]);
    if (filters.rating > 0) list = list.filter((v) => (v.rating ?? 0) >= filters.rating);
    if (filters.minSpeed) list = list.filter((v) => v.speed && v.speed >= parseInt(filters.minSpeed));
    return list.sort((a, b) => sortBy === "price" ? (a.price ?? 0) - (b.price ?? 0) : (b.speed ?? 0) - (a.speed ?? 0));
  }, [vendors, searchQuery, filters, sortBy]);

  const renderStars = (rating) => {
    if (typeof rating !== "number" || rating < 0) return <span style={{ color: "gray" }}>N/A</span>;
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (
      <span className="star-rating">
        {[...Array(fullStars)].map((_, i) => <FaStar key={`full-${i}`} className="star full-star" />)}
        {halfStar && <FaStarHalfAlt className="star half-star" />}
        {[...Array(emptyStars)].map((_, i) => <FaRegStar key={`empty-${i}`} className="star empty-star" />)}
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

  return (
    <ErrorBoundary FallbackComponent={CompareVendorsErrorFallback}>
      <div className="compare-vendors-container">
        <h1>Compare Top Vendors for {quoteCompanyName}</h1>

        <div className="vendors-info">
          <p>We cross-referenced {vendors.length} vendors and found {filteredVendors.length} matches.</p>
        </div>

        <div className="filters-section">
          <input type="text" placeholder="Search vendors..." onChange={(e) => handleSearch(e.target.value)} />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="price">Sort by Price</option>
            <option value="speed">Sort by Speed</option>
          </select>
          <input type="range" min="0" max="10000" value={filters.priceRange[1]} onChange={(e) => setFilters({ ...filters, priceRange: [0, parseInt(e.target.value)] })} />
          <select value={filters.rating} onChange={(e) => setFilters({ ...filters, rating: parseInt(e.target.value) })}>
            <option value="0">All Ratings</option>
            <option value="3">3 Stars & Up</option>
            <option value="4">4 Stars & Up</option>
            <option value="5">5 Stars</option>
          </select>
          <input type="number" placeholder="Min Speed (PPM)" value={filters.minSpeed} onChange={(e) => setFilters({ ...filters, minSpeed: e.target.value })} />
        </div>

        {filteredVendors.length === 0 ? (
          <div className="no-vendors-message">No vendors found. Adjust filters or submit a new quote.</div>
        ) : (
          <>
            <div className="comparison-table">
              <table>
                <thead>
                  <tr>
                    <th>Specification</th>
                    {filteredVendors.map((vendor) => (
                      <th key={vendor.vendor}>
                        <input
                          type="checkbox"
                          checked={selectedVendors.includes(vendor.vendor)}
                          onChange={() => handleVendorSelect(vendor.vendor)}
                        />
                        {vendor.vendor}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {["price", "speed", "rating", "aiRecommendation", "website"].map((field) => (
                    <tr key={field}>
                      <td>{field === "aiRecommendation" ? "Recommended?" : field.charAt(0).toUpperCase() + field.slice(1)}</td>
                      {filteredVendors.map((vendor) => (
                        <td key={`${vendor.vendor}-${field}`}>
                          {field === "rating"
                            ? renderStars(vendor.rating)
                            : field === "price"
                            ? `£${vendor.price}`
                            : vendor[field] ?? "N/A"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <motion.button
              className="request-quote-button"
              onClick={handleRequestQuotes}
              disabled={selectedVendors.length === 0}
              whileHover={{ scale: 1.05 }}
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
