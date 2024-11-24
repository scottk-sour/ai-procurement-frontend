import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin-login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        // Fetch data for users and vendors
        const [userResponse, vendorResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/users', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/admin/vendors', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Ensure responses are valid
        setUsers(userResponse.data || []);
        setVendors(vendorResponse.data || []);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return <div className="admin-dashboard">Loading...</div>;
  }

  if (error) {
    return <div className="admin-dashboard error">{error}</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      {/* Users Section */}
      <section className="dashboard-section">
        <h2>Total Users: {users.length}</h2>
        {users.length > 0 ? (
          <ul>
            {users.map((user) => (
              <li key={user._id}>
                <Link to={`/admin-users/${user._id}`}>{user.name || 'Unnamed User'}</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No users found.</p>
        )}
      </section>

      {/* Vendors Section */}
      <section className="dashboard-section">
        <h2>Total Vendors: {vendors.length}</h2>
        {vendors.length > 0 ? (
          <ul>
            {vendors.map((vendor) => (
              <li key={vendor._id}>
                <Link to={`/admin-vendors/${vendor._id}`}>{vendor.name || 'Unnamed Vendor'}</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No vendors found.</p>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
