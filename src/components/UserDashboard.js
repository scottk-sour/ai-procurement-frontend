import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaQuoteRight, FaBalanceScale, FaUserCog, FaBell, FaTasks, FaUpload, FaUserCircle, FaMoon, FaSun
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

    fetchRecentActivity();
    fetchUploadedFiles();
  }, [navigate]);

  const fetchRecentActivity = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/users/recent-activity', {
        headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` },
      });
      const data = await response.json();
      setRecentActivity(data.activities || []);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
    setLoading(false);
  };

  const fetchUploadedFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/users/uploaded-files', {
        headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` },
      });
      const data = await response.json();
      setUploadedFiles(data.files || []);
    } catch (error) {
      console.error('Error fetching uploaded files:', error);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  const handleFileChange = (event) => setFile(event.target.files[0]);

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/users/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('File uploaded successfully');
        fetchUploadedFiles();
      } else {
        setMessage(data.message || 'Error uploading file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage('An error occurred during upload');
    }
    setLoading(false);
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

      {/* Quick Actions */}
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

      {/* File Upload Section */}
      <div className="file-upload-section">
        <h2><FaUpload /> Upload Documents</h2>
        <select value={documentType} onChange={(e) => setDocumentType(e.target.value)}>
          <option value="contract">Contract</option>
          <option value="bill">Bill</option>
        </select>
        <label className="upload-label">
          <FaUpload /> Choose File
          <input type="file" className="file-input" onChange={handleFileChange} />
        </label>
        <button onClick={handleUpload} disabled={loading}>
          {loading ? 'Uploading...' : 'Upload Document'}
        </button>
        {message && <p>{message}</p>}
        <ul>
          {uploadedFiles.map((file, idx) => (
            <li key={idx}>{file.fileName}</li>
          ))}
        </ul>
      </div>

      {/* Recent Activity Section */}
      <div className="recent-activity">
        <h2><FaTasks /> Recent Activity</h2>
        {loading ? <p>Loading...</p> : (
          <ul>
            {recentActivity.map((activity, idx) => (
              <li key={idx}><FaBell /> {activity.description} on {activity.date}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
