import { NextResponse } from 'next/server';
import { getLeadRepository } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const repo = getLeadRepository();
    const summary = await repo.getBestOpportunities();
    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error('Failed to get best opportunities summary:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to retrieve opportunities summary' },
      { status: 500 }
    );
  }
}
