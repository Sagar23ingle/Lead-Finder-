import { NextRequest, NextResponse } from 'next/server';
import { getLeadRepository } from '@/lib/db';
import { LeadAnalyzer } from '@/lib/services/leadAnalyzer';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    const repo = getLeadRepository();

    let analysis = await repo.getLeadAnalysis(businessId);
    if (!analysis) {
      const business = await repo.getBusinessById(businessId);
      if (!business) {
        return NextResponse.json({ error: 'Business not found' }, { status: 404 });
      }

      analysis = await LeadAnalyzer.analyze(business);
      await repo.saveLeadAnalysis(analysis);
    }

    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error('Get lead analysis error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to get lead analysis' },
      { status: 500 }
    );
  }
}
