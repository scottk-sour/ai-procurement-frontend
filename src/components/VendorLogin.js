// src/components/VendorLogin.js
import React, { useState } from 'react';
import axios from 'axios';
import './VendorLogin.css'; // Importing the CSS file

const VendorLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/vendor-login', { email, password });
            setMessage(response.data.message);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="vendor-login-container">
            <h2>Vendor Login</h2>
            {message && <p>{message}</p>}
            <form onSubmit={handleLogin}>
                <label>Email:</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <label>Password:</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default VendorLogin;
