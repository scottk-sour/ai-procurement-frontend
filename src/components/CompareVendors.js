// src/components/CompareVendors.js
import React, { useState } from 'react';
import './CompareVendors.css';

const CompareVendors = () => {
  const [vendors] = useState([
    { name: "Vendor A", price: "$100", serviceLevel: "Standard", responseTime: "24 hrs" },
    { name: "Vendor B", price: "$120", serviceLevel: "Premium", responseTime: "12 hrs" },
    { name: "Vendor C", price: "$90", serviceLevel: "Basic", responseTime: "48 hrs" },
  ]);

  return (
    <div className="compare-vendors-container">
      <h2 className="compare-vendors-title">Compare Vendors</h2>
      
      <div className="filter-sort-container">
        <label className="filter-sort-label">
          Sort By:
          <select className="filter-sort-select">
            <option value="price">Price</option>
            <option value="serviceLevel">Service Level</option>
            <option value="responseTime">Response Time</option>
          </select>
        </label>
      </div>

      <table className="compare-vendors-table">
        <thead>
          <tr>
            <th>Vendor Name</th>
            <th>Price</th>
            <th>Service Level</th>
            <th>Response Time</th>
            <th>Profile</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((vendor, index) => (
            <tr key={index}>
              <td>{vendor.name}</td>
              <td>{vendor.price}</td>
              <td>{vendor.serviceLevel}</td>
              <td>{vendor.responseTime}</td>
              <td><button className="profile-button">View Profile</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="request-quote-container">
        <button className="request-quote-button">Request Quotes from Selected</button>
      </div>
    </div>
  );
};

export default CompareVendors;
