import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBox,
  FaChartLine,
  FaCog,
  FaDollarSign,
  FaSignOutAlt,
  FaUpload,
} from 'react-icons/fa';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import axios from 'axios';
import '../styles/VendorDashboard.css';

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [vendorName, setVendorName] = useState('Vendor');
  const [uploadStatus, setUploadStatus] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [theme, setTheme] = useState('light');

  // Fetch dashboard details on load
  useEffect(() => {
    const initializeDashboard = async () => {
      const savedTheme = localStorage.getItem('theme') || 'light';
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);

      const token = localStorage.getItem('vendorToken');
      if (!token) {
        navigate('/vendor-login');
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/vendors/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Dashboard Data:", response.data); // Debugging log

        setVendor(response.data);
        setVendorName(response.data.companyName || 'Vendor');
      } catch (error) {
        console.error('Error fetching dashboard data:', error.message);
        if (error.response?.status === 401) {
          localStorage.clear();
          navigate('/vendor-login');
        }
      }
    };

    initializeDashboard();
  }, [navigate]);

  // Handle logout
  const handleLogout = () => {
    localStorage.clear();
    navigate('/vendor-login');
  };

  // Toggle light/dark mode
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('vendorToken');

    try {
      const response = await axios.post('http://localhost:5000/api/vendors/upload', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUploadStatus({ message: 'File uploaded successfully!', type: 'success' });
      setVendor(response.data.vendor);
    } catch (error) {
      console.error('Error uploading file:', error.message);
      setUploadStatus({
        message: error.response?.data?.message || 'File upload failed. Please try again.',
        type: 'error',
      });
    }
  };

  // Navigate to quotes based on status
  const navigateToQuotes = (status) => {
    navigate(`/quotes?status=${status}`);
  };

  return (
    <div className="vendor-dashboard-container">
      {/* Header */}
      <div className="vendor-dashboard-header">
        <h1>Welcome, {vendorName}!</h1>
        <div>
          <button className="logout-button" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
          <button className="theme-toggle-button" onClick={toggleTheme}>
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
        </div>
      </div>

      {/* Upload status messages */}
      {uploadStatus && (
        <p className={`upload-status ${uploadStatus.type}`}>{uploadStatus.message}</p>
      )}

      {/* Quick actions */}
      <div className="vendor-quick-actions">
        <button className="dashboard-button" onClick={() => navigate('/manage-listings')}>
          <FaBox /> Manage Listings
        </button>
        <button className="dashboard-button" onClick={() => navigate('/view-orders')}>
          <FaChartLine /> View Orders
        </button>
        <button className="dashboard-button" onClick={() => navigate('/vendor-profile')}>
          <FaCog /> Edit Profile
        </button>
        <label className="upload-label">
          <FaUpload /> Upload Documents
          <input type="file" className="file-input" onChange={handleFileUpload} />
        </label>
      </div>

      {/* Key KPIs */}
      <div className="vendor-stats-widgets">
        <div className="stat-widget">
          <FaDollarSign />
          <h3>Total Revenue</h3>
          <p>£{vendor?.kpis?.totalRevenue || 0}</p>
        </div>
        <div className="stat-widget">
          <FaBox />
          <h3>Active Listings</h3>
          <p>{vendor?.kpis?.activeListings || 0}</p>
        </div>
        <div className="stat-widget">
          <FaChartLine />
          <h3>Total Orders</h3>
          <p>{vendor?.kpis?.totalOrders || 0}</p>
        </div>
      </div>

      {/* Uploaded Products Section */}
      <div className="uploaded-products">
        <h2>Uploaded Products</h2>
        {vendor?.uploads?.length > 0 ? (
          <ul>
            {vendor.uploads.map((file, index) => (
              <li key={index}>
                📄 {file.fileName} - Uploaded on {new Date(file.uploadDate).toLocaleDateString()}
                <a href={`http://localhost:5000/${file.filePath}`} download> 📥 Download</a>
              </li>
            ))}
          </ul>
        ) : (
          <p>No uploaded products yet.</p>
        )}
      </div>

      {/* Quote Funnel */}
      <div className="quote-funnel">
        <h2>Quote Funnel</h2>
        <ul>
          <li onClick={() => navigateToQuotes('created')}>
            Created: {vendor?.quoteFunnelData?.created || 0}
          </li>
          <li onClick={() => navigateToQuotes('pending')}>
            Pending: {vendor?.quoteFunnelData?.pending || 0}
          </li>
          <li onClick={() => navigateToQuotes('won')}>
            Won: {vendor?.quoteFunnelData?.won || 0}
          </li>
          <li onClick={() => navigateToQuotes('lost')}>
            Lost: {vendor?.quoteFunnelData?.lost || 0}
          </li>
        </ul>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="revenue-chart">
        <h2>Monthly Revenue</h2>
        <LineChart width={600} height={300} data={vendor?.revenueData || []}>
          <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="_id" />
          <YAxis />
          <Tooltip />
        </LineChart>
      </div>
    </div>
  );
};

export default VendorDashboard;