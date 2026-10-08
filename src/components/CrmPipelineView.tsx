'use client';

import React, { useState } from 'react';
import { Business, LeadAnalysis, LeadCrmRecord, PipelineStage } from '@/types';
import {
  Send,
  MessageSquare,
  Sparkles,
  PhoneCall,
  FileText,
  Trophy,
  XCircle,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Search,
  Eye,
  FileSpreadsheet,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { formatDisplayPhone } from '@/lib/utils/phone';
import { downloadLeadsForExcel, copyForGoogleSheets } from '@/lib/utils/exportLeads';
import { ExportLeadsModal } from './ExportLeadsModal';

interface Props {
  businesses: Business[];
  crmRecords: Record<string, LeadCrmRecord>;
  analyses: Record<string, LeadAnalysis>;
  onOpenOutreach: (business: Business) => void;
  onUpdateStage: (businessId: string, newStage: PipelineStage) => Promise<void>;
}

const STAGES: { stage: PipelineStage; label: string; icon: React.ReactNode; color: string }[] = [
  { stage: 'NEW', label: 'New', icon: <HelpCircle size={14} />, color: '#64748b' },
  { stage: 'QUALIFIED', label: 'Qualified', icon: <Sparkles size={14} />, color: '#0ea5e9' },
  { stage: 'CONTACTED', label: 'Contacted', icon: <Send size={14} />, color: '#8b5cf6' },
  { stage: 'REPLIED', label: 'Replied', icon: <MessageSquare size={14} />, color: '#06b6d4' },
  { stage: 'INTERESTED', label: 'Interested', icon: <Sparkles size={14} />, color: '#f59e0b' },
  { stage: 'NOT_INTERESTED', label: 'Not Interested', icon: <XCircle size={14} />, color: '#94a3b8' },
  { stage: 'CALL', label: 'Call Booked', icon: <PhoneCall size={14} />, color: '#ec4899' },
  { stage: 'PROPOSAL', label: 'Proposal', icon: <FileText size={14} />, color: '#6366f1' },
  { stage: 'WON', label: 'Won', icon: <Trophy size={14} />, color: '#22c55e' },
  { stage: 'LOST', label: 'Lost', icon: <XCircle size={14} />, color: '#ef4444' },
];

export const CrmPipelineView: React.FC<Props> = ({
  businesses,
  crmRecords,
  analyses,
  onOpenOutreach,
  onUpdateStage,
}) => {
  const [pipelineFilter, setPipelineFilter] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [copiedSheets, setCopiedSheets] = useState(false);
  const [downloadedExcel, setDownloadedExcel] = useState(false);

  // Group businesses by stage
  const grouped: Record<PipelineStage, Business[]> = {
    NEW: [],
    QUALIFIED: [],
    CONTACTED: [],
    REPLIED: [],
    INTERESTED: [],
    NOT_INTERESTED: [],
    CALL: [],
    PROPOSAL: [],
    WON: [],
    LOST: [],
  };

  for (const b of businesses) {
    if (pipelineFilter.trim()) {
      const q = pipelineFilter.toLowerCase();
      const match =
        b.name.toLowerCase().includes(q) ||
        (b.city && b.city.toLowerCase().includes(q)) ||
        (b.category && b.category.toLowerCase().includes(q));
      if (!match) continue;
    }

    const crm = crmRecords[b.id] || crmRecords[b.external_id];
    const stage: PipelineStage = crm?.stage || 'NEW';
    if (grouped[stage]) {
      grouped[stage].push(b);
    } else {
      grouped.NEW.push(b);
    }
  }

  const getAdjacentStage = (currentStage: PipelineStage, direction: 'next' | 'prev'): PipelineStage | null => {
    const stageOrder: PipelineStage[] = [
      'NEW',
      'QUALIFIED',
      'CONTACTED',
      'REPLIED',
      'INTERESTED',
      'CALL',
      'PROPOSAL',
      'WON',
    ];
    const idx = stageOrder.indexOf(currentStage);
    if (idx === -1) return null;
    if (direction === 'next' && idx < stageOrder.length - 1) {
      return stageOrder[idx + 1];
    }
    if (direction === 'prev' && idx > 0) {
      return stageOrder[idx - 1];
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Pipeline Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Agency Sales Pipeline Kanban
          </h3>
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              backgroundColor: 'rgba(30, 41, 59, 0.6)',
              padding: '2px 8px',
              borderRadius: '12px',
            }}
          >
            {businesses.length} Total Leads Tracked
          </span>
        </div>

        {/* Search inside pipeline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)',
              }}
            />
            <input
              type="text"
              placeholder="Search leads in pipeline..."
              value={pipelineFilter}
              onChange={(e) => setPipelineFilter(e.target.value)}
              style={{
                padding: '6px 10px 6px 30px',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                width: '210px',
              }}
            />
          </div>

          {businesses.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={() => {
                  downloadLeadsForExcel(businesses, analyses, crmRecords, 'crm-pipeline-leads');
                  setDownloadedExcel(true);
                  setTimeout(() => setDownloadedExcel(false), 2500);
                }}
                title="Download CRM pipeline leads for Excel (.csv)"
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: '#34d399',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                {downloadedExcel ? <Check size={13} /> : <FileSpreadsheet size={13} />}
                <span>{downloadedExcel ? 'Excel Saved!' : 'Excel (.csv)'}</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  const res = await copyForGoogleSheets(businesses, analyses, crmRecords);
                  if (res.success) {
                    setCopiedSheets(true);
                    setTimeout(() => setCopiedSheets(false), 2500);
                  }
                }}
                title="Copy CRM leads for Google Sheets (Ctrl+V)"
                style={{
                  backgroundColor: 'rgba(14, 165, 233, 0.12)',
                  border: '1px solid rgba(14, 165, 233, 0.35)',
                  color: '#38bdf8',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                {copiedSheets ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedSheets ? 'Copied!' : 'Google Sheets'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Columns Container (Horizontal Scroll) */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          paddingBottom: '16px',
        }}
      >
        {STAGES.map((s) => {
          const list = grouped[s.stage] || [];

          return (
            <div
              key={s.stage}
              style={{
                flex: '0 0 260px',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '75vh',
              }}
            >
              {/* Column Header */}
              <div
                style={{
                  padding: '10px 14px',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  borderTop: `3px solid ${s.color}`,
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: s.color }}>{s.icon}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {s.label}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    color: s.color,
                  }}
                >
                  {list.length}
                </span>
              </div>

              {/* Column Cards List */}
              <div
                style={{
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  overflowY: 'auto',
                  flex: 1,
                }}
              >
                {list.length === 0 ? (
                  <div
                    style={{
                      padding: '24px 10px',
                      textAlign: 'center',
                      color: 'var(--text-secondary)',
                      fontSize: '0.78rem',
                      fontStyle: 'italic',
                    }}
                  >
                    No leads in {s.label}
                  </div>
                ) : (
                  list.map((b) => {
                    const analysis = analyses[b.id] || analyses[b.external_id];
                    const crm = crmRecords[b.id] || crmRecords[b.external_id];
                    const nextStage = getAdjacentStage(s.stage, 'next');
                    const prevStage = getAdjacentStage(s.stage, 'prev');

                    return (
                      <div
                        key={b.id || b.external_id}
                        style={{
                          backgroundColor: 'var(--card-bg, #1e293b)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          padding: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h4
                            style={{
                              margin: 0,
                              fontSize: '0.88rem',
                              fontWeight: 600,
                              color: 'var(--text-primary)',
                              lineHeight: 1.25,
                            }}
                          >
                            {b.name}
                          </h4>
                          {analysis && (
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                padding: '1px 5px',
                                borderRadius: '4px',
                                backgroundColor:
                                  analysis.tier === 'HOT'
                                    ? 'rgba(239, 68, 68, 0.2)'
                                    : analysis.tier === 'WARM'
                                    ? 'rgba(245, 158, 11, 0.2)'
                                    : 'rgba(100, 116, 139, 0.2)',
                                color:
                                  analysis.tier === 'HOT'
                                    ? '#ef4444'
                                    : analysis.tier === 'WARM'
                                    ? '#f59e0b'
                                    : '#94a3b8',
                              }}
                            >
                              {analysis.score} pts
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                          <div>{b.category} • {b.city || 'India'}</div>
                          <div>
                            {b.review_count} reviews ({b.rating || 0}★)
                          </div>
                          {(crm?.contactPhone || b.phone) && (
                            <div style={{ color: '#34d399', fontWeight: 500 }}>
                              📞 {formatDisplayPhone(crm?.contactPhone || b.phone)}
                            </div>
                          )}
                        </div>

                        {/* Quick action buttons */}
                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                          <button
                            type="button"
                            onClick={() => onOpenOutreach(b)}
                            className="btn-primary"
                            style={{
                              flex: 1,
                              padding: '5px 8px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                            }}
                          >
                            <Send size={12} />
                            <span>Outreach</span>
                          </button>

                          <Link
                            href={`/demo/${b.id || b.external_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: '5px 8px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(37, 99, 235, 0.15)',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              color: '#60a5fa',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                              textDecoration: 'none',
                            }}
                            title="Open interactive website demo"
                          >
                            <Eye size={12} />
                            <span>Demo</span>
                          </Link>
                        </div>

                        {/* Move stage controls */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderTop: '1px solid var(--border-color)',
                            paddingTop: '6px',
                            marginTop: '2px',
                          }}
                        >
                          {prevStage ? (
                            <button
                              type="button"
                              onClick={() => onUpdateStage(b.id || b.external_id, prevStage)}
                              title={`Move to ${prevStage}`}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                padding: '2px 4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2px',
                                fontSize: '0.7rem',
                              }}
                            >
                              <ChevronLeft size={13} />
                              <span>Back</span>
                            </button>
                          ) : (
                            <div />
                          )}

                          {nextStage && (
                            <button
                              type="button"
                              onClick={() => onUpdateStage(b.id || b.external_id, nextStage)}
                              title={`Advance to ${nextStage}`}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#38bdf8',
                                cursor: 'pointer',
                                padding: '2px 4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2px',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                              }}
                            >
                              <span>Advance</span>
                              <ChevronRight size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Export Modal */}
      <ExportLeadsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        businesses={businesses}
        analyses={analyses}
        crmRecords={crmRecords}
        nicheTitle="crm-pipeline"
      />
    </div>
  );
};
