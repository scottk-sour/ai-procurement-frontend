// src/components/suppliers/SuppliersIndex.js
// Main supplier directory index page
// Route: /suppliers

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Search,
  MapPin,
  Grid,
  ChevronRight,
  Building2,
  Camera,
  Phone,
  Wifi,
  Shield,
  Monitor,
  Printer,
  Server,
  ArrowRight
} from 'lucide-react';
import styles from './SuppliersIndex.module.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ai-procurement-backend-q35u.onrender.com';

// Category icons mapping
const categoryIcons = {
  'Photocopiers': Printer,
  'CCTV': Camera,
  'Telecoms': Phone,
  'IT': Monitor,
  'Security': Shield,
  'Software': Server,
  'default': Building2
};

// UK regions for browse grid
const ukRegions = [
  { name: 'London', slug: 'london' },
  { name: 'Manchester', slug: 'manchester' },
  { name: 'Birmingham', slug: 'birmingham' },
  { name: 'Leeds', slug: 'leeds' },
  { name: 'Glasgow', slug: 'glasgow' },
  { name: 'Liverpool', slug: 'liverpool' },
  { name: 'Bristol', slug: 'bristol' },
  { name: 'Sheffield', slug: 'sheffield' },
  { name: 'Edinburgh', slug: 'edinburgh' },
  { name: 'Cardiff', slug: 'cardiff' },
  { name: 'Newcastle', slug: 'newcastle' },
  { name: 'Nottingham', slug: 'nottingham' },
  { name: 'Southampton', slug: 'southampton' },
  { name: 'Belfast', slug: 'belfast' },
  { name: 'Leicester', slug: 'leicester' },
  { name: 'Coventry', slug: 'coventry' },
  // Wales
  { name: 'Wales', slug: 'wales' },
  { name: 'South Wales', slug: 'south-wales' },
  { name: 'Newport', slug: 'newport' },
  { name: 'Swansea', slug: 'swansea' },
  // Regions
  { name: 'South East', slug: 'south-east' },
  { name: 'South West', slug: 'south-west' },
  { name: 'North West', slug: 'north-west' },
  { name: 'North East', slug: 'north-east' },
  { name: 'Midlands', slug: 'midlands' },
  { name: 'East Anglia', slug: 'east-anglia' },
  { name: 'Scotland', slug: 'scotland' },
  { name: 'Northern Ireland', slug: 'northern-ireland' }
];

