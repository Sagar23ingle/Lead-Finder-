'use client';

import React from 'react';
import {
  Business,
  LeadAnalysis,
  LeadCrmRecord,
  CrmDashboardMetrics,
  BusinessInsights,
  DailyActionItem,
} from '@/types';
import {
  TrendingUp,
  PieChart,
  Users,
  Target,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart2,
  ArrowUpRight,
} from 'lucide-react';

interface AnalyticsWorkspaceProps {
  businesses: Business[];
  analyses: Record<string, LeadAnalysis>;
  crmRecords: Record<string, LeadCrmRecord>;
  crmMetrics: CrmDashboardMetrics | null;
  businessInsights: BusinessInsights | null;
  dailyActions: DailyActionItem[];
}

export const AnalyticsWorkspace: React.FC<AnalyticsWorkspaceProps> = ({
  businesses,
  analyses,
  crmRecords,
  crmMetrics,
  businessInsights,
  dailyActions,
}) => {
  const totalLeads = businesses.length;
  const withWebsite = businesses.filter((b) => Boolean(b.website)).length;
  const withoutWebsite = totalLeads - withWebsite;
  const withPhone = businesses.filter((b) => Boolean(b.phone)).length;

  const websiteGapRate = totalLeads > 0 ? Math.round((withoutWebsite / totalLeads) * 100) : 0;
  const phoneReachRate = totalLeads > 0 ? Math.round((withPhone / totalLeads) * 100) : 0;

  // Pipeline stage breakdown
  const stagesCount: Record<string, number> = {
    NEW: 0,
    QUALIFIED: 0,
    CONTACTED: 0,
    REPLIED: 0,
    INTERESTED: 0,
    WON: 0,
    LOST: 0,
  };

  businesses.forEach((b) => {
    const crm = crmRecords[b.id] || crmRecords[b.external_id];
    const st = crm?.stage || 'NEW';
    if (stagesCount[st] !== undefined) {
      stagesCount[st]++;
    } else {
      stagesCount.NEW++;
    }
  });

  // Calculate tiers from real analyses
  let tier1Hot = 0;
  let tier2Warm = 0;
  let tier3Standard = 0;

  Object.values(analyses).forEach((a) => {
    if (!a) return;
    const s = a.opportunityScore ?? a.score ?? 0;
    if (a.tier === 'HOT' || (a as any).tier === 'tier_1_hot' || s >= 70) tier1Hot++;
    else if (a.tier === 'WARM' || (a as any).tier === 'tier_2_medium' || s >= 45) tier2Warm++;
    else tier3Standard++;
  });

  return (
    <div className="analytics-workspace">
      {/* Editorial Header */}
      <div className="workspace-hero">
        <div className="hero-text-block">
          <span className="hero-eyebrow">Conversion & Performance Intelligence</span>
          <h1 className="hero-heading font-bodoni">Prospecting Analytics</h1>
          <p className="hero-description">
            Objective metrics derived from your active lead discovery sessions and outreach pipeline.
          </p>
        </div>
      </div>

      {/* Top Level Metric Grid */}
      <div className="analytics-metrics-grid">
        <div className="glass-card analytics-stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Digital Opportunity Gap</span>
            <Target size={16} className="text-cyan" />
          </div>
          <div className="stat-card-number font-bodoni">{websiteGapRate}%</div>
          <div className="stat-card-subtitle">
            {withoutWebsite} businesses have no active website or modern web presence
          </div>
        </div>

        <div className="glass-card analytics-stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Direct Phone Reachability</span>
            <Users size={16} className="text-emerald" />
          </div>
          <div className="stat-card-number font-bodoni">{phoneReachRate}%</div>
          <div className="stat-card-subtitle">
            {withPhone} leads with verified direct phone or WhatsApp channels
          </div>
        </div>

        <div className="glass-card analytics-stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Hot Prospects (Score 70+)</span>
            <Sparkles size={16} className="text-amber" />
          </div>
          <div className="stat-card-number font-bodoni">{tier1Hot}</div>
          <div className="stat-card-subtitle">
            Prime candidates for immediate agency pitch & website delivery
          </div>
        </div>

        <div className="glass-card analytics-stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Active in Pipeline</span>
            <TrendingUp size={16} className="text-indigo" />
          </div>
          <div className="stat-card-number font-bodoni">
            {stagesCount.CONTACTED + stagesCount.REPLIED + stagesCount.INTERESTED}
          </div>
          <div className="stat-card-subtitle">
            Prospects currently in negotiation or outreach cadence
          </div>
        </div>
      </div>

      {/* Breakdown Panels */}
      <div className="analytics-panels-grid">
        {/* Pipeline Distribution Bar */}
        <div className="glass-card analytics-panel">
          <div className="panel-header">
            <h2 className="panel-title font-bodoni">Pipeline Stage Distribution</h2>
            <span className="panel-badge">Real-time CRM</span>
          </div>

          <div className="pipeline-bars-container">
            {[
              { label: 'New / Uncontacted', count: stagesCount.NEW, color: '#64748b' },
              { label: 'Qualified', count: stagesCount.QUALIFIED, color: '#0ea5e9' },
              { label: 'Contacted', count: stagesCount.CONTACTED, color: '#8b5cf6' },
              { label: 'Replied', count: stagesCount.REPLIED, color: '#06b6d4' },
              { label: 'Interested', count: stagesCount.INTERESTED, color: '#f59e0b' },
              { label: 'Won / Closed', count: stagesCount.WON, color: '#22c55e' },
            ].map((item) => {
              const pct = totalLeads > 0 ? Math.round((item.count / totalLeads) * 100) : 0;
              return (
                <div key={item.label} className="pipeline-bar-row">
                  <div className="pipeline-bar-labels">
                    <span className="pipeline-bar-name">{item.label}</span>
                    <span className="pipeline-bar-count font-bodoni">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="pipeline-bar-track">
                    <div
                      className="pipeline-bar-fill"
                      style={{
                        width: `${Math.max(pct, item.count > 0 ? 4 : 0)}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Opportunity Score Tiers */}
        <div className="glass-card analytics-panel">
          <div className="panel-header">
            <h2 className="panel-title font-bodoni">Opportunity Qualification Tiers</h2>
            <span className="panel-badge">AI Audit</span>
          </div>

          <div className="tiers-list">
            <div className="tier-card hot">
              <div className="tier-card-top">
                <span className="tier-name">Tier 1: High Priority (Score 70-100)</span>
                <span className="tier-count font-bodoni">{tier1Hot}</span>
              </div>
              <p className="tier-desc">
                Businesses with urgent digital transformation requirements (missing website or severely outdated presence with high customer interest).
              </p>
            </div>

            <div className="tier-card warm">
              <div className="tier-card-top">
                <span className="tier-name">Tier 2: Moderate Opportunity (Score 45-69)</span>
                <span className="tier-count font-bodoni">{tier2Warm}</span>
              </div>
              <p className="tier-desc">
                Established businesses with basic website infrastructure that need redesign, mobile optimization, or modern conversion architecture.
              </p>
            </div>

            <div className="tier-card standard">
              <div className="tier-card-top">
                <span className="tier-name">Tier 3: Standard (Score 0-44)</span>
                <span className="tier-count font-bodoni">{tier3Standard}</span>
              </div>
              <p className="tier-desc">
                Competent web presence or low review volume. Secondary priority for automated long-term follow-up.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Items / High-Priority Insights from Server */}
      {dailyActions.length > 0 && (
        <div className="glass-card analytics-panel">
          <div className="panel-header">
            <h2 className="panel-title font-bodoni">Recommended High-Priority Actions</h2>
            <span className="panel-badge">Next Steps</span>
          </div>
          <div className="action-items-list">
            {dailyActions.slice(0, 4).map((action) => (
              <div key={action.id} className="action-item-row">
                <div className="action-item-icon">
                  <CheckCircle2 size={16} className="text-emerald" />
                </div>
                <div className="action-item-body">
                  <div className="action-item-title font-bodoni">{action.businessName}</div>
                  <div className="action-item-text">{action.description || action.title}</div>
                </div>
                <div className="action-item-badge">{action.actionType.replace('_', ' ')}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default AnalyticsWorkspace;
