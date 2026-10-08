import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { GooglePlacesService } from '@/lib/services/googlePlaces';
import { getLeadRepository } from '@/lib/db';
import { SearchResponse } from '@/types';
import { checkRateLimit } from '@/lib/security/rateLimiter';
import { validateSearchInput, createSafeErrorResponse } from '@/lib/security/validation';
import { SearchCache } from '@/lib/cache/searchCache';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // 1. Server-side Rate Limiting
  const rateLimit = checkRateLimit(req, 'search');
  if (!rateLimit.allowed && rateLimit.errorResponse) {
    return rateLimit.errorResponse;
  }

  try {
    const rawBody = await req.json().catch(() => null);

    // 2. Strict Input Validation & Sanitization
    const validation = validateSearchInput(rawBody);
    if (!validation.valid || !validation.data) {
      return validation.errorResponse!;
    }

    const { country, city, niche, limit } = validation.data;

    // 3. Fast In-Memory Cache Lookup (15m TTL) to conserve Google Places quotas
    const cached = SearchCache.get(country, city, niche, limit);
    if (cached) {
      return NextResponse.json({
        searchId: cached.searchId,
        query: cached.query,
        leadsRequested: cached.leadsRequested,
        leadsFound: cached.leadsFound,
        businesses: cached.businesses,
        source: 'cache',
        message: `Loaded ${cached.leadsFound} matching leads from instant server cache.`,
      }, {
        headers: {
          'X-RateLimit-Limit': String(rateLimit.limit),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
        },
      });
    }

    // 4. Server-side API Key & Configuration Check (Server Env or Session Header)
    const sessionKey = req.headers.get('x-google-api-key')?.trim();
    const effectiveKey = sessionKey || config.googleMapsApiKey;

    if (!effectiveKey) {
      return NextResponse.json(
        {
          error: 'Places API is not configured on the server.',
          code: 'PLACES_API_NOT_CONFIGURED',
          message:
            'Places API is not configured on the server. Please set GOOGLE_MAPS_API_KEY in Vercel environment variables or configure an API key in settings.',
        },
        { status: 503 }
      );
    }

    // 5. Server-side Discovery via Google Places API with controlled pagination
    const discoveryResult = await GooglePlacesService.search(
      {
        country,
        city,
        niche,
        limit,
      },
      effectiveKey
    );

    const businesses = discoveryResult.businesses;
    const queryTitle = `${niche} — ${city} — ${limit} leads`;

    // 6. Persistent Database Storage
    const repo = getLeadRepository();
    const saveResult = await repo.saveSearch(
      {
        query: queryTitle,
        niche,
        city,
        country,
        leads_requested: limit,
        leads_found: businesses.length,
      },
      businesses
    );

    // 7. Store in Server-Side Cache
    SearchCache.set(country, city, niche, limit, {
      searchId: saveResult.searchId,
      query: queryTitle,
      leadsRequested: limit,
      leadsFound: businesses.length,
      businesses,
    });

    const message =
      businesses.length === 0
        ? `No businesses found matching "${niche}" in ${city}, ${country}.`
        : businesses.length < limit
        ? `${businesses.length} matching businesses found (all available records retrieved).`
        : `Successfully discovered ${businesses.length} verified business leads.`;

    const response: SearchResponse = {
      searchId: saveResult.searchId,
      query: queryTitle,
      leadsRequested: limit,
      leadsFound: businesses.length,
      businesses,
      source: 'google_places',
      message,
    };

    return NextResponse.json(response, {
      headers: {
        'X-RateLimit-Limit': String(rateLimit.limit),
        'X-RateLimit-Remaining': String(rateLimit.remaining),
      },
    });
  } catch (error: any) {
    console.error('Lead search API error:', error?.message || error);
    return createSafeErrorResponse(error, 'An unexpected error occurred during lead discovery.');
  }
}
