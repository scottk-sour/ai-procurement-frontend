import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FaCheckCircle, FaBolt, FaShieldAlt, FaChartLine, FaUsers, FaClock, FaAward, FaArrowRight } from "react-icons/fa";
import HeroSearch from "./HeroSearch";
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
          {loading ? "Subscribing..." : "Subscribe"}
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
      title: "Instant Office Equipment Quotes",
      description: "Get 3 instant quotes for photocopiers, printers, and office equipment in minutes, not days. Our AI matches you with verified UK suppliers instantly.",
      metric: "3 quotes in minutes"
    },
    {
      icon: <FaShieldAlt />,
      title: "Verified UK Suppliers Only",
      description: "Every supplier in our network is thoroughly vetted for quality, reliability, and financial stability. Compare prices from trusted UK vendors.",
      metric: "100% verified"
    },
    {
      icon: <FaChartLine />,
      title: "AI-Powered Price Comparison",
      description: "Compare office equipment prices with AI-powered insights that highlight the best value beyond just cost. Smart procurement made simple.",
      metric: "Save up to 30%"
    }
  ];

  const services = [
    {
      link: "/services/photocopiers",
      image: "photocopier.PNG",
      alt: "Photocopiers & Multifunction Printers",
      title: "Photocopier Quotes UK",
      description: "Get instant quotes for photocopiers and multifunction printers from verified UK suppliers. Compare lease and purchase options.",
      features: ["Instant Quote Comparison", "Lease & Purchase Options", "Maintenance Included"]
    },
    {
      link: "/services/telecoms",
      image: "phone.PNG",
      alt: "Business Telecoms & Phone Systems",
      title: "Telecoms & Phone Systems",
      description: "Compare business phone systems, VoIP solutions, and telecoms packages from verified UK suppliers. Get instant quotes for your communication needs.",
      features: ["VoIP & Cloud Phone Systems", "Unified Communications", "Business Broadband"]
    },
    {
      link: "/services/cctv",
      image: "cctv.PNG",
      alt: "CCTV & Security Systems",
      title: "CCTV & Security Systems",
      description: "Get instant quotes for CCTV cameras, access control, and complete security solutions from trusted UK security suppliers.",
      features: ["HD & 4K CCTV Systems", "Access Control", "24/7 Monitoring Options"]
    },
    {
      link: "/services/it",
      image: "wifi.PNG",
      alt: "IT Equipment Quotes",
      title: "IT Equipment Quotes",
      description: "Compare quotes for computers, servers, networking equipment, and IT solutions from verified UK technology suppliers.",
      features: ["Latest Technology", "Business Grade Equipment", "Technical Support"]
    }
  ];

  // Note: Real testimonials to be added as customers join
  const testimonials = [
    {
      name: "Procurement Manager",
      company: "UK Construction Firm",
      role: "Example Outcome",
      quote: "Getting competitive photocopier quotes used to take weeks. Now we compare prices from multiple suppliers in minutes and make informed decisions faster.",
      logo: "placeholder-company.png",
      savings: "Faster procurement"
    },
    {
      name: "Operations Director",
      company: "Automotive Business",
      role: "Example Outcome",
      quote: "The supplier matching helped us discover local telecoms providers we didn't know about. More options means better prices.",
      logo: "placeholder-company.png",
      savings: "More supplier options"
    },
    {
      name: "Finance Director",
      company: "Consulting Firm",
      role: "Example Outcome",
      quote: "Comparing quotes side-by-side makes budgeting much easier. We can see exactly what we're getting and at what price.",
      logo: "placeholder-company.png",
      savings: "Easier budgeting"
    },
    {
      name: "IT Manager",
      company: "Professional Services",
      role: "Example Outcome",
      quote: "Having verified UK suppliers in one place saves us the hassle of searching and vetting vendors ourselves.",
      logo: "placeholder-company.png",
      savings: "Pre-vetted suppliers"
    }
  ];

  const stats = [
    { number: 500, suffix: "+", label: "UK Suppliers" },
    { number: 4, suffix: "", label: "Service Categories" },
    { number: 100, suffix: "%", label: "UK Based" },
    { number: 5, suffix: " min", label: "Average Quote Time" }
  ];

  const faqItems = [
    {
      question: "How quickly can I get office equipment quotes?",
      answer: "With TendorAI's AI-powered platform, you can get 3 instant quotes for office equipment in minutes. Simply tell us what you need or upload your requirements, and our AI matches you with verified UK suppliers instantly."
    },
    {
      question: "What types of equipment can I get quotes for?",
      answer: "TendorAI connects you with UK suppliers for photocopiers, multifunction printers, telecoms and phone systems, CCTV and security systems, and IT equipment. More categories coming soon."
    },
    {
      question: "Is the AI procurement platform free to use?",
      answer: "Yes, TendorAI's AI-powered quote comparison service is completely free for UK businesses. We earn commission from suppliers when you choose to purchase, but there are no fees for comparing quotes."
    },
    {
      question: "How does AI-powered procurement work?",
      answer: "Our AI analyzes your office equipment requirements and instantly matches you with the most suitable verified suppliers from our network. You receive 3 tailored quotes to compare prices, features, and terms."
    },
    {
      question: "Are the suppliers verified and trusted?",
      answer: "Yes, all suppliers in TendorAI's network are thoroughly verified and rated. We only work with trusted UK suppliers who meet our quality and service standards."
    },
    {
      question: "Can I get quotes for photocopiers and printers?",
      answer: "Absolutely! We specialize in photocopier quotes UK and office printer quotes. Compare lease and purchase options from leading brands like Canon, HP, Xerox, and Ricoh."
    }
  ];

  return (
      <div className="landing-page">
        {/* SEO Meta Tags with Open Graph, Twitter Cards, and Schema.org */}
        <Helmet>
          <title>TendorAI - Get 3 Instant Office Equipment Quotes | AI-Powered Procurement UK</title>
          <meta
            name="description"
            content="Get instant quotes for photocopiers, telecoms, CCTV, and IT equipment from verified UK suppliers. Free AI-powered comparison service for UK businesses."
          />
          <meta
            name="keywords"
            content="instant office equipment quotes, AI procurement platform, photocopier quotes UK, compare office equipment prices, office equipment supplier comparison, automated procurement quotes, smart procurement software UK, business equipment quotes"
          />
          <link rel="canonical" href="https://www.tendorai.com/" />

          {/* Open Graph / Facebook */}
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://www.tendorai.com/" />
          <meta property="og:title" content="TendorAI - Get 3 Instant Office Equipment Quotes | AI-Powered Procurement UK" />
          <meta property="og:description" content="Get 3 instant office equipment quotes in minutes. Compare photocopier, printer & office equipment prices from verified UK suppliers. Free AI-powered comparison service." />
          <meta property="og:image" content="https://www.tendorai.com/assets/images/og-image.png" />
          <meta property="og:site_name" content="TendorAI" />
          <meta property="og:locale" content="en_GB" />

          {/* Twitter Card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:url" content="https://www.tendorai.com/" />
          <meta name="twitter:title" content="TendorAI - Get 3 Instant Office Equipment Quotes" />
          <meta name="twitter:description" content="Compare office equipment prices from verified UK suppliers in minutes. Free AI-powered procurement platform." />
          <meta name="twitter:image" content="https://www.tendorai.com/assets/images/twitter-card.png" />
          <meta name="twitter:site" content="@tendorai" />

          {/* Additional SEO */}
          <meta name="robots" content="index, follow" />
          <meta name="googlebot" content="index, follow" />
          <meta name="author" content="TendorAI" />
          <meta name="geo.region" content="GB" />
          <meta name="geo.placename" content="United Kingdom" />

          {/* Schema.org JSON-LD */}
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "TendorAI",
              "url": "https://www.tendorai.com",
              "logo": "https://www.tendorai.com/assets/images/logo.png",
              "description": "AI-powered procurement platform for office equipment quotes in the UK",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "GB",
                "addressLocality": "London"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+44-20-7946-0958",
                "contactType": "customer service",
                "email": "hello@tendorai.com"
              },
              "sameAs": [
                "https://www.linkedin.com/company/tendorai",
                "https://twitter.com/tendorai",
                "https://www.facebook.com/tendorai"
              ]
            })}
          </script>
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "TendorAI",
              "url": "https://www.tendorai.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.tendorai.com/suppliers/search?postcode={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })}
          </script>
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": faqItems.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.answer
                }
              }))
            })}
          </script>
        </Helmet>

        {/* Hero Section */}
        <section className="hero-section hero-section-white" data-animation="fadeIn" data-visible={isVisible}>
          <div className="hero-background">
            <div className="hero-overlay-light" />
            <img 
              src="/assets/images/landingpagepic.png"
              alt="AI-powered office equipment procurement platform"
              className="hero-bg-image-visible"
              loading="eager"
              onError={(e) => {
                console.error('❌ Image failed to load:', e.target.src);
                e.target.style.display = 'none';
                e.target.parentElement.style.background = `
                  linear-gradient(135deg, #1e40af 0%, #3b82f6 100%),
                  radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                  radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)
                `;
              }}
            />
          </div>
          
          <div className="hero-content hero-content-white">
            <div className="hero-badge hero-badge-white">
              🚀 Get 3 Instant Quotes - Free Service
            </div>
            
            <h1 className="hero-title hero-title-white">
              Get 3 Instant Office Equipment Quotes with <span className="gradient-text-white">AI-Powered Procurement</span>
            </h1>
            
            <p className="hero-subtitle hero-subtitle-white">
              Compare photocopiers, telecoms, CCTV and IT equipment prices from verified UK suppliers. Free AI-powered comparison service for businesses.
            </p>
            
            <div className="hero-stats hero-stats-white">
              <div className="stat-item stat-item-white">
                <span className="stat-number stat-number-white">500+</span>
                <span className="stat-label stat-label-white">UK Suppliers</span>
              </div>
              <div className="stat-item stat-item-white">
                <span className="stat-number stat-number-white">3</span>
                <span className="stat-label stat-label-white">Instant Quotes</span>
              </div>
              <div className="stat-item stat-item-white">
                <span className="stat-number stat-number-white">5 min</span>
                <span className="stat-label stat-label-white">Average Response</span>
              </div>
            </div>
            
            {/* Bark-style Search Bar */}
            <div className="hero-search-wrapper">
              <HeroSearch variant="hero" />
            </div>

            <div className="hero-actions hero-actions-secondary">
              <Link to="/how-it-works" className="btn btn-secondary-white btn-lg">
                How It Works
              </Link>
              <Link to="/quote-request" className="btn btn-outline-white btn-lg">
                Or Request a Custom Quote <FaArrowRight />
              </Link>
            </div>

            <p className="hero-note hero-note-white">
              ✓ Free comparison service ✓ Find local suppliers ✓ Verified UK vendors only
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section" data-animation="fadeInUp" data-visible={isVisible}>
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Why Choose Instant Office Equipment Quotes?</h2>
              <p className="section-subtitle">
                Experience the fastest way to compare office equipment prices with AI-powered procurement
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
              <h2 className="section-title">Compare Office Equipment Prices Across All Categories</h2>
              <p className="section-subtitle">
                Get instant quotes for photocopiers, telecoms, CCTV, and IT equipment from verified UK suppliers
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
                      <span className="service-cta">Get Instant Quotes <FaArrowRight /></span>
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
              <h2 className="section-title">Trusted by UK Businesses for Office Equipment Procurement</h2>
              <p className="section-subtitle">
                See how our AI-powered platform has transformed procurement for companies across the UK
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

        {/* FAQ Section */}
        <section className="faq-section" data-animation="fadeInUp" data-visible={isVisible}>
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Frequently Asked Questions</h2>
              <p className="section-subtitle">
                Everything you need to know about getting instant office equipment quotes
              </p>
            </div>
            
            <div className="faq-grid">
              {faqItems.map((faq, index) => (
                <div key={index} className="faq-item">
                  <h3>{faq.question}</h3>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </div>
            
            <div className="faq-cta">
              <Link to="/faq" className="btn btn-secondary">
                View All FAQs
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section" data-animation="fadeInUp" data-visible={isVisible}>
          <div className="container">
            <div className="cta-content">
              <h2 className="cta-title">Find the Right Office Equipment Supplier</h2>
              <p className="cta-subtitle">
                Compare verified UK suppliers for photocopiers, telecoms, CCTV and IT services. Get competitive quotes tailored to your needs.
              </p>

              <div className="cta-benefits">
                <div className="benefit-item">
                  <FaCheckCircle className="benefit-icon" />
                  <span>Free to use</span>
                </div>
                <div className="benefit-item">
                  <FaCheckCircle className="benefit-icon" />
                  <span>Verified UK suppliers</span>
                </div>
                <div className="benefit-item">
                  <FaCheckCircle className="benefit-icon" />
                  <span>AI-powered matching</span>
                </div>
              </div>

              <div className="cta-actions">
                <Link to="/suppliers" className="btn btn-cta-primary btn-xl">
                  Find Suppliers <FaArrowRight />
                </Link>
                <Link to="/how-it-works" className="btn btn-cta-secondary btn-xl">
                  Learn More
                </Link>
              </div>

              <NewsletterSignup />
            </div>
          </div>
        </section>
      </div>
  );
};

export default LandingPage;
