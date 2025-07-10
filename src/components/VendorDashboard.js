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
  FaSearch,
  FaExclamationTriangle,
  FaInfoCircle,
  FaArrowUp,
  FaBolt,
  FaArrowRight,
  FaTrash,
  FaEdit
} from "react-icons/fa";
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
    notifications: []
  });

  const [pagination] = useState({
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

  // Enhanced state for product management
  const [uploadResults, setUploadResults] = useState(null);
  const [vendorProducts, setVendorProducts] = useState([]);

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
        notifications: notificationsData.notifications || []
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

  // Fetch vendor products
  const fetchVendorProducts = useCallback(async () => {
    if (!auth?.token) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/vendors/products`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setVendorProducts(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }, [auth?.token]);

  // Enhanced product catalog upload function
  const handleProductCatalogUpload = useCallback(async (file) => {
    if (!file || !auth?.token) {
      showMessage("Please select a file to upload", "warning");
      return;
    }

    // Validate file type
    if (!file.name.match(/\.(csv|xlsx|xls)$/i)) {
      showMessage("Please upload a CSV or Excel file for product catalogs", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setDashboardState(prev => ({ ...prev, loading: true }));
    setFileState(prev => ({ ...prev, uploadProgress: 0 }));
    setUploadResults(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/vendors/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${auth.token}` },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        showMessage(`Successfully uploaded ${result.savedProducts} products!`, "success");
        setFileState(prev => ({ ...prev, file: null, uploadProgress: 100 }));
        fetchVendorProducts(); // Refresh products list
      } else {
        showMessage("Upload failed - check the errors below", "error");
      }
      
      setUploadResults(result);

    } catch (error) {
      console.error("Upload error:", error);
      showMessage(`Upload failed: ${error.message}`, "error");
      setUploadResults({
        success: false,
        errors: [error.message]
      });
    } finally {
      setDashboardState(prev => ({ ...prev, loading: false }));
    }
  }, [auth?.token, showMessage, fetchVendorProducts]);

  // Delete product
  const handleDeleteProduct = useCallback(async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/vendors/products/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      
      if (response.ok) {
        showMessage("Product deleted successfully", "success");
        fetchVendorProducts();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      showMessage("Failed to delete product", "error");
    }
  }, [auth?.token, showMessage, fetchVendorProducts]);

  // Edit product placeholder
  const handleEditProduct = useCallback((product) => {
    // TODO: Implement edit functionality
    showMessage("Edit functionality coming soon", "info");
  }, [showMessage]);

  // Enhanced file upload with drag & drop (for documents)
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
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/vendors/upload-legacy`, {
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
      // Check if it's a product catalog file
      if (droppedFile.name.match(/\.(csv|xlsx|xls)$/i)) {
        handleProductCatalogUpload(droppedFile);
      } else {
        handleFileUpload(droppedFile);
      }
    }
  }, [handleFileUpload, handleProductCatalogUpload]);

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
      fetchVendorProducts();
      const interval = setInterval(fetchDashboardData, 300000); // 5 minutes
      return () => clearInterval(interval);
    }
  }, [auth?.token, fetchVendorProfile, fetchDashboardData, fetchVendorProducts]);

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
              { id: "files", label: "Product Catalog", icon: <FaFileAlt />, badge: vendorProducts.length },
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
                      <h3>Products Listed</h3>
                      <div className="kpi-value">{vendorProducts.length}</div>
                      <div className="kpi-subtitle">In your catalog</div>
                    </div>
                  </div>
                </div>
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
              {/* Enhanced Product Catalog Upload */}
              <section className="upload-section">
                <div className="section-header">
                  <h2>Product Catalog Management</h2>
                  <p>Upload your product catalog to receive matching quote requests</p>
                </div>
                
                <div className="upload-container">
                  {/* Template Download */}
                  <div className="template-section">
                    <div className="template-card">
                      <div className="template-icon">
                        <FaDownload />
                      </div>
                      <div className="template-content">
                        <h3>Download CSV Template</h3>
                        <p>Use our template to ensure your products are uploaded correctly</p>
                        <a 
                          href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/vendors/upload-template`}
                          download="vendor-products-template.csv"
                          className="btn btn-outline"
                        >
                          <FaDownload /> Download Template
                        </a>
                      </div>
                    </div>
                    
                    <div className="upload-guide">
                      <h4>Upload Requirements:</h4>
                      <ul>
                        <li>✅ Use the CSV template format</li>
                        <li>✅ Include volume ranges (e.g., 6k-13k pages/month)</li>
                        <li>✅ Specify paper sizes (A4, A3, SRA3)</li>
                        <li>✅ Set realistic CPC rates (pence per page)</li>
                        <li>✅ Match speed to volume capacity</li>
                      </ul>
                    </div>
                  </div>

                  {/* Enhanced File Upload */}
                  <div className="upload-controls">
                    <div className="upload-type-selector">
                      <h3>Product Catalog Upload</h3>
                      <p>Upload your complete product list with pricing and specifications</p>
                    </div>
                  </div>

                  <div
                    className={`upload-dropzone product-upload ${fileState.dragOver ? "drag-over" : ""}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("product-file-input").click()}
                  >
                    <div className="upload-icon">
                      <FaCloudUploadAlt />
                    </div>
                    <div className="upload-text">
                      <p className="upload-primary">
                        {fileState.file ? fileState.file.name : "Drag & drop your product catalog here"}
                      </p>
                      <p className="upload-secondary">
                        or click to browse • CSV, XLSX files only
                      </p>
                      <p className="upload-hint">
                        💡 Download the template first for the correct format
                      </p>
                    </div>
                    <input
                      id="product-file-input"
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          handleProductCatalogUpload(file);
                        }
                      }}
                      accept=".csv,.xlsx,.xls"
                      className="file-input-hidden"
                      hidden
                    />
                  </div>

                  {/* Upload Progress */}
                  {fileState.uploadProgress > 0 && fileState.uploadProgress < 100 && (
                    <div className="upload-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${fileState.uploadProgress}%` }}
                        />
                      </div>
                      <span className="progress-text">Uploading... {fileState.uploadProgress}%</span>
                    </div>
                  )}

                  {/* Upload Results */}
                  {uploadResults && (
                    <div className={`upload-results ${uploadResults.success ? 'success' : 'error'}`}>
                      <div className="results-header">
                        <h4>
                          {uploadResults.success ? (
                            <>✅ Upload Successful</>
                          ) : (
                            <>❌ Upload Failed</>
                          )}
                        </h4>
                      </div>
                      
                      {uploadResults.success && (
                        <div className="success-details">
                          <p>Successfully uploaded {uploadResults.data?.savedProducts || 0} products</p>
                          {uploadResults.data?.stats && (
                            <div className="upload-stats">
                              <span>Total: {uploadResults.data.stats.total}</span>
                              <span>Valid: {uploadResults.data.stats.saved}</span>
                              <span>Errors: {uploadResults.data.stats.invalid || 0}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {uploadResults.data?.warnings && uploadResults.data.warnings.length > 0 && (
                        <div className="warnings-section">
                          <h5>⚠️ Warnings ({uploadResults.data.warnings.length}):</h5>
                          <ul className="warnings-list">
                            {uploadResults.data.warnings.slice(0, 5).map((warning, index) => (
                              <li key={index}>{warning}</li>
                            ))}
                            {uploadResults.data.warnings.length > 5 && (
                              <li>... and {uploadResults.data.warnings.length - 5} more warnings</li>
                            )}
                          </ul>
                        </div>
                      )}

                      {!uploadResults.success && uploadResults.errors && (
                        <div className="errors-section">
                          <h5>Errors ({uploadResults.errors.length}):</h5>
                          <ul className="errors-list">
                            {uploadResults.errors.slice(0, 5).map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                            {uploadResults.errors.length > 5 && (
                              <li>... and {uploadResults.errors.length - 5} more errors</li>
                            )}
                          </ul>
                          <p className="error-help">
                            💡 Download the template and check the format requirements above
                          </p>
                        </div>
                      )}

                      <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => setUploadResults(null)}
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </section>

              {/* Current Products List */}
              <section className="products-list-section">
                <div className="section-header">
                  <h2>Your Product Catalog</h2>
                  <div className="header-actions">
                    <span className="products-count">{vendorProducts.length} products</span>
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={fetchVendorProducts}
                    >
                      <FaDownload /> Refresh
                    </button>
                  </div>
                </div>
                
                {vendorProducts.length > 0 ? (
                  <div className="products-grid">
                    {vendorProducts.map((product, index) => (
                      <div key={product._id || index} className="product-card">
                        <div className="product-header">
                          <h4 className="product-name">{product.manufacturer} {product.model}</h4>
                          <span className={`category-badge category-${product.category?.replace(' ', '-').toLowerCase()}`}>
                            {product.category}
                          </span>
                        </div>
                        
                        <div className="product-details">
                          <div className="detail-row">
                            <span className="detail-label">Speed:</span>
                            <span className="detail-value">{product.speed} PPM</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Volume:</span>
                            <span className="detail-value">
                              {product.minVolume?.toLocaleString()} - {product.maxVolume?.toLocaleString()} pages/month
                            </span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Paper Size:</span>
                            <span className="detail-value">{product.paperSizes?.primary || product.paperSizes?.primary}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">CPC Rates:</span>
                            <span className="detail-value">
                              {product.costs?.cpcRates?.A4Mono || product.A4MonoCPC}p / {product.costs?.cpcRates?.A4Colour || product.A4ColourCPC}p
                            </span>
                          </div>
                        </div>

                        <div className="product-actions">
                          <button 
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleEditProduct(product)}
                            title="Edit product"
                          >
                            <FaEdit /> Edit
                          </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteProduct(product._id)}
                            title="Delete product"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <FaFileAlt />
                    <h3>No Products in Catalog</h3>
                    <p>Upload your first product catalog using the upload area above</p>
                  </div>
                )}
              </section>

              {/* Legacy Document Upload (Keep existing for other docs) */}
              <section className="documents-section">
                <div className="section-header">
                  <h2>Other Documents</h2>
                  <p>Upload contracts, certificates, and other business documents</p>
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
                    onDrop={(e) => {
                      e.preventDefault();
                      setFileState(prev => ({ ...prev, dragOver: false }));
                      const droppedFile = e.dataTransfer.files[0];
                      if (droppedFile && !droppedFile.name.match(/\.(csv|xlsx|xls)$/i)) {
                        handleFileUpload(droppedFile); // Use existing function for other docs
                      }
                    }}
                    onClick={() => document.getElementById("document-file-input").click()}
                  >
                    <div className="upload-icon">
                      <FaCloudUploadAlt />
                    </div>
                    <div className="upload-text">
                      <p className="upload-primary">
                        Drag & drop documents here
                      </p>
                      <p className="upload-secondary">
                        or click to browse • PDF, Images, Documents
                      </p>
                    </div>
                    <input
                      id="document-file-input"
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          handleFileUpload(file); // Use existing function
                        }
                      }}
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                      className="file-input-hidden"
                      hidden
                    />
                  </div>
                </div>

                {/* Existing uploaded documents list */}
                {dataState.uploadedFiles.length > 0 && (
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
                        </div>
                      </div>
                    ))}
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