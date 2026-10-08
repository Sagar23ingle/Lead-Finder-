'use client';

import React from 'react';
import { BusinessInsights } from '@/types';
import {
  TrendingUp,
  Target,
  MapPin,
  Briefcase,
  Layers,
  MessageCircle,
  Award,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

interface Props {
  insights: BusinessInsights | null;
  isLoading?: boolean;
}

export const BusinessInsightsView: React.FC<Props> = ({ insights, isLoading }) => {
  if (isLoading) {
    return (
      <div
        style={{
          backgroundColor: 'var(--card-bg, #1e293b)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '24px',
          marginBottom: '24px',
          textAlign: 'center',
          color: 'var(--text-secondary)',
        }}
      >
        Calculating business conversion insights from CRM data...
      </div>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--card-bg, #1e293b)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        padding: '20px',
        marginBottom: '24px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              📊 AI Business Insights &amp; Smart Recommendations
            </h3>
            {insights.isPreliminary ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  color: '#f59e0b',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontSize: '0.725rem',
                  fontWeight: 600,
                }}
              >
                <AlertTriangle size={12} />
                <span>Preliminary Data (Sample: {insights.sampleSize})</span>
              </span>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  color: '#22c55e',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontSize: '0.725rem',
                  fontWeight: 600,
                }}
              >
                <CheckCircle size={12} />
                <span>Verified Statistical Insights</span>
              </span>
            )}
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Calculated strictly from real outreach events and client pipeline records. No fabricated data.
          </p>
        </div>
      </div>

      {/* Top 4 Performance Badges */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Briefcase size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Top Converting Niche</div>
            <div style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {insights.bestNiche}
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MapPin size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Top Converting City</div>
            <div style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {insights.bestCity}
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
              color: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Layers size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Best Lead Source</div>
            <div style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {insights.bestLeadSource}
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              backgroundColor: 'rgba(236, 72, 153, 0.15)',
              color: '#ec4899',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MessageCircle size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Best Channel</div>
            <div style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
              {insights.bestOutreachChannel}
            </div>
          </div>
        </div>
      </div>

      {/* Conversion Funnel Rates */}
      <div
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
        }}
      >
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
          Conversion Rates Funnel
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '10px',
          }}
        >
          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Reply Rate</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#06b6d4' }}>
              {insights.replyRate}%
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Meeting/Call Rate</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b' }}>
              {insights.meetingRate}%
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Proposal Rate</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#8b5cf6' }}>
              {insights.proposalRate}%
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Closing Rate</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#22c55e' }}>
              {insights.closingRate}%
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Avg Deal Value</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8' }}>
              {insights.averageDealValue}
            </div>
          </div>
        </div>
      </div>

      {/* AI Pattern Observations & Recommendations Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {/* Left: AI Pattern Observations */}
        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <Sparkles size={16} color="#38bdf8" />
            <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              Real Data Patterns Identified
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {insights.patterns.map((p, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  borderLeft: '3px solid #38bdf8',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  fontSize: '0.82rem',
                  color: 'var(--text-primary)',
                  lineHeight: 1.45,
                }}
              >
                {p}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Smart Recommendations */}
        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <Lightbulb size={16} color="#f59e0b" />
            <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              Actionable Growth Recommendations
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
            <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: '8px 12px', borderRadius: '4px' }}>
              <span style={{ color: '#f59e0b', fontWeight: 600 }}>Target Next: </span>
              <span style={{ color: 'var(--text-primary)' }}>
                {insights.recommendations.nicheToTarget} in {insights.recommendations.cityToTarget}
              </span>
            </div>

            <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: '8px 12px', borderRadius: '4px' }}>
              <span style={{ color: '#22c55e', fontWeight: 600 }}>Best Offer to Pitch: </span>
              <span style={{ color: 'var(--text-primary)' }}>
                {insights.recommendations.offerToSell}
              </span>
            </div>

            <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: '8px 12px', borderRadius: '4px' }}>
              <span style={{ color: '#38bdf8', fontWeight: 600 }}>Outreach Tip: </span>
              <span style={{ color: 'var(--text-primary)' }}>
                {insights.recommendations.outreachTips}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
