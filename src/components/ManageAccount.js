// src/components/ManageAccount.js
import React, { useState } from 'react';
import './ManageAccount.css';

const ManageAccount = () => {
  const [userInfo, setUserInfo] = useState({
    name: 'John Doe',
    email: 'johndoe@example.com',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic for saving account changes
    alert('Account information saved successfully!');
  };

  return (
    <div className="manage-account-container">
      <h2 className="manage-account-title">Manage Account</h2>

      <form className="account-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={userInfo.name}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={userInfo.email}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            name="password"
            className="form-control"
            placeholder="Enter new password"
          />
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            className="form-control"
            placeholder="Confirm new password"
          />
        </div>

        <button type="submit" className="save-changes-button">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default ManageAccount;
