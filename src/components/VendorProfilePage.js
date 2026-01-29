// src/components/VendorProfilePage.js
// Public vendor profile page with Schema.org markup

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FaStar, FaMapMarkerAlt, FaClock, FaPhone, FaGlobe, FaEnvelope,
  FaCheck, FaShieldAlt, FaAward, FaCrown, FaArrowLeft, FaSpinner,
  FaBuilding, FaUsers, FaCalendarAlt
} from 'react-icons/fa';
import QuickQuoteForm from './QuickQuoteForm';
import '../styles/VendorProfilePage.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://ai-procurement-backend-q35u.onrender.com';

const TIER_CONFIG = {
  enterprise: { label: 'Enterprise Partner', icon: FaCrown, color: '#7c3aed' },
  managed: { label: 'Premium Partner', icon: FaAward, color: '#f59e0b' },
  basic: { label: 'Verified Partner', icon: FaShieldAlt, color: '#10b981' },
  free: { label: 'Listed', icon: FaCheck, color: '#6b7280' }
};

const VendorProfilePage = () => {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/public/vendors/${id}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Vendor not found');
        }

        setVendor(data.data);

        // Track view
        try {
          await fetch(`${API_BASE_URL}/api/analytics/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              vendorId: id,
              eventType: 'view',
              source: { page: window.location.pathname }
            })
          });
        } catch (e) {
          // Silent fail for analytics
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, [id]);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`profile-star ${i < fullStars ? 'profile-star--filled' : 'profile-star--empty'}`}
        />
      );
    }
    return stars;
  };

  const handleWebsiteClick = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: id,
          eventType: 'website_click',
          source: { page: window.location.pathname }
        })
      });
    } catch (e) {
      // Silent fail
    }
  };

  if (loading) {
    return (
      <div className="vendor-profile vendor-profile--loading">
        <FaSpinner className="vendor-profile__spinner" />
        <p>Loading vendor profile...</p>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="vendor-profile vendor-profile--error">
        <h2>Vendor Not Found</h2>
        <p>{error || 'The vendor you are looking for does not exist or is no longer active.'}</p>
        <Link to="/suppliers" className="vendor-profile__back-btn">
          <FaArrowLeft /> Browse All Suppliers
        </Link>
      </div>
    );
  }

  const tierConfig = TIER_CONFIG[vendor.tier] || TIER_CONFIG.free;
  const TierIcon = tierConfig.icon;

  // Schema.org JSON-LD
  const schemaOrg = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': vendor.company,
    'description': vendor.description,
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': vendor.location?.city,
      'addressRegion': vendor.location?.region,
      'addressCountry': 'UK'
    },
    'areaServed': vendor.location?.coverage || [],
    'telephone': vendor.phone,
    'url': vendor.website,
    'aggregateRating': vendor.rating ? {
      '@type': 'AggregateRating',
      'ratingValue': vendor.rating,
      'reviewCount': vendor.reviewCount
    } : undefined,
    'makesOffer': vendor.services?.map(service => ({
      '@type': 'Offer',
      'itemOffered': {
        '@type': 'Service',
        'name': service
      }
    }))
  };

  return (
    <div className="vendor-profile">
      <Helmet>
        <title>{vendor.company} - {vendor.services?.[0] || 'Business Supplier'} | TendorAI</title>
        <meta
          name="description"
          content={`${vendor.company} - ${vendor.description?.substring(0, 155) || `Verified ${vendor.services?.join(', ')} supplier in ${vendor.location?.city || 'UK'}`}`}
        />
        <link rel="canonical" href={`https://www.tendorai.com/suppliers/profile/${id}`} />
        <script type="application/ld+json">
          {JSON.stringify(schemaOrg)}
        </script>
      </Helmet>

      {/* Back Navigation */}
      <div className="vendor-profile__nav">
        <div className="vendor-profile__container">
          <Link to="/suppliers" className="vendor-profile__back">
            <FaArrowLeft /> Back to Suppliers
          </Link>
        </div>
      </div>

      {/* Header */}
      <header className="vendor-profile__header">
        <div className="vendor-profile__container">
          <div className="vendor-profile__header-content">
            {/* Logo */}
            <div className="vendor-profile__logo-section">
              {vendor.logoUrl ? (
                <img src={vendor.logoUrl} alt={vendor.company} className="vendor-profile__logo" />
              ) : (
                <div className="vendor-profile__logo vendor-profile__logo--placeholder">
                  {vendor.company?.charAt(0)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="vendor-profile__info">
              <div className="vendor-profile__tier" style={{ color: tierConfig.color }}>
                <TierIcon /> {tierConfig.label}
              </div>

              <h1 className="vendor-profile__title">{vendor.company}</h1>

              {/* Rating */}
              <div className="vendor-profile__rating">
                <div className="vendor-profile__stars">{renderStars(vendor.rating || 0)}</div>
                <span className="vendor-profile__rating-text">
                  {(vendor.rating || 0).toFixed(1)} ({vendor.reviewCount || 0} reviews)
                </span>
              </div>

              {/* Location */}
              <div className="vendor-profile__location">
                <FaMapMarkerAlt />
                <span>{vendor.location?.city || vendor.location?.region || 'United Kingdom'}</span>
              </div>
            </div>

            {/* CTA */}
            <div className="vendor-profile__cta">
              <button
                onClick={() => setShowQuoteForm(true)}
                className="vendor-profile__quote-btn"
              >
                Get a Quote
              </button>

              {vendor.showPricing && vendor.website && (
                <a
                  href={vendor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleWebsiteClick}
                  className="vendor-profile__website-btn"
                >
                  <FaGlobe /> Visit Website
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="vendor-profile__main">
        <div className="vendor-profile__container">
          <div className="vendor-profile__grid">
            {/* Left Column */}
            <div className="vendor-profile__content">
              {/* About */}
              <section className="vendor-profile__section">
                <h2>About {vendor.company}</h2>
                <p>{vendor.description || 'No description available.'}</p>
              </section>

              {/* Services */}
              <section className="vendor-profile__section">
                <h2>Services Offered</h2>
                <div className="vendor-profile__services">
                  {vendor.services?.map((service, index) => (
                    <span key={index} className="vendor-profile__service-tag">
                      {service}
                    </span>
                  ))}
                </div>
              </section>

              {/* Coverage Areas */}
              {vendor.location?.coverage?.length > 0 && (
                <section className="vendor-profile__section">
                  <h2>Service Areas</h2>
                  <div className="vendor-profile__coverage">
                    {vendor.location.coverage.map((area, index) => (
                      <span key={index} className="vendor-profile__coverage-tag">
                        <FaMapMarkerAlt /> {area}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Accreditations */}
              {vendor.accreditations?.length > 0 && (
                <section className="vendor-profile__section">
                  <h2>Accreditations & Certifications</h2>
                  <ul className="vendor-profile__accreditations">
                    {vendor.accreditations.map((acc, index) => (
                      <li key={index}>
                        <FaCheck /> {acc}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Products (if premium tier) */}
              {vendor.showPricing && vendor.products?.length > 0 && (
                <section className="vendor-profile__section">
                  <h2>Available Products</h2>
                  <div className="vendor-profile__products">
                    {vendor.products.map((product, index) => (
                      <div key={index} className="vendor-profile__product">
                        <h4>{product.productName}</h4>
                        <p>{product.manufacturer} - {product.category}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <aside className="vendor-profile__sidebar">
              {/* Quick Stats */}
              <div className="vendor-profile__stats-card">
                <h3>Quick Facts</h3>

                {vendor.yearEstablished && (
                  <div className="vendor-profile__stat">
                    <FaCalendarAlt />
                    <div>
                      <span className="vendor-profile__stat-label">Established</span>
                      <span className="vendor-profile__stat-value">{vendor.yearEstablished}</span>
                    </div>
                  </div>
                )}

                {vendor.employeeCount && (
                  <div className="vendor-profile__stat">
                    <FaUsers />
                    <div>
                      <span className="vendor-profile__stat-label">Employees</span>
                      <span className="vendor-profile__stat-value">{vendor.employeeCount}</span>
                    </div>
                  </div>
                )}

                {vendor.responseTime && (
                  <div className="vendor-profile__stat">
                    <FaClock />
                    <div>
                      <span className="vendor-profile__stat-label">Response Time</span>
                      <span className="vendor-profile__stat-value">{vendor.responseTime}</span>
                    </div>
                  </div>
                )}

                {vendor.completedJobs > 0 && (
                  <div className="vendor-profile__stat">
                    <FaBuilding />
                    <div>
                      <span className="vendor-profile__stat-label">Jobs Completed</span>
                      <span className="vendor-profile__stat-value">{vendor.completedJobs}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Card (Premium only) */}
              {vendor.showPricing && (
                <div className="vendor-profile__contact-card">
                  <h3>Contact Information</h3>

                  {vendor.phone && (
                    <a href={`tel:${vendor.phone}`} className="vendor-profile__contact-item">
                      <FaPhone /> {vendor.phone}
                    </a>
                  )}

                  {vendor.email && (
                    <a href={`mailto:${vendor.email}`} className="vendor-profile__contact-item">
                      <FaEnvelope /> {vendor.email}
                    </a>
                  )}

                  {vendor.website && (
                    <a
                      href={vendor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="vendor-profile__contact-item"
                      onClick={handleWebsiteClick}
                    >
                      <FaGlobe /> {vendor.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>
              )}

              {/* CTA Card */}
              <div className="vendor-profile__cta-card">
                <h3>Interested in this supplier?</h3>
                <p>Request a free quote to compare pricing and services.</p>
                <button
                  onClick={() => setShowQuoteForm(true)}
                  className="vendor-profile__cta-btn"
                >
                  Request Quote
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Quote Form Modal */}
      {showQuoteForm && (
        <QuickQuoteForm
          vendor={vendor}
          onClose={() => setShowQuoteForm(false)}
        />
      )}
    </div>
  );
};

export default VendorProfilePage;
