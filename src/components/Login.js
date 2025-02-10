import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (email.trim() === '' || password.trim() === '') {
      setError('Email and password are required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("✅ Login successful, storing token...");
        
        // ✅ Standardized token storage (Matches RequestQuote.js)
        localStorage.setItem('token', data.token); // Store the JWT token correctly
        localStorage.setItem('userName', data.name || 'User'); // Store the user's name if available
        localStorage.setItem('userId', data.userId); // Store userId for later use

        // ✅ Confirm token storage
        console.log("🔍 Stored Token:", localStorage.getItem('token'));

        navigate('/dashboard'); // Redirect after login
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Error during login:', error);
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <button type="submit" className="cta-button primary" disabled={loading}>
          {loading ? 'Loading...' : 'Login'}
        </button>
        <p className="redirect-text">
          Don't have an account? <a href="/signup">Sign Up</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
