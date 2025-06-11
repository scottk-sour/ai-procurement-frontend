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
} from "react-icons/fa";
import QuoteFunnel from "./Dashboard/QuoteFunnel";
import { useAuth } from "../context/AuthContext";
import { logout } from "../utils/auth";
import "../styles/VendorDashboard.css";

const VendorDashboard = () => {
  console.log("✅ VendorDashboard loaded"); // Debug: Confirm component mounts

  const navigate = useNavigate();
  const { auth } = useAuth();

  // State declarations
  const [vendorName, setVendorName] = useState(auth?.user?.name || "Vendor");
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState("contract");
  const [message, setMessage] = useState("");
  const [recentActivity, setRecentActivity] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [totalQuotes, setTotalQuotes] = useState(0);
  const [pendingQuotes, setPendingQuotes] = useState(0);
  const [acceptedQuotes, setAcceptedQuotes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [quotePage, setQuotePage] = useState(1);
  const [filePage, setFilePage] = useState(1);
  const itemsPerPage = 10;
  const [feedbackForm, setFeedbackForm] = useState({ quoteId: null, comment: "", rating: 0 });

  // Quote funnel data
  const [quoteFunnelData, setQuoteFunnelData] = useState({
    created: 0,
    pending: 0,
    matched: 0,
    completed: 0,
  });

  // Fetch vendor profile
  const fetchVendorProfile = useCallback(async () => {
    if (!auth?.token) return;
    try {
      console.log("Fetching vendor profile...");
      const response = await fetch("http://localhost:5000/api/vendors/profile", {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch vendor profile (Status: ${response.status})`);
      }
      const data = await response.json();
      setVendorName(data.vendor?.name || "Vendor");
      console.log("Vendor profile fetched:", data.vendor?.name);
    } catch (error) {
      console.error("Error fetching vendor profile:", error.message);
      setError(`Failed to load vendor profile: ${error.message}. Please try logging in again.`);
    }
  }, [auth?.token]);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!auth?.token || !auth?.user?.userId) return;
    console.log("Fetching VendorDashboard data");
    setLoading(true);
    setError(null);

    try {
      const [activityRes, filesRes, quotesRes] = await Promise.all([
        fetch(`http://localhost:5000/api/vendors/recent-activity?page=${filePage}&limit=${itemsPerPage}`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        }).then((res) => {
          if (!res.ok) {
            return res.json().then((errorData) => {
              throw new Error(errorData.message || `Failed to fetch recent activity (Status: ${res.status})`);
            });
          }
          return res.json();
        }),
        fetch(`http://localhost:5000/api/vendors/uploaded-files?page=${filePage}&limit=${itemsPerPage}`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        }).then((res) => {
          if (!res.ok) {
            return res.json().then((errorData) => {
              throw new Error(errorData.message || `Failed to fetch uploaded files (Status: ${res.status})`);
            });
          }
          return res.json();
        }),
        fetch(`http://localhost:5000/api/copier-quotes/supplier-quotes?vendorId=${auth.user?.userId}&page=${quotePage}&limit=${itemsPerPage}`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        }).then((res) => {
          if (!res.ok) {
            return res.json().then((errorData) => {
              throw new Error(errorData.message || `Failed to fetch quotes (Status: ${res.status})`);
            });
          }
          return res.json();
        }),
      ]);

      console.log("API responses:", {
        activities: (activityRes.activities || []).length,
        files: (filesRes.files || []).length,
        quotes: (quotesRes.quotes || []).length,
      });

      // Set state with default empty arrays
      setRecentActivity(activityRes.activities || []);
      setUploadedFiles(filesRes.files || []);
      setQuotes(quotesRes.quotes || []);

      // Safely handle quotes data
      const quotesArray = quotesRes.quotes || [];
      const created = quotesArray.length;
      const pending = quotesArray.filter((q) => q.status === "Pending").length;
      const matched = quotesArray.filter((q) => q.status === "Matched").length;
      const completed = quotesArray.filter((q) => q.status === "Completed").length;

      setQuoteFunnelData({
        created,
        pending,
        matched,
        completed,
      });

      setTotalQuotes(created);
      setPendingQuotes(pending);
      setAcceptedQuotes(completed);

      console.log("Tracking dashboard load for vendor:", auth.user?.userId);
    } catch (error) {
      console.error("Error fetching dashboard data:", error.message);
      setError(`Failed to load dashboard data: ${error.message}. Please try logging in again or contact support.`);
      // Set default empty arrays on error
      setRecentActivity([]);
      setUploadedFiles([]);
      setQuotes([]);
      setQuoteFunnelData({
        created: 0,
        pending: 0,
        matched: 0,
        completed: 0,
      });
      setTotalQuotes(0);
      setPendingQuotes(0);
      setAcceptedQuotes(0);
    } finally {
      setLoading(false);
    }
  }, [auth?.token, auth?.user?.userId, quotePage, filePage]);

  // Fetch data on mount and periodically
  useEffect(() => {
    console.log("useEffect running");
    fetchVendorProfile();
    fetchDashboardData();
    const intervalId = setInterval(fetchDashboardData, 300000); // Refresh every 5 minutes
    return () => clearInterval(intervalId);
  }, [auth, fetchVendorProfile, fetchDashboardData]);

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
    if (!file || !auth?.token) {
      setMessage("⚠ Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", documentType);

    setLoading(true);
    setUploadProgress(0);

    try {
      const response = await fetch("http://localhost:5000/api/vendors/upload", {
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
        console.log(`Tracking file upload by vendor: ${auth.user?.userId}`);
      } else {
        setMessage(data.message || "⚠ Upload failed.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessage("⚠ An error occurred during upload.");
    } finally {
      setLoading(false);
    }
  }, [file, documentType, fetchDashboardData, auth?.token, auth?.user?.userId]);

  const handleQuoteResponse = useCallback(async (quoteId, response) => {
    if (!auth?.token) return;
    try {
      const res = await fetch("http://localhost:5000/api/copier-quotes/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ quoteId, response }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to respond to quote.");
      }
      setMessage(`✅ Quote ${response} successfully!`);
      fetchDashboardData();
      console.log(`Tracking quote ${response} by vendor: ${auth.user?.userId}`);
    } catch (error) {
      console.error("Error responding to quote:", error);
      setMessage(`⚠ Failed to respond to quote: ${error.message}`);
    }
  }, [fetchDashboardData, auth?.token, auth?.user?.userId]);

  const handleFeedbackSubmit = useCallback(async (quoteId, vendorName, accepted) => {
    if (!auth?.token) return;
    try {
      const response = await fetch("http://localhost:5000/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          userId: auth.user?.userId,
          quoteId,
          vendorName,
          accepted,
          comment: feedbackForm.comment,
          rating: feedbackForm.rating || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit feedback.");
      }

      setMessage(`✅ Feedback submitted successfully for ${vendorName}!`);
      setFeedbackForm({ quoteId: null, comment: "", rating: 0 });
      fetchDashboardData();
      console.log(`Tracking feedback submission by vendor: ${auth.user?.userId}`);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setMessage(`⚠ Failed to submit feedback: ${error.message}`);
    }
  }, [feedbackForm, fetchDashboardData, auth?.token, auth?.user?.userId]);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/vendor-login", { replace: true });
    console.log("Tracking vendor logout");
  }, [navigate]);

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

  // Fallback if auth is undefined or invalid
  if (!auth) {
    console.log("❌ Auth is undefined, redirecting to /vendor-login");
    navigate("/vendor-login", { replace: true });
    return null;
  }

  // Debug: Log rendering conditions
  console.log("VendorDashboard render check:", {
    loading,
    error,
    quotesLength: (quotes || []).length,
    uploadedFilesLength: (uploadedFiles || []).length,
  });

  if (loading && (quotes || []).length === 0 && (uploadedFiles || []).length === 0) {
    return (
      <div className="loading-overlay" role="status" aria-live="polite">
        <div className="spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  if (error && (quotes || []).length === 0 && (uploadedFiles || []).length === 0) {
    return (
      <div className="vendor-dashboard">
        <div className="error-container">
          <p className="error">{error}</p>
          <button
            className="nav-button"
            onClick={fetchDashboardData}
            aria-label="Retry loading dashboard data"
          >
            Retry
          </button>
          <button
            className="nav-button logout-button"
            onClick={handleLogout}
            aria-label="Log out and re-authenticate"
          >
            Log Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-dashboard" style={{ backgroundColor: "lightblue", minHeight: "100vh", color: "black" }}>
      <header className="welcome-header">
        <h1>Welcome, {vendorName}!</h1>
      </header>

      <nav className="nav-bar">
        <button
          className="nav-button"
          onClick={() => navigate("/quotes")}
          aria-label="View all quotes"
        >
          <FaQuoteRight /> View Quotes
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

      <div className="dashboard-tabs" role="tablist" aria-label="Vendor dashboard navigation tabs">
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
          Quotes
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
                  <FaChartBar className="kpi-icon" />
                  <h3>Total Quotes</h3>
                  <p>{totalQuotes}</p>
                </div>
                <div className="kpi-box">
                  <FaFileAlt className="kpi-icon" />
                  <h3>Pending Quotes</h3>
                  <p>{pendingQuotes}</p>
                </div>
                <div className="kpi-box">
                  <FaBell className="kpi-icon" />
                  <h3>Accepted Quotes</h3>
                  <p>{acceptedQuotes}</p>
                </div>
                <div className="kpi-box">
                  <FaCloudUploadAlt className="kpi-icon" />
                  <h3>Uploaded Files</h3>
                  <p>{(uploadedFiles || []).length}</p>
                </div>
              </div>
            </section>

            <section className="quote-funnel-section">
              <h2>Quote Funnel</h2>
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
              <h2>Quote Requests</h2>
              {(quotes || []).length > 0 ? (
                <>
                  <div className="quotes-list">
                    {quotes.map((quote, index) => (
                      <div key={index} className="quote-card">
                        <div className="quote-header">
                          <h3>{quote.companyName || "Quote Request"}</h3>
                          <span className={`quote-status status-${(quote.status || "").toLowerCase().replace(/\s+/g, "-")}`}>
                            {quote.status || "Unknown"}
                          </span>
                        </div>
                        <div className="quote-details">
                          <p><strong>Date:</strong> {formatDate(quote.createdAt)}</p>
                          <p><strong>Industry:</strong> {quote.industryType || "Not specified"}</p>
                          <div className="volume-details">
                            <p><strong>Mono:</strong> {(quote.monthlyVolume?.mono || 0)} pages</p>
                            <p><strong>Colour:</strong> {(quote.monthlyVolume?.colour || 0)} pages</p>
                          </div>
                          {(quote.recommendations || [])[0] && (
                            <div className="recommendation-details">
                              <p><strong>Top Recommendation:</strong> {(quote.recommendations[0]?.vendorName || "N/A")}</p>
                              <p><strong>Price:</strong> £{(quote.recommendations[0]?.price || "N/A")}</p>
                              <p><strong>Speed:</strong> {(quote.recommendations[0]?.speed || "N/A")} ppm</p>
                              <p><strong>Savings:</strong> £{(quote.recommendations[0]?.savingsInfo?.monthlySavings || 0).toFixed(2)}/month</p>
                              <p><strong>Reasons:</strong> {(quote.recommendations[0]?.reasons || []).join(", ") || "N/A"}</p>
                            </div>
                          )}
                        </div>
                        <div className="quote-actions">
                          <div className="quote-response-buttons">
                            {quote.status === "Pending" && (
                              <>
                                <button
                                  className="accept-button"
                                  onClick={() => {
                                    handleQuoteResponse(quote._id, "accept");
                                    handleFeedbackSubmit(quote._id, (quote.recommendations || [])[0]?.vendorName || "Unknown", true);
                                  }}
                                  aria-label={`Accept quote for ${quote.companyName || "Quote Request"}`}
                                >
                                  Accept
                                </button>
                                <button
                                  className="decline-button"
                                  onClick={() => {
                                    handleQuoteResponse(quote._id, "decline");
                                    handleFeedbackSubmit(quote._id, (quote.recommendations || [])[0]?.vendorName || "Unknown", false);
                                  }}
                                  aria-label={`Decline quote for ${quote.companyName || "Quote Request"}`}
                                >
                                  Decline
                                </button>
                              </>
                            )}
                          </div>
                          {feedbackForm.quoteId === quote._id ? (
                            <div className="feedback-form">
                              <textarea
                                value={feedbackForm.comment}
                                onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                                placeholder="Add feedback (e.g., liked the price, too slow)"
                                maxLength={500}
                                aria-label="Feedback comment"
                              />
                              <select
                                value={feedbackForm.rating}
                                onChange={(e) => setFeedbackForm({ ...feedbackForm, rating: Number(e.target.value) })}
                                aria-label="Rate this vendor"
                              >
                                <option value="0">Rate (1-5)</option>
                                {[1, 2, 3, 4, 5].map((r) => (
                                  <option key={r} value={r}>{r}</option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleFeedbackSubmit(quote._id, (quote.recommendations || [])[0]?.vendorName || "Unknown", feedbackForm.accepted)}
                                disabled={!feedbackForm.comment}
                                aria-label="Submit feedback"
                              >
                                Submit Feedback
                              </button>
                              <button
                                onClick={() => setFeedbackForm({ quoteId: null, comment: "", rating: 0 })}
                                aria-label="Cancel feedback"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              className="feedback-button"
                              onClick={() => setFeedbackForm({ quoteId: quote._id, comment: "", rating: 0, accepted: true })}
                              aria-label={`Provide feedback for ${quote.companyName || "Quote Request"} quote`}
                            >
                              Add Feedback
                            </button>
                          )}
                          <button
                            className="view-quote-button"
                            onClick={() => navigate(`/quotes/${quote._id}`)}
                            aria-label={`View details for ${quote.companyName || "Quote Request"} quote`}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pagination">
                    <button
                      onClick={() => setQuotePage((prev) => Math.max(prev - 1, 1))}
                      disabled={quotePage === 1}
                      aria-label="Previous page of quotes"
                    >
                      Previous
                    </button>
                    <span>Page {quotePage}</span>
                    <button
                      onClick={() => setQuotePage((prev) => prev + 1)}
                      disabled={(quotes || []).length < itemsPerPage}
                      aria-label="Next page of quotes"
                    >
                      Next
                    </button>
                  </div>
                </>
              ) : (
                <p className="no-data">No quote requests available.</p>
              )}
            </section>
          </div>
        )}

        {activeTab === "files" && (
          <div id="files-panel" role="tabpanel">
            <section className="file-upload-section">
              <h2>File Upload</h2>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="document-type-select"
                aria-label="Select document type"
              >
                <option value="contract">Contract</option>
                <option value="bill">Bill</option>
                <option value="invoice">Invoice</option>
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
              <h2>Uploaded Files History</h2>
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
                      disabled={(uploadedFiles || []).length < itemsPerPage}
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
                      <li key={index} className="notification-item">
                        <div className="notification-icon">
                          {activity.type === "quote" && <FaQuoteRight />}
                          {activity.type === "upload" && <FaUpload />}
                          {activity.type === "login" && <FaBell />}
                          {activity.type === "signup" && <FaBell />}
                        </div>
                        <div className="notification-content">
                          <p className="notification-description">{activity.description}</p>
                          <p className="notification-date">{formatDate(activity.date)}</p>
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
                      disabled={(recentActivity || []).length < itemsPerPage}
                      aria-label="Next page of notifications"
                    >
                      Next
                    </button>
                  </div>
                </>
              ) : (
                <p className="no-data">No notifications available.</p>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default VendorDashboard;