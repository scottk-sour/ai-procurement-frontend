// src/components/AboutUs.js
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import "../styles/AboutUs.css";
import heroImage from "../assets/images/team.png";

// Constants
const ANIMATION_DELAY = 100;
const SCROLL_THRESHOLD = 100;

// Feature data
const FEATURES_DATA = [
  {
    id: 1,
    title: "Precision Matching",
    text: "AI tailors vendor matches to your exact needs with unmatched accuracy.",
    delay: 600
  },
  {
    id: 2,
    title: "Instant Quotes",
    text: "Competitive offers delivered in seconds, saving you time and effort.",
    delay: 800
  },
  {
    id: 3,
    title: "Trusted Network",
    text: "Curated, vetted vendors you can rely on for quality and reliability.",
    delay: 1000
  },
  {
    id: 4,
    title: "User-Centric Design",
    text: "Built for simplicity, efficiency, and a seamless user experience.",
    delay: 1200
  }
];

// Core values data
const VALUES_DATA = [
  {
    id: 1,
    title: "Transparency",
    text: "Open, honest dealings at every step of your journey.",
    delay: 1000
  },
  {
    id: 2,
    title: "Efficiency",
    text: "Maximizing your time and resources with cutting-edge solutions.",
    delay: 1200
  },
  {
    id: 3,
    title: "Innovation",
    text: "Driving progress through AI and forward-thinking technology.",
    delay: 1400
  },
  {
    id: 4,
    title: "Customer Success",
    text: "Your growth and satisfaction are our top priorities.",
    delay: 1600
  }
];

// Intersection Observer hook for animations
const useIntersectionObserver = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [elementRef, setElementRef] = useState(null);

  useEffect(() => {
    if (!elementRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(elementRef);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
        ...options
      }
    );

    observer.observe(elementRef);

    return () => {
      if (elementRef) observer.unobserve(elementRef);
    };
  }, [elementRef, options]);

  return [setElementRef, isVisible];
};

// Reusable Section Component
const Section = ({ 
  className, 
  children, 
  animationDelay = 0, 
  testId,
  ariaLabel 
}) => {
  const [ref, isVisible] = useIntersectionObserver();
  
  return (
    <section 
      ref={ref}
      className={`${className} ${isVisible ? 'visible' : ''}`}
      style={{ 
        animationDelay: isVisible ? `${animationDelay}ms` : '0ms',
        transitionDelay: isVisible ? `${animationDelay}ms` : '0ms'
      }}
      data-testid={testId}
      aria-label={ariaLabel}
    >
      {children}
    </section>
  );
};

Section.propTypes = {
  className: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  animationDelay: PropTypes.number,
  testId: PropTypes.string,
  ariaLabel: PropTypes.string
};

// Feature Card Component
const FeatureCard = ({ feature, index }) => {
  const [ref, isVisible] = useIntersectionObserver();
  
  return (
    <div
      ref={ref}
      className={`feature-card ${isVisible ? 'visible' : ''}`}
      style={{ 
        animationDelay: isVisible ? `${feature.delay}ms` : '0ms',
        transitionDelay: isVisible ? `${feature.delay}ms` : '0ms'
      }}
      data-testid={`feature-card-${index}`}
    >
      <h3 className="feature-title">{feature.title}</h3>
      <p className="feature-text">{feature.text}</p>
    </div>
  );
};

FeatureCard.propTypes = {
  feature: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    delay: PropTypes.number.isRequired
  }).isRequired,
  index: PropTypes.number.isRequired
};

// Value Card Component
const ValueCard = ({ value, index }) => {
  const [ref, isVisible] = useIntersectionObserver();
  
  return (
    <div
      ref={ref}
      className={`value-card ${isVisible ? 'visible' : ''}`}
      style={{ 
        animationDelay: isVisible ? `${value.delay}ms` : '0ms',
        transitionDelay: isVisible ? `${value.delay}ms` : '0ms'
      }}
      data-testid={`value-card-${index}`}
    >
      <h3 className="value-title">{value.title}</h3>
      <p className="value-text">{value.text}</p>
    </div>
  );
};

ValueCard.propTypes = {
  value: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    delay: PropTypes.number.isRequired
  }).isRequired,
  index: PropTypes.number.isRequired
};

// Hero Section Component
const HeroSection = () => {
  const handleImageError = useCallback((e) => {
    e.target.style.backgroundImage = "none";
    e.target.style.background = "linear-gradient(135deg, #1e3a8a, #2d4a8a)";
  }, []);

  return (
    <header className="hero-section" role="banner">
      <div className="hero-overlay" aria-hidden="true" />
      <div
        className="hero-background"
        style={{ backgroundImage: `url(${heroImage})` }}
        onError={handleImageError}
        aria-hidden="true"
      />
      <div className="hero-content">
        <h1 className="hero-title">Discover TENDORAI's Vision</h1>
        <p className="hero-subtitle">
          I'm Scott Davies, founder of TENDORAI—redefining procurement with AI innovation.
        </p>
        <Link 
          to="/how-it-works" 
          className="hero-button"
          aria-label="Learn more about our journey"
        >
          Explore Our Journey
        </Link>
      </div>
    </header>
  );
};

