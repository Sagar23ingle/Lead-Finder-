'use client';

import React, { useState, useEffect } from 'react';
import type { Business, DemoRecord } from '@/types';
import { generateSmartDemo } from '@/lib/services/smartDemoEngine';
import {
  decodeCompactBusiness,
  generateDemoSlug,
  buildDemoPath,
  extractPlaceIdFromSlugOrId,
} from '@/lib/utils/demoUrl';
import { DemoView } from './DemoView';
import { Globe, ArrowLeft, RotateCcw, Search, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface DemoRecoveryHandlerProps {
  businessId: string;
}

export const DemoRecoveryHandler: React.FC<DemoRecoveryHandlerProps> = ({ businessId }) => {
  const [record, setRecord] = useState<DemoRecord | null>(null);
  const [isRecovering, setIsRecovering] = useState(true);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [manualQuery, setManualQuery] = useState('');
  const [isGeneratingManual, setIsGeneratingManual] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function attemptRecovery() {
      if (typeof window === 'undefined') return;

      const cleanKey = decodeURIComponent(businessId || '').trim();
      const extractedId = cleanKey.includes('--') ? cleanKey.split('--').slice(1).join('--') : null;

      // 1. Check window.localStorage for cached demo records
      try {
        const cachedDemoRaw =
          localStorage.getItem(`outreachly_demo_${cleanKey}`) ||
          (extractedId ? localStorage.getItem(`outreachly_demo_${extractedId}`) : null);

        if (cachedDemoRaw) {
          const parsed = JSON.parse(cachedDemoRaw);
          if (parsed && parsed.demo && parsed.business) {
            if (!isCancelled) {
              setRecord(parsed);
              setIsRecovering(false);
              return;
            }
          }
        }
      } catch {
        // ignore localStorage errors
      }

      // 2. Check window.localStorage for cached business objects
      let matchedBusiness: Business | null = null;
      try {
        const directBizRaw =
          localStorage.getItem(`outreachly_biz_${cleanKey}`) ||
          (extractedId ? localStorage.getItem(`outreachly_biz_${extractedId}`) : null);

        if (directBizRaw) {
          matchedBusiness = JSON.parse(directBizRaw);
        }

        if (!matchedBusiness) {
          const recentListRaw = localStorage.getItem('outreachly_recent_businesses');
          if (recentListRaw) {
            const list: Business[] = JSON.parse(recentListRaw);
            matchedBusiness =
              list.find(
                (b) =>
                  b.id === cleanKey ||
                  b.external_id === cleanKey ||
                  (extractedId && (b.id === extractedId || b.external_id === extractedId))
              ) || null;
          }
        }
      } catch {
        // ignore
      }

      // If business was found in client storage, generate smart demo immediately!
      if (matchedBusiness) {
        try {
          const demo = generateSmartDemo(matchedBusiness);
          const id = matchedBusiness.id || matchedBusiness.external_id || 'demo';
          const slug = generateDemoSlug(matchedBusiness.name, id);
          const recoveredRecord: DemoRecord = {
            id,
            slug,
            leadId: id,
            businessName: matchedBusiness.name,
            businessType: demo.businessType,
            business: matchedBusiness,
            demo,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Cache for future bare accesses
          try {
            localStorage.setItem(`outreachly_demo_${id}`, JSON.stringify(recoveredRecord));
            localStorage.setItem(`outreachly_demo_${slug}`, JSON.stringify(recoveredRecord));
          } catch {}

          // Update URL without page reload to include stateless ?d=... payload
          const permPath = buildDemoPath(matchedBusiness);
          window.history.replaceState(null, '', permPath);

          if (!isCancelled) {
            setRecord(recoveredRecord);
            setIsRecovering(false);
            return;
          }
        } catch (err) {
          console.warn('Local demo recovery failed:', err);
        }
      }

      // 3. Attempt server recovery via /api/leads or /api/crm
      try {
        const queryTarget = extractedId || cleanKey;
        const placeId = extractPlaceIdFromSlugOrId(queryTarget);

        const res = await fetch(`/api/leads?businessId=${encodeURIComponent(queryTarget)}`);
        if (res.ok) {
          const data = await res.json();
          const biz: Business | undefined = data.lead || data.leads?.[0];
          if (biz) {
            const demo = generateSmartDemo(biz);
            const id = biz.id || biz.external_id || 'demo';
            const slug = generateDemoSlug(biz.name, id);
            const recoveredRecord: DemoRecord = {
              id,
              slug,
              leadId: id,
              businessName: biz.name,
              businessType: demo.businessType,
              business: biz,
              demo,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            const permPath = buildDemoPath(biz);
            window.history.replaceState(null, '', permPath);

            if (!isCancelled) {
              setRecord(recoveredRecord);
              setIsRecovering(false);
              return;
            }
          }
        }
      } catch {
        // network or fetch error
      }

      if (!isCancelled) {
        setIsRecovering(false);
      }
    }

    attemptRecovery();

    return () => {
      isCancelled = true;
    };
  }, [businessId]);

  const handleManualGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQuery.trim() || isGeneratingManual) return;

    setIsGeneratingManual(true);
    setRecoveryError(null);

    try {
      // Create synthetic or place-based business from user query
      const placeMatch = manualQuery.match(/(ChIJ[a-zA-Z0-9_-]+)/);
      const placeId = placeMatch ? placeMatch[1] : undefined;

      const now = new Date().toISOString();
      const fallbackBusiness: Business = {
        id: placeId || `lead_${Date.now()}`,
        external_id: placeId || `lead_${Date.now()}`,
        name: manualQuery.trim(),
        category: 'Local Business',
        address: '',
        city: 'Local Area',
        country: 'India',
        phone: '',
        website: null,
        google_maps_url: null,
        rating: 4.5,
        review_count: 12,
        latitude: null,
        longitude: null,
        opening_status: 'Open Now',
        source: 'google_places',
        created_at: now,
        updated_at: now,
      };

      const demo = generateSmartDemo(fallbackBusiness);
      const id = fallbackBusiness.id;
      const slug = generateDemoSlug(fallbackBusiness.name, id);
      const freshRecord: DemoRecord = {
        id,
        slug,
        leadId: id,
        businessName: fallbackBusiness.name,
        businessType: demo.businessType,
        business: fallbackBusiness,
        demo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to server
      try {
        await fetch('/api/demos/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId: id, business: fallbackBusiness }),
        });
      } catch {}

      const permPath = buildDemoPath(fallbackBusiness);
      window.history.replaceState(null, '', permPath);
      setRecord(freshRecord);
    } catch (err: any) {
      setRecoveryError(err?.message || 'Failed to generate tailored demo.');
    } finally {
      setIsGeneratingManual(false);
    }
  };

  if (record) {
    return <DemoView record={record} />;
  }

  if (isRecovering) {
    return (
      <div
        className="outreachly-demo-page"
        style={{
          minHeight: '100vh',
          backgroundColor: '#0a0b10',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div
          style={{
            maxWidth: '460px',
            width: '100%',
            padding: '36px',
            borderRadius: '16px',
            backgroundColor: 'rgba(18, 20, 29, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.6)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(129, 140, 248, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: '#818cf8',
            }}
          >
            <Loader2 size={28} className="animate-spin" />
          </div>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: '8px',
            }}
          >
            Restoring Demo Pitch Concept
          </h2>
          <p
            style={{
              fontSize: '0.9rem',
              color: '#94a3b8',
              lineHeight: 1.6,
            }}
          >
            Reconnecting with verified lead records and synthesizing the mobile-responsive website preview...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="outreachly-demo-page"
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a0b10',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '36px',
          borderRadius: '16px',
          backgroundColor: 'rgba(18, 20, 29, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.6)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: '#f87171',
          }}
        >
          <Globe size={26} />
        </div>

        <h2
          style={{
            fontSize: '1.4rem',
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: '10px',
          }}
        >
          Demo Concept Not Found
        </h2>

        <p
          style={{
            color: '#94a3b8',
            fontSize: '0.92rem',
            lineHeight: 1.6,
            marginBottom: '24px',
          }}
        >
          The requested demo link may have expired or was visited without active lead parameters.
          You can generate an interactive demo right now for any business name or return to your leads.
        </p>

        {recoveryError && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              fontSize: '0.85rem',
              marginBottom: '16px',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={16} />
            <span>{recoveryError}</span>
          </div>
        )}

        <form onSubmit={handleManualGenerate} style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Enter business name (e.g. Skyline Interiors)..."
              value={manualQuery}
              onChange={(e) => setManualQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '11px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={isGeneratingManual || !manualQuery.trim()}
              style={{
                padding: '11px 18px',
                borderRadius: '8px',
                backgroundColor: '#6366f1',
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: isGeneratingManual || !manualQuery.trim() ? 'not-allowed' : 'pointer',
                opacity: isGeneratingManual || !manualQuery.trim() ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
              }}
            >
              {isGeneratingManual ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              <span>Generate</span>
            </button>
          </div>
        </form>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#f8fafc',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '0.88rem',
              transition: 'background 0.2s',
            }}
          >
            <ArrowLeft size={15} />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
