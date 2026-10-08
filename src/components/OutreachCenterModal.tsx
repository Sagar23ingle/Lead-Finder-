'use client';

import React, { useState, useEffect } from 'react';
import {
  Business,
  LeadAnalysis,
  LeadCrmRecord,
  PipelineStage,
  ProspectReplyItem,
  MiniProposal,
  FollowUpItem,
  OutreachOptimization,
} from '@/types';
import {
  X,
  MessageCircle,
  Mail,
  Share2,
  Copy,
  Check,
  Send,
  ExternalLink,
  Sparkles,
  Phone,
  FileText,
  Clock,
  AlertCircle,
  HelpCircle,
  DollarSign,
  Award,
  Download,
  Shield,
  Zap,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import { normalizeWhatsAppNumber, buildWhatsAppUrl, formatDisplayPhone } from '@/lib/utils/phone';
import { getTemplateForBusiness, DEMO_TEMPLATES, DemoTemplateId } from '@/lib/templates/demoTemplates';

interface Props {
  business: Business;
  analysis: LeadAnalysis | null;
  crmRecord: LeadCrmRecord;
  onClose: () => void;
  onUpdateCrm: (updatedRecord: LeadCrmRecord) => Promise<void>;
}

const PIPELINE_STAGES: { stage: PipelineStage; label: string; color: string }[] = [
  { stage: 'NEW', label: 'New', color: '#64748b' },
  { stage: 'QUALIFIED', label: 'Qualified', color: '#0ea5e9' },
  { stage: 'CONTACTED', label: 'Contacted', color: '#8b5cf6' },
  { stage: 'REPLIED', label: 'Replied', color: '#06b6d4' },
  { stage: 'INTERESTED', label: 'Interested', color: '#f59e0b' },
  { stage: 'CALL', label: 'Call Booked', color: '#ec4899' },
  { stage: 'PROPOSAL', label: 'Proposal', color: '#6366f1' },
  { stage: 'WON', label: 'Won', color: '#22c55e' },
  { stage: 'LOST', label: 'Lost', color: '#ef4444' },
];

export const OutreachCenterModal: React.FC<Props> = ({
  business,
  analysis,
  crmRecord,
  onClose,
  onUpdateCrm,
}) => {
  const [activeTab, setActiveTab] = useState<'outreach' | 'followup' | 'sales_ai' | 'proposal' | 'details'>('outreach');

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

  // Contact Info & Notes State
  const [contactPerson, setContactPerson] = useState(crmRecord.contactPerson || '');
  const [contactPhone, setContactPhone] = useState(crmRecord.contactPhone || business.phone || '');
  const [contactEmail, setContactEmail] = useState(crmRecord.contactEmail || '');
  const [notes, setNotes] = useState(crmRecord.notes || '');

  // Outreach Message State
  const [selectedChannel, setSelectedChannel] = useState<'whatsapp' | 'email' | 'dm'>('whatsapp');
  const [whatsappMsg, setWhatsappMsg] = useState(analysis?.outreach.whatsapp || '');
  const [emailSubject, setEmailSubject] = useState(analysis?.outreach.email.subject || '');
  const [emailBody, setEmailBody] = useState(analysis?.outreach.email.body || '');
  const [dmMsg, setDmMsg] = useState(analysis?.outreach.dm || '');

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Follow-up Sequence State
  const [followUps, setFollowUps] = useState<FollowUpItem[]>(crmRecord.followUpSequence || []);

  // AI Sales Assistant State
  const [incomingReplyText, setIncomingReplyText] = useState('');
  const [isAnalyzingReply, setIsAnalyzingReply] = useState(false);
  const [latestReplyAnalysis, setLatestReplyAnalysis] = useState<ProspectReplyItem['aiAnalysis'] | null>(null);

  // Proposal State
  const [proposal, setProposal] = useState<MiniProposal | null>(crmRecord.proposal);
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);

  // Outreach Optimizer & Demo Delivery State
  const [optimizerResult, setOptimizerResult] = useState<OutreachOptimization | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isExportingHtml, setIsExportingHtml] = useState(false);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleOptimizeOutreach = async () => {
    const currentMsg = selectedChannel === 'whatsapp' ? whatsappMsg : selectedChannel === 'email' ? emailBody : dmMsg;
    if (!currentMsg.trim()) return;
    setIsOptimizing(true);
    try {
      const res = await fetch('/api/crm/optimize-outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id || business.external_id,
          message: currentMsg,
          channel: selectedChannel,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.optimization) {
          setOptimizerResult(data.optimization);
        }
      }
    } catch (err) {
      console.error('Failed to optimize outreach:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const applyOptimizedMessage = () => {
    if (!optimizerResult) return;
    if (selectedChannel === 'whatsapp') {
      setWhatsappMsg(optimizerResult.optimizedVersion);
    } else if (selectedChannel === 'email') {
      setEmailBody(optimizerResult.optimizedVersion);
    } else {
      setDmMsg(optimizerResult.optimizedVersion);
    }
  };

  const handleTrackDemoShared = async () => {
    try {
      await fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'track_demo',
          businessId: business.id || business.external_id,
        }),
      });
      await saveRecordChanges({ demoShared: true, demoSharedAt: new Date().toISOString() });
    } catch (err) {
      console.error('Failed to track demo:', err);
    }
  };

  const handleExportDemoHtml = async () => {
    setIsExportingHtml(true);
    const assignedTplId = getTemplateForBusiness(business.id || business.external_id, business.name);
    try {
      const res = await fetch('/api/crm/export-html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: business.id || business.external_id, template: assignedTplId }),
      });
      const data = await res.json();
      if (data.success && data.html) {
        const blob = new Blob([data.html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.fileName || `${business.name.replace(/\s+/g, '_')}_${assignedTplId}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        handleTrackDemoShared();
      }
    } catch (err) {
      console.error('Failed to export HTML:', err);
    } finally {
      setIsExportingHtml(false);
    }
  };

  // Helper to persist changes
  const saveRecordChanges = async (partial: Partial<LeadCrmRecord>) => {
    setIsSaving(true);
    try {
      const updated: LeadCrmRecord = {
        ...crmRecord,
        contactPerson: contactPerson || null,
        contactPhone: contactPhone || null,
        contactEmail: contactEmail || null,
        notes,
        followUpSequence: followUps,
        proposal,
        ...partial,
        updatedAt: new Date().toISOString(),
      };
      await onUpdateCrm(updated);
    } finally {
      setIsSaving(false);
    }
  };

  // 1. Channel sending links
  const targetPhone = (contactPhone || business.phone || '').trim();
  const normalizedWhatsApp = normalizeWhatsAppNumber(targetPhone);
  const whatsAppUrl = buildWhatsAppUrl(targetPhone, whatsappMsg);
  const displayPhone = formatDisplayPhone(targetPhone);

  const mailtoUrl = (contactEmail || '')
    ? `mailto:${contactEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
    : `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  // Mark Outreach as Sent
  const handleMarkAsSent = async () => {
    const newLogItem = {
      id: 'outreach_' + Date.now(),
      channel: selectedChannel,
      stage: 'initial' as const,
      sentAt: new Date().toISOString(),
      content: selectedChannel === 'whatsapp' ? whatsappMsg : selectedChannel === 'email' ? emailBody : dmMsg,
      status: 'sent' as const,
    };

    const newHistory = [newLogItem, ...(crmRecord.outreachHistory || [])];
    const newStage: PipelineStage = crmRecord.stage === 'NEW' || crmRecord.stage === 'QUALIFIED' ? 'CONTACTED' : crmRecord.stage;

    await saveRecordChanges({
      outreachHistory: newHistory,
      stage: newStage,
    });
  };

  // 2. Analyze incoming prospect reply
  const handleAnalyzeReply = async () => {
    if (!incomingReplyText.trim()) return;
    setIsAnalyzingReply(true);
    try {
      const res = await fetch('/api/crm/reply-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id || business.external_id,
          replyText: incomingReplyText.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.aiAnalysis) {
          setLatestReplyAnalysis(data.aiAnalysis);

          // Add to prospect replies and auto-stop follow-up sequence
          const replyItem: ProspectReplyItem = {
            id: 'reply_' + Date.now(),
            receivedAt: new Date().toISOString(),
            text: incomingReplyText.trim(),
            aiAnalysis: data.aiAnalysis,
          };

          const newReplies = [replyItem, ...(crmRecord.prospectReplies || [])];
          
          // Determine appropriate next stage
          let nextStage: PipelineStage = 'REPLIED';
          if (data.aiAnalysis.interestLevel === 'High') {
            nextStage = 'INTERESTED';
          }

          // Auto-cancel remaining follow-ups
          const updatedFollowUps = followUps.map((f) => ({
            ...f,
            status: f.status === 'pending' ? ('cancelled' as const) : f.status,
          }));
          setFollowUps(updatedFollowUps);

          await saveRecordChanges({
            prospectReplies: newReplies,
            stage: nextStage,
            followUpSequence: updatedFollowUps,
          });
        }
      }
    } catch (err) {
      console.error('Failed to analyze reply:', err);
    } finally {
      setIsAnalyzingReply(false);
    }
  };

  // 3. Generate or refresh Proposal
  const handleGenerateProposal = async () => {
    setIsGeneratingProposal(true);
    try {
      const res = await fetch('/api/crm/proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: business.id || business.external_id }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.proposal) {
          setProposal(data.proposal);
          await saveRecordChanges({ proposal: data.proposal });
        }
      }
    } finally {
      setIsGeneratingProposal(false);
    }
  };

  const handleUpdateStage = async (stage: PipelineStage) => {
    await saveRecordChanges({ stage });
  };

  const isFollowUpStopped =
    crmRecord.prospectReplies.length > 0 ||
    crmRecord.stage === 'REPLIED' ||
    crmRecord.stage === 'INTERESTED' ||
    crmRecord.stage === 'CALL' ||
    crmRecord.stage === 'PROPOSAL' ||
    crmRecord.stage === 'WON';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container"
        style={{ maxWidth: '980px', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-color, #334155)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--card-bg, #1e293b)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                {business.name}
              </h2>
              {analysis && (
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
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
                        ? '#ef4444'
                        : analysis.tier === 'WARM'
                        ? '#f59e0b'
                        : '#94a3b8',
                  }}
                >
                  Score: {analysis.score} ({analysis.tier})
                </span>
              )}
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {business.category} • {business.city || 'Location unavailable'} •{' '}
              {business.review_count} Google Reviews ({business.rating || 0}★)
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Stage Dropdown */}
            <select
              value={crmRecord.stage}
              onChange={(e) => handleUpdateStage(e.target.value as PipelineStage)}
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {PIPELINE_STAGES.map((s) => (
                <option key={s.stage} value={s.stage}>
                  Stage: {s.label}
                </option>
              ))}
            </select>

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Lead Opportunity Banner */}
        <div
          style={{
            padding: '10px 24px',
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '0.82rem',
          }}
        >
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Reason: </span>
            <span style={{ color: '#f59e0b', fontWeight: 500 }}>
              {analysis?.report.mainProblem || 'High-reputation business with web opportunity.'}
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Offer: </span>
            <span style={{ color: '#10b981', fontWeight: 500 }}>
              {analysis?.report.recommendedService || 'Modern Web Presence + WhatsApp Lead Funnel'}
            </span>
          </div>
          {business.website && (
            <div>
              <a
                href={business.website}
                target="_blank"
                rel="noreferrer"
                style={{ color: '#38bdf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span>Current Website</span>
                <ExternalLink size={12} />
              </a>
            </div>
          )}
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--card-bg, #1e293b)',
            padding: '0 24px',
          }}
        >
          {[
            { id: 'outreach', label: '1. Outreach & Channels', icon: <Send size={15} /> },
            { id: 'followup', label: '2. Follow-Up Sequence', icon: <Clock size={15} /> },
            { id: 'sales_ai', label: '3. AI Sales Assistant', icon: <Sparkles size={15} /> },
            { id: 'proposal', label: '4. Mini Proposal', icon: <FileText size={15} /> },
            { id: 'details', label: '5. Contact & Notes', icon: <Award size={15} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                color: activeTab === tab.id ? '#3b82f6' : 'var(--text-secondary)',
                fontWeight: activeTab === tab.id ? 600 : 400,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {/* TAB 1: OUTREACH & CHANNELS */}
          {activeTab === 'outreach' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Interactive Demo Delivery Box */}
              <div
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(56, 189, 248, 0.15)',
                      color: '#38bdf8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Globe size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Personalized Website Demo Ready
                    </div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                      Generated in <strong style={{ color: DEMO_TEMPLATES[getTemplateForBusiness(business.id || business.external_id, business.name)].palette.accent }}>{DEMO_TEMPLATES[getTemplateForBusiness(business.id || business.external_id, business.name)].name}</strong> style ({DEMO_TEMPLATES[getTemplateForBusiness(business.id || business.external_id, business.name)].badge}) • Tailored to {business.name}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {crmRecord.demoShared ? (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        padding: '4px 8px',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(16, 185, 129, 0.2)',
                        color: '#34d399',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <CheckCircle2 size={13} />
                      <span>Demo Shared</span>
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        padding: '4px 8px',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(148, 163, 184, 0.15)',
                        color: '#94a3b8',
                        fontWeight: 500,
                      }}
                    >
                      Not Shared Yet
                    </span>
                  )}

                  <a
                    href={`/demo/${business.id || business.external_id}?t=${getTemplateForBusiness(business.id || business.external_id, business.name)}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '5px 10px',
                      borderRadius: '6px',
                      backgroundColor: '#334155',
                      color: '#f8fafc',
                      fontSize: '0.775rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    <ExternalLink size={13} />
                    <span>Open Demo</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      const tplId = getTemplateForBusiness(business.id || business.external_id, business.name);
                      const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/demo/${business.id || business.external_id}?t=${tplId}`;
                      handleCopy(url, 'demo_link');
                      handleTrackDemoShared();
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '5px 10px',
                      borderRadius: '6px',
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      color: '#f8fafc',
                      fontSize: '0.775rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {copiedKey === 'demo_link' ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                    <span>{copiedKey === 'demo_link' ? 'Copied & Tracked!' : 'Copy Demo Link'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportDemoHtml}
                    disabled={isExportingHtml}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '5px 10px',
                      borderRadius: '6px',
                      backgroundColor: '#2563eb',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '0.775rem',
                      fontWeight: 600,
                      cursor: isExportingHtml ? 'not-allowed' : 'pointer',
                    }}
                    title="Download standalone HTML for GitHub Pages / Netlify Drop"
                  >
                    <Download size={13} />
                    <span>{isExportingHtml ? 'Exporting...' : 'Export HTML (Free)'}</span>
                  </button>
                </div>
              </div>

              {/* Channel Selector */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedChannel('whatsapp')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: selectedChannel === 'whatsapp' ? '1px solid #22c55e' : '1px solid var(--border-color)',
                    backgroundColor: selectedChannel === 'whatsapp' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                    color: selectedChannel === 'whatsapp' ? '#22c55e' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                  }}
                >
                  <MessageCircle size={16} />
                  <span>WhatsApp Message</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedChannel('email')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: selectedChannel === 'email' ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                    backgroundColor: selectedChannel === 'email' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                    color: selectedChannel === 'email' ? '#3b82f6' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                  }}
                >
                  <Mail size={16} />
                  <span>Email Pitch</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedChannel('dm')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: selectedChannel === 'dm' ? '1px solid #ec4899' : '1px solid var(--border-color)',
                    backgroundColor: selectedChannel === 'dm' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                    color: selectedChannel === 'dm' ? '#ec4899' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                  }}
                >
                  <Share2 size={16} />
                  <span>Instagram / LinkedIn DM</span>
                </button>
              </div>

              {/* Recipient Client Phone Box for WhatsApp */}
              {selectedChannel === 'whatsapp' && (
                <div
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '260px' }}>
                    <Phone size={15} color="#22c55e" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Client WhatsApp Number:
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. +91 98230 12345 or 9823012345"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      onBlur={() => saveRecordChanges({ contactPhone: contactPhone.trim() || null })}
                      style={{
                        flex: 1,
                        padding: '5px 10px',
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        border: normalizedWhatsApp ? '1px solid #22c55e' : '1px solid #ef4444',
                        borderRadius: '5px',
                        color: 'var(--text-primary)',
                        fontSize: '0.82rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {normalizedWhatsApp ? (
                      <span style={{ color: '#22c55e', fontWeight: 600 }}>
                        ✓ Direct Chat Recipient: +{normalizedWhatsApp}
                      </span>
                    ) : (
                      <span style={{ color: '#f87171', fontWeight: 500 }}>
                        ⚠ Enter 10-digit mobile number to open client directly
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Message Editor */}
              {selectedChannel === 'email' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Email Subject Line
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Personalized Message Copy (Fully Editable)
                </label>
                <textarea
                  rows={8}
                  value={
                    selectedChannel === 'whatsapp'
                      ? whatsappMsg
                      : selectedChannel === 'email'
                      ? emailBody
                      : dmMsg
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (selectedChannel === 'whatsapp') setWhatsappMsg(val);
                    else if (selectedChannel === 'email') setEmailBody(val);
                    else setDmMsg(val);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                    fontFamily: 'inherit',
                    lineHeight: 1.5,
                  }}
                />
              </div>

              {/* AI Outreach Optimizer Panel */}
              <div
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.75)',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '12px 14px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Zap size={16} color="#f59e0b" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      AI Outreach Optimizer
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      (Audits Personalization, Spam-Risk &amp; Clarity before sending)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleOptimizeOutreach}
                    disabled={isOptimizing}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#f59e0b',
                      color: '#0f172a',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '5px 12px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: isOptimizing ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Sparkles size={13} />
                    <span>{isOptimizing ? 'Auditing copy...' : 'Check & Optimize with AI'}</span>
                  </button>
                </div>

                {optimizerResult && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Metrics Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
                      <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.6)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Personalization</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: optimizerResult.personalizationScore >= 80 ? '#22c55e' : '#f59e0b' }}>
                          {optimizerResult.personalizationScore}%
                        </div>
                      </div>

                      <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.6)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Spam Risk</div>
                        <div style={{
                          fontSize: '1rem',
                          fontWeight: 800,
                          color: optimizerResult.spamRisk === 'Low' ? '#22c55e' : optimizerResult.spamRisk === 'Medium' ? '#f59e0b' : '#ef4444'
                        }}>
                          {optimizerResult.spamRisk}
                        </div>
                      </div>

                      <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.6)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Clarity</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8' }}>
                          {optimizerResult.clarityRating}
                        </div>
                      </div>
                    </div>

                    {/* Selling point and improvement */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
                      <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.25)', borderRadius: '6px', padding: '8px' }}>
                        <div style={{ fontWeight: 700, color: '#22c55e', marginBottom: '2px' }}>★ Strongest Selling Point</div>
                        <div style={{ color: 'var(--text-primary)' }}>{optimizerResult.strongestSellingPoint}</div>
                      </div>

                      <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '6px', padding: '8px' }}>
                        <div style={{ fontWeight: 700, color: '#f59e0b', marginBottom: '2px' }}>💡 Suggested Improvement</div>
                        <div style={{ color: 'var(--text-primary)' }}>{optimizerResult.suggestedImprovement}</div>
                      </div>
                    </div>

                    {/* Final optimized text preview and apply button */}
                    <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid #3b82f6', borderRadius: '6px', padding: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#60a5fa' }}>Final Optimized Version:</span>
                        <button
                          type="button"
                          onClick={applyOptimizedMessage}
                          style={{
                            backgroundColor: '#2563eb',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 10px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Apply to Message Box
                        </button>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.45 }}>
                        {optimizerResult.optimizedVersion}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons: Copy, Open Channel, Mark as Sent */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      selectedChannel === 'whatsapp'
                        ? whatsappMsg
                        : selectedChannel === 'email'
                        ? `Subject: ${emailSubject}\n\n${emailBody}`
                        : dmMsg,
                      'outreach'
                    )
                  }
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
                >
                  {copiedKey === 'outreach' ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                  <span>{copiedKey === 'outreach' ? 'Copied to Clipboard!' : 'Copy Message'}</span>
                </button>

                {selectedChannel === 'whatsapp' && (
                  whatsAppUrl ? (
                    <a
                      href={whatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        backgroundColor: '#22c55e',
                        textDecoration: 'none',
                        color: '#fff',
                        borderRadius: '6px',
                        fontWeight: 600,
                      }}
                    >
                      <MessageCircle size={16} />
                      <span>Open WhatsApp Web / App (+{normalizedWhatsApp})</span>
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={14} />
                      <span>Enter client phone number above to launch WhatsApp.</span>
                    </span>
                  )
                )}

                {selectedChannel === 'email' && (
                  <a
                    href={mailtoUrl}
                    className="btn-primary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      backgroundColor: '#3b82f6',
                      textDecoration: 'none',
                      color: '#fff',
                      borderRadius: '6px',
                      fontWeight: 600,
                    }}
                  >
                    <Mail size={16} />
                    <span>Open in Email App</span>
                  </a>
                )}

                {normalizedWhatsApp && (
                  <a
                    href={`tel:+${normalizedWhatsApp}`}
                    className="btn-secondary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      textDecoration: 'none',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <Phone size={16} />
                    <span>Call Phone (+{normalizedWhatsApp})</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={handleMarkAsSent}
                  disabled={isSaving}
                  style={{
                    marginLeft: 'auto',
                    backgroundColor: '#8b5cf6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Send size={15} />
                  <span>Mark as Sent</span>
                </button>
              </div>

              {/* Outreach History Log */}
              {crmRecord.outreachHistory && crmRecord.outreachHistory.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Outreach Log History ({crmRecord.outreachHistory.length} events)
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {crmRecord.outreachHistory.map((log) => (
                      <div
                        key={log.id}
                        style={{
                          backgroundColor: 'rgba(15, 23, 42, 0.6)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          fontSize: '0.82rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <strong style={{ textTransform: 'capitalize', color: 'var(--text-primary)' }}>
                            {log.channel}
                          </strong>{' '}
                          — {log.status === 'sent' ? 'Sent' : 'Draft'}
                          <span style={{ color: 'var(--text-secondary)', marginLeft: '10px' }}>
                            {log.sentAt ? new Date(log.sentAt).toLocaleString() : ''}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(log.content, log.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#38bdf8',
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                          }}
                        >
                          {copiedKey === log.id ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FOLLOW-UP SEQUENCE */}
          {activeTab === 'followup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  backgroundColor: isFollowUpStopped ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  border: isFollowUpStopped ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isFollowUpStopped ? <AlertCircle size={18} color="#ef4444" /> : <Clock size={18} color="#10b981" />}
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isFollowUpStopped ? '#ef4444' : '#10b981' }}>
                    {isFollowUpStopped
                      ? 'Follow-Up Sequence Automatically Stopped (Prospect Replied)'
                      : 'Follow-Up Sequence Active (Day 0 → Day 2 → Day 5 → Day 9)'}
                  </span>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Timing and messages are fully customizable
                </span>
              </div>

              {followUps.map((fu, idx) => (
                <div
                  key={fu.stage}
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '14px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          backgroundColor: '#3b82f6',
                          color: '#fff',
                          padding: '2px 8px',
                          borderRadius: '10px',
                        }}
                      >
                        Step {idx + 1}
                      </span>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{fu.label}</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Day:</label>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={fu.dayOffset}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          const next = [...followUps];
                          next[idx].dayOffset = val;
                          setFollowUps(next);
                        }}
                        style={{
                          width: '55px',
                          padding: '3px 6px',
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '4px',
                          color: 'var(--text-primary)',
                          fontSize: '0.8rem',
                        }}
                      />
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '2px 6px',
                          borderRadius: '6px',
                          backgroundColor:
                            fu.status === 'cancelled'
                              ? 'rgba(239, 68, 68, 0.15)'
                              : fu.status === 'sent'
                              ? 'rgba(34, 197, 94, 0.15)'
                              : 'rgba(59, 130, 246, 0.15)',
                          color:
                            fu.status === 'cancelled'
                              ? '#ef4444'
                              : fu.status === 'sent'
                              ? '#22c55e'
                              : '#3b82f6',
                        }}
                      >
                        {fu.status}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                      Subject
                    </label>
                    <input
                      type="text"
                      value={fu.subject}
                      onChange={(e) => {
                        const next = [...followUps];
                        next[idx].subject = e.target.value;
                        setFollowUps(next);
                      }}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                      Follow-up Content
                    </label>
                    <textarea
                      rows={3}
                      value={fu.content}
                      onChange={(e) => {
                        const next = [...followUps];
                        next[idx].content = e.target.value;
                        setFollowUps(next);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleCopy(fu.content, `fu_${fu.stage}`)}
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      {copiedKey === `fu_${fu.stage}` ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                      <span>{copiedKey === `fu_${fu.stage}` ? 'Copied' : 'Copy'}</span>
                    </button>

                    {buildWhatsAppUrl(targetPhone, fu.content) && (
                      <a
                        href={buildWhatsAppUrl(targetPhone, fu.content)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.78rem', textDecoration: 'none', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <MessageCircle size={12} />
                        <span>Send WhatsApp (+{normalizedWhatsApp})</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => saveRecordChanges({ followUpSequence: followUps })}
                  className="btn-primary"
                  disabled={isSaving}
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  Save Sequence Customizations
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: AI SALES ASSISTANT (PROSPECT REPLY ANALYZER) */}
          {activeTab === 'sales_ai' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '16px',
                }}
              >
                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.92rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} color="#38bdf8" />
                  <span>Paste Incoming Prospect Reply</span>
                </h4>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Paste any reply you received via WhatsApp, Email, or DM. The system breaks down their intent, interest level, objections, and generates the best closing response.
                </p>

                <textarea
                  rows={3}
                  value={incomingReplyText}
                  onChange={(e) => setIncomingReplyText(e.target.value)}
                  placeholder="e.g. 'How much do you charge for a 5 page website?' or 'Who is this and where did you get my number?'"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                    fontFamily: 'inherit',
                    marginBottom: '10px',
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {[
                      'How much do you charge?',
                      'Can you call me tomorrow at 3pm?',
                      'Please share details and what is included',
                      'Already have a developer managing our website',
                      'Not interested right now',
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setIncomingReplyText(preset)}
                        className="quick-chip"
                        style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAnalyzeReply}
                    disabled={isAnalyzingReply || !incomingReplyText.trim()}
                    className="btn-primary"
                    style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Sparkles size={15} />
                    <span>{isAnalyzingReply ? 'Analyzing...' : 'Analyze Reply'}</span>
                  </button>
                </div>
              </div>

              {/* Display Reply Analysis Result */}
              {latestReplyAnalysis && (
                <div
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid #38bdf8',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '0.95rem', color: '#38bdf8' }}>
                        Intent: {latestReplyAnalysis.intent}
                      </strong>
                      {latestReplyAnalysis.classification && (
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            backgroundColor: 'rgba(56, 189, 248, 0.2)',
                            color: '#38bdf8',
                            border: '1px solid rgba(56, 189, 248, 0.4)',
                          }}
                        >
                          Category: {latestReplyAnalysis.classification}
                        </span>
                      )}
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor:
                            latestReplyAnalysis.interestLevel === 'High'
                              ? 'rgba(34, 197, 94, 0.2)'
                              : latestReplyAnalysis.interestLevel === 'Medium'
                              ? 'rgba(245, 158, 11, 0.2)'
                              : 'rgba(239, 68, 68, 0.2)',
                          color:
                            latestReplyAnalysis.interestLevel === 'High'
                              ? '#22c55e'
                              : latestReplyAnalysis.interestLevel === 'Medium'
                              ? '#f59e0b'
                              : '#ef4444',
                        }}
                      >
                        Interest: {latestReplyAnalysis.interestLevel}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>What the Prospect Means:</span>
                    <p style={{ margin: '3px 0 0 0', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      {latestReplyAnalysis.meaning}
                    </p>
                  </div>

                  {latestReplyAnalysis.objection && (
                    <div style={{ padding: '8px 12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '6px' }}>
                      <span style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 600 }}>Objection Detected:</span>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                        {latestReplyAnalysis.objection}
                      </p>
                    </div>
                  )}

                  {/* Recommended Response */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>Recommended Reply Copy:</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(latestReplyAnalysis.recommendedResponse, 'ai_reply')}
                        className="btn-secondary"
                        style={{ padding: '3px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        {copiedKey === 'ai_reply' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                        <span>{copiedKey === 'ai_reply' ? 'Copied' : 'Copy Response'}</span>
                      </button>
                    </div>
                    <div
                      style={{
                        padding: '10px 12px',
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        color: 'var(--text-primary)',
                        lineHeight: 1.45,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {latestReplyAnalysis.recommendedResponse}
                    </div>
                  </div>

                  {/* Strategic Guidance Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem' }}>
                    <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: '8px', borderRadius: '6px' }}>
                      <strong style={{ color: '#38bdf8', display: 'block', marginBottom: '2px' }}>Next Action:</strong>
                      <span style={{ color: 'var(--text-secondary)' }}>{latestReplyAnalysis.nextAction}</span>
                    </div>
                    <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: '8px', borderRadius: '6px' }}>
                      <strong style={{ color: '#38bdf8', display: 'block', marginBottom: '2px' }}>Suggested Offer:</strong>
                      <span style={{ color: 'var(--text-secondary)' }}>{latestReplyAnalysis.suggestedOffer}</span>
                    </div>
                    <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: '8px', borderRadius: '6px' }}>
                      <strong style={{ color: '#38bdf8', display: 'block', marginBottom: '2px' }}>Pricing Approach:</strong>
                      <span style={{ color: 'var(--text-secondary)' }}>{latestReplyAnalysis.suggestedPricing}</span>
                    </div>
                    <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: '8px', borderRadius: '6px' }}>
                      <strong style={{ color: '#38bdf8', display: 'block', marginBottom: '2px' }}>Closing Strategy:</strong>
                      <span style={{ color: 'var(--text-secondary)' }}>{latestReplyAnalysis.closingStrategy}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MINI PROPOSAL */}
          {activeTab === 'proposal' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    Client Mini Proposal
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Turnkey proposal tailored to {business.name}. Edit any field before sending.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleGenerateProposal}
                    disabled={isGeneratingProposal}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                  >
                    {isGeneratingProposal ? 'Generating...' : proposal ? 'Regenerate Draft' : 'Generate Proposal'}
                  </button>

                  {proposal && (
                    <button
                      type="button"
                      onClick={() => {
                        const formatted = `# PROPOSAL FOR ${proposal.clientName.toUpperCase()}
Niche: ${proposal.businessNiche} | Location: ${proposal.city}

## 1. Problem Identified
${proposal.problem}

## 2. Recommended Solution
${proposal.solution}

## 3. Deliverables
${proposal.deliverables.map((d) => `- ${d}`).join('\n')}

## 4. Timeline
${proposal.timeline}

## 5. Investment & Pricing
${proposal.price}

## 6. Next Steps
${proposal.nextStep}`;
                        handleCopy(formatted, 'full_proposal');
                      }}
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      {copiedKey === 'full_proposal' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                      <span>{copiedKey === 'full_proposal' ? 'Copied Proposal!' : 'Copy Proposal Text'}</span>
                    </button>
                  )}
                </div>
              </div>

              {proposal ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                      Problem Identified (Grounded in Real Audit)
                    </label>
                    <textarea
                      rows={2}
                      value={proposal.problem}
                      onChange={(e) => setProposal({ ...proposal, problem: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                      Recommended Solution
                    </label>
                    <textarea
                      rows={2}
                      value={proposal.solution}
                      onChange={(e) => setProposal({ ...proposal, solution: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                      Deliverables (One per line)
                    </label>
                    <textarea
                      rows={5}
                      value={proposal.deliverables.join('\n')}
                      onChange={(e) =>
                        setProposal({
                          ...proposal,
                          deliverables: e.target.value.split('\n').filter((x) => x.trim()),
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                        Timeline
                      </label>
                      <input
                        type="text"
                        value={proposal.timeline}
                        onChange={(e) => setProposal({ ...proposal, timeline: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '4px',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                        Price & Milestones
                      </label>
                      <input
                        type="text"
                        value={proposal.price}
                        onChange={(e) => setProposal({ ...proposal, price: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '4px',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                      Next Step
                    </label>
                    <input
                      type="text"
                      value={proposal.nextStep}
                      onChange={(e) => setProposal({ ...proposal, nextStep: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                    <button
                      type="button"
                      onClick={() => saveRecordChanges({ proposal, stage: 'PROPOSAL' })}
                      className="btn-primary"
                      disabled={isSaving}
                      style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                    >
                      Save Proposal & Move to PROPOSAL Stage
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: '30px',
                    textAlign: 'center',
                    backgroundColor: 'rgba(15, 23, 42, 0.5)',
                    border: '1px dashed var(--border-color)',
                    borderRadius: '8px',
                  }}
                >
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    No proposal generated yet for this prospect.
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerateProposal}
                    disabled={isGeneratingProposal}
                    className="btn-primary"
                    style={{ padding: '8px 18px' }}
                  >
                    Generate Tailored Mini Proposal
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: CONTACT & NOTES */}
          {activeTab === 'details' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                    Direct Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98230 12345"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                    Direct Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. contact@business.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                  Internal Prospect Notes & Conversation Log
                </label>
                <textarea
                  rows={6}
                  placeholder="Record any details from phone calls, client budget, custom requirements, or preferences..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() =>
                    saveRecordChanges({
                      contactPerson: contactPerson || null,
                      contactPhone: contactPhone || null,
                      contactEmail: contactEmail || null,
                      notes,
                    })
                  }
                  className="btn-primary"
                  disabled={isSaving}
                  style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                >
                  {isSaving ? 'Saving...' : 'Save Contact Info & Notes'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
