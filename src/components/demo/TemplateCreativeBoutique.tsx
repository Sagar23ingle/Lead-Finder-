'use client';

import React from 'react';
import { DemoTemplateProps } from './types';
import {
  Phone,
  MessageSquare,
  Star,
  ChevronRight,
  Palette,
  Sparkles,
  Heart,
  Feather,
} from 'lucide-react';

export const TemplateCreativeBoutique: React.FC<DemoTemplateProps> = ({
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
    const msg = `Hi ${name}, I love your work and would like to collaborate!\n\nName: ${inquiryName}\nPhone: ${inquiryPhone}\nProject Vision: ${inquiryNotes || 'Custom collaboration'}`;
    const url = getClientConsultationWhatsAppUrl(msg);
    if (url) {
      window.open(url, '_blank');
      setInquirySent(true);
    } else {
      onOpenPhoneModal();
    }
  };

  return (
    <div style={{ backgroundColor: '#120d0b', color: '#fff7ed', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Artisanal Boutique Navbar */}
      <nav
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '1.5rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(249, 115, 22, 0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.2rem',
              boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)',
            }}
          >
            {name.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
              {name}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#fdba74' }}>
              Boutique Atelier • {city}
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
                color: '#fed7aa',
                fontSize: '0.85rem',
                textDecoration: 'none',
                fontWeight: 600,
                padding: '7px 14px',
                borderRadius: '9999px',
                border: '1px solid rgba(249, 115, 22, 0.25)',
                backgroundColor: '#1c1512',
              }}
            >
              <Phone size={14} color="#f97316" />
              <span>{displayPhone}</span>
            </a>
          ) : (
            <button
              onClick={onOpenPhoneModal}
              style={{
                fontSize: '0.8rem',
                color: '#f97316',
                background: 'none',
                border: '1px solid rgba(249, 115, 22, 0.4)',
                padding: '6px 12px',
                borderRadius: '9999px',
                cursor: 'pointer',
              }}
            >
              Attach Phone
            </button>
          )}

          {getClientConsultationWhatsAppUrl() ? (
            <a
              href={getClientConsultationWhatsAppUrl('Hi! I adore your portfolio and want to connect.')!}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                color: '#ffffff',
                fontSize: '0.875rem',
                fontWeight: 700,
                padding: '8px 20px',
                borderRadius: '9999px',
                textDecoration: 'none',
                boxShadow: '0 4px 18px rgba(249, 115, 22, 0.35)',
              }}
            >
              <MessageSquare size={16} />
              <span>Connect on WhatsApp</span>
            </a>
          ) : (
            <button
              onClick={onOpenPhoneModal}
              style={{
                padding: '8px 18px',
                backgroundColor: '#f97316',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 700,
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Connect
            </button>
          )}
        </div>
      </nav>

      {/* Full-Width Immersive Hero */}
      <section style={{ maxWidth: '1240px', margin: '0 auto', padding: '3.5rem 2rem 4.5rem' }}>
        <div
          style={{
            position: 'relative',
            borderRadius: '24px',
            overflow: 'hidden',
            minHeight: '480px',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt={`${name} creative showcase`}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to right, rgba(18, 13, 11, 0.95) 0%, rgba(18, 13, 11, 0.75) 50%, rgba(18, 13, 11, 0.3) 100%)',
            }}
          />

          <div style={{ position: 'relative', zIndex: 10, padding: '3.5rem 3rem', maxWidth: '620px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '4px 14px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(249, 115, 22, 0.2)',
                color: '#fdba74',
                fontSize: '0.775rem',
                fontWeight: 700,
                border: '1px solid rgba(249, 115, 22, 0.4)',
                marginBottom: '1.25rem',
              }}
            >
              <Palette size={14} color="#f97316" />
              <span>Creative Boutique Edition • {city}</span>
            </div>

            <h1 style={{ fontSize: '3.4rem', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.02em', color: '#ffffff', marginBottom: '1.25rem' }}>
              Crafting Iconic Spaces with Artisanal Soul.
            </h1>

            <p style={{ fontSize: '1.15rem', color: '#fed7aa', lineHeight: 1.6, marginBottom: '2rem' }}>
              Every space by {name} is bespoke, emotional, and timeless. Serving selective homeowners and brands in {city}.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {getClientConsultationWhatsAppUrl() ? (
                <a
                  href={getClientConsultationWhatsAppUrl(`Hi ${name}, I am captivated by your work in ${city} and would love to collaborate.`)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: 'linear-gradient(135deg, #f97316, #ea580c)',
                    color: '#ffffff',
                    padding: '14px 28px',
                    borderRadius: '9999px',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 8px 25px rgba(249, 115, 22, 0.4)',
                  }}
                >
                  <MessageSquare size={17} />
                  <span>Message on WhatsApp</span>
                </a>
              ) : (
                <button
                  onClick={onOpenPhoneModal}
                  style={{
                    backgroundColor: '#f97316',
                    color: '#ffffff',
                    padding: '14px 28px',
                    borderRadius: '9999px',
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
                    backgroundColor: 'rgba(28, 21, 18, 0.85)',
                    border: '1px solid rgba(249, 115, 22, 0.3)',
                    color: '#fff7ed',
                    padding: '14px 24px',
                    borderRadius: '9999px',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Phone size={15} color="#f97316" />
                  <span>Call Atelier ({displayPhone})</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Masonry-Style Visual Showcase */}
      <section style={{ maxWidth: '1240px', margin: '0 auto', padding: '3rem 2rem 5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ color: '#f97316', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
            The Visual Gallery
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff' }}>Curated Works in {city}</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {portfolio.map((item, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#1c1512',
                borderRadius: '16px',
                border: '1px solid rgba(249, 115, 22, 0.15)',
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
                    backgroundColor: 'rgba(18, 13, 11, 0.85)',
                    color: '#fdba74',
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    padding: '3px 12px',
                    borderRadius: '9999px',
                    border: '1px solid rgba(249, 115, 22, 0.3)',
                  }}
                >
                  {item.category}
                </span>
              </div>
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', margin: '0 0 0.5rem 0' }}>{item.title}</h3>
                  <p style={{ color: '#fed7aa', fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 1rem 0' }}>{item.description}</p>
                </div>
                {getClientConsultationWhatsAppUrl(`Hi ${name}, I am fascinated by "${item.title}". Can we talk about a project?`) && (
                  <a
                    href={getClientConsultationWhatsAppUrl(`Hi ${name}, I am fascinated by "${item.title}". Can we talk about a project?`)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#f97316', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <span>Inquire Style on WhatsApp</span>
                    <ChevronRight size={14} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Warm Boutique Consultation Card */}
      <section style={{ maxWidth: '850px', margin: '0 auto', padding: '3rem 2rem 6rem' }}>
        <div
          style={{
            backgroundColor: '#1c1512',
            border: '1px solid rgba(249, 115, 22, 0.35)',
            borderRadius: '24px',
            padding: '3rem 2.5rem',
            textAlign: 'center',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.6)',
          }}
        >
          <div style={{ display: 'inline-flex', padding: '4px 14px', borderRadius: '9999px', backgroundColor: 'rgba(249, 115, 22, 0.15)', color: '#fdba74', fontSize: '0.775rem', fontWeight: 700, marginBottom: '1rem' }}>
            Artisanal Collaboration
          </div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.75rem 0' }}>
            Let&apos;s Create Something Extraordinary
          </h2>
          <p style={{ color: '#fed7aa', fontSize: '1rem', maxWidth: '520px', margin: '0 auto 2rem' }}>
            Direct access to {name}&apos;s lead designers in {city}.
          </p>

          <form onSubmit={handleInquirySubmit} style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <input
              type="text"
              placeholder="Your Name"
              value={inquiryName}
              onChange={(e) => setInquiryName(e.target.value)}
              required
              style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: '#120d0b', border: '1px solid rgba(249, 115, 22, 0.25)', color: '#fff', fontSize: '0.95rem' }}
            />
            <input
              type="tel"
              placeholder="Your WhatsApp Number"
              value={inquiryPhone}
              onChange={(e) => setInquiryPhone(e.target.value)}
              required
              style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: '#120d0b', border: '1px solid rgba(249, 115, 22, 0.25)', color: '#fff', fontSize: '0.95rem' }}
            />
            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                color: '#fff',
                padding: '14px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '1rem',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <MessageSquare size={17} />
              <span>Connect with {name} on WhatsApp</span>
            </button>
          </form>
        </div>
      </section>

      {/* Floating WhatsApp */}
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
          <span>WhatsApp (+{normalizedPhone})</span>
        </a>
      )}

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(249, 115, 22, 0.15)', padding: '2.5rem 2rem', textAlign: 'center', color: '#a8a29e', fontSize: '0.825rem' }}>
        <div>&copy; {new Date().getFullYear()} {name}. All rights reserved. • {city}</div>
        <div style={{ marginTop: '4px', color: '#fdba74' }}>Creative Boutique Atelier Edition • Powered by LeadFinder AI</div>
      </footer>
    </div>
  );
};
