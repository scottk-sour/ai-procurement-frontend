import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaQuoteRight, FaBalanceScale, FaUserCog, FaBell, FaTasks, FaUpload } from 'react-icons/fa';
import '../styles/UserDashboard.css';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('User');
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState('contract'); // Default to 'contract'
  const [message, setMessage] = useState('');

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
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType); // Add the document type

    try {
      const response = await fetch('http://localhost:5000/api/users/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('userToken')}`
        },
        body: formData
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('File uploaded successfully');
      } else {
        setMessage(data.message || 'Error uploading file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage('An error occurred during upload');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {userName}!</h1>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>

      <div className="quick-actions">
        <button className="dashboard-button" onClick={() => navigate('/request-quote')}>
          <FaQuoteRight /> Request a Quote
        </button>
        <button className="dashboard-button" onClick={() => navigate('/compare-vendors')}>
          <FaBalanceScale /> Compare Vendors
        </button>
        <button className="dashboard-button" onClick={() => navigate('/manage-account')}>
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
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload Document</button>
        {message && <p className="message">{message}</p>}
      </div>

      <div className="recent-activity">
        <h2><FaTasks /> Recent Activity</h2>
        <ul>
          <li><FaBell /> Quote requested on 2024-10-01</li>
          <li><FaBell /> Quote comparison completed on 2024-10-02</li>
          <li><FaBell /> Account updated on 2024-10-03</li>
        </ul>
      </div>
    </div>
  );
};

export default UserDashboard;
