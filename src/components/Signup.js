import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Signup.css'; // Import your existing CSS styles

const Signup = () => {
  // State variables for form inputs
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: ''
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  // Function to handle changes in form inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Function to check password strength
  const checkPasswordStrength = (password) => {
    if (password.length < 6) return 'Weak';
    if (password.match(/[A-Z]/) && password.match(/[0-9]/)) return 'Strong';
    return 'Medium';
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setFormData({ ...formData, password: newPassword });
    setPasswordStrength(checkPasswordStrength(newPassword));
  };

  // Function to handle form submission
  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const { name, email, password, confirmPassword, company } = formData;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required!');
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('http://localhost:5000/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, company })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Signup successful! You can now log in.");
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setError(data.message || 'Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during signup:', error);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSignup} className="signup-form">
        <h2>Create Account</h2>
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
        
        {/* Name Field */}
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        {/* Email Field */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        {/* Password Field */}
        <div className="password-field">
          <input
            type={passwordVisible ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handlePasswordChange}
            required
          />
          <button
            type="button"
            onClick={() => setPasswordVisible(!passwordVisible)}
            className="toggle-password-visibility"
          >
            {passwordVisible ? "Hide" : "Show"}
          </button>
        </div>
        <p>Password Strength: {passwordStrength}</p>

        {/* Confirm Password Field */}
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        {/* Company Field (Optional) */}
        <input
          type="text"
          name="company"
          placeholder="Company (Optional)"
          value={formData.company}
          onChange={handleChange}
        />

        <button type="submit" className="cta-button primary" disabled={loading}>
          {loading ? 'Loading...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
};

export default Signup;
