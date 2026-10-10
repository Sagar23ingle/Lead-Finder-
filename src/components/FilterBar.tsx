'use client';

import React from 'react';
import { Filter, ArrowUpDown, Search, Flame } from 'lucide-react';

export interface FilterState {
  websiteFilter: 'all' | 'has_website' | 'no_website';
  minRating: number;
  minReviews: number;
  searchQuery: string;
  sortBy: 'highest_score' | 'highest_rating' | 'most_reviews' | 'newest' | 'name_asc';
  tierFilter: 'all' | 'hot' | 'warm_or_hot' | 'low';
}

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  totalCount: number;
  filteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  totalCount,
  filteredCount,
}) => {
  if (totalCount === 0) return null;

  const update = (patch: Partial<FilterState>) => {
    onChange({ ...filters, ...patch });
  };

  return (
    <div className="filter-card">
      <div className="filter-group-left">
        {/* Quick Search inside results */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="filter-input-search"
            style={{ paddingLeft: '30px' }}
            placeholder="Filter by name or address..."
            value={filters.searchQuery}
            onChange={(e) => update({ searchQuery: e.target.value })}
          />
        </div>

        {/* 2-Column Responsive Filter Grid on Mobile, Flex on Desktop */}
        <div className="filter-selects-grid">
          {/* Opportunity Tier Filter */}
          <select
            className="filter-select"
            value={filters.tierFilter}
            onChange={(e) => update({ tierFilter: e.target.value as FilterState['tierFilter'] })}
            aria-label="Filter by opportunity tier"
            style={{ borderColor: filters.tierFilter === 'hot' ? '#ef4444' : undefined }}
          >
            <option value="all">Opportunity: All</option>
            <option value="hot">🔥 HOT Leads Only</option>
            <option value="warm_or_hot">🔥 HOT &amp; WARM</option>
            <option value="low">Low Priority</option>
          </select>

          {/* Website Filter */}
          <select
            className="filter-select"
            value={filters.websiteFilter}
            onChange={(e) => update({ websiteFilter: e.target.value as FilterState['websiteFilter'] })}
            aria-label="Filter by website availability"
          >
            <option value="all">Website: All</option>
            <option value="has_website">Has Website</option>
            <option value="no_website">No Website (Top Opp)</option>
          </select>

          {/* Rating Filter */}
          <select
            className="filter-select"
            value={filters.minRating}
            onChange={(e) => update({ minRating: Number(e.target.value) })}
            aria-label="Filter by minimum rating"
          >
            <option value={0}>Rating: All</option>
            <option value={4.5}>4.5+ ★</option>
            <option value={4.0}>4.0+ ★</option>
            <option value={3.5}>3.5+ ★</option>
          </select>

          {/* Review Count Filter */}
          <select
            className="filter-select"
            value={filters.minReviews}
            onChange={(e) => update({ minReviews: Number(e.target.value) })}
            aria-label="Filter by minimum review count"
          >
            <option value={0}>Reviews: All</option>
            <option value={10}>10+ Reviews</option>
            <option value={50}>50+ Reviews</option>
            <option value={100}>100+ Reviews</option>
          </select>
        </div>
      </div>

      <div className="filter-footer-row">
        {/* Sorting */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: '1 1 auto' }}>
          <ArrowUpDown size={14} color="var(--text-muted)" />
          <select
            className="filter-select"
            value={filters.sortBy}
            onChange={(e) => update({ sortBy: e.target.value as FilterState['sortBy'] })}
            aria-label="Sort leads"
            style={{ width: 'auto', minWidth: '170px' }}
          >
            <option value="highest_score">AI Opportunity Score</option>
            <option value="highest_rating">Highest Rating</option>
            <option value="most_reviews">Most Reviews</option>
            <option value="newest">Newest Discovered</option>
            <option value="name_asc">Name (A-Z)</option>
          </select>
        </div>

        {/* Count Indicator */}
        <div className="filter-results-count">
          Showing <strong>{filteredCount}</strong> of <strong>{totalCount}</strong> leads
        </div>
      </div>
    </div>
  );
};
