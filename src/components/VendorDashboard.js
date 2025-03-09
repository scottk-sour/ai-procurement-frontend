import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBox,
  FaChartLine,
  FaCog,
  FaDollarSign,
  FaSignOutAlt,
  FaUpload,
} from "react-icons/fa";
import axios from "axios";
import "../styles/VendorDashboard.css";

const VendorDashboard = () => {
  console.log("✅ VendorDashboard component rendering START");
  const navigate = useNavigate();
  const [vendorName, setVendorName] = useState(
    localStorage.getItem("vendorName") || "Vendor"
  );
  const [uploadStatus, setUploadStatus] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [listings, setListings] = useState([]);
  const [theme, setTheme] = useState("light");
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [activeListings, setActiveListings] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    console.log("🔍 Fetching VendorDashboard data");
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("vendorToken");
    console.log("🔑 Fetching data with token:", token);

    if (!token) {
      console.log("❌ No vendorToken found");
      setError("No vendor token found. Please log in.");
      navigate("/vendor-login");
      setLoading(false);
      return;
    }

    try {
      console.log("📡 Sending request to /api/vendors/profile");
      const profileResponse = await axios.get(
        "http://localhost:5000/api/vendors/profile",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("✅ Profile Response:", profileResponse.data);

      console.log("📡 Sending request to /api/vendors/listings");
      const listingsResponse = await axios.get(
        "http://localhost:5000/api/vendors/listings",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("✅ Listings Response:", listingsResponse.data);

      const profileData = profileResponse.data.vendor;
      const listingsData = listingsResponse.data.listings || [];

      setVendor(profileData);
      setVendorName(profileData.company || profileData.name || "Vendor");
      setListings(listingsData);
      setTotalRevenue(0); // Replace with real data when available
      setActiveListings(listingsData.length);
      setTotalOrders(0); // Replace with real data when available
    } catch (error) {
      console.error("❌ Fetch Error:", error.response?.data || error.message);
      setError(
        error.response?.data?.message ||
          "Failed to load dashboard data. Check server."
      );
      if (error.response?.status === 401) {
        console.log("❌ Unauthorized, clearing storage and redirecting");
        localStorage.clear();
        navigate("/vendor-login");
      }
    } finally {
      console.log("🏁 Fetch completed, loading set to false");
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    console.log("🚀 VendorDashboard useEffect triggered");
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);

    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleLogout = () => {
    console.log("👋 Logging out vendor");
    localStorage.clear();
    navigate("/vendor-login");
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    console.log("🌗 Toggling theme to:", newTheme);
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const handleFileUpload = async (event) => {
    console.log("📤 Handling file upload");
    const file = event.target.files[0];
    if (!file) {
      setUploadStatus({ message: "No file selected.", type: "error" });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("vendorToken");

    setLoading(true);
    setUploadStatus(null);

    try {
      console.log("📡 Sending upload request");
      const response = await axios.post(
        "http://localhost:5000/api/vendors/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ Upload Response:", response.data);
      setUploadStatus({ message: response.data.message, type: "success" });
      await fetchDashboardData(); // Refresh data after upload
    } catch (error) {
      console.error("❌ Upload Error:", error.response?.data || error.message);
      setUploadStatus({
        message:
          error.response?.data?.message || "File upload failed.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  console.log("🎨 Rendering with state:", { loading, error, vendor, listings });

  return (
    <div className="vendor-dashboard-container">
      <header className="vendor-dashboard-header">
        <h1>Welcome, {vendorName}!</h1>
        <div className="header-controls">
          <button className="logout-button" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
          <button className="theme-toggle-button" onClick={toggleTheme}>
            {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>
        </div>
      </header>

      {loading && (
        <p className="loading-message">Loading dashboard data...</p>
      )}
      {error && (
        <div className="error-container">
          <p className="error">{error}</p>
          <button onClick={fetchDashboardData}>Retry</button>
        </div>
      )}

      {uploadStatus && (
        <p className={`upload-status ${uploadStatus.type}`}>
          {uploadStatus.message}
        </p>
      )}

      {!loading && !error && (
        <>
          <section className="vendor-quick-actions">
            <button
              className="dashboard-button"
              onClick={() => navigate("/manage-listings")}
            >
              <FaBox /> Manage Listings
            </button>
            <button
              className="dashboard-button"
              onClick={() => navigate("/view-orders")}
            >
              <FaChartLine /> View Orders
            </button>
            <button
              className="dashboard-button"
              onClick={() => navigate("/vendor-profile")}
            >
              <FaCog /> Edit Profile
            </button>
            <label className="upload-label">
              <FaUpload /> Upload Documents
              <input
                type="file"
                className="file-input"
                accept=".csv,.xlsx"
                onChange={handleFileUpload}
              />
            </label>
          </section>

          <section className="vendor-stats-widgets">
            <div className="stat-widget">
              <FaDollarSign className="stat-icon" />
              <h3>Total Revenue</h3>
              <p>£{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="stat-widget">
              <FaBox className="stat-icon" />
              <h3>Active Listings</h3>
              <p>{activeListings}</p>
            </div>
            <div className="stat-widget">
              <FaChartLine className="stat-icon" />
              <h3>Total Orders</h3>
              <p>{totalOrders}</p>
            </div>
          </section>

          <section className="uploaded-products">
            <h2>Uploaded Files</h2>
            {vendor?.uploads?.length > 0 ? (
              <ul className="uploaded-files-list">
                {vendor.uploads.map((file, index) => (
                  <li key={index}>
                    📄 {file.fileName} —{" "}
                    <span>
                      {new Date(file.uploadDate).toLocaleDateString()}
                    </span>{" "}
                    <a
                      href={`http://localhost:5000/${file.filePath}`}
                      download
                    >
                      📥 Download
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No uploaded files yet.</p>
            )}
          </section>

          <section className="uploaded-machines">
            <h2>Uploaded Machines</h2>
            {listings.length > 0 ? (
              <ul className="uploaded-machines-list">
                {listings.map((machine, idx) => (
                  <li key={idx}>
                    <strong>Model:</strong> {machine.model || "N/A"} |{" "}
                    <strong>Type:</strong> {machine.type || "N/A"} |{" "}
                    <strong>Lease Cost:</strong> £{machine.lease_cost || "N/A"}
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                No machines uploaded. Use the upload button to add a CSV file.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default VendorDashboard;