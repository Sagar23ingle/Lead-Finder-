'use client';

import React, { useState } from 'react';
import { SearchRecord } from '@/types';
import { SearchForm } from './SearchForm';
import { SearchHistory } from './SearchHistory';
import { Compass, History, Sparkles, Database, Trash2, ArrowRight } from 'lucide-react';

interface DiscoverWorkspaceProps {
  onSearch: (params: {
    country: string;
    city: string;
    niche: string;
    limit: 10 | 25 | 50 | 100;
  }) => Promise<void>;
  isLoading: boolean;
  isApiConfigured: boolean;
  searches: SearchRecord[];
  activeSearchId: string | null;
  onSelectSearch: (searchId: string) => Promise<void>;
  onDeleteSearch: (searchId: string, query: string) => Promise<void>;
  isLoadingHistory: boolean;
  statusMessage: string | null;
  errorMessage: string | null;
  leadsFound: number;
  onViewLeads: () => void;
}

export const DiscoverWorkspace: React.FC<DiscoverWorkspaceProps> = ({
  onSearch,
  isLoading,
  isApiConfigured,
  searches,
  activeSearchId,
  onSelectSearch,
  onDeleteSearch,
  isLoadingHistory,
  statusMessage,
  errorMessage,
  leadsFound,
  onViewLeads,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'new' | 'saved'>('new');

  return (
    <div className="discover-workspace">
      {/* Editorial Header */}
      <div className="workspace-hero">
        <div className="hero-text-block">
          <span className="hero-eyebrow">Client Acquisition Engine</span>
          <h1 className="hero-heading font-bodoni">Prospect Discovery</h1>
          <p className="hero-description">
            Search and discover high-intent businesses across target cities with verified contact information.
          </p>
        </div>

        {/* Sub-tab Pill Switcher */}
        <div className="subtab-switcher" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeSubTab === 'new'}
            onClick={() => setActiveSubTab('new')}
            className={`subtab-btn ${activeSubTab === 'new' ? 'active' : ''}`}
          >
            <Compass size={14} />
            <span>New Search</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeSubTab === 'saved'}
            onClick={() => setActiveSubTab('saved')}
            className={`subtab-btn ${activeSubTab === 'saved' ? 'active' : ''}`}
          >
            <History size={14} />
            <span>Saved Searches ({searches.length})</span>
          </button>
        </div>
      </div>

      {/* Contextual Status / Notification */}
      {statusMessage && (
        <div className="feedback-alert feedback-success" role="status">
          <div className="feedback-content-row">
            <span>{statusMessage}</span>
            {leadsFound > 0 && (
              <button
                type="button"
                onClick={onViewLeads}
                className="btn-ghost-sm"
                style={{ marginLeft: 'auto' }}
              >
                <span>View {leadsFound} Leads</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="feedback-alert feedback-error" role="alert">
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Discover Content */}
      {activeSubTab === 'new' ? (
        <div className="discover-grid-layout">
          <div className="discover-form-container">
            <SearchForm
              onSearch={onSearch}
              isLoading={isLoading}
              isApiConfigured={isApiConfigured}
            />
          </div>

          <div className="discover-side-guide glass-card">
            <span className="guide-title font-bodoni">Discovery Best Practices</span>
            <ul className="guide-list">
              <li>
                <strong>Niche Specificity:</strong> Target granular business categories (e.g., &quot;Interior Designers&quot; or &quot;Luxury Architects&quot;) for higher response rates.
              </li>
              <li>
                <strong>Location Scope:</strong> Start with tier-1 or tier-2 commercial metro areas where businesses actively seek digital client acquisition.
              </li>
              <li>
                <strong>Volume Scaling:</strong> Select 10 to 25 leads for immediate high-touch outreach, or 50 to 100 for multi-channel campaign qualification.
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="glass-card saved-searches-view">
          <div className="section-card-header">
            <div>
              <h2 className="section-title font-bodoni">Saved Discovery Sessions</h2>
              <p className="section-subtitle">
                Access previously discovered leads stored securely in your database without consuming API quota.
              </p>
            </div>
          </div>

          {searches.length === 0 ? (
            <div className="clean-empty-state">
              <div className="empty-state-icon">
                <History size={28} strokeWidth={1.5} />
              </div>
              <h3 className="empty-title font-bodoni">No saved searches recorded</h3>
              <p className="empty-desc">
                Completed searches are saved automatically so you can reload leads anytime.
              </p>
              <button
                type="button"
                onClick={() => setActiveSubTab('new')}
                className="btn-premium-primary"
              >
                <Compass size={15} />
                <span>Run First Search</span>
              </button>
            </div>
          ) : (
            <div className="saved-searches-grid">
              {searches.map((s) => (
                <div
                  key={s.id}
                  className={`saved-search-card ${activeSearchId === s.id ? 'active' : ''}`}
                  onClick={() => onSelectSearch(s.id)}
                >
                  <div className="saved-search-top">
                    <span className="saved-search-query font-bodoni">
                      {s.query || `${s.niche} in ${s.city}`}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete saved search "${s.query}"?`)) {
                          onDeleteSearch(s.id, s.query);
                        }
                      }}
                      className="btn-delete-search"
                      title="Delete saved search"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="saved-search-details">
                    <span className="saved-leads-count font-bodoni">
                      {s.leads_found} Leads
                    </span>
                    <span className="saved-search-date">
                      {new Date(s.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="saved-search-action-strip">
                    <span>Click to load leads</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default DiscoverWorkspace;
