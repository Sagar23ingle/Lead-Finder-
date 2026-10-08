import { NextRequest, NextResponse } from 'next/server';
import { getLeadRepository } from '@/lib/db';
import { CrmEngine } from '@/lib/services/crmEngine';

export const dynamic = 'force-dynamic';

/**
 * GET /api/crm/export-html?businessId=xyz
 * Returns standalone single-file HTML as direct downloadable attachment
 */
export async function GET(req: NextRequest) {
  try {
    const businessId = req.nextUrl.searchParams.get('businessId');
    const template = (req.nextUrl.searchParams.get('template') || undefined) as any;

    if (!businessId) {
      return NextResponse.json({ error: 'businessId is required' }, { status: 400 });
    }

    const repo = getLeadRepository();
    const business = await repo.getBusinessById(businessId);

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const analysis = await repo.getLeadAnalysis(businessId);
    const html = CrmEngine.exportStandaloneHtml(business, analysis, template);
    const fileName = `${business.name.replace(/[^a-zA-Z0-9]/g, '_')}_${template || 'demo'}.html`;

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    console.error('HTML export GET error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to export HTML' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/crm/export-html
 * Body: { businessId: string, template?: string }
 * Generates standalone single-file HTML for free hosting or sharing
 */
export async function POST(req: NextRequest) {
  try {
    const { businessId, template } = await req.json();

    if (!businessId) {
      return NextResponse.json({ error: 'businessId is required' }, { status: 400 });
    }

    const repo = getLeadRepository();
    const business = await repo.getBusinessById(businessId);

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const analysis = await repo.getLeadAnalysis(businessId);
    const html = CrmEngine.exportStandaloneHtml(business, analysis, template);

    return NextResponse.json({
      success: true,
      html,
      fileName: `${business.name.replace(/[^a-zA-Z0-9]/g, '_')}_${template || 'demo'}.html`,
    });
  } catch (error: any) {
    console.error('HTML export POST error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to export HTML' },
      { status: 500 }
    );
  }
}
