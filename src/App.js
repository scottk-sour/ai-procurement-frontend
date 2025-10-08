import React, { lazy, Suspense, useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useLocation,
} from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
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
  flexDirection: "column",
  padding: "2rem",
  textAlign: "center",
};

// Lazy loading helper with better error handling
const loadWithFallback = (importFn, fallbackComponent) =>
  lazy(() =>
    importFn()
      .then((module) => {
        console.log(`✅ Successfully loaded component`);
        return module;
      })
      .catch((error) => {
        console.error(`❌ Failed to load component:`, error);
        return { default: fallbackComponent };
      })
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

// FIXED: Enhanced Quote Request component
const RequestQuote = loadWithFallback(
  () => import("./components/EnhancedQuoteRequest"),
  () => (
    <div style={errorStyle}>
      <h1>Request Quote</h1>
      <p>Quote request form is currently unavailable.</p>
      <p>Please contact us directly or try again later.</p>
      <button 
        onClick={() => window.location.href = '/contact'}
        style={{
          padding: '12px 24px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '1rem'
        }}
      >
        Contact Us Instead
      </button>
    </div>
  )
);

// FIXED: QuotesResults component for viewing quotes
const QuotesResults = loadWithFallback(
  () => import("./components/QuotesResults"),
  () => (
    <div style={errorStyle}>
      <h1>Quotes Results</h1>
      <p>Quotes results page is currently unavailable.</p>
      <button 
        onClick={() => window.location.href = '/dashboard'}
        style={{
          padding: '12px 24px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '1rem'
        }}
      >
        Return to Dashboard
      </button>
    </div>
  )
);

// CRITICAL: CompareVendors component for the main workflow
const CompareVendors = loadWithFallback(
  () => import("./components/CompareVendors"),
  () => (
    <div style={errorStyle}>
      <h1>Compare Vendors</h1>
      <p>Compare vendors page is currently unavailable.</p>
      <p>This page shows vendor comparisons after quote generation.</p>
      <button 
        onClick={() => window.location.href = '/dashboard'}
        style={{
          padding: '12px 24px',
          backgroundColor: '#17a2b8',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '1rem'
        }}
      >
        Return to Dashboard
      </button>
    </div>
  )
);

const AccountSettings = loadWithFallback(
  () => import("./components/AccountSettings"),
  () => <div style={errorStyle}>Failed to load Account Settings</div>
);

const QuotesRequested = loadWithFallback(
  () => import("./pages/QuotesRequested"),
  () => <div style={errorStyle}>Failed to load Quotes Requested</div>
);

// Vendor Dashboard
const VendorDashboard = loadWithFallback(
  () => import("./components/VendorDashboard"),
  () => <div style={errorStyle}>Failed to load Vendor Dashboard</div>
);

// Admin Pages
const AdminLogin = loadWithFallback(
  () => import("./components/AdminLogin"),
  () => <div style={errorStyle}>Failed to load Admin Login</div>
);

const AdminDashboard = loadWithFallback(
  () => import("./components/AdminDashboard"),
  () => <div style={errorStyle}>Failed to load Admin Dashboard</div>
);

const AdminUserManagement = loadWithFallback(
  () => import("./components/AdminUserManagement"),
  () => <div style={errorStyle}>Failed to load Admin User Management</div>
);

// Fallback Not Found
const NotFound = loadWithFallback(
  () => import("./components/NotFound"),
  () => (
    <div style={errorStyle}>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <button 
        onClick={() => window.location.href = '/'}
        style={{
          padding: '12px 24px',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '1rem'
        }}
      >
        Go Home
      </button>
    </div>
  )
);

// Enhanced Error Boundary with better error handling
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("❌ ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={errorStyle}>
          <h1>🚨 Application Error</h1>
          <p><strong>Error:</strong> {this.state.error?.message}</p>
          {this.state.errorInfo && (
            <details style={{ marginTop: '1rem', textAlign: 'left' }}>
              <summary>Error Details</summary>
              <pre style={{
                whiteSpace: "pre-wrap",
                margin: "10px 0",
                padding: "15px",
                backgroundColor: "#f8f9fa",
                border: "1px solid #dee2e6",
                borderRadius: "4px",
                maxHeight: "300px",
                overflowY: "auto",
                fontSize: "12px"
              }}>
                {this.state.error?.stack}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
          <div style={{ marginTop: '1rem' }}>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              Reload Page
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              style={{
                padding: '12px 24px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Enhanced Loading Spinner
const LoadingSpinner = () => (
  <div style={{
    backgroundColor: "rgba(40, 167, 69, 0.1)",
    minHeight: "100vh",
    color: "#28a745",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  }}>
    <div style={{
      width: "60px",
      height: "60px",
      border: "4px solid rgba(40, 167, 69, 0.2)",
      borderTop: "4px solid #28a745",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    }}></div>
    <p style={{ 
      marginTop: "20px", 
      fontSize: "18px", 
      fontWeight: "500" 
    }}>
      Loading TENDORAI...
    </p>
    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
    </style>
  </div>
);

// Navigation Tracker for debugging
const NavigationTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
    console.log(`📍 Navigation: ${location.pathname}${location.search}${location.hash}`);
    console.log(`🔍 Location state:`, location.state);
  }, [location]);
  
  return null;
};

// FIXED: Layout component with proper error boundaries
const Layout = () => (
  <ErrorBoundary>
    <ToastProvider>
      <Suspense fallback={<LoadingSpinner />}>
        <NavigationBar />
        <main style={{ minHeight: 'calc(100vh - 120px)' }}>
          <NavigationTracker />
          <Outlet />
        </main>
        <Footer />
      </Suspense>
    </ToastProvider>
  </ErrorBoundary>
);

// FIXED: Router configuration with proper route structure
const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      errorElement: (
        <div style={errorStyle}>
          <h1>🚨 Router Error</h1>
          <p>An error occurred with the router configuration.</p>
          <button onClick={() => window.location.href = '/'}>
            Go Home
          </button>
        </div>
      ),
      children: [
        // Public routes
        { index: true, element: <LandingPage /> },
        { path: "/login", element: <Login /> },
        { path: "/signup", element: <Signup /> },
        { path: "/vendor-login", element: <VendorLogin /> },
        { path: "/vendor-signup", element: <VendorSignup /> },
        { path: "/about-us", element: <AboutUs /> },
        { path: "/contact", element: <ContactUs /> },
        { path: "/why-choose-us", element: <WhyChooseUs /> },
        { path: "/how-it-works", element: <HowItWorks /> },
        { path: "/privacy-policy", element: <PrivacyPolicy /> },
        { path: "/faq", element: <FAQ /> },
        { path: "/experts", element: <MeetTheExperts /> },
        { path: "/admin-login", element: <AdminLogin /> },

        // Services routes
        { path: "/services/photocopiers", element: <Photocopiers /> },
        { path: "/services/telecoms", element: <Telecoms /> },
        { path: "/services/cctv", element: <CCTV /> },

        // Vendor public route
        { path: "/vendor-dashboard", element: <VendorDashboard /> },

        // FIXED: Protected user routes
        {
          element: <PrivateRoute />,
          children: [
            { path: "/dashboard", element: <UserDashboard /> },
            { path: "/quote-request", element: <RequestQuote /> }, // ✅ FIXED: Changed from /request-quote
            { path: "/compare-vendors", element: <CompareVendors /> },
            { path: "/manage-account", element: <AccountSettings /> },
            { path: "/quotes-requested", element: <QuotesRequested /> },
            { path: "/quotes", element: <QuotesResults /> },
            { path: "/quotes/:id", element: <QuotesResults /> },
          ],
        },

        // FIXED: Protected admin routes
        {
          element: <AdminPrivateRoute />,
          children: [
            { path: "/admin-dashboard", element: <AdminDashboard /> },
            { path: "/admin-users", element: <AdminUserManagement /> },
          ],
        },

        // Catch-all route
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

// FIXED: Main App component with proper initialization
function App() {
  // Service Worker registration
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('✅ Service Worker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.error('❌ Service Worker registration failed:', error);
          });
      });
    }
  }, []);

  // Global error handler
  useEffect(() => {
    const handleUnhandledRejection = (event) => {
      console.error('🚨 Unhandled promise rejection:', event.reason);
    };

    const handleError = (event) => {
      console.error('🚨 Global error:', event.error);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
