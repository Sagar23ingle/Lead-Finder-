'use client';

import React, { useState } from 'react';
import { Business, LeadAnalysis, LeadCrmRecord } from '@/types';
import {
  FileSpreadsheet,
  Download,
  Copy,
  ExternalLink,
  Check,
  X,
  FileText,
  Sparkles,
  Info,
} from 'lucide-react';
import { downloadLeadsForExcel, copyForGoogleSheets } from '@/lib/utils/exportLeads';

interface ExportLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  businesses: Business[];
  analyses: Record<string, LeadAnalysis>;
  crmRecords?: Record<string, LeadCrmRecord>;
  nicheTitle?: string;
  cityTitle?: string;
}

export const ExportLeadsModal: React.FC<ExportLeadsModalProps> = ({
  isOpen,
  onClose,
  businesses,
  analyses,
  crmRecords = {},
  nicheTitle,
  cityTitle,
}) => {
  const [copiedSheets, setCopiedSheets] = useState(false);
  const [downloadedExcel, setDownloadedExcel] = useState(false);

  if (!isOpen) return null;

  const count = businesses.length;
  const filenamePrefix = [nicheTitle, cityTitle]
    .filter(Boolean)
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') || 'leads-export';

  const handleDownloadExcel = () => {
    downloadLeadsForExcel(businesses, analyses, crmRecords, filenamePrefix);
    setDownloadedExcel(true);
    setTimeout(() => setDownloadedExcel(false), 3000);
  };

  const handleCopyForSheets = async () => {
    const res = await copyForGoogleSheets(businesses, analyses, crmRecords);
    if (res.success) {
      setCopiedSheets(true);
      setTimeout(() => setCopiedSheets(false), 3500);
    }
  };

  const handleOpenSheetsNew = () => {
    window.open('https://sheets.new', '_blank');
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-container"
        style={{ maxWidth: '560px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
              }}
            >
              <FileSpreadsheet size={18} />
            </div>
            <div>
              <h3 className="modal-title font-bodoni">
                Export Leads to Spreadsheet
              </h3>
              <p className="modal-subtitle">
                Exporting {count} verified business leads with AI opportunity audits
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="modal-close-btn"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="modal-body">
          {/* Option 1: Microsoft Excel */}
          <div
            style={{
              padding: '1.2rem',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>📗</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#f8fafc' }}>
                    Microsoft Excel (.CSV / .XLSX)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Includes UTF-8 BOM, text phone formatting, and all 20 audit columns
                  </div>
                </div>
              </div>

              <button
                onClick={handleDownloadExcel}
                type="button"
                style={{
                  backgroundColor: downloadedExcel ? '#059669' : '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'background-color 0.2s ease',
                }}
              >
                {downloadedExcel ? <Check size={14} /> : <Download size={14} />}
                <span>{downloadedExcel ? 'Downloaded!' : 'Download CSV'}</span>
              </button>
            </div>
          </div>

          {/* Option 2: Google Sheets */}
          <div
            style={{
              padding: '1.2rem',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>📊</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#f8fafc' }}>
                    Google Sheets (Instant Paste)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Copies Tab-Separated data to clipboard for instant Ctrl+V into any Sheet
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleCopyForSheets}
                  type="button"
                  style={{
                    backgroundColor: copiedSheets ? '#0284c7' : '#0ea5e9',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  {copiedSheets ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedSheets ? 'Copied!' : 'Copy for Sheets'}</span>
                </button>

                <button
                  onClick={handleOpenSheetsNew}
                  type="button"
                  title="Open a blank spreadsheet at sheets.new"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: '#cbd5e1',
                    border: '1px solid #475569',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>New Sheet</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>

            {copiedSheets && (
              <div
                style={{
                  fontSize: '0.76rem',
                  color: '#38bdf8',
                  backgroundColor: 'rgba(14, 165, 233, 0.1)',
                  padding: '6px 10px',
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Check size={12} />
                <span>
                  {count} leads copied! Open your Google Sheet and press <strong>Ctrl+V</strong> (or <strong>Cmd+V</strong>) to paste.
                </span>
              </div>
            )}
          </div>

          {/* Columns Preview Info */}
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              fontSize: '0.76rem',
              color: '#94a3b8',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#cbd5e1', fontWeight: 600 }}>
              <Info size={13} />
              <span>Included Columns (20 Fields):</span>
            </div>
            <div>
              Business Name, Category, Phone, WhatsApp Direct Link, Address, City, Country, Website, Rating,
              Reviews, Status, Google Maps URL, Opportunity Level, Urgency Score, Pitch Angle, Pain Points,
              Pitch Hook, Deal Value, Assigned Demo Link, Pipeline Stage.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            type="button"
            className="btn-secondary"
            style={{ padding: '7px 18px', fontSize: '0.825rem' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
