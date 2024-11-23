import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin-login');
      return;
    }

    const fetchData = async () => {
      try {
        const userResponse = await axios.get('http://localhost:5000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(userResponse.data);

        const vendorResponse = await axios.get('http://localhost:5000/api/admin/vendors', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVendors(vendorResponse.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [navigate]);

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <section>
        <h2>Users</h2>
        <ul>{users.map((user) => <li key={user._id}>{user.name}</li>)}</ul>
      </section>
      <section>
        <h2>Vendors</h2>
        <ul>{vendors.map((vendor) => <li key={vendor._id}>{vendor.name}</li>)}</ul>
      </section>
    </div>
  );
};

export default AdminDashboard;
