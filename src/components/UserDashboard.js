import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaQuoteRight, FaBalanceScale, FaUserCog, FaBell, FaTasks, FaUpload } from 'react-icons/fa';
import '../styles/UserDashboard.css';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('User');
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState('contract');
  const [message, setMessage] = useState('');
  const [recentActivity, setRecentActivity] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const name = localStorage.getItem('userName');
    if (!token) {
      navigate('/login');
      return;
    }
    if (name) {
      setUserName(name);
    }

    fetchRecentActivity();
    fetchUploadedFiles();
  }, [navigate]);

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/recent-activity', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('userToken')}`,
        },
      });
      const data = await response.json();
      setRecentActivity(data.activities || []);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const fetchUploadedFiles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/uploaded-files', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('userToken')}`,
        },
      });
      const data = await response.json();
      setUploadedFiles(data.files || []);
    } catch (error) {
      console.error('Error fetching uploaded files:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userName');
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
  };

  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {userName}!</h1>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
        <button className="theme-toggle-button" onClick={toggleTheme}>
          Toggle Theme
        </button>
      </div>

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

      <div className="file-upload-section">
        <h2>
          <FaUpload /> Upload Documents
        </h2>
        <select value={documentType} onChange={(e) => setDocumentType(e.target.value)}>
          <option value="contract">Contract</option>
          <option value="bill">Bill</option>
        </select>
        <label className="upload-label">
          <FaUpload /> Choose File
          <input type="file" className="file-input" onChange={handleFileChange} />
        </label>
        <button onClick={handleUpload}>Upload Document</button>
        {message && <p>{message}</p>}
        <ul>
          {uploadedFiles.map((file, idx) => (
            <li key={idx}>{file.fileName}</li>
          ))}
        </ul>
      </div>

      <div className="recent-activity">
        <h2>
          <FaTasks /> Recent Activity
        </h2>
        <ul>
          {recentActivity.map((activity, idx) => (
            <li key={idx}>
              <FaBell /> {activity.description} on {activity.date}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserDashboard;
