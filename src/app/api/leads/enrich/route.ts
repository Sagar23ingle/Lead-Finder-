import { NextRequest, NextResponse } from 'next/server';
import { getLeadRepository } from '@/lib/db';
import { checkRateLimit } from '@/lib/security/rateLimiter';
import { isSafeExternalUrl, createSafeErrorResponse, sanitizeString } from '@/lib/security/validation';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // 1. Rate Limiting
  const rateLimit = checkRateLimit(req, 'enrich');
  if (!rateLimit.allowed && rateLimit.errorResponse) {
    return rateLimit.errorResponse;
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body. JSON object expected.' },
        { status: 400 }
      );
    }

    let targetUrl: string | null = null;
    let businessName: string | null = null;

    if (body.businessId) {
      const repo = getLeadRepository();
      const business = await repo.getBusinessById(String(body.businessId));
      if (!business) {
        return NextResponse.json({ error: 'Business not found' }, { status: 404 });
      }
      targetUrl = business.website;
      businessName = business.name;
    } else if (body.url) {
      targetUrl = String(body.url).trim();
      businessName = sanitizeString(body.businessName || '');
    }

    if (!targetUrl || !targetUrl.trim()) {
      return NextResponse.json({
        enriched: false,
        hasWebsite: false,
        message: 'No website URL available for enrichment.',
        techStack: [],
        socialLinks: {},
        emails: [],
        isHttps: false,
        hasMobileViewport: false,
      });
    }

    // SSRF Safety Check
    if (!isSafeExternalUrl(targetUrl)) {
      return NextResponse.json(
        { error: 'Invalid or restricted website URL.' },
        { status: 400 }
      );
    }

    let fetchUrl = targetUrl;
    if (!/^https?:\/\//i.test(fetchUrl)) {
      fetchUrl = `https://${fetchUrl}`;
    }

    const startTime = Date.now();
    let html = '';
    let isHttps = fetchUrl.startsWith('https://');
    let httpStatus = 0;

    try {
      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 LeadEnricher/1.0',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(8000), // 8s strict timeout
      });

      httpStatus = response.status;
      html = await response.text();
    } catch {
      // If HTTPS failed, try HTTP fallback
      if (isHttps) {
        try {
          const fallbackUrl = fetchUrl.replace(/^https:\/\//i, 'http://');
          const fallbackRes = await fetch(fallbackUrl, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Safari/537.36 LeadEnricher/1.0',
            },
            redirect: 'follow',
            signal: AbortSignal.timeout(6000),
          });
          httpStatus = fallbackRes.status;
          html = await fallbackRes.text();
          isHttps = false;
        } catch {
          // Both failed
        }
      }
    }

    const latencyMs = Date.now() - startTime;
    const lowerHtml = html.toLowerCase();

    // 1. Tech Stack Detection
    const techStack: string[] = [];
    if (lowerHtml.includes('wp-content') || lowerHtml.includes('wp-includes')) techStack.push('WordPress');
    if (lowerHtml.includes('cdn.shopify.com') || lowerHtml.includes('shopify.theme')) techStack.push('Shopify');
    if (lowerHtml.includes('static.wixstatic.com') || lowerHtml.includes('wix.com')) techStack.push('Wix');
    if (lowerHtml.includes('squarespace.com')) techStack.push('Squarespace');
    if (lowerHtml.includes('webflow.com') || lowerHtml.includes('wf-page')) techStack.push('Webflow');
    if (lowerHtml.includes('__next') || lowerHtml.includes('/_next/')) techStack.push('Next.js');
    if (lowerHtml.includes('react') || lowerHtml.includes('_react')) techStack.push('React');
    if (lowerHtml.includes('googletagmanager.com') || lowerHtml.includes('gtag(')) techStack.push('Google Analytics');
    if (lowerHtml.includes('connect.facebook.net') || lowerHtml.includes('fbevents.js')) techStack.push('Meta Pixel');
    if (lowerHtml.includes('cdn.tailwindcss.com')) techStack.push('Tailwind CSS');
    if (lowerHtml.includes('bootstrap')) techStack.push('Bootstrap');

    // 2. Social Links Extraction
    const socialLinks: Record<string, string> = {};
    const instaMatch = html.match(/https?:\/\/(?:www\.)?instagram\.com\/[a-zA-Z0-9_.]+/i);
    if (instaMatch) socialLinks.instagram = instaMatch[0];

    const fbMatch = html.match(/https?:\/\/(?:www\.)?facebook\.com\/[a-zA-Z0-9_.]+/i);
    if (fbMatch) socialLinks.facebook = fbMatch[0];

    const linkedinMatch = html.match(/https?:\/\/(?:www\.)?linkedin\.com\/(?:company|in)\/[a-zA-Z0-9_-]+/i);
    if (linkedinMatch) socialLinks.linkedin = linkedinMatch[0];

    const twitterMatch = html.match(/https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[a-zA-Z0-9_]+/i);
    if (twitterMatch) socialLinks.twitter = twitterMatch[0];

    // 3. Email Extraction
    const emailMatches = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    const validEmails = Array.from(
      new Set(
        emailMatches
          .map((e) => e.toLowerCase())
          .filter((e) => !e.endsWith('.png') && !e.endsWith('.jpg') && !e.endsWith('.svg') && !e.includes('example.com'))
      )
    ).slice(0, 5);

    // 4. Viewport & SEO Checks
    const hasMobileViewport = /<meta[^>]*name=["']viewport["'][^>]*>/i.test(html);
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const metaTitle = titleMatch ? titleMatch[1].trim() : null;

    return NextResponse.json(
      {
        enriched: true,
        hasWebsite: true,
        url: targetUrl,
        businessName,
        httpStatus,
        isHttps,
        hasMobileViewport,
        latencyMs,
        metaTitle,
        techStack,
        socialLinks,
        emails: validEmails,
      },
      {
        headers: {
          'X-RateLimit-Limit': String(rateLimit.limit),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
        },
      }
    );
  } catch (error: any) {
    console.error('Lead enrichment error:', error);
    return createSafeErrorResponse(error, 'Failed to enrich lead data.');
  }
}