const SuppliersIndex = () => {
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const catResponse = await fetch(`${API_BASE_URL}/api/public/categories`);
        if (catResponse.ok) {
          const catData = await catResponse.json();
          if (catData.success) {
            setCategories(catData.data.categories || []);
          }
        }

        // Fetch locations
        const locResponse = await fetch(`${API_BASE_URL}/api/public/locations`);
        if (locResponse.ok) {
          const locData = await locResponse.json();
          if (locData.success) {
            setLocations(locData.data.locations || []);
          }
        }

        // Fetch stats
        const statsResponse = await fetch(`${API_BASE_URL}/api/public/stats`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          if (statsData.success) {
            setStats(statsData.data || {});
          }
        }
      } catch (error) {
        console.error('Error fetching supplier data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter locations based on search
  const filteredRegions = ukRegions.filter(region =>
    region.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Schema.org for directory
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'name': 'UK Supplier Directory | TendorAI',
    'description': 'Find verified UK suppliers for CCTV, photocopiers, telecoms, IT and security services.',
    'mainEntity': {
      '@type': 'ItemList',
      'name': 'UK Business Suppliers',
      'numberOfItems': stats.totalVendors || 0,
      'itemListElement': categories.map((cat, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': cat.name,
        'url': `https://www.tendorai.com/suppliers?category=${cat.slug}`
      }))
    }
  };

  return (
    <div className={styles.suppliersIndex}>
      <Helmet>
        <title>UK Supplier Directory | Find CCTV, Photocopier, Telecoms & IT Suppliers | TendorAI</title>
        <meta 
          name="description" 
          content={`Find and compare ${stats.totalVendors || ''} verified UK suppliers for CCTV, photocopiers, telecoms, IT and security services. Get quotes from trusted local vendors.`}
        />
        <meta name="keywords" content="UK suppliers, CCTV installers, photocopier suppliers, telecoms providers, IT services, business suppliers directory" />
        <link rel="canonical" href="https://www.tendorai.com/suppliers" />
        
        <meta property="og:title" content="UK Supplier Directory | TendorAI" />
        <meta property="og:description" content="Find verified UK suppliers for business services" />
        <meta property="og:type" content="website" />
        
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>

      {/* Hero Section */}
      <header className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Find Trusted UK Suppliers</h1>
          <p className={styles.heroSubtitle}>
            Compare verified suppliers for CCTV, photocopiers, telecoms, IT and more
          </p>

          {/* Search Bar */}
          <div className={styles.searchContainer}>
            <div className={styles.searchBar}>
              <Search size={20} />
              <input
                type="text"
                placeholder="Search by location (e.g. Cardiff, Wales, South West)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className={styles.categorySelect}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.slug} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
            {searchTerm && selectedCategory && (
              <Link 
                to={`/suppliers/${selectedCategory}/${searchTerm.toLowerCase().replace(/\s+/g, '-')}`}
                className={styles.searchButton}
              >
                Search
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className={styles.statsBar}>
            <div className={styles.statItem}>
              <strong>{stats.totalVendors || 0}</strong>
              <span>Verified Suppliers</span>
            </div>
            <div className={styles.statItem}>
              <strong>{stats.totalCategories || categories.length}</strong>
              <span>Service Categories</span>
            </div>
            <div className={styles.statItem}>
              <strong>{stats.totalLocations || locations.length}</strong>
              <span>UK Locations</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Categories Section */}
        <section className={styles.categoriesSection}>
          <h2>Browse by Category</h2>
          <div className={styles.categoriesGrid}>
            {loading ? (
              <div className={styles.loading}>Loading categories...</div>
            ) : categories.length > 0 ? (
              categories.map(category => {
                const Icon = categoryIcons[category.name] || categoryIcons.default;
                return (
                  <div key={category.slug} className={styles.categoryCard}>
                    <div className={styles.categoryIcon}>
                      <Icon size={32} />
                    </div>
                    <h3>{category.name}</h3>
                    <p>{category.count} suppliers</p>
                    <div className={styles.categoryLinks}>
                      <Link to={`/suppliers/${category.slug}/london`}>London</Link>
                      <Link to={`/suppliers/${category.slug}/manchester`}>Manchester</Link>
                      <Link to={`/suppliers/${category.slug}/birmingham`}>Birmingham</Link>
                      <Link to={`/suppliers/${category.slug}/cardiff`}>Cardiff</Link>
                      <Link to={`/suppliers/${category.slug}/wales`}>Wales</Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={styles.emptyState}>
                <p>Building our supplier network...</p>
              </div>
            )}
          </div>
        </section>

        {/* Locations Grid */}
        <section className={styles.locationsSection}>
          <h2>Browse by Location</h2>
          <div className={styles.locationsGrid}>
            {filteredRegions.map(region => (
              <Link 
                key={region.slug}
                to={`/suppliers/${selectedCategory || 'cctv'}/${region.slug}`}
                className={styles.locationCard}
              >
                <MapPin size={18} />
                <span>{region.name}</span>
                <ChevronRight size={16} />
              </Link>
            ))}
          </div>
        </section>

        {/* Quick Links Grid */}
        <section className={styles.quickLinksSection}>
          <h2>Popular Searches</h2>
          <div className={styles.quickLinksGrid}>
            <Link to="/suppliers/cctv/london" className={styles.quickLink}>
              CCTV Installers in London
              <ArrowRight size={16} />
            </Link>
            <Link to="/suppliers/photocopiers/manchester" className={styles.quickLink}>
              Photocopier Suppliers in Manchester
              <ArrowRight size={16} />
            </Link>
            <Link to="/suppliers/telecoms/birmingham" className={styles.quickLink}>
              Telecoms Providers in Birmingham
              <ArrowRight size={16} />
            </Link>
            <Link to="/suppliers/cctv/cardiff" className={styles.quickLink}>
              CCTV Installers in Cardiff
              <ArrowRight size={16} />
            </Link>
            <Link to="/suppliers/cctv/wales" className={styles.quickLink}>
              CCTV Installers in Wales
              <ArrowRight size={16} />
            </Link>
            <Link to="/suppliers/photocopiers/south-wales" className={styles.quickLink}>
              Photocopier Suppliers in South Wales
              <ArrowRight size={16} />
            </Link>
            <Link to="/suppliers/telecoms/bristol" className={styles.quickLink}>
              Telecoms Providers in Bristol
              <ArrowRight size={16} />
            </Link>
            <Link to="/suppliers/it/scotland" className={styles.quickLink}>
              IT Services in Scotland
              <ArrowRight size={16} />
            </Link>
            <Link to="/suppliers/security/midlands" className={styles.quickLink}>
              Security Systems in Midlands
              <ArrowRight size={16} />
            </Link>
            <Link to="/suppliers/cctv/south-west" className={styles.quickLink}>
              CCTV Installers in South West
              <ArrowRight size={16} />
            </Link>
            <Link to="/suppliers/photocopiers/north-west" className={styles.quickLink}>
              Photocopier Suppliers in North West
              <ArrowRight size={16} />
            </Link>
            <Link to="/suppliers/telecoms/south-east" className={styles.quickLink}>
              Telecoms Providers in South East
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2>Are you a supplier?</h2>
            <p>List your business free and get found by companies looking for your services.</p>
            <Link to="/vendors/signup" className={styles.ctaButton}>
              List Your Business Free
            </Link>
          </div>
        </section>

        {/* SEO Content */}
        <section className={styles.seoContent}>
          <h2>UK Business Supplier Directory</h2>
          <p>
            TendorAI connects businesses with verified UK suppliers for essential services including 
            CCTV installation, photocopier supply and maintenance, telecommunications, IT services, 
            and security systems. Our directory features trusted local suppliers across England, 
            Wales, Scotland, and Northern Ireland.
          </p>
          <p>
            Whether you're looking for CCTV installers in Cardiff, photocopier suppliers in London, 
            or telecoms providers in Manchester, our comprehensive directory helps you find and 
            compare the best local vendors. All suppliers are verified for quality and reliability.
          </p>
          <h3>Why Use TendorAI?</h3>
          <ul>
            <li>Verified UK suppliers across all major cities and regions</li>
            <li>Compare quotes from multiple vendors</li>
            <li>Read reviews and ratings from other businesses</li>
            <li>Free to search and request quotes</li>
            <li>Coverage includes Wales, Scotland, England and Northern Ireland</li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3>Categories</h3>
            <div className={styles.footerLinks}>
              {categories.map(cat => (
                <Link key={cat.slug} to={`/suppliers?category=${cat.slug}`}>
                  {cat.name} Suppliers
                </Link>
              ))}
            </div>
          </div>
          <div className={styles.footerSection}>
            <h3>Top Cities</h3>
            <div className={styles.footerLinks}>
              <Link to="/suppliers/cctv/london">London</Link>
              <Link to="/suppliers/cctv/manchester">Manchester</Link>
              <Link to="/suppliers/cctv/birmingham">Birmingham</Link>
              <Link to="/suppliers/cctv/cardiff">Cardiff</Link>
              <Link to="/suppliers/cctv/glasgow">Glasgow</Link>
              <Link to="/suppliers/cctv/bristol">Bristol</Link>
            </div>
          </div>
          <div className={styles.footerSection}>
            <h3>Regions</h3>
            <div className={styles.footerLinks}>
              <Link to="/suppliers/cctv/wales">Wales</Link>
              <Link to="/suppliers/cctv/scotland">Scotland</Link>
              <Link to="/suppliers/cctv/south-west">South West</Link>
              <Link to="/suppliers/cctv/south-east">South East</Link>
              <Link to="/suppliers/cctv/midlands">Midlands</Link>
              <Link to="/suppliers/cctv/north-west">North West</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SuppliersIndex;
