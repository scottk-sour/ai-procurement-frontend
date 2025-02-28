// File: src/components/UserDashboard.js
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Updated to remove unused Link import
import {
  FaQuoteRight,
  FaBalanceScale,
  FaUserCog,
  FaBell,
  FaUpload,
  FaUserCircle,
  FaFileAlt,
  FaChartBar,
  FaCloudUploadAlt,
  FaArrowRight,
} from "react-icons/fa";
import "../styles/UserDashboard.css"; // Use updated CSS below

const UserDashboard = () => {
  console.log("✅ UserDashboard rendering START"); // Debug
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState("contract");
  const [message, setMessage] = useState("");
  const [recentActivity, setRecentActivity] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [totalQuotes, setTotalQuotes] = useState(0);
  const [pendingResponses, setPendingResponses] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false); // State for animation visibility

  useEffect(() => {
    window.scrollTo(0, 0);
    console.log("📍 UserDashboard mounted at:", pathname);
    const timer = setTimeout(() => setIsVisible(true), 100); // Match other services' delay
    return () => clearTimeout(timer);
  }, [pathname]);

  const fetchUserProfile = useCallback(async () => {
    const token = localStorage.getItem("userToken");
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
      setUserName(data.user.name || "User"); // Use actual name from backend
      setUserEmail(data.user.email || "");
      localStorage.setItem("userName", data.user.name || "User"); // Store for persistence
      localStorage.setItem("userEmail", data.user.email || "");
    } catch (error) {
      console.error("Error fetching user profile:", error.message);
      setError(`Failed to load user profile: ${error.message}. Using default values.`);
      setUserName(localStorage.getItem("userName") || "User");
      setUserEmail(localStorage.getItem("userEmail") || "");
    }
  }, [navigate]);

  const fetchDashboardData = useCallback(async () => {
    console.log("Fetching UserDashboard data");
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("userToken");
    const userId = localStorage.getItem("userId");
    console.log("Token:", token, "UserID:", userId);
    if (!token || !userId) {
      console.log("❌ No authentication token or user ID found, redirecting to login...");
      setError("No authentication token or user ID found. Please log in.");
      navigate("/login");
      return;
    }

    try {
      const [activityRes, filesRes, quotesRes, pendingRes] = await Promise.all([
        fetch("http://localhost:5000/api/users/recent-activity", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/users/uploaded-files", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`http://localhost:5000/api/quotes/user?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/quotes/pending", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!activityRes.ok) throw new Error("Failed to fetch recent activity.");
      if (!filesRes.ok) throw new Error("Failed to fetch uploaded files.");
      if (!quotesRes.ok) throw new Error("Failed to fetch quotes.");
      if (!pendingRes.ok) throw new Error("Failed to fetch pending responses.");

      const activityData = await activityRes.json();
      const filesData = await filesRes.json();
      const quotesData = await quotesRes.json();
      const pendingData = await pendingRes.json();

      console.log("Activity Data:", activityData);
      console.log("Files Data:", filesData);
      console.log("Quotes Data:", quotesData);
      console.log("Pending Data:", pendingData);

      setRecentActivity(activityData.activities || []);
      setUploadedFiles(filesData.files || []);
      setTotalQuotes((quotesData.quotes && quotesData.quotes.length) || 0);
      setPendingResponses((pendingData.quotes && pendingData.quotes.length) || 0);
    } catch (error) {
      console.error("Error fetching dashboard data:", error.message);
      setError(`Failed to load dashboard data: ${error.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    console.log("useEffect running");
    fetchUserProfile(); // Fetch user profile for name and email
    fetchDashboardData();
  }, [navigate, fetchUserProfile, fetchDashboardData]);

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
      const response = await fetch("http://localhost:5000/api/users/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
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

  if (loading) {
    console.log("Rendering loading state");
    return (
      <div className="dashboard-loading" data-animation="fadeIn" data-visible={isVisible}>
        <span className="loading-spinner">Loading Dashboard...</span>
      </div>
    );
  }

  if (error) {
    console.log("Rendering error state:", error);
    return (
      <div className="dashboard-page" data-animation="fadeIn" data-visible={isVisible}>
        <p className="error">{error}</p>
        <button className="dashboard-button secondary" onClick={fetchDashboardData}>
          Retry
        </button>
      </div>
    );
  }

  console.log("Rendering UserDashboard content");
  return (
    <div className="dashboard-page" data-animation="fadeInUp" data-visible={isVisible}>
      <div className="dashboard-header" data-animation="fadeIn" data-delay="200" data-visible={isVisible}>
        <div className="user-info">
          <FaUserCircle className="user-icon" />
          <div>
            <h2 className="dashboard-title">{userName}</h2>
            <p className="dashboard-subtitle">{userEmail}</p>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="dashboard-button logout"
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="quick-actions" data-animation="fadeInUp" data-delay="400" data-visible={isVisible}>
        <button
          className="dashboard-button request-quote"
          onClick={() => navigate("/request-quote")}
        >
          <FaQuoteRight /> Request a Quote
        </button>
        <button
          className="dashboard-button compare-vendors"
          onClick={() => navigate("/compare-vendors")}
        >
          <FaBalanceScale /> Compare Vendors
        </button>
        <button
          className="dashboard-button manage-account"
          onClick={() => navigate("/manage-account")}
        >
          <FaUserCog /> Manage Account
        </button>
      </div>

      <div className="dashboard-cards" data-animation="fadeInUp" data-delay="600" data-visible={isVisible}>
        <div
          className="dashboard-card"
          onClick={() => navigate("/quotes-requested")}
          style={{ cursor: "pointer" }}
        >
          <FaChartBar className="dashboard-icon" />
          <h3 className="card-title">Total Quotes Requested</h3>
          <p className="card-value">{totalQuotes}</p>
          <FaArrowRight className="arrow-icon" />
        </div>
        <div
          className="dashboard-card"
          onClick={() => navigate("/uploaded-documents")}
          style={{ cursor: "pointer" }}
        >
          <FaFileAlt className="dashboard-icon" />
          <h3 className="card-title">Uploaded Documents</h3>
          <p className="card-value">{uploadedFiles.length}</p>
          <FaArrowRight className="arrow-icon" />
        </div>
        <div className="dashboard-card">
          <FaBell className="dashboard-icon" />
          <h3 className="card-title">Pending Vendor Responses</h3>
          <p className="card-value">{pendingResponses}</p>
        </div>
      </div>

      <div className="recent-activity-section" data-animation="fadeInUp" data-delay="800" data-visible={isVisible}>
        <h2 className="section-title">Recent Activity</h2>
        {recentActivity.length > 0 ? (
          <ul className="recent-activity-list">
            {recentActivity.map((activity, index) => (
              <li key={index} data-animation="fadeInUp" data-delay={800 + index * 100} data-visible={isVisible}>
                <strong>{activity.description}</strong>{" "}
                <span>({new Date(activity.date).toLocaleString()})</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-activity">No recent activity available.</p>
        )}
      </div>

      <div className="file-upload-section" data-animation="fadeInUp" data-delay="1000" data-visible={isVisible}>
        <h2 className="section-title">
          <FaUpload /> Upload Documents
        </h2>
        <label>Select Document Type:</label>
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          className="document-type-select"
        >
          <option value="contract">Contract</option>
          <option value="bill">Bill</option>
        </select>
        <div className="upload-dropzone">
          <FaCloudUploadAlt size={50} />
          <p>
            {file ? file.name : "Drag & Drop a file here or Click to Upload"}
          </p>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            className="file-input"
          />
        </div>
        <button className="dashboard-button upload" onClick={handleUpload} disabled={loading}>
          {loading ? `Uploading... ${uploadProgress}%` : "Upload Document"}
        </button>
        {message && <p className="upload-message">{message}</p>}
      </div>

      {/* Footer Integration (assuming Footer.js exists, commented out for debugging) */}
      {/* <Footer /> */}
    </div>
  );
};

export default UserDashboard;