import React, { lazy, Suspense, useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useLocation,
} from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./context/AuthContext";
import NavigationBar from "./components/NavigationBar";
import Footer from "./components/Footer";
import PrivateRoute from "./routes/PrivateRoute";
import AdminPrivateRoute from "./routes/AdminPrivateRoute";
import "./styles/App.css";

// Error style for fallback components
const errorStyle = {
  color: "red",
  fontSize: "24px",
  backgroundColor: "lightyellow",
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

// Lazy loading helper
const loadWithFallback = (importFn, fallbackComponent) =>
  lazy(() =>
    importFn()
      .then((module) => module)
      .catch(() => ({ default: fallbackComponent }))
  );

// Public pages
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

// Services
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

// User Dashboard
const UserDashboard = loadWithFallback(
  () => import("./components/UserDashboard"),
  () => <div style={errorStyle}>Failed to load UserDashboard</div>
);

// FIXED: Simplified RequestQuote to use EnhancedQuoteRequest directly
const RequestQuote = loadWithFallback(
  () => import("./components/EnhancedQuoteRequest"),
  () => (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Request Quote</h1>
      <p>Quote request form is currently unavailable.</p>
      <p>Please contact us directly or try again later.</p>
      <button onClick={() => window.location.href = '/contact'}>
        Contact Us Instead
      </button>
    </div>
  )
);

// FIXED: QuotesResults component for /quotes route
const QuotesResults = loadWithFallback(
  () => import("./components/QuotesResults"),
  () => (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Quotes Results</h1>
      <p>Quotes results page is currently unavailable.</p>
      <button onClick={() => window.location.href = '/dashboard'}>
        Return to Dashboard
      </button>
    </div>
  )
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

// REMOVED: QuoteDetails component - using QuotesResults for individual quote viewing
// This eliminates the conflicting navigation paths

// Vendor Dashboard
const VendorDashboard = loadWithFallback(
  () => import("./components/VendorDashboard"),
  () => <div style={errorStyle}>Failed to load VendorDashboard</div>
);

// Admin Pages
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

// Fallback Not Found
const NotFound = loadWithFallback(
  () => import("./components/NotFound"),
  () => <div style={errorStyle}>Failed to load NotFound</div>
);

// Error Boundary with Stack Trace
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
              whiteSpace: "pre-wrap",
              textAlign: "left",
              margin: "10px",
              padding: "10px",
              backgroundColor: "#eee",
              maxHeight: "60vh",
              overflowY: "auto",
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

// Loading Spinner
const LoadingSpinner = () => (
  <div
    style={{
      backgroundColor: "lightgreen",
      minHeight: "100vh",
      color: "black",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        width: "50px",
        height: "50px",
        border: "5px solid #000",
        borderTopColor: "transparent",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
    ></div>
    <p>Loading TENDORAI...</p>
  </div>
);

// Navigation Tracker
const NavigationTracker = () => {
  const location = useLocation();
  useEffect(() => {
    console.log(`📍 Navigated to: ${location.pathname}`);
  }, [location]);
  return null;
};

// Layout
const Layout = () => (
  <AuthProvider>
    <Suspense fallback={<LoadingSpinner />}>
      <NavigationBar />
      <main>
        <NavigationTracker />
        <Outlet />
      </main>
      <Footer />
    </Suspense>
  </AuthProvider>
);

// FIXED: App Routes - Removed conflicting routes
const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        { index: true, element: <LandingPage /> },
        { path: "/login", element: <Login /> },
        { path: "/signup", element: <Signup /> },
        { path: "/vendor-login", element: <VendorLogin /> },
        { path: "/vendor-signup", element: <VendorSignup /> },
        { path: "/about-us", element: <AboutUs /> },
        { path: "/services/photocopiers", element: <Photocopiers /> },
        { path: "/services/telecoms", element: <Telecoms /> },
        { path: "/services/cctv", element: <CCTV /> },
        { path: "/contact", element: <ContactUs /> },
        { path: "/admin-login", element: <AdminLogin /> },
        { path: "/why-choose-us", element: <WhyChooseUs /> },
        { path: "/how-it-works", element: <HowItWorks /> },
        { path: "/privacy-policy", element: <PrivacyPolicy /> },
        { path: "/faq", element: <FAQ /> },
        { path: "/experts", element: <MeetTheExperts /> },
        { path: "/vendor-dashboard", element: <VendorDashboard /> },
        {
          element: <PrivateRoute />,
          children: [
            { path: "/dashboard", element: <UserDashboard /> },
            { path: "/request-quote", element: <RequestQuote /> },
            { path: "/compare-vendors", element: <CompareVendors /> },
            { path: "/manage-account", element: <AccountSettings /> },
            { path: "/quotes-requested", element: <QuotesRequested /> },
            // FIXED: Single quotes route for all quote viewing
            { path: "/quotes", element: <QuotesResults /> },
            { path: "/quotes/:id", element: <QuotesResults /> },
            // REMOVED: Conflicting /quote-details route
          ],
        },
        {
          element: <AdminPrivateRoute />,
          children: [
            { path: "/admin-dashboard", element: <AdminDashboard /> },
            { path: "/admin-users", element: <AdminUserManagement /> },
          ],
        },
        { path: "*", element: <NotFound /> },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

// App
function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
