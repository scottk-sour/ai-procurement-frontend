// App.js
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
import Photocopiers from './components/services/Photocopiers';
import Telecoms from './components/services/Telecoms';
import CCTV from './components/services/CCTV';
import ITSolutions from './components/services/ITSolutions';
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
import WhyChooseUs from './components/WhyChooseUs';
import HowItWorks from './components/HowItWorks';
import PrivacyPolicy from './components/PrivacyPolicy';
import MeetTheExperts from './components/MeetTheExperts';
import QuoteDetails from './components/quotes/QuoteDetails'; // Handle dynamic quote statuses

// Utility function to validate token existence
const isTokenValid = (token) => token && token.trim() !== '';

// Private Route Wrapper for User Authentication
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('userToken');
  return isTokenValid(token) ? children : <Navigate to="/login" replace />;
};

// Private Route Wrapper for Vendor Authentication
const VendorPrivateRoute = ({ children }) => {
  const vendorToken = localStorage.getItem('vendorToken');
  return isTokenValid(vendorToken) ? children : <Navigate to="/vendor-login" replace />;
};

// Private Route Wrapper for Admin Authentication
const AdminPrivateRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');
  return isTokenValid(adminToken) ? children : <Navigate to="/admin-login" replace />;
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
          <Route path="/services/photocopiers" element={<Photocopiers />} />
          <Route path="/services/telecoms" element={<Telecoms />} />
          <Route path="/services/cctv" element={<CCTV />} />
          <Route path="/services/it" element={<ITSolutions />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/why-choose-us" element={<WhyChooseUs />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/experts" element={<MeetTheExperts />} />

          {/* User Protected Routes */}
          <Route
            path="/user-dashboard"
            element={
              <PrivateRoute>
                <UserDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/request-quote"
            element={
              <PrivateRoute>
                <RequestQuote />
              </PrivateRoute>
            }
          />
          <Route
            path="/compare-vendors"
            element={
              <PrivateRoute>
                <CompareVendors />
              </PrivateRoute>
            }
          />
          <Route
            path="/manage-account"
            element={
              <PrivateRoute>
                <ManageAccount />
              </PrivateRoute>
            }
          />

          {/* Vendor Protected Routes */}
          <Route
            path="/vendor-dashboard"
            element={
              <VendorPrivateRoute>
                <VendorDashboard />
              </VendorPrivateRoute>
            }
          />
          <Route
            path="/manage-listings"
            element={
              <VendorPrivateRoute>
                <ManageListings />
              </VendorPrivateRoute>
            }
          />
          <Route
            path="/view-orders"
            element={
              <VendorPrivateRoute>
                <ViewOrders />
              </VendorPrivateRoute>
            }
          />
          <Route
            path="/account-settings"
            element={
              <VendorPrivateRoute>
                <AccountSettings />
              </VendorPrivateRoute>
            }
          />
          <Route
            path="/quotes/:status"
            element={
              <VendorPrivateRoute>
                <QuoteDetails />
              </VendorPrivateRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin-dashboard"
            element={
              <AdminPrivateRoute>
                <AdminDashboard />
              </AdminPrivateRoute>
            }
          />
          <Route
            path="/admin-users"
            element={
              <AdminPrivateRoute>
                <AdminUserManagement />
              </AdminPrivateRoute>
            }
          />

          {/* Fallback Route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
