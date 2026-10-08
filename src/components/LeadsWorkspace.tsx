'use client';

import React, { useState } from 'react';
import { Business, LeadAnalysis, LeadCrmRecord } from '@/types';
import { FilterBar, FilterState } from './FilterBar';
import { LeadTable } from './LeadTable';
import { ExportLeadsModal } from './ExportLeadsModal';
import { Sparkles, FileSpreadsheet, Download, Search, RefreshCw } from 'lucide-react';
import { downloadLeadsForExcel, copyForGoogleSheets } from '@/lib/utils/exportLeads';

interface LeadsWorkspaceProps {
  businesses: Business[];
  analyses: Record<string, LeadAnalysis>;
  crmRecords: Record<string, LeadCrmRecord>;
  isLoading: boolean;
  searchAttempted: boolean;
  leadsFound: number;
  leadsRequested: number;
  onSelectLead: (business: Business) => void;
  onOpenOutreach: (business: Business) => void;
  onAnalyzeAll: () => void;
  isBatchAnalyzing: boolean;
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onNavigateToTab: (tab: 'discover') => void;
}

export const LeadsWorkspace: React.FC<LeadsWorkspaceProps> = ({
  businesses,
  analyses,
  crmRecords,
  isLoading,
  searchAttempted,
  leadsFound,
  leadsRequested,
  onSelectLead,
  onOpenOutreach,
  onAnalyzeAll,
  isBatchAnalyzing,
  filters,
  onFilterChange,
  onNavigateToTab,
}) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Apply filters in memory
  const filteredBusinesses = businesses.filter((b) => {
    // Website filter
    if (filters.websiteFilter === 'has_website' && !b.website) return false;
    if (filters.websiteFilter === 'no_website' && b.website) return false;

    // Rating filter
    if (filters.minRating > 0 && (!b.rating || b.rating < filters.minRating)) return false;

    // Review count filter
    if (filters.minReviews > 0 && (!b.review_count || b.review_count < filters.minReviews))
      return false;

    // Opportunity tier filter
    if (filters.tierFilter === 'hot') {
      const a = analyses[b.id] || analyses[b.external_id];
      if (!a || a.tier !== 'HOT') return false;
    } else if (filters.tierFilter === 'warm_or_hot') {
      const a = analyses[b.id] || analyses[b.external_id];
      if (!a || (a.tier !== 'HOT' && a.tier !== 'WARM')) return false;
    } else if (filters.tierFilter === 'low') {
      const a = analyses[b.id] || analyses[b.external_id];
      if (!a || a.tier !== 'LOW') return false;
    }

    // Search query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const matchName = b.name.toLowerCase().includes(q);
      const matchCity = b.city?.toLowerCase().includes(q);
      const matchCategory = b.category?.toLowerCase().includes(q);
      if (!matchName && !matchCity && !matchCategory) return false;
    }

    return true;
  });

  // Sorting
  const sortedBusinesses = [...filteredBusinesses].sort((a, b) => {
    const aAnalysis = analyses[a.id] || analyses[a.external_id];
    const bAnalysis = analyses[b.id] || analyses[b.external_id];
    const aScore = aAnalysis?.opportunityScore ?? aAnalysis?.score ?? 0;
    const bScore = bAnalysis?.opportunityScore ?? bAnalysis?.score ?? 0;

    switch (filters.sortBy) {
      case 'highest_score':
        return bScore - aScore;
      case 'highest_rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'most_reviews':
        return (b.review_count || 0) - (a.review_count || 0);
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'name_asc':
        return a.name.localeCompare(b.name);
      default:
        return bScore - aScore;
    }
  });

  return (
    <div className="leads-workspace">
      {/* Editorial Header */}
      <div className="workspace-hero compact">
        <div className="hero-text-block">
          <span className="hero-eyebrow">Prospect Intelligence Repository</span>
          <h1 className="hero-heading font-bodoni">Prospects Database</h1>
          <p className="hero-description">
            Qualified leads with digital footprint scores, verified phone numbers, and one-click outreach.
          </p>
        </div>

        <div className="hero-actions">
          {businesses.length > 0 && (
            <>
              <button
                type="button"
                onClick={onAnalyzeAll}
                disabled={isBatchAnalyzing}
                className="btn-ghost-sm"
                title="Batch audit all visible leads"
              >
                <Sparkles size={14} className="text-amber" />
                <span>{isBatchAnalyzing ? 'Auditing Leads...' : 'Audit All Leads'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsExportModalOpen(true)}
                className="btn-ghost-sm"
                title="Export leads to Excel or Google Sheets"
              >
                <FileSpreadsheet size={14} className="text-emerald" />
                <span>Export ({businesses.length})</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => onNavigateToTab('discover')}
            className="btn-premium-primary"
          >
            <Search size={14} />
            <span>Discover More</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      {businesses.length > 0 && (
        <div className="leads-filter-container">
          <FilterBar
            filters={filters}
            onChange={onFilterChange}
            totalCount={businesses.length}
            filteredCount={sortedBusinesses.length}
          />
        </div>
      )}

      {/* Viewport-Aware Internal Scrollable Table Container */}
      <div className="leads-scroll-container">
        {businesses.length === 0 ? (
          <div className="glass-card clean-empty-state">
            <div className="empty-state-icon">
              <Search size={32} strokeWidth={1.5} />
            </div>
            <h2 className="empty-title font-bodoni">No leads currently loaded</h2>
            <p className="empty-desc">
              Launch a live discovery search or open a saved session to inspect and qualify prospects.
            </p>
            <button
              type="button"
              onClick={() => onNavigateToTab('discover')}
              className="btn-premium-primary"
            >
              <Search size={15} />
              <span>Discover Leads</span>
            </button>
          </div>
        ) : (
          <LeadTable
            businesses={sortedBusinesses}
            analyses={analyses}
            crmRecords={crmRecords}
            isLoading={isLoading}
            searchAttempted={searchAttempted}
            leadsFound={leadsFound}
            leadsRequested={leadsRequested}
            onSelectLead={onSelectLead}
            onOpenOutreach={onOpenOutreach}
            onAnalyzeAll={onAnalyzeAll}
            isBatchAnalyzing={isBatchAnalyzing}
          />
        )}
      </div>

      {/* Export Modal */}
      {isExportModalOpen && (
        <ExportLeadsModal
          businesses={sortedBusinesses}
          analyses={analyses}
          crmRecords={crmRecords}
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}
    </div>
  );
};
export default LeadsWorkspace;
