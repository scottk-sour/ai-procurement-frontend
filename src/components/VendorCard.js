// src/components/VendorCard.js
// Individual vendor card with premium purple theme
// Tier-based visual priority: Verified > Visible > Listed

import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaClock, FaCheck, FaGlobe, FaPhone } from 'react-icons/fa';
import '../styles/VendorCard.css';

// Tier configuration with new color scheme
const TIER_CONFIG = {
  enterprise: {
    label: 'Verified',
    tierClass: 'verified',
    badgeClass: 'vendor-card__tier-badge--verified',
    isPaid: true
  },
  managed: {
    label: 'Verified',
    tierClass: 'verified',
    badgeClass: 'vendor-card__tier-badge--verified',
    isPaid: true
  },
  verified: {
    label: 'Verified',
    tierClass: 'verified',
    badgeClass: 'vendor-card__tier-badge--verified',
    isPaid: true
  },
  basic: {
    label: 'Visible',
    tierClass: 'visible',
    badgeClass: 'vendor-card__tier-badge--visible',
    isPaid: true
  },
  visible: {
    label: 'Visible',
    tierClass: 'visible',
    badgeClass: 'vendor-card__tier-badge--visible',
    isPaid: true
  },
  standard: {
    label: 'Visible',
    tierClass: 'visible',
    badgeClass: 'vendor-card__tier-badge--visible',
    isPaid: true
  },
  free: {
    label: 'Listed',
    tierClass: 'free',
    badgeClass: 'vendor-card__tier-badge--free',
    isPaid: false
  },
  listed: {
    label: 'Listed',
    tierClass: 'listed',
    badgeClass: 'vendor-card__tier-badge--listed',
    isPaid: false
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
    logoUrl,
    website,
    showPricing,
    canReceiveQuotes
  } = vendor;

  const tierConfig = TIER_CONFIG[tier] || TIER_CONFIG.free;
  const isPaidVendor = tierConfig.isPaid || showPricing;
  const isFeatured = tierConfig.isPaid;

  // Determine if we should show the description
  const showDescription = description && description.length > 20 && variant !== 'compact';

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
    isFeatured ? 'vendor-card--featured' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
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

          {/* Rating */}
          <div className="vendor-card__rating">
            {rating > 0 ? (
              <>
                <div className="vendor-card__stars">
                  {renderStars(rating)}
                </div>
                <span className="vendor-card__rating-text">
                  {rating.toFixed(1)} ({reviewCount} reviews)
                </span>
              </>
            ) : (
              <span className="vendor-card__no-reviews">No reviews yet</span>
            )}
          </div>
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

      {/* Description - only if longer than 20 chars */}
      {showDescription && (
        <p className="vendor-card__description">
          {description.length > 150 ? `${description.substring(0, 150)}...` : description}
        </p>
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
