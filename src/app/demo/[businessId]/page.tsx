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
import { DemoRecoveryHandler } from './DemoRecoveryHandler';

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
    return { title: 'Website Demo Preview — Outreachly' };
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

  // If server cannot find or reconstruct the demo, pass to client-side recovery handler
  // which checks browser localStorage cache, CRM records, and offers instant 1-click generation
  if (!record) {
    return <DemoRecoveryHandler businessId={businessId} />;
  }

  return <DemoView record={record} />;
}
