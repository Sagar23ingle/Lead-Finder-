'use client';

import React, { useState, useEffect } from 'react';
import { DemoRecord } from '@/lib/db/demos';
import {
  Phone,
  MessageCircle,
  Share2,
  Copy,
  ArrowLeft,
  Check,
  Star,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Clock,
  Sparkles,
  ChevronRight,
  Send,
} from 'lucide-react';
import Link from 'next/link';
import {
  normalizeWhatsAppNumber,
  formatDisplayPhone,
} from '@/lib/utils/phone';

interface DemoViewProps {
  record: DemoRecord;
}

export const DemoView: React.FC<DemoViewProps> = ({ record }) => {
  const { business, demo } = record;
  const { theme, hero, sections, galleryImages } = demo;

  const [copied, setCopied] = useState(false);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && record) {
      try {
        const id = record.id || record.leadId;
        if (id) {
          localStorage.setItem(`outreachly_demo_${id}`, JSON.stringify(record));
        }
        if (record.slug) {
          localStorage.setItem(`outreachly_demo_${record.slug}`, JSON.stringify(record));
        }
        if (record.business) {
          const bizId = record.business.id || record.business.external_id;
          if (bizId) {
            localStorage.setItem(`outreachly_biz_${bizId}`, JSON.stringify(record.business));
          }
        }
      } catch {
        // ignore storage quota errors
      }
    }
  }, [record]);

  // Unlock document and body scrolling so demo website scrolls naturally
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const prevHtmlOverflow = document.documentElement.style.overflow;
      const prevHtmlHeight = document.documentElement.style.height;
      const prevBodyOverflow = document.body.style.overflow;
      const prevBodyHeight = document.body.style.height;

      document.documentElement.style.overflowY = 'auto';
      document.documentElement.style.overflowX = 'hidden';
      document.documentElement.style.height = 'auto';
      document.body.style.overflowY = 'auto';
      document.body.style.overflowX = 'hidden';
      document.body.style.height = 'auto';

      return () => {
        document.documentElement.style.overflow = prevHtmlOverflow;
        document.documentElement.style.height = prevHtmlHeight;
        document.body.style.overflow = prevBodyOverflow;
        document.body.style.height = prevBodyHeight;
      };
    }
  }, []);

  const cleanPhone = normalizeWhatsAppNumber(business.phone || '');
  const displayPhone = formatDisplayPhone(business.phone || '');

  const copyShareLink = async () => {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);

      try {
        await fetch('/api/crm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'track_demo',
            businessId: business.id || business.external_id,
          }),
        });
      } catch {
        // ignore
      }
    }
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySubmitted(true);
  };

  // Build WhatsApp link for client
  const whatsAppUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        `Hi ${business.name}, I would like to inquire about your services in ${business.city || 'your area'}.`
      )}`
    : null;

  return (
    <div
      className="outreachly-demo-page"
      style={{
        backgroundColor: theme.background,
        color: theme.textPrimary,
        minHeight: '100vh',
        width: '100%',
        fontFamily: theme.fontBody,
        overflowX: 'hidden',
        overflowY: 'visible',
        position: 'relative',
      }}
    >
      {/* ====================================================================
          1. TOP AGENCY CONTROL BAR (STICKY)
          Allows agency owner to copy real production demo link, call client, or go back
          ==================================================================== */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'rgba(15, 23, 42, 0.96)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(51, 65, 85, 0.8)',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 10px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#cbd5e1',
              fontSize: '0.8rem',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={13} />
            <span>Dashboard</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
              {business.name}
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '2px 7px',
                borderRadius: '9999px',
                backgroundColor: theme.tagBg,
                color: theme.tagText,
                border: `1px solid ${theme.border}`,
              }}
            >
              {theme.badgeLabel}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={copyShareLink}
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: 'rgba(37, 99, 235, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              color: '#60a5fa',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title="Copy public, permanent link to this demo"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? 'Link Copied!' : 'Copy Demo Link'}</span>
          </button>

          {whatsAppUrl && (
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                color: '#4ade80',
                fontSize: '0.8rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <MessageCircle size={13} />
              <span>WhatsApp Client</span>
            </a>
          )}

          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 10px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#cbd5e1',
                fontSize: '0.8rem',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              <Phone size={13} />
              <span>Call</span>
            </a>
          )}
        </div>
      </div>

      {/* ====================================================================
          2. DEMO CLIENT WEBSITE HEADER / NAVIGATION
          ==================================================================== */}
      <header
        style={{
          borderBottom: `1px solid ${theme.border}`,
          backgroundColor: theme.surface,
          padding: '16px 24px',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                margin: 0,
                color: theme.textPrimary,
                fontFamily: theme.fontHeading,
              }}
            >
              {business.name}
            </h1>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: theme.textSecondary }}>
              {business.category} • {business.city || 'Local Area'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: theme.accent,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <Phone size={14} />
                <span>{displayPhone}</span>
              </a>
            )}

            {whatsAppUrl ? (
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: theme.primary,
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: `0 4px 14px ${theme.border}`,
                }}
              >
                <span>{theme.primaryCtaText}</span>
                <ChevronRight size={14} />
              </a>
            ) : (
              <a
                href="#contact"
                style={{
                  backgroundColor: theme.primary,
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{theme.primaryCtaText}</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* ====================================================================
          3. HERO SECTION (TAILORED HEADLINE & REAL SIGNALS)
          ==================================================================== */}
      <section
        style={{
          position: 'relative',
          padding: '60px 24px',
          borderBottom: `1px solid ${theme.border}`,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
            alignItems: 'center',
            gap: '40px',
          }}
        >
          {/* Left Column: Headlines & Action */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '9999px',
                backgroundColor: theme.tagBg,
                color: theme.tagText,
                border: `1px solid ${theme.border}`,
                fontSize: '0.8rem',
                fontWeight: 600,
                marginBottom: '16px',
              }}
            >
              <Sparkles size={13} />
              <span>{hero.badge}</span>
            </div>

            <h2
              style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: '-0.03em',
                marginBottom: '16px',
                color: theme.textPrimary,
                fontFamily: theme.fontHeading,
              }}
            >
              {hero.headline}
            </h2>

            <p
              style={{
                fontSize: '1.05rem',
                lineHeight: 1.6,
                color: theme.textSecondary,
                marginBottom: '24px',
                maxWidth: '560px',
              }}
            >
              {hero.subheadline}
            </p>

            {/* Verified Google Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                borderRadius: '8px',
                backgroundColor: theme.surface,
                border: `1px solid ${theme.border}`,
                marginBottom: '28px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#f59e0b' }}>
                <Star size={16} fill="currentColor" />
                <span style={{ fontSize: '1rem', fontWeight: 800, color: theme.textPrimary }}>
                  {hero.statValue}
                </span>
              </div>
              <div style={{ height: '18px', width: '1px', backgroundColor: theme.border }} />
              <div style={{ fontSize: '0.825rem', color: theme.textSecondary }}>
                <span>{hero.statLabel}</span> • <span style={{ color: theme.accent }}>Google Verified</span>
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {whatsAppUrl ? (
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: theme.primary,
                    color: '#ffffff',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: `0 4px 14px ${theme.border}`,
                  }}
                >
                  <MessageCircle size={16} />
                  <span>{hero.primaryCta}</span>
                </a>
              ) : (
                <a
                  href="#contact"
                  style={{
                    backgroundColor: theme.primary,
                    color: '#ffffff',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  {hero.primaryCta}
                </a>
              )}

              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  style={{
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.border}`,
                    color: theme.textPrimary,
                    padding: '12px 20px',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Phone size={15} />
                  <span>{hero.secondaryCta}</span>
                </a>
              )}
            </div>
          </div>

          {/* Right Column: Hero Visual Image */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                borderRadius: '14px',
                overflow: 'hidden',
                border: `1px solid ${theme.border}`,
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                aspectRatio: '4 / 3',
                backgroundColor: theme.surface,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={hero.heroImage}
                alt={business.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. PURPOSEFUL SECTIONS (TREATMENTS / MENU / PROJECTS / SERVICES)
          ==================================================================== */}
      {sections.map((section, idx) => {
        if (section.type === 'location') {
          return (
            <section
              key={section.id}
              id="location"
              style={{
                padding: '60px 24px',
                backgroundColor: idx % 2 === 1 ? theme.surface : theme.background,
                borderBottom: `1px solid ${theme.border}`,
              }}
            >
              <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                  <h3
                    style={{
                      fontSize: '1.75rem',
                      fontWeight: 800,
                      marginBottom: '8px',
                      color: theme.textPrimary,
                      fontFamily: theme.fontHeading,
                    }}
                  >
                    {section.title}
                  </h3>
                  {section.subtitle && (
                    <p style={{ fontSize: '0.95rem', color: theme.textSecondary }}>
                      {section.subtitle}
                    </p>
                  )}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                    gap: '20px',
                  }}
                >
                  {/* Address Box */}
                  <div
                    style={{
                      padding: '24px',
                      borderRadius: '10px',
                      backgroundColor: theme.surfaceAlt,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <MapPin size={18} color={theme.accent} />
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Location Address</h4>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: theme.textSecondary, lineHeight: 1.5, margin: 0 }}>
                      {business.address || `${business.city || 'Central'}, ${business.country || 'India'}`}
                    </p>
                    {business.google_maps_url && (
                      <a
                        href={business.google_maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          color: theme.accent,
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          marginTop: '12px',
                          textDecoration: 'none',
                        }}
                      >
                        <span>Open Directions in Google Maps</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>

                  {/* Hours & Contact Box */}
                  <div
                    style={{
                      padding: '24px',
                      borderRadius: '10px',
                      backgroundColor: theme.surfaceAlt,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <Clock size={18} color={theme.accent} />
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Operating Status & Phone</h4>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: theme.textSecondary, margin: '0 0 8px 0' }}>
                      Status:{' '}
                      <strong style={{ color: business.opening_status ? '#4ade80' : theme.textPrimary }}>
                        {business.opening_status || 'Open for Consultations'}
                      </strong>
                    </p>
                    {business.phone && (
                      <p style={{ fontSize: '0.9rem', color: theme.textSecondary, margin: 0 }}>
                        Direct Line:{' '}
                        <a href={`tel:${business.phone}`} style={{ color: theme.textPrimary, fontWeight: 600 }}>
                          {displayPhone}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          );
        }

        if (section.type === 'contact_cta') {
          return (
            <section
              key={section.id}
              id="contact"
              style={{
                padding: '60px 24px',
                backgroundColor: theme.surface,
                borderBottom: `1px solid ${theme.border}`,
              }}
            >
              <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                <h3
                  style={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    marginBottom: '12px',
                    color: theme.textPrimary,
                    fontFamily: theme.fontHeading,
                  }}
                >
                  {section.title}
                </h3>
                <p style={{ fontSize: '1rem', color: theme.textSecondary, marginBottom: '28px' }}>
                  {section.subtitle}
                </p>

                {inquirySubmitted ? (
                  <div
                    style={{
                      padding: '24px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(34, 197, 94, 0.15)',
                      border: '1px solid rgba(34, 197, 94, 0.35)',
                      color: '#86efac',
                    }}
                  >
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem' }}>Inquiry Prepared</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>
                      Thank you! In a live website deployment, this routes directly into your booking system and SMS notification channel.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={handleInquirySubmit}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      maxWidth: '520px',
                      margin: '0 auto',
                      textAlign: 'left',
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      required
                      style={{
                        padding: '12px 14px',
                        borderRadius: '6px',
                        backgroundColor: theme.background,
                        border: `1px solid ${theme.border}`,
                        color: theme.textPrimary,
                        fontSize: '0.95rem',
                        outline: 'none',
                      }}
                    />
                    <input
                      type="tel"
                      placeholder="Your Phone Number"
                      value={inquiryPhone}
                      onChange={(e) => setInquiryPhone(e.target.value)}
                      required
                      style={{
                        padding: '12px 14px',
                        borderRadius: '6px',
                        backgroundColor: theme.background,
                        border: `1px solid ${theme.border}`,
                        color: theme.textPrimary,
                        fontSize: '0.95rem',
                        outline: 'none',
                      }}
                    />
                    <textarea
                      placeholder={`How can ${business.name} assist you?`}
                      rows={3}
                      value={inquiryMsg}
                      onChange={(e) => setInquiryMsg(e.target.value)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '6px',
                        backgroundColor: theme.background,
                        border: `1px solid ${theme.border}`,
                        color: theme.textPrimary,
                        fontSize: '0.95rem',
                        outline: 'none',
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        backgroundColor: theme.primary,
                        color: '#ffffff',
                        padding: '12px',
                        borderRadius: '6px',
                        fontSize: '1rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: `0 4px 12px ${theme.border}`,
                      }}
                    >
                      <Send size={15} />
                      <span>Send Direct Inquiry</span>
                    </button>
                  </form>
                )}
              </div>
            </section>
          );
        }

        // Generic Core Sections (Services, Menu, Projects, Why Us)
        return (
          <section
            key={section.id}
            style={{
              padding: '60px 24px',
              backgroundColor: idx % 2 === 1 ? theme.surface : theme.background,
              borderBottom: `1px solid ${theme.border}`,
            }}
          >
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h3
                  style={{
                    fontSize: '1.85rem',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    marginBottom: '10px',
                    color: theme.textPrimary,
                    fontFamily: theme.fontHeading,
                  }}
                >
                  {section.title}
                </h3>
                {section.subtitle && (
                  <p
                    style={{
                      fontSize: '0.98rem',
                      color: theme.textSecondary,
                      maxWidth: '650px',
                      margin: '0 auto',
                    }}
                  >
                    {section.subtitle}
                  </p>
                )}
              </div>

              {section.items && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                    gap: '24px',
                  }}
                >
                  {section.items.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: theme.surfaceAlt,
                        borderRadius: '12px',
                        border: `1px solid ${theme.border}`,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.15s ease',
                      }}
                    >
                      {item.image && (
                        <div style={{ width: '100%', height: '180px', overflow: 'hidden' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.image}
                            alt={item.title}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block',
                            }}
                          />
                        </div>
                      )}

                      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {item.tag && (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              color: theme.accent,
                              marginBottom: '8px',
                            }}
                          >
                            {item.tag}
                          </span>
                        )}

                        <h4
                          style={{
                            fontSize: '1.15rem',
                            fontWeight: 700,
                            marginBottom: '8px',
                            color: theme.textPrimary,
                            fontFamily: theme.fontHeading,
                          }}
                        >
                          {item.title}
                        </h4>

                        <p
                          style={{
                            fontSize: '0.88rem',
                            color: theme.textSecondary,
                            lineHeight: 1.5,
                            margin: 0,
                            flex: 1,
                          }}
                        >
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        );
      })}

      {/* ====================================================================
          5. CURATED PHOTO GALLERY (INDUSTRY MATCHED)
          ==================================================================== */}
      {galleryImages && galleryImages.length > 0 && (
        <section
          style={{
            padding: '50px 24px',
            backgroundColor: theme.background,
            borderBottom: `1px solid ${theme.border}`,
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h3
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                textAlign: 'center',
                marginBottom: '24px',
                color: theme.textPrimary,
                fontFamily: theme.fontHeading,
              }}
            >
              Gallery & Visual Showcase
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
                gap: '16px',
              }}
            >
              {galleryImages.map((img, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: `1px solid ${theme.border}`,
                    aspectRatio: '4 / 3',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`${business.name} showcase ${i + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ====================================================================
          6. FOOTER
          ==================================================================== */}
      <footer
        style={{
          padding: '40px 24px',
          backgroundColor: theme.surface,
          borderTop: `1px solid ${theme.border}`,
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h4
            style={{
              fontSize: '1.1rem',
              fontWeight: 800,
              margin: '0 0 6px 0',
              color: theme.textPrimary,
              fontFamily: theme.fontHeading,
            }}
          >
            {business.name}
          </h4>
          <p style={{ fontSize: '0.825rem', color: theme.textSecondary, margin: '0 0 16px 0' }}>
            {business.address || `${business.city || 'Central'}, ${business.country || 'India'}`}
          </p>

          <div
            style={{
              fontSize: '0.75rem',
              color: theme.textSecondary,
              paddingTop: '16px',
              borderTop: `1px solid ${theme.border}`,
            }}
          >
            © {new Date().getFullYear()} {business.name}. Interactive Website Demo concept prepared by LeadFinder Agency.
          </div>
        </div>
      </footer>
    </div>
  );
};
