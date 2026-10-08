'use client';

import React from 'react';
import { DemoTemplateProps } from './types';
import {
  Phone,
  MessageSquare,
  Star,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Crown,
  Zap,
} from 'lucide-react';

export const TemplateLuxuryDark: React.FC<DemoTemplateProps> = ({
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
    const msg = `Hi ${name}, I am requesting a VIP consultation from your website.\n\nName: ${inquiryName}\nPhone: ${inquiryPhone}\nProject Scope: ${inquiryNotes || 'Full turnkey project'}`;
    const url = getClientConsultationWhatsAppUrl(msg);
    if (url) {
      window.open(url, '_blank');
      setInquirySent(true);
    } else {
      onOpenPhoneModal();
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#050811',
        backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.15) 0%, transparent 60%)',
        color: '#ffffff',
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Obsidian Glass Navbar */}
      <nav
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '1.25rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(6, 182, 212, 0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.25rem',
              color: '#050811',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.5)',
            }}
          >
            {name.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
              {name}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#67e8f9', fontWeight: 600 }}>
              VIP Luxury Edition • {city}
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
                fontWeight: 600,
                padding: '8px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
              }}
            >
              <Phone size={14} color="#06b6d4" />
              <span>{displayPhone}</span>
            </a>
          ) : (
            <button
              onClick={onOpenPhoneModal}
              style={{
                fontSize: '0.8rem',
                color: '#06b6d4',
                background: 'none',
                border: '1px solid rgba(6, 182, 212, 0.3)',
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
              href={getClientConsultationWhatsAppUrl('Hi! I would like to inquire about your luxury services.')!}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, #06b6d4, #10b981)',
                color: '#050811',
                fontSize: '0.875rem',
                fontWeight: 800,
                padding: '9px 20px',
                borderRadius: '8px',
                textDecoration: 'none',
                boxShadow: '0 0 25px rgba(6, 182, 212, 0.4)',
              }}
            >
              <MessageSquare size={16} />
              <span>VIP WhatsApp Access</span>
            </a>
          ) : (
            <button
              onClick={onOpenPhoneModal}
              style={{
                padding: '9px 18px',
                backgroundColor: '#06b6d4',
                color: '#050811',
                fontSize: '0.85rem',
                fontWeight: 800,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              VIP Access
            </button>
          )}
        </div>
      </nav>

      {/* Centered High-Impact Obsidian Hero */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '5rem 2rem 4rem', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '6px 18px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            color: '#67e8f9',
            fontSize: '0.8rem',
            fontWeight: 700,
            border: '1px solid rgba(6, 182, 212, 0.3)',
            boxShadow: '0 0 15px rgba(6, 182, 212, 0.2)',
            marginBottom: '1.75rem',
          }}
        >
          <Crown size={14} color="#06b6d4" />
          <span>Obsidian Glassmorphism Edition • {city}</span>
        </div>

        <h1
          style={{
            fontSize: '3.6rem',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: '#ffffff',
            marginBottom: '1.5rem',
          }}
        >
          Next-Generation Luxury Spaces with{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #10b981)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Precision Architecture.
          </span>
        </h1>

        <p style={{ fontSize: '1.2rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: '680px', margin: '0 auto 2.5rem' }}>
          {name} represents the gold standard in {niche.toLowerCase()} for discerning clients in {city}. Verified {rating.toFixed(1)}★ reputation across {reviewCount} client reviews.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {getClientConsultationWhatsAppUrl() ? (
            <a
              href={getClientConsultationWhatsAppUrl(`Hi ${name}, I am looking for a premier consultation for my property in ${city}.`)!}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #10b981)',
                color: '#050811',
                padding: '16px 36px',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                boxShadow: '0 0 35px rgba(6, 182, 212, 0.45)',
              }}
            >
              <MessageSquare size={18} />
              <span>Book Priority WhatsApp Consultation</span>
            </a>
          ) : (
            <button
              onClick={onOpenPhoneModal}
              style={{
                backgroundColor: '#06b6d4',
                color: '#050811',
                padding: '16px 32px',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Attach Phone Number
            </button>
          )}

          {normalizedPhone && (
            <a
              href={`tel:+${normalizedPhone}`}
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                color: '#ffffff',
                padding: '16px 28px',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              <Phone size={16} color="#06b6d4" />
              <span>Direct Phone ({displayPhone})</span>
            </a>
          )}
        </div>

        {/* Featured Glassmorphism Flagship Showcase Card */}
        <div
          style={{
            marginTop: '4rem',
            borderRadius: '20px',
            overflow: 'hidden',
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(6, 182, 212, 0.35)',
            boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.9), 0 0 30px rgba(6, 182, 212, 0.2)',
            position: 'relative',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt={`${name} luxury showcase`}
            style={{ width: '100%', height: '480px', objectFit: 'cover', display: 'block' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(5, 8, 17, 0.95) 0%, rgba(5, 8, 17, 0.3) 60%, transparent 100%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '28px',
              left: '32px',
              right: '32px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: '1rem',
              textAlign: 'left',
            }}
          >
            <div>
              <div style={{ color: '#06b6d4', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Flagship Masterpiece • {city}
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
                {portfolio[0]?.title || `${name} Custom Residence`}
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '0.9rem', maxWidth: '520px', marginTop: '4px' }}>
                Executed with bespoke luxury specifications, imported finishes, and smart ambient automation.
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(5, 8, 17, 0.85)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                padding: '12px 20px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#06b6d4' }}>{rating.toFixed(1)}★</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Google Score</div>
              </div>
              <div style={{ width: '1px', height: '30px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981' }}>{reviewCount}</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Reviews</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VIP Glassmorphic Metrics Ribbon */}
      <section style={{ maxWidth: '1240px', margin: '0 auto 4rem', padding: '0 2rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              padding: '1.75rem',
              borderRadius: '14px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#06b6d4' }}>48+</div>
            <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginTop: '4px' }}>
              Luxury Spaces Completed
            </div>
          </div>
          <div
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              padding: '1.75rem',
              borderRadius: '14px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#10b981' }}>99%</div>
            <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginTop: '4px' }}>
              Client Satisfaction
            </div>
          </div>
          <div
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              padding: '1.75rem',
              borderRadius: '14px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#06b6d4' }}>{city}</div>
            <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginTop: '4px' }}>
              Exclusive Local Practice
            </div>
          </div>
          <div
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              padding: '1.75rem',
              borderRadius: '14px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#10b981' }}>1-on-1</div>
            <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginTop: '4px' }}>
              Direct VIP WhatsApp Funnel
            </div>
          </div>
        </div>
      </section>

      {/* Dark Glass Portfolio Showcase */}
      <section style={{ maxWidth: '1240px', margin: '0 auto', padding: '4rem 2rem 5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ color: '#06b6d4', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
            Exclusive Commissions
          </div>
          <h2 style={{ fontSize: '2.75rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0, color: '#ffffff' }}>
            Curated Luxury Portfolio
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {portfolio.map((item, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(16px)',
                borderRadius: '16px',
                border: '1px solid rgba(6, 182, 212, 0.2)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
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
                    backgroundColor: 'rgba(5, 8, 17, 0.85)',
                    backdropFilter: 'blur(10px)',
                    color: '#67e8f9',
                    fontSize: '0.725rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                  }}
                >
                  {item.category}
                </span>
              </div>
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.5rem 0' }}>
                    {item.title}
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
                    {item.description}
                  </p>
                </div>
                {getClientConsultationWhatsAppUrl(`Hi ${name}, I am interested in a luxury project similar to "${item.title}". Can we schedule a VIP call?`) && (
                  <a
                    href={getClientConsultationWhatsAppUrl(`Hi ${name}, I am interested in a luxury project similar to "${item.title}". Can we schedule a VIP call?`)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#10b981',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    <span>Request VIP Estimate</span>
                    <ChevronRight size={14} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Obsidian Consultation Card */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem 6rem' }}>
        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            borderRadius: '20px',
            padding: '3rem 2.5rem',
            textAlign: 'center',
            boxShadow: '0 0 40px rgba(6, 182, 212, 0.2)',
          }}
        >
          <div style={{ display: 'inline-flex', padding: '4px 14px', borderRadius: '9999px', backgroundColor: 'rgba(6, 182, 212, 0.15)', color: '#67e8f9', fontSize: '0.775rem', fontWeight: 800, marginBottom: '1rem' }}>
            VIP Engagement
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ffffff', margin: '0 0 0.75rem 0' }}>
            Schedule Your Private Consultation
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '540px', margin: '0 auto 2rem' }}>
            Connect with the principal design director of {name} in {city} via direct WhatsApp.
          </p>

          <form onSubmit={handleInquirySubmit} style={{ maxWidth: '500px', margin: '0 auto 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <input
              type="text"
              placeholder="Your Full Name"
              value={inquiryName}
              onChange={(e) => setInquiryName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: '#050811',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                color: '#ffffff',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
            <input
              type="tel"
              placeholder="Your Direct WhatsApp Number"
              value={inquiryPhone}
              onChange={(e) => setInquiryPhone(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: '#050811',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                color: '#ffffff',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
            <textarea
              placeholder="Project Scope &amp; Target Budget"
              value={inquiryNotes}
              onChange={(e) => setInquiryNotes(e.target.value)}
              rows={2}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: '#050811',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                color: '#ffffff',
                fontSize: '0.95rem',
                outline: 'none',
                resize: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #10b981)',
                color: '#050811',
                padding: '15px 24px',
                borderRadius: '8px',
                fontWeight: 900,
                fontSize: '1rem',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 0 25px rgba(6, 182, 212, 0.4)',
              }}
            >
              <MessageSquare size={18} />
              <span>Connect on WhatsApp VIP</span>
            </button>
          </form>

          {inquirySent && (
            <div style={{ color: '#34d399', fontSize: '0.85rem', fontWeight: 600 }}>
              ✓ VIP consultation request opened in WhatsApp.
            </div>
          )}
        </div>
      </section>

      {/* Pulsating Floating WhatsApp */}
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
            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
            color: '#050811',
            borderRadius: '9999px',
            padding: '12px 22px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 800,
            fontSize: '0.9rem',
            textDecoration: 'none',
            boxShadow: '0 0 30px rgba(16, 185, 129, 0.6)',
            zIndex: 90,
          }}
        >
          <MessageSquare size={18} />
          <span>VIP Chat (+{normalizedPhone})</span>
        </a>
      )}

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(6, 182, 212, 0.15)', padding: '2.5rem 2rem', textAlign: 'center', color: '#64748b', fontSize: '0.825rem' }}>
        <div>&copy; {new Date().getFullYear()} {name}. All rights reserved. • {city}</div>
        <div style={{ marginTop: '4px', color: '#67e8f9' }}>Luxury Dark Glassmorphism Edition • Powered by LeadFinder AI</div>
      </footer>
    </div>
  );
};
