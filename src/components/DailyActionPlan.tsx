'use client';

import React, { useState } from 'react';
import { DailyActionItem } from '@/types';
import {
  Flame,
  Clock,
  MessageSquare,
  Globe,
  FileText,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Filter,
} from 'lucide-react';

interface Props {
  actions: DailyActionItem[];
  onSelectLead: (businessId: string) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const DailyActionPlan: React.FC<Props> = ({
  actions,
  onSelectLead,
  isLoading = false,
  onRefresh,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filteredActions =
    filterType === 'all'
      ? actions
      : actions.filter((a) => a.actionType === filterType);

  const getActionBadge = (type: DailyActionItem['actionType']) => {
    switch (type) {
      case 'contact_hot_lead':
        return {
          icon: <Flame size={14} />,
          label: 'Contact HOT Lead',
          color: '#ef4444',
          bg: 'rgba(239, 68, 68, 0.15)',
        };
      case 'followup_due':
        return {
          icon: <Clock size={14} />,
          label: 'Follow-Up Due Today',
          color: '#f59e0b',
          bg: 'rgba(245, 158, 11, 0.15)',
        };
      case 'reply_needed':
        return {
          icon: <MessageSquare size={14} />,
          label: 'Reply Needs Response',
          color: '#06b6d4',
          bg: 'rgba(6, 182, 212, 0.15)',
        };
      case 'send_demo':
        return {
          icon: <Globe size={14} />,
          label: 'Send Website Demo',
          color: '#3b82f6',
          bg: 'rgba(59, 130, 246, 0.15)',
        };
      case 'proposal_followup':
        return {
          icon: <FileText size={14} />,
          label: 'Proposal Follow-Up',
          color: '#8b5cf6',
          bg: 'rgba(139, 92, 246, 0.15)',
        };
      default:
        return {
          icon: <AlertCircle size={14} />,
          label: 'Action Required',
          color: '#94a3b8',
          bg: 'rgba(148, 163, 184, 0.15)',
        };
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--card-bg, #1e293b)',
        border: '1px solid var(--border-color, #334155)',
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
              ⚡ Today&apos;s Actions
            </h3>
            <span
              style={{
                backgroundColor: actions.length > 0 ? '#ef4444' : '#22c55e',
                color: '#ffffff',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              {actions.length} {actions.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            High-probability client conversion tasks sorted by opportunity score and priority.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.78rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
              <span>Refresh Actions</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips */}
      {actions.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
          {[
            { id: 'all', label: `All (${actions.length})` },
            {
              id: 'contact_hot_lead',
              label: `HOT Leads (${actions.filter((a) => a.actionType === 'contact_hot_lead').length})`,
            },
            {
              id: 'reply_needed',
              label: `Replies (${actions.filter((a) => a.actionType === 'reply_needed').length})`,
            },
            {
              id: 'followup_due',
              label: `Follow-Ups (${actions.filter((a) => a.actionType === 'followup_due').length})`,
            },
            {
              id: 'send_demo',
              label: `Demos (${actions.filter((a) => a.actionType === 'send_demo').length})`,
            },
            {
              id: 'proposal_followup',
              label: `Proposals (${actions.filter((a) => a.actionType === 'proposal_followup').length})`,
            },
          ].map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setFilterType(chip.id)}
              style={{
                backgroundColor:
                  filterType === chip.id ? '#3b82f6' : 'rgba(15, 23, 42, 0.6)',
                color: filterType === chip.id ? '#ffffff' : 'var(--text-secondary)',
                border:
                  filterType === chip.id
                    ? '1px solid #3b82f6'
                    : '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: filterType === chip.id ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Action Items List */}
      {filteredActions.length === 0 ? (
        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            border: '1px dashed var(--border-color)',
            borderRadius: '8px',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
            All Caught Up for Today!
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            No pending tasks in this category. Search for more businesses to discover new HOT leads.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredActions.map((item) => {
            const badge = getActionBadge(item.actionType);

            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.7)',
                  border:
                    item.priority === 'high'
                      ? '1px solid rgba(239, 68, 68, 0.4)'
                      : '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  transition: 'border-color 0.15s ease',
                }}
              >
                {/* Left: Info & Badges */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '240px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '0.725rem',
                        fontWeight: 700,
                        backgroundColor: badge.bg,
                        color: badge.color,
                      }}
                    >
                      {badge.icon}
                      <span>{badge.label}</span>
                    </span>

                    <span
                      style={{
                        fontSize: '0.725rem',
                        fontWeight: 600,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor:
                          item.tier === 'HOT'
                            ? 'rgba(239, 68, 68, 0.15)'
                            : 'rgba(245, 158, 11, 0.15)',
                        color: item.tier === 'HOT' ? '#ef4444' : '#f59e0b',
                      }}
                    >
                      {item.score}/100 • {item.tier}
                    </span>

                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {item.businessName}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {item.niche} • {item.city}
                  </div>

                  <div style={{ fontSize: '0.825rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                    {item.description}
                  </div>
                </div>

                {/* Right: 1-Click Action Button */}
                <div>
                  <button
                    type="button"
                    onClick={() => onSelectLead(item.businessId)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor:
                        item.actionType === 'contact_hot_lead'
                          ? '#ef4444'
                          : item.actionType === 'reply_needed'
                          ? '#06b6d4'
                          : item.actionType === 'send_demo'
                          ? '#3b82f6'
                          : '#8b5cf6',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 14px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span>Take Action</span>
                    <ArrowRight size={14} />
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
