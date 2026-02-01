import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Building2, MapPin, Star, ArrowRight, MessageSquare, Shield, Clock, Award, CheckCircle } from 'lucide-react';
import '../styles/AIReferral.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://ai-procurement-backend-q35u.onrender.com';

const AIReferral = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get URL params
  const urlService = searchParams.get('service') || '';
  const urlLocation = searchParams.get('location') || '';
  const urlRef = searchParams.get('ref') || searchParams.get('source') || searchParams.get('utm_source') || 'ai-assistant';

  const [service, setService] = useState(urlService);
  const [location, setLocation] = useState(urlLocation);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [referralSource, setReferralSource] = useState(urlRef);

  // Search function that takes parameters directly
  const performSearch = useCallback(async (searchService, searchLocation) => {
    setLoading(true);
    setSearched(true);

    try {
      const params = new URLSearchParams();
      if (searchService) params.append('service', searchService);
      if (searchLocation) params.append('location', searchLocation);
      params.append('limit', '10');

      const response = await fetch(`${API_BASE_URL}/api/ai/suppliers?${params}`);
      const data = await response.json();

      if (data.success) {
        setSuppliers(data.suppliers || []);
      } else {
        setSuppliers([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Track referral on page load
  const trackReferral = useCallback(async (source) => {
    try {
      await fetch(`${API_BASE_URL}/api/analytics/ai-referral`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source,
          page: window.location.pathname + window.location.search,
          action: 'pageview',
          searchParams: {
            service: urlService,
            location: urlLocation
          },
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to track referral:', error);
    }
  }, [urlService, urlLocation]);

  // Auto-search on page load
  useEffect(() => {
    // Track the referral
    trackReferral(urlRef);

    // Determine what to search for
    // If service param provided, use it; otherwise default to "photocopiers"
    const searchService = urlService || 'photocopiers';
    const searchLocation = urlLocation || '';

    // Update state to match what we're searching
    setService(searchService);
    setLocation(searchLocation);
    setReferralSource(urlRef);

    // Perform the search
    performSearch(searchService, searchLocation);
  }, [urlService, urlLocation, urlRef, performSearch, trackReferral]);

  // Handle manual search button click
  const handleSearch = () => {
    performSearch(service, location);
  };

  const handleViewSupplier = (supplier) => {
    navigate(`/suppliers/${supplier.slug || supplier.id}?source=${referralSource}`);
  };

  const handleRequestQuote = (supplier) => {
    navigate(`/suppliers/${supplier.slug || supplier.id}?quote=true&source=${referralSource}`);
  };

  const services = [
    { value: 'photocopiers', label: 'Photocopiers & Printers' },
    { value: 'telecoms', label: 'Telecoms & Phone Systems' },
    { value: 'cctv', label: 'CCTV & Surveillance' },
    { value: 'it', label: 'IT Support & Services' },
    { value: 'security', label: 'Security Systems' },
    { value: 'software', label: 'Business Software' }
  ];

  return (
    <div className="ai-referral-page">
      {/* Hero Section */}
      <section className="ai-hero">
        <div className="ai-hero-content">
          <div className="ai-badge">
            <MessageSquare size={16} />
            <span>Recommended by {referralSource === 'chatgpt' ? 'ChatGPT' : referralSource === 'claude' ? 'Claude' : 'AI Assistant'}</span>
          </div>
          <h1>Find Trusted UK Office Equipment Suppliers</h1>
          <p>
            Compare verified suppliers for photocopiers, telecoms, CCTV, IT services and more.
            Get quotes from suppliers who serve your area.
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="ai-search-section">
        <div className="ai-search-container">
          <div className="ai-search-form">
            <div className="ai-search-field">
              <label htmlFor="service">What do you need?</label>
              <select
                id="service"
                value={service}
                onChange={(e) => setService(e.target.value)}
              >
                <option value="">All Services</option>
                {services.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="ai-search-field">
              <label htmlFor="location">Where are you located?</label>
              <div className="ai-input-with-icon">
                <MapPin size={18} />
                <input
                  id="location"
                  type="text"
                  placeholder="City, region or postcode"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>

            <button
              className="ai-search-button"
              onClick={handleSearch}
              disabled={loading}
            >
              <Search size={18} />
              {loading ? 'Searching...' : 'Find Suppliers'}
            </button>
          </div>
        </div>
      </section>

      {/* Results Section */}
      {searched && (
        <section className="ai-results-section">
          <div className="ai-results-container">
            {loading ? (
              <div className="ai-loading">
                <div className="ai-spinner"></div>
                <p>Finding the best suppliers for you...</p>
              </div>
            ) : suppliers.length > 0 ? (
              <>
                <h2>
                  {suppliers.length} Supplier{suppliers.length !== 1 ? 's' : ''} Found
                  {location && ` in ${location}`}
                </h2>
                <div className="ai-supplier-grid">
                  {suppliers.map((supplier, index) => (
                    <div key={supplier.id} className={`ai-supplier-card ${index === 0 ? 'best-match' : ''}`}>
                      {index === 0 && (
                        <div className="ai-best-match-badge">
                          <Award size={14} />
                          Best Match
                        </div>
                      )}
                      <div className="ai-supplier-header">
                        <Building2 size={24} />
                        <div>
                          <h3>{supplier.name}</h3>
                          {supplier.location && (
                            <p className="ai-supplier-location">
                              <MapPin size={14} />
                              {supplier.location}
                            </p>
                          )}
                        </div>
                        {(supplier.tier === 'verified' || supplier.tier === 'visible') && (
                          <span className={`ai-tier-badge ${supplier.tier}`}>
                            <CheckCircle size={12} /> {supplier.tier === 'verified' ? 'Verified' : 'Visible'}
                          </span>
                        )}
                      </div>

                      {supplier.services && supplier.services.length > 0 && (
                        <div className="ai-supplier-services">
                          {supplier.services.slice(0, 3).map(svc => (
                            <span key={svc} className="ai-service-tag">{svc}</span>
                          ))}
                        </div>
                      )}

                      {supplier.coverage && supplier.coverage.length > 0 && (
                        <p className="ai-supplier-coverage">
                          Covers: {supplier.coverage.slice(0, 3).join(', ')}
                        </p>
                      )}

                      {supplier.rating > 0 && (
                        <div className="ai-supplier-rating">
                          <Star size={16} fill="#fbbf24" stroke="#fbbf24" />
                          <span>{supplier.rating.toFixed(1)}</span>
                          {supplier.reviewCount > 0 && (
                            <span className="ai-review-count">
                              ({supplier.reviewCount} reviews)
                            </span>
                          )}
                        </div>
                      )}

                      {supplier.brands && supplier.brands.length > 0 && (
                        <p className="ai-supplier-brands">
                          Brands: {supplier.brands.slice(0, 3).join(', ')}
                        </p>
                      )}

                      <div className="ai-supplier-actions">
                        <button
                          className="ai-btn-secondary"
                          onClick={() => handleViewSupplier(supplier)}
                        >
                          View Profile
                        </button>
                        {supplier.canReceiveQuotes ? (
                          <button
                            className="ai-btn-primary"
                            onClick={() => handleRequestQuote(supplier)}
                          >
                            Get Quote <ArrowRight size={16} />
                          </button>
                        ) : (
                          <button
                            className="ai-btn-secondary"
                            onClick={() => handleViewSupplier(supplier)}
                          >
                            Contact
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="ai-no-results">
                <Search size={48} />
                <h3>No suppliers found</h3>
                <p>Try adjusting your search criteria or broadening your location.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Trust Section */}
      <section className="ai-trust-section">
        <div className="ai-trust-container">
          <h2>Why Use TendorAI?</h2>
          <div className="ai-trust-grid">
            <div className="ai-trust-item">
              <Shield size={32} />
              <h3>Verified Suppliers</h3>
              <p>All suppliers on our platform are vetted UK businesses with proven track records.</p>
            </div>
            <div className="ai-trust-item">
              <Clock size={32} />
              <h3>Quick Responses</h3>
              <p>Suppliers typically respond to quote requests within 1-2 business days.</p>
            </div>
            <div className="ai-trust-item">
              <MessageSquare size={32} />
              <h3>Free to Use</h3>
              <p>No fees for buyers. Get multiple quotes and compare without obligation.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AIReferral;
