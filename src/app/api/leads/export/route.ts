import { NextRequest, NextResponse } from 'next/server';
import { getLeadRepository } from '@/lib/db';
import { checkRateLimit } from '@/lib/security/rateLimiter';
import { createSafeErrorResponse } from '@/lib/security/validation';
import { generateLeadsCsv, generateLeadsTsv } from '@/lib/utils/exportLeads';
import { Business } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // 1. Rate Limiting
  const rateLimit = checkRateLimit(req, 'export');
  if (!rateLimit.allowed && rateLimit.errorResponse) {
    return rateLimit.errorResponse;
  }

  try {
    const body = await req.json().catch(() => ({}));
    const format = (body.format || 'csv').toLowerCase();
    const searchId = body.searchId;
    const businessIds = Array.isArray(body.businessIds) ? body.businessIds : null;

    const repo = getLeadRepository();
    let businesses: Business[] = [];

    if (searchId) {
      const searchRecord = await repo.getSearchById(String(searchId));
      businesses = searchRecord?.businesses || [];
    } else if (businessIds && businessIds.length > 0) {
      const all = await repo.getAllBusinesses();
      const idSet = new Set(businessIds.map(String));
      businesses = all.filter((b) => idSet.has(b.id) || idSet.has(b.external_id));
    } else {
      businesses = await repo.getAllBusinesses();
    }

    if (businesses.length === 0) {
      return NextResponse.json(
        { error: 'No matching leads available for export.' },
        { status: 404 }
      );
    }

    const analyses = await repo.getAllLeadAnalyses();
    const crms = await repo.getAllLeadCrm();
    const dateStr = new Date().toISOString().slice(0, 10);

    if (format === 'json') {
      const filename = `leads-export-${dateStr}.json`;
      return new NextResponse(JSON.stringify(businesses, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'X-RateLimit-Limit': String(rateLimit.limit),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
        },
      });
    }

    if (format === 'tsv') {
      const tsvContent = generateLeadsTsv(businesses, analyses, crms);
      const filename = `leads-export-${dateStr}.tsv`;
      return new NextResponse(tsvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/tab-separated-values; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'X-RateLimit-Limit': String(rateLimit.limit),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
        },
      });
    }

    // Default: CSV with UTF-8 BOM
    const csvContent = generateLeadsCsv(businesses, analyses, crms);
    const filename = `leads-export-${dateStr}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-RateLimit-Limit': String(rateLimit.limit),
        'X-RateLimit-Remaining': String(rateLimit.remaining),
      },
    });
  } catch (error: any) {
    console.error('Lead export error:', error);
    return createSafeErrorResponse(error, 'Failed to generate lead export.');
  }
}
