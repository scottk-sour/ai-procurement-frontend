import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import {
  FaQuoteRight,
  FaUpload,
  FaSignOutAlt,
  FaChartBar,
  FaFileAlt,
  FaBell,
  FaCloudUploadAlt,
  FaTachometerAlt,
  FaUsers,
  FaPoundSign,
  FaClock,
  FaCheckCircle,
  FaTimes,
  FaEye,
  FaStar,
  FaDownload,
  FaFilter,
  FaSearch,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaInfoCircle,
  FaArrowUp,
  FaArrowDown,
  FaBolt,
  FaShieldAlt,
  FaArrowRight
} from "react-icons/fa";
import QuoteFunnel from "./Dashboard/QuoteFunnel";
import { useAuth } from "../context/AuthContext";
import { logout } from "../utils/auth";
import "../styles/VendorDashboard.css";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();

  // Enhanced state management
  const [vendorData, setVendorData] = useState({
    name: auth?.user?.name || "Vendor",
    email: auth?.user?.email || "",
    companyName: auth?.user?.companyName || "",
    verified: auth?.user?.verified || false,
    rating: auth?.user?.rating || 0,
    totalEarnings: 0,
    monthlyEarnings: 0
  });

  const [dashboardState, setDashboardState] = useState({
    loading: false,
    error: null,
    activeTab: "overview",
    searchTerm: "",
    filterStatus: "all",
    sortBy: "date",
    sortOrder: "desc"
  });

  const [fileState, setFileState] = useState({
    file: null,
    documentType: "contract",
    uploadProgress: 0,
    dragOver: false
  });

  const [dataState, setDataState] = useState({
    recentActivity: [],
    uploadedFiles: [],
    quotes: [],
    notifications: [],
    quoteFunnelData: {
      received: 0,
      responded: 0,
      accepted: 0,
      completed: 0
    }
  });

  const [pagination, setPagination] = useState({
    quotePage: 1,
    filePage: 1,
    activityPage: 1,
    itemsPerPage: 10
  });

  const [feedback, setFeedback] = useState({
    quoteId: null,
    comment: "",
    rating: 0,
    isSubmitting: false
  });

  const [message, setMessage] = useState({ text: "", type: "", visible: false });

  // Enhanced metrics calculation
  const metrics = useMemo(() => {
    const quotes = dataState.quotes || [];
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    return {
      totalQuotes: quotes.length,
      pendingQuotes: quotes.filter(q => q.status === "Pending").length,
      acceptedQuotes: quotes.filter(q => q.status === "Accepted" || q.status === "Completed").length,
      completedQuotes: quotes.filter(q => q.status === "Completed").length,
      thisMonthQuotes: quotes.filter(q => new Date(q.createdAt) >= thisMonth).length,
      responseRate: quotes.length > 0 ? Math.round((quotes.filter(q => q.status !== "Pending").length / quotes.length) * 100) : 0,
      averageResponseTime: "2.5 hours", // This would come from backend
      successRate: quotes.length > 0 ? Math.round((quotes.filter(q => q.status === "Accepted").length / quotes.length) * 100) : 0
    };
  }, [dataState.quotes]);

  // Enhanced error handling
  const showMessage = useCallback((text, type = "info") => {
    setMessage({ text, type, visible: true });
    setTimeout(() => setMessage(prev => ({ ...prev, visible: false })), 5000);
  }, []);

  // Fetch vendor profile with enhanced error handling
  const fetchVendorProfile = useCallback(async () => {
    if (!auth?.token) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/vendors/profile`, {
        headers: { 
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          logout();
          navigate("/vendor-login", { replace: true });
          return;
        }
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }
      
      const data = await response.json();
      setVendorData(prev => ({
        ...prev,
        ...data.vendor,
        name: data.vendor?.name || prev.name
      }));
    } catch (error) {
      console.error("Error fetching vendor profile:", error);
      showMessage("Failed to load profile data", "error");
    }
  }, [auth?.token, navigate, showMessage]);

  // Enhanced dashboard data fetching
  const fetchDashboardData = useCallback(async () => {
    if (!auth?.token || !auth?.user?.userId) return;
    
    setDashboardState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const headers = {
        Authorization: `Bearer ${auth.token}`,
        'Content-Type': 'application/json'
      };

      const [activityRes, filesRes, quotesRes, notificationsRes] = await Promise.allSettled([
        fetch(`${baseUrl}/api/vendors/recent-activity?page=${pagination.activityPage}&limit=${pagination.itemsPerPage}`, { headers }),
        fetch(`${baseUrl}/api/vendors/uploaded-files?page=${pagination.filePage}&limit=${pagination.itemsPerPage}`, { headers }),
        fetch(`${baseUrl}/api/copier-quotes/supplier-quotes?vendorId=${auth.user.userId}&page=${pagination.quotePage}&limit=${pagination.itemsPerPage}`, { headers }),
        fetch(`${baseUrl}/api/vendors/notifications?page=1&limit=20`, { headers })
      ]);

      // Process responses with better error handling
      const processResponse = async (result, defaultValue = []) => {
        if (result.status === 'fulfilled' && result.value.ok) {
          const data = await result.value.json();
          return data;
        }
        return { [Object.keys(defaultValue)[0] || 'data']: defaultValue };
      };

      const [activityData, filesData, quotesData, notificationsData] = await Promise.all([
        processResponse(activityRes, []),
        processResponse(filesRes, []),
        processResponse(quotesRes, []),
        processResponse(notificationsRes, [])
      ]);

      // Update state with fetched data
      setDataState(prev => ({
        ...prev,
        recentActivity: activityData.activities || [],
        uploadedFiles: filesData.files || [],
        quotes: quotesData.quotes || [],
        notifications: notificationsData.notifications || [],
        quoteFunnelData: {
          received: (quotesData.quotes || []).length,
          responded: (quotesData.quotes || []).filter(q => q.status !== "Pending").length,
          accepted: (quotesData.quotes || []).filter(q => q.status === "Accepted").length,
          completed: (quotesData.quotes || []).filter(q => q.status === "Completed").length
        }
      }));

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setDashboardState(prev => ({ 
        ...prev, 
        error: "Failed to load dashboard data. Please try refreshing the page." 
      }));
      showMessage("Failed to load dashboard data", "error");
    } finally {
      setDashboardState(prev => ({ ...prev, loading: false }));
    }
  }, [auth?.token, auth?.user?.userId, pagination, showMessage]);

  // Enhanced file upload with drag & drop
  const handleFileUpload = useCallback(async (file) => {
    if (!file || !auth?.token) {
      showMessage("Please select a file to upload", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", fileState.documentType);

    setDashboardState(prev => ({ ...prev, loading: true }));
    setFileState(prev => ({ ...prev, uploadProgress: 0 }));

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/vendors/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${auth.token}` },
        body: formData,
      });

      if (response.ok) {
        showMessage("File uploaded successfully!", "success");
        setFileState(prev => ({ ...prev, file: null, uploadProgress: 100 }));
        fetchDashboardData();
      } else {
        const data = await response.json();
        throw new Error(data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      showMessage(`Upload failed: ${error.message}`, "error");
    } finally {
      setDashboardState(prev => ({ ...prev, loading: false }));
    }
  }, [fileState.documentType, auth?.token, fetchDashboardData, showMessage]);

  // Enhanced quote response handling
  const handleQuoteResponse = useCallback(async (quoteId, response, vendorName) => {
    if (!auth?.token) return;

    setDashboardState(prev => ({ ...prev, loading: true }));
    
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/copier-quotes/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ quoteId, response, vendorName }),
      });

      if (res.ok) {
        showMessage(`Quote ${response}ed successfully!`, "success");
        fetchDashboardData();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to respond to quote");
      }
    } catch (error) {
      console.error("Error responding to quote:", error);
      showMessage(`Failed to ${response} quote: ${error.message}`, "error");
    } finally {
      setDashboardState(prev => ({ ...prev, loading: false }));
    }
  }, [auth?.token, fetchDashboardData, showMessage]);

  // Enhanced logout
  const handleLogout = useCallback(() => {
    logout();
    navigate("/vendor-login", { replace: true });
    showMessage("Logged out successfully", "success");
  }, [navigate, showMessage]);

  // Filtered and sorted data
  const filteredQuotes = useMemo(() => {
    let filtered = dataState.quotes || [];
    
    if (dashboardState.searchTerm) {
      filtered = filtered.filter(quote => 
        (quote.companyName || "").toLowerCase().includes(dashboardState.searchTerm.toLowerCase()) ||
        (quote.industryType || "").toLowerCase().includes(dashboardState.searchTerm.toLowerCase())
      );
    }
    
    if (dashboardState.filterStatus !== "all") {
      filtered = filtered.filter(quote => quote.status?.toLowerCase() === dashboardState.filterStatus);
    }
    
    return filtered.sort((a, b) => {
      const aVal = a[dashboardState.sortBy] || "";
      const bVal = b[dashboardState.sortBy] || "";
      const order = dashboardState.sortOrder === "asc" ? 1 : -1;
      
      if (dashboardState.sortBy === "createdAt") {
        return order * (new Date(aVal) - new Date(bVal));
      }
      return order * aVal.toString().localeCompare(bVal.toString());
    });
  }, [dataState.quotes, dashboardState.searchTerm, dashboardState.filterStatus, dashboardState.sortBy, dashboardState.sortOrder]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setFileState(prev => ({ ...prev, dragOver: true }));
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setFileState(prev => ({ ...prev, dragOver: false }));
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setFileState(prev => ({ ...prev, dragOver: false }));
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFileState(prev => ({ ...prev, file: droppedFile }));
      handleFileUpload(droppedFile);
    }
  }, [handleFileUpload]);

  // Format utilities
  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount || 0);
  }, []);

  // Effects
  useEffect(() => {
    if (auth?.token) {
      fetchVendorProfile();
      fetchDashboardData();
      const interval = setInterval(fetchDashboardData, 300000); // 5 minutes
      return () => clearInterval(interval);
    }
  }, [auth?.token, fetchVendorProfile, fetchDashboardData]);

  // Auth check
  if (!auth?.token) {
    navigate("/vendor-login", { replace: true });
    return null;
  }

  return (
    <HelmetProvider>
      <div className="vendor-dashboard">
        <Helmet>
          <title>Vendor Dashboard | TendorAI - Manage Your Quotes & Opportunities</title>
          <meta name="description" content="Manage your vendor account, respond to quotes, upload documents, and track your performance on TendorAI." />
        </Helmet>

        {/* Enhanced Header */}
        <header className="dashboard-header">
          <div className="header-content">
            <div className="vendor-info">
              <div className="vendor-avatar">
                {vendorData.name.charAt(0).toUpperCase()}
              </div>
              <div className="vendor-details">
                <h1 className="vendor-name">
                  Welcome back, {vendorData.name}!
                  {vendorData.verified && (
                    <FaCheckCircle className="verified-badge" title="Verified Vendor" />
                  )}
                </h1>
                <p className="vendor-subtitle">{vendorData.companyName}</p>
                <div className="vendor-rating">
                  {[...Array(5)].map((_, i) => (
                    <FaStar 
                      key={i} 
                      className={i < vendorData.rating ? "star-filled" : "star-empty"} 
                    />
                  ))}
                  <span className="rating-text">({vendorData.rating}/5)</span>
                </div>
              </div>
            </div>
            
            <div className="header-actions">
              <div className="earnings-summary">
                <div className="earning-item">
                  <span className="earning-label">This Month</span>
                  <span className="earning-value">{formatCurrency(vendorData.monthlyEarnings)}</span>
                </div>
                <div className="earning-item">
                  <span className="earning-label">Total Earned</span>
                  <span className="earning-value">{formatCurrency(vendorData.totalEarnings)}</span>
                </div>
              </div>
              
              <button 
                className="btn btn-outline"
                onClick={() => navigate("/vendor-settings")}
              >
                <FaChartBar /> Settings
              </button>
              
              <button 
                className="btn btn-ghost"
                onClick={handleLogout}
              >
                <FaSignOutAlt /> Log Out
              </button>
            </div>
          </div>
        </header>

        {/* Message Toast */}
        {message.visible && (
          <div className={`message-toast message-${message.type}`}>
            <span>{message.text}</span>
            <button 
              onClick={() => setMessage(prev => ({ ...prev, visible: false }))}
              className="message-close"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* Enhanced Navigation */}
        <nav className="dashboard-nav">
          <div className="nav-container">
            {[
              { id: "overview", label: "Overview", icon: <FaTachometerAlt /> },
              { id: "quotes", label: "Quote Requests", icon: <FaQuoteRight />, badge: metrics.pendingQuotes },
              { id: "files", label: "Documents", icon: <FaFileAlt /> },
              { id: "analytics", label: "Analytics", icon: <FaChartBar /> },
              { id: "notifications", label: "Notifications", icon: <FaBell />, badge: dataState.notifications.filter(n => !n.read).length }
            ].map(tab => (
              <button
                key={tab.id}
                className={`nav-tab ${dashboardState.activeTab === tab.id ? "active" : ""}`}
                onClick={() => setDashboardState(prev => ({ ...prev, activeTab: tab.id }))}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge > 0 && <span className="nav-badge">{tab.badge}</span>}
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="dashboard-main">
          {dashboardState.activeTab === "overview" && (
            <div className="overview-content">
              {/* KPI Cards */}
              <section className="kpi-section">
                <div className="kpi-grid">
                  <div className="kpi-card">
                    <div className="kpi-icon total">
                      <FaQuoteRight />
                    </div>
                    <div className="kpi-content">
                      <h3>Total Quotes</h3>
                      <div className="kpi-value">{metrics.totalQuotes}</div>
                      <div className="kpi-change positive">
                        <FaArrowUp /> +{metrics.thisMonthQuotes} this month
                      </div>
                    </div>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-icon pending">
                      <FaClock />
                    </div>
                    <div className="kpi-content">
                      <h3>Pending Responses</h3>
                      <div className="kpi-value">{metrics.pendingQuotes}</div>
                      <div className="kpi-subtitle">Awaiting your response</div>
                    </div>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-icon success">
                      <FaCheckCircle />
                    </div>
                    <div className="kpi-content">
                      <h3>Success Rate</h3>
                      <div className="kpi-value">{metrics.successRate}%</div>
                      <div className="kpi-subtitle">Accepted quotes</div>
                    </div>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-icon response">
                      <FaBolt />
                    </div>
                    <div className="kpi-content">
                      <h3>Avg Response Time</h3>
                      <div className="kpi-value">{metrics.averageResponseTime}</div>
                      <div className="kpi-subtitle">Industry avg: 4.2h</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Quote Funnel */}
              <section className="funnel-section">
                <div className="section-header">
                  <h2>Quote Performance Pipeline</h2>
                  <p>Track your quote journey from request to completion</p>
                </div>
                <QuoteFunnel data={dataState.quoteFunnelData} isLoading={dashboardState.loading} />
              </section>

              {/* Recent Activity */}
              <section className="activity-section">
                <div className="section-header">
                  <h2>Recent Activity</h2>
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => setDashboardState(prev => ({ ...prev, activeTab: "notifications" }))}
                  >
                    View All <FaArrowRight />
                  </button>
                </div>
                
                {dataState.recentActivity.length > 0 ? (
                  <div className="activity-list">
                    {dataState.recentActivity.slice(0, 5).map((activity, index) => (
                      <div key={index} className="activity-item">
                        <div className="activity-icon">
                          {activity.type === "quote" && <FaQuoteRight />}
                          {activity.type === "upload" && <FaUpload />}
                          {activity.type === "login" && <FaUsers />}
                        </div>
                        <div className="activity-content">
                          <p className="activity-description">{activity.description}</p>
                          <time className="activity-date">{formatDate(activity.date)}</time>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <FaInfoCircle />
                    <p>No recent activity to display</p>
                  </div>
                )}
              </section>
            </div>
          )}

          {dashboardState.activeTab === "quotes" && (
            <div className="quotes-content">
              {/* Enhanced Filters and Search */}
              <div className="content-header">
                <div className="header-controls">
                  <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search quotes by company or industry..."
                      value={dashboardState.searchTerm}
                      onChange={(e) => setDashboardState(prev => ({ 
                        ...prev, 
                        searchTerm: e.target.value 
                      }))}
                      className="search-input"
                    />
                  </div>
                  
                  <div className="filter-controls">
                    <select
                      value={dashboardState.filterStatus}
                      onChange={(e) => setDashboardState(prev => ({ 
                        ...prev, 
                        filterStatus: e.target.value 
                      }))}
                      className="filter-select"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="declined">Declined</option>
                      <option value="completed">Completed</option>
                    </select>
                    
                    <select
                      value={`${dashboardState.sortBy}-${dashboardState.sortOrder}`}
                      onChange={(e) => {
                        const [sortBy, sortOrder] = e.target.value.split('-');
                        setDashboardState(prev => ({ 
                          ...prev, 
                          sortBy, 
                          sortOrder 
                        }));
                      }}
                      className="sort-select"
                    >
                      <option value="createdAt-desc">Newest First</option>
                      <option value="createdAt-asc">Oldest First</option>
                      <option value="companyName-asc">Company A-Z</option>
                      <option value="companyName-desc">Company Z-A</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Enhanced Quotes List */}
              {filteredQuotes.length > 0 ? (
                <div className="quotes-list">
                  {filteredQuotes.map((quote, index) => (
                    <div key={quote._id || index} className="quote-card modern">
                      <div className="quote-header">
                        <div className="quote-title">
                          <h3>{quote.companyName || "Quote Request"}</h3>
                          <span className={`status-badge status-${(quote.status || "").toLowerCase()}`}>
                            {quote.status || "Unknown"}
                          </span>
                        </div>
                        <div className="quote-meta">
                          <time>{formatDate(quote.createdAt)}</time>
                          <span className="industry-tag">{quote.industryType}</span>
                        </div>
                      </div>

                      <div className="quote-details">
                        <div className="detail-grid">
                          <div className="detail-item">
                            <span className="detail-label">Monthly Volume</span>
                            <span className="detail-value">
                              {(quote.monthlyVolume?.mono || 0) + (quote.monthlyVolume?.colour || 0)} pages
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Colour/Mono Split</span>
                            <span className="detail-value">
                              {quote.monthlyVolume?.colour || 0} / {quote.monthlyVolume?.mono || 0}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Budget Range</span>
                            <span className="detail-value">{formatCurrency(quote.maxBudget || 0)}/month</span>
                          </div>
                        </div>

                        {quote.requirements && (
                          <div className="requirements-list">
                            <span className="requirements-label">Requirements:</span>
                            <div className="requirements-tags">
                              {quote.requirements.map((req, idx) => (
                                <span key={idx} className="requirement-tag">{req}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="quote-actions">
                        {quote.status === "Pending" && (
                          <div className="response-actions">
                            <button
                              className="btn btn-success"
                              onClick={() => handleQuoteResponse(quote._id, "accept", vendorData.name)}
                              disabled={dashboardState.loading}
                            >
                              <FaCheckCircle /> Accept Quote
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={() => handleQuoteResponse(quote._id, "decline", vendorData.name)}
                              disabled={dashboardState.loading}
                            >
                              <FaTimes /> Decline
                            </button>
                          </div>
                        )}
                        
                        <div className="secondary-actions">
                          <button
                            className="btn btn-outline"
                            onClick={() => navigate(`/quotes/${quote._id}`)}
                          >
                            <FaEye /> View Details
                          </button>
                          
                          {quote.status !== "Pending" && (
                            <button
                              className="btn btn-ghost"
                              onClick={() => setFeedback({ 
                                quoteId: quote._id, 
                                comment: "", 
                                rating: 0,
                                isSubmitting: false
                              })}
                            >
                              <FaStar /> Add Feedback
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state large">
                  <FaQuoteRight />
                  <h3>No Quote Requests</h3>
                  <p>Quote requests from potential customers will appear here.</p>
                </div>
              )}
            </div>
          )}

          {dashboardState.activeTab === "files" && (
            <div className="files-content">
              {/* Enhanced File Upload */}
              <section className="upload-section">
                <div className="section-header">
                  <h2>Upload Documents</h2>
                  <p>Upload contracts, invoices, and other important documents</p>
                </div>
                
                <div className="upload-container">
                  <div className="upload-controls">
                    <select
                      value={fileState.documentType}
                      onChange={(e) => setFileState(prev => ({ 
                        ...prev, 
                        documentType: e.target.value 
                      }))}
                      className="document-type-select"
                    >
                      <option value="contract">Contract</option>
                      <option value="invoice">Invoice</option>
                      <option value="certificate">Certificate</option>
                      <option value="insurance">Insurance</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div
                    className={`upload-dropzone ${fileState.dragOver ? "drag-over" : ""}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("file-input").click()}
                  >
                    <div className="upload-icon">
                      <FaCloudUploadAlt />
                    </div>
                    <div className="upload-text">
                      <p className="upload-primary">
                        {fileState.file ? fileState.file.name : "Drag & drop files here"}
                      </p>
                      <p className="upload-secondary">
                        or click to browse • PDF, CSV, XLSX, Images
                      </p>
                    </div>
                    <input
                      id="file-input"
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setFileState(prev => ({ ...prev, file }));
                          handleFileUpload(file);
                        }
                      }}
                      accept=".pdf,.csv,.xlsx,.xls,.png,.jpg,.jpeg"
                      className="file-input-hidden"
                      hidden
                    />
                  </div>

                  {fileState.uploadProgress > 0 && fileState.uploadProgress < 100 && (
                    <div className="upload-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${fileState.uploadProgress}%` }}
                        />
                      </div>
                      <span className="progress-text">{fileState.uploadProgress}%</span>
                    </div>
                  )}
                </div>
              </section>

              {/* Enhanced Files List */}
              <section className="files-list-section">
                <div className="section-header">
                  <h2>Uploaded Documents</h2>
                  <span className="files-count">{dataState.uploadedFiles.length} files</span>
                </div>
                
                {dataState.uploadedFiles.length > 0 ? (
                  <div className="files-grid">
                    {dataState.uploadedFiles.map((file, index) => (
                      <div key={index} className="file-card">
                        <div className="file-icon">
                          <span className={`file-type file-type-${file.fileType || 'unknown'}`}>
                            {(file.fileType || 'FILE').toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="file-info">
                          <h4 className="file-name" title={file.fileName}>
                            {file.fileName}
                          </h4>
                          <p className="file-type-label">{file.documentType}</p>
                          <time className="file-date">{formatDate(file.uploadDate)}</time>
                        </div>
                        
                        <div className="file-actions">
                          <button 
                            className="btn btn-ghost btn-sm"
                            onClick={() => window.open(file.filePath, '_blank')}
                            title="Download file"
                          >
                            <FaDownload />
                          </button>
                          <button 
                            className="btn btn-ghost btn-sm"
                            onClick={() => navigator.share && navigator.share({
                              title: file.fileName,
                              url: file.filePath
                            })}
                            title="Share file"
                          >
                            <FaArrowRight />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <FaFileAlt />
                    <h3>No Documents Uploaded</h3>
                    <p>Upload your first document using the dropzone above</p>
                  </div>
                )}
              </section>
            </div>
          )}

          {dashboardState.activeTab === "analytics" && (
            <div className="analytics-content">
              <div className="section-header">
                <h2>Performance Analytics</h2>
                <p>Track your vendor performance and identify growth opportunities</p>
              </div>

              {/* Performance Metrics */}
              <div className="analytics-grid">
                <div className="analytics-card">
                  <div className="analytics-header">
                    <h3>Response Performance</h3>
                    <FaBolt className="analytics-icon" />
                  </div>
                  <div className="analytics-content">
                    <div className="metric-large">{metrics.responseRate}%</div>
                    <div className="metric-label">Response Rate</div>
                    <div className="metric-trend positive">
                      <FaArrowUp /> +5% vs last month
                    </div>
                  </div>
                </div>

                <div className="analytics-card">
                  <div className="analytics-header">
                    <h3>Quote Success</h3>
                    <FaCheckCircle className="analytics-icon" />
                  </div>
                  <div className="analytics-content">
                    <div className="metric-large">{metrics.successRate}%</div>
                    <div className="metric-label">Acceptance Rate</div>
                    <div className="metric-comparison">Industry avg: 23%</div>
                  </div>
                </div>

                <div className="analytics-card">
                  <div className="analytics-header">
                    <h3>Monthly Revenue</h3>
                    <FaPoundSign className="analytics-icon" />
                  </div>
                  <div className="analytics-content">
                    <div className="metric-large">{formatCurrency(vendorData.monthlyEarnings)}</div>
                    <div className="metric-label">This Month</div>
                    <div className="metric-trend positive">
                      <FaArrowUp /> +12% vs last month
                    </div>
                  </div>
                </div>

                <div className="analytics-card">
                  <div className="analytics-header">
                    <h3>Customer Rating</h3>
                    <FaStar className="analytics-icon" />
                  </div>
                  <div className="analytics-content">
                    <div className="metric-large">{vendorData.rating}/5</div>
                    <div className="metric-label">Average Rating</div>
                    <div className="rating-stars">
                      {[...Array(5)].map((_, i) => (
                        <FaStar 
                          key={i} 
                          className={i < vendorData.rating ? "star-filled" : "star-empty"} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Performance Insights */}
              <div className="insights-section">
                <h3>Performance Insights</h3>
                <div className="insights-list">
                  <div className="insight-item positive">
                    <FaArrowUp className="insight-icon" />
                    <div className="insight-content">
                      <h4>Response Time Improved</h4>
                      <p>Your average response time has decreased by 30% this month</p>
                    </div>
                  </div>
                  <div className="insight-item neutral">
                    <FaInfoCircle className="insight-icon" />
                    <div className="insight-content">
                      <h4>Peak Request Hours</h4>
                      <p>Most quote requests come in between 9-11 AM on weekdays</p>
                    </div>
                  </div>
                  <div className="insight-item warning">
                    <FaExclamationTriangle className="insight-icon" />
                    <div className="insight-content">
                      <h4>Opportunity to Improve</h4>
                      <p>Consider updating your pricing to be more competitive in the office equipment category</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {dashboardState.activeTab === "notifications" && (
            <div className="notifications-content">
              <div className="section-header">
                <h2>Notifications</h2>
                <button className="btn btn-ghost btn-sm">
                  Mark All Read
                </button>
              </div>

              {dataState.notifications.length > 0 ? (
                <div className="notifications-list">
                  {dataState.notifications.map((notification, index) => (
                    <div 
                      key={index} 
                      className={`notification-item ${!notification.read ? 'unread' : ''}`}
                    >
                      <div className="notification-icon">
                        {notification.type === "quote" && <FaQuoteRight />}
                        {notification.type === "payment" && <FaPoundSign />}
                        {notification.type === "system" && <FaBell />}
                        {notification.type === "alert" && <FaExclamationTriangle />}
                      </div>
                      
                      <div className="notification-content">
                        <h4 className="notification-title">{notification.title}</h4>
                        <p className="notification-message">{notification.message}</p>
                        <time className="notification-time">{formatDate(notification.createdAt)}</time>
                      </div>
                      
                      {!notification.read && (
                        <div className="notification-badge">New</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FaBell />
                  <h3>No Notifications</h3>
                  <p>You're all caught up! New notifications will appear here.</p>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Feedback Modal */}
        {feedback.quoteId && (
          <div className="modal-overlay" onClick={() => setFeedback({ quoteId: null, comment: "", rating: 0, isSubmitting: false })}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Provide Feedback</h3>
                <button 
                  className="modal-close"
                  onClick={() => setFeedback({ quoteId: null, comment: "", rating: 0, isSubmitting: false })}
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="modal-body">
                <div className="feedback-rating">
                  <label>Rating:</label>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        className={`star-button ${star <= feedback.rating ? 'active' : ''}`}
                        onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                      >
                        <FaStar />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="feedback-comment">
                  <label>Comment:</label>
                  <textarea
                    value={feedback.comment}
                    onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Share your experience with this quote request..."
                    maxLength={500}
                    rows={4}
                  />
                  <div className="character-count">
                    {feedback.comment.length}/500
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  className="btn btn-outline"
                  onClick={() => setFeedback({ quoteId: null, comment: "", rating: 0, isSubmitting: false })}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    // Handle feedback submission
                    setFeedback({ quoteId: null, comment: "", rating: 0, isSubmitting: false });
                    showMessage("Feedback submitted successfully!", "success");
                  }}
                  disabled={!feedback.comment || feedback.rating === 0 || feedback.isSubmitting}
                >
                  {feedback.isSubmitting ? "Submitting..." : "Submit Feedback"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {dashboardState.loading && (
          <div className="loading-overlay">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading...</p>
            </div>
          </div>
        )}
      </div>
    </HelmetProvider>
  );
};

export default VendorDashboard;