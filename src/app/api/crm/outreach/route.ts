import { NextRequest, NextResponse } from 'next/server';
import { getLeadRepository } from '@/lib/db';
import { CrmEngine } from '@/lib/services/crmEngine';

export const dynamic = 'force-dynamic';

/**
 * POST /api/crm/outreach
 * Body: { businessId: string, contactPerson?: string }
 * Returns personalized outreach messages & follow-up sequence
 */
export async function POST(req: NextRequest) {
  try {
    const { businessId, contactPerson } = await req.json();

    if (!businessId) {
      return NextResponse.json(
        { error: 'businessId is required' },
        { status: 400 }
      );
    }

    const repo = getLeadRepository();
    const business = await repo.getBusinessById(businessId);

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const analysis = await repo.getLeadAnalysis(businessId);
    const messages = CrmEngine.generateOutreach(business, analysis, contactPerson);
    const followUpSequence = CrmEngine.generateFollowUpSequence(business, analysis);

    return NextResponse.json({
      success: true,
      messages,
      followUpSequence,
    });
  } catch (error: any) {
    console.error('Outreach generation error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate outreach' },
      { status: 500 }
    );
  }
}
