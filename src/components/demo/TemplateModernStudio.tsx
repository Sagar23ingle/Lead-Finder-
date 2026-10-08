'use client';

import React from 'react';
import { DemoTemplateProps } from './types';
import {
  Phone,
  MessageSquare,
  Star,
  ChevronRight,
  Award,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  Image as ImageIcon,
  Compass,
} from 'lucide-react';

export const TemplateModernStudio: React.FC<DemoTemplateProps> = ({
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
    const msg = `Hi ${name}, I submitted a project consultation on your website.\n\nName: ${inquiryName}\nPhone: ${inquiryPhone}\nProject Details: ${inquiryNotes || 'General inquiry'}`;
    const url = getClientConsultationWhatsAppUrl(msg);
    if (url) {
      window.open(url, '_blank');
      setInquirySent(true);
    } else {
      onOpenPhoneModal();
    }
  };

  return (
    <div style={{ backgroundColor: '#0d1117', color: '#f8fafc', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Editorial Navbar */}
      <nav
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '1.5rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: '#f59e0b',
              color: '#0d1117',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.15rem',
            }}
          >
            {name.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
              {name}
            </div>
            <div style={{ fontSize: '0.725rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Studio • {niche} • {city}
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
                color: '#cbd5e1',
                fontSize: '0.85rem',
                textDecoration: 'none',
                fontWeight: 500,
                padding: '6px 14px',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Phone size={14} color="#f59e0b" />
              <span>{displayPhone}</span>
            </a>
          ) : (
            <button
              onClick={onOpenPhoneModal}
              style={{
                fontSize: '0.8rem',
                color: '#f59e0b',
                background: 'none',
                border: '1px solid rgba(245, 158, 11, 0.3)',
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
              href={getClientConsultationWhatsAppUrl('Hi! I am looking to consult with your studio team.')!}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#f59e0b',
                color: '#0d1117',
                fontSize: '0.85rem',
                fontWeight: 700,
                padding: '8px 18px',
                borderRadius: '6px',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.25)',
              }}
            >
              <MessageSquare size={15} />
              <span>WhatsApp Booking</span>
            </a>
          ) : (
            <button
              onClick={onOpenPhoneModal}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f59e0b',
                color: '#0d1117',
                fontSize: '0.85rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Book Studio
            </button>
          )}
        </div>
      </nav>

      {/* Asymmetric Split Hero */}
      <section style={{ maxWidth: '1240px', margin: '0 auto', padding: '4.5rem 2rem 5rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '3.5rem',
            alignItems: 'center',
          }}
        >
          {/* Left Column: Editorial Content */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '4px 14px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                color: '#fbbf24',
                fontSize: '0.775rem',
                fontWeight: 700,
                border: '1px solid rgba(245, 158, 11, 0.25)',
                marginBottom: '1.5rem',
              }}
            >
              <Sparkles size={14} />
              <span>Architectural Minimalist Edition • {city}</span>
            </div>

            <h1
              style={{
                fontSize: '3rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                color: '#ffffff',
                marginBottom: '1.25rem',
              }}
            >
              Bespoke Spaces Crafted with Intent &amp; Clarity.
            </h1>

            <p style={{ fontSize: '1.1rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '520px' }}>
              We transform residential and commercial footprints in {city} into sculptural, high-efficiency environments that inspire.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {getClientConsultationWhatsAppUrl() ? (
                <a
                  href={getClientConsultationWhatsAppUrl(`Hi ${name}, I want to schedule a design consultation for my space in ${city}.`)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: '#f59e0b',
                    color: '#0d1117',
                    padding: '14px 28px',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)',
                  }}
                >
                  <MessageSquare size={17} />
                  <span>Start Conversation on WhatsApp</span>
                </a>
              ) : (
                <button
                  onClick={onOpenPhoneModal}
                  style={{
                    backgroundColor: '#f59e0b',
                    color: '#0d1117',
                    padding: '14px 28px',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Attach Phone to Book
                </button>
              )}

              {normalizedPhone && (
                <a
                  href={`tel:+${normalizedPhone}`}
                  style={{
                    backgroundColor: '#161b22',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#f8fafc',
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
                  <Phone size={15} color="#f59e0b" />
                  <span>Direct Call ({displayPhone})</span>
                </a>
              )}
            </div>

            {/* Floating Review Pill */}
            <div
              style={{
                marginTop: '2.5rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 16px',
                backgroundColor: '#161b22',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
              }}
            >
              <div style={{ display: 'flex', color: '#f59e0b' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}>
                {rating.toFixed(1)} Rating • {reviewCount} Google Reviews in {city}
              </span>
            </div>
          </div>

          {/* Right Column: Architectural Visual Collage */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                position: 'relative',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroImage}
                alt={`${name} project showcase`}
                style={{ width: '100%', height: '440px', objectFit: 'cover', display: 'block' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(13, 17, 23, 0.9) 0%, transparent 60%)',
                }}
              />
              <div style={{ position: 'absolute', bottom: '20px', left: '24px', right: '24px' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#f59e0b', fontWeight: 700, letterSpacing: '0.05em' }}>
                  Signature Commission
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
                  {portfolio[0]?.title || `${name} Flagship Project`}
                </div>
                <div style={{ fontSize: '0.825rem', color: '#94a3b8', marginTop: '4px' }}>
                  {city} • Fully delivered with bespoke specifications
                </div>
              </div>
            </div>

            {/* Floating Overlap Badge */}
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                right: '-10px',
                backgroundColor: '#161b22',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '10px 18px',
                borderRadius: '10px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Award size={18} color="#f59e0b" />
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffffff' }}>Verified Studio</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{city} Registry</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Stat Metric Strip */}
      <section style={{ backgroundColor: '#161b22', borderTop: '1px solid rgba(255, 255, 255, 0.06)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            padding: '2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.5rem',
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>{rating.toFixed(1)}★</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, marginTop: '2px' }}>
              Google Rating
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>{reviewCount}+</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, marginTop: '2px' }}>
              Client Reviews
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>100%</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, marginTop: '2px' }}>
              On-Time Delivery
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>{city}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, marginTop: '2px' }}>
              Local Focus
            </div>
          </div>
        </div>
      </section>

      {/* Visual Portfolio Showcase */}
      <section style={{ maxWidth: '1240px', margin: '0 auto', padding: '5rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
              Selected Works
            </div>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0, color: '#ffffff' }}>
              Recent Completed Projects
            </h2>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '420px', margin: 0 }}>
            Curated commissions delivered by {name} throughout {city} and surrounding areas.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {portfolio.map((item, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#161b22',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ position: 'relative', width: '100%', height: '220px', overflow: 'hidden' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: 'rgba(13, 17, 23, 0.85)',
                    backdropFilter: 'blur(8px)',
                    color: '#f59e0b',
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '4px',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                  }}
                >
                  {item.category}
                </span>
              </div>
              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', margin: '0 0 0.5rem 0' }}>
                    {item.title}
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
                    {item.description}
                  </p>
                </div>
                {getClientConsultationWhatsAppUrl(`Hi ${name}, I am interested in a style similar to "${item.title}". Can we discuss estimates?`) && (
                  <a
                    href={getClientConsultationWhatsAppUrl(`Hi ${name}, I am interested in a style similar to "${item.title}". Can we discuss estimates?`)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#f59e0b',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    <span>Inquire About This Space</span>
                    <ChevronRight size={14} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3-Phase Method / Philosophy */}
      <section style={{ backgroundColor: '#161b22', padding: '5rem 2rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
              The Studio Methodology
            </div>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff' }}>Our 3-Phase Workflow</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div style={{ backgroundColor: '#0d1117', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#f59e0b', marginBottom: '0.75rem' }}>01</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>Discovery &amp; Spatial Audit</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
                We understand your exact lifestyle, functional requirements, and budget parameters on-site in {city}.
              </p>
            </div>
            <div style={{ backgroundColor: '#0d1117', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#f59e0b', marginBottom: '0.75rem' }}>02</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>Curation &amp; 3D Modeling</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Interactive spatial walkthroughs, custom materiality swatches, and transparent cost estimates before construction begins.
              </p>
            </div>
            <div style={{ backgroundColor: '#0d1117', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#f59e0b', marginBottom: '0.75rem' }}>03</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>Turnkey Hand-off</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Strict quality oversight and on-time project execution with zero administrative headaches for you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Consultation Booking & Direct WhatsApp Funnel */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '5rem 2rem 6rem' }}>
        <div
          style={{
            backgroundColor: '#161b22',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '16px',
            padding: '3rem 2.5rem',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div style={{ display: 'inline-flex', padding: '4px 14px', borderRadius: '9999px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', fontSize: '0.775rem', fontWeight: 700, marginBottom: '1rem' }}>
            Direct Studio Inquiry
          </div>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.75rem 0' }}>
            Ready to Begin Your Project with {name}?
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '520px', margin: '0 auto 2rem' }}>
            Book a direct design consultation with our senior project team in {city}.
          </p>

          <form onSubmit={handleInquirySubmit} style={{ maxWidth: '500px', margin: '0 auto 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <input
              type="text"
              placeholder="Your Name / Organization"
              value={inquiryName}
              onChange={(e) => setInquiryName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: '#0d1117',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
            <input
              type="tel"
              placeholder="Your Phone / WhatsApp Number"
              value={inquiryPhone}
              onChange={(e) => setInquiryPhone(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: '#0d1117',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
            <textarea
              placeholder="Brief project details (e.g. 3BHK flat, clinic renovation, commercial office)"
              value={inquiryNotes}
              onChange={(e) => setInquiryNotes(e.target.value)}
              rows={2}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: '#0d1117',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                fontSize: '0.95rem',
                outline: 'none',
                resize: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: '#f59e0b',
                color: '#0d1117',
                padding: '14px 24px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '1rem',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)',
              }}
            >
              <MessageSquare size={17} />
              <span>Submit &amp; Chat on WhatsApp</span>
            </button>
          </form>

          {inquirySent && (
            <div style={{ color: '#34d399', fontSize: '0.85rem', fontWeight: 600 }}>
              ✓ Consultation request opened in WhatsApp.
            </div>
          )}
        </div>
      </section>

      {/* Floating WhatsApp Quick-Chat */}
      {getClientConsultationWhatsAppUrl() && (
        <a
          href={getClientConsultationWhatsAppUrl()!}
          target="_blank"
          rel="noopener noreferrer"
          title={`Chat with ${name} on WhatsApp`}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#22c55e',
            color: '#ffffff',
            borderRadius: '9999px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 700,
            fontSize: '0.9rem',
            textDecoration: 'none',
            boxShadow: '0 10px 25px rgba(34, 197, 94, 0.5)',
            zIndex: 90,
          }}
        >
          <MessageSquare size={18} />
          <span>WhatsApp (+{normalizedPhone})</span>
        </a>
      )}

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '2.5rem 2rem', textAlign: 'center', color: '#64748b', fontSize: '0.825rem' }}>
        <div>&copy; {new Date().getFullYear()} {name}. All rights reserved. • {city}</div>
        <div style={{ marginTop: '4px' }}>Modern Studio Architecture Edition • Powered by LeadFinder AI</div>
      </footer>
    </div>
  );
};
