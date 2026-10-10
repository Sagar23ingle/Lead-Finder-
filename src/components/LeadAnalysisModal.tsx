'use client';

import React, { useState, useEffect } from 'react';
import { Business, LeadAnalysis } from '@/types';
import {
  X,
  Sparkles,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Globe,
  Phone,
  MessageSquare,
  Mail,
  Copy,
  ExternalLink,
  DollarSign,
  Send,
  HelpCircle,
  Clock,
  Share2,
} from 'lucide-react';
import { normalizeWhatsAppNumber, buildWhatsAppUrl } from '@/lib/utils/phone';
import { buildDemoPath, buildDemoUrl } from '@/lib/utils/demoUrl';

interface LeadAnalysisModalProps {
  business: Business;
  analysis: LeadAnalysis | null;
  isLoading: boolean;
  onClose: () => void;
  onAnalyze: (business: Business) => Promise<void>;
}

export const LeadAnalysisModal: React.FC<LeadAnalysisModalProps> = ({
  business,
  analysis,
  isLoading,
  onClose,
  onAnalyze,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'audit' | 'outreach' | 'demo' | 'sales'>('overview');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Escape key closes modal & body scroll lock with scroll position preservation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const prevScrollY = window.scrollY;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
      window.scrollTo(0, prevScrollY);
    };
  }, [onClose]);

  // Sales assistant interactive test
  const [replyInput, setReplyInput] = useState('');
  const [salesReplyAdvice, setSalesReplyAdvice] = useState<any | null>(null);
  const [isAskingAssistant, setIsAskingAssistant] = useState(false);

  const copyText = (text: string, type: string) => {
    if (typeof window !== 'undefined') {
      const demoUrl = buildDemoUrl(business);
      const processed = text.replace(/\[DEMO_LINK\]/g, demoUrl);
      navigator.clipboard.writeText(processed);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    }
  };

  const handleAskSalesAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() || isAskingAssistant) return;
    setIsAskingAssistant(true);
    try {
      const res = await fetch('/api/sales-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id || business.external_id,
          business,
          replyText: replyInput.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSalesReplyAdvice(data);
      }
    } catch (err) {
      console.error('Failed to get sales advice:', err);
    } finally {
      setIsAskingAssistant(false);
    }
  };

  const normalizedPhone = normalizeWhatsAppNumber(business.phone);

  const openWhatsAppDirect = (messageText: string) => {
    if (typeof window === 'undefined') return;
    const demoUrl = buildDemoUrl(business);
    const processed = messageText.replace(/\[DEMO_LINK\]/g, demoUrl);
    const waUrl = buildWhatsAppUrl(business.phone, processed);
    if (waUrl) {
      window.open(waUrl, '_blank');
    } else {
      alert('Valid 10-digit mobile number required to launch direct WhatsApp chat.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-container"
        style={{ maxWidth: '880px', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <h2 className="modal-title font-bodoni">{business.name}</h2>
              {analysis && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
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
                    border: `1px solid ${
                      analysis.tier === 'HOT'
                        ? 'rgba(239, 68, 68, 0.3)'
                        : analysis.tier === 'WARM'
                        ? 'rgba(245, 158, 11, 0.3)'
                        : 'rgba(100, 116, 139, 0.3)'
                    }`,
                  }}
                >
                  {analysis.tier === 'HOT' && <Flame size={12} />}
                  <span>{analysis.tier} PROSPECT • {analysis.score}/100</span>
                </span>
              )}
            </div>
            <div className="modal-subtitle">
              {business.category || 'Local Business'} • {business.city}, {business.country}
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="modal-close-btn"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #1e293b',
            backgroundColor: '#0b1120',
            padding: '0 1.5rem',
            gap: '0.5rem',
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'overview', label: 'Opportunity Overview' },
            { id: 'audit', label: 'Website Audit' },
            { id: 'outreach', label: 'Personalized Outreach' },
            { id: 'demo', label: 'Website Demo Concept' },
            { id: 'sales', label: 'AI Sales Assistant' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              type="button"
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === t.id ? '2px solid #3b82f6' : '2px solid transparent',
                color: activeTab === t.id ? '#60a5fa' : '#94a3b8',
                fontWeight: activeTab === t.id ? 600 : 500,
                fontSize: '0.85rem',
                padding: '0.75rem 0.5rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="modal-body" style={{ overflowY: 'auto', flex: 1 }}>
          {isLoading && !analysis ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <div
                className="spinner"
                style={{
                  width: '36px',
                  height: '36px',
                  margin: '0 auto 1rem',
                  borderColor: '#3b82f6',
                  borderTopColor: 'transparent',
                }}
              />
              <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                Analyzing website, scoring lead opportunity &amp; crafting outreach...
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Performing live HTTP inspection, assessing conversion funnels, and building custom pitch.
              </p>
            </div>
          ) : !analysis ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <Sparkles size={36} color="#3b82f6" style={{ margin: '0 auto 1rem' }} />
              <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>No AI Analysis Generated Yet</div>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '400px', margin: '0.5rem auto 1.5rem' }}>
                Generate a live website audit, 0–100 opportunity score, customized outreach angles, and sales closing plan.
              </p>
              <button
                onClick={() => onAnalyze(business)}
                className="btn-primary"
                type="button"
              >
                <span>Run AI Opportunity Analysis</span>
              </button>
            </div>
          ) : (
            <div>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Score & Reasons Banner */}
                  <div
                    style={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      border: '1px solid #334155',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                        Opportunity Score
                      </div>
                      <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>
                        {analysis.score} <span style={{ fontSize: '1.25rem', color: '#64748b' }}>/ 100</span>
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: '240px' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                        Key Scoring Factors:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {analysis.reasons.map((r, i) => (
                          <div key={i} style={{ fontSize: '0.775rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <CheckCircle2 size={12} color="#10b981" />
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* AI Opportunity Report Cards */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '10px', padding: '1rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase' }}>
                        Primary Bottleneck
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc', marginTop: '0.25rem' }}>
                        {analysis.report.mainProblem}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.4rem', lineHeight: 1.4 }}>
                        {analysis.report.whyItMatters}
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '10px', padding: '1rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase' }}>
                        Recommended Solution
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc', marginTop: '0.25rem' }}>
                        {analysis.report.recommendedService}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.4rem', lineHeight: 1.4 }}>
                        {analysis.report.suggestedOffer}
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '10px', padding: '1rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase' }}>
                        Suggested Price Anchor (AI Estimate)
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.25rem' }}>
                        {analysis.report.suggestedPriceRange}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                        Based on local commercial niche value and expected ROI.
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '10px', padding: '1rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase' }}>
                        Winning Outreach Angle
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#e2e8f0', marginTop: '0.25rem', lineHeight: 1.4 }}>
                        {analysis.report.bestOutreachAngle}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: WEBSITE AUDIT */}
              {activeTab === 'audit' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                      Live HTTP Audit Results
                    </div>
                    {analysis.audit.url && (
                      <a
                        href={analysis.audit.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '0.8rem', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <span>Visit Website</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>

                  {!analysis.audit.hasWebsite ? (
                    <div className="banner warning">
                      <AlertTriangle size={18} />
                      <div>
                        <div className="banner-title">No Website Detected</div>
                        <div>
                          This business has no website registered on Google Maps. Building an official showcase website with a WhatsApp booking funnel is their highest-leverage growth move.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                      <div style={{ backgroundColor: '#111827', padding: '0.75rem', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Status</div>
                        <div style={{ fontWeight: 600, color: analysis.audit.isReachable ? '#34d399' : '#f87171' }}>
                          {analysis.audit.isReachable ? `HTTP ${analysis.audit.httpStatus || 200} Online` : 'Unreachable / Down'}
                        </div>
                      </div>

                      <div style={{ backgroundColor: '#111827', padding: '0.75rem', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Load Latency</div>
                        <div style={{ fontWeight: 600 }}>
                          {analysis.audit.latencyMs ? `${analysis.audit.latencyMs}ms` : 'N/A'}
                        </div>
                      </div>

                      <div style={{ backgroundColor: '#111827', padding: '0.75rem', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Mobile Viewport</div>
                        <div style={{ fontWeight: 600, color: analysis.audit.hasMobileViewport ? '#34d399' : '#f87171' }}>
                          {analysis.audit.hasMobileViewport ? 'Optimized' : 'Missing (Broken on mobile)'}
                        </div>
                      </div>

                      <div style={{ backgroundColor: '#111827', padding: '0.75rem', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>WhatsApp Funnel</div>
                        <div style={{ fontWeight: 600, color: analysis.audit.hasWhatsApp ? '#34d399' : '#fbbf24' }}>
                          {analysis.audit.hasWhatsApp ? 'Active' : 'Missing (No direct chat)'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Issues List */}
                  {analysis.audit.issues.length > 0 && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f87171', marginBottom: '0.4rem' }}>
                        Identified Flaws:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {analysis.audit.issues.map((issue, idx) => (
                          <div key={idx} style={{ fontSize: '0.825rem', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: '#ef4444' }}>✕</span>
                            <span>{issue}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: OUTREACH */}
              {activeTab === 'outreach' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* WhatsApp Message */}
                  <div style={{ backgroundColor: '#111827', borderRadius: '10px', padding: '1.25rem', border: '1px solid #1e293b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#34d399' }}>
                        <MessageSquare size={16} />
                        <span>Personalized WhatsApp Message</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => copyText(analysis.outreach.whatsapp, 'wa')}
                          type="button"
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            backgroundColor: '#1e293b',
                            border: '1px solid #334155',
                            color: '#f8fafc',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Copy size={12} />
                          <span>{copiedType === 'wa' ? 'Copied!' : 'Copy'}</span>
                        </button>
                        {business.phone && (
                          <button
                            onClick={() => openWhatsAppDirect(analysis.outreach.whatsapp)}
                            type="button"
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              backgroundColor: '#10b981',
                              border: 'none',
                              color: '#ffffff',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Send size={12} />
                            <span>Open in WhatsApp {normalizedPhone ? `(+${normalizedPhone})` : ''}</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <pre
                      style={{
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'inherit',
                        fontSize: '0.85rem',
                        color: '#cbd5e1',
                        backgroundColor: '#090d16',
                        padding: '1rem',
                        borderRadius: '8px',
                        lineHeight: 1.5,
                      }}
                    >
                      {analysis.outreach.whatsapp}
                    </pre>
                  </div>

                  {/* Cold Email */}
                  <div style={{ backgroundColor: '#111827', borderRadius: '10px', padding: '1.25rem', border: '1px solid #1e293b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#60a5fa' }}>
                        <Mail size={16} />
                        <span>Personalized Cold Email</span>
                      </div>
                      <button
                        onClick={() =>
                          copyText(
                            `Subject: ${analysis.outreach.email.subject}\n\n${analysis.outreach.email.body}`,
                            'email'
                          )
                        }
                        type="button"
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          color: '#f8fafc',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Copy size={12} />
                        <span>{copiedType === 'email' ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                      <strong>Subject:</strong> {analysis.outreach.email.subject}
                    </div>
                    <pre
                      style={{
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'inherit',
                        fontSize: '0.85rem',
                        color: '#cbd5e1',
                        backgroundColor: '#090d16',
                        padding: '1rem',
                        borderRadius: '8px',
                        lineHeight: 1.5,
                      }}
                    >
                      {analysis.outreach.email.body}
                    </pre>
                  </div>
                </div>
              )}

              {/* TAB 4: DEMO CONCEPT */}
              {activeTab === 'demo' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div
                    style={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      border: '1px solid #334155',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa', fontWeight: 700 }}>
                      <Sparkles size={18} />
                      <span>Tailored Interactive Website Demo</span>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
                      A live, mobile-responsive interactive landing page has been generated for <strong>{business.name}</strong>.
                      It features their verified reviews, custom service offerings, direct WhatsApp booking, and location credentials.
                    </p>

                    <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <a
                        href={buildDemoPath(business)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          backgroundColor: '#2563eb',
                          color: '#ffffff',
                          padding: '10px 18px',
                          borderRadius: '8px',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span>Open Live Demo</span>
                        <ExternalLink size={14} />
                      </a>

                      <button
                        onClick={() => copyText(buildDemoUrl(business), 'demo_link')}
                        type="button"
                        style={{
                          backgroundColor: '#334155',
                          border: 'none',
                          color: '#f8fafc',
                          padding: '10px 18px',
                          borderRadius: '8px',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Copy size={14} />
                        <span>{copiedType === 'demo_link' ? 'Demo Link Copied!' : 'Copy Shareable Link'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: SALES ASSISTANT */}
              {activeTab === 'sales' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Closing Strategy */}
                  <div style={{ backgroundColor: '#111827', padding: '1.25rem', borderRadius: '10px', border: '1px solid #1e293b' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase' }}>
                      Recommended Closing Strategy
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#e2e8f0', marginTop: '0.4rem', lineHeight: 1.5 }}>
                      {analysis.salesGuidance.closingStrategy}
                    </p>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                      <strong>Pitch Package:</strong> {analysis.salesGuidance.pitchPackage}
                    </div>
                  </div>

                  {/* Standard Objection Playbook */}
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.65rem' }}>
                      Objection Handling Playbook
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.75rem' }}>
                      <div style={{ backgroundColor: '#111827', padding: '1rem', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f87171' }}>
                          If they say: &ldquo;Too expensive&rdquo;
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.35rem', lineHeight: 1.4 }}>
                          {analysis.salesGuidance.objections.tooExpensive}
                        </p>
                      </div>

                      <div style={{ backgroundColor: '#111827', padding: '1rem', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24' }}>
                          If they say: &ldquo;Already have enough clients&rdquo;
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.35rem', lineHeight: 1.4 }}>
                          {analysis.salesGuidance.objections.alreadyHaveClients}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Reply Simulator */}
                  <div
                    style={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      border: '1px solid #334155',
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#60a5fa', marginBottom: '0.5rem' }}>
                      Test Prospect Reply Simulator
                    </div>
                    <p style={{ fontSize: '0.775rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                      Paste what the prospect replied on WhatsApp or email to get instant tailored response advice.
                    </p>

                    <form onSubmit={handleAskSalesAssistant} style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. How much will this cost? or Not interested right now"
                        value={replyInput}
                        onChange={(e) => setReplyInput(e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <button type="submit" className="btn-primary" disabled={isAskingAssistant || !replyInput.trim()}>
                        <span>{isAskingAssistant ? 'Thinking...' : 'Get Advice'}</span>
                      </button>
                    </form>

                    {salesReplyAdvice && (
                      <div
                        style={{
                          marginTop: '1rem',
                          backgroundColor: '#0f172a',
                          padding: '1rem',
                          borderRadius: '8px',
                          border: '1px solid #334155',
                        }}
                      >
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase' }}>
                          Tactical Advice ({salesReplyAdvice.intent})
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                          {salesReplyAdvice.objectionAnalysis}
                        </p>

                        <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', fontWeight: 700, color: '#60a5fa' }}>
                          Suggested Reply:
                        </div>
                        <pre
                          style={{
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'inherit',
                            fontSize: '0.85rem',
                            color: '#e2e8f0',
                            backgroundColor: '#1e293b',
                            padding: '0.75rem',
                            borderRadius: '6px',
                            marginTop: '0.25rem',
                          }}
                        >
                          {salesReplyAdvice.suggestedReply}
                        </pre>

                        <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => copyText(salesReplyAdvice.suggestedReply, 'assistant_reply')}
                            type="button"
                            style={{
                              backgroundColor: '#334155',
                              border: 'none',
                              color: '#f8fafc',
                              fontSize: '0.75rem',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                            }}
                          >
                            {copiedType === 'assistant_reply' ? 'Copied!' : 'Copy Reply'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
