import React, { useState } from 'react';
import './CompareVendors.css';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const CompareVendors = () => {
  const [vendors] = useState([
    {
      name: "Vendor A",
      price: 100,
      serviceLevel: "Standard",
      responseTime: 24,
      rating: 4.5,
      location: "London, UK",
      yearsInBusiness: 10,
      support: "9AM - 6PM",
      logo: "/assets/vendorA.png"
    },
    {
      name: "Vendor B",
      price: 120,
      serviceLevel: "Premium",
      responseTime: 12,
      rating: 4.8,
      location: "Manchester, UK",
      yearsInBusiness: 8,
      support: "24/7",
      logo: "/assets/vendorB.png"
    },
    {
      name: "Vendor C",
      price: 90,
      serviceLevel: "Basic",
      responseTime: 48,
      rating: 4.0,
      location: "Birmingham, UK",
      yearsInBusiness: 5,
      support: "10AM - 4PM",
      logo: "/assets/vendorC.png"
    }
  ]);

  const [selectedVendors, setSelectedVendors] = useState([]);

  // ✅ Handle Vendor Selection
  const handleVendorSelect = (vendorName) => {
    setSelectedVendors((prevSelected) =>
      prevSelected.includes(vendorName)
        ? prevSelected.filter((name) => name !== vendorName)
        : [...prevSelected, vendorName]
    );
  };

  // ✅ Generate Star Ratings
  const renderStars = (rating) => {
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

      {/* 🔹 Vendor Comparison Cards */}
      <div className="vendor-cards">
        {vendors.map((vendor, index) => (
          <div key={index} className={`vendor-card ${selectedVendors.includes(vendor.name) ? "selected" : ""}`} onClick={() => handleVendorSelect(vendor.name)}>
            <img src={vendor.logo} alt={vendor.name} className="vendor-logo" />
            <h3>{vendor.name}</h3>
            <p><strong>Price:</strong> £{vendor.price}</p>
            <p><strong>Service Level:</strong> {vendor.serviceLevel}</p>
            <p><strong>Response Time:</strong> {vendor.responseTime} hrs</p>
            <p><strong>Location:</strong> {vendor.location}</p>
            <p><strong>Years in Business:</strong> {vendor.yearsInBusiness}</p>
            <p><strong>Support:</strong> {vendor.support}</p>
            <p><strong>Rating:</strong> {renderStars(vendor.rating)}</p>
            <button className="profile-button">View Profile</button>
          </div>
        ))}
      </div>

      {/* 🔹 Request Quotes Button */}
      <div className="request-quote-container">
        <button className="request-quote-button" disabled={selectedVendors.length === 0}>
          Request Quotes from Selected ({selectedVendors.length})
        </button>
      </div>
    </div>
  );
};

export default CompareVendors;
