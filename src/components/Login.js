// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Import the CSS file for styles

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(''); // Error message state
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true before API call
    setError(''); // Clear previous errors

    // Basic validation
    if (username.trim() === '' || password.trim() === '') {
      setError('Username and password are required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token); // Store the JWT token
        localStorage.setItem('userName', data.name || 'User'); // Store the user's name if available
        navigate('/dashboard'); // Redirect to the dashboard
      } else {
        setError(data.error || 'Login failed'); // Set error message
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2>Login</h2> {/* Move the heading inside the form */}
        {error && <p className="error-message">{error}</p>} {/* Display error messages */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="cta-button primary" disabled={loading}>
          {loading ? 'Loading...' : 'Login'} {/* Change button text while loading */}
        </button>
        <p className="redirect-text">
          Don't have an account? <a href="/signup">Sign Up</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
