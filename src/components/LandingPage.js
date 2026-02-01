import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FaCheckCircle, FaBolt, FaShieldAlt, FaChartLine, FaMapMarkerAlt, FaArrowRight } from "react-icons/fa";
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
      // Silent fail for newsletter
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="newsletter-success">
        <FaCheckCircle className="success-icon" />
        <p>Thank you for subscribing! We'll keep you updated.</p>
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

  // Coverage areas for geographic targeting
  const coverageAreas = {
    wales: ["Cardiff", "Newport", "Swansea", "Bridgend", "Caerphilly", "Pontypridd"],
    southwest: ["Bristol", "Bath", "Gloucester", "Cheltenham", "Exeter", "Plymouth", "Taunton", "Swindon"]
  };

  const features = [
    {
      icon: <FaBolt />,
      title: "Compare Local Suppliers",
      description: "Browse 70+ office equipment suppliers across Wales and South West England. Compare photocopier, telecoms, and IT providers serving Cardiff, Bristol, Swansea, and surrounding areas.",
      metric: "70+ suppliers"
    },
    {
      icon: <FaMapMarkerAlt />,
      title: "Regional Coverage",
      description: "Find suppliers who actually serve your area. Our directory covers South Wales, Bristol, Bath, Devon, Cornwall, Somerset, and Gloucestershire with local businesses you can trust.",
      metric: "Local to you"
    },
    {
      icon: <FaChartLine />,
      title: "Free Quote Comparison",
      description: "Request quotes from multiple suppliers at once. Compare prices, services, and terms side-by-side to find the right fit for your business. No fees, no obligations.",
      metric: "Free to use"
    }
  ];

  const services = [
    {
      link: "/services/photocopiers",
      image: "photocopier.PNG",
      alt: "Photocopiers and Multifunction Printers in Wales and South West England",
      title: "Photocopier Suppliers",
      description: "Compare photocopier quotes from local suppliers in Cardiff, Bristol, Swansea and across South Wales. Lease and purchase options for multifunction printers from established dealers.",
      features: ["Lease & Purchase Options", "Local Service Engineers", "Brands: Canon, Ricoh, Xerox, HP"]
    },
    {
      link: "/services/telecoms",
      image: "phone.PNG",
      alt: "Business Phone Systems and Telecoms in Wales and Bristol",
      title: "Telecoms & Phone Systems",
      description: "Find business telecoms providers in South Wales and the South West. Compare VoIP phone systems, broadband packages, and unified communications solutions from regional suppliers.",
      features: ["VoIP & Cloud Systems", "Business Broadband", "Local Installation & Support"]
    },
    {
      link: "/services/cctv",
      image: "cctv.PNG",
      alt: "CCTV and Security Systems across Wales and South West England",
      title: "CCTV & Security",
      description: "Request quotes for CCTV installation from security companies in Cardiff, Bristol, and the surrounding regions. HD camera systems, access control, and monitoring services.",
      features: ["HD & 4K Systems", "Access Control", "Local Installation Teams"]
    },
    {
      link: "/services/it",
      image: "wifi.PNG",
      alt: "IT Equipment and Support in South Wales and Bristol",
      title: "IT Equipment & Support",
      description: "Compare IT equipment suppliers and managed service providers in Wales and the South West. Computers, servers, networking, and ongoing technical support from local companies.",
      features: ["Hardware Supply", "Network Setup", "Managed IT Services"]
    }
  ];

  const stats = [
    { number: 70, suffix: "+", label: "Local Suppliers" },
    { number: 4, suffix: "", label: "Equipment Categories" },
    { number: 100, suffix: "%", label: "UK Based" },
    { number: 0, suffix: "", label: "Cost to Compare", displayText: "Free" }
  ];

  const faqItems = [
    {
      question: "What areas does TendorAI cover?",
      answer: "TendorAI lists office equipment suppliers across Wales and South West England. Our directory includes suppliers in Cardiff, Newport, Swansea, Bridgend, Bristol, Bath, Gloucester, Cheltenham, Exeter, Plymouth, and surrounding areas. Each supplier profile shows their specific coverage area so you can find providers who serve your location."
    },
    {
      question: "What types of office equipment can I find suppliers for?",
      answer: "Our directory covers four main categories: photocopiers and multifunction printers, telecoms and business phone systems, CCTV and security systems, and IT equipment. You can browse suppliers by category or search by your postcode to see all local providers."
    },
    {
      question: "Is TendorAI free to use?",
      answer: "Yes, TendorAI is completely free for businesses looking for office equipment. You can browse our supplier directory, view company profiles, and request quotes without any charge. We earn commission from suppliers when a successful connection is made, but this never affects the quotes you receive."
    },
    {
      question: "How do I get quotes from suppliers?",
      answer: "Enter your postcode to see suppliers in your area, then browse their profiles to learn about their services. You can request quotes directly through supplier profile pages. We recommend contacting 2-3 suppliers to compare quotes and find the best option for your needs."
    },
    {
      question: "Are the suppliers on TendorAI vetted?",
      answer: "We compile and categorise established office equipment suppliers across Wales and the South West. Supplier profiles include their services, coverage areas, and contact information. We recommend checking reviews and requesting references when comparing quotes for significant purchases."
    },
    {
      question: "Can I find photocopier suppliers in Cardiff or Bristol?",
      answer: "Yes, we have multiple photocopier and printer suppliers listed in both Cardiff and Bristol, as well as across South Wales and the South West region. Use the postcode search to find suppliers who cover your specific area, or browse the Photocopiers category to see all available providers."
    }
  ];

  return (
    <div className="landing-page">
      {/* SEO Meta Tags - Geographic targeting for Wales & South West England */}
      <Helmet>
        <title>Compare Office Equipment Quotes | Local Suppliers in Wales & South West England | TendorAI</title>
        <meta
          name="description"
          content="Compare photocopier, telecoms, CCTV and IT equipment quotes from 70+ local suppliers across Wales, Bristol and South West England. Free comparison service for UK businesses."
        />
        <meta
          name="keywords"
          content="photocopier suppliers Cardiff, office equipment Bristol, telecoms suppliers Wales, CCTV installation South Wales, IT equipment Swansea, business phone systems Bristol, copier lease Cardiff, office printers Newport, photocopier quotes South West England"
        />
        <link rel="canonical" href="https://www.tendorai.com/" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.tendorai.com/" />
        <meta property="og:title" content="Compare Office Equipment Quotes from Local Suppliers | TendorAI" />
        <meta property="og:description" content="Find photocopier, telecoms, CCTV and IT equipment suppliers in Wales, Bristol and South West England. Compare quotes from 70+ local businesses. Free to use." />
        <meta property="og:image" content="https://www.tendorai.com/assets/images/og-image.png" />
        <meta property="og:site_name" content="TendorAI" />
        <meta property="og:locale" content="en_GB" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Office Equipment Suppliers in Wales & South West England" />
        <meta name="twitter:description" content="Compare quotes from 70+ local suppliers for photocopiers, telecoms, CCTV and IT equipment. Free comparison service." />

        {/* Geographic SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="geo.region" content="GB-WLS" />
        <meta name="geo.placename" content="Cardiff, Wales" />
        <meta name="geo.position" content="51.4816;-3.1791" />

        {/* Schema.org - LocalBusiness for geographic relevance */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "TendorAI",
            "description": "TendorAI is a free comparison platform that helps UK businesses find office equipment suppliers in Wales and South West England. Browse 70+ local suppliers for photocopiers, telecoms, CCTV, and IT equipment across Cardiff, Bristol, Swansea, and surrounding areas.",
            "url": "https://www.tendorai.com",
            "logo": "https://www.tendorai.com/assets/images/logo.png",
            "image": "https://www.tendorai.com/assets/images/og-image.png",
            "priceRange": "Free",
            "address": {
              "@type": "PostalAddress",
              "addressRegion": "Wales",
              "addressCountry": "GB"
            },
            "areaServed": [
              {
                "@type": "Place",
                "name": "South Wales",
                "containsPlace": ["Cardiff", "Newport", "Swansea", "Bridgend", "Caerphilly"]
              },
              {
                "@type": "Place",
                "name": "South West England",
                "containsPlace": ["Bristol", "Bath", "Gloucester", "Cheltenham", "Exeter", "Plymouth"]
              }
            ],
            "serviceType": ["Office Equipment Comparison", "Supplier Directory", "Quote Requests"],
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Office Equipment Categories",
              "itemListElement": [
                {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Photocopiers & Printers"}},
                {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Telecoms & Phone Systems"}},
                {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "CCTV & Security Systems"}},
                {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "IT Equipment & Support"}}
              ]
            }
          })}
        </script>

        {/* Schema.org - WebSite with SearchAction */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "TendorAI",
            "url": "https://www.tendorai.com",
            "description": "Office equipment supplier directory for Wales and South West England",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://www.tendorai.com/suppliers/search?postcode={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>

        {/* Schema.org - FAQPage for rich snippets */}
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

        {/* Schema.org - Service for each category */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Office Equipment Supplier Comparison",
            "provider": {
              "@type": "Organization",
              "name": "TendorAI"
            },
            "serviceType": "Business Directory",
            "areaServed": ["Wales", "South West England", "Bristol", "Cardiff", "Swansea"],
            "description": "Free comparison service connecting UK businesses with local office equipment suppliers. Categories include photocopiers, telecoms, CCTV, and IT equipment.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "GBP",
              "description": "Free to use for businesses"
            }
          })}
        </script>
      </Helmet>

      {/* Hero Section - Factual opening for AI crawlers */}
      <article>
        <header className="hero-section hero-section-white" data-animation="fadeIn" data-visible={isVisible}>
          <div className="hero-background">
            <div className="hero-overlay-light" />
            <img
              src="/assets/images/landingpagepic.png"
              alt="Office equipment supplier comparison for Wales and South West England"
              className="hero-bg-image-visible"
              loading="eager"
              onError={(e) => {
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
              Free Comparison Service
            </div>

            <h1 className="hero-title hero-title-white">
              Compare Office Equipment Quotes from <span className="gradient-text-white">Local Suppliers in Wales & South West England</span>
            </h1>

            {/* Factual description for AI crawlers - first 200 words matter */}
            <p className="hero-subtitle hero-subtitle-white">
              TendorAI is a free supplier directory for UK businesses. Browse 70+ office equipment suppliers across South Wales, Bristol, and the South West.
              Find local providers for photocopiers, business telecoms, CCTV systems, and IT equipment in Cardiff, Swansea, Newport, Bath, Gloucester, and surrounding areas.
            </p>

            <div className="hero-stats hero-stats-white">
              <div className="stat-item stat-item-white">
                <span className="stat-number stat-number-white">70+</span>
                <span className="stat-label stat-label-white">Local Suppliers</span>
              </div>
              <div className="stat-item stat-item-white">
                <span className="stat-number stat-number-white">4</span>
                <span className="stat-label stat-label-white">Categories</span>
              </div>
              <div className="stat-item stat-item-white">
                <span className="stat-number stat-number-white">Free</span>
                <span className="stat-label stat-label-white">To Use</span>
              </div>
            </div>

            {/* Postcode Search */}
            <div className="hero-search-wrapper">
              <HeroSearch variant="hero" />
            </div>

            <div className="hero-actions hero-actions-secondary">
              <Link to="/suppliers" className="btn btn-secondary-white btn-lg">
                Browse All Suppliers
              </Link>
              <Link to="/quote-request" className="btn btn-outline-white btn-lg">
                Request Quotes <FaArrowRight />
              </Link>
            </div>

            <p className="hero-note hero-note-white">
              Covering: Cardiff, Bristol, Swansea, Newport, Bath, Gloucester, Cheltenham, Exeter & more
            </p>
          </div>
        </header>

        {/* Features Section */}
        <section className="features-section" data-animation="fadeInUp" data-visible={isVisible} aria-labelledby="features-heading">
          <div className="container">
            <div className="section-header">
              <h2 id="features-heading" className="section-title">How TendorAI Helps Your Business</h2>
              <p className="section-subtitle">
                A straightforward way to find and compare office equipment suppliers in your area
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

        {/* Services/Categories Section */}
        <section className="services-section" data-animation="fadeInUp" data-visible={isVisible} aria-labelledby="services-heading">
          <div className="container">
            <div className="section-header">
              <h2 id="services-heading" className="section-title">Office Equipment Categories</h2>
              <p className="section-subtitle">
                Find suppliers for photocopiers, telecoms, CCTV, and IT equipment across Wales and South West England
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
                      <span className="service-cta">View Suppliers <FaArrowRight /></span>
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
        <section className="stats-section" data-animation="fadeInUp" data-visible={isVisible} aria-label="Platform statistics">
          <div className="container">
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className="stat-card">
                  <div className="stat-number">
                    {stat.displayText ? (
                      <span>{stat.displayText}</span>
                    ) : (
                      <StatCounter end={stat.number} suffix={stat.suffix} />
                    )}
                  </div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Coverage Areas Section - replacing testimonials */}
        <section className="testimonials-section" data-animation="fadeInUp" data-visible={isVisible} aria-labelledby="coverage-heading">
          <div className="container">
            <div className="section-header">
              <h2 id="coverage-heading" className="section-title">Suppliers Across Wales & South West England</h2>
              <p className="section-subtitle">
                Our directory includes office equipment suppliers serving these areas
              </p>
            </div>

            <div className="testimonials-grid">
              {/* Wales Coverage */}
              <div className="testimonial-card" data-animation="fadeInUp" data-visible={isVisible}>
                <div className="testimonial-content">
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#1e3a5f' }}>South Wales</h3>
                  <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
                    {coverageAreas.wales.join(" • ")}
                  </p>
                </div>
                <div className="testimonial-author">
                  <FaMapMarkerAlt style={{ fontSize: '2rem', color: '#3b82f6' }} />
                  <div className="author-info">
                    <div className="author-name">Photocopiers, Telecoms, CCTV, IT</div>
                    <div className="author-company">Multiple suppliers per area</div>
                  </div>
                </div>
              </div>

              {/* South West Coverage */}
              <div className="testimonial-card" data-animation="fadeInUp" data-delay={200} data-visible={isVisible}>
                <div className="testimonial-content">
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#1e3a5f' }}>South West England</h3>
                  <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
                    {coverageAreas.southwest.join(" • ")}
                  </p>
                </div>
                <div className="testimonial-author">
                  <FaMapMarkerAlt style={{ fontSize: '2rem', color: '#3b82f6' }} />
                  <div className="author-info">
                    <div className="author-name">All equipment categories</div>
                    <div className="author-company">Regional and national suppliers</div>
                  </div>
                </div>
              </div>

              {/* Supplier CTA */}
              <div className="testimonial-card" data-animation="fadeInUp" data-delay={400} data-visible={isVisible}>
                <div className="testimonial-content">
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#1e3a5f' }}>Are You a Supplier?</h3>
                  <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
                    Join 70+ office equipment suppliers already listed on TendorAI. Get your business in front of companies looking for quotes in your area.
                  </p>
                </div>
                <div className="testimonial-author">
                  <Link to="/vendor-signup" className="btn btn-secondary" style={{ marginTop: '0.5rem' }}>
                    List Your Business <FaArrowRight />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq-section" data-animation="fadeInUp" data-visible={isVisible} aria-labelledby="faq-heading">
          <div className="container">
            <div className="section-header">
              <h2 id="faq-heading" className="section-title">Frequently Asked Questions</h2>
              <p className="section-subtitle">
                Common questions about finding office equipment suppliers in Wales and South West England
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
        <section className="cta-section" data-animation="fadeInUp" data-visible={isVisible} aria-labelledby="cta-heading">
          <div className="container">
            <div className="cta-content">
              <h2 id="cta-heading" className="cta-title">Find Office Equipment Suppliers in Your Area</h2>
              <p className="cta-subtitle">
                Browse local suppliers for photocopiers, telecoms, CCTV and IT equipment across Wales, Bristol, and South West England. Free to use, no obligations.
              </p>

              <div className="cta-benefits">
                <div className="benefit-item">
                  <FaCheckCircle className="benefit-icon" />
                  <span>Free to use</span>
                </div>
                <div className="benefit-item">
                  <FaCheckCircle className="benefit-icon" />
                  <span>70+ local suppliers</span>
                </div>
                <div className="benefit-item">
                  <FaCheckCircle className="benefit-icon" />
                  <span>4 equipment categories</span>
                </div>
              </div>

              <div className="cta-actions">
                <Link to="/suppliers" className="btn btn-cta-primary btn-xl">
                  Browse Suppliers <FaArrowRight />
                </Link>
                <Link to="/how-it-works" className="btn btn-cta-secondary btn-xl">
                  How It Works
                </Link>
              </div>

              <NewsletterSignup />
            </div>
          </div>
        </section>
      </article>
    </div>
  );
};

export default LandingPage;
