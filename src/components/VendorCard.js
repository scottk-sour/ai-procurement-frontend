// src/components/VendorCard.js
// Individual vendor card with tier badges and rating display

import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaClock, FaCheck, FaGlobe, FaPhone, FaCrown, FaAward, FaShieldAlt } from 'react-icons/fa';
import '../styles/VendorCard.css';

const TIER_CONFIG = {
  enterprise: {
    label: 'Enterprise Partner',
    icon: FaCrown,
    color: '#7c3aed',
    bgColor: '#f5f3ff',
    isPremium: true
  },
  managed: {
    label: 'Premium Partner',
    icon: FaAward,
    color: '#f59e0b',
    bgColor: '#fffbeb',
    isPremium: true
  },
  basic: {
    label: 'Verified Partner',
    icon: FaShieldAlt,
    color: '#10b981',
    bgColor: '#ecfdf5',
    isVerified: true
  },
  standard: {
    label: 'Verified',
    icon: FaShieldAlt,
    color: '#10b981',
    bgColor: '#ecfdf5',
    isVerified: true
  },
  free: {
    label: 'Listed',
    icon: FaCheck,
    color: '#6b7280',
    bgColor: '#f9fafb'
  }
};

const VendorCard = ({
  vendor,
  variant = 'default', // 'default' | 'compact' | 'featured'
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
    badges = {},
    description,
    accreditations = [],
    brands = [],
    logoUrl,
    website,
    showPricing,
    canReceiveQuotes
  } = vendor;

  const tierConfig = TIER_CONFIG[tier] || TIER_CONFIG.free;
  const TierIcon = tierConfig.icon;
  const isPremium = badges.premium || tierConfig.isPremium;
  const isVerified = badges.verified || tierConfig.isVerified || showPricing;
  const isFeatured = isPremium;

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

  const handleQuoteClick = (e) => {
    if (onQuoteRequest) {
      e.preventDefault();
      onQuoteRequest(vendor);
    }
  };

  return (
    <div className={`vendor-card vendor-card--${variant} ${isFeatured ? 'vendor-card--featured' : ''}`}>
      {/* Tier Badge */}
      <div
        className="vendor-card__tier-badge"
        style={{ backgroundColor: tierConfig.bgColor, color: tierConfig.color }}
      >
        <TierIcon />
        <span>{tierConfig.label}</span>
      </div>

      {/* Header */}
      <div className="vendor-card__header">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={`${company} logo`}
            className="vendor-card__logo"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="vendor-card__logo vendor-card__logo--placeholder">
            {company?.charAt(0) || 'V'}
          </div>
        )}

        <div className="vendor-card__info">
          <h3 className="vendor-card__company">
            <Link to={`/suppliers/profile/${id}`}>{company}</Link>
          </h3>

          {/* Rating */}
          <div className="vendor-card__rating">
            <div className="vendor-card__stars">
              {renderStars(rating)}
            </div>
            <span className="vendor-card__rating-text">
              {rating.toFixed(1)} ({reviewCount} reviews)
            </span>
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

      {/* Description */}
      {description && variant !== 'compact' && (
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
          <div className="vendor-card__meta-item">
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

        {canReceiveQuotes !== false ? (
          <Link
            to={`/quote-request/${id}`}
            className="vendor-card__btn vendor-card__btn--primary"
          >
            Get Quote
          </Link>
        ) : (
          <span className="vendor-card__btn vendor-card__btn--disabled">
            Upgrade Required
          </span>
        )}
      </div>

      {/* Quick Links (for premium tiers) */}
      {showPricing && (
        <div className="vendor-card__quick-links">
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="vendor-card__quick-link"
            >
              <FaGlobe /> Website
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default VendorCard;
