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
    const { businessId } = await req.json();

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
