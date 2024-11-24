import React, { useState, useEffect } from 'react';
import './ManageListings.css';

const ManageListings = () => {
  const [listings, setListings] = useState(() => {
    // Load listings from localStorage or set default values
    const savedListings = localStorage.getItem('listings');
    return savedListings
      ? JSON.parse(savedListings)
      : [
          { id: 1, name: "Product A", category: "Photocopiers", price: "£500", status: "Active" },
          { id: 2, name: "Product B", category: "IT Services", price: "£200", status: "Draft" },
        ];
  });

  const [showForm, setShowForm] = useState(false); // Controls the visibility of the Add/Edit Listing form
  const [newListing, setNewListing] = useState({
    name: "",
    category: "",
    price: "",
    status: "Active",
  });
  const [currentEditId, setCurrentEditId] = useState(null); // Track the ID being edited

  // Save listings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('listings', JSON.stringify(listings));
  }, [listings]);

  // Open the Add Listing form for a new listing
  const handleAddNewListing = () => {
    setCurrentEditId(null); // Reset editing state
    setNewListing({ name: "", category: "", price: "", status: "Active" });
    setShowForm(true);
  };

  // Open the form to edit an existing listing
  const handleEdit = (id) => {
    const listingToEdit = listings.find((listing) => listing.id === id);
    if (listingToEdit) {
      setNewListing(listingToEdit); // Load the existing listing data into the form
      setCurrentEditId(id); // Set the ID of the listing being edited
      setShowForm(true); // Show the form
    }
  };

  // Save a new or edited listing
  const handleSaveNewListing = (e) => {
    e.preventDefault();

    const updatedListing = {
      ...newListing,
      price: `£${newListing.price.replace("£", "")}`, // Ensure price has £ prefix
    };

    if (currentEditId) {
      // Update the existing listing
      setListings(
        listings.map((listing) =>
          listing.id === currentEditId ? updatedListing : listing
        )
      );
    } else {
      // Add a new listing
      setListings([
        ...listings,
        { id: listings.length + 1, ...updatedListing },
      ]);
    }

    resetForm();
  };

  // Delete a listing
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      setListings(listings.filter((listing) => listing.id !== id));
    }
  };

  // Reset the form and close the modal
  const resetForm = () => {
    setNewListing({ name: "", category: "", price: "", status: "Active" });
    setCurrentEditId(null);
    setShowForm(false);
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

      {/* Add/Edit Listing Form Modal */}
      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h3>{currentEditId ? "Edit Listing" : "Add New Listing"}</h3>
            <form onSubmit={handleSaveNewListing}>
              <label>
                Product/Service Name:
                <input
                  type="text"
                  value={newListing.name}
                  onChange={(e) => setNewListing({ ...newListing, name: e.target.value })}
                  required
                />
              </label>
              <label>
                Category:
                <select
                  value={newListing.category}
                  onChange={(e) => setNewListing({ ...newListing, category: e.target.value })}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="Photocopiers">Photocopiers</option>
                  <option value="IT Services">IT Services</option>
                  <option value="Telecoms">Telecoms</option>
                  <option value="CCTV">CCTV</option>
                </select>
              </label>
              <label>
                Price:
                <input
                  type="number"
                  value={newListing.price.replace("£", "")} // Strip £ for editing
                  onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
                  placeholder="Enter price in £"
                  required
                />
              </label>
              <label>
                Status:
                <select
                  value={newListing.status}
                  onChange={(e) => setNewListing({ ...newListing, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                </select>
              </label>
              <div className="modal-actions">
                <button type="submit">{currentEditId ? "Save Changes" : "Add Listing"}</button>
                <button type="button" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageListings;
