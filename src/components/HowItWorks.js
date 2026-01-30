import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  FaRocket, 
  FaSearch, 
  FaUserCheck, 
  FaClipboardCheck, 
  FaHandshake, 
  FaTachometerAlt,
  FaPoundSign,
  FaClock,
  FaShieldAlt,
  FaChartLine,
  FaMobile,
  FaArrowRight,
  FaCheckCircle,
  FaBolt,
  FaUsers
} from "react-icons/fa";
import "../styles/HowItWorks.css";

const HowItWorks = () => {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [stepVisibility, setStepVisibility] = useState({});
  const stepRefs = useRef([]);
  const observerRef = useRef(null);

  // Enhanced steps data with icons and British English
  const steps = useMemo(() => [
    {
      number: "1",
      icon: <FaRocket />,
      title: "Sign Up & Define Your Requirements",
      subtitle: "Get started in under 2 minutes",
      text: "Create your complimentary business account and specify your procurement requirements with our intelligent form system.",
      items: [
        "Create your complimentary business account instantly",
        "Define product or service requirements using AI guidance",
        "Set supplier preferences or let our AI recommend optimal matches",
        "Upload existing specifications or invoices for faster setup"
      ],
      highlight: "No credit card required"
    },
    {
      number: "2",
      icon: <FaSearch />,
      title: "Request Quotations Instantly",
      subtitle: "AI-powered quote generation",
      text: "Submit your request through our streamlined interface and receive AI-generated quotations in seconds—no lengthy forms required.",
      items: [
        "Enter simple details (e.g., '5 office printers for London office')",
        "Upload supporting documents if required",
        "Click 'Request Quotation' to activate our AI matching system",
        "Set budget parameters and delivery timescales"
      ],
      highlight: "Average response time: 90 seconds"
    },
    {
      number: "3",
      icon: <FaUserCheck />,
      title: "AI Matches Top Suppliers",
      subtitle: "Intelligent vendor selection",
      text: "Our advanced AI algorithm identifies your three best suppliers from thousands in our network, ensuring optimal matches every time.",
      items: [
        "Competitive pricing analysis and exclusive discounts",
        "Service level agreements (SLAs) and delivery guarantees",
        "Comprehensive warranty and maintenance options",
        "Verified supplier ratings and customer reviews"
      ],
      highlight: "97% customer satisfaction rate"
    },
    {
      number: "4",
      icon: <FaClipboardCheck />,
      title: "Compare & Select",
      subtitle: "Side-by-side comparison tools",
      text: "Review tailored quotations with our advanced comparison tools for confident, data-driven decision-making.",
      items: [
        "Complete cost breakdowns with hidden fee detection",
        "Delivery timescales and service availability",
        "Detailed supplier profiles with verified credentials",
        "Accept quotations or negotiate terms directly through the platform"
      ],
      highlight: "Save 30% on average"
    },
    {
      number: "5",
      icon: <FaHandshake />,
      title: "Finalise Securely",
      subtitle: "Digital contract management",
      text: "Complete your procurement digitally with secure, paperless processes backed by legal-grade documentation.",
      items: [
        "AI-generated contracts with electronic signatures",
        "Completely online, paperless workflow with audit trails",
        "Real-time order tracking and milestone notifications",
        "Automated payment processing and invoice management"
      ],
      highlight: "Bank-grade security"
    },
    {
      number: "6",
      icon: <FaTachometerAlt />,
      title: "Manage via Your Dashboard",
      subtitle: "Centralised procurement control",
      text: "Oversee all procurement activities from a single, intuitive dashboard with AI-powered insights and analytics.",
      items: [
        "Track orders, expenditure, and supplier performance",
        "Access AI-driven cost-saving insights and recommendations",
        "Reorder with a single click using saved preferences",
        "Generate detailed reports for management and compliance"
      ],
      highlight: "24/7 support included"
    },
  ], []);

  // Enhanced benefits data with icons and metrics
  const benefits = useMemo(() => [
    { 
      icon: <FaPoundSign />, 
      title: "Completely Free", 
      text: "No fees, subscriptions, or hidden costs—intelligent procurement accessible to all businesses.",
      metric: "£0",
      detail: "Forever free for buyers"
    },
    { 
      icon: <FaClock />, 
      title: "Lightning Fast", 
      text: "Receive qualified quotations in minutes, not weeks, with our AI-powered matching system.",
      metric: "90 seconds",
      detail: "Average response time"
    },
    { 
      icon: <FaShieldAlt />, 
      title: "Verified Suppliers", 
      text: "Every supplier undergoes rigorous vetting for quality, financial stability, and service excellence.",
      metric: "100%",
      detail: "Supplier verification rate"
    },
    { 
      icon: <FaChartLine />, 
      title: "Cost Optimisation", 
      text: "AI-driven savings analysis ensures you get the best value on every transaction and purchase.",
      metric: "30%",
      detail: "Average cost savings"
    },
    { 
      icon: <FaMobile />, 
      title: "Fully Digital", 
      text: "Secure, paperless processes optimised for maximum efficiency, reliability, and environmental responsibility.",
      metric: "24/7",
      detail: "Platform availability"
    },
  ], []);

  // Features showcase data
  const features = useMemo(() => [
    {
      icon: <FaBolt />,
      title: "AI-Powered Matching",
      description: "Advanced algorithms ensure perfect supplier-buyer matches"
    },
    {
      icon: <FaUsers />,
      title: "2,500+ Verified Suppliers",
      description: "Extensive network of pre-qualified, trusted vendors"
    },
    {
      icon: <FaCheckCircle />,
      title: "Quality Guaranteed",
      description: "Every transaction backed by our quality assurance programme"
    }
  ], []);

  // Optimised scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Enhanced intersection observer
  const handleIntersection = useCallback((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const index = entry.target.dataset.index;
        if (index !== undefined) {
          setStepVisibility((prev) => ({ ...prev, [index]: true }));
        }
      }
    });
  }, []);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
      rootMargin: "50px 0px -50px 0px",
    });
    
    stepRefs.current.forEach((ref) => {
      if (ref) observerRef.current.observe(ref);
    });
    
    return () => observerRef.current?.disconnect();
  }, [handleIntersection]);

  // Enhanced error handling
  const handleImageError = useCallback((e) => {
    console.warn("Failed to load background image");
    e.target.style.display = 'none';
    e.target.parentElement.style.background = "linear-gradient(135deg, var(--primary-blue) 0%, var(--secondary-blue) 100%)";
  }, []);

  // Set ref callback
  const setStepRef = useCallback((index) => (el) => {
    if (stepRefs.current) stepRefs.current[index] = el;
  }, []);

  return (
      <div className="how-it-works-page">
        <Helmet>
          <title>How It Works | TendorAI - AI-Powered Procurement Platform</title>
          <meta 
            name="description" 
            content="Discover how TendorAI revolutionises procurement with AI. Get instant quotes from verified suppliers in 6 simple steps. Free for businesses." 
          />
          <meta name="keywords" content="procurement process, AI quotes, supplier matching, business procurement, tender platform" />
          <link rel="canonical" href="https://tendorai.com/how-it-works" />
        </Helmet>

        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-background">
            <div className="hero-overlay" />
            <img 
              src="/assets/images/landingpagepic.png"
              alt="AI-powered procurement process"
              className="hero-bg-image"
              onError={handleImageError}
            />
          </div>
          
          <div className={`hero-content ${isVisible ? "visible" : ""}`}>
            <div className="hero-badge">
              🚀 Trusted by 2,500+ Businesses
            </div>
            
            <h1 className="hero-title">
              How <span className="gradient-text">TendorAI</span> Works
            </h1>
            
            <p className="hero-subtitle">
              Transform your procurement with AI-powered supplier matching. Get instant quotes from verified vendors in 6 simple steps—completely free for businesses.
            </p>
            
            <div className="hero-features">
              {features.map((feature, index) => (
                <div key={index} className="hero-feature">
                  <div className="hero-feature-icon">{feature.icon}</div>
                  <div className="hero-feature-content">
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="hero-actions">
              <Link to="/signup" className="btn btn-primary btn-lg">
                Start Free Today <FaArrowRight />
              </Link>
              <Link to="/contact" className="btn btn-secondary btn-lg">
                Schedule Demo
              </Link>
            </div>
            
            <p className="hero-note">
              ✓ No credit card required ✓ Setup in 2 minutes ✓ Free forever
            </p>
          </div>
        </section>

        {/* Steps Section */}
        <section className="steps-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">6 Simple Steps to Procurement Success</h2>
              <p className="section-subtitle">
                Our AI-powered platform streamlines the entire procurement process, from initial request to final delivery
              </p>
            </div>
            
            <div className="steps-timeline">
              {steps.map((step, index) => (
                <article
                  key={`step-${step.number}`}
                  ref={setStepRef(index)}
                  className={`step-card ${stepVisibility[index] ? "visible" : ""}`}
                  data-index={index}
                >
                  <div className="step-number">
                    <span className="step-icon">{step.icon}</span>
                    <span className="step-num">{step.number}</span>
                  </div>
                  
                  <div className="step-content">
                    <div className="step-header">
                      <h3 className="step-title">{step.title}</h3>
                      <p className="step-subtitle">{step.subtitle}</p>
                      <div className="step-highlight">{step.highlight}</div>
                    </div>
                    
                    <p className="step-text">{step.text}</p>
                    
                    <ul className="step-list">
                      {step.items.map((item, itemIndex) => (
                        <li key={`step-${index}-item-${itemIndex}`}>
                          <FaCheckCircle className="check-icon" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="benefits-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Why Choose TendorAI?</h2>
              <p className="section-subtitle">
                Experience the future of procurement with measurable benefits and guaranteed results
              </p>
            </div>
            
            <div className="benefits-grid">
              {benefits.map((benefit, index) => (
                <article
                  key={`benefit-${index}`}
                  className={`benefit-card ${stepVisibility[index + steps.length] ? "visible" : ""}`}
                  data-index={index + steps.length}
                  ref={setStepRef(index + steps.length)}
                >
                  <div className="benefit-icon">{benefit.icon}</div>
                  <div className="benefit-metric">{benefit.metric}</div>
                  <h3 className="benefit-title">{benefit.title}</h3>
                  <p className="benefit-text">{benefit.text}</p>
                  <div className="benefit-detail">{benefit.detail}</div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="container">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">2,500+</div>
                <div className="stat-label">Verified Suppliers</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">50,000+</div>
                <div className="stat-label">Quotes Delivered</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">97%</div>
                <div className="stat-label">Customer Satisfaction</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">30%</div>
                <div className="stat-label">Average Savings</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2 className="cta-title">Ready to Revolutionise Your Procurement?</h2>
              <p className="cta-subtitle">
                Join thousands of businesses already saving time and money with TendorAI's AI-powered platform
              </p>
              
              <div className="cta-benefits">
                <div className="cta-benefit">
                  <FaClock className="cta-benefit-icon" />
                  <span>Setup in 2 minutes</span>
                </div>
                <div className="cta-benefit">
                  <FaShieldAlt className="cta-benefit-icon" />
                  <span>Bank-grade security</span>
                </div>
                <div className="cta-benefit">
                  <FaUsers className="cta-benefit-icon" />
                  <span>24/7 support included</span>
                </div>
              </div>
              
              <div className="cta-actions">
                <Link to="/signup" className="btn btn-primary btn-xl">
                  Start Free Trial Now <FaArrowRight />
                </Link>
                <Link to="/contact" className="btn btn-outline btn-xl">
                  Schedule Demo Call
                </Link>
              </div>
              
              <p className="cta-note">
                No contracts, no commitments. Cancel anytime.
              </p>
            </div>
          </div>
        </section>
      </div>
  );
};

export default React.memo(HowItWorks);