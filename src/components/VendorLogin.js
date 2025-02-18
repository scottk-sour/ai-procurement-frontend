import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/VendorLogin.css';

const VendorLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If vendor is already logged in, redirect to vendor dashboard
  useEffect(() => {
    const token = localStorage.getItem('vendorToken');
    if (token) {
      navigate('/vendor-dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('http://localhost:5000/api/vendors/login', formData);

      if (response.data.token) {
        localStorage.setItem('vendorToken', response.data.token);
        // Optionally, store additional vendor details if provided
        localStorage.setItem('vendorName', response.data.name || 'Vendor');
        localStorage.setItem('vendorId', response.data.vendorId);
        
        setMessage('Logged in successfully! Redirecting...');
        // Redirect to vendor dashboard after a short delay
        setTimeout(() => navigate('/vendor-dashboard'), 1000);
      } else {
        setMessage('Login successful, but no token received.');
      }
    } catch (error) {
      if (error.response && (error.response.status === 400 || error.response.status === 401)) {
        setMessage('Invalid email or password. Please try again.');
      } else {
        setMessage(error.response?.data?.message || 'An error occurred during login. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vendor-login-container">
      <h2>Vendor Login</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p>
        Don't have an account? <Link to="/vendor-signup">Sign Up</Link>
      </p>
    </div>
  );
};

export default VendorLogin;
