// src/components/common/Skeleton.js
// Loading skeleton components for better UX

import React from 'react';
import './Skeleton.css';

/**
 * Base Skeleton Component
 */
export const Skeleton = ({
  width,
  height,
  borderRadius = '8px',
  className = '',
  style = {}
}) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: width || '100%',
        height: height || '1rem',
        borderRadius,
        ...style
      }}
    />
  );
};

/**
 * Text line skeleton
 */
export const SkeletonText = ({
  lines = 3,
  lineHeight = '1rem',
  gap = '0.5rem',
  className = ''
}) => {
  return (
    <div className={`skeleton-text ${className}`} style={{ display: 'flex', flexDirection: 'column', gap }}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={lineHeight}
          width={index === lines - 1 ? '70%' : '100%'}
        />
      ))}
    </div>
  );
};

/**
 * Avatar/Circle skeleton
 */
export const SkeletonAvatar = ({
  size = '48px',
  className = ''
}) => {
  return (
    <Skeleton
      width={size}
      height={size}
      borderRadius="50%"
      className={`skeleton-avatar ${className}`}
    />
  );
};

/**
 * Card skeleton
 */
export const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`skeleton-card ${className}`}>
      <Skeleton height="180px" borderRadius="12px 12px 0 0" />
      <div className="skeleton-card__content">
        <Skeleton height="1.5rem" width="70%" />
        <SkeletonText lines={2} />
        <div className="skeleton-card__meta">
          <Skeleton height="0.875rem" width="80px" />
          <Skeleton height="0.875rem" width="60px" />
        </div>
      </div>
    </div>
  );
};

/**
 * Vendor card skeleton (matches VendorCard layout)
 */
export const SkeletonVendorCard = ({ className = '' }) => {
  return (
    <div className={`skeleton-vendor-card ${className}`}>
      {/* Tier badge */}
      <Skeleton
        width="100px"
        height="24px"
        borderRadius="50px"
        style={{ position: 'absolute', top: '1rem', right: '1rem' }}
      />

      {/* Header */}
      <div className="skeleton-vendor-card__header">
        <SkeletonAvatar size="60px" />
        <div className="skeleton-vendor-card__info">
          <Skeleton height="1.25rem" width="60%" />
          <Skeleton height="1rem" width="120px" />
        </div>
      </div>

      {/* Services */}
      <div className="skeleton-vendor-card__services">
        <Skeleton width="80px" height="24px" borderRadius="50px" />
        <Skeleton width="100px" height="24px" borderRadius="50px" />
        <Skeleton width="70px" height="24px" borderRadius="50px" />
      </div>

      {/* Description */}
      <SkeletonText lines={2} />

      {/* Meta */}
      <div className="skeleton-vendor-card__meta">
        <Skeleton width="100px" height="1rem" />
        <Skeleton width="60px" height="1rem" />
      </div>

      {/* Actions */}
      <div className="skeleton-vendor-card__actions">
        <Skeleton height="44px" borderRadius="12px" />
        <Skeleton height="44px" borderRadius="12px" />
      </div>
    </div>
  );
};

/**
 * Table row skeleton
 */
export const SkeletonTableRow = ({ columns = 4, className = '' }) => {
  return (
    <div className={`skeleton-table-row ${className}`}>
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton
          key={index}
          height="1rem"
          width={index === 0 ? '150px' : '100px'}
        />
      ))}
    </div>
  );
};

/**
 * Search results skeleton
 */
export const SkeletonSearchResults = ({ count = 6 }) => {
  return (
    <div className="skeleton-search-results">
      {/* Toolbar */}
      <div className="skeleton-search-results__toolbar">
        <Skeleton width="150px" height="1.5rem" />
        <Skeleton width="120px" height="36px" borderRadius="8px" />
      </div>

      {/* Grid */}
      <div className="skeleton-search-results__grid">
        {Array.from({ length: count }).map((_, index) => (
          <SkeletonVendorCard key={index} />
        ))}
      </div>
    </div>
  );
};

/**
 * Profile page skeleton
 */
export const SkeletonProfile = () => {
  return (
    <div className="skeleton-profile">
      {/* Header */}
      <div className="skeleton-profile__header">
        <SkeletonAvatar size="120px" />
        <div className="skeleton-profile__info">
          <Skeleton height="2rem" width="250px" />
          <Skeleton height="1.5rem" width="200px" />
          <Skeleton height="1rem" width="150px" />
        </div>
      </div>

      {/* Content */}
      <div className="skeleton-profile__content">
        <div className="skeleton-profile__section">
          <Skeleton height="1.5rem" width="150px" />
          <SkeletonText lines={4} />
        </div>

        <div className="skeleton-profile__sidebar">
          <Skeleton height="200px" borderRadius="16px" />
          <Skeleton height="150px" borderRadius="16px" />
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
