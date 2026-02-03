// src/components/suppliers/SupplierDirectory.js
// GEO-optimized supplier directory page for AI discoverability
// Route: /suppliers/:category/:location

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  MapPin,
  Star,
  Phone,
  Globe,
  Shield,
  ChevronRight,
  Search,
  Filter,
  Building2,
  Award,
  Clock,
  Users,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import styles from './SupplierDirectory.module.css';
import { trackSearchImpressions, trackWebsiteClick, trackPhoneClick } from '../../utils/analytics';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ai-procurement-backend-q35u.onrender.com';

const SupplierDirectory = () => {
  const { category, location } = useParams();
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState({});
  const [pagination, setPagination] = useState({});
  const [relatedLocations, setRelatedLocations] = useState([]);

  // Format category/location for display
  const formatDisplay = (str) => {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const categoryDisplay = formatDisplay(category);
  const locationDisplay = formatDisplay(location);

  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch vendors for this category/location
        const response = await fetch(
          `${API_BASE_URL}/api/public/vendors/category/${category}/location/${location}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch vendors');
        }

        const data = await response.json();

        if (data.success) {
          const vendorList = data.data.vendors || [];
          setVendors(vendorList);
          setMeta(data.data.meta || {});
          setPagination(data.data.pagination || {});

          // Track search impressions for analytics
          if (vendorList.length > 0) {
            trackSearchImpressions(vendorList, `${categoryDisplay} in ${locationDisplay}`, category, location);
          }
        }

        // Fetch related locations
        const locResponse = await fetch(
          `${API_BASE_URL}/api/public/locations?category=${category}`
        );
        if (locResponse.ok) {
          const locData = await locResponse.json();
          if (locData.success) {
            // Get top 6 locations excluding current
            const filtered = (locData.data.locations || [])
              .filter(loc => loc.slug !== location)
              .slice(0, 6);
            setRelatedLocations(filtered);
          }
        }
      } catch (err) {
        console.error('Error fetching vendors:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, [category, location]);

  // Schema.org JSON-LD for SEO
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': `${categoryDisplay} Suppliers in ${locationDisplay}`,
    'description': meta.description || `Find trusted ${categoryDisplay} suppliers in ${locationDisplay}`,
    'numberOfItems': vendors.length,
    'itemListElement': vendors.map((vendor, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'LocalBusiness',
        'name': vendor.company,
        'description': vendor.description,
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': vendor.city
        },
        'areaServed': vendor.coverage,
        'aggregateRating': vendor.rating > 0 ? {
          '@type': 'AggregateRating',
          'ratingValue': vendor.rating,
          'reviewCount': vendor.reviewCount || 1
        } : undefined
      }
    }))
  };

  return (
    <div className={styles.supplierDirectory}>
      <Helmet>
        <title>{`${categoryDisplay} Suppliers in ${locationDisplay} | TendorAI`}</title>
        <meta 
          name="description" 
          content={meta.description || `Find and compare ${vendors.length} trusted ${categoryDisplay.toLowerCase()} suppliers in ${locationDisplay}. Get quotes from verified local vendors.`} 
        />
        <meta name="keywords" content={`${categoryDisplay}, ${locationDisplay}, suppliers, vendors, quotes, ${categoryDisplay.toLowerCase()} installation, ${categoryDisplay.toLowerCase()} maintenance`} />
        <link rel="canonical" href={`https://www.tendorai.com/suppliers/${category}/${location}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${categoryDisplay} Suppliers in ${locationDisplay}`} />
        <meta property="og:description" content={`Compare ${vendors.length} verified ${categoryDisplay.toLowerCase()} suppliers in ${locationDisplay}`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://www.tendorai.com/suppliers/${category}/${location}`} />
        
        {/* Schema.org */}
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>

      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link to="/">Home</Link>
        <ChevronRight size={16} />
        <Link to="/suppliers">Suppliers</Link>
        <ChevronRight size={16} />
        <Link to={`/suppliers?category=${category}`}>{categoryDisplay}</Link>
        <ChevronRight size={16} />
        <span>{locationDisplay}</span>
      </nav>

      {/* Hero Section */}
      <header className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            {categoryDisplay} Suppliers in {locationDisplay}
          </h1>
          <p className={styles.heroSubtitle}>
            {loading 
              ? 'Finding suppliers...' 
              : `${pagination.total || vendors.length} verified suppliers ready to quote`
            }
          </p>
          
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <Building2 size={24} />
              <span>{pagination.total || vendors.length} Suppliers</span>
            </div>
            <div className={styles.stat}>
              <Shield size={24} />
              <span>Verified & Trusted</span>
            </div>
            <div className={styles.stat}>
              <Clock size={24} />
              <span>Quick Quotes</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Vendors Grid */}
        <section className={styles.vendorsSection}>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Finding {categoryDisplay.toLowerCase()} suppliers in {locationDisplay}...</p>
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <p>Unable to load suppliers. Please try again.</p>
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          ) : vendors.length === 0 ? (
            <div className={styles.emptyState}>
              <Building2 size={48} />
              <h3>No suppliers found yet</h3>
              <p>We're building our network of {categoryDisplay.toLowerCase()} suppliers in {locationDisplay}.</p>
              <Link to="/vendors/signup" className={styles.ctaButton}>
                List Your Business Free
              </Link>
            </div>
          ) : (
            <div className={styles.vendorsGrid}>
              {vendors.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} category={category} />
              ))}
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2>Are you a {categoryDisplay} supplier in {locationDisplay}?</h2>
            <p>Get listed free and appear when businesses search for your services.</p>
            <Link to="/vendors/signup" className={styles.ctaPrimary}>
              List Your Business Free
            </Link>
          </div>
        </section>

        {/* Related Locations */}
        {relatedLocations.length > 0 && (
          <section className={styles.relatedSection}>
            <h2>Browse {categoryDisplay} suppliers in other areas</h2>
            <div className={styles.relatedGrid}>
              {relatedLocations.map((loc) => (
                <Link 
                  key={loc.slug} 
                  to={`/suppliers/${category}/${loc.slug}`}
                  className={styles.relatedCard}
                >
                  <MapPin size={20} />
                  <span>{loc.name}</span>
                  <span className={styles.count}>{loc.count} suppliers</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* SEO Content */}
        <section className={styles.seoContent}>
          <h2>About {categoryDisplay} Services in {locationDisplay}</h2>
          <p>
            Looking for reliable {categoryDisplay.toLowerCase()} suppliers in {locationDisplay}? 
            TendorAI connects you with verified local vendors who provide installation, 
            maintenance, and support services. Our suppliers are vetted for quality and 
            reliability, ensuring you get the best service for your business needs.
          </p>
          <p>
            Whether you need a new {categoryDisplay.toLowerCase()} system installed or require 
            ongoing maintenance and support, our network of {locationDisplay}-based suppliers 
            can help. Compare quotes, read reviews, and find the perfect partner for your 
            business requirements.
          </p>
        </section>
      </main>

      {/* Footer Navigation */}
      <footer className={styles.footerNav}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3>Popular Categories</h3>
            <div className={styles.footerLinks}>
              <Link to={`/suppliers/photocopiers/${location}`}>Photocopiers in {locationDisplay}</Link>
              <Link to={`/suppliers/cctv/${location}`}>CCTV in {locationDisplay}</Link>
              <Link to={`/suppliers/telecoms/${location}`}>Telecoms in {locationDisplay}</Link>
              <Link to={`/suppliers/it/${location}`}>IT Services in {locationDisplay}</Link>
            </div>
          </div>
          <div className={styles.footerSection}>
            <h3>Top UK Cities</h3>
            <div className={styles.footerLinks}>
              <Link to={`/suppliers/${category}/london`}>{categoryDisplay} in London</Link>
              <Link to={`/suppliers/${category}/manchester`}>{categoryDisplay} in Manchester</Link>
              <Link to={`/suppliers/${category}/birmingham`}>{categoryDisplay} in Birmingham</Link>
              <Link to={`/suppliers/${category}/cardiff`}>{categoryDisplay} in Cardiff</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Vendor Card Component
const VendorCard = ({ vendor, category }) => {
  // Updated tier badges with new color scheme
  const tierBadge = {
    enterprise: { label: 'Verified', className: 'verified' },
    managed: { label: 'Verified', className: 'verified' },
    verified: { label: 'Verified', className: 'verified' },
    basic: { label: 'Visible', className: 'visible' },
    visible: { label: 'Visible', className: 'visible' },
    free: { label: '', className: '' },
    listed: { label: '', className: '' }
  };

  const badge = tierBadge[vendor.tier] || tierBadge.free;
  const isPaidTier = ['enterprise', 'managed', 'verified', 'basic', 'visible'].includes(vendor.tier);

  return (
    <article className={styles.vendorCard}>
      {badge.label && (
        <div className={`${styles.tierBadge} ${styles[badge.className]}`}>
          <CheckCircle size={12} /> {badge.label}
        </div>
      )}

      <div className={styles.vendorHeader}>
        <div className={styles.vendorLogo}>
          {vendor.logoUrl ? (
            <img src={vendor.logoUrl} alt={vendor.company} />
          ) : (
            <Building2 size={32} />
          )}
        </div>
        <div className={styles.vendorInfo}>
          <h3>{vendor.company}</h3>
          {vendor.city && (
            <p className={styles.location}>
              <MapPin size={14} />
              <span>{vendor.city}</span>
              {vendor.distance && (
                <span className={styles.distance}>• {vendor.distance} miles</span>
              )}
            </p>
          )}
        </div>
      </div>

      {vendor.rating > 0 && (
        <div className={styles.rating}>
          <Star size={16} fill="#fbbf24" stroke="#fbbf24" />
          <span>{vendor.rating.toFixed(1)}</span>
          <span className={styles.reviewCount}>({vendor.reviewCount || 0} reviews)</span>
        </div>
      )}

      {vendor.description && (
        <p className={styles.description}>
          {vendor.description.substring(0, 120)}
          {vendor.description.length > 120 ? '...' : ''}
        </p>
      )}

      <div className={styles.services}>
        {vendor.services?.slice(0, 3).map((service, idx) => (
          <span key={idx} className={styles.serviceTag}>{service}</span>
        ))}
      </div>

      {vendor.brands?.length > 0 && (
        <p className={styles.brands}>
          <strong>Brands:</strong> {vendor.brands.slice(0, 3).join(', ')}
          {vendor.brands.length > 3 && ` +${vendor.brands.length - 3} more`}
        </p>
      )}

      {vendor.accreditations?.length > 0 && (
        <div className={styles.accreditations}>
          <Award size={14} />
          <span>{vendor.accreditations.slice(0, 2).join(', ')}</span>
        </div>
      )}

      <div className={styles.vendorActions}>
        {isPaidTier && (
          <Link to={`/quote-request/${vendor.id}`} className={styles.quoteButton}>
            Get Quote
          </Link>
        )}
        <Link to={`/suppliers/profile/${vendor.id}`} className={styles.profileButton}>
          View Profile
        </Link>
      </div>

      {/* Schema.org for individual vendor */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          'name': vendor.company,
          'description': vendor.description,
          'areaServed': vendor.coverage,
          'telephone': vendor.showPricing ? vendor.phone : undefined,
          'url': vendor.website,
          'aggregateRating': vendor.rating > 0 ? {
            '@type': 'AggregateRating',
            'ratingValue': vendor.rating,
            'reviewCount': vendor.reviewCount || 1
          } : undefined
        })}
      </script>
    </article>
  );
};

export default SupplierDirectory;
