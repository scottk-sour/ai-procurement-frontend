import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaQuoteRight, FaBalanceScale, FaUserCog, FaBell, 
  FaUpload, FaUserCircle, FaMoon, FaSun, FaFileAlt, FaChartBar
} from 'react-icons/fa';
import '../styles/UserDashboard.css';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('User');
  const [userEmail, setUserEmail] = useState('');
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState('contract');
  const [message, setMessage] = useState('');
  const [recentActivity, setRecentActivity] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const name = localStorage.getItem('userName');
    const email = localStorage.getItem('userEmail');

    if (!token) {
      navigate('/login');
      return;
    }
    if (name) setUserName(name);
    if (email) setUserEmail(email);

    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      const [activityRes, filesRes] = await Promise.all([
        fetch(`http://localhost:5000/api/users/recent-activity`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`http://localhost:5000/api/users/uploaded-files`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!activityRes.ok || !filesRes.ok) {
        throw new Error('Failed to fetch dashboard data.');
      }

      const activityData = await activityRes.json();
      const filesData = await filesRes.json();

      setRecentActivity(activityData.activities || []);
      setUploadedFiles(filesData.files || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setMessage('⚠ Error loading data. Please try again.');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleFileChange = (event) => setFile(event.target.files[0]);

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
      const response = await fetch('http://localhost:5000/api/users/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('✅ File uploaded successfully!');
        setUploadProgress(100);
        fetchDashboardData();
      } else {
        setMessage(data.message || '⚠ Upload failed.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage('⚠ An error occurred during upload.');
    }
    setLoading(false);
    setTimeout(() => setUploadProgress(0), 2000);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <div className={`dashboard-container ${theme}`}>
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="user-info">
          <FaUserCircle className="user-icon" />
          <div>
            <h2>{userName}</h2>
            <p>{userEmail}</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="theme-toggle-button" onClick={toggleTheme}>
            {theme === 'light' ? <FaMoon /> : <FaSun />}
          </button>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* 🔹 Quick Actions */}
      <div className="quick-actions">
        <button className="dashboard-button request-quote" onClick={() => navigate('/request-quote')}>
          <FaQuoteRight /> Request a Quote
        </button>
        <button className="dashboard-button compare-vendors" onClick={() => navigate('/compare-vendors')}>
          <FaBalanceScale /> Compare Vendors
        </button>
        <button className="dashboard-button manage-account" onClick={() => navigate('/manage-account')}>
          <FaUserCog /> Manage Account
        </button>
      </div>

      {/* 🔹 Dashboard Overview Cards */}
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <FaChartBar className="dashboard-icon" />
          <h3>Total Quotes Requested</h3>
          <p>12</p>
        </div>
        <div className="dashboard-card">
          <FaFileAlt className="dashboard-icon" />
          <h3>Uploaded Documents</h3>
          <p>{uploadedFiles.length}</p>
        </div>
        <div className="dashboard-card">
          <FaBell className="dashboard-icon" />
          <h3>Pending Vendor Responses</h3>
          <p>4</p>
        </div>
      </div>

      {/* 🔹 File Upload Section */}
      <div className="file-upload-section">
        <h2><FaUpload /> Upload Documents</h2>
        <select value={documentType} onChange={(e) => setDocumentType(e.target.value)}>
          <option value="contract">Contract</option>
          <option value="bill">Bill</option>
        </select>
        <input type="file" className="file-input" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={loading}>
          {loading ? `Uploading... ${uploadProgress}%` : 'Upload Document'}
        </button>
        {message && <p>{message}</p>}
      </div>

      {/* 🔹 Recent Activity */}
      <div className="recent-activity">
        <h2><FaBell /> Recent Activity</h2>
        <ul>
          {recentActivity.map((activity, idx) => (
            <li key={idx}><FaBell /> {activity.description} on {activity.date}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserDashboard;
