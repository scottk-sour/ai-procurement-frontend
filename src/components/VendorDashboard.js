// src/components/VendorDashboard.js
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaBox, FaChartLine, FaCog, FaSignOutAlt, FaUpload } from "react-icons/fa";
import axios from "axios";
import KPIs from "./Dashboard/KPIs";
import LeadsTable from "./Dashboard/LeadsTable";
import QuoteFunnel from "./Dashboard/QuoteFunnel";
import RevenueChart from "./Dashboard/RevenueChart";
import "../styles/VendorDashboard.css";

const VendorDashboard = () => {
  const navigate = useNavigate();

  // State declarations
  const [vendorName, setVendorName] = useState(localStorage.getItem("vendorName") || "Vendor");
  const [vendor, setVendor] = useState(null);
  const [listings, setListings] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);

  // Placeholder data for components
  const kpiData = { totalRevenue: 0, activeListings: listings.length, totalOrders: 0 };
  const leadsData = [];
  const quoteData = { created: 0, pending: 0, won: 0, lost: 0 };
  const revenueData = [];

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("vendorToken");

    if (!token) {
      setError("No vendor token found. Please log in.");
      navigate("/vendor-login");
      setLoading(false);
      return;
    }

    try {
      const [profileResponse, listingsResponse, uploadsResponse] = await Promise.all([
        axios.get("http://localhost:5000/api/vendors/profile", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/vendors/listings", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/vendors/uploaded-files", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const profileData = profileResponse.data.vendor;
      const listingsData = listingsResponse.data.listings || [];
      const uploadsData = uploadsResponse.data.files || [];

      setVendor(profileData);
      setVendorName(profileData.company || profileData.name || "Vendor");
      setListings(listingsData);
      setUploads(uploadsData);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load dashboard data.");
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/vendor-login");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Initial setup
  useEffect(() => {
    fetchDashboardData();
    document.documentElement.setAttribute("data-theme", theme);
  }, [fetchDashboardData, theme]);

  // Event handlers
  const handleLogout = () => {
    localStorage.clear();
    navigate("/vendor-login");
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      setUploadStatus({ message: "No file selected.", type: "error" });
      return;
    }

    const token = localStorage.getItem("vendorToken");
    if (!token) {
      setUploadStatus({ message: "Please log in to upload.", type: "error" });
      navigate("/vendor-login");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setUploadStatus(null);

    try {
      const response = await axios.post("http://localhost:5000/api/vendors/upload", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUploadStatus({ message: response.data.message, type: "success" });
      await fetchDashboardData();
      setTimeout(() => setUploadStatus(null), 5000);
    } catch (error) {
      setUploadStatus({
        message: error.response?.data?.message || "File upload failed.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`vendor-dashboard ${theme}`}>
      {/* Welcome Header */}
      <header className="welcome-header">
        <h1>Welcome, {vendorName}!</h1>
      </header>

      {/* Navigation Bar */}
      <nav className="nav-bar">
        <button className="nav-button" onClick={() => navigate("/manage-listings")}>
          <FaBox /> Manage Listings
        </button>
        <button className="nav-button" onClick={() => navigate("/view-orders")}>
          <FaChartLine /> View Orders
        </button>
        <button className="nav-button" onClick={() => navigate("/vendor-profile")}>
          <FaCog /> Vendor Profile
        </button>
        <label className="nav-button upload-label">
          <FaUpload /> Upload Documents
          <input type="file" className="file-input" accept=".csv,.xlsx" onChange={handleFileUpload} />
        </label>
        <button className="nav-button theme-toggle-button" onClick={toggleTheme}>
          {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>
        <button className="nav-button logout-button" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </nav>

      {/* Main Content */}
      <main className="dashboard-content">
        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Loading dashboard data...</p>
          </div>
        )}
        {error && (
          <div className="error-container">
            <p className="error">{error}</p>
            <button onClick={fetchDashboardData}>Retry</button>
          </div>
        )}
        {uploadStatus && (
          <div className={`upload-status ${uploadStatus.type}`}>
            {uploadStatus.message}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* KPIs */}
            <section className="kpi-section">
              <KPIs data={kpiData} />
            </section>

            {/* Leads */}
            <section className="leads-section">
              <LeadsTable leads={leadsData} />
            </section>

            {/* Quote Funnel and Revenue Trend */}
            <section className="funnel-revenue-section">
              <QuoteFunnel data={quoteData} />
              <RevenueChart data={revenueData} />
            </section>

            {/* Uploaded Files */}
            <section className="uploaded-files">
              <h2>Uploaded Files</h2>
              {uploads.length > 0 ? (
                <ul className="file-list">
                  {uploads.map((file, index) => (
                    <li key={index} className="file-item">
                      <span>📄 {file.fileName}</span>
                      <span>{new Date(file.uploadDate).toLocaleDateString()}</span>
                      <a href={`http://localhost:5000${file.filePath}`} download>
                        📥 Download
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-data">No uploaded files yet.</p>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default VendorDashboard;