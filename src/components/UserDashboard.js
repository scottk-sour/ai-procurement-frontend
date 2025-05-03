import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'react-icons/fa';
import '../styles/UserDashboard.css';
import QuoteFunnel from './Dashboard/QuoteFunnel';

const UserDashboard = () => {
  const navigate = useNavigate();

  // State declarations
  const [userName, setUserName] = useState(localStorage.getItem('userName') || 'User');
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState('contract');
  const [message, setMessage] = useState('');
  const [recentActivity, setRecentActivity] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [totalQuotes, setTotalQuotes] = useState(0);
  const [pendingResponses, setPendingResponses] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  // Quote funnel data
  const [quoteFunnelData, setQuoteFunnelData] = useState({
    created: 0,
    pending: 0,
    matched: 0,
    completed: 0,
  });

  const fetchUserProfile = useCallback(async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('userToken');
    if (!token) {
      console.log('❌ No token found, redirecting to login...');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch user profile.');
      const data = await response.json();
      setUserName(data.user.name || 'User');
      localStorage.setItem('userName', data.user.name || 'User');
    } catch (error) {
      console.error('Error fetching user profile:', error.message);
      setError(`Failed to load user profile: ${error.message}. Using default values.`);
      setUserName(localStorage.getItem('userName') || 'User');
    }
  }, [navigate]);

  const fetchDashboardData = useCallback(async () => {
    console.log('Fetching UserDashboard data');
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token') || localStorage.getItem('userToken');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
      console.log('❌ No authentication token or user ID found, redirecting to login...');
      setError('No authentication token or user ID found. Please log in.');
      navigate('/login');
      return;
    }

    try {
      // Fetch all required data in parallel
      const [activityRes, filesRes, quotesRes, savingsRes, copierQuotesRes] = await Promise.all([
        fetch('http://localhost:5000/api/users/recent-activity', {
          headers: { Authorization: `Bearer ${token}` },
        }).then((res) => (res.ok ? res.json() : Promise.reject('Failed to fetch recent activity.'))),
        fetch('http://localhost:5000/api/users/uploaded-files', {
          headers: { Authorization: `Bearer ${token}` },
        }).then((res) => (res.ok ? res.json() : Promise.reject('Failed to fetch uploaded files.'))),
        fetch(`http://localhost:5000/api/quotes/user?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((res) => (res.ok ? res.json() : Promise.reject('Failed to fetch quotes.'))),
        fetch(`http://localhost:5000/api/users/savings?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((res) => (res.ok ? res.json() : { totalSavings: 0 })),
        fetch(`http://localhost:5000/api/copier-quotes/user-quotes?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((res) => (res.ok ? res.json() : { quotes: [] })),
      ]);

      // Process regular quotes
      const regularQuotes = quotesRes.quotes || [];

      // Process copier quotes
      const copierQuotes = copierQuotesRes.quotes || [];

      // Combine all quotes
      const allQuotes = [...regularQuotes, ...copierQuotes];
      setQuotes(allQuotes);

      // Calculate quote funnel data
      const created = allQuotes.length;
      const pending = allQuotes.filter((q) => q.status === 'In Progress' || q.status === 'Pending').length;
      const matched = allQuotes.filter((q) => q.status === 'Matched').length;
      const completed = allQuotes.filter((q) => q.status === 'Completed' || q.status === 'Vendor Selected').length;

      setQuoteFunnelData({
        created,
        pending,
        matched,
        completed,
      });

      // Set other dashboard data
      setRecentActivity(activityRes.activities || []);
      setUploadedFiles(filesRes.files || []);
      setTotalQuotes(allQuotes.length);
      setPendingResponses(pending);
      setTotalSavings(savingsRes.totalSavings || 5000); // Mock value for testing
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(`Failed to load dashboard data: ${error}. Please try again.`);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    console.log('useEffect running');
    fetchUserProfile();
    fetchDashboardData();

    // Set up polling to refresh data every 5 minutes
    const intervalId = setInterval(fetchDashboardData, 300000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
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
      setMessage('⚠ Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    setLoading(true);
    setUploadProgress(0);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('userToken');
      const response = await fetch('http://localhost:5000/api/users/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('✅ File uploaded successfully!');
        setUploadProgress(100);
        fetchDashboardData();
        setFile(null);
      } else {
        setMessage(data.message || '⚠ Upload failed.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage('⚠ An error occurred during upload.');
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && quotes.length === 0 && uploadedFiles.length === 0) {
    console.log('Rendering loading state');
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  if (error && quotes.length === 0 && uploadedFiles.length === 0) {
    console.log('Rendering error state:', error);
    return (
      <div className="dashboard-page">
        <p className="error">{error}</p>
        <button className="nav-button" onClick={fetchDashboardData}>
          Retry
        </button>
      </div>
    );
  }

  console.log('Rendering UserDashboard content');
  return (
    <div className="dashboard-page">
      {/* Welcome Header */}
      <header className="welcome-header">
        <h1>Welcome, {userName}!</h1>
      </header>

      {/* Navigation Bar */}
      <nav className="nav-bar">
        <button className="nav-button" onClick={() => navigate('/request-quote')}>
          <FaQuoteRight /> Request a Quote
        </button>
        <button className="nav-button" onClick={() => navigate('/compare-vendors')}>
          <FaBalanceScale /> Compare Vendors
        </button>
        <button className="nav-button" onClick={() => navigate('/manage-account')}>
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

      {/* Tab Navigation */}
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'quotes' ? 'active' : ''}`}
          onClick={() => setActiveTab('quotes')}
        >
          Quotes
        </button>
        <button
          className={`tab-button ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          Files
        </button>
      </div>

      {/* Main Content */}
      <main className="dashboard-content">
        {activeTab === 'overview' && (
          <>
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

            {/* Quote Funnel */}
            <section className="quote-funnel-section">
              <h2>Quote Funnel</h2>
              <QuoteFunnel data={quoteFunnelData} />
            </section>

            {/* Recent Activity */}
            <section className="recent-activity-section">
              <h2>Recent Activity</h2>
              {recentActivity.length > 0 ? (
                <ul className="activity-list">
                  {recentActivity.map((activity, index) => (
                    <li key={index} className="activity-item">
                      <div className="activity-icon">
                        {activity.type === 'quote' && <FaQuoteRight />}
                        {activity.type === 'upload' && <FaUpload />}
                        {activity.type === 'login' && <FaUserCog />}
                      </div>
                      <div className="activity-content">
                        <p className="activity-description">{activity.description}</p>
                        <p className="activity-date">{formatDate(activity.date)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-data">No recent activity available.</p>
              )}
            </section>
          </>
        )}

        {activeTab === 'quotes' && (
          <section className="quotes-section">
            <h2>Your Quote Requests</h2>
            {quotes.length > 0 ? (
              <div className="quotes-list">
                {quotes.map((quote, index) => (
                  <div key={index} className="quote-card">
                    <div className="quote-header">
                      <h3>{quote.companyName || 'Quote Request'}</h3>
                      <span
                        className={`quote-status status-${quote.status?.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {quote.status}
                      </span>
                    </div>
                    <div className="quote-details">
                      <p>
                        <strong>Date:</strong> {formatDate(quote.createdAt)}
                      </p>
                      <p>
                        <strong>Industry:</strong> {quote.industryType || 'Not specified'}
                      </p>
                      {quote.matchedVendors && quote.matchedVendors.length > 0 && (
                        <p>
                          <strong>Matched Vendors:</strong> {quote.matchedVendors.length}
                        </p>
                      )}
                    </div>
                    <div className="quote-actions">
                      <button
                        className="view-quote-button"
                        onClick={() => navigate(`/quotes/${quote._id}`)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">
                No quote requests available. <a href="/request-quote">Request a quote</a> to get started.
              </p>
            )}
          </section>
        )}

        {activeTab === 'files' && (
          <>
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
                <option value="invoice">Invoice</option>
                <option value="other">Other</option>
              </select>
              <div className="upload-dropzone" onClick={() => document.querySelector('.file-input').click()}>
                <FaCloudUploadAlt size={50} />
                <p>{file ? file.name : 'Drag & Drop a file here or Click to Upload'}</p>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  className="file-input"
                />
              </div>
              <button className="nav-button upload" onClick={handleUpload} disabled={loading}>
                {loading ? `Uploading... ${uploadProgress}%` : 'Upload Document'}
              </button>
              {message && <p className="upload-message">{message}</p>}
            </section>

            {/* Uploaded Files History */}
            <section className="uploaded-files-section">
              <h2>Uploaded Files History</h2>
              {uploadedFiles.length > 0 ? (
                <div className="files-list">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="file-card">
                      <div className="file-icon">
                        {file.fileType === 'pdf' && <span className="file-type-pdf">PDF</span>}
                        {file.fileType === 'doc' && <span className="file-type-doc">DOC</span>}
                        {file.fileType === 'docx' && <span className="file-type-docx">DOCX</span>}
                        {file.fileType === 'png' && <span className="file-type-image">PNG</span>}
                        {file.fileType === 'jpg' && <span className="file-type-image">JPG</span>}
                        {file.fileType === 'jpeg' && <span className="file-type-image">JPEG</span>}
                      </div>
                      <div className="file-details">
                        <p>
                          <strong>Name:</strong> {file.name}
                        </p>
                        <p>
                          <strong>Type:</strong> {file.documentType}
                        </p>
                        <p>
                          <strong>Uploaded:</strong> {formatDate(file.uploadedAt)}
                        </p>
                      </div>
                      <div className="file-actions">
                        <a href={file.url} download className="download-button">
                          Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No files uploaded yet.</p>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;