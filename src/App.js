// src/App.js
import React, { lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Outlet,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import NavigationBar from "./components/NavigationBar";
import Footer from "./components/Footer";
import PrivateRoute from "./routes/PrivateRoute";
import AdminPrivateRoute from "./routes/AdminPrivateRoute";
import "./styles/App.css";

// ================= Lazy loading helper =================
const errorStyle = {
  color: "red",
  fontSize: "24px",
  backgroundColor: "lightyellow",
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const loadWithFallback = (importFn, fallbackComponent) =>
  lazy(() =>
    importFn()
      .then((module) => module)
      .catch(() => ({ default: fallbackComponent }))
  );

// ================= Public pages =================
const LandingPage = loadWithFallback(
  () => import("./components/LandingPage"),
  () => <div style={errorStyle}>Failed to load Landing Page</div>
);
const Login = loadWithFallback(
  () => import("./components/Login"),
  () => <div style={errorStyle}>Failed to load Login</div>
);
const Signup = loadWithFallback(
  () => import("./components/Signup"),
  () => <div style={errorStyle}>Failed to load Signup</div>
);
const VendorLogin = loadWithFallback(
  () => import("./components/VendorLogin"),
  () => <div style={errorStyle}>Failed to load VendorLogin</div>
);
const VendorSignup = loadWithFallback(
  () => import("./components/VendorSignup"),
  () => <div style={errorStyle}>Failed to load VendorSignup</div>
);
const AboutUs = loadWithFallback(
  () => import("./components/AboutUs"),
  () => <div style={errorStyle}>Failed to load AboutUs</div>
);
const ContactUs = loadWithFallback(
  () => import("./components/ContactUs"),
  () => <div style={errorStyle}>Failed to load ContactUs</div>
);
const WhyChooseUs = loadWithFallback(
  () => import("./components/WhyChooseUs"),
  () => <div style={errorStyle}>Failed to load WhyChooseUs</div>
);
const HowItWorks = loadWithFallback(
  () => import("./components/HowItWorks"),
  () => <div style={errorStyle}>Failed to load HowItWorks</div>
);
const PrivacyPolicy = loadWithFallback(
  () => import("./components/PrivacyPolicy"),
  () => <div style={errorStyle}>Failed to load PrivacyPolicy</div>
);
const MeetTheExperts = loadWithFallback(
  () => import("./components/MeetTheExperts"),
  () => <div style={errorStyle}>Failed to load MeetTheExperts</div>
);
const FAQ = loadWithFallback(
  () => import("./components/FAQ"),
  () => <div style={errorStyle}>Failed to load FAQ</div>
);

// ================= Services =================
const Photocopiers = loadWithFallback(
  () => import("./components/services/Photocopiers"),
  () => <div style={errorStyle}>Failed to load Photocopiers</div>
);
const Telecoms = loadWithFallback(
  () => import("./components/services/Telecoms"),
  () => <div style={errorStyle}>Failed to load Telecoms</div>
);
const CCTV = loadWithFallback(
  () => import("./components/services/CCTV"),
  () => <div style={errorStyle}>Failed to load CCTV</div>
);

// ================= User Dashboard =================
const UserDashboard = loadWithFallback(
  () => import("./components/UserDashboard"),
  () => <div style={errorStyle}>Failed to load UserDashboard</div>
);
const RequestQuote = loadWithFallback(
  () => import("./components/RequestQuote"),
  () => <div style={errorStyle}>Failed to load RequestQuote</div>
);
const CompareVendors = loadWithFallback(
  () => import("./components/CompareVendors"),
  () => <div style={errorStyle}>Failed to load CompareVendors</div>
);
const AccountSettings = loadWithFallback(
  () => import("./components/AccountSettings"),
  () => <div style={errorStyle}>Failed to load AccountSettings</div>
);
const QuotesRequested = loadWithFallback(
  () => import("./pages/QuotesRequested"),
  () => <div style={errorStyle}>Failed to load QuotesRequested</div>
);
const QuoteDetails = loadWithFallback(
  () => import("./components/QuoteDetails"),
  () => <div style={errorStyle}>Failed to load QuoteDetails</div>
);

// ================= Vendor Dashboard =================
const VendorDashboard = loadWithFallback(
  () => import("./components/VendorDashboard"),
  () => <div style={errorStyle}>Failed to load VendorDashboard</div>
);

// ================= Admin Pages =================
const AdminLogin = loadWithFallback(
  () => import("./components/AdminLogin"),
  () => <div style={errorStyle}>Failed to load AdminLogin</div>
);
const AdminDashboard = loadWithFallback(
  () => import("./components/AdminDashboard"),
  () => <div style={errorStyle}>Failed to load AdminDashboard</div>
);
const AdminUserManagement = loadWithFallback(
  () => import("./components/AdminUserManagement"),
  () => <div style={errorStyle}>Failed to load AdminUserManagement</div>
);

// ================= Fallback Not Found =================
const NotFound = loadWithFallback(
  () => import("./components/NotFound"),
  () => <div style={errorStyle}>Failed to load NotFound</div>
);

// ================= Error Boundary with Stack Trace =================
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
        <div style={errorStyle}>
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              textAlign: 'left',
              margin: '10px',
              padding: '10px',
              backgroundColor: '#eee',
              maxHeight: '60vh',
              overflowY: 'auto',
            }}
          >
            {this.state.error?.stack}
          </pre>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ================= Loading Spinner =================
const LoadingSpinner = () => (
  <div
    className="loading-spinner"
    role="alert"
    aria-live="polite"
    style={{
      backgroundColor: "lightgreen",
      minHeight: "100vh",
      color: "black",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    }}
  >
    <div className="spinner"></div>
    <p>Loading TENDORAI...</p>
  </div>
);

// ================= Navigation Tracker =================
const NavigationTracker = () => {
  const location = useLocation();
  useEffect(() => { console.log(`📍 Navigated to: ${location.pathname}`); }, [location]);
  return null;
};

// ================= Layout =================
const Layout = () => (
  <>
    <NavigationBar />
    <main><Outlet /></main>
    <Footer />
  </>
);

// ================= App Routes =================
function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route index element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/vendor-login" element={<VendorLogin />} />
        <Route path="/vendor-signup" element={<VendorSignup />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/services/photocopiers" element={<Photocopiers />} />
        <Route path="/services/telecoms" element={<Telecoms />} />
        <Route path="/services/cctv" element={<CCTV />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/why-choose-us" element={<WhyChooseUs />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/experts" element={<MeetTheExperts />} />

        {/* Dashboard & Auth */}
        <Route path="/vendor-dashboard" element={<VendorDashboard />} />
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/request-quote" element={<RequestQuote />} />
          <Route path="/compare-vendors" element={<CompareVendors />} />
          <Route path="/manage-account" element={<AccountSettings />} />
          <Route path="/quotes-requested" element={<QuotesRequested />} />
          <Route path="/quotes/:id" element={<QuoteDetails />} />
        </Route>
        <Route element={<AdminPrivateRoute />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-users" element={<AdminUserManagement />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

// ================= App =================
function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <NavigationTracker />
          <Suspense fallback={<LoadingSpinner />}>  
            <ErrorBoundary>
              <AppRoutes />  
            </ErrorBoundary>
          </Suspense>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
