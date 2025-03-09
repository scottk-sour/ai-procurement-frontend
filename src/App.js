/* eslint-disable import/first */
import React, { lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate
} from "react-router-dom";
import { AuthProvider } from "./utils/AuthContext";
import NavigationBar from "./components/NavigationBar";
import Footer from "./components/Footer";
import VendorDashboard from "./components/VendorDashboard"; // Direct import
import PrivateRoute from "./routes/PrivateRoute";  // Import PrivateRoute
import AdminPrivateRoute from "./routes/AdminPrivateRoute"; // Ensure this is defined similarly
import "./styles/App.css";

// Lazy-loaded components with error fallback
const loadWithFallback = (importFn, fallbackComponent) =>
  lazy(() => importFn().catch(() => ({ default: fallbackComponent })));

const LandingPage = loadWithFallback(
  () => import("./components/LandingPage"),
  () => <div>Failed to load Landing Page</div>
);
const Login = loadWithFallback(
  () => import("./components/Login"),
  () => <div>Failed to load Login</div>
);
const Signup = loadWithFallback(
  () => import("./components/Signup"),
  () => <div>Failed to load Signup</div>
);
const RequestQuote = loadWithFallback(
  () => import("./components/RequestQuote"),
  () => <div>Failed to load RequestQuote</div>
);
const CompareVendors = loadWithFallback(
  () => import("./components/CompareVendors"),
  () => <div>Failed to load CompareVendors</div>
);
const AboutUs = loadWithFallback(
  () => import("./components/AboutUs"),
  () => <div>Failed to load AboutUs</div>
);
const Photocopiers = loadWithFallback(
  () => import("./components/services/Photocopiers"),
  () => <div>Failed to load Photocopiers</div>
);
const Telecoms = loadWithFallback(
  () => import("./components/services/Telecoms"),
  () => <div>Failed to load Telecoms</div>
);
const CCTV = loadWithFallback(
  () => import("./components/services/CCTV"),
  () => <div>Failed to load CCTV</div>
);
const ITSolutions = loadWithFallback(
  () => import("./components/services/ITSolutions"),
  () => <div>Failed to load ITSolutions</div>
);
const VendorSignup = loadWithFallback(
  () => import("./components/VendorSignup"),
  () => <div>Failed to load VendorSignup</div>
);
const VendorLogin = loadWithFallback(
  () => import("./components/VendorLogin"),
  () => <div>Failed to load VendorLogin</div>
);
const ContactUs = loadWithFallback(
  () => import("./components/ContactUs"),
  () => <div>Failed to load ContactUs</div>
);
const ManageListings = loadWithFallback(
  () => import("./components/ManageListings"),
  () => <div>Failed to load ManageListings</div>
);
const ViewOrders = loadWithFallback(
  () => import("./components/ViewOrders"),
  () => <div>Failed to load ViewOrders</div>
);
const AccountSettings = loadWithFallback(
  () => import("./components/AccountSettings"),
  () => <div>Failed to load AccountSettings</div>
);
const VendorProfile = loadWithFallback(
  () => import("./components/VendorProfile"),
  () => <div>Failed to load VendorProfile</div>
);
const AdminLogin = loadWithFallback(
  () => import("./components/AdminLogin"),
  () => <div>Failed to load AdminLogin</div>
);
const AdminDashboard = loadWithFallback(
  () => import("./components/AdminDashboard"),
  () => <div>Failed to load AdminDashboard</div>
);
const AdminUserManagement = loadWithFallback(
  () => import("./components/AdminUserManagement"),
  () => <div>Failed to load AdminUserManagement</div>
);
const WhyChooseUs = loadWithFallback(
  () => import("./components/WhyChooseUs"),
  () => <div>Failed to load WhyChooseUs</div>
);
const HowItWorks = loadWithFallback(
  () => import("./components/HowItWorks"),
  () => <div>Failed to load HowItWorks</div>
);
const PrivacyPolicy = loadWithFallback(
  () => import("./components/PrivacyPolicy"),
  () => <div>Failed to load PrivacyPolicy</div>
);
const MeetTheExperts = loadWithFallback(
  () => import("./components/MeetTheExperts"),
  () => <div>Failed to load MeetTheExperts</div>
);
const QuoteDetails = loadWithFallback(
  () => import("./components/QuoteDetails"),
  () => <div>Failed to load QuoteDetails</div>
);
const QuotesRequested = loadWithFallback(
  () => import("./pages/QuotesRequested"),
  () => <div>Failed to load QuotesRequested</div>
);
const UploadedDocuments = loadWithFallback(
  () => import("./pages/UploadedDocuments"),
  () => <div>Failed to load UploadedDocuments</div>
);
const NotFound = loadWithFallback(
  () => import("./components/NotFound"),
  () => <div>Failed to load NotFound</div>
);

