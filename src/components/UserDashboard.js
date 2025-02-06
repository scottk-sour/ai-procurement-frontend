import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaQuoteRight, FaBalanceScale, FaUserCog, FaBell,
  FaUpload, FaUserCircle, FaFileAlt, FaChartBar, 
  FaCloudUploadAlt, FaDownload, FaTrash, FaArrowRight
} from "react-icons/fa";
import "../styles/UserDashboard.css";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState("contract");
  const [message, setMessage] = useState("");
  const [recentActivity, setRecentActivity] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [totalQuotes, setTotalQuotes] = useState(0);
  const [pendingResponses, setPendingResponses] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/login");
      return;
    }

    setUserName(localStorage.getItem("userName") || "User");
    setUserEmail(localStorage.getItem("userEmail") || "");

    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("userToken");
      const [activityRes, filesRes, quotesRes, pendingRes] = await Promise.all([
        fetch(`http://localhost:5000/api/users/recent-activity`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`http://localhost:5000/api/users/uploaded-files`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`http://localhost:5000/api/quotes/user`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`http://localhost:5000/api/quotes/pending`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (!activityRes.ok || !filesRes.ok || !quotesRes.ok || !pendingRes.ok) {
        throw new Error("Failed to fetch dashboard data.");
      }

      const activityData = await activityRes.json();
      const filesData = await filesRes.json();
      const quotesData = await quotesRes.json();
      const pendingData = await pendingRes.json();

      setRecentActivity(activityData.activities || []);
      setUploadedFiles(filesData.files || []);
      setTotalQuotes(quotesData.length || 0);
      setPendingResponses(pendingData.length || 0);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setMessage("⚠ Error loading data. Please try again.");
    }
    setLoading(false);
  };

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
    }
    setLoading(false);
    setTimeout(() => setUploadProgress(0), 2000);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="user-info">
          <FaUserCircle className="user-icon" />
          <div>
            <h2>{userName}</h2>
            <p>{userEmail}</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="logout-button" onClick={() => { localStorage.clear(); navigate("/login"); }}>
            Logout
          </button>
        </div>
      </div>

      {/* 🔹 Quick Actions Section */}
      <div className="quick-actions">
        <button className="dashboard-button request-quote" onClick={() => navigate("/request-quote")}>
          <FaQuoteRight /> Request a Quote
        </button>
        <button className="dashboard-button compare-vendors" onClick={() => navigate("/compare-vendors")}>
          <FaBalanceScale /> Compare Vendors
        </button>
        <button className="dashboard-button manage-account" onClick={() => navigate("/manage-account")}>
          <FaUserCog /> Manage Account
        </button>
      </div>

      {/* 🔹 Dashboard Overview */}
      <div className="dashboard-cards">
        <div className="dashboard-card" onClick={() => navigate("/quotes-requested")} style={{ cursor: 'pointer' }}>
          <FaChartBar className="dashboard-icon" />
          <h3>Total Quotes Requested</h3>
          <p>{totalQuotes}</p>
          <FaArrowRight className="arrow-icon" />
        </div>
        <div className="dashboard-card" onClick={() => navigate("/uploaded-documents")} style={{ cursor: 'pointer' }}>
          <FaFileAlt className="dashboard-icon" />
          <h3>Uploaded Documents</h3>
          <p>{uploadedFiles.length}</p>
          <FaArrowRight className="arrow-icon" />
        </div>
        <div className="dashboard-card">
          <FaBell className="dashboard-icon" />
          <h3>Pending Vendor Responses</h3>
          <p>{pendingResponses}</p>
        </div>
      </div>

      {/* 🔹 File Upload Section */}
      <div className="file-upload-section">
        <h2><FaUpload /> Upload Documents</h2>

        <label>Select Document Type:</label>
        <select value={documentType} onChange={(e) => setDocumentType(e.target.value)}>
          <option value="contract">Contract</option>
          <option value="bill">Bill</option>
        </select>

        <div className="upload-dropzone">
          <FaCloudUploadAlt size={50} />
          <p>{file ? file.name : "Drag & Drop a file here or Click to Upload"}</p>
          <input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" />
        </div>

        <button className="upload-button" onClick={handleUpload} disabled={loading}>
          {loading ? `Uploading... ${uploadProgress}%` : "Upload Document"}
        </button>

        {message && <p className="upload-message">{message}</p>}
      </div>
    </div>
  );
};

export default UserDashboard;
