'use client';

import React from 'react';
import { Business } from '@/types';
import { Building2, Globe, Phone, Star } from 'lucide-react';

interface MetricsOverviewProps {
  businesses: Business[];
  source: 'google_places' | 'database_cache' | null;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ businesses, source }) => {
  if (businesses.length === 0) return null;

  const total = businesses.length;
  const withWebsite = businesses.filter((b) => Boolean(b.website)).length;
  const withPhone = businesses.filter((b) => Boolean(b.phone)).length;
  
  const ratings = businesses.map((b) => b.rating).filter((r): r is number => typeof r === 'number' && r > 0);
  const avgRating = ratings.length > 0
    ? (ratings.reduce((acc, curr) => acc + curr, 0) / ratings.length).toFixed(1)
    : 'N/A';

  const websitePercent = Math.round((withWebsite / total) * 100);
  const phonePercent = Math.round((withPhone / total) * 100);

  return (
    <div className="metrics-grid">
      <div className="metric-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="metric-title">Discovered Leads</span>
          <Building2 size={16} color="var(--primary)" />
        </div>
        <div className="metric-value">{total}</div>
        <div className="metric-sub">
          {source === 'database_cache' ? '⚡ Loaded from Database' : '🌐 Discovered via Google Places'}
        </div>
      </div>

      <div className="metric-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="metric-title">With Website</span>
          <Globe size={16} color="var(--accent-cyan)" />
        </div>
        <div className="metric-value">{withWebsite}</div>
        <div className="metric-sub">{websitePercent}% have direct website URLs</div>
      </div>

      <div className="metric-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="metric-title">With Phone</span>
          <Phone size={16} color="var(--accent-emerald)" />
        </div>
        <div className="metric-value">{withPhone}</div>
        <div className="metric-sub">{phonePercent}% have direct contact numbers</div>
      </div>

      <div className="metric-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="metric-title">Avg Google Rating</span>
          <Star size={16} color="var(--accent-amber)" />
        </div>
        <div className="metric-value" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {avgRating} {avgRating !== 'N/A' && <span style={{ fontSize: '1.25rem', color: 'var(--accent-amber)' }}>★</span>}
        </div>
        <div className="metric-sub">Across {ratings.length} reviewed locations</div>
      </div>
    </div>
  );
};