// Main AboutUs Component
const AboutUs = () => {
  const { pathname } = useLocation();
  const [mounted, setMounted] = useState(false);

  // Memoize feature and value components
  const featureCards = useMemo(() => 
    FEATURES_DATA.map((feature, index) => (
      <FeatureCard key={feature.id} feature={feature} index={index} />
    )), []
  );

  const valueCards = useMemo(() => 
    VALUES_DATA.map((value, index) => (
      <ValueCard key={value.id} value={value} index={index} />
    )), []
  );

  // Handle scroll to top and component mounting
  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    scrollToTop();
    
    const timer = setTimeout(() => {
      setMounted(true);
    }, ANIMATION_DELAY);

    return () => clearTimeout(timer);
  }, [pathname]);

  // Preload critical images
  useEffect(() => {
    const img = new Image();
    img.src = heroImage;
  }, []);

  if (!mounted) {
    return (
      <div className="about-us-page loading" aria-label="Loading page content">
        <div className="loading-spinner" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="about-us-page" role="main">
      <HeroSection />

      {/* About Me Section */}
      <Section 
        className="about-me-section"
        animationDelay={0}
        testId="about-me-section"
        ariaLabel="About our founder"
      >
        <div className="section-container">
          <h2 className="section-title">Meet Our Founder</h2>
          <p className="section-text">
            With over 25 years of expertise in sales, procurement, and digital marketing, 
            I've witnessed the inefficiencies plaguing businesses—hours wasted on vendor searches, 
            unreliable quotes, and outdated processes. In 2023, I launched TENDORAI to revolutionize 
            procurement with AI, empowering companies to save time, slash costs, and forge trusted 
            partnerships worldwide.
          </p>
          <p className="founder-signature">— Scott Davies, Founder</p>
        </div>
      </Section>

      {/* Mission Section */}
      <Section 
        className="mission-section"
        animationDelay={200}
        testId="mission-section"
        ariaLabel="Our mission"
      >
        <div className="section-container">
          <h2 className="section-title">Our Mission</h2>
          <p className="section-text">
            At TENDORAI, we're committed to transforming procurement into a seamless, 
            cost-effective journey. Our AI platform connects businesses with vetted vendors, 
            delivering precise, instant solutions—freeing you to focus on growth and innovation.
          </p>
        </div>
      </Section>

      {/* Our Story Section */}
      <Section 
        className="story-section"
        animationDelay={400}
        testId="story-section"
        ariaLabel="Our journey and story"
      >
        <div className="section-container">
          <h2 className="section-title">Our Journey</h2>
          <p className="section-text">
            TENDORAI was born from a vision to solve procurement's persistent challenges. 
            Leveraging decades of industry insight and a passion for technology, I built an 
            AI-driven platform that's transformed hundreds of businesses since 2023—streamlining 
            workflows, reducing costs, and fostering reliable vendor relationships globally.
          </p>
        </div>
      </Section>

      {/* Why Choose Us Section */}
      <Section 
        className="why-choose-us-section"
        animationDelay={600}
        testId="why-choose-us-section"
        ariaLabel="Why choose TENDORAI"
      >
        <div className="section-container">
          <h2 className="section-title">Why Choose TENDORAI?</h2>
          <div className="features-grid" role="list">
            {featureCards}
          </div>
        </div>
      </Section>

      {/* Core Values Section */}
      <Section 
        className="core-values-section"
        animationDelay={1000}
        testId="core-values-section"
        ariaLabel="Our core values"
      >
        <div className="section-container">
          <h2 className="section-title">Our Core Values</h2>
          <div className="values-grid" role="list">
            {valueCards}
          </div>
        </div>
      </Section>

      {/* Vision Section */}
      <Section 
        className="vision-section"
        animationDelay={1400}
        testId="vision-section"
        ariaLabel="Our vision for the future"
      >
        <div className="section-container">
          <h2 className="section-title">Our Vision</h2>
          <p className="section-text">
            We aim to redefine procurement globally, making it effortless, accessible, and 
            intelligent for businesses everywhere. By expanding our vendor network and advancing 
            AI technology, TENDORAI leads the digital procurement revolution, empowering a smarter future.
          </p>
        </div>
      </Section>

      {/* Call to Action Section */}
      <Section 
        className="cta-section"
        animationDelay={1600}
        testId="cta-section"
        ariaLabel="Get started with TENDORAI"
      >
        <div className="section-container">
          <h2 className="cta-title">Join the AI Procurement Revolution</h2>
          <p className="cta-subtitle">
            Ready to transform your vendor sourcing? Let's partner to unlock TENDORAI's 
            power for your business.
          </p>
          <div className="cta-buttons">
            <Link 
              to="/contact" 
              className="cta-button primary"
              aria-label="Contact us to get started"
            >
              Get in Touch Now
            </Link>
            <Link 
              to="/how-it-works" 
              className="cta-button secondary"
              aria-label="Learn more about how TENDORAI works"
            >
              Learn More
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default AboutUs;
