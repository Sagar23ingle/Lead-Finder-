'use client';

import React from 'react';
import { BestOpportunitiesSummary, Business, LeadAnalysis } from '@/types';
import { Sparkles, Flame, Target, TrendingUp, AlertCircle, ExternalLink } from 'lucide-react';

interface BestOpportunitiesSectionProps {
  summary: BestOpportunitiesSummary | null;
  onSelectLead: (business: Business) => void;
}

export const BestOpportunitiesSection: React.FC<BestOpportunitiesSectionProps> = ({
  summary,
  onSelectLead,
}) => {
  if (!summary || (summary.hotCount === 0 && summary.warmCount === 0 && summary.topOpportunities.length === 0)) {
    return null;
  }

  return (
    <div
      style={{
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '14px',
        padding: '1.25rem 1.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} color="#3b82f6" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Business Intelligence &amp; Best Opportunities
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span
            style={{
              padding: '3px 10px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Flame size={12} />
            <span>{summary.hotCount} HOT Leads</span>
          </span>

          <span
            style={{
              padding: '3px 10px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              color: '#fbbf24',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            {summary.warmCount} WARM
          </span>
        </div>
      </div>

      {/* Intelligence Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ backgroundColor: '#1e293b', padding: '0.875rem 1rem', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
            Top Converting Niche
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
            {summary.bestNiche}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#60a5fa', marginTop: '2px' }}>
            Highest ROI for website packages
          </div>
        </div>

        <div style={{ backgroundColor: '#1e293b', padding: '0.875rem 1rem', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
            Prime Geography
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
            {summary.bestCity}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '2px' }}>
            Active buyer volume
          </div>
        </div>

        <div style={{ backgroundColor: '#1e293b', padding: '0.875rem 1rem', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
            Low Priority / Time-Wasters
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#94a3b8', marginTop: '2px' }}>
            {summary.lowCount} Leads
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
            Zero reviews or modern active sites
          </div>
        </div>
      </div>

      {/* Key Insights List */}
      {summary.keyInsights.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {summary.keyInsights.map((insight, idx) => (
              <div key={idx} style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={13} color="#60a5fa" />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top 3 High-Priority Leads Quick Row */}
      {summary.topOpportunities.length > 0 && (
        <div>
          <div style={{ fontSize: '0.775rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Top Prospects Ready for Outreach:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {summary.topOpportunities.slice(0, 4).map(({ business, analysis }) => (
              <button
                key={business.id || business.external_id}
                onClick={() => onSelectLead(business)}
                type="button"
                style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#f8fafc',
                  textAlign: 'left',
                }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: analysis.tier === 'HOT' ? '#f87171' : '#fbbf24',
                  }}
                >
                  {analysis.score} pts
                </span>
                <span style={{ fontSize: '0.825rem', fontWeight: 600 }}>{business.name}</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {!business.website ? '(No Website)' : '(Flawed Website)'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
