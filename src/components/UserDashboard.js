// src/components/UserDashboard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear the JWT token
    navigate('/login'); // Redirect to the login page
  };

  return (
    <div>
      <h1>Welcome to the Dashboard!</h1>
      <button onClick={handleLogout}>Logout</button>
      {/* Dashboard content here */}
    </div>
  );
};

export default UserDashboard;
