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
    const { businessId, replyText } = await req.json();

    if (!businessId || !replyText || !replyText.trim()) {
      return NextResponse.json(
        { error: 'businessId and replyText are required' },
        { status: 400 }
      );
    }

    const repo = getLeadRepository();
    const business = await repo.getBusinessById(businessId);

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const analysis = await repo.getLeadAnalysis(businessId);
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
