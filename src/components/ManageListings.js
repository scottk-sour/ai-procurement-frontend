import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ManageListings.css";

const API_BASE_URL = "http://localhost:5000/api/vendors/listings"; // ✅ Ensure correct API base URL

const ManageListings = () => {
  const token = localStorage.getItem("token"); // ✅ Removed unused setToken (Fixed ESLint warning)
  const [listings, setListings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newListing, setNewListing] = useState({
    name: "",
    category: "",
    price: "",
    status: "Active",
  });
  const [currentEditId, setCurrentEditId] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ Added loading state
  const [error, setError] = useState(null); // ✅ Added error state

  // ✅ Fetch listings from the backend on component mount
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await axios.get(API_BASE_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setListings(response.data);
      } catch (error) {
        setError(error.response?.data?.message || "Error fetching listings.");
        console.error("❌ Error fetching listings:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [token]);

  const handleAddNewListing = () => {
    setCurrentEditId(null);
    setNewListing({ name: "", category: "", price: "", status: "Active" });
    setShowForm(true);
  };

  const handleEdit = (id) => {
    const listingToEdit = listings.find((listing) => listing._id === id);
    if (listingToEdit) {
      setNewListing(listingToEdit);
      setCurrentEditId(id);
      setShowForm(true);
    }
  };

  const handleSaveNewListing = async (e) => {
    e.preventDefault();

    // ✅ Validate that price is a valid number
    if (isNaN(parseFloat(newListing.price))) {
      setError("❌ Invalid price entered.");
      return;
    }

    try {
      let response;
      if (currentEditId) {
        // ✅ Update an existing listing
        response = await axios.put(
          `${API_BASE_URL}/${currentEditId}`,
          { ...newListing, price: parseFloat(newListing.price) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setListings(listings.map((listing) => (listing._id === currentEditId ? response.data : listing)));
      } else {
        // ✅ Add a new listing
        response = await axios.post(API_BASE_URL, { ...newListing, price: parseFloat(newListing.price) }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setListings([...listings, response.data]);
      }

      resetForm();
    } catch (error) {
      setError(error.response?.data?.message || "Error saving listing.");
      console.error("❌ Error saving listing:", error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("⚠️ Are you sure you want to delete this listing?")) {
      try {
        await axios.delete(`${API_BASE_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setListings(listings.filter((listing) => listing._id !== id));
      } catch (error) {
        setError(error.response?.data?.message || "Error deleting listing.");
        console.error("❌ Error deleting listing:", error.message);
      }
    }
  };

  const resetForm = () => {
    setNewListing({ name: "", category: "", price: "", status: "Active" });
    setCurrentEditId(null);
    setShowForm(false);
    setError(null); // ✅ Reset error state
  };

  return (
    <div className="manage-listings-container">
      <h2>Manage Listings</h2>
      {error && <p className="error-message">{error}</p>} {/* ✅ Display error messages */}
      {loading ? (
        <p>Loading listings...</p> // ✅ Show loading indicator
      ) : (
        <>
          <button className="add-listing-button" onClick={handleAddNewListing}>
            ➕ Add New Listing
          </button>

          {listings.length === 0 ? (
            <p>No listings available.</p> // ✅ Display message when no listings exist
          ) : (
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
                  <tr key={listing._id}>
                    <td>{listing.name}</td>
                    <td>{listing.category}</td>
                    <td>£{listing.price.toFixed(2)}</td>
                    <td>{listing.status}</td>
                    <td>
                      <button onClick={() => handleEdit(listing._id)}>✏️ Edit</button>
                      <button onClick={() => handleDelete(listing._id)}>🗑 Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

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
                  value={newListing.price}
                  onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
                  placeholder="Enter price"
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
                <button type="submit">{currentEditId ? "💾 Save Changes" : "✅ Add Listing"}</button>
                <button type="button" onClick={resetForm}>❌ Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageListings;
