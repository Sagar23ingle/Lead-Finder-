import { NextRequest, NextResponse } from 'next/server';
import { getLeadRepository } from '@/lib/db';
import { CrmEngine } from '@/lib/services/crmEngine';

export const dynamic = 'force-dynamic';

/**
 * POST /api/crm/optimize-outreach
 * Body: { businessId: string, message: string }
 * Analyzes message for personalization score, spam risk, clarity, and generates final polished version
 */
export async function POST(req: NextRequest) {
  try {
    const { businessId, message } = await req.json();

    if (!businessId || !message) {
      return NextResponse.json(
        { error: 'businessId and message are required' },
        { status: 400 }
      );
    }

    const repo = getLeadRepository();
    const business = await repo.getBusinessById(businessId);

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const analysis = await repo.getLeadAnalysis(businessId);
    const optimization = CrmEngine.optimizeOutreach(message, business, analysis);

    return NextResponse.json({
      success: true,
      optimization,
    });
  } catch (error: any) {
    console.error('Outreach optimization error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to optimize outreach' },
      { status: 500 }
    );
  }
}
