import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBox,
  FaChartLine,
  FaCog,
  FaDollarSign,
  FaSignOutAlt,
  FaUpload,
} from "react-icons/fa";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import axios from "axios";
import "../styles/VendorDashboard.css";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [vendorName, setVendorName] = useState("Vendor");
  const [uploadStatus, setUploadStatus] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [theme, setTheme] = useState("light");

  // KPIs
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [activeListings, setActiveListings] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    const initializeDashboard = async () => {
      // Load theme from localStorage
      const savedTheme = localStorage.getItem("theme") || "light";
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);

      const token = localStorage.getItem("vendorToken");
      if (!token) {
        navigate("/vendor-login");
        return;
      }

      try {
        // Fetch vendor dashboard data
        const response = await axios.get(
          "http://localhost:5000/api/vendors/dashboard",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("Dashboard Data:", response.data);
        setVendor(response.data);
        setVendorName(response.data.companyName || "Vendor");

        // Set KPIs if available
        setTotalRevenue(response.data.kpis?.totalRevenue || 0);
        setActiveListings(response.data.kpis?.activeListings || 0);
        setTotalOrders(response.data.kpis?.totalOrders || 0);
      } catch (error) {
        console.error("Error fetching dashboard data:", error.message);
        if (error.response?.status === 401) {
          localStorage.clear();
          navigate("/vendor-login");
        }
      }
    };

    initializeDashboard();
  }, [navigate]);

  // Logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/vendor-login");
  };

  // Theme toggle
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // File upload handler
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("vendorToken");

    try {
      // POST to your vendor upload route
      // This route should parse CSV (if it's .csv)
      // and store the data in vendor.machines or vendor.products
      const response = await axios.post(
        "http://localhost:5000/api/vendors/upload",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // If upload is successful, update the UI
      setUploadStatus({
        message: "File uploaded successfully!",
        type: "success",
      });

      // The backend might return the updated vendor doc
      // so we update local state
      if (response.data.vendor) {
        setVendor(response.data.vendor);
      }
    } catch (error) {
      console.error("Error uploading file:", error.message);
      setUploadStatus({
        message:
          error.response?.data?.message || "File upload failed. Please try again.",
        type: "error",
      });
    }
  };

  // Navigate to quotes with given status
  const navigateToQuotes = (status) => {
    navigate(`/quotes?status=${status}`);
  };

  return (
    <div className="vendor-dashboard-container">
      {/* Header */}
      <header className="vendor-dashboard-header">
        <h1>Welcome, {vendorName}!</h1>
        <div className="header-controls">
          <button className="logout-button" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
          <button className="theme-toggle-button" onClick={toggleTheme}>
            {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>
        </div>
      </header>

      {/* Upload Status */}
      {uploadStatus && (
        <p className={`upload-status ${uploadStatus.type}`}>
          {uploadStatus.message}
        </p>
      )}

      {/* Quick Actions */}
      <section className="vendor-quick-actions">
        <button
          className="dashboard-button"
          onClick={() => navigate("/manage-listings")}
        >
          <FaBox /> Manage Listings
        </button>
        <button className="dashboard-button" onClick={() => navigate("/view-orders")}>
          <FaChartLine /> View Orders
        </button>
        <button className="dashboard-button" onClick={() => navigate("/vendor-profile")}>
          <FaCog /> Edit Profile
        </button>
        <label className="upload-label">
          <FaUpload /> Upload Documents
          <input type="file" className="file-input" onChange={handleFileUpload} />
        </label>
      </section>

      {/* KPIs */}
      <section className="vendor-stats-widgets">
        <div className="stat-widget">
          <FaDollarSign className="stat-icon" />
          <h3>Total Revenue</h3>
          <p>£{totalRevenue}</p>
        </div>
        <div className="stat-widget">
          <FaBox className="stat-icon" />
          <h3>Active Listings</h3>
          <p>{activeListings}</p>
        </div>
        <div className="stat-widget">
          <FaChartLine className="stat-icon" />
          <h3>Total Orders</h3>
          <p>{totalOrders}</p>
        </div>
      </section>

      {/* Uploaded Files */}
      <section className="uploaded-products">
        <h2>Uploaded Files</h2>
        {vendor?.uploads && vendor.uploads.length > 0 ? (
          <ul className="uploaded-files-list">
            {vendor.uploads.map((file, index) => (
              <li key={index}>
                📄 {file.fileName} —{" "}
                <span>{new Date(file.uploadDate).toLocaleDateString()}</span>{" "}
                <a href={`http://localhost:5000/${file.filePath}`} download>
                  📥 Download
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p>No uploaded files yet.</p>
        )}
      </section>

      {/* Example of showing "machines" from CSV parsing */}
      <section className="uploaded-machines">
        <h2>Uploaded Machines (From CSV)</h2>
        {vendor?.machines && vendor.machines.length > 0 ? (
          <ul className="uploaded-machines-list">
            {vendor.machines.map((machine, idx) => (
              <li key={idx}>
                <strong>Model:</strong> {machine.model} |{" "}
                <strong>Price:</strong> £{machine.price}
                {/* Add more fields if your CSV has them */}
              </li>
            ))}
          </ul>
        ) : (
          <p>No machines found. Upload a CSV to populate this list.</p>
        )}
      </section>

      {/* Quote Funnel */}
      <section className="quote-funnel">
        <h2>Quote Funnel</h2>
        <ul>
          <li onClick={() => navigateToQuotes("created")}>
            Created: {vendor?.quoteFunnelData?.created || 0}
          </li>
          <li onClick={() => navigateToQuotes("pending")}>
            Pending: {vendor?.quoteFunnelData?.pending || 0}
          </li>
          <li onClick={() => navigateToQuotes("won")}>
            Won: {vendor?.quoteFunnelData?.won || 0}
          </li>
          <li onClick={() => navigateToQuotes("lost")}>
            Lost: {vendor?.quoteFunnelData?.lost || 0}
          </li>
        </ul>
      </section>

      {/* Monthly Revenue Chart */}
      <section className="revenue-chart">
        <h2>Monthly Revenue</h2>
        <LineChart width={600} height={300} data={vendor?.revenueData || []}>
          <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="_id" />
          <YAxis />
          <Tooltip />
        </LineChart>
      </section>
    </div>
  );
};

export default VendorDashboard;
