// src/components/HeroSearch.js
// Postcode-based vendor search with category and distance filters

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaChevronDown } from 'react-icons/fa';
import '../styles/HeroSearch.css';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'photocopiers', label: 'Photocopiers & Printers' },
  { value: 'telecoms', label: 'Telecoms & Phone Systems' },
  { value: 'cctv', label: 'CCTV & Security' },
  { value: 'it-services', label: 'IT Services & Equipment' },
  { value: 'office-equipment', label: 'Office Equipment' },
];

const DISTANCES = [
  { value: '10', label: '10 miles' },
  { value: '25', label: '25 miles' },
  { value: '50', label: '50 miles' },
  { value: '100', label: '100 miles' },
  { value: '200', label: 'Nationwide' },
];

const HeroSearch = ({
  variant = 'default', // 'default' | 'compact' | 'hero'
  onSearch,
  initialCategory = '',
  initialPostcode = '',
  initialDistance = '50'
}) => {
  const navigate = useNavigate();
  const [postcode, setPostcode] = useState(initialPostcode);
  const [category, setCategory] = useState(initialCategory);
  const [distance, setDistance] = useState(initialDistance);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validatePostcode = (pc) => {
    // UK postcode validation (loose)
    const ukPostcodeRegex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2}$/i;
    return ukPostcodeRegex.test(pc.trim());
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');

    if (!postcode.trim()) {
      setError('Please enter your postcode');
      return;
    }

    if (!validatePostcode(postcode)) {
      setError('Please enter a valid UK postcode');
      return;
    }

    setIsLoading(true);

    try {
      // Build search params
      const params = new URLSearchParams();
      params.set('postcode', postcode.trim().toUpperCase());
      if (category) params.set('category', category);
      params.set('distance', distance);

      // If onSearch callback provided, use it
      if (onSearch) {
        await onSearch({ postcode: postcode.trim(), category, distance });
      } else {
        // Navigate to search results page
        navigate(`/suppliers/search?${params.toString()}`);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isHero = variant === 'hero';
  const isCompact = variant === 'compact';

  return (
    <div className={`hero-search hero-search--${variant}`}>
      <form onSubmit={handleSearch} className="hero-search__form">
        {/* Postcode Input */}
        <div className="hero-search__input-group hero-search__input-group--postcode">
          <FaMapMarkerAlt className="hero-search__icon" />
          <input
            type="text"
            value={postcode}
            onChange={(e) => {
              setPostcode(e.target.value.toUpperCase());
              setError('');
            }}
            placeholder="Enter postcode (e.g., SW1A 1AA)"
            className="hero-search__input"
            maxLength={10}
          />
        </div>

        {/* Category Dropdown */}
        {!isCompact && (
          <div className="hero-search__input-group hero-search__input-group--select">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="hero-search__select"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <FaChevronDown className="hero-search__select-icon" />
          </div>
        )}

        {/* Distance Dropdown */}
        <div className="hero-search__input-group hero-search__input-group--select hero-search__input-group--distance">
          <select
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className="hero-search__select"
          >
            {DISTANCES.map((dist) => (
              <option key={dist.value} value={dist.value}>
                {dist.label}
              </option>
            ))}
          </select>
          <FaChevronDown className="hero-search__select-icon" />
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="hero-search__button"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="hero-search__spinner" />
          ) : (
            <>
              <FaSearch />
              <span>{isHero ? 'Find Suppliers' : 'Search'}</span>
            </>
          )}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="hero-search__error">
          {error}
        </div>
      )}

      {/* Helper Text */}
      {isHero && (
        <p className="hero-search__helper">
          Enter your postcode to find verified suppliers near you
        </p>
      )}
    </div>
  );
};

export default HeroSearch;
