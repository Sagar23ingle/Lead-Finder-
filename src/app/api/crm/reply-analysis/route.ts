import { NextRequest, NextResponse } from 'next/server';
import { getLeadRepository } from '@/lib/db';
import { CrmEngine } from '@/lib/services/crmEngine';

export const dynamic = 'force-dynamic';

/**
 * POST /api/crm/reply-analysis
 * Body: { businessId: string, replyText: string }
 * Analyzes prospect response and returns strategic response recommendations
 */
export async function POST(req: NextRequest) {
  try {
    const { businessId, replyText, business: rawBusiness } = await req.json();

    if ((!businessId && !rawBusiness) || !replyText || !replyText.trim()) {
      return NextResponse.json(
        { error: 'businessId or business, and replyText are required' },
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
    const aiAnalysis = await CrmEngine.analyzeProspectReply(
      replyText.trim(),
      business,
      analysis
    );

    return NextResponse.json({
      success: true,
      aiAnalysis,
      classification: {
        category: aiAnalysis.classification,
        recommendedAction: aiAnalysis.nextAction,
        intent: aiAnalysis.intent,
      },
    });
  } catch (error: any) {
    console.error('Reply analysis error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to analyze reply' },
      { status: 500 }
    );
  }
}
