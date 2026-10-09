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
    const { businessId, message, business: rawBusiness } = await req.json();

    if ((!businessId && !rawBusiness) || !message) {
      return NextResponse.json(
        { error: 'businessId or business, and message are required' },
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
