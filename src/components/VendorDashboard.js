// File: src/components/VendorDashboard.js
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
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import axios from "axios";
import "../styles/VendorDashboard.css";

const VendorDashboard = () => {
  console.log("✅ VendorDashboard component rendering"); // Debug log
  const navigate = useNavigate();
  const [vendorName, setVendorName] = useState("Vendor");
  const [uploadStatus, setUploadStatus] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [theme, setTheme] = useState("light");
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [activeListings, setActiveListings] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    console.log("Fetching VendorDashboard data");
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("vendorToken");
    console.log("Fetching dashboard with token:", token);

    if (!token) {
      setError("No vendor token found. Please log in.");
      navigate("/vendor-login");
      return;
    }

    try {
      const response = await axios.get("http://localhost:5000/api/vendors/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Raw Dashboard Response:", response);
      console.log("Dashboard Data:", response.data);

      if (!response.data || Object.keys(response.data).length === 0) {
        setError("No data returned from server.");
        return;
      }

      setVendor(response.data);
      setVendorName(response.data.companyName || "Vendor");
      setTotalRevenue(response.data.kpis?.totalRevenue || 0);
      setActiveListings(response.data.kpis?.activeListings || 0);
      setTotalOrders(response.data.kpis?.totalOrders || 0);
    } catch (error) {
      console.error("Fetch Error:", error.response?.data || error.message);
      setError(
        error.response?.data?.message || "Failed to load dashboard data. Check server."
      );
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/vendor-login");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);

    fetchDashboardData();
  }, [navigate, fetchDashboardData]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/vendor-login");
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const handleFileUpload = async (event) => {
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

      console.log("Upload Response:", response.data);
      setUploadStatus({ message: response.data.message, type: "success" });
      if (response.data.machines) {
        setVendor((prev) => ({
          ...prev,
          machines: response.data.machines,
        }));
      }
      await fetchDashboardData();
    } catch (error) {
      console.error("Upload Error:", error.response?.data || error.message);
      setUploadStatus({
        message: error.response?.data?.message || "File upload failed.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const navigateToQuotes = (status) => {
    navigate(`/quotes?status=${status}`);
  };

  if (loading) return <div className="vendor-dashboard-container">Loading...</div>;
  if (error) return (
    <div className="vendor-dashboard-container">
      <p className="error">{error}</p>
      <button onClick={fetchDashboardData}>Retry</button>
    </div>
  );

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

      {uploadStatus && (
        <p className={`upload-status ${uploadStatus.type}`}>
          {uploadStatus.message}
        </p>
      )}

      <section className="vendor-quick-actions">
        <button className="dashboard-button" onClick={() => navigate("/manage-listings")}>
          <FaBox /> Manage Listings
        </button>
        <button className="dashboard-button" onClick={() => navigate("/view-orders")}>
          <FaChartLine /> View Orders
        </button>
        <button className="dashboard-button" onClick={() => navigate("/vendor-profile")}>
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
        {vendor?.uploads && vendor.uploads.length > 0 ? (
          <ul className="uploaded-files-list">
            {vendor.uploads.map((file, index) => (
              <li key={index}>
                📄 {file.fileName} —{" "}
                <span>{new Date(file.uploadDate).toLocaleDateString()}</span>{" "}
                <a href={`http://localhost:5000/${file.filePath}`} download>
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
        {vendor?.machines && vendor.machines.length > 0 ? (
          <ul className="uploaded-machines-list">
            {vendor.machines.map((machine, idx) => (
              <li key={idx}>
                <strong>Model:</strong> {machine.model || "N/A"} |{" "}
                <strong>Type:</strong> {machine.type || "N/A"} |{" "}
                <strong>Lease Cost:</strong> £{machine.lease_cost || "N/A"}
              </li>
            ))}
          </ul>
        ) : (
          <p>No machines uploaded. Use the upload button to add a CSV file.</p>
        )}
      </section>

      <section className="quote-funnel">
        <h2>Quote Funnel</h2>
        {vendor?.quoteFunnelData ? (
          <ul>
            <li onClick={() => navigateToQuotes("created")}>
              Created: {vendor.quoteFunnelData.created || 0}
            </li>
            <li onClick={() => navigateToQuotes("pending")}>
              Pending: {vendor.quoteFunnelData.pending || 0}
            </li>
            <li onClick={() => navigateToQuotes("won")}>
              Won: {vendor.quoteFunnelData.won || 0}
            </li>
            <li onClick={() => navigateToQuotes("lost")}>
              Lost: {vendor.quoteFunnelData.lost || 0}
            </li>
          </ul>
        ) : (
          <p>No quote data available.</p>
        )}
      </section>

      <section className="revenue-chart">
        <h2>Monthly Revenue</h2>
        {vendor?.revenueData && vendor.revenueData.length > 0 ? (
          <LineChart width={600} height={300} data={vendor.revenueData}>
            <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
          </LineChart>
        ) : (
          <p>No revenue data available.</p>
        )}
      </section>
    </div>
  );
};

export default VendorDashboard;