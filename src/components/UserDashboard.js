// src/components/UserDashboard.js
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaQuoteRight,
  FaBalanceScale,
  FaUserCog,
  FaUpload,
  FaSignOutAlt,
  FaChartBar,
  FaFileAlt,
  FaBell,
  FaCloudUploadAlt,
  FaDollarSign,
} from "react-icons/fa";
import "../styles/UserDashboard.css";

const UserDashboard = () => {
  const navigate = useNavigate();

  // State declarations
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "User");
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState("contract");
  const [message, setMessage] = useState("");
  const [recentActivity, setRecentActivity] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [totalQuotes, setTotalQuotes] = useState(0);
  const [pendingResponses, setPendingResponses] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchUserProfile = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("❌ No token found, redirecting to login...");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch user profile.");
      const data = await response.json();
      setUserName(data.user.name || "User");
      localStorage.setItem("userName", data.user.name || "User");
    } catch (error) {
      console.error("Error fetching user profile:", error.message);
      setError(`Failed to load user profile: ${error.message}. Using default values.`);
      setUserName(localStorage.getItem("userName") || "User");
    }
  }, [navigate]);

  const fetchDashboardData = useCallback(async () => {
    console.log("Fetching UserDashboard data");
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (!token || !userId) {
      console.log("❌ No authentication token or user ID found, redirecting to login...");
      setError("No authentication token or user ID found. Please log in.");
      navigate("/login");
      return;
    }

    try {
      const [activityRes, filesRes, quotesRes, savingsRes] = await Promise.all([
        fetch("http://localhost:5000/api/users/recent-activity", {
          headers: { Authorization: `Bearer ${token}` },
        }).then(res => res.ok ? res.json() : Promise.reject("Failed to fetch recent activity.")),
        fetch("http://localhost:5000/api/users/uploaded-files", {
          headers: { Authorization: `Bearer ${token}` },
        }).then(res => res.ok ? res.json() : Promise.reject("Failed to fetch uploaded files.")),
        fetch(`http://localhost:5000/api/quotes/user?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(res => res.ok ? res.json() : Promise.reject("Failed to fetch quotes.")),
        fetch(`http://localhost:5000/api/users/savings?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(res => res.ok ? res.json() : { totalSavings: 0 }), // Default to 0 if savings fails
      ]);

      const pendingQuotes = quotesRes.quotes
        ? quotesRes.quotes.filter((quote) => quote.status === "In Progress").length
        : 0;

      setRecentActivity(activityRes.activities || []);
      setUploadedFiles(filesRes.files || []);
      setTotalQuotes((quotesRes.quotes && quotesRes.quotes.length) || 0);
      setPendingResponses(pendingQuotes);
      setTotalSavings(savingsRes.totalSavings || 5000); // Mock value for testing
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(`Failed to load dashboard data: ${error}. Please try again.`);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    console.log("useEffect running");
    fetchUserProfile();
    fetchDashboardData();
  }, [fetchUserProfile, fetchDashboardData]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage(`✅ Selected: ${selectedFile.name}`);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("⚠ Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", documentType);

    setLoading(true);
    setUploadProgress(0);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/users/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("✅ File uploaded successfully!");
        setUploadProgress(100);
        fetchDashboardData();
        setFile(null);
      } else {
        setMessage(data.message || "⚠ Upload failed.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessage("⚠ An error occurred during upload.");
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) {
    console.log("Rendering loading state");
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  if (error) {
    console.log("Rendering error state:", error);
    return (
      <div className="dashboard-page">
        <p className="error">{error}</p>
        <button className="nav-button" onClick={fetchDashboardData}>
          Retry
        </button>
      </div>
    );
  }

  console.log("Rendering UserDashboard content");
  return (
    <div className="dashboard-page">
      {/* Welcome Header */}
      <header className="welcome-header">
        <h1>Welcome, {userName}!</h1>
      </header>

      {/* Navigation Bar */}
      <nav className="nav-bar">
        <button className="nav-button" onClick={() => navigate("/request-quote")}>
          <FaQuoteRight /> Request a Quote
        </button>
        <button className="nav-button" onClick={() => navigate("/compare-vendors")}>
          <FaBalanceScale /> Compare Vendors
        </button>
        <button className="nav-button" onClick={() => navigate("/manage-account")}>
          <FaUserCog /> Manage Account
        </button>
        <label className="nav-button upload-label">
          <FaUpload /> Upload Documents
          <input
            type="file"
            className="file-input"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            onChange={handleFileChange}
          />
        </label>
        <button className="nav-button logout-button" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </nav>

      {/* Main Content */}
      <main className="dashboard-content">
        {/* KPIs */}
        <section className="kpi-section">
          <div className="kpi-container">
            <div className="kpi-box">
              <FaChartBar className="kpi-icon" />
              <h3>Total Quotes Requested</h3>
              <p>{totalQuotes}</p>
            </div>
            <div className="kpi-box">
              <FaFileAlt className="kpi-icon" />
              <h3>Uploaded Documents</h3>
              <p>{uploadedFiles.length}</p>
            </div>
            <div className="kpi-box">
              <FaBell className="kpi-icon" />
              <h3>Pending Vendor Responses</h3>
              <p>{pendingResponses}</p>
            </div>
            <div className="kpi-box">
              <FaDollarSign className="kpi-icon" />
              <h3>Total Savings</h3>
              <p>${totalSavings.toLocaleString()}</p>
            </div>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="recent-activity-section">
          <h2>Recent Activity</h2>
          {recentActivity.length > 0 ? (
            <ul className="file-list">
              {recentActivity.map((activity, index) => (
                <li key={index} className="file-item">
                  <span>{activity.description}</span>
                  <span>{new Date(activity.date).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">No recent activity available.</p>
          )}
        </section>

        {/* File Upload */}
        <section className="file-upload-section">
          <h2>File Upload</h2>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="document-type-select"
          >
            <option value="contract">Contract</option>
            <option value="bill">Bill</option>
          </select>
          <div className="upload-dropzone" onClick={() => document.querySelector(".file-input").click()}>
            <FaCloudUploadAlt size={50} />
            <p>{file ? file.name : "Drag & Drop a file here or Click to Upload"}</p>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              className="file-input"
            />
          </div>
          <button className="nav-button upload" onClick={handleUpload} disabled={loading}>
            {loading ? `Uploading... ${uploadProgress}%` : "Upload Document"}
          </button>
          {message && <p className="upload-message">{message}</p>}
        </section>
      </main>
    </div>
  );
};

export default UserDashboard;