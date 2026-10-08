'use client';

import React, { useState } from 'react';
import { Business, LeadAnalysis, LeadCrmRecord } from '@/types';
import {
  Globe,
  ExternalLink,
  Copy,
  Check,
  RotateCw,
  Send,
  Building2,
  MapPin,
  Star,
  Sparkles,
  Search,
} from 'lucide-react';
import Link from 'next/link';

interface DemosWorkspaceProps {
  businesses: Business[];
  analyses: Record<string, LeadAnalysis>;
  crmRecords: Record<string, LeadCrmRecord>;
  onOpenOutreach: (business: Business) => void;
  onNavigateToTab: (tab: 'discover' | 'leads') => void;
}

export const DemosWorkspace: React.FC<DemosWorkspaceProps> = ({
  businesses,
  analyses,
  crmRecords,
  onOpenOutreach,
  onNavigateToTab,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');

  // Find all businesses that have a demo generated OR have qualified opportunity
  // For demo workspace, we list businesses with demo status, or available to generate
  const demoList = businesses.filter((b) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      (b.city && b.city.toLowerCase().includes(q)) ||
      (b.category && b.category.toLowerCase().includes(q))
    );
  });

  const handleCopyLink = (businessId: string) => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/demo/${encodeURIComponent(businessId)}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(businessId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="demos-workspace">
      {/* Editorial Header */}
      <div className="workspace-hero">
        <div className="hero-text-block">
          <span className="hero-eyebrow">Client Experience & Pitch Demos</span>
          <h1 className="hero-heading font-bodoni">Client Demo Showcase</h1>
          <p className="hero-description">
            Tailor-made interactive website previews generated for target prospects.
            Demonstrate value before the first meeting.
          </p>
        </div>
        <div className="hero-actions">
          <button
            type="button"
            onClick={() => onNavigateToTab('leads')}
            className="btn-premium-primary"
          >
            <Sparkles size={15} />
            <span>Select Lead for Demo</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      {businesses.length > 0 && (
        <div className="glass-card demos-filter-bar">
          <div className="demos-search-input-wrapper">
            <Search size={16} className="text-muted" />
            <input
              type="text"
              placeholder="Filter demos by business name, niche or location..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="demos-search-input"
            />
          </div>
          <span className="demos-count-tag font-bodoni">
            {demoList.length} {demoList.length === 1 ? 'Demo Record' : 'Demo Records'}
          </span>
        </div>
      )}

      {/* Demos Grid */}
      {businesses.length === 0 ? (
        <div className="glass-card clean-empty-state">
          <div className="empty-state-icon">
            <Globe size={32} strokeWidth={1.5} />
          </div>
          <h2 className="empty-title font-bodoni">No client demos generated yet</h2>
          <p className="empty-desc">
            Discover businesses and generate customized, high-converting website demos tailored specifically to their brand.
          </p>
          <button
            type="button"
            onClick={() => onNavigateToTab('discover')}
            className="btn-premium-primary"
          >
            <Search size={15} />
            <span>Discover Qualified Leads</span>
          </button>
        </div>
      ) : demoList.length === 0 ? (
        <div className="glass-card clean-empty-state compact">
          <p className="empty-desc">No demo records match &quot;{filterQuery}&quot;.</p>
        </div>
      ) : (
        <div className="demos-grid">
          {demoList.map((b) => {
            const id = b.id || b.external_id;
            const crm = crmRecords[b.id] || crmRecords[b.external_id];
            const analysis = analyses[b.id] || analyses[b.external_id];
            const isCopied = copiedId === id;
            const demoUrl = `/demo/${encodeURIComponent(id)}`;

            return (
              <div key={id} className="glass-card demo-record-card">
                <div className="demo-card-top">
                  <div className="demo-card-badge-row">
                    <span className="demo-category-badge">{b.category || 'Business'}</span>
                    {(analysis?.opportunityScore ?? analysis?.score) ? (
                      <span className="demo-score-badge font-bodoni">
                        {analysis?.opportunityScore ?? analysis?.score} Score
                      </span>
                    ) : null}
                  </div>
                  <h3 className="demo-business-name font-bodoni">{b.name}</h3>
                  <div className="demo-location-row">
                    {b.city && (
                      <span className="demo-meta-item">
                        <MapPin size={12} />
                        {b.city}
                      </span>
                    )}
                    {b.rating ? (
                      <span className="demo-meta-item text-amber">
                        <Star size={12} fill="currentColor" />
                        {b.rating}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="demo-card-preview-strip">
                  <div className="preview-strip-visual">
                    <Globe size={18} className="preview-globe-icon" />
                    <span className="preview-strip-text">Interactive Demo Site</span>
                  </div>
                  <span className="preview-status-pill">
                    {crm?.demoGenerated || crm?.demoShared ? 'Generated' : 'Ready to View'}
                  </span>
                </div>

                {/* Actions */}
                <div className="demo-card-actions">
                  <Link
                    href={demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-demo-action primary"
                  >
                    <ExternalLink size={14} />
                    <span>Open Demo</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleCopyLink(id)}
                    className="btn-demo-action"
                    title="Copy full demo link to clipboard"
                  >
                    {isCopied ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                    <span>{isCopied ? 'Copied' : 'Copy Link'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenOutreach(b)}
                    className="btn-demo-action"
                    title="Pitch with this demo via Email / WhatsApp"
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
  );
};
export default DemosWorkspace;