import UserDashboard from "./components/UserDashboard";

// Inline vendor protection for this route (as an example)
function VendorPrivateRouteInline({ children }) {
  const vendorToken = localStorage.getItem("vendorToken");
  if (!vendorToken) {
    return <Navigate to="/vendor-login" />;
  }
  return children;
}

// Fallback component for testing
const DashboardFallback = () => {
  console.log("✅ DashboardFallback rendering");
  return <div>Fallback Dashboard Content</div>;
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("❌ ErrorBoundary caught an error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message || "An unexpected error occurred."}</p>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      );
    }
    console.log("✅ ErrorBoundary rendering children for route:", this.props.routePath);
    return this.props.children;
  }
}

const LoadingSpinner = () => (
  <div className="loading-spinner" role="alert" aria-live="polite">
    <div className="spinner"></div>
    <p>Loading TENDORAI...</p>
  </div>
);

const NavigationTracker = () => {
  const location = useLocation();
  useEffect(() => {
    console.log(`📍 Navigated to: ${location.pathname} (Search: ${location.search})`);
  }, [location]);
  return null;
};

const Layout = ({ children }) => {
  console.log("✅ Layout rendering with children:", children ? "Yes" : "No");
  return (
    <>
      <NavigationBar />
      <main>{children || <p>No content available for this route.</p>}</main>
      <Footer />
    </>
  );
};

function AppRoutes() {
  console.log("✅ AppRoutes rendering");
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Layout><LandingPage /></Layout>} />
      <Route path="/login" element={<Layout><Login /></Layout>} />
      <Route path="/signup" element={<Layout><Signup /></Layout>} />
      <Route path="/vendor-login" element={<Layout><VendorLogin /></Layout>} />
      <Route path="/vendor-signup" element={<Layout><VendorSignup /></Layout>} />
      <Route path="/about-us" element={<Layout><AboutUs /></Layout>} />
      <Route path="/services/photocopiers" element={<Layout><Photocopiers /></Layout>} />
      <Route path="/services/telecoms" element={<Layout><Telecoms /></Layout>} />
      <Route path="/services/cctv" element={<Layout><CCTV /></Layout>} />
      <Route path="/services/it" element={<Layout><ITSolutions /></Layout>} />
      <Route path="/contact" element={<Layout><ContactUs /></Layout>} />
      <Route path="/admin-login" element={<Layout><AdminLogin /></Layout>} />
      <Route path="/why-choose-us" element={<Layout><WhyChooseUs /></Layout>} />
      <Route path="/how-it-works" element={<Layout><HowItWorks /></Layout>} />
      <Route path="/privacy-policy" element={<Layout><PrivacyPolicy /></Layout>} />
      <Route path="/experts" element={<Layout><MeetTheExperts /></Layout>} />

      {/* Private Routes for Users */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Layout><UserDashboard /></Layout>} />
        <Route path="/request-quote" element={<Layout><RequestQuote /></Layout>} />
        <Route path="/compare-vendors" element={<Layout><CompareVendors /></Layout>} />
        <Route path="/manage-account" element={<Layout><AccountSettings /></Layout>} />
        <Route path="/quotes-requested" element={<Layout><QuotesRequested /></Layout>} />
      </Route>

      {/* Vendor Protected Route (Inline) */}
      <Route
        path="/vendor-dashboard"
        element={
          <ErrorBoundary routePath="/vendor-dashboard">
            <VendorPrivateRouteInline>
              <Layout>
                {typeof VendorDashboard === "function" ? (
                  <VendorDashboard />
                ) : (
                  <DashboardFallback />
                )}
              </Layout>
            </VendorPrivateRouteInline>
          </ErrorBoundary>
        }
      />
      <Route path="/manage-listings" element={<Layout><ManageListings /></Layout>} />
      <Route path="/view-orders" element={<Layout><ViewOrders /></Layout>} />
      <Route path="/account-settings" element={<Layout><AccountSettings /></Layout>} />
      <Route path="/vendor-profile" element={<Layout><VendorProfile /></Layout>} />
      <Route path="/uploaded-documents" element={<Layout><UploadedDocuments /></Layout>} />
      <Route path="/quotes" element={<Layout><QuoteDetails /></Layout>} />

      {/* Admin Protected Routes */}
      <Route element={<AdminPrivateRoute />}>
        <Route path="/admin-dashboard" element={<Layout><AdminDashboard /></Layout>} />
        <Route path="/admin-users" element={<Layout><AdminUserManagement /></Layout>} />
      </Route>

      {/* Catch-all Route */}
      <Route path="*" element={<Layout><NotFound /></Layout>} />
    </Routes>
  );
}

function App() {
  console.log("✅ App rendering");
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <NavigationTracker />
          <Suspense fallback={<LoadingSpinner />}>
            <AppRoutes />
          </Suspense>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
