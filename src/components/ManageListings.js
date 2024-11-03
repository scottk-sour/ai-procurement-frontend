// src/components/ManageListings.js
import React, { useState } from 'react';
import './ManageListings.css';

const ManageListings = () => {
  const [listings, setListings] = useState([
    // Example data - this would come from an API in a real application
    { id: 1, name: "Product A", category: "Photocopiers", price: "$500", status: "Active" },
    { id: 2, name: "Product B", category: "IT Services", price: "$200", status: "Draft" },
  ]);

  const handleEdit = (id) => {
    // Logic to edit a listing by ID
    alert(`Editing listing ${id}`);
  };

  const handleDelete = (id) => {
    // Logic to delete a listing by ID
    setListings(listings.filter(listing => listing.id !== id));
  };

  const handleAddNewListing = () => {
    // Logic for adding a new listing (e.g., open a form modal)
    alert("Add New Listing form here.");
  };

  return (
    <div className="manage-listings-container">
      <h2>Manage Listings</h2>
      <button className="add-listing-button" onClick={handleAddNewListing}>
        Add New Listing
      </button>

      <table className="listings-table">
        <thead>
          <tr>
            <th>Product/Service Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {listings.map((listing) => (
            <tr key={listing.id}>
              <td>{listing.name}</td>
              <td>{listing.category}</td>
              <td>{listing.price}</td>
              <td>{listing.status}</td>
              <td>
                <button onClick={() => handleEdit(listing.id)}>Edit</button>
                <button onClick={() => handleDelete(listing.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageListings;
