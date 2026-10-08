import { NextResponse } from 'next/server';
import { getLeadRepository } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const repo = getLeadRepository();
    const searches = await repo.getSearches(30);
    return NextResponse.json({ searches });
  } catch (error: any) {
    console.error('Failed to get searches:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to retrieve search history' },
      { status: 500 }
    );
  }
}
