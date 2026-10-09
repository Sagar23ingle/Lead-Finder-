import { NextRequest, NextResponse } from 'next/server';
import { getLeadRepository } from '@/lib/db';
import { CrmEngine } from '@/lib/services/crmEngine';

export const dynamic = 'force-dynamic';

/**
 * POST /api/crm/proposal
 * Body: { businessId: string }
 * Generates a tailored mini proposal for a lead
 */
export async function POST(req: NextRequest) {
  try {
    const { businessId, business: rawBusiness } = await req.json();

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
    const proposal = CrmEngine.generateMiniProposal(business, analysis);

    return NextResponse.json({
      success: true,
      proposal,
    });
  } catch (error: any) {
    console.error('Proposal generation error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate proposal' },
      { status: 500 }
    );
  }
}
