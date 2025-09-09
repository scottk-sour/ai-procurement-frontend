import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  FaExclamationTriangle,
  FaCheckCircle,
  FaSpinner,
  FaEye,
  FaPhone,
  FaDownload,
  FaPlus,
  FaSearch,
  FaSync,
} from "react-icons/fa";
import QuoteFunnel from "./Dashboard/QuoteFunnel";
import { useAuth } from "../context/AuthContext";
import { logout } from "../utils/auth";
import "../styles/UserDashboard.css";

// Constants
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const ITEMS_PER_PAGE = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [".pdf", ".csv", ".xlsx", ".xls", ".png", ".jpg", ".jpeg"];

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

const formatCurrency = (amount) => {
  if (typeof amount !== "number" || isNaN(amount)) return "£0.00";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
};

const getStatusColor = (status) => {
  const statusColors = {
    pending: "#f59e0b",
    matched: "#10b981",
    accepted: "#059669",
    declined: "#ef4444",
    created: "#6b7280",
    cancelled: "#9ca3af",
  };
  return statusColors[status?.toLowerCase()] || "#6b7280";
};

const validateFile = (file) => {
  if (!file) return { isValid: false, error: "No file selected" };

  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB` };
  }

  const fileExtension = "." + file.name.split(".").pop().toLowerCase();
  if (!ACCEPTED_FILE_TYPES.includes(fileExtension)) {
    return {
      isValid: false,
      error: `File type not supported. Accepted types: ${ACCEPTED_FILE_TYPES.join(", ")}`,
    };
  }

  return { isValid: true, error: null };
};

// Helper function to get user ID from either field name
const getUserId = (record) => {
  return record.userId || record.submittedBy;
};

const UserDashboard = () => {
  console.log("✅ UserDashboard component initialized");
  console.log("🔧 API_BASE_URL:", API_BASE_URL);

  const navigate = useNavigate();
  const { auth, logout: authLogout } = useAuth();

  // Core state
  const [userName, setUserName] = useState(
    auth?.user?.name || localStorage.getItem("userName") || "User"
  );
  const [activeTab, setActiveTab] = useState("overview");
  const [globalError, setGlobalError] = useState(null);
  const [globalLoading, setGlobalLoading] = useState(false);

  // File upload state
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState("invoice");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Pagination state
  const [requestPage, setRequestPage] = useState(1);
  const [filePage, setFilePage] = useState(1);
  const [activityPage, setActivityPage] = useState(1);

  // Data state
  const [recentActivity, setRecentActivity] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [quoteRequests, setQuoteRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // KPI state
  const [kpiData, setKpiData] = useState({
    totalQuotesReceived: 0,
    totalSavings: 0,
    pendingNotifications: 0,
    activeRequests: 0,
  });

  // Quote funnel state
  const [quoteFunnelData, setQuoteFunnelData] = useState({
    created: 0,
    pending: 0,
    matched: 0,
    accepted: 0,
    declined: 0,
  });

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Get current user ID - FIXED: Single declaration
  const currentUserId = useMemo(() => {
    return auth?.user?.userId || auth?.user?.id;
  }, [auth?.user?.userId, auth?.user?.id]);

  // Authentication check
  useEffect(() => {
    if (!auth?.isAuthenticated || auth.user?.role !== "user") {
      console.log("❌ Authentication failed, redirecting to login");
      navigate("/login", { replace: true, state: { from: "/dashboard" } });
    }
  }, [auth?.isAuthenticated, auth.user?.role, navigate]);

  // Fetch user profile
  const fetchUserProfile = useCallback(async () => {
    if (!auth?.isAuthenticated || !auth?.token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }

      const data = await response.json();
      const profileName = data.user?.name || data.name || "User";
      setUserName(profileName);
      localStorage.setItem("userName", profileName);
      console.log("✅ User profile loaded:", profileName);
    } catch (error) {
      console.error("❌ Profile fetch error:", error);
      setGlobalError("Failed to load user profile. Please try again.");
    }
  }, [auth?.isAuthenticated, auth?.token]);

  // Fetch dashboard data with improved error handling
  const fetchDashboardData = useCallback(async () => {
    if (!auth?.isAuthenticated || !auth?.token || !currentUserId) return;

    setGlobalLoading(true);
    setGlobalError(null);

    try {
      const endpoints = [
        {
          url: `${API_BASE_URL}/api/users/recent-activity?page=${activityPage}&limit=${ITEMS_PER_PAGE}`,
          key: "activities",
          fallback: []
        },
        {
          url: `${API_BASE_URL}/api/users/uploaded-files?page=${filePage}&limit=${ITEMS_PER_PAGE}`,
          key: "files",
          fallback: []
        },
        {
          // FIXED: Updated to handle both userId and submittedBy fields
          url: `${API_BASE_URL}/api/quotes/requests?userId=${currentUserId}&submittedBy=${currentUserId}&page=${requestPage}&limit=${ITEMS_PER_PAGE}`,
          key: "requests",
          fallback: []
        },
        {
          url: `${API_BASE_URL}/api/users/notifications?page=1&limit=50`,
          key: "notifications",
          fallback: []
        },
      ];

      const responses = await Promise.allSettled(
        endpoints.map(async (endpoint) => {
          try {
            const response = await fetch(endpoint.url, {
              headers: { Authorization: `Bearer ${auth.token}` },
            });

            if (!response.ok) {
              console.warn(`⚠️ ${endpoint.key} endpoint returned ${response.status}, using fallback data`);
              return { ...endpoint, data: { [endpoint.key]: endpoint.fallback } };
            }

            const data = await response.json();
            return { ...endpoint, data };
          } catch (error) {
            console.warn(`⚠️ ${endpoint.key} fetch failed:`, error.message, "- using fallback data");
            return { ...endpoint, data: { [endpoint.key]: endpoint.fallback } };
          }
        })
      );

      const newData = {
        activities: [],
        files: [],
        requests: [],
        notifications: [],
      };

      responses.forEach((response, index) => {
        if (response.status === "fulfilled") {
          const { key, data } = response.value;
          newData[key] = data[key] || data.data || data || [];
        } else {
          console.warn(`❌ ${endpoints[index].key} completely failed:`, response.reason);
          newData[endpoints[index].key] = endpoints[index].fallback;
        }
      });

      // FIXED: Filter quote requests to only show user's own requests
      const userQuoteRequests = newData.requests.filter(request => {
        const requestUserId = getUserId(request);
        return requestUserId === currentUserId;
      });

      // Update state with fetched or fallback data
      setRecentActivity(newData.activities);
      setUploadedFiles(newData.files);
      setQuoteRequests(userQuoteRequests); // Use filtered requests
      setNotifications(newData.notifications);

      // Calculate KPIs using filtered requests
      const totalQuotes = userQuoteRequests.reduce((sum, r) => sum + (r.matches?.length || 0), 0);
      const totalSavings = userQuoteRequests.reduce((sum, r) => {
        const bestMatch = r.matches?.[0];
        return sum + (bestMatch?.savings || 0);
      }, 0);
      const pendingNotifications = newData.notifications.filter((n) => n.status === "unread").length;
      const activeRequests = userQuoteRequests.filter((r) =>
        ["pending", "matched"].includes(r.status?.toLowerCase())
      ).length;

      setKpiData({
        totalQuotesReceived: totalQuotes,
        totalSavings,
        pendingNotifications,
        activeRequests,
      });

      // Calculate quote funnel using filtered requests
      const funnelData = {
        created: userQuoteRequests.length,
        pending: userQuoteRequests.filter((r) => r.status?.toLowerCase() === "pending").length,
        matched: userQuoteRequests.filter((r) => r.status?.toLowerCase() === "matched").length,
        accepted: userQuoteRequests.filter((r) => r.status?.toLowerCase() === "accepted").length,
        declined: userQuoteRequests.filter((r) => r.status?.toLowerCase() === "declined").length,
      };

      setQuoteFunnelData(funnelData);

      console.log("✅ Dashboard data loaded successfully");
    } catch (error) {
      console.error("❌ Dashboard fetch error:", error);
      setGlobalError("Some data couldn't be loaded. Using available information.");
    } finally {
      setGlobalLoading(false);
    }
  }, [auth?.isAuthenticated, auth?.token, currentUserId, requestPage, filePage, activityPage]);

  // Initial data fetch and periodic refresh
  useEffect(() => {
    if (auth?.isAuthenticated && auth.user?.role === "user" && currentUserId) {
      fetchUserProfile();
      fetchDashboardData();

      const intervalId = setInterval(fetchDashboardData, REFRESH_INTERVAL);
      return () => clearInterval(intervalId);
    }
  }, [auth?.isAuthenticated, auth.user?.role, currentUserId, fetchUserProfile, fetchDashboardData]);

  // File upload handlers
  const handleFileChange = useCallback(
    (event) => {
      const selectedFile = event.target.files[0];
      if (!selectedFile) {
        setFile(null);
        setUploadMessage("");
        return;
      }

      const validation = validateFile(selectedFile);
      if (!validation.isValid) {
        setUploadMessage(validation.error);
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setUploadMessage(`✅ Selected: ${selectedFile.name}`);
      console.log("📁 File selected:", selectedFile.name);
    },
    []
  );

  const handleUpload = useCallback(
    async () => {
      if (!file) {
        setUploadMessage("⚠️ Please select a file to upload.");
        return;
      }

      if (!auth?.token) {
        setUploadMessage("⚠️ Authentication error. Please log in again.");
        return;
      }

      const validation = validateFile(file);
      if (!validation.isValid) {
        setUploadMessage(validation.error);
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("documentType", documentType);

        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setUploadProgress(Math.round(percentComplete));
          }
        };

        const uploadPromise = new Promise((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status === 200) {
              resolve(JSON.parse(xhr.responseText));
            } else {
              reject(new Error(`Upload failed: ${xhr.status}`));
            }
          };
          xhr.onerror = () => reject(new Error("Upload failed"));
        });

        xhr.open("POST", `${API_BASE_URL}/api/users/upload`);
        xhr.setRequestHeader("Authorization", `Bearer ${auth.token}`);
        xhr.send(formData);

        await uploadPromise;

        setUploadMessage("✅ File uploaded successfully!");
        setFile(null);
        setUploadProgress(100);

        console.log("✅ File uploaded successfully:", file.name);

        // Refresh file list
        fetchDashboardData();

        // Reset upload UI after 3 seconds
        setTimeout(() => {
          setUploadProgress(0);
          setUploadMessage("");
        }, 3000);
      } catch (error) {
        console.error("❌ Upload error:", error);
        setUploadMessage(`⚠️ Upload failed: ${error.message}`);
      } finally {
        setIsUploading(false);
      }
    },
    [file, documentType, auth?.token, fetchDashboardData]
  );

  // Quote action handlers
  const handleAcceptQuote = useCallback(
    async (quoteId, vendorName) => {
      if (!auth?.token) {
        setUploadMessage("⚠️ Authentication error. Please log in again.");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/quotes/accept`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify({ quoteId, vendorName }),
        });

        if (!response.ok) {
          throw new Error(`Failed to accept quote: ${response.status}`);
        }

        setUploadMessage(`✅ Quote from ${vendorName} accepted successfully!`);
        console.log("✅ Quote accepted:", { quoteId, vendorName });
        fetchDashboardData();
      } catch (error) {
        console.error("❌ Accept quote error:", error);
        setUploadMessage(`⚠️ Failed to accept quote: ${error.message}`);
      }
    },
    [auth?.token, fetchDashboardData]
  );

  const handleContactVendor = useCallback(
    async (quoteId, vendorName) => {
      if (!auth?.token) {
        setUploadMessage("⚠️ Authentication error. Please log in again.");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/quotes/contact`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify({ quoteId, vendorName }),
        });

        if (!response.ok) {
          throw new Error(`Failed to contact vendor: ${response.status}`);
        }

        setUploadMessage(`✅ Contact request sent to ${vendorName}!`);
        console.log("✅ Vendor contacted:", { quoteId, vendorName });
        fetchDashboardData();
      } catch (error) {
        console.error("❌ Contact vendor error:", error);
        setUploadMessage(`⚠️ Failed to contact vendor: ${error.message}`);
      }
    },
    [auth?.token, fetchDashboardData]
  );

  // ✅ FIXED: Navigation handlers - Updated to use correct route
  const handleNewQuoteRequest = useCallback(() => {
    navigate("/request-quote");
    console.log("🚀 Navigating to quote request form");
  }, [navigate]);

  // FIXED: Navigate to quotes with status filter
  const handleQuotesNavigation = useCallback((status = 'all') => {
    navigate(`/quotes?status=${status}`);
    console.log("🚀 Navigating to quotes with status:", status);
  }, [navigate]);

  const handleLogout = useCallback(() => {
    try {
      authLogout();
      logout();
      localStorage.removeItem("userName");
      navigate("/login", { replace: true });
      console.log("✅ User logged out successfully");
    } catch (error) {
      console.error("❌ Logout error:", error);
      setGlobalError("Failed to logout. Please try again.");
    }
  }, [navigate, authLogout]);

  // Notification handlers
  const markNotificationAsRead = useCallback(
    async (notificationId) => {
      if (!auth?.token) {
        setGlobalError("Authentication error. Please log in again.");
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/users/notifications/${notificationId}/read`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );

        if (response.ok) {
          console.log("✅ Notification marked as read:", notificationId);
          fetchDashboardData();
        } else {
          throw new Error(`Failed to mark notification as read: ${response.status}`);
        }
      } catch (error) {
        console.error("❌ Mark notification error:", error);
        setGlobalError("Failed to mark notification as read. Please try again.");
      }
    },
    [auth?.token, fetchDashboardData]
  );

  // File download handler
  const handleDownloadFile = useCallback(
    async (fileId, fileName) => {
      if (!auth?.token) {
        setUploadMessage("⚠️ Authentication error. Please log in again.");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/users/files/${fileId}/download`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });

        if (!response.ok) {
          throw new Error(`Failed to download file: ${response.status}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        console.log("✅ File downloaded:", { fileId, fileName });
      } catch (error) {
        console.error("❌ Download error:", error);
        setUploadMessage(`⚠️ Failed to download file: ${error.message}`);
      }
    },
    [auth?.token]
  );

  // FIXED: Filtered quote requests with proper user ownership check
  const filteredQuoteRequests = useMemo(() => {
    return quoteRequests.filter((request) => {
      // Ensure the request belongs to the current user
      const requestUserId = getUserId(request);
      const belongsToUser = requestUserId === currentUserId;
      
      const matchesSearch =
        !searchTerm ||
        request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.industryType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.companyName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || request.status?.toLowerCase() === statusFilter.toLowerCase();

      return belongsToUser && matchesSearch && matchesStatus;
    });
  }, [quoteRequests, searchTerm, statusFilter, currentUserId]);

  // Pagination handlers
  const handleNextPage = useCallback((setPage, currentPage) => {
    setPage(currentPage + 1);
    console.log("📄 Next page:", currentPage + 1);
  }, []);

  const handlePrevPage = useCallback((setPage, currentPage) => {
    if (currentPage > 1) {
      setPage(currentPage - 1);
      console.log("📄 Previous page:", currentPage - 1);
    }
  }, []);

  // Loading state
  if (globalLoading && quoteRequests.length === 0 && recentActivity.length === 0) {
    return (
      <div className="loading-overlay" role="status" aria-live="polite" data-testid="loading-overlay">
        <div className="loading-spinner">
          <FaSpinner className="fa-spin" size={48} />
        </div>
        <p className="loading-text">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="user-dashboard" data-testid="user-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1 data-testid="welcome-header">Welcome back, {userName} 👋</h1>
            <p className="header-subtitle">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="header-actions">
            <button
              className="refresh-button"
              onClick={fetchDashboardData}
              disabled={globalLoading}
              aria-label="Refresh dashboard data"
              data-testid="refresh-button"
            >
              <FaSync className={globalLoading ? "fa-spin" : ""} />
            </button>

            <button
              className="settings-button"
              onClick={() => navigate("/manage-account")}
              aria-label="Account settings"
              data-testid="settings-button"
            >
              <FaChartBar />
            </button>

            <button
              className="logout-button"
              onClick={handleLogout}
              aria-label="Logout"
              data-testid="logout-button"
            >
              <FaSignOutAlt />
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {globalError && (
          <div className="error-banner" role="alert" data-testid="error-banner">
            <FaExclamationTriangle />
            <span>{globalError}</span>
            <button
              onClick={() => setGlobalError(null)}
              className="error-dismiss"
              aria-label="Dismiss error"
              data-testid="dismiss-error-button"
            >
              ×
            </button>
          </div>
        )}

        {/* Upload Status */}
        {uploadMessage && (
          <div
            className={`upload-status ${uploadMessage.includes("✅") ? "success" : "error"}`}
            data-testid="upload-status"
          >
            {uploadMessage}
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="upload-progress" data-testid="upload-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
            </div>
            <span>{uploadProgress}%</span>
          </div>
        )}

        {/* File Upload Section */}
        {file && (
          <div className="file-upload-section" data-testid="file-upload-section">
            <div className="file-details">
              <FaFileAlt />
              <span>{file.name}</span>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="document-type-select"
                data-testid="document-type-select"
              >
                <option value="invoice">Invoice</option>
                <option value="quote">Quote</option>
                <option value="contract">Contract</option>
                <option value="specification">Specification</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="upload-actions">
              <button
                className="upload-btn"
                onClick={handleUpload}
                disabled={isUploading}
                data-testid="upload-button"
              >
                {isUploading ? (
                  <>
                    <FaSpinner className="fa-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FaCloudUploadAlt />
                    Upload
                  </>
                )}
              </button>
              <button
                className="cancel-btn"
                onClick={() => {
                  setFile(null);
                  setUploadMessage("");
                }}
                disabled={isUploading}
                data-testid="cancel-upload-button"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="quick-actions">
          <button
            className="action-button primary"
            onClick={handleNewQuoteRequest}
            aria-label="Create new quote request"
            data-testid="new-quote-button"
          >
            <FaPlus />
            New Quote Request
          </button>

          <label className="action-button secondary" htmlFor="file-upload" data-testid="upload-label">
            <FaUpload />
            Upload Document
            <input
              id="file-upload"
              type="file"
              className="file-input"
              accept={ACCEPTED_FILE_TYPES.join(",")}
              onChange={handleFileChange}
              disabled={isUploading}
              data-testid="file-input"
            />
          </label>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="dashboard-nav" role="tablist" data-testid="dashboard-nav">
        {[
          { id: "overview", label: "Overview", icon: FaChartBar },
          { id: "quotes", label: "Quote Results", icon: FaQuoteRight },
          { id: "files", label: "Files", icon: FaFileAlt },
          { id: "notifications", label: "Notifications", icon: FaBell, badge: kpiData.pendingNotifications },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`${tab.id}-panel`}
            data-testid={`tab-${tab.id}`}
          >
            <tab.icon />
            <span>{tab.label}</span>
            {tab.badge > 0 && (
              <span className="notification-badge" data-testid={`badge-${tab.id}`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div id="overview-panel" role="tabpanel" data-testid="overview-panel">
            {/* KPI Cards */}
            <section className="kpi-section" data-testid="kpi-section">
              <div className="kpi-grid">
                <div className="kpi-card" data-testid="kpi-quotes">
                  <div className="kpi-icon quotes">
                    <FaQuoteRight />
                  </div>
                  <div className="kpi-content">
                    <h3>Total Quotes</h3>
                    <p className="kpi-value">{kpiData.totalQuotesReceived}</p>
                    <span className="kpi-label">Received</span>
                  </div>
                </div>

                <div className="kpi-card" data-testid="kpi-savings">
                  <div className="kpi-icon savings">
                    <FaDollarSign />
                  </div>
                  <div className="kpi-content">
                    <h3>Total Savings</h3>
                    <p className="kpi-value">{formatCurrency(kpiData.totalSavings)}</p>
                    <span className="kpi-label">Estimated</span>
                  </div>
                </div>

                <div className="kpi-card" data-testid="kpi-active">
                  <div className="kpi-icon active">
                    <FaSpinner />
                  </div>
                  <div className="kpi-content">
                    <p className="kpi-value">{kpiData.activeRequests}</p>
                    <span className="kpi-label">In Progress</span>
                  </div>
                </div>

                <div className="kpi-card" data-testid="kpi-notifications">
                  <div className="kpi-icon notifications">
                    <FaBell />
                  </div>
                  <div className="kpi-content">
                    <h3>Notifications</h3>
                    <p className="kpi-value">{kpiData.pendingNotifications}</p>
                    <span className="kpi-label">Pending</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Quote Funnel */}
            <section className="funnel-section" data-testid="funnel-section">
              <h2>Quote Request Progress</h2>
              <QuoteFunnel
                data={quoteFunnelData}
                isLoading={globalLoading}
                onStatusClick={handleQuotesNavigation}
                data-testid="quote-funnel"
              />
            </section>

            {/* Recent Activity */}
            <section className="activity-section" data-testid="activity-section">
              <h2>Recent Activity</h2>
              {recentActivity.length > 0 ? (
                <div className="activity-list" data-testid="activity-list">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="activity-item" data-testid={`activity-item-${index}`}>
                      <div className="activity-icon">
                        {activity.type === "quote" && <FaQuoteRight />}
                        {activity.type === "upload" && <FaUpload />}
                        {activity.type === "login" && <FaBell />}
                      </div>
                      <div className="activity-content">
                        <p className="activity-description">{activity.description}</p>
                        <p className="activity-date">{formatDate(activity.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state" data-testid="activity-empty">
                  <FaBell size={48} />
                  <p>No recent activity</p>
                </div>
              )}
              {/* Pagination for Recent Activity */}
              {recentActivity.length > 0 && (
                <div className="pagination" data-testid="activity-pagination">
                  <button
                    className="page-btn"
                    onClick={() => handlePrevPage(setActivityPage, activityPage)}
                    disabled={activityPage === 1}
                    aria-label="Previous activity page"
                    data-testid="activity-prev-page"
                  >
                    Previous
                  </button>
                  <span className="page-info">Page {activityPage}</span>
                  <button
                    className="page-btn"
                    onClick={() => handleNextPage(setActivityPage, activityPage)}
                    disabled={recentActivity.length < ITEMS_PER_PAGE}
                    aria-label="Next activity page"
                    data-testid="activity-next-page"
                  >
                    Next
                  </button>
                </div>
              )}
            </section>
          </div>
        )}

        {/* Quotes Tab */}
        {activeTab === "quotes" && (
          <div id="quotes-panel" role="tabpanel" data-testid="quotes-panel">
            {/* Search and Filter */}
            <div className="content-header">
              <h2>Your Quote Results</h2>
              <div className="search-filter-bar">
                <div className="search-input">
                  <FaSearch />
                  <input
                    type="text"
                    placeholder="Search quotes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    data-testid="search-input"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                  data-testid="status-filter"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="matched">Matched</option>
                  <option value="accepted">Accepted</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
            </div>

            {/* Quote Cards */}
            {filteredQuoteRequests.length > 0 ? (
              <div className="quotes-grid" data-testid="quotes-grid">
                {filteredQuoteRequests.map((request) => (
                  <div key={request._id} className="quote-card" data-testid={`quote-card-${request._id}`}>
                    <div className="quote-header">
                      <h3>{request.title || request.companyName || "Untitled Request"}</h3>
                      <span
                        className="quote-status"
                        style={{ backgroundColor: getStatusColor(request.status) }}
                      >
                        {request.status || "Unknown"}
                      </span>
                    </div>
                    <div className="quote-details">
                      <p>
                        <strong>Industry:</strong> {request.industryType || "N/A"}
                      </p>
                      <p>
                        <strong>Service:</strong> {request.serviceType || "N/A"}
                      </p>
                      <p>
                        <strong>Created:</strong> {formatDate(request.createdAt)}
                      </p>
                      <p>
                        <strong>Matches:</strong> {request.matches?.length || 0}
                      </p>
                    </div>
                    {request.matches?.length > 0 && (
                      <div className="quote-matches">
                        <h4>Top Matches</h4>
                        {request.matches.slice(0, 3).map((match, index) => (
                          <div
                            key={index}
                            className="match-item"
                            data-testid={`match-item-${index}`}
                          >
                            <div className="match-info">
                              <span>{match.vendorName}</span>
                              <span>{formatCurrency(match.price)}</span>
                              {match.savings > 0 && (
                                <span className="savings">
                                  Save {formatCurrency(match.savings)}
                                </span>
                              )}
                            </div>
                            <div className="match-actions">
                              <button
                                className="action-btn view"
                                onClick={() => navigate(`/quotes/${request._id}`)}
                                aria-label={`View details for ${match.vendorName}`}
                                data-testid={`view-quote-${index}`}
                              >
                                <FaEye />
                              </button>
                              <button
                                className="action-btn contact"
                                onClick={() => handleContactVendor(match._id, match.vendorName)}
                                aria-label={`Contact ${match.vendorName}`}
                                data-testid={`contact-vendor-${index}`}
                              >
                                <FaPhone />
                              </button>
                              {request.status?.toLowerCase() === "matched" && (
                                <button
                                  className="action-btn accept"
                                  onClick={() => handleAcceptQuote(match._id, match.vendorName)}
                                  aria-label={`Accept quote from ${match.vendorName}`}
                                  data-testid={`accept-quote-${index}`}
                                >
                                  <FaCheckCircle />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" data-testid="quotes-empty">
                <FaQuoteRight size={48} />
                <p>No quote requests found</p>
                <button
                  className="action-button primary"
                  onClick={handleNewQuoteRequest}
                  style={{ marginTop: "1rem" }}
                >
                  <FaPlus />
                  Create Your First Quote Request
                </button>
              </div>
            )}

            {/* Pagination */}
            {filteredQuoteRequests.length > 0 && (
              <div className="pagination" data-testid="quotes-pagination">
                <button
                  className="page-btn"
                  onClick={() => handlePrevPage(setRequestPage, requestPage)}
                  disabled={requestPage === 1}
                  aria-label="Previous page"
                  data-testid="quotes-prev-page"
                >
                  Previous
                </button>
                <span className="page-info">Page {requestPage}</span>
                <button
                  className="page-btn"
                  onClick={() => handleNextPage(setRequestPage, requestPage)}
                  disabled={filteredQuoteRequests.length < ITEMS_PER_PAGE}
                  aria-label="Next page"
                  data-testid="quotes-next-page"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* Files Tab */}
        {activeTab === "files" && (
          <div id="files-panel" role="tabpanel" data-testid="files-panel">
            <div className="content-header">
              <h2>Your Uploaded Files</h2>
            </div>
            {uploadedFiles.length > 0 ? (
              <div className="files-table" data-testid="files-table">
                <table>
                  <thead>
                    <tr>
                      <th>File Name</th>
                      <th>Type</th>
                      <th>Uploaded</th>
                      <th>Size</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadedFiles.map((file) => (
                      <tr key={file._id} data-testid={`file-row-${file._id}`}>
                        <td>{file.name}</td>
                        <td>{file.documentType}</td>
                        <td>{formatDate(file.uploadedAt)}</td>
                        <td>{(file.size / (1024 * 1024)).toFixed(2)} MB</td>
                        <td>
                          <button
                            className="action-btn download"
                            onClick={() => handleDownloadFile(file._id, file.name)}
                            aria-label={`Download ${file.name}`}
                            data-testid={`download-file-${file._id}`}
                          >
                            <FaDownload />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state" data-testid="files-empty">
                <FaFileAlt size={48} />
                <p>No files uploaded yet</p>
                <label 
                  className="action-button primary" 
                  htmlFor="file-upload-empty" 
                  style={{ marginTop: "1rem", cursor: "pointer" }}
                >
                  <FaUpload />
                  Upload Your First File
                  <input
                    id="file-upload-empty"
                    type="file"
                    className="file-input"
                    accept={ACCEPTED_FILE_TYPES.join(",")}
                    onChange={handleFileChange}
                    disabled={isUploading}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            )}

            {/* Pagination */}
            {uploadedFiles.length > 0 && (
              <div className="pagination" data-testid="files-pagination">
                <button
                  className="page-btn"
                  onClick={() => handlePrevPage(setFilePage, filePage)}
                  disabled={filePage === 1}
                  aria-label="Previous page"
                  data-testid="files-prev-page"
                >
                  Previous
                </button>
                <span className="page-info">Page {filePage}</span>
                <button
                  className="page-btn"
                  onClick={() => handleNextPage(setFilePage, filePage)}
                  disabled={uploadedFiles.length < ITEMS_PER_PAGE}
                  aria-label="Next page"
                  data-testid="files-next-page"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div id="notifications-panel" role="tabpanel" data-testid="notifications-panel">
            <div className="content-header">
              <h2>Your Notifications</h2>
            </div>
            {notifications.length > 0 ? (
              <div className="notifications-list" data-testid="notifications-list">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`notification-item ${notification.status === "unread" ? "unread" : ""}`}
                    data-testid={`notification-${notification._id}`}
                  >
                    <div className="notification-content">
                      <p>{notification.message}</p>
                      <p className="notification-date">{formatDate(notification.createdAt)}</p>
                    </div>
                    {notification.status === "unread" && (
                      <button
                        className="action-btn mark-read"
                        onClick={() => markNotificationAsRead(notification._id)}
                        aria-label="Mark notification as read"
                        data-testid={`mark-read-${notification._id}`}
                      >
                        <FaCheckCircle />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" data-testid="notifications-empty">
                <FaBell size={48} />
                <p>No notifications yet</p>
                <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.5rem" }}>
                  You'll receive notifications when vendors respond to your quote requests.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
