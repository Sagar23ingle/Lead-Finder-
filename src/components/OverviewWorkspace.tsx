'use client';

import React from 'react';
import { Business, LeadAnalysis, LeadCrmRecord, SearchRecord } from '@/types';
import {
  Users,
  Sparkles,
  Flame,
  Globe,
  ArrowUpRight,
  ChevronRight,
  Building2,
  MapPin,
  Star,
  Send,
  Eye,
  Search,
} from 'lucide-react';
import Link from 'next/link';

interface OverviewWorkspaceProps {
  businesses: Business[];
  allStoredBusinesses: Business[];
  analyses: Record<string, LeadAnalysis>;
  crmRecords: Record<string, LeadCrmRecord>;
  searches: SearchRecord[];
  onNavigateToTab: (tab: 'discover' | 'leads' | 'pipeline' | 'demos') => void;
  onSelectLead: (business: Business) => void;
  onOpenOutreach: (business: Business) => void;
  onLoadSearch: (searchId: string) => void;
}

export const OverviewWorkspace: React.FC<OverviewWorkspaceProps> = ({
  businesses,
  allStoredBusinesses,
  analyses,
  crmRecords,
  searches,
  onNavigateToTab,
  onSelectLead,
  onOpenOutreach,
  onLoadSearch,
}) => {
  // Compute real metrics - STRICTLY ZERO FAKE DATA
  const poolBusinesses = allStoredBusinesses.length > 0 ? allStoredBusinesses : businesses;
  const totalLeads = poolBusinesses.length;

  const analyzedCount = Object.keys(analyses).filter((id) => Boolean(analyses[id])).length;

  const hotProspects = poolBusinesses.filter((b) => {
    const analysis = analyses[b.id] || analyses[b.external_id];
    const s = analysis?.opportunityScore ?? analysis?.score ?? 0;
    return s >= 70 || analysis?.tier === 'HOT' || (analysis as any)?.tier === 'tier_1_hot';
  });

  const demosReady = poolBusinesses.filter((b) => {
    const crm = crmRecords[b.id] || crmRecords[b.external_id];
    return Boolean(crm?.demoGenerated || crm?.demoShared) || crm?.stage === 'QUALIFIED' || crm?.stage === 'PROPOSAL';
  });

  // Top 5 priority leads
  const priorityLeads = [...poolBusinesses]
    .sort((a, b) => {
      const aScore = (analyses[a.id] || analyses[a.external_id])?.opportunityScore ?? (analyses[a.id] || analyses[a.external_id])?.score ?? 0;
      const bScore = (analyses[b.id] || analyses[b.external_id])?.opportunityScore ?? (analyses[b.id] || analyses[b.external_id])?.score ?? 0;
      return bScore - aScore;
    })
    .slice(0, 5);

  return (
    <div className="overview-workspace">
      {/* Editorial Page Title */}
      <div className="workspace-hero">
        <div className="hero-text-block">
          <span className="hero-eyebrow">Executive Prospecting Dashboard</span>
          <h1 className="hero-heading font-bodoni">Outreachly Intelligence</h1>
        </div>
        <div className="hero-actions">
          <button
            type="button"
            onClick={() => onNavigateToTab('discover')}
            className="btn-premium-primary"
          >
            <Search size={15} />
            <span>Discover Leads</span>
          </button>
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="kpi-grid">
        <div className="glass-card kpi-card" onClick={() => onNavigateToTab('leads')}>
          <div className="kpi-header">
            <span className="kpi-label">Leads Discovered</span>
            <div className="kpi-icon-pill">
              <Users size={16} />
            </div>
          </div>
          <div className="kpi-value font-bodoni">{totalLeads}</div>
          <div className="kpi-footer">
            <span>Live prospect database</span>
            <ArrowUpRight size={14} className="kpi-arrow" />
          </div>
        </div>

        <div className="glass-card kpi-card" onClick={() => onNavigateToTab('leads')}>
          <div className="kpi-header">
            <span className="kpi-label">Qualified Leads</span>
            <div className="kpi-icon-pill text-cyan">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="kpi-value font-bodoni">{analyzedCount}</div>
          <div className="kpi-footer">
            <span>Opportunity audit verified</span>
            <ArrowUpRight size={14} className="kpi-arrow" />
          </div>
        </div>

        <div className="glass-card kpi-card" onClick={() => onNavigateToTab('pipeline')}>
          <div className="kpi-header">
            <span className="kpi-label">Hot Prospects</span>
            <div className="kpi-icon-pill text-amber">
              <Flame size={16} />
            </div>
          </div>
          <div className="kpi-value font-bodoni">{hotProspects.length}</div>
          <div className="kpi-footer">
            <span>Score 70+ high priority</span>
            <ArrowUpRight size={14} className="kpi-arrow" />
          </div>
        </div>

        <div className="glass-card kpi-card" onClick={() => onNavigateToTab('demos')}>
          <div className="kpi-header">
            <span className="kpi-label">Demos Prepared</span>
            <div className="kpi-icon-pill text-emerald">
              <Globe size={16} />
            </div>
          </div>
          <div className="kpi-value font-bodoni">{demosReady.length}</div>
          <div className="kpi-footer">
            <span>Tailor-made client pitches</span>
            <ArrowUpRight size={14} className="kpi-arrow" />
          </div>
        </div>
      </div>

      {/* Main Content Layout: Priority Leads + Recent Searches */}
      <div className="overview-split-layout">
        {/* Priority Leads Table */}
        <div className="glass-card overview-section-card">
          <div className="section-card-header">
            <div>
              <h2 className="section-title font-bodoni">High-Opportunity Prospects</h2>
              <p className="section-subtitle">Top businesses ranked by digital opportunity score</p>
            </div>
            {priorityLeads.length > 0 && (
              <button
                type="button"
                onClick={() => onNavigateToTab('leads')}
                className="btn-ghost-sm"
              >
                <span>View All ({poolBusinesses.length})</span>
                <ChevronRight size={14} />
              </button>
            )}
          </div>

          {priorityLeads.length === 0 ? (
            <div className="clean-empty-state">
              <div className="empty-state-icon">
                <Users size={28} strokeWidth={1.5} />
              </div>
              <h3 className="empty-title font-bodoni">No prospects discovered yet</h3>
              <p className="empty-desc">
                Launch a live search to discover high-potential businesses in your target niche and location.
              </p>
              <button
                type="button"
                onClick={() => onNavigateToTab('discover')}
                className="btn-premium-primary"
              >
                <Search size={15} />
                <span>Start Discovery</span>
              </button>
            </div>
          ) : (
            <div className="priority-list-container">
              {priorityLeads.map((b) => {
                const analysis = analyses[b.id] || analyses[b.external_id];
                const score = analysis?.opportunityScore ?? analysis?.score ?? null;
                const isHot = (score ?? 0) >= 70 || analysis?.tier === 'HOT' || (analysis as any)?.tier === 'tier_1_hot';

                return (
                  <div key={b.id || b.external_id} className="priority-lead-row">
                    <div className="lead-main-col">
                      <div className="lead-name-row">
                        <span className="lead-name">{b.name}</span>
                        {isHot && (
                          <span className="badge-hot">
                            <Flame size={12} />
                            <span>Hot</span>
                          </span>
                        )}
                        {!b.website && <span className="badge-opportunity">No Website</span>}
                      </div>
                      <div className="lead-meta-row">
                        {b.category && <span className="lead-meta-item">{b.category}</span>}
                        {b.city && (
                          <span className="lead-meta-item">
                            <MapPin size={12} />
                            {b.city}
                          </span>
                        )}
                        {b.rating ? (
                          <span className="lead-meta-item text-amber">
                            <Star size={12} fill="currentColor" />
                            {b.rating} ({b.review_count || 0})
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Opportunity Score */}
                    <div className="lead-score-col">
                      {score !== null ? (
                        <div className={`score-badge ${score >= 70 ? 'high' : 'medium'}`}>
                          <span className="score-number font-bodoni">{score}</span>
                          <span className="score-label">Score</span>
                        </div>
                      ) : (
                        <span className="score-pending">Pending Audit</span>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="lead-actions-col">
                      <button
                        type="button"
                        onClick={() => onSelectLead(b)}
                        className="btn-row-action"
                        title="View Full AI Audit & Opportunity Breakdown"
                      >
                        <Eye size={14} />
                        <span>Audit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenOutreach(b)}
                        className="btn-row-action primary"
                        title="Open Outreach & Pitch Generation"
                      >
                        <Send size={14} />
                        <span>Pitch</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Discovery Activity */}
        <div className="glass-card overview-sidebar-card">
          <div className="section-card-header">
            <div>
              <h2 className="section-title font-bodoni">Recent Searches</h2>
              <p className="section-subtitle">Saved queries and past discovery sessions</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab('discover')}
              className="btn-ghost-sm"
            >
              <span>New</span>
            </button>
          </div>

          {searches.length === 0 ? (
            <div className="clean-empty-state compact">
              <p className="empty-desc">No previous searches recorded.</p>
              <button
                type="button"
                onClick={() => onNavigateToTab('discover')}
                className="btn-ghost-sm"
              >
                <span>Launch Search</span>
              </button>
            </div>
          ) : (
            <div className="recent-searches-list">
              {searches.slice(0, 6).map((s) => (
                <div
                  key={s.id}
                  className="recent-search-item"
                  onClick={() => onLoadSearch(s.id)}
                >
                  <div className="recent-search-info">
                    <span className="recent-search-query font-bodoni">
                      {s.query || `${s.niche || 'Businesses'} in ${s.city || 'Target'}`}
                    </span>
                    <span className="recent-search-meta">
                      {s.leads_found || 0} leads discovered •{' '}
                      {new Date(s.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <ChevronRight size={14} className="recent-search-arrow" />
                </div>
              ))}
            </div>
          )}

          {/* Quick Prospecting Advice / Rule Engine Overview */}
          <div className="prospecting-tip-box">
            <span className="tip-title font-bodoni">Prospecting Protocol</span>
            <p className="tip-text">
              Target businesses with <strong>score 70+</strong> or <strong>no website</strong> first.
              Send a personalized demo pitch within 24 hours of qualification for 3x higher conversion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default OverviewWorkspace;
