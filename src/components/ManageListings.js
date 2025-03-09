import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ManageListings.css";

const API_BASE_URL = "http://localhost:5000/api/vendors/listings"; // Ensure correct API base URL

const ManageListings = () => {
  // Use the vendor token from localStorage
  const token = localStorage.getItem("vendorToken");

  // Initialize listings as an empty array
  const [listings, setListings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  // Using "title", "description" and "price" as required by the Listing model
  const [newListing, setNewListing] = useState({
    title: "",
    description: "",
    price: "",
  });
  const [currentEditId, setCurrentEditId] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // Fetch listings from the backend on component mount
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await axios.get(API_BASE_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Log the API response to verify its format
        console.log("API Response for listings:", response.data);
        // If your API returns an object like { listings: [...] }, then use:
        // setListings(response.data.listings);
        // Otherwise, if it returns an array directly:
        setListings(response.data);
      } catch (error) {
        setError(
          error.response?.data?.message || "Error fetching listings."
        );
        console.error("❌ Error fetching listings:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [token]);

  // Open form for adding a new listing
  const handleAddNewListing = () => {
    setCurrentEditId(null);
    setNewListing({ title: "", description: "", price: "" });
    setShowForm(true);
  };

  // Open form for editing an existing listing
  const handleEdit = (id) => {
    const listingToEdit = listings.find((listing) => listing._id === id);
    if (listingToEdit) {
      setNewListing({
        title: listingToEdit.title,
        description: listingToEdit.description,
        price: listingToEdit.price,
      });
      setCurrentEditId(id);
      setShowForm(true);
    }
  };

  // Handle form submission for adding/updating a listing
  const handleSaveNewListing = async (e) => {
    e.preventDefault();

    // Validate that price is a valid number
    if (isNaN(parseFloat(newListing.price))) {
      setError("❌ Invalid price entered.");
      return;
    }

    try {
      let response;
      const payload = {
        ...newListing,
        price: parseFloat(newListing.price),
      };

      if (currentEditId) {
        // Update an existing listing
        response = await axios.put(
          `${API_BASE_URL}/${currentEditId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setListings(
          listings.map((listing) =>
            listing._id === currentEditId ? response.data : listing
          )
        );
      } else {
        // Add a new listing
        response = await axios.post(API_BASE_URL, payload, {
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

  // Handle deletion of a listing
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

  // Reset the form state
  const resetForm = () => {
    setNewListing({ title: "", description: "", price: "" });
    setCurrentEditId(null);
    setShowForm(false);
    setError(null);
  };

  return (
    <div className="manage-listings-container">
      <h2>Manage Listings</h2>
      {error && <p className="error-message">{error}</p>}
      {loading ? (
        <p>Loading listings...</p>
      ) : (
        <>
          <button className="add-listing-button" onClick={handleAddNewListing}>
            ➕ Add New Listing
          </button>
          {listings.length === 0 ? (
            <p>No listings available.</p>
          ) : (
            <table className="listings-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Active</th>
                  <th>Files</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(listings) ? (
                  listings.map((listing) => (
                    <tr key={listing._id}>
                      <td>{listing.title}</td>
                      <td>{listing.description}</td>
                      <td>
                        {typeof listing.price === "number"
                          ? `£${listing.price.toFixed(2)}`
                          : listing.price}
                      </td>
                      <td>{listing.isActive ? "Yes" : "No"}</td>
                      <td>
                        {listing.uploads && listing.uploads.length > 0 ? (
                          listing.uploads.map((file, index) => (
                            <div key={index}>
                              <a
                                href={`/${file.filePath}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {file.fileName}
                              </a>
                            </div>
                          ))
                        ) : (
                          "No files"
                        )}
                      </td>
                      <td>
                        <button onClick={() => handleEdit(listing._id)}>
                          ✏️ Edit
                        </button>
                        <button onClick={() => handleDelete(listing._id)}>
                          🗑 Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">No valid listings available.</td>
                  </tr>
                )}
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
                Title:
                <input
                  type="text"
                  value={newListing.title}
                  onChange={(e) =>
                    setNewListing({ ...newListing, title: e.target.value })
                  }
                  required
                />
              </label>
              <label>
                Description:
                <textarea
                  value={newListing.description}
                  onChange={(e) =>
                    setNewListing({
                      ...newListing,
                      description: e.target.value,
                    })
                  }
                  required
                />
              </label>
              <label>
                Price:
                <input
                  type="number"
                  value={newListing.price}
                  onChange={(e) =>
                    setNewListing({ ...newListing, price: e.target.value })
                  }
                  placeholder="Enter price"
                  required
                />
              </label>
              <div className="modal-actions">
                <button type="submit">
                  {currentEditId ? "💾 Save Changes" : "✅ Add Listing"}
                </button>
                <button type="button" onClick={resetForm}>
                  ❌ Cancel
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
