import React, { useState, useEffect } from "react";
import "./CompareVendors.css";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const CompareVendors = () => {
  const [vendors, setVendors] = useState([]); 
  const [selectedVendors, setSelectedVendors] = useState([]);

  // ✅ Fetch Recommended Vendors from API
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          console.error("❌ No userId found in localStorage");
          return;
        }

        console.log(`📡 Fetching vendors for userId: ${userId}`);
        const response = await fetch(`http://localhost:5000/api/quotes/user?userId=${userId}`);

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        console.log("🔍 API Response for Vendors:", JSON.stringify(data, null, 2));

        if (!data.quotes || !Array.isArray(data.quotes)) {
          console.error("❌ Invalid API response format:", data);
          setVendors([]);
          return;
        }

        setVendors(data.quotes);
      } catch (error) {
        console.error("❌ Error fetching vendors:", error.message);
        setVendors([]);
      }
    };

    fetchVendors();
  }, []);

  // ✅ Handle Vendor Selection
  const handleVendorSelect = (vendorId) => {
    setSelectedVendors((prevSelected) =>
      prevSelected.includes(vendorId)
        ? prevSelected.filter((id) => id !== vendorId)
        : [...prevSelected, vendorId]
    );
  };

  // ✅ Generate Star Ratings (Fix `Invalid Array Length` Error)
  const renderStars = (rating) => {
    if (typeof rating !== "number" || isNaN(rating) || rating < 0) {
      console.error("❌ Invalid rating value:", rating);
      return <p style={{ color: "gray" }}>Not Available</p>;
    }

    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <>
        {[...Array(fullStars)].map((_, i) => <FaStar key={i} className="star full-star" />)}
        {halfStar && <FaStarHalfAlt className="star half-star" />}
        {[...Array(emptyStars)].map((_, i) => <FaRegStar key={i} className="star empty-star" />)}
      </>
    );
  };

  return (
    <div className="compare-vendors-container">
      <h2 className="compare-vendors-title">Compare Vendors</h2>

      {vendors.length === 0 ? (
        <p className="no-vendors-message">No vendors found. Try again later.</p>
      ) : (
        <div className="vendor-cards">
          {vendors.map((vendor) => (
            <div key={vendor._id} className={`vendor-card ${selectedVendors.includes(vendor._id) ? "selected" : ""}`} onClick={() => handleVendorSelect(vendor._id)}>
              <h3>{vendor.name}</h3>
              <p><strong>Price:</strong> £{vendor.price || "Not Available"}</p>
              <p><strong>Service Level:</strong> {vendor.serviceLevel || "Not Available"}</p>
              <p><strong>Response Time:</strong> {vendor.responseTime || "Not Available"} hrs</p>
              <p><strong>Location:</strong> {vendor.location || "Not Available"}</p>
              <p><strong>Years in Business:</strong> {vendor.yearsInBusiness || "Not Available"}</p>
              <p><strong>Support:</strong> {vendor.support || "Not Available"}</p>
              <p><strong>Rating:</strong> {renderStars(vendor.rating)}</p>
              <button className="profile-button">View Profile</button>
            </div>
          ))}
        </div>
      )}

      <button className="request-quote-button" disabled={selectedVendors.length === 0}>
        Request Quotes from Selected ({selectedVendors.length})
      </button>
    </div>
  );
};

export default CompareVendors;
