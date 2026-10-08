'use client';

import React from 'react';
import { DemoTemplateProps } from './types';
import {
  Phone,
  MessageSquare,
  Star,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Users,
  Check,
  ArrowRight,
} from 'lucide-react';

export const TemplateCorporateClean: React.FC<DemoTemplateProps> = ({
  name,
  niche,
  city,
  rating,
  reviewCount,
  normalizedPhone,
  displayPhone,
  heroImage,
  portfolio,
  services,
  getClientConsultationWhatsAppUrl,
  onOpenPhoneModal,
  inquiryName,
  setInquiryName,
  inquiryPhone,
  setInquiryPhone,
  inquiryNotes,
  setInquiryNotes,
  inquirySent,
  setInquirySent,
}) => {
  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryPhone.trim()) return;
    const msg = `Hi ${name}, I am requesting a formal quote from your official website.\n\nName: ${inquiryName}\nPhone: ${inquiryPhone}\nProject Scope: ${inquiryNotes || 'General quotation'}`;
    const url = getClientConsultationWhatsAppUrl(msg);
    if (url) {
      window.open(url, '_blank');
      setInquirySent(true);
    } else {
      onOpenPhoneModal();
    }
  };

  return (
    <div style={{ backgroundColor: '#090e1a', color: '#f8fafc', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Executive Navbar */}
      <nav
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '1.25rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
          backgroundColor: '#0f172a',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.2rem',
            }}
          >
            {name.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
              {name}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#93c5fd', fontWeight: 600 }}>
              Certified Commercial &amp; Residential • {city}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {normalizedPhone ? (
            <a
              href={`tel:+${normalizedPhone}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: '#f8fafc',
                fontSize: '0.85rem',
                textDecoration: 'none',
                fontWeight: 600,
                padding: '7px 14px',
                borderRadius: '6px',
                border: '1px solid #334155',
                backgroundColor: '#1e293b',
              }}
            >
              <Phone size={14} color="#3b82f6" />
              <span>{displayPhone}</span>
            </a>
          ) : (
            <button
              onClick={onOpenPhoneModal}
              style={{
                fontSize: '0.8rem',
                color: '#60a5fa',
                background: 'none',
                border: '1px solid #2563eb',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Attach Phone
            </button>
          )}

          {getClientConsultationWhatsAppUrl() ? (
            <a
              href={getClientConsultationWhatsAppUrl('Hi! I would like to request a formal quote.')!}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontSize: '0.875rem',
                fontWeight: 700,
                padding: '8px 18px',
                borderRadius: '6px',
                textDecoration: 'none',
              }}
            >
              <MessageSquare size={16} />
              <span>Request Quote on WhatsApp</span>
            </a>
          ) : (
            <button
              onClick={onOpenPhoneModal}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Get Free Quote
            </button>
          )}
        </div>
      </nav>

      {/* 2-Column High-Conversion Hero */}
      <section style={{ maxWidth: '1240px', margin: '0 auto', padding: '4.5rem 2rem 4rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '3.5rem',
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '4px 14px',
                borderRadius: '6px',
                backgroundColor: 'rgba(37, 99, 235, 0.15)',
                color: '#93c5fd',
                fontSize: '0.775rem',
                fontWeight: 700,
                border: '1px solid rgba(59, 130, 246, 0.3)',
                marginBottom: '1.25rem',
              }}
            >
              <ShieldCheck size={14} color="#60a5fa" />
              <span>Verified Local Business • {city}</span>
            </div>

            <h1
              style={{
                fontSize: '3.2rem',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                color: '#ffffff',
                marginBottom: '1.25rem',
              }}
            >
              Leading {niche} in {city} with Guaranteed Timelines.
            </h1>

            <p style={{ fontSize: '1.1rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              Transparent pricing, verified client references, and direct project tracking on WhatsApp.
            </p>

            {/* Trust Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#f8fafc' }}>
                <CheckCircle2 size={16} color="#10b981" />
                <span>Verified {rating.toFixed(1)}★ rating on Google across {reviewCount} reviews</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#f8fafc' }}>
                <CheckCircle2 size={16} color="#10b981" />
                <span>Transparent fixed quotes with 0 hidden surcharges</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#f8fafc' }}>
                <CheckCircle2 size={16} color="#10b981" />
                <span>Direct WhatsApp project coordination with senior leads</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {getClientConsultationWhatsAppUrl() ? (
                <a
                  href={getClientConsultationWhatsAppUrl(`Hi ${name}, I am looking for a project estimate in ${city}.`)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    padding: '14px 28px',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)',
                  }}
                >
                  <MessageSquare size={17} />
                  <span>Get Instant Estimate on WhatsApp</span>
                </a>
              ) : (
                <button
                  onClick={onOpenPhoneModal}
                  style={{
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    padding: '14px 28px',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Attach Phone
                </button>
              )}

              {normalizedPhone && (
                <a
                  href={`tel:+${normalizedPhone}`}
                  style={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    color: '#ffffff',
                    padding: '14px 24px',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Phone size={15} color="#3b82f6" />
                  <span>Call {displayPhone}</span>
                </a>
              )}
            </div>
          </div>

          {/* Right Column: High-Trust Featured Showcase */}
          <div>
            <div
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                backgroundColor: '#0f172a',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                boxShadow: '0 20px 45px rgba(0, 0, 0, 0.6)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroImage}
                alt={`${name} showcase`}
                style={{ width: '100%', height: '360px', objectFit: 'cover', display: 'block' }}
              />
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
                    Commercial &amp; Residential
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
                    ✓ 100% Quality Inspected
                  </span>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
                  {portfolio[0]?.title || `${name} Project Delivery`}
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '6px', lineHeight: 1.5 }}>
                  Full turnkey delivery executed on schedule in {city}. Includes post-completion guarantee.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process Ribbon */}
      <section style={{ backgroundColor: '#0f172a', padding: '4.5rem 2rem', borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ color: '#38bdf8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
              Structured Process
            </div>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff' }}>How We Deliver in 3 Simple Steps</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div style={{ backgroundColor: '#090e1a', padding: '2rem', borderRadius: '12px', border: '1px solid #1e293b' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '1rem' }}>
                1
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>Site Survey &amp; Free Assessment</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6 }}>
                We inspect your location in {city}, evaluate scope, and provide clear cost recommendations.
              </p>
            </div>
            <div style={{ backgroundColor: '#090e1a', padding: '2rem', borderRadius: '12px', border: '1px solid #1e293b' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '1rem' }}>
                2
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>Transparent Milestone Quotation</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Fixed pricing with written deliverables and realistic delivery timelines before kickoff.
              </p>
            </div>
            <div style={{ backgroundColor: '#090e1a', padding: '2rem', borderRadius: '12px', border: '1px solid #1e293b' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '1rem' }}>
                3
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>Quality Hand-Off &amp; Guarantee</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6 }}>
                On-time completion backed by professional warranty and direct customer support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section style={{ maxWidth: '1240px', margin: '0 auto', padding: '5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ color: '#38bdf8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
            Proven Track Record
          </div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff' }}>Completed Projects Across {city}</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {portfolio.map((item, idx) => (
            <div key={idx} style={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt={item.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              <div style={{ padding: '1.25rem' }}>
                <div style={{ fontSize: '0.725rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                  {item.category}
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>{item.title}</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1rem' }}>{item.description}</p>
                {getClientConsultationWhatsAppUrl(`Hi ${name}, I am looking for a quote on a project similar to "${item.title}".`) && (
                  <a
                    href={getClientConsultationWhatsAppUrl(`Hi ${name}, I am looking for a quote on a project similar to "${item.title}".`)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#60a5fa', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <span>Request Similar Scope Quote</span>
                    <ArrowRight size={13} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Verified Reviews Section */}
      <section style={{ backgroundColor: '#0f172a', padding: '4.5rem 2rem', borderTop: '1px solid #1e293b' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', color: '#f59e0b', marginBottom: '8px' }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={22} fill="#f59e0b" color="#f59e0b" />
            ))}
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
            {rating.toFixed(1)} Out of 5.0 Rating on Google
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '2.5rem' }}>
            Based on {reviewCount} verified Google reviews from satisfied clients across {city}.
          </p>

          <div style={{ backgroundColor: '#090e1a', border: '1px solid #1e293b', borderRadius: '14px', padding: '2.5rem', maxWidth: '650px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
              Request a Fast Consultation &amp; Quote
            </h3>
            <form onSubmit={handleInquirySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <input
                type="text"
                placeholder="Full Name"
                value={inquiryName}
                onChange={(e) => setInquiryName(e.target.value)}
                required
                style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', fontSize: '0.9rem' }}
              />
              <input
                type="tel"
                placeholder="Mobile / WhatsApp Number"
                value={inquiryPhone}
                onChange={(e) => setInquiryPhone(e.target.value)}
                required
                style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', fontSize: '0.9rem' }}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: '#2563eb',
                  color: '#fff',
                  padding: '14px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Send Request to {name} on WhatsApp
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp */}
      {getClientConsultationWhatsAppUrl() && (
        <a
          href={getClientConsultationWhatsAppUrl()!}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#22c55e',
            color: '#fff',
            borderRadius: '9999px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 700,
            fontSize: '0.9rem',
            textDecoration: 'none',
            boxShadow: '0 10px 25px rgba(34, 197, 94, 0.4)',
            zIndex: 90,
          }}
        >
          <MessageSquare size={18} />
          <span>WhatsApp ({displayPhone || `+${normalizedPhone}`})</span>
        </a>
      )}

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1e293b', padding: '2.5rem 2rem', textAlign: 'center', color: '#64748b', fontSize: '0.825rem' }}>
        <div>&copy; {new Date().getFullYear()} {name}. All rights reserved. • {city}</div>
        <div style={{ marginTop: '4px' }}>Corporate Clean &amp; Trust Edition • Powered by LeadFinder AI</div>
      </footer>
    </div>
  );
};
