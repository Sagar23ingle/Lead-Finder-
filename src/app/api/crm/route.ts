import { NextRequest, NextResponse } from 'next/server';
import { getLeadRepository, createDefaultCrmRecord } from '@/lib/db';
import { LeadCrmRecord } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/crm
 * Query params: ?businessId=xyz (optional)
 * Returns all CRM records or specific record, plus computed live metrics
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId');
    const repo = getLeadRepository();

    if (businessId) {
      const record = await repo.getLeadCrm(businessId);
      return NextResponse.json({ success: true, record });
    }

    const [crmRecords, metrics, businesses] = await Promise.all([
      repo.getAllLeadCrm(),
      repo.getCrmMetrics(),
      repo.getAllBusinesses(),
    ]);

    return NextResponse.json({
      success: true,
      crmRecords,
      metrics,
      businesses,
    });
  } catch (error: any) {
    console.error('CRM GET error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch CRM records' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/crm
 * Body: { record: LeadCrmRecord }
 * Saves or updates a lead's CRM record (stage, notes, contact, replies, outreach, etc.)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const repo = getLeadRepository();

    if (body.action === 'track_demo' && body.businessId) {
      let existing = await repo.getLeadCrm(body.businessId);
      if (!existing) {
        const business = await repo.getBusinessById(body.businessId);
        if (business) {
          const analysis = await repo.getLeadAnalysis(body.businessId);
          existing = createDefaultCrmRecord(business, analysis);
        }
      }
      if (existing) {
        existing.demoShared = true;
        existing.demoSharedAt = new Date().toISOString();
        await repo.saveLeadCrm(existing);
        const metrics = await repo.getCrmMetrics();
        return NextResponse.json({ success: true, record: existing, metrics });
      }
      return NextResponse.json({ error: 'Business not found for demo tracking' }, { status: 404 });
    }

    if (body.action === 'update_phone' && body.businessId && body.phone !== undefined) {
      let existing = await repo.getLeadCrm(body.businessId);
      if (!existing) {
        const business = await repo.getBusinessById(body.businessId);
        if (business) {
          const analysis = await repo.getLeadAnalysis(body.businessId);
          existing = createDefaultCrmRecord(business, analysis);
        }
      }
      if (existing) {
        existing.contactPhone = body.phone.trim();
        await repo.saveLeadCrm(existing);
        return NextResponse.json({ success: true, phone: existing.contactPhone });
      }
      return NextResponse.json({ error: 'Business not found for phone update' }, { status: 404 });
    }

    const record: LeadCrmRecord = body.record;

    if (!record || !record.businessId) {
      return NextResponse.json(
        { error: 'Valid CRM record with businessId is required' },
        { status: 400 }
      );
    }

    await repo.saveLeadCrm(record);

    const updatedRecord = await repo.getLeadCrm(record.businessId);
    const metrics = await repo.getCrmMetrics();

    return NextResponse.json({
      success: true,
      record: updatedRecord,
      metrics,
      message: 'CRM record updated successfully',
    });
  } catch (error: any) {
    console.error('CRM POST error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to save CRM record' },
      { status: 500 }
    );
  }
}
