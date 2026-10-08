'use client';

import React from 'react';
import { CrmDashboardMetrics as MetricsType } from '@/types';
import {
  Users,
  CheckCircle2,
  Send,
  MessageSquare,
  Sparkles,
  PhoneCall,
  FileText,
  Trophy,
  XCircle,
  TrendingUp,
} from 'lucide-react';

interface Props {
  metrics: MetricsType | null;
}

export const CrmDashboardMetrics: React.FC<Props> = ({ metrics }) => {
  if (!metrics) {
    return null;
  }

  const items = [
    {
      label: 'Total Leads',
      value: metrics.totalLeads,
      icon: <Users size={18} />,
      color: 'var(--primary-color, #3b82f6)',
      bg: 'rgba(59, 130, 246, 0.1)',
    },
    {
      label: 'Qualified',
      value: metrics.qualified,
      icon: <CheckCircle2 size={18} />,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)',
    },
    {
      label: 'Contacted',
      value: metrics.contacted,
      icon: <Send size={18} />,
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.1)',
    },
    {
      label: 'Replies',
      value: metrics.replies,
      icon: <MessageSquare size={18} />,
      color: '#06b6d4',
      bg: 'rgba(6, 182, 212, 0.1)',
    },
    {
      label: 'Interested',
      value: metrics.interested,
      icon: <Sparkles size={18} />,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)',
    },
    {
      label: 'Calls',
      value: metrics.calls,
      icon: <PhoneCall size={18} />,
      color: '#ec4899',
      bg: 'rgba(236, 72, 153, 0.1)',
    },
    {
      label: 'Proposals',
      value: metrics.proposals,
      icon: <FileText size={18} />,
      color: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.1)',
    },
    {
      label: 'Won',
      value: metrics.won,
      icon: <Trophy size={18} />,
      color: '#22c55e',
      bg: 'rgba(34, 197, 94, 0.15)',
    },
    {
      label: 'Lost',
      value: metrics.lost,
      icon: <XCircle size={18} />,
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.1)',
    },
    {
      label: 'Conversion Rate',
      value: `${metrics.conversionRate}%`,
      icon: <TrendingUp size={18} />,
      color: '#14b8a6',
      bg: 'rgba(20, 184, 166, 0.1)',
    },
  ];

  return (
    <div className="crm-metrics-container" style={{ marginBottom: '24px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>Live Agency Pipeline Metrics</span>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 500,
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
            }}
          >
            Verified Real Data
          </span>
        </h3>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: '10px',
        }}
      >
        {items.map((it, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: 'var(--card-bg, #1e293b)',
              border: '1px solid var(--border-color, #334155)',
              borderRadius: '8px',
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              transition: 'transform 0.15s ease, border-color 0.15s ease',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-secondary, #94a3b8)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {it.label}
              </span>
              <div
                style={{
                  color: it.color,
                  backgroundColor: it.bg,
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {it.icon}
              </div>
            </div>
            <div
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--text-primary, #f8fafc)',
              }}
            >
              {it.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
