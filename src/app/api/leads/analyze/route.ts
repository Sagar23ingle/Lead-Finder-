import { NextRequest, NextResponse } from 'next/server';
import { getLeadRepository } from '@/lib/db';
import { LeadAnalyzer } from '@/lib/services/leadAnalyzer';
import { Business, LeadAnalysis } from '@/types';
import { checkRateLimit } from '@/lib/security/rateLimiter';
import { createSafeErrorResponse } from '@/lib/security/validation';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // 1. Server-side Rate Limiting
  const rateLimit = checkRateLimit(req, 'analyze');
  if (!rateLimit.allowed && rateLimit.errorResponse) {
    return rateLimit.errorResponse;
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body. Expected JSON object with businessId or businesses array.' },
        { status: 400 }
      );
    }

    const repo = getLeadRepository();

    // 2. Single business analysis by ID
    if (body.businessId) {
      const businessId = String(body.businessId).trim();
      const business = await repo.getBusinessById(businessId);
      if (!business) {
        return NextResponse.json({ error: 'Business not found' }, { status: 404 });
      }

      const analysis = await LeadAnalyzer.analyze(business);
      await repo.saveLeadAnalysis(analysis);

      return NextResponse.json(
        { analysis },
        {
          headers: {
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': String(rateLimit.remaining),
          },
        }
      );
    }

    // 3. Batch businesses analysis
    if (body.businesses && Array.isArray(body.businesses)) {
      // Limit batch size to 50 items max to prevent server timeouts
      const businesses: Business[] = body.businesses.slice(0, 50);
      const analyses: Record<string, LeadAnalysis> = {};

      // Ensure businesses are persisted in repository
      await repo.saveBusinesses(businesses);

      // Analyze concurrently in controlled chunks of 5
      for (let i = 0; i < businesses.length; i += 5) {
        const chunk = businesses.slice(i, i + 5);
        await Promise.all(
          chunk.map(async (b) => {
            try {
              const a = await LeadAnalyzer.analyze(b);
              analyses[b.id || b.external_id] = a;
              await repo.saveLeadAnalysis(a);
            } catch (err) {
              console.error(`Failed to analyze ${b.name}:`, err);
            }
          })
        );
      }

      return NextResponse.json(
        { analyses },
        {
          headers: {
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': String(rateLimit.remaining),
          },
        }
      );
    }

    return NextResponse.json(
      { error: 'Please provide either businessId or businesses array.' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Lead analysis error:', error);
    return createSafeErrorResponse(error, 'Failed to complete lead audit analysis.');
  }
}
