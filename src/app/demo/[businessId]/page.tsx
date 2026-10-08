import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getDemoRepository } from '@/lib/db/demos';
import { DemoView } from './DemoView';

interface PageProps {
  params: Promise<{ businessId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { businessId } = await params;
  const demoRepo = getDemoRepository();
  const record = await demoRepo.getDemo(businessId);

  if (!record) {
    return { title: 'Website Demo Not Found — Lead Finder' };
  }

  const { business, demo } = record;
  return {
    title: `${business.name} — Interactive Website Demo | ${demo.typeLabel}`,
    description: `${demo.hero.headline} — Tailored mobile-optimized website demo designed for ${business.name} in ${business.city || 'your area'}.`,
  };
}

export default async function DemoPage({ params }: PageProps) {
  const { businessId } = await params;
  const demoRepo = getDemoRepository();
  const record = await demoRepo.getDemo(businessId);

  if (!record) {
    notFound();
  }

  return <DemoView record={record} />;
}
