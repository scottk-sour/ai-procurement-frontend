import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Signup from './components/Signup';
import UserDashboard from './components/UserDashboard';
import VendorDashboard from './components/VendorDashboard';
import RequestQuote from './components/RequestQuote';
import CompareVendors from './components/CompareVendors';
import ManageAccount from './components/ManageAccount';
import AboutUs from './components/AboutUs';
import ServicesOverview from './components/ServicesOverview';
import VendorSignup from './components/VendorSignup';
import VendorLogin from './components/VendorLogin';
import ContactUs from './components/ContactUs';
import NotFound from './components/NotFound';
import Footer from './components/Footer';
import ManageListings from './components/ManageListings';
import ViewOrders from './components/ViewOrders';
import AccountSettings from './components/AccountSettings';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import AdminUserManagement from './components/AdminUserManagement';

// Private route for user authentication
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('userToken');
  return token ? children : <Navigate to="/login" replace />;
};

// Private route for vendor authentication
const VendorPrivateRoute = ({ children }) => {
  const vendorToken = localStorage.getItem('vendorToken');
  return vendorToken ? children : <Navigate to="/vendor-login" replace />;
};

// Private route for admin authentication
const AdminPrivateRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');
  return adminToken ? children : <Navigate to="/admin-login" replace />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/vendor-login" element={<VendorLogin />} />
          <Route path="/vendor-signup" element={<VendorSignup />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/services" element={<ServicesOverview />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* Protected Routes for Users */}
          <Route path="/dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
          <Route path="/request-quote" element={<PrivateRoute><RequestQuote /></PrivateRoute>} />
          <Route path="/compare-vendors" element={<PrivateRoute><CompareVendors /></PrivateRoute>} />
          <Route path="/manage-account" element={<PrivateRoute><ManageAccount /></PrivateRoute>} />

          {/* Protected Routes for Vendors */}
          <Route path="/vendor-dashboard" element={<VendorPrivateRoute><VendorDashboard /></VendorPrivateRoute>} />
          <Route path="/manage-listings" element={<VendorPrivateRoute><ManageListings /></VendorPrivateRoute>} />
          <Route path="/view-orders" element={<VendorPrivateRoute><ViewOrders /></VendorPrivateRoute>} />
          <Route path="/account-settings" element={<VendorPrivateRoute><AccountSettings /></VendorPrivateRoute>} />

          {/* Protected Routes for Admin */}
          <Route path="/admin-dashboard" element={<AdminPrivateRoute><AdminDashboard /></AdminPrivateRoute>} />
          <Route path="/admin-users" element={<AdminPrivateRoute><AdminUserManagement /></AdminPrivateRoute>} />

          {/* Fallback Route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
