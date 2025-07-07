import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaQuoteRight,
  FaUpload,
  FaSignOutAlt,
  FaChartBar,
  FaFileAlt,
  FaBell,
  FaCloudUploadAlt,
  FaDollarSign,
} from "react-icons/fa";
import QuoteFunnel from "./Dashboard/QuoteFunnel";
import { useAuth } from "../context/AuthContext";
import { logout } from "../utils/auth";
import "../styles/UserDashboard.css";

const UserDashboard = () => {
  console.log("✅ UserDashboard loaded");

  const navigate = useNavigate();
  const { auth, logout: authLogout } = useAuth();

  // State declarations
  const [userName, setUserName] = useState(auth?.user?.name || localStorage.getItem("userName") || "User");
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState("invoice");
  const [message, setMessage] = useState("");
  const [recentActivity, setRecentActivity] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [quoteRequests, setQuoteRequests] = useState([]);
  const [totalQuotesReceived, setTotalQuotesReceived] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [pendingNotifications, setPendingNotifications] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [requestPage, setRequestPage] = useState(1);
  const [filePage, setFilePage] = useState(1);
  const itemsPerPage = 10;

  // Quote funnel data
  const [quoteFunnelData, setQuoteFunnelData] = useState({
    created: 0,
    pending: 0,
    matched: 0,
    accepted: 0,
    declined: 0,
  });

  // Redirect if not authenticated as user
  useEffect(() => {
    if (!auth?.isAuthenticated || auth.user?.role !== "user") {
      console.log("❌ Not authenticated as user, redirecting to /login");
      navigate("/login", { replace: true, state: { from: "/dashboard" } });
    }
  }, [auth?.isAuthenticated, auth.user?.role, navigate]);

  // Fetch user profile
  const fetchUserProfile = useCallback(async () => {
    if (!auth?.isAuthenticated || auth.user?.role !== "user") return;

    try {
      console.log("Fetching user profile...");
      const response = await fetch("http://localhost:5000/api/users/profile", {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch user profile (Status: ${response.status})`);
      }
      const data = await response.json();
      setUserName(data.user?.name || "User");
      localStorage.setItem("userName", data.user?.name || "User");
      console.log("User profile fetched:", data.user?.name);
    } catch (error) {
      console.error("Error fetching user profile:", error.message);
      setError(`Failed to load user profile: ${error.message}. Please try logging in again.`);
    }
  }, [auth?.isAuthenticated, auth.user?.role, auth.token]);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!auth?.isAuthenticated || auth.user?.role !== "user") return;

    console.log("Fetching UserDashboard data");
    setLoading(true);
    setError(null);

    try {
      const [activityRes, filesRes, requestsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/users/recent-activity?page=${filePage}&limit=${itemsPerPage}`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        }).then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || `Failed to fetch recent activity (Status: ${res.status})`);
          }
          return res.json();
        }).catch((err) => {
          console.warn("Activity fetch failed:", err.message);
          return { activities: [] }; // Fallback to empty array
        }),
        fetch(`http://localhost:5000/api/users/uploaded-files?page=${filePage}&limit=${itemsPerPage}`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        }).then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || `Failed to fetch uploaded files (Status: ${res.status})`);
          }
          return res.json();
        }).catch((err) => {
          console.warn("Files fetch failed:", err.message);
          return { files: [] }; // Fallback to empty array
        }),
        fetch(`http://localhost:5000/api/copier-quotes/requests?userId=${auth.user?.userId}&page=${requestPage}&limit=${itemsPerPage}`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        }).then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || `Failed to fetch quote requests (Status: ${res.status})`);
          }
          return res.json();
        }).catch((err) => {
          console.warn("Quotes fetch failed:", err.message);
          return { requests: [] }; // Fallback to empty array
        }),
      ]);

      console.log("API responses:", {
        activities: (activityRes.activities || []).length,
        files: (filesRes.files || []).length,
        requests: (requestsRes.requests || []).length,
      });

      setRecentActivity(activityRes.activities || []);
      setUploadedFiles(filesRes.files || []);
      setQuoteRequests(requestsRes.requests || []);

      const requestsArray = requestsRes.requests || [];
      const created = requestsArray.length;
      const pending = requestsArray.filter((r) => r.status === "Pending").length;
      const matched = requestsArray.filter((r) => r.status === "Matched").length;
      const accepted = requestsArray.filter((r) => r.status === "Accepted").length;
      const declined = requestsArray.filter((r) => r.status === "Declined").length;

      setQuoteFunnelData({
        created,
        pending,
        matched,
        accepted,
        declined,
      });

      // Calculate KPIs
      const totalQuotes = requestsArray.reduce((sum, r) => sum + (r.matches || []).length, 0);
      const totalSavings = requestsArray.reduce((sum, r) => sum + ((r.matches || [])[0]?.savings || 0), 0);
      const pendingNotifications = (activityRes.activities || []).filter((a) => a.status === "pending").length;

      setTotalQuotesReceived(totalQuotes);
      setTotalSavings(totalSavings);
      setPendingNotifications(pendingNotifications);

      // Set error only if all fetches failed
      if (!activityRes.activities?.length && !filesRes.files?.length && !requestsRes.requests?.length) {
        setError("Failed to load dashboard data. Some API endpoints may be unavailable. Please contact support.");
      }

      console.log("Tracking dashboard load for user:", auth.user?.userId);
    } catch (error) {
      console.error("Error fetching dashboard data:", error.message);
      setError(`Failed to load dashboard data: ${error.message}. Please try logging in again or contact support.`);
      setRecentActivity([]);
      setUploadedFiles([]);
      setQuoteRequests([]);
      setQuoteFunnelData({
        created: 0,
        pending: 0,
        matched: 0,
        accepted: 0,
        declined: 0,
      });
      setTotalQuotesReceived(0);
      setTotalSavings(0);
      setPendingNotifications(0);
    } finally {
      setLoading(false);
    }
  }, [auth?.isAuthenticated, auth.user?.role, auth.user?.userId, auth.token, requestPage, filePage]);

  // Fetch data on mount and periodically
  useEffect(() => {
    console.log("useEffect running");
    if (auth?.isAuthenticated && auth.user?.role === "user") {
      fetchUserProfile();
      fetchDashboardData();
      const intervalId = setInterval(fetchDashboardData, 300000); // Refresh every 5 minutes
      return () => clearInterval(intervalId);
    }
  }, [auth?.isAuthenticated, auth.user?.role, fetchUserProfile, fetchDashboardData]);

  const handleFileChange = useCallback((event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage(`✅ Selected: ${selectedFile.name}`);
    } else {
      setMessage("⚠ No file selected.");
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!file) {
      setMessage("⚠ Please select a file to upload.");
      return;
    }
    if (!auth?.isAuthenticated || auth.user?.role !== "user") return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", documentType);

    setLoading(true);
    setUploadProgress(0);

    try {
      const response = await fetch("http://localhost:5000/api/users/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${auth.token}` },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("✅ File uploaded successfully!");
        setUploadProgress(100);
        fetchDashboardData();
        setFile(null);
        console.log(`Tracking file upload by user: ${auth.user?.userId}`);
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
  }, [file, documentType, fetchDashboardData, auth?.isAuthenticated, auth.user?.role, auth.user?.userId, auth.token]);

  const handleAcceptQuote = useCallback(async (quoteId, vendorName) => {
    if (!auth?.isAuthenticated || auth.user?.role !== "user") return;

    try {
      const response = await fetch("http://localhost:5000/api/copier-quotes/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ quoteId, vendorName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to accept quote.");
      }

      setMessage(`✅ Quote from ${vendorName} accepted successfully!`);
      fetchDashboardData();
      console.log(`Tracking quote acceptance by user: ${auth.user?.userId}`);
    } catch (error) {
      console.error("Error accepting quote:", error);
      setMessage(`⚠ Failed to accept quote: ${error.message}`);
    }
  }, [fetchDashboardData, auth?.isAuthenticated, auth.user?.role, auth.user?.userId, auth.token]);

  const handleContactVendor = useCallback(async (quoteId, vendorName) => {
    if (!auth?.isAuthenticated || auth.user?.role !== "user") return;

    try {
      const response = await fetch("http://localhost:5000/api/copier-quotes/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ quoteId, vendorName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to contact vendor.");
      }

      setMessage(`✅ Contact request sent to ${vendorName}!`);
      fetchDashboardData();
      console.log(`Tracking vendor contact by user: ${auth.user?.userId}`);
    } catch (error) {
      console.error("Error contacting vendor:", error);
      setMessage(`⚠ Failed to contact vendor: ${error.message}`);
    }
  }, [fetchDashboardData, auth?.isAuthenticated, auth.user?.role, auth.user?.userId, auth.token]);

  const handleNewQuoteRequest = useCallback(() => {
    navigate("/quotes/new");
  }, [navigate]);

  const handleLogout = useCallback(() => {
    authLogout();
    logout();
    localStorage.removeItem("userName");
    navigate("/login", { replace: true });
    console.log("Tracking user logout");
  }, [navigate, authLogout]);

  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  // Debug: Log rendering conditions
  console.log("UserDashboard render check:", {
    loading,
    error,
    requestsLength: (quoteRequests || []).length,
    uploadedFilesLength: (uploadedFiles || []).length,
  });

  if (loading && (quoteRequests || []).length === 0 && (uploadedFiles || []).length === 0) {
    return (
      <div className="loading-overlay" role="status" aria-live="polite">
        <div className="spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="user-dashboard" style={{ backgroundColor: "lightblue", minHeight: "100vh", color: "black" }}>
      <header className="welcome-header">
        <h1>Welcome, {userName} 👋</h1>
      </header>

      <nav className="nav-bar">
        <button
          className="nav-button"
          onClick={handleNewQuoteRequest}
          aria-label="Create new quote request"
        >
          <FaQuoteRight /> New Quote Request
        </button>
        <label className="nav-button upload-label" htmlFor="file-upload">
          <FaUpload /> Upload Documents
          <input
            id="file-upload"
            type="file"
            className="file-input"
            accept=".pdf,.csv,.xlsx,.xls,.png,.jpg,.jpeg"
            onChange={handleFileChange}
          />
        </label>
        <button
          className="nav-button theme-toggle-button"
          onClick={() => navigate("/account-settings")}
          aria-label="Go to settings"
        >
          <FaChartBar /> Settings
        </button>
        <button
          className="nav-button logout-button"
          onClick={handleLogout}
          aria-label="Log out"
        >
          <FaSignOutAlt /> Logout
        </button>
      </nav>

      <div className="dashboard-tabs" role="tablist" aria-label="User dashboard navigation tabs">
        <button
          className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
          role="tab"
          aria-selected={activeTab === "overview"}
          aria-controls="overview-panel"
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === "quotes" ? "active" : ""}`}
          onClick={() => setActiveTab("quotes")}
          role="tab"
          aria-selected={activeTab === "quotes"}
          aria-controls="quotes-panel"
        >
          Quote Results
        </button>
        <button
          className={`tab-button ${activeTab === "files" ? "active" : ""}`}
          onClick={() => setActiveTab("files")}
          role="tab"
          aria-selected={activeTab === "files"}
          aria-controls="files-panel"
        >
          Files
        </button>
        <button
          className={`tab-button ${activeTab === "notifications" ? "active" : ""}`}
          onClick={() => setActiveTab("notifications")}
          role="tab"
          aria-selected={activeTab === "notifications"}
          aria-controls="notifications-panel"
        >
          Notifications
        </button>
      </div>

      <main className="dashboard-content">
        {activeTab === "overview" && (
          <div id="overview-panel" role="tabpanel">
            <section className="kpi-section">
              <div className="kpi-container">
                <div className="kpi-box">
                  <FaQuoteRight className="kpi-icon" />
                  <h3>Quotes Received</h3>
                  <p>{totalQuotesReceived}</p>
                </div>
                <div className="kpi-box">
                  <FaDollarSign className="kpi-icon" />
                  <h3>Total Estimated Savings</h3>
                  <p>£{totalSavings.toFixed(2)}</p>
                </div>
                <div className="kpi-box">
                  <FaBell className="kpi-icon" />
                  <h3>Pending Notifications</h3>
                  <p>{pendingNotifications}</p>
                </div>
              </div>
            </section>

            <section className="quote-funnel-section">
              <h2>Quote Request Progress</h2>
              <QuoteFunnel data={quoteFunnelData} isLoading={loading} />
            </section>

            <section className="recent-activity-section">
              <h2>Recent Activity</h2>
              {(recentActivity || []).length > 0 ? (
                <>
                  <ul className="activity-list">
                    {recentActivity.map((activity, index) => (
                      <li key={index} className="activity-item">
                        <div className="activity-icon">
                          {activity.type === "quote" && <FaQuoteRight />}
                          {activity.type === "upload" && <FaUpload />}
                          {activity.type === "login" && <FaBell />}
                          {activity.type === "signup" && <FaBell />}
                        </div>
                        <div className="activity-content">
                          <p className="activity-description">{activity.description}</p>
                          <p className="activity-date">{formatDate(activity.date)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="pagination">
                    <button
                      onClick={() => setFilePage((prev) => Math.max(prev - 1, 1))}
                      disabled={filePage === 1}
                      aria-label="Previous page of activities"
                    >
                      Previous
                    </button>
                    <span>Page {filePage}</span>
                    <button
                      onClick={() => setFilePage((prev) => prev + 1)}
                      disabled={(recentActivity || []).length < itemsPerPage}
                      aria-label="Next page of activities"
                    >
                      Next
                    </button>
                  </div>
                </>
              ) : (
                <p className="no-data">No recent activity available.</p>
              )}
            </section>
          </div>
        )}

        {activeTab === "quotes" && (
          <div id="quotes-panel" role="tabpanel">
            <section className="quotes-section">
              <h2>Your Quote Results</h2>
              {(quoteRequests || []).length > 0 ? (
                <>
                  <div className="quotes-list">
                    {quoteRequests.map((request, index) => (
                      <div key={index} className="quote-card">
                        <div className="quote-header">
                          <h3>{request.title || "Quote Request"}</h3>
                          <span className={`quote-status status-${(request.status || "").toLowerCase().replace(/\s+/g, "-")}`}>
                            {request.status || "Unknown"}
                          </span>
                        </div>
                        <div className="quote-details">
                          <p><strong>Date:</strong> {formatDate(request.createdAt)}</p>
                          <p><strong>Industry:</strong> {request.industryType || "Not specified"}</p>
                          <div className="volume-details">
                            <p><strong>Mono:</strong> {(request.monthlyVolume?.mono || 0)} pages</p>
                            <p><strong>Colour:</strong> {(request.monthlyVolume?.colour || 0)} pages</p>
                          </div>
                          {(request.matches || []).length > 0 ? (
                            <div className="matches-details">
                              <h4>Vendor Matches (Up to 3)</h4>
                              {(request.matches || []).slice(0, 3).map((match, idx) => (
                                <div key={idx} className="match-item">
                                  <p><strong>Vendor:</strong> {match.vendorName || "N/A"}</p>
                                  <p><strong>Overview:</strong> {match.overview || "N/A"}</p>
                                  <p><strong>Model:</strong> {(match.machineSpecs?.model || "N/A")}</p>
                                  <p><strong>Speed:</strong> {(match.machineSpecs?.speed || 0)} ppm</p>
                                  <p><strong>Lease Price:</strong> £{(match.pricing?.lease || 0).toFixed(2)}</p>
                                  <p><strong>CPC:</strong> £{(match.pricing?.cpc || 0).toFixed(4)}</p>
                                  <p><strong>Response Time:</strong> {(match.serviceDetails?.responseTime || "N/A")}</p>
                                  <p><strong>Includes Toner:</strong> {match.serviceDetails?.includesToner ? "Yes" : "No"}</p>
                                  <div className="actions">
                                    <button
                                      className="contact-button"
                                      onClick={() => handleContactVendor(request._id, match.vendorName)}
                                      aria-label={`Contact ${match.vendorName} for this quote`}
                                    >
                                      Contact Vendor
                                    </button>
                                    <button
                                      className="accept-button"
                                      onClick={() => handleAcceptQuote(request._id, match.vendorName)}
                                      aria-label={`Accept quote from ${match.vendorName}`}
                                    >
                                      Accept Quote
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p>No vendor matches yet.</p>
                          )}
                        </div>
                        <div className="quote-actions">
                          <button
                            className="new-quote-button"
                            onClick={handleNewQuoteRequest}
                            aria-label="Request another quote"
                          >
                            Request Another Quote
                          </button>
                          <button
                            className="view-quote-button"
                            onClick={() => navigate(`/quotes/${request._id}`)}
                            aria-label={`View details for ${request.title || "Quote Request"}`}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pagination">
                    <button
                      onClick={() => setRequestPage((prev) => Math.max(prev - 1, 1))}
                      disabled={requestPage === 1}
                      aria-label="Previous page of quote requests"
                    >
                      Previous
                    </button>
                    <span>Page {requestPage}</span>
                    <button
                      onClick={() => setRequestPage((prev) => prev + 1)}
                      disabled={(quoteRequests || []).length < itemsPerPage}
                      aria-label="Next page of quote requests"
                    >
                      Next
                    </button>
                  </div>
                </>
              ) : (
                <p className="no-data">
                  No quote requests available.{" "}
                  <button onClick={handleNewQuoteRequest} className="quote-button">
                    Create one now
                  </button>.
                </p>
              )}
            </section>
          </div>
        )}

        {activeTab === "files" && (
          <div id="files-panel" role="tabpanel">
            <section className="file-upload-section">
              <h2>Upload Documents</h2>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="document-type-select"
                aria-label="Select document type"
              >
                <option value="lease">Lease</option>
                <option value="invoice">Invoice</option>
                <option value="spec-sheet">Spec Sheet</option>
                <option value="other">Other</option>
              </select>
              <div
                className="upload-dropzone"
                onClick={() => document.querySelector(".file-input").click()}
                role="button"
                aria-label="Upload a file"
              >
                <FaCloudUploadAlt size={50} />
                <p>{file ? file.name : "Drag & Drop a file here or Click to Upload"}</p>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.csv,.xlsx,.xls,.png,.jpg,.jpeg"
                  className="file-input"
                />
              </div>
              <button
                className="nav-button upload"
                onClick={handleUpload}
                disabled={loading}
                aria-label="Upload selected document"
              >
                {loading ? `Uploading... ${uploadProgress}%` : "Upload Document"}
              </button>
              {message && (
                <p className={`upload-message ${message.includes("success") ? "success" : "error"}`}>
                  {message}
                </p>
              )}
            </section>
            <section className="uploaded-files">
              <h2>Uploaded Files</h2>
              {(uploadedFiles || []).length > 0 ? (
                <>
                  <div className="files-list">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="file-card">
                        <div className="file-icon">
                          {file.fileType === "pdf" && <span className="file-type-pdf">PDF</span>}
                          {file.fileType === "csv" && <span className="file-type-csv">CSV</span>}
                          {file.fileType === "xlsx" && <span className="file-type-xlsx">XLSX</span>}
                          {file.fileType === "xls" && <span className="file-type-xls">XLS</span>}
                          {file.fileType === "png" && <span className="file-type-image">PNG</span>}
                          {file.fileType === "jpg" && <span className="file-type-image">JPG</span>}
                          {file.fileType === "jpeg" && <span className="file-type-image">JPEG</span>}
                        </div>
                        <div className="file-details">
                          <p><strong>Name:</strong> {file.fileName}</p>
                          <p><strong>Type:</strong> {file.documentType || file.fileType}</p>
                          <p><strong>Uploaded:</strong> {formatDate(file.uploadDate)}</p>
                        </div>
                        <div className="file-actions">
                          <a href={file.filePath} download className="download-button">
                            Download
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pagination">
                    <button
                      onClick={() => setFilePage((prev) => Math.max(prev - 1, 1))}
                      disabled={filePage === 1}
                      aria-label="Previous page of files"
                    >
                      Previous
                    </button>
                    <span>Page {filePage}</span>
                    <button
                      onClick={() => setFilePage((prev) => prev + 1)}
                      disabled={(uploadedFiles?.length || 0) < itemsPerPage}
                      aria-label="Next page of files"
                    >
                      Next
                    </button>
                  </div>
                </>
              ) : (
                <p className="no-data">No files uploaded yet.</p>
              )}
            </section>
          </div>
        )}

        {activeTab === "notifications" && (
          <div id="notifications-panel" role="tabpanel">
            <section className="notifications-section">
              <h2>Notifications</h2>
              {(recentActivity || []).length > 0 ? (
                <>
                  <ul className="notifications-list">
                    {recentActivity.map((activity, index) => (
                      <li key={index} className="activity-item">
                        <div className="activity-indicator">
                          {activity.type === "quote" && <FaQuoteRight />}
                          {activity.type === "upload" && <FaUpload />}
                          {activity.type === "login" && <FaBell />}
                          {activity.type === "signup" && <FaBell />}
                        </div>
                        <div className="activity-content">
                          <p className="activity-description">{activity.description}</p>
                          <p className="activity-date">{formatDate(activity.date)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="pagination">
                    <button
                      onClick={() => setFilePage((prev) => Math.max(prev - 1, 1))}
                      disabled={filePage === 1}
                      aria-label="Previous page of notifications"
                    >
                      Previous
                    </button>
                    <span>Page {filePage}</span>
                    <button
                      onClick={() => setFilePage((prev) => prev + 1)}
                      disabled={((recentActivity || []).length) < itemsPerPage}
                      aria-label="Next page of notifications"
                    >
                      Next
                    </button>
                  </div>
                </>
              ) : (
                <p className="no-data">No recent activity available.</p>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
