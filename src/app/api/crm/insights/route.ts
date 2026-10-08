import { NextRequest, NextResponse } from 'next/server';
import { getLeadRepository } from '@/lib/db';
import { CrmEngine } from '@/lib/services/crmEngine';

export const dynamic = 'force-dynamic';

/**
 * GET /api/crm/insights
 * Returns computed real Business Insights, conversion rates, and Daily Action Plan
 */
export async function GET(req: NextRequest) {
  try {
    const repo = getLeadRepository();
    const [businesses, crmRecords, analyses] = await Promise.all([
      repo.getAllBusinesses(),
      repo.getAllLeadCrm(),
      repo.getAllLeadAnalyses(),
    ]);

    const insights = CrmEngine.generateBusinessInsights(businesses, crmRecords, analyses);
    const dailyActions = CrmEngine.generateDailyActionPlan(businesses, crmRecords, analyses);

    return NextResponse.json({
      success: true,
      insights,
      dailyActions,
    });
  } catch (error: any) {
    console.error('Insights API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
