import React from 'react';
import { Metadata } from 'next';
import {
  getDemoRepository,
  decodeCompactBusiness,
  generateDemoSlug,
  DemoRecord,
} from '@/lib/db/demos';
import { generateSmartDemo } from '@/lib/services/smartDemoEngine';
import { DemoView } from './DemoView';

interface PageProps {
  params: Promise<{ businessId: string }>;
  searchParams?: Promise<{ d?: string }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { businessId } = await params;
  const demoRepo = getDemoRepository();
  let record = await demoRepo.getDemo(businessId);

  if (!record) {
    const sp = await searchParams;
    if (sp?.d) {
      const b = decodeCompactBusiness(sp.d);
      if (b) {
        const demo = generateSmartDemo(b);
        return {
          title: `${b.name} — Interactive Website Demo | ${demo.typeLabel}`,
          description: `${demo.hero.headline} — Tailored mobile-optimized website demo designed for ${b.name} in ${b.city || 'your area'}.`,
        };
      }
    }
    return { title: 'Website Demo — Lead Finder' };
  }

  const { business, demo } = record;
  return {
    title: `${business.name} — Interactive Website Demo | ${demo.typeLabel}`,
    description: `${demo.hero.headline} — Tailored mobile-optimized website demo designed for ${business.name} in ${business.city || 'your area'}.`,
  };
}

export default async function DemoPage({ params, searchParams }: PageProps) {
  const { businessId } = await params;
  const demoRepo = getDemoRepository();
  let record: DemoRecord | null = await demoRepo.getDemo(businessId);

  if (!record) {
    const sp = await searchParams;
    if (sp?.d) {
      const b = decodeCompactBusiness(sp.d);
      if (b) {
        const demo = generateSmartDemo(b);
        const id = b.id || 'demo';
        const slug = generateDemoSlug(b.name, id);
        record = {
          id,
          slug,
          leadId: id,
          businessName: b.name,
          businessType: demo.businessType,
          business: b,
          demo,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await demoRepo.saveDemo(record);
      }
    }
  }

  if (!record) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div
          style={{
            maxWidth: '520px',
            padding: '32px',
            borderRadius: '16px',
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }}
        >
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              marginBottom: '12px',
            }}
          >
            Demo Session Not Found
          </h2>
          <p
            style={{
              color: '#94a3b8',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}
          >
            This serverless container does not have this demo cached in active
            memory. Demos can be re-generated on the main dashboard with 1
            click. Connect Supabase credentials in Vercel for permanent cloud
            persistence across all serverless restarts.
          </p>
          <a
            href="/"
            style={{
              display: 'inline-block',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '0.9rem',
            }}
          >
            ← Return to Leads Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <DemoView record={record} />;
}
