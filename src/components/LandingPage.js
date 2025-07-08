import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { FaCheckCircle, FaBolt, FaShieldAlt, FaChartLine, FaUsers, FaClock, FaAward, FaArrowRight } from "react-icons/fa";
import "../styles/LandingPage.css";

const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    try {
      // Replace with your actual newsletter endpoint
      const response = await fetch("https://formspree.io/f/xblgkvnk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        setSubmitted(true);
        setEmail("");
      }
    } catch (error) {
      console.error("Newsletter signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="newsletter-success">
        <FaCheckCircle className="success-icon" />
        <p>Thank you for subscribing! We'll keep you updated on our launch.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="newsletter-form">
      <div className="input-group">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          className="newsletter-input"
          required
        />
        <button 
          type="submit" 
          className="newsletter-button"
          disabled={loading}
        >
          {loading ? "Subscribing..." : "Get Early Access"}
        </button>
      </div>
    </form>
  );
};

const StatCounter = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.querySelector(`[data-count="${end}"]`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [end]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return <span data-count={end}>{count.toLocaleString()}{suffix}</span>;
};

const LandingPage = () => {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [pathname]);

  const features = [
    {
      icon: <FaBolt />,
      title: "Lightning Fast Quotes",
      description: "Get vendor quotes in minutes, not weeks. Our AI matches you with the perfect suppliers instantly.",
      metric: "85% faster"
    },
    {
      icon: <FaShieldAlt />,
      title: "Verified Vendors Only",
      description: "Every vendor in our network is thoroughly vetted for quality, reliability, and financial stability.",
      metric: "100% verified"
    },
    {
      icon: <FaChartLine />,
      title: "Smart Comparisons",
      description: "Compare quotes with AI-powered insights that highlight the best value beyond just price.",
      metric: "Save 30%"
    }
  ];

  const services = [
    {
      link: "/services/photocopiers",
      image: "photocopier.PNG",
      alt: "Photocopiers & Printers",
      title: "Photocopiers & Printers",
      description: "Find the perfect printing solutions for your business with competitive quotes from top suppliers.",
      features: ["Lease & Purchase Options", "Maintenance Included", "Latest Technology"]
    },
    {
      link: "/services/telecoms",
      image: "phone.PNG",
      alt: "Telecoms & Communications",
      title: "Telecoms & Communications",
      description: "Upgrade your business communications with cutting-edge telecom solutions and support.",
      features: ["VoIP Systems", "Mobile Plans", "Internet Connectivity"]
    },
    {
      link: "/services/cctv",
      image: "cctv.PNG",
      alt: "Security & CCTV",
      title: "Security & CCTV",
      description: "Protect your assets with professional security systems from trusted installation partners.",
      features: ["HD Cameras", "24/7 Monitoring", "Smart Analytics"]
    },
    {
      link: "/services/it",
      image: "wifi.PNG",
      alt: "IT Solutions",
      title: "IT Solutions & Support",
      description: "Transform your business with comprehensive IT services and ongoing technical support.",
      features: ["Cloud Solutions", "Cybersecurity", "IT Support"]
    }
  ];

  const testimonials = [
    {
      name: "Sarah Mitchell",
      company: "WalesWest Construction",
      role: "Procurement Manager",
      quote: "TendorAI revolutionised our procurement process. We've cut sourcing time by 75% and found suppliers we never knew existed.",
      logo: "waleswest.png",
      savings: "£45K saved annually"
    },
    {
      name: "James Thompson",
      company: "Monhinge Motors",
      role: "Operations Director",
      quote: "The quality of vendors and speed of response is incredible. Our team can focus on strategy instead of chasing quotes.",
      logo: "monmotors.png",
      savings: "60% time reduction"
    },
    {
      name: "Maria Santos",
      company: "Ascari Consulting",
      role: "CFO",
      quote: "The cost savings and vendor quality have exceeded our expectations. This platform pays for itself many times over.",
      logo: "Ascari.png",
      savings: "£120K saved"
    },
    {
      name: "David Chen",
      company: "TechFlow Solutions",
      role: "CEO",
      quote: "Finally, a procurement platform that understands modern business needs. The AI recommendations are spot-on.",
      logo: "GoCompare.png",
      savings: "90% accuracy rate"
    }
  ];

  const stats = [
    { number: 2500, suffix: "+", label: "Active Vendors" },
    { number: 50000, suffix: "+", label: "Quotes Delivered" },
    { number: 97, suffix: "%", label: "Client Satisfaction" },
    { number: 24, suffix: "h", label: "Average Response Time" }
  ];

  return (
    <HelmetProvider>
      <div className="landing-page">
        <Helmet>
          <title>TendorAI | AI-Powered Procurement Platform - Get Instant Vendor Quotes</title>
          <meta
            name="description"
            content="Transform your procurement with TendorAI's AI-powered platform. Get instant quotes from verified vendors, compare options intelligently, and save up to 30% on business purchases."
          />
          <meta name="keywords" content="procurement, vendor quotes, AI procurement, business suppliers, tender platform" />
          <link rel="canonical" href="https://tendorai.com" />
        </Helmet>

        {/* Hero Section - Fixed for white text and visible background */}
        <section className="hero-section hero-section-white" data-animation="fadeIn" data-visible={isVisible}>
          <div className="hero-background">
            {/* Reduced overlay opacity to show background image */}
            <div className="hero-overlay-light" />
            <img 
              src="/assets/images/landingpagepic.png"
              alt="Modern procurement technology"
              className="hero-bg-image-visible"
              loading="eager"
              onError={(e) => {
                console.error('❌ Image failed to load:', e.target.src);
                e.target.style.display = 'none';
                // Add fallback pattern background
                e.target.parentElement.style.background = `
                  linear-gradient(135deg, #1e40af 0%, #3b82f6 100%),
                  radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                  radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)
                `;
              }}
              onLoad={() => {
                console.log('✅ Background image loaded successfully!');
              }}
            />
          </div>
          
          <div className="hero-content hero-content-white">
            <div className="hero-badge hero-badge-white">
              🚀 Now in Beta - Free Early Access
            </div>
            
            <h1 className="hero-title hero-title-white">
              Revolutionise Your <span className="gradient-text-white">Procurement</span> with AI
            </h1>
            
            <p className="hero-subtitle hero-subtitle-white">
              Connect with verified vendors, receive tailored quotes in minutes, and make smarter purchasing decisions with AI-powered insights.
            </p>
            
            <div className="hero-stats hero-stats-white">
              <div className="stat-item stat-item-white">
                <span className="stat-number stat-number-white">2,500+</span>
                <span className="stat-label stat-label-white">Verified Vendors</span>
              </div>
              <div className="stat-item stat-item-white">
                <span className="stat-number stat-number-white">85%</span>
                <span className="stat-label stat-label-white">Faster Sourcing</span>
              </div>
              <div className="stat-item stat-item-white">
                <span className="stat-number stat-number-white">30%</span>
                <span className="stat-label stat-label-white">Average Savings</span>
              </div>
            </div>
            
            <div className="hero-actions">
              <Link to="/signup" className="btn btn-primary btn-lg">
                Start Free Trial <FaArrowRight />
              </Link>
              <Link to="/how-it-works" className="btn btn-secondary-white btn-lg">
                See How It Works
              </Link>
            </div>
            
            <p className="hero-note hero-note-white">
              ✓ No credit card required ✓ Setup in 2 minutes ✓ Cancel anytime
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section" data-animation="fadeInUp" data-visible={isVisible}>
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Why Choose TendorAI?</h2>
              <p className="section-subtitle">
                Experience the future of procurement with our AI-powered platform
              </p>
            </div>
            
            <div className="features-grid">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="feature-card"
                  data-animation="fadeInUp"
                  data-delay={index * 200}
                  data-visible={isVisible}
                >
                  <div className="feature-icon">{feature.icon}</div>
                  <div className="feature-metric">{feature.metric}</div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="services-section" data-animation="fadeInUp" data-visible={isVisible}>
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Our Services</h2>
              <p className="section-subtitle">
                Comprehensive procurement solutions across all business categories
              </p>
            </div>
            
            <div className="services-grid">
              {services.map((service, index) => (
                <Link
                  to={service.link}
                  key={index}
                  className="service-card"
                  data-animation="fadeInUp"
                  data-delay={index * 150}
                  data-visible={isVisible}
                >
                  <div className="service-image">
                    <img
                      src={`/assets/images/${service.image}`}
                      alt={service.alt}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = `/assets/images/default-placeholder.jpg`;
                      }}
                    />
                    <div className="service-overlay">
                      <span className="service-cta">Get Quotes <FaArrowRight /></span>
                    </div>
                  </div>
                  
                  <div className="service-content">
                    <h3 className="service-title">{service.title}</h3>
                    <p className="service-description">{service.description}</p>
                    
                    <ul className="service-features">
                      {service.features.map((feature, idx) => (
                        <li key={idx}>
                          <FaCheckCircle className="check-icon" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section" data-animation="fadeInUp" data-visible={isVisible}>
          <div className="container">
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className="stat-card">
                  <div className="stat-number">
                    <StatCounter end={stat.number} suffix={stat.suffix} />
                  </div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="testimonials-section" data-animation="fadeInUp" data-visible={isVisible}>
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Trusted by Industry Leaders</h2>
              <p className="section-subtitle">
                See what our clients say about their procurement transformation
              </p>
            </div>
            
            <div className="testimonials-grid">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index} 
                  className="testimonial-card"
                  data-animation="fadeInUp"
                  data-delay={index * 200}
                  data-visible={isVisible}
                >
                  <div className="testimonial-content">
                    <blockquote>"{testimonial.quote}"</blockquote>
                    <div className="testimonial-savings">{testimonial.savings}</div>
                  </div>
                  
                  <div className="testimonial-author">
                    <img
                      src={`/assets/images/${testimonial.logo}`}
                      alt={testimonial.company}
                      className="company-logo"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = `/assets/images/default-placeholder.jpg`;
                      }}
                    />
                    <div className="author-info">
                      <div className="author-name">{testimonial.name}</div>
                      <div className="author-role">{testimonial.role}</div>
                      <div className="author-company">{testimonial.company}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section" data-animation="fadeInUp" data-visible={isVisible}>
          <div className="container">
            <div className="cta-content">
              <h2 className="cta-title">Ready to Transform Your Procurement?</h2>
              <p className="cta-subtitle">
                Join thousands of businesses already saving time and money with TendorAI
              </p>
              
              <div className="cta-benefits">
                <div className="benefit-item">
                  <FaClock className="benefit-icon" />
                  <span>Setup in 2 minutes</span>
                </div>
                <div className="benefit-item">
                  <FaAward className="benefit-icon" />
                  <span>Free for 30 days</span>
                </div>
                <div className="benefit-item">
                  <FaUsers className="benefit-icon" />
                  <span>Dedicated support</span>
                </div>
              </div>
              
              <div className="cta-actions">
                <Link to="/signup" className="btn btn-primary btn-xl">
                  Start Free Trial Now <FaArrowRight />
                </Link>
                <Link to="/contact" className="btn btn-outline btn-xl">
                  Schedule Demo
                </Link>
              </div>
              
              <NewsletterSignup />
            </div>
          </div>
        </section>
      </div>
    </HelmetProvider>
  );
};

export default LandingPage;