import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Signup from "./components/Signup";
import UserDashboard from "./components/UserDashboard";
import VendorDashboard from "./components/VendorDashboard";
import RequestQuote from "./components/RequestQuote";
import CompareVendors from "./components/CompareVendors";
import ManageAccount from "./components/ManageAccount";
import AboutUs from "./components/AboutUs";
import Photocopiers from "./components/services/Photocopiers";
import Telecoms from "./components/services/Telecoms";
import CCTV from "./components/services/CCTV";
import ITSolutions from "./components/services/ITSolutions";
import VendorSignup from "./components/VendorSignup";
import VendorLogin from "./components/VendorLogin";
import ContactUs from "./components/ContactUs";
import ManageListings from "./components/ManageListings";
import ViewOrders from "./components/ViewOrders";
import AccountSettings from "./components/AccountSettings";
import VendorProfile from "./components/VendorProfile";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import AdminUserManagement from "./components/AdminUserManagement";
import WhyChooseUs from "./components/WhyChooseUs";
import HowItWorks from "./components/HowItWorks";
import PrivacyPolicy from "./components/PrivacyPolicy";
import MeetTheExperts from "./components/MeetTheExperts";
import QuoteDetails from "./components/QuoteDetails";
import QuotesRequested from "./pages/QuotesRequested";
import UploadedDocuments from "./pages/UploadedDocuments";
import NotFound from "./components/NotFound";
import Footer from "./components/Footer";

// Importing Private Routes from Separate Files
import PrivateRoute from "./routes/PrivateRoute";
import VendorPrivateRoute from "./routes/VendorPrivateRoute";
import AdminPrivateRoute from "./routes/AdminPrivateRoute";

function AppRoutes() {
  const location = useLocation(); // 🔹 Ensures React updates routes on navigation

  return (
    <Routes key={location.pathname}> {/* 🔹 Forces re-render on path changes */}
      {/* 🔹 Public Routes */}
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

      {/* 🔹 User Protected Routes */}
      <Route path="/dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
      <Route path="/request-quote" element={<PrivateRoute><RequestQuote /></PrivateRoute>} />
      <Route path="/compare-vendors" element={<PrivateRoute><CompareVendors /></PrivateRoute>} />
      <Route path="/manage-account" element={<PrivateRoute><ManageAccount /></PrivateRoute>} />
      <Route path="/quotes-requested" element={<PrivateRoute><QuotesRequested /></PrivateRoute>} />

      {/* 🔹 Vendor Protected Routes */}
      <Route path="/vendor-dashboard" element={<VendorPrivateRoute><VendorDashboard /></VendorPrivateRoute>} />
      <Route path="/manage-listings" element={<VendorPrivateRoute><ManageListings /></VendorPrivateRoute>} />
      <Route path="/view-orders" element={<VendorPrivateRoute><ViewOrders /></VendorPrivateRoute>} />
      <Route path="/account-settings" element={<VendorPrivateRoute><AccountSettings /></VendorPrivateRoute>} />
      <Route path="/vendor-profile" element={<VendorPrivateRoute><VendorProfile /></VendorPrivateRoute>} />
      <Route path="/quotes" element={<VendorPrivateRoute><QuoteDetails /></VendorPrivateRoute>} />
      <Route path="/uploaded-documents" element={<VendorPrivateRoute><UploadedDocuments /></VendorPrivateRoute>} />

      {/* 🔹 Admin Protected Routes */}
      <Route path="/admin-dashboard" element={<AdminPrivateRoute><AdminDashboard /></AdminPrivateRoute>} />
      <Route path="/admin-users" element={<AdminPrivateRoute><AdminUserManagement /></AdminPrivateRoute>} />

      {/* 🔹 404 Not Found Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <AppRoutes />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
