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
    const { businessId, contactPerson, business: rawBusiness } = await req.json();

    if (!businessId && !rawBusiness) {
      return NextResponse.json(
        { error: 'businessId or business object is required' },
        { status: 400 }
      );
    }

    const repo = getLeadRepository();
    let business = businessId ? await repo.getBusinessById(businessId) : null;
    if (!business && rawBusiness) {
      business = rawBusiness;
    }

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    let analysis = businessId ? await repo.getLeadAnalysis(businessId) : null;
    if (!analysis) {
      try {
        const { LeadAnalyzer } = await import('@/lib/services/leadAnalyzer');
        analysis = await LeadAnalyzer.analyze(business);
      } catch {}
    }
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
