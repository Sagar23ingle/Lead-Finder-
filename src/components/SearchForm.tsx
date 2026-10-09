'use client';

import React, { useState } from 'react';
import { Search, Loader2, Globe, MapPin, Briefcase, Users, AlertTriangle, Key } from 'lucide-react';

interface SearchFormProps {
  onSearch: (params: { country: string; city: string; niche: string; limit: 10 | 25 | 50 | 100 }) => Promise<void>;
  isLoading: boolean;
  isApiConfigured: boolean;
  onOpenApiKeyModal?: () => void;
}

const COUNTRIES = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'United Arab Emirates',
  'Singapore',
  'France',
  'Netherlands',
];

const SUGGESTED_NICHES = [
  'Interior Designers',
  'Architects',
  'Dentists',
  'Digital Agencies',
  'Roofers',
  'Real Estate Agencies',
];

export const SearchForm: React.FC<SearchFormProps> = ({
  onSearch,
  isLoading,
  isApiConfigured,
  onOpenApiKeyModal,
}) => {
  const [country, setCountry] = useState('India');
  const [city, setCity] = useState('');
  const [niche, setNiche] = useState('');
  const [limit, setLimit] = useState<10 | 25 | 50 | 100>(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim() || !niche.trim() || isLoading) return;
    onSearch({ country, city: city.trim(), niche: niche.trim(), limit });
  };

  const handleClear = () => {
    setCity('');
    setNiche('');
  };

  const buttonLabel = isLoading
    ? 'Discovering Real Leads...'
    : city.trim() && niche.trim()
    ? `Find ${limit} ${niche.trim()} in ${city.trim()}`
    : `Find ${limit} Business Leads`;

  return (
    <div className="search-card">
      <div className="search-header">
        <h2 className="search-title font-bodoni">Discover Business Leads</h2>
        <p className="search-subtitle">
          Query live businesses using official Google Places discovery with automatic deduplication.
        </p>
      </div>

      {!isApiConfigured && (
        <div className="search-api-warning-glass" role="alert">
          <div className="search-api-warning-content">
            <AlertTriangle size={16} className="text-amber" style={{ flexShrink: 0 }} />
            <div>
              <span className="search-api-warning-title">Places API is not configured on the server.</span>
              <span className="search-api-warning-desc"> Searches will fail until an API key is provided.</span>
            </div>
          </div>
          {onOpenApiKeyModal && (
            <button
              type="button"
              onClick={onOpenApiKeyModal}
              className="btn-ghost-sm"
              style={{ color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.35)', marginLeft: 'auto' }}
            >
              <Key size={13} />
              <span>Add Session Key</span>
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Country Selector */}
          <div className="form-group">
            <label className="form-label" htmlFor="country-select">
              <Globe size={13} className="text-cyan" />
              <span>Country</span>
            </label>
            <select
              id="country-select"
              className="form-select"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              disabled={isLoading}
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* City Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="city-input">
              <MapPin size={13} className="text-cyan" />
              <span>State / City / Location</span>
            </label>
            <input
              id="city-input"
              type="text"
              className="form-input"
              placeholder="e.g. Nagpur, Mumbai, Chicago"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {/* Business Niche Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="niche-input">
              <Briefcase size={13} className="text-cyan" />
              <span>Business Niche</span>
            </label>
            <input
              id="niche-input"
              type="text"
              className="form-input"
              placeholder="e.g. Interior Designers, Dentists"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {/* Leads Limit Selector */}
          <div className="form-group">
            <label className="form-label">
              <Users size={13} className="text-cyan" />
              <span>Number of Leads</span>
            </label>
            <div className="limit-pills" role="radiogroup" aria-label="Number of leads required">
              {([10, 25, 50, 100] as const).map((num) => (
                <button
                  key={num}
                  type="button"
                  role="radio"
                  aria-checked={limit === num}
                  className={`limit-pill-btn ${limit === num ? 'active' : ''}`}
                  onClick={() => setLimit(num)}
                  disabled={isLoading}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="quick-chips-wrapper">
          <span className="quick-chip-label">Quick niches:</span>
          {SUGGESTED_NICHES.map((item) => (
            <button
              key={item}
              type="button"
              className={`quick-chip ${niche === item ? 'active' : ''}`}
              onClick={() => setNiche(item)}
              disabled={isLoading}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Submit & Reset Buttons */}
        <div className="form-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading || !city.trim() || !niche.trim()}
            title={city.trim() && niche.trim() ? buttonLabel : 'Enter city and niche to discover real leads'}
          >
            {isLoading ? <Loader2 size={18} className="spinner" /> : <Search size={18} />}
            <span>{buttonLabel}</span>
          </button>

          {(city.trim() || niche.trim()) && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="btn-secondary"
              style={{ padding: '9px 16px', fontSize: '0.85rem' }}
            >
              Clear Form
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
