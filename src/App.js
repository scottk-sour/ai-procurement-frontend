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
import ManageListings from './components/ManageListings'; // New import
import ViewOrders from './components/ViewOrders'; // New import
import AccountSettings from './components/AccountSettings'; // New import

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const VendorPrivateRoute = ({ children }) => {
  const vendorToken = localStorage.getItem('vendorToken');
  return vendorToken ? children : <Navigate to="/vendor-login" />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/vendor-login" element={<VendorLogin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
          <Route path="/vendor-dashboard" element={<VendorPrivateRoute><VendorDashboard /></VendorPrivateRoute>} />
          <Route path="/request-quote" element={<PrivateRoute><RequestQuote /></PrivateRoute>} />
          <Route path="/compare-vendors" element={<PrivateRoute><CompareVendors /></PrivateRoute>} />
          <Route path="/manage-account" element={<PrivateRoute><ManageAccount /></PrivateRoute>} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/services" element={<ServicesOverview />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/vendor-signup" element={<VendorSignup />} />
          
          {/* New Vendor Routes */}
          <Route path="/manage-listings" element={<VendorPrivateRoute><ManageListings /></VendorPrivateRoute>} />
          <Route path="/view-orders" element={<VendorPrivateRoute><ViewOrders /></VendorPrivateRoute>} />
          <Route path="/account-settings" element={<VendorPrivateRoute><AccountSettings /></VendorPrivateRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
