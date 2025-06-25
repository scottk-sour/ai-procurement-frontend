// src/components/LandingPage.js
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "../styles/LandingPage.css"; // Use the existing regular CSS

const DevelopmentBanner = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="development-banner">
      <p>
        🚧 This site is still in development. You can still browse,{" "}
        <a href="/signup">sign up</a>, and stay updated by subscribing below!
      </p>
      {!submitted ? (
        <form
          action="https://formspree.io/f/xblgkvnk"
          method="POST"
          className="mt-2 flex justify-center flex-wrap gap-2"
          onSubmit={handleSubmit}
        >
          <input
            type="email"
            name="email"
            required
            placeholder="Enter your email"
            className="px-3 py-2 border rounded-md w-64 max-w-full"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Subscribe
          </button>
        </form>
      ) : (
        <p className="success-message">Thank you for subscribing!</p>
      )}
    </div>
  );
};

const LandingPage = () => {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className="landing-page">
      <Helmet>
        <title>TendorAI | AI-Powered Procurement Platform</title>
        <meta
          name="description"
          content="TendorAI automates procurement, speeds up vendor quote comparisons, and delivers AI insights for smarter, faster tendering decisions."
        />
      </Helmet>

      <DevelopmentBanner />

      <header
        className="hero-section"
        data-animation="fadeIn"
        data-visible={isVisible}
      >
        <div className="hero-overlay" />
        <div
          className="hero-background"
          style={{
            backgroundImage: `url(${process.env.PUBLIC_URL}/assets/images/landingpagepic.png)`,
          }}
          data-parallax-speed="0.3"
        />
        <div className="hero-content">
          <h1 className="hero-title">Revolutionize Your Procurement with AI</h1>
          <p className="hero-subtitle">Free & Instant Access</p>
          <p className="hero-description">
            Connect with top vendors, get tailored quotes in minutes, and transform your business.
          </p>
          <div className="hero-buttons">
            <Link
              to="/login"
              className="hero-button primary"
              data-animation="fadeInUp"
              data-delay="200"
              data-visible={isVisible}
            >
              Login Now
            </Link>
            <Link
              to="/signup"
              className="hero-button secondary"
              data-animation="fadeInUp"
              data-delay="400"
              data-visible={isVisible}
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </header>

      <section
        className="features-section"
        data-animation="fadeInUp"
        data-delay="600"
        data-visible={isVisible}
      >
        <div className="section-container">
          <h2 className="section-title">Why Choose TENDORAI?</h2>
          <div className="features-grid">
            {[
              {
                title: "Blazing Speed",
                text: "Receive vendor quotes tailored to your needs in minutes, not days.",
              },
              {
                title: "Trusted Network",
                text: "Access curated, vetted vendors you can rely on for quality.",
              },
              {
                title: "Seamless Comparisons",
                text: "Compare quotes side-by-side for informed, cost-effective decisions.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="feature-card"
                data-animation="fadeInUp"
                data-delay={600 + index * 200}
                data-visible={isVisible}
              >
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-text">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="services-section"
        data-animation="fadeInUp"
        data-delay="1200"
        data-visible={isVisible}
      >
        <div className="section-container">
          <h2 className="section-title">Explore Our Services</h2>
          <div className="services-grid single-row">
            {[
              {
                link: "/services/photocopiers",
                image: "photocopier.PNG",
                alt: "Photocopiers",
                title: "Photocopiers",
                desc: "Save on top-rated photocopier vendors with exclusive deals.",
              },
              {
                link: "/services/telecoms",
                image: "phone.PNG",
                alt: "Telecoms",
                title: "Telecoms",
                desc: "Discover tailored telecom solutions for your business needs.",
              },
              {
                link: "/services/cctv",
                image: "cctv.PNG",
                alt: "CCTV",
                title: "CCTV",
                desc: "Secure your assets with top CCTV solutions from trusted vendors.",
              },
              {
                link: "/services/it",
                image: "wifi.PNG",
                alt: "IT Solutions",
                title: "IT Solutions",
                desc: "Explore cutting-edge IT services with the best vendor deals.",
              },
            ].map((service, index) => (
              <Link
                to={service.link}
                className="service-card"
                key={index}
                data-animation="fadeInUp"
                data-delay={1200 + index * 200}
                data-visible={isVisible}
              >
                <img
                  src={`${process.env.PUBLIC_URL}/assets/images/${service.image}`}
                  loading="lazy"
                  alt={service.alt}
                  className="service-icon"
                  onError={(e) =>
                    (e.target.src = `${process.env.PUBLIC_URL}/assets/images/default-placeholder.jpg`)
                  }
                />
                <h3>{service.title}</h3>
                <p>{service.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        className="trust-section"
        data-animation="fadeInUp"
        data-delay="2200"
        data-visible={isVisible}
      >
        <div className="section-container">
          <h2 className="section-title">Trusted by Leading Companies</h2>
          <div className="trusted-companies">
            {[
              {
                name: "WalesWest",
                role: "Trusted Partner",
                quote: "An essential platform that connects us to reliable vendors and optimizes our procurement process.",
                logo: "waleswest.png",
              },
              {
                name: "MonhingeMotors",
                role: "Procurement Specialist",
                quote: "A great tool for finding trusted vendors quickly. Highly recommend!",
                logo: "monmotors.png",
              },
              {
                name: "Ascari",
                role: "Chief Financial Officer",
                quote: "The best solution for comparing vendor quotes and making cost-effective decisions.",
                logo: "Ascari.png",
              },
              {
                name: "GoCompare",
                role: "CEO",
                quote: "Our go-to platform for finding the right vendors with ease.",
                logo: "GoCompare.png",
              },
            ].map((company, index) => (
              <div
                key={index}
                className="company-card"
                data-animation="fadeInUp"
                data-delay={2200 + index * 200}
                data-visible={isVisible}
              >
                <img
                  src={`${process.env.PUBLIC_URL}/assets/images/${company.logo}`}
                  alt={company.name}
                  className="company-logo"
                  loading="lazy"
                  onError={(e) =>
                    (e.target.src = `${process.env.PUBLIC_URL}/assets/images/default-placeholder.jpg`)
                  }
                />
                <div className="company-info">
                  <h3 className="company-name">{company.name}</h3>
                  <p className="company-role">{company.role}</p>
                  <p className="company-quote">{company.quote}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer
        className="cta-footer"
        data-animation="fadeInUp"
        data-delay="3000"
        data-visible={isVisible}
      >
        <div className="section-container">
          <h2 className="cta-title">Ready to Transform Your Procurement?</h2>
          <Link
            to="/signup"
            className="cta-button footer-cta primary"
            data-animation="fadeInUp"
            data-delay="3200"
            data-visible={isVisible}
          >
            Sign Up Now—It’s Free
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
