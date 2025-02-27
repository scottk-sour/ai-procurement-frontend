/* eslint-disable import/first */
import React, { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import NavigationBar from "./components/NavigationBar";
import Footer from "./components/Footer";
import "./styles/App.css"; // Ensure this file exists in src/styles/

// Lazy-load components with preloading hints (except UserDashboard for debugging)
const LandingPage = lazy(() => {
  import("./components/LandingPage").then((module) => {
    console.log("Preloaded LandingPage");
    return module;
  });
  return import("./components/LandingPage");
});
const Login = lazy(() => import("./components/Login"));
const Signup = lazy(() => import("./components/Signup"));
const VendorDashboard = lazy(() => import("./components/VendorDashboard"));
const RequestQuote = lazy(() => import("./components/RequestQuote"));
const CompareVendors = lazy(() => import("./components/CompareVendors"));
const AboutUs = lazy(() => import("./components/AboutUs"));
const Photocopiers = lazy(() => import("./components/services/Photocopiers"));
const Telecoms = lazy(() => import("./components/services/Telecoms"));
const CCTV = lazy(() => import("./components/services/CCTV"));
const ITSolutions = lazy(() => import("./components/services/ITSolutions"));
const VendorSignup = lazy(() => import("./components/VendorSignup"));
const VendorLogin = lazy(() => import("./components/VendorLogin"));
const ContactUs = lazy(() => import("./components/ContactUs"));
const ManageListings = lazy(() => import("./components/ManageListings"));
const ViewOrders = lazy(() => import("./components/ViewOrders"));
const AccountSettings = lazy(() => import("./components/AccountSettings"));
const VendorProfile = lazy(() => import("./components/VendorProfile"));
const AdminLogin = lazy(() => import("./components/AdminLogin"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const AdminUserManagement = lazy(() => import("./components/AdminUserManagement"));
const WhyChooseUs = lazy(() => import("./components/WhyChooseUs"));
const HowItWorks = lazy(() => import("./components/HowItWorks"));
const PrivacyPolicy = lazy(() => import("./components/PrivacyPolicy"));
const MeetTheExperts = lazy(() => import("./components/MeetTheExperts"));
const QuoteDetails = lazy(() => import("./components/QuoteDetails"));
const QuotesRequested = lazy(() => import("./pages/QuotesRequested")); // Correct path
const UploadedDocuments = lazy(() => import("./pages/UploadedDocuments")); // Correct path
const NotFound = lazy(() => import("./components/NotFound"));

// Import UserDashboard directly (not lazy-loaded) for debugging
import UserDashboard from "./components/UserDashboard"; // Direct import for debugging

import PrivateRoute from "./routes/PrivateRoute";
import VendorPrivateRoute from "./routes/VendorPrivateRoute";
import AdminPrivateRoute from "./routes/AdminPrivateRoute";

// Loading Component for Suspense
const LoadingSpinner = () => (
  <div className="loading-spinner" role="alert" aria-live="polite">
    <div className="spinner"></div>
    <p>Loading TENDORAI...</p>
  </div>
);

// Navigation Tracker (debug component)
const NavigationTracker = () => {
  const location = useLocation();
  useEffect(() => {
    console.log(`📍 Navigated to: ${location.pathname} (Search: ${location.search})`);
  }, [location]);
  return null;
};

function AppRoutes() {
  console.log("✅ AppRoutes rendering");
  return (
    <Routes>
      <Route path="/" element={<><NavigationBar /><LandingPage /><Footer /></>} />
      <Route path="/login" element={<><NavigationBar /><Login /><Footer /></>} />
      <Route path="/signup" element={<><NavigationBar /><Signup /><Footer /></>} />
      <Route path="/vendor-login" element={<><NavigationBar /><VendorLogin /><Footer /></>} />
      <Route path="/vendor-signup" element={<><NavigationBar /><VendorSignup /><Footer /></>} />
      <Route path="/about-us" element={<><NavigationBar /><AboutUs /><Footer /></>} />
      <Route path="/services/photocopiers" element={<><NavigationBar /><Photocopiers /><Footer /></>} />
      <Route path="/services/telecoms" element={<><NavigationBar /><Telecoms /><Footer /></>} />
      <Route path="/services/cctv" element={<><NavigationBar /><CCTV /><Footer /></>} />
      <Route path="/services/it" element={<><NavigationBar /><ITSolutions /><Footer /></>} />
      <Route path="/contact" element={<><NavigationBar /><ContactUs /><Footer /></>} />
      <Route path="/admin-login" element={<><NavigationBar /><AdminLogin /><Footer /></>} />
      <Route path="/why-choose-us" element={<><NavigationBar /><WhyChooseUs /><Footer /></>} />
      <Route path="/how-it-works" element={<><NavigationBar /><HowItWorks /><Footer /></>} />
      <Route path="/privacy-policy" element={<><NavigationBar /><PrivacyPolicy /><Footer /></>} />
      <Route path="/experts" element={<><NavigationBar /><MeetTheExperts /><Footer /></>} />
      <Route element={<PrivateRoute />}>
        <Route
          path="/dashboard"
          element={
            <div>
              <UserDashboard /> {/* Direct render for debugging */}
            </div>
          } // Explicitly exclude NavBar and Footer for debugging
        />
        <Route path="/request-quote" element={<><NavigationBar /><RequestQuote /><Footer /></>} />
        <Route path="/compare-vendors" element={<><NavigationBar /><CompareVendors /><Footer /></>} />
        <Route path="/manage-account" element={<><NavigationBar /><AccountSettings /><Footer /></>} />
        <Route path="/quotes-requested" element={<><NavigationBar /><QuotesRequested /><Footer /></>} />
      </Route>
      <Route element={<VendorPrivateRoute />}>
        <Route path="/vendor-dashboard" element={<><NavigationBar /><VendorDashboard /><Footer /></>} />
        <Route path="/manage-listings" element={<><NavigationBar /><ManageListings /><Footer /></>} />
        <Route path="/view-orders" element={<><NavigationBar /><ViewOrders /><Footer /></>} />
        <Route path="/account-settings" element={<><NavigationBar /><AccountSettings /><Footer /></>} />
        <Route path="/vendor-profile" element={<><NavigationBar /><VendorProfile /><Footer /></>} />
        <Route path="/uploaded-documents" element={<><NavigationBar /><UploadedDocuments /><Footer /></>} />
        <Route path="/quotes" element={<><NavigationBar /><QuoteDetails /><Footer /></>} />
      </Route>
      <Route element={<AdminPrivateRoute />}>
        <Route path="/admin-dashboard" element={<><NavigationBar /><AdminDashboard /><Footer /></>} />
        <Route path="/admin-users" element={<><NavigationBar /><AdminUserManagement /><Footer /></>} />
      </Route>
      <Route path="*" element={<><NavigationBar /><NotFound /><Footer /></>} />
    </Routes>
  );
}

function App() {
  console.log("✅ App rendering");
  return (
    <Router>
      <div className="App">
        <NavigationTracker /> {/* Debug navigation */}
        <Suspense fallback={<LoadingSpinner />}>
          <AppRoutes />
        </Suspense>
      </div>
    </Router>
  );
}

export default App;