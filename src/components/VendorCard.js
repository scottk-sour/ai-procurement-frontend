// src/components/VendorCard.js
// Individual vendor card with premium purple theme
// Tier-based visual priority: Verified > Visible > Listed
// Verified cards are expanded with full details

import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaClock, FaCheck, FaGlobe, FaTag } from 'react-icons/fa';
import '../styles/VendorCard.css';

// Tier configuration with new color scheme
const TIER_CONFIG = {
  enterprise: {
    label: 'Verified',
    tierClass: 'verified',
    sponsoredLabel: 'Sponsored · Verified',
    sponsoredClass: 'vendor-card__sponsored--verified',
    isPaid: true,
    isVerified: true
  },
  managed: {
    label: 'Verified',
    tierClass: 'verified',
    sponsoredLabel: 'Sponsored · Verified',
    sponsoredClass: 'vendor-card__sponsored--verified',
    isPaid: true,
    isVerified: true
  },
  verified: {
    label: 'Verified',
    tierClass: 'verified',
    sponsoredLabel: 'Sponsored · Verified',
    sponsoredClass: 'vendor-card__sponsored--verified',
    isPaid: true,
    isVerified: true
  },
  basic: {
    label: 'Visible',
    tierClass: 'visible',
    sponsoredLabel: 'Sponsored',
    sponsoredClass: 'vendor-card__sponsored--visible',
    isPaid: true,
    isVerified: false
  },
  visible: {
    label: 'Visible',
    tierClass: 'visible',
    sponsoredLabel: 'Sponsored',
    sponsoredClass: 'vendor-card__sponsored--visible',
    isPaid: true,
    isVerified: false
  },
  standard: {
    label: 'Visible',
    tierClass: 'visible',
    sponsoredLabel: 'Sponsored',
    sponsoredClass: 'vendor-card__sponsored--visible',
    isPaid: true,
    isVerified: false
  },
  free: {
    label: 'Listed',
    tierClass: 'free',
    sponsoredLabel: null,
    sponsoredClass: null,
    isPaid: false,
    isVerified: false
  },
  listed: {
    label: 'Listed',
    tierClass: 'listed',
    sponsoredLabel: null,
    sponsoredClass: null,
    isPaid: false,
    isVerified: false
  }
};

const VendorCard = ({
  vendor,
  variant = 'default',
  onQuoteRequest,
  showDistance = false
}) => {
  const {
    id,
    company,
    services = [],
    location = {},
    distance,
    rating = 0,
    reviewCount = 0,
    responseTime,
    tier = 'free',
    description,
    accreditations = [],
    brands = [],
    logoUrl,
    website,
    showPricing,
    canReceiveQuotes
  } = vendor;

  const tierConfig = TIER_CONFIG[tier] || TIER_CONFIG.free;
  const isPaidVendor = tierConfig.isPaid || showPricing;
  const isVerified = tierConfig.isVerified;
  const isVisible = tierConfig.isPaid && !tierConfig.isVerified;
  const isFree = !tierConfig.isPaid;

  // Coverage areas from location
  const coverageAreas = location?.coverage || [];

  // Determine what content to show based on tier
  // Verified: full description, brands, coverage
  // Visible: truncated description, no brands/coverage
  // Free: no description
  const showFullDescription = isVerified && description && description.length > 20;
  const showTruncatedDescription = isVisible && description && description.length > 20;
  const showBrands = isVerified && brands.length > 0;
  const showCoverage = isVerified && coverageAreas.length > 0;

  // Only show rating if vendor has at least 1 review
  const hasReviews = reviewCount > 0 && rating > 0;

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="vendor-card__star vendor-card__star--filled" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStar key={i} className="vendor-card__star vendor-card__star--half" />);
      } else {
        stars.push(<FaStar key={i} className="vendor-card__star vendor-card__star--empty" />);
      }
    }
    return stars;
  };

  const cardClasses = [
    'vendor-card',
    `vendor-card--${variant}`,
    `vendor-card--${tierConfig.tierClass}`,
    isVerified ? 'vendor-card--expanded' : '',
    tierConfig.isPaid ? 'vendor-card--featured' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      {/* Sponsored Label - Only for paid tiers */}
      {tierConfig.sponsoredLabel && (
        <div className={`vendor-card__sponsored ${tierConfig.sponsoredClass}`}>
          <FaCheck /> {tierConfig.sponsoredLabel}
        </div>
      )}

      {/* Header */}
      <div className="vendor-card__header">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={`${company} logo`}
            className="vendor-card__logo"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
            }}
          />
        ) : (
          <div className="vendor-card__logo vendor-card__logo--placeholder">
            {company?.charAt(0) || 'V'}
          </div>
        )}

        <div className="vendor-card__info">
          {/* Company name with tier badge inline */}
          <div className="vendor-card__company-row">
            <h3 className="vendor-card__company">
              <Link to={`/suppliers/profile/${id}`}>{company}</Link>
            </h3>
            {/* Tier badge - hide for free/listed tier */}
            {tierConfig.isPaid && (
              <span className={`vendor-card__tier-badge ${tierConfig.badgeClass}`}>
                <FaCheck /> {tierConfig.label}
              </span>
            )}
          </div>

          {/* Rating - Only show if vendor has reviews */}
          {hasReviews && (
            <div className="vendor-card__rating">
              <div className="vendor-card__stars">
                {renderStars(rating)}
              </div>
              <span className="vendor-card__rating-text">
                {rating.toFixed(1)} ({reviewCount} reviews)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Services */}
      <div className="vendor-card__services">
        {services.slice(0, 3).map((service, index) => (
          <span key={index} className="vendor-card__service-tag">
            {service}
          </span>
        ))}
        {services.length > 3 && (
          <span className="vendor-card__service-more">
            +{services.length - 3} more
          </span>
        )}
      </div>

      {/* Description - Verified: full, Visible: truncated, Free: none */}
      {showFullDescription && (
        <p className="vendor-card__description vendor-card__description--full">
          {description}
        </p>
      )}
      {showTruncatedDescription && (
        <p className="vendor-card__description">
          {description.length > 150 ? `${description.substring(0, 150)}...` : description}
        </p>
      )}

      {/* Brands - Verified only */}
      {showBrands && (
        <div className="vendor-card__brands">
          <span className="vendor-card__brands-label">Brands:</span>
          {brands.slice(0, 5).map((brand, index) => (
            <span key={index} className="vendor-card__brand-tag">
              <FaTag /> {brand}
            </span>
          ))}
          {brands.length > 5 && (
            <span className="vendor-card__brand-more">+{brands.length - 5} more</span>
          )}
        </div>
      )}

      {/* Coverage Areas - Verified only */}
      {showCoverage && (
        <div className="vendor-card__coverage">
          <span className="vendor-card__coverage-label">Coverage:</span>
          {coverageAreas.slice(0, 4).map((area, index) => (
            <span key={index} className="vendor-card__coverage-tag">
              {area}
            </span>
          ))}
          {coverageAreas.length > 4 && (
            <span className="vendor-card__coverage-more">+{coverageAreas.length - 4} more</span>
          )}
        </div>
      )}

      {/* Meta Info */}
      <div className="vendor-card__meta">
        {/* Location */}
        <div className="vendor-card__meta-item">
          <FaMapMarkerAlt />
          <span>{location.city || location.region || 'UK'}</span>
        </div>

        {/* Distance */}
        {showDistance && distance && (
          <div className="vendor-card__meta-item vendor-card__meta-item--distance">
            <span className="vendor-card__distance">
              {distance.formatted || `${distance.km} km`}
            </span>
          </div>
        )}

        {/* Response Time */}
        {responseTime && (
          <div className="vendor-card__response-badge">
            <FaClock />
            <span>{responseTime}</span>
          </div>
        )}
      </div>

      {/* Accreditations */}
      {accreditations.length > 0 && variant !== 'compact' && (
        <div className="vendor-card__accreditations">
          {accreditations.slice(0, 4).map((acc, index) => (
            <span key={index} className="vendor-card__accreditation">
              <FaCheck /> {acc}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="vendor-card__actions">
        <Link
          to={`/suppliers/profile/${id}`}
          className="vendor-card__btn vendor-card__btn--secondary"
        >
          View Profile
        </Link>

        {/* Only show Get Quote for paid vendors */}
        {isPaidVendor && canReceiveQuotes !== false && (
          <Link
            to={`/quote-request/${id}`}
            className="vendor-card__btn vendor-card__btn--primary"
          >
            Get Quote
          </Link>
        )}
      </div>

      {/* Quick Links (for premium tiers) */}
      {showPricing && website && (
        <div className="vendor-card__quick-links">
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="vendor-card__quick-link"
          >
            <FaGlobe /> Website
          </a>
        </div>
      )}
    </div>
  );
};

export default VendorCard;
