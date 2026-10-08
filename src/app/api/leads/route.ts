import { NextRequest, NextResponse } from 'next/server';
import { getLeadRepository } from '@/lib/db';
import { checkRateLimit } from '@/lib/security/rateLimiter';
import { createSafeErrorResponse, sanitizeString } from '@/lib/security/validation';
import { Business } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // 1. Rate Limiting
  const rateLimit = checkRateLimit(req, 'search');
  if (!rateLimit.allowed && rateLimit.errorResponse) {
    return rateLimit.errorResponse;
  }

  try {
    const { searchParams } = new URL(req.url);
    const searchId = sanitizeString(searchParams.get('searchId'));
    const city = sanitizeString(searchParams.get('city'));
    const niche = sanitizeString(searchParams.get('niche'));
    const hasWebsiteParam = searchParams.get('hasWebsite');
    const tier = sanitizeString(searchParams.get('tier')).toUpperCase();
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10));

    const repo = getLeadRepository();
    let businesses: Business[] = [];

    if (searchId) {
      const searchData = await repo.getSearchById(searchId);
      businesses = searchData?.businesses || [];
    } else {
      businesses = await repo.getAllBusinesses();
    }

    // Filter by city
    if (city) {
      const cleanCity = city.toLowerCase();
      businesses = businesses.filter((b) => b.city && b.city.toLowerCase().includes(cleanCity));
    }

    // Filter by niche
    if (niche) {
      const cleanNiche = niche.toLowerCase();
      businesses = businesses.filter((b) => b.category && b.category.toLowerCase().includes(cleanNiche));
    }

    // Filter by website presence
    if (hasWebsiteParam === 'true') {
      businesses = businesses.filter((b) => Boolean(b.website && b.website.trim()));
    } else if (hasWebsiteParam === 'false') {
      businesses = businesses.filter((b) => !b.website || !b.website.trim());
    }

    // Filter by AI opportunity tier if requested
    if (['HOT', 'WARM', 'LOW'].includes(tier)) {
      const allAnalyses = await repo.getAllLeadAnalyses();
      businesses = businesses.filter((b) => {
        const a = allAnalyses[b.id] || allAnalyses[b.external_id];
        return a && a.tier === tier;
      });
    }

    const total = businesses.length;
    const paginatedLeads = businesses.slice(offset, offset + limit);

    return NextResponse.json(
      {
        total,
        count: paginatedLeads.length,
        offset,
        limit,
        leads: paginatedLeads,
      },
      {
        headers: {
          'X-RateLimit-Limit': String(rateLimit.limit),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
        },
      }
    );
  } catch (error: any) {
    console.error('GET /api/leads error:', error);
    return createSafeErrorResponse(error, 'Failed to fetch leads list.');
  }
}
