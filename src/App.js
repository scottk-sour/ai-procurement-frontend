// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Signup from './components/Signup';
import UserDashboard from './components/UserDashboard';
import RequestQuote from './components/RequestQuote';
import CompareVendors from './components/CompareVendors';
import ManageAccount from './components/ManageAccount';
import AboutUs from './components/AboutUs';
import ServicesOverview from './components/ServicesOverview';
import VendorSignup from './components/VendorSignup';
import VendorLogin from './components/VendorLogin'; // Import VendorLogin component
import NotFound from './components/NotFound';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/vendor-login" element={<VendorLogin />} /> {/* Vendor Login Route */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
          <Route path="/request-quote" element={<PrivateRoute><RequestQuote /></PrivateRoute>} />
          <Route path="/compare-vendors" element={<PrivateRoute><CompareVendors /></PrivateRoute>} />
          <Route path="/manage-account" element={<PrivateRoute><ManageAccount /></PrivateRoute>} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/services" element={<ServicesOverview />} />
          <Route path="/vendor-signup" element={<VendorSignup />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
