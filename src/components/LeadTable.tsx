'use client';

import React, { useState, useEffect } from 'react';
import { Business, LeadAnalysis, LeadCrmRecord } from '@/types';
import {
  ExternalLink,
  MapPin,
  Phone,
  Star,
  Building2,
  SearchX,
  Sparkles,
  Flame,
  Eye,
  Send,
  MessageCircle,
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { normalizeWhatsAppNumber, formatDisplayPhone } from '@/lib/utils/phone';
import { downloadLeadsForExcel, copyForGoogleSheets } from '@/lib/utils/exportLeads';
import { buildDemoPath } from '@/lib/utils/demoUrl';

const ExportLeadsModal = dynamic(
  () => import('./ExportLeadsModal').then((mod) => mod.ExportLeadsModal),
  { ssr: false }
);

interface LeadTableProps {
  businesses: Business[];
  analyses: Record<string, LeadAnalysis>;
  crmRecords?: Record<string, LeadCrmRecord>;
  isLoading: boolean;
  searchAttempted: boolean;
  leadsFound: number;
  leadsRequested: number;
  onSelectLead: (business: Business) => void;
  onOpenOutreach?: (business: Business) => void;
  onAnalyzeAll: () => void;
  isBatchAnalyzing: boolean;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  businesses,
  analyses,
  crmRecords = {},
  isLoading,
  searchAttempted,
  leadsFound,
  leadsRequested,
  onSelectLead,
  onOpenOutreach,
  onAnalyzeAll,
  isBatchAnalyzing,
}) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [quickCopiedSheets, setQuickCopiedSheets] = useState(false);
  const [quickDownloadedExcel, setQuickDownloadedExcel] = useState(false);

  // Pagination state (25 leads per page by default)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;
  const totalPages = Math.max(1, Math.ceil(businesses.length / pageSize));

  // Reset page when dataset changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [businesses.length, totalPages, currentPage]);

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedBusinesses = businesses.slice(startIndex, startIndex + pageSize);

  if (isLoading) {
    return (
      <div className="table-wrapper" style={{ overflow: 'hidden' }}>
        <div className="skeleton-loading-banner">
          <div
            className="spinner"
            style={{
              width: '20px',
              height: '20px',
              borderWidth: '2.5px',
              borderColor: 'var(--primary)',
              borderTopColor: 'transparent',
              flexShrink: 0,
            }}
          />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
              Discovering real leads via Google Places API...
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
              Fetching verified business information, phone numbers, websites, and review data.
            </div>
          </div>
        </div>

        <div className="skeleton-list">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="skeleton-item">
              <div className="skeleton-line" style={{ width: '30%', height: '16px' }} />
              <div className="skeleton-line" style={{ width: '18%', height: '14px' }} />
              <div className="skeleton-line" style={{ width: '22%', height: '14px' }} />
              <div className="skeleton-line" style={{ width: '12%', height: '14px' }} />
              <div className="skeleton-line" style={{ width: '10%', height: '26px', borderRadius: '4px' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (searchAttempted && businesses.length === 0) {
    return (
      <div className="table-wrapper">
        <div className="empty-state">
          <SearchX className="empty-icon" />
          <div className="empty-title">0 Matching Businesses Found</div>
          <p className="empty-desc">
            The API returned no registered businesses for this specific niche and location.
            Try broadening the business niche or searching a larger nearby city.
          </p>
        </div>
      </div>
    );
  }

  if (!searchAttempted && businesses.length === 0) {
    return (
      <div className="table-wrapper">
        <div className="empty-state">
          <Building2 className="empty-icon" />
          <div className="empty-title">Ready for Lead Discovery</div>
          <p className="empty-desc">
            Select a country, city, and business niche above, then click search to discover authentic business leads.
          </p>
        </div>
      </div>
    );
  }

  const unanalyzedCount = businesses.filter(
    (b) => !analyses[b.id] && !analyses[b.external_id]
  ).length;

  return (
    <div className="table-wrapper">
      {/* Batch Analysis & Export Toolbar */}
      <div
        style={{
          padding: '0.75rem 1rem',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          borderBottom: '1px solid var(--border-glass)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.65rem',
        }}
      >
        <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}>
          Lead Pipeline ({businesses.length} total)
          {businesses.length > pageSize && (
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 400, marginLeft: '6px' }}>
              • Showing {startIndex + 1}–{Math.min(startIndex + pageSize, businesses.length)}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          {unanalyzedCount > 0 && (
            <button
              onClick={onAnalyzeAll}
              disabled={isBatchAnalyzing}
              type="button"
              style={{
                backgroundColor: 'rgba(37, 99, 235, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                color: '#60a5fa',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: isBatchAnalyzing ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                minHeight: '34px',
              }}
            >
              <Sparkles size={12} />
              <span>
                {isBatchAnalyzing
                  ? 'Auditing Leads...'
                  : `Run AI Audit on All (${unanalyzedCount})`}
              </span>
            </button>
          )}

          {businesses.length > 0 && (
            <>
              {/* Quick Excel Download */}
              <button
                onClick={() => {
                  downloadLeadsForExcel(businesses, analyses, crmRecords);
                  setQuickDownloadedExcel(true);
                  setTimeout(() => setQuickDownloadedExcel(false), 2500);
                }}
                type="button"
                title="Download leads as Excel-compatible CSV with UTF-8 BOM"
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: '#34d399',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  minHeight: '34px',
                }}
              >
                {quickDownloadedExcel ? <Check size={12} /> : <FileSpreadsheet size={12} />}
                <span>{quickDownloadedExcel ? 'Excel Saved' : 'Excel (.csv)'}</span>
              </button>

              {/* Quick Google Sheets Copy */}
              <button
                onClick={async () => {
                  const res = await copyForGoogleSheets(businesses, analyses, crmRecords);
                  if (res.success) {
                    setQuickCopiedSheets(true);
                    setTimeout(() => setQuickCopiedSheets(false), 2500);
                  }
                }}
                type="button"
                title="Copy formatted leads for Google Sheets"
                style={{
                  backgroundColor: 'rgba(14, 165, 233, 0.12)',
                  border: '1px solid rgba(14, 165, 233, 0.35)',
                  color: '#38bdf8',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  minHeight: '34px',
                }}
              >
                {quickCopiedSheets ? <Check size={12} /> : <Copy size={12} />}
                <span>{quickCopiedSheets ? 'Copied!' : 'Sheets'}</span>
              </button>

              {/* Export Modal Dialog Trigger */}
              <button
                onClick={() => setIsExportModalOpen(true)}
                type="button"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#cbd5e1',
                  padding: '6px 9px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  minHeight: '34px',
                }}
              >
                <Download size={12} />
                <span>Export</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Desktop Compact Table View (>= 768px) */}
      <div className="desktop-table-container">
        <table className="leads-table">
          <thead>
            <tr>
              <th style={{ width: '22%' }}>Business</th>
              <th style={{ width: '13%' }}>Category</th>
              <th style={{ width: '15%' }}>Location</th>
              <th style={{ width: '9%' }}>Rating</th>
              <th style={{ width: '9%' }}>Website</th>
              <th style={{ width: '13%' }}>AI Opportunity</th>
              <th style={{ width: '7%' }}>CRM</th>
              <th style={{ width: '12%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBusinesses.map((business) => {
              const analysis = analyses[business.id] || analyses[business.external_id];
              const crmRecord = crmRecords[business.id || business.external_id];

              return (
                <tr key={business.external_id || business.id}>
                  {/* Business Name & Google Maps Link */}
                  <td>
                    <div className="business-cell-name">
                      <button
                        onClick={() => onSelectLead(business)}
                        type="button"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'inherit',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          textAlign: 'left',
                          padding: 0,
                          lineHeight: 1.3,
                        }}
                        title="Open AI Analysis & Opportunity Report"
                      >
                        {business.name}
                      </button>
                      {business.google_maps_url && (
                        <a
                          href={business.google_maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View on Google Maps"
                          style={{ color: 'var(--text-muted)', display: 'inline-flex' }}
                        >
                          <MapPin size={13} />
                        </a>
                      )}
                    </div>
                    {business.opening_status && (
                      <div className="business-sub">
                        <span
                          style={{
                            color: business.opening_status.includes('Open')
                              ? 'var(--accent-emerald)'
                              : 'var(--accent-rose)',
                          }}
                        >
                          ● {business.opening_status}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Category */}
                  <td>
                    <span className="category-tag">{business.category || 'General'}</span>
                  </td>

                  {/* Location */}
                  <td>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {business.city || 'Local Area'}
                    </div>
                  </td>

                  {/* Rating & Reviews */}
                  <td>
                    {business.rating ? (
                      <span className="rating-badge">
                        <Star size={12} fill="currentColor" />
                        <span>{business.rating.toFixed(1)}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          ({business.review_count || 0})
                        </span>
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Unrated</span>
                    )}
                  </td>

                  {/* Website */}
                  <td>
                    {business.website ? (
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-website"
                        title={business.website}
                        style={{ fontSize: '0.8rem' }}
                      >
                        <span>Website</span>
                        <ExternalLink size={11} />
                      </a>
                    ) : (
                      <span className="badge-no-website">No Website</span>
                    )}
                  </td>

                  {/* AI Opportunity Score */}
                  <td>
                    {analysis ? (
                      <button
                        onClick={() => onSelectLead(business)}
                        type="button"
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <span
                          style={{
                            padding: '2px 7px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            backgroundColor:
                              analysis.tier === 'HOT'
                                ? 'rgba(239, 68, 68, 0.2)'
                                : analysis.tier === 'WARM'
                                ? 'rgba(245, 158, 11, 0.2)'
                                : 'rgba(100, 116, 139, 0.2)',
                            color:
                              analysis.tier === 'HOT'
                                ? '#f87171'
                                : analysis.tier === 'WARM'
                                ? '#fbbf24'
                                : '#94a3b8',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          {analysis.tier === 'HOT' && <Flame size={10} />}
                          <span>{analysis.tier}</span>
                        </span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f8fafc' }}>
                          {analysis.score}/100
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onSelectLead(business)}
                        type="button"
                        style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          color: '#60a5fa',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        <Sparkles size={10} />
                        <span>Audit</span>
                      </button>
                    )}
                  </td>

                  {/* CRM Stage */}
                  <td>
                    {crmRecord ? (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '2px 5px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(139, 92, 246, 0.15)',
                          color: '#a78bfa',
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                          textTransform: 'uppercase',
                        }}
                      >
                        {crmRecord.stage}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>NEW</span>
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {/* Audit */}
                      <button
                        onClick={() => onSelectLead(business)}
                        type="button"
                        style={{
                          padding: '3px 7px',
                          borderRadius: '4px',
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          color: '#f8fafc',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                        title="View opportunity audit"
                      >
                        Audit
                      </button>

                      {/* Demo */}
                      <Link
                        href={buildDemoPath(business)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '3px 7px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(37, 99, 235, 0.2)',
                          border: '1px solid rgba(59, 130, 246, 0.35)',
                          color: '#60a5fa',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          whiteSpace: 'nowrap',
                        }}
                        title="Open personalized website demo in new tab"
                      >
                        <Eye size={11} />
                        <span>Demo</span>
                      </Link>

                      {/* Outreach */}
                      {onOpenOutreach && (
                        <button
                          onClick={() => onOpenOutreach(business)}
                          type="button"
                          style={{
                            padding: '3px 6px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(139, 92, 246, 0.2)',
                            border: '1px solid rgba(139, 92, 246, 0.35)',
                            color: '#c4b5fd',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                          }}
                          title="Open Outreach Center"
                        >
                          <Send size={11} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Compact Cards View (< 768px) */}
      <div className="mobile-cards-container">
        {paginatedBusinesses.map((business) => {
          const analysis = analyses[business.id] || analyses[business.external_id];
          const crmRecord = crmRecords[business.id || business.external_id];
          const cleanPhone = business.phone ? normalizeWhatsAppNumber(business.phone) : null;
          const displayPhone = business.phone ? formatDisplayPhone(business.phone) : null;

          return (
            <div key={business.external_id || business.id} className="mobile-lead-card">
              {/* Header: Title, Rating, and Map Pin */}
              <div className="mobile-card-title-row">
                <button
                  onClick={() => onSelectLead(business)}
                  type="button"
                  className="mobile-card-title-btn"
                  title="View AI Analysis & Opportunity Report"
                >
                  {business.name}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  {business.rating ? (
                    <span className="rating-badge" style={{ fontSize: '0.8rem' }}>
                      <Star size={11} fill="currentColor" />
                      <span>{business.rating.toFixed(1)}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>
                        ({business.review_count || 0})
                      </span>
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Unrated</span>
                  )}

                  {business.google_maps_url && (
                    <a
                      href={business.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mobile-card-map-btn"
                      title="Open Google Maps"
                      aria-label="View on Google Maps"
                    >
                      <MapPin size={14} />
                    </a>
                  )}
                </div>
              </div>

              {/* Meta row: Category, City, Opening Status */}
              <div className="mobile-card-badges-row">
                <span className="category-tag">{business.category || 'Business'}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {business.city || 'Local Area'}
                </span>

                {business.opening_status && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: business.opening_status.includes('Open')
                        ? 'var(--accent-emerald)'
                        : 'var(--accent-rose)',
                    }}
                  >
                    ● {business.opening_status}
                  </span>
                )}
              </div>

              {/* Status Row: Score & Qualification Tier, CRM Stage, Website Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                {analysis ? (
                  <button
                    onClick={() => onSelectLead(business)}
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: '4px',
                        backgroundColor:
                          analysis.tier === 'HOT'
                            ? 'rgba(239, 68, 68, 0.2)'
                            : analysis.tier === 'WARM'
                            ? 'rgba(245, 158, 11, 0.2)'
                            : 'rgba(100, 116, 139, 0.2)',
                        color:
                          analysis.tier === 'HOT'
                            ? '#f87171'
                            : analysis.tier === 'WARM'
                            ? '#fbbf24'
                            : '#94a3b8',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      {analysis.tier === 'HOT' && <Flame size={10} />}
                      <span>{analysis.tier} • {analysis.score}/100</span>
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => onSelectLead(business)}
                    type="button"
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      color: '#60a5fa',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    <Sparkles size={10} />
                    <span>Audit Pending</span>
                  </button>
                )}

                {crmRecord ? (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(139, 92, 246, 0.15)',
                      color: '#a78bfa',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {crmRecord.stage}
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>STAGE: NEW</span>
                )}

                {business.website ? (
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-website"
                    style={{ fontSize: '0.74rem' }}
                    title={business.website}
                  >
                    <span>Website</span>
                    <ExternalLink size={10} />
                  </a>
                ) : (
                  <span className="badge-no-website" style={{ fontSize: '0.68rem', padding: '1px 5px' }}>
                    No Website
                  </span>
                )}
              </div>

              {/* Verified Phone Row if Available */}
              {displayPhone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  <Phone size={12} className="text-cyan" />
                  <a href={`tel:${business.phone}`} style={{ color: '#93c5fd', textDecoration: 'none', fontWeight: 500 }}>
                    {displayPhone}
                  </a>
                </div>
              )}

              {/* Action Buttons Row */}
              <div className="mobile-card-actions">
                {/* Audit Button */}
                <button
                  onClick={() => onSelectLead(business)}
                  type="button"
                  className="mobile-action-btn audit"
                  title="View full AI audit and opportunity score"
                >
                  <Sparkles size={12} className="text-amber" />
                  <span>Audit</span>
                </button>

                {/* Website Demo Preview Button */}
                <Link
                  href={buildDemoPath(business)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mobile-action-btn demo"
                  title="View personalized client website demo"
                >
                  <Eye size={12} />
                  <span>Demo</span>
                </Link>

                {/* Outreach / Pitch Button */}
                {onOpenOutreach && (
                  <button
                    onClick={() => onOpenOutreach(business)}
                    type="button"
                    className="mobile-action-btn"
                    style={{
                      backgroundColor: 'rgba(139, 92, 246, 0.2)',
                      border: '1px solid rgba(139, 92, 246, 0.4)',
                      color: '#c4b5fd',
                    }}
                    title="Open Outreach Center to pitch client"
                  >
                    <Send size={12} />
                    <span>Pitch</span>
                  </button>
                )}

                {/* WhatsApp One-Click Action */}
                {cleanPhone && (
                  <a
                    href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                      `Hi ${business.name}, I came across your Google business profile in ${business.city || 'your area'}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mobile-action-btn"
                    style={{
                      backgroundColor: 'rgba(34, 197, 94, 0.15)',
                      border: '1px solid rgba(34, 197, 94, 0.35)',
                      color: '#4ade80',
                    }}
                    title="Send WhatsApp message"
                  >
                    <MessageCircle size={12} />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ====================================================================
          PAGINATION BAR (Controls vertical length whether 10, 30, 100 or 500 leads)
          ==================================================================== */}
      {totalPages > 1 && (
        <div
          style={{
            padding: '10px 18px',
            backgroundColor: 'rgba(12, 16, 26, 0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderTop: '1px solid var(--border-glass)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing <strong style={{ color: '#fff' }}>{startIndex + 1}</strong>–<strong style={{ color: '#fff' }}>{Math.min(startIndex + pageSize, businesses.length)}</strong> of{' '}
            <strong style={{ color: '#fff' }}>{businesses.length}</strong> leads
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-glass)',
                color: currentPage === 1 ? 'var(--text-dim)' : 'var(--text-primary)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <ChevronLeft size={13} />
              <span>Prev</span>
            </button>

            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', padding: '0 6px' }}>
              Page <strong style={{ color: '#fff' }}>{currentPage}</strong> of <strong style={{ color: '#fff' }}>{totalPages}</strong>
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-glass)',
                color: currentPage === totalPages ? 'var(--text-dim)' : 'var(--text-primary)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span>Next</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Export Leads Modal */}
      <ExportLeadsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        businesses={businesses}
        analyses={analyses}
        crmRecords={crmRecords}
      />
    </div>
  );
};
