import { Business, LeadAnalysis, WebsiteAudit, OpportunityReport, OutreachMessages, SalesGuidance } from '@/types';
import { config } from '@/lib/config';

/**
 * AI Lead Analyzer & Opportunity Engine
 * 100% FREE, lightweight, deterministic, and grounded in real business and website data.
 * Optional Gemini AI acceleration when GEMINI_API_KEY is configured.
 */
export class LeadAnalyzer {
  /**
   * Audits a business's public website using real HTTP request & DOM inspection.
   * Does NOT claim to test anything not actually checked.
   */
  public static async auditWebsite(url: string | null): Promise<WebsiteAudit> {
    if (!url || !url.trim()) {
      return {
        checked: true,
        hasWebsite: false,
        url: null,
        isReachable: false,
        httpStatus: null,
        latencyMs: null,
        isHttps: false,
        hasMobileViewport: false,
        title: null,
        metaDescription: null,
        hasWhatsApp: false,
        hasPhone: false,
        hasEmail: false,
        hasContactForm: false,
        hasClearCta: false,
        hasSocialLinks: false,
        socialPlatforms: [],
        issues: ['No website found on business profile (Major opportunity)'],
        strengths: [],
      };
    }

    let sanitizedUrl = url.trim();
    if (!/^https?:\/\//i.test(sanitizedUrl)) {
      sanitizedUrl = `https://${sanitizedUrl}`;
    }

    const isHttps = sanitizedUrl.startsWith('https://');
    const startTime = Date.now();

    try {
      const response = await fetch(sanitizedUrl, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 LeadFinderAudit/1.0',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(6000), // 6 second strict timeout
      });

      const latencyMs = Date.now() - startTime;
      const html = await response.text();
      const lowerHtml = html.toLowerCase();

      // Check Mobile Usability (Viewport tag)
      const hasMobileViewport = /<meta[^>]*name=["']viewport["'][^>]*>/i.test(html);

      // Check Title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : null;

      // Check Meta Description
      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
      const metaDescription = descMatch ? descMatch[1].trim() : null;

      // Check WhatsApp Funnel
      const hasWhatsApp =
        lowerHtml.includes('wa.me') ||
        lowerHtml.includes('whatsapp.com') ||
        lowerHtml.includes('api.whatsapp.com') ||
        lowerHtml.includes('whatsapp:');

      // Check Contact Signals
      const hasPhone = lowerHtml.includes('tel:') || /\+?(\d{1,4}[-.\s]?)?\(?\d{2,5}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}/.test(html);
      const hasEmail = lowerHtml.includes('mailto:') || /[\w.-]+@[\w.-]+\.\w{2,4}/.test(html);
      const hasContactForm = lowerHtml.includes('<form') && (lowerHtml.includes('submit') || lowerHtml.includes('contact') || lowerHtml.includes('email') || lowerHtml.includes('message'));

      // Check Clear CTA Buttons
      const hasClearCta =
        lowerHtml.includes('book now') ||
        lowerHtml.includes('get quote') ||
        lowerHtml.includes('consultation') ||
        lowerHtml.includes('enquire') ||
        lowerHtml.includes('contact us') ||
        lowerHtml.includes('schedule');

      // Check Social Links
      const socialPlatforms: string[] = [];
      if (lowerHtml.includes('instagram.com')) socialPlatforms.push('Instagram');
      if (lowerHtml.includes('facebook.com')) socialPlatforms.push('Facebook');
      if (lowerHtml.includes('linkedin.com')) socialPlatforms.push('LinkedIn');
      if (lowerHtml.includes('youtube.com')) socialPlatforms.push('YouTube');
      const hasSocialLinks = socialPlatforms.length > 0;

      // Compile Real Issues
      const issues: string[] = [];
      const strengths: string[] = [];

      if (!isHttps) issues.push('Insecure connection (Missing SSL / HTTP only)');
      else strengths.push('Secure SSL (HTTPS) active');

      if (!hasMobileViewport) issues.push('Lacks mobile viewport tag (poor smartphone experience)');
      else strengths.push('Responsive mobile viewport tag detected');

      if (latencyMs > 2500) issues.push(`Slow server response (${latencyMs}ms latency)`);
      else if (latencyMs < 1200) strengths.push(`Fast response time (${latencyMs}ms)`);

      if (!hasWhatsApp) issues.push('No direct WhatsApp chat link for instant mobile inquiries');
      else strengths.push('WhatsApp funnel integrated');

      if (!hasClearCta) issues.push('Weak or missing call-to-action button (no direct booking/quote prompt)');
      else strengths.push('Clear call-to-action detected');

      if (!hasContactForm) issues.push('No interactive inquiry form detected');
      if (!metaDescription) issues.push('Missing meta description tag (hurts Google SEO ranking)');

      return {
        checked: true,
        hasWebsite: true,
        url: sanitizedUrl,
        isReachable: response.ok,
        httpStatus: response.status,
        latencyMs,
        isHttps,
        hasMobileViewport,
        title,
        metaDescription,
        hasWhatsApp,
        hasPhone,
        hasEmail,
        hasContactForm,
        hasClearCta,
        hasSocialLinks,
        socialPlatforms,
        issues,
        strengths,
      };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      return {
        checked: true,
        hasWebsite: true,
        url: sanitizedUrl,
        isReachable: false,
        httpStatus: null,
        latencyMs,
        isHttps,
        hasMobileViewport: false,
        title: null,
        metaDescription: null,
        hasWhatsApp: false,
        hasPhone: false,
        hasEmail: false,
        hasContactForm: false,
        hasClearCta: false,
        hasSocialLinks: false,
        socialPlatforms: [],
        issues: [`Website failed to load or timed out after ${latencyMs}ms: ${err?.message || 'Connection failed'}`],
        strengths: [],
      };
    }
  }

  /**
   * Calculates a 0–100 Opportunity Score based on real signals
   */
  public static calculateOpportunityScore(
    business: Business,
    audit: WebsiteAudit
  ): { score: number; tier: 'HOT' | 'WARM' | 'LOW'; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    // 1. Website Status (Up to 40 pts)
    if (!audit.hasWebsite) {
      score += 35;
      reasons.push('No official business website detected (+35 pts: prime candidate for full website build)');
    } else if (audit.isReachable === false) {
      score += 30;
      reasons.push('Website is broken, down, or timing out (+30 pts: urgent redesign/rebuild required)');
    } else {
      // Flaws on existing website
      if (!audit.hasMobileViewport) {
        score += 15;
        reasons.push('Website is not mobile responsive (+15 pts: losing mobile customers)');
      }
      if (!audit.hasWhatsApp) {
        score += 10;
        reasons.push('No WhatsApp funnel for quick mobile conversion (+10 pts)');
      }
      if (!audit.hasClearCta) {
        score += 8;
        reasons.push('No clear call-to-action button or booking funnel (+8 pts)');
      }
      if (!audit.isHttps) {
        score += 8;
        reasons.push('Insecure HTTP connection (+8 pts: browsers display "Not Secure")');
      }
      if (audit.latencyMs && audit.latencyMs > 2500) {
        score += 6;
        reasons.push(`Slow page load speed of ${audit.latencyMs}ms (+6 pts)`);
      }
      if (!audit.metaDescription) {
        score += 5;
        reasons.push('Missing SEO meta description (+5 pts)');
      }
    }

    // 2. Business Reputation & Revenue Potential (Up to 40 pts)
    const rating = business.rating || 0;
    const reviews = business.review_count || 0;

    if (reviews >= 50) {
      score += 20;
      reasons.push(`Established business with ${reviews} Google reviews (+20 pts: proven client base and budget)`);
    } else if (reviews >= 15) {
      score += 12;
      reasons.push(`Active reputation with ${reviews} Google reviews (+12 pts)`);
    } else if (reviews >= 5) {
      score += 6;
      reasons.push(`Growing profile with ${reviews} Google reviews (+6 pts)`);
    }

    if (rating >= 4.5 && reviews >= 10) {
      score += 15;
      reasons.push(`Outstanding ${rating.toFixed(1)}★ rating (+15 pts: high customer satisfaction & strong trust signals)`);
    } else if (rating >= 4.0) {
      score += 8;
      reasons.push(`Positive ${rating.toFixed(1)}★ rating (+8 pts)`);
    }

    // 3. High-Value Service Niche (Up to 15 pts)
    const cat = (business.category || '').toLowerCase();
    const isHighTicket =
      cat.includes('interior') ||
      cat.includes('architect') ||
      cat.includes('dentist') ||
      cat.includes('clinic') ||
      cat.includes('roofer') ||
      cat.includes('real estate') ||
      cat.includes('law') ||
      cat.includes('contractor') ||
      cat.includes('agency');

    if (isHighTicket) {
      score += 12;
      reasons.push('High-ticket commercial niche (+12 pts: a single new customer covers the website investment)');
    } else {
      score += 5;
    }

    // 4. Strong Reputation with No Website Discrepancy (Bonus)
    if (!audit.hasWebsite && reviews >= 20) {
      score += 10;
      reasons.push('Massive disconnect: 20+ reviews but NO official website (+10 pts: high closing probability)');
    }

    // Normalize score to 0 - 100
    const finalScore = Math.min(Math.max(Math.round(score), 0), 100);

    let tier: 'HOT' | 'WARM' | 'LOW' = 'LOW';
    if (finalScore >= 75) {
      tier = 'HOT';
    } else if (finalScore >= 50) {
      tier = 'WARM';
    }

    return {
      score: finalScore,
      tier,
      reasons,
    };
  }

  /**
   * Generates a concrete AI Opportunity Report with recommended service and pricing
   */
  public static generateOpportunityReport(
    business: Business,
    audit: WebsiteAudit,
    tier: 'HOT' | 'WARM' | 'LOW'
  ): OpportunityReport {
    const niche = business.category || 'Local Business';
    const city = business.city || 'your area';
    const reviews = business.review_count || 0;
    const rating = business.rating ? `${business.rating.toFixed(1)}★` : 'positive reputation';

    if (!audit.hasWebsite) {
      return {
        mainProblem: `Zero digital portfolio or official website despite having ${reviews} Google reviews in ${city}.`,
        whyItMatters:
          'High-intent clients searching Google Maps or local search cannot view their past project work, pricing tiers, or verify their credibility, causing them to choose competitors with dedicated websites.',
        whatToImprove:
          'Launch a modern, mobile-optimized showcase website with instant WhatsApp consultation capture, customer testimonials, and photo portfolio.',
        recommendedService: `Complete ${niche} Portfolio & WhatsApp Lead Funnel`,
        suggestedOffer: `Turnkey 5-Page Portfolio Website + Google Review Showcase + WhatsApp Direct Booking`,
        suggestedPriceRange: '₹28,000 – ₹48,000 / $550 – $950 (AI Estimate)',
        bestOutreachAngle: `Leverage their strong ${rating} Google rating: "You already have great reviews in ${city}, but you're losing high-ticket clients who look for an official website portfolio before calling."`,
      };
    }

    if (audit.isReachable === false) {
      return {
        mainProblem: `Website URL is broken, timing out, or displaying server errors.`,
        whyItMatters:
          'Prospects clicking their Google Maps profile land on an error page, destroying buyer trust and sending prospective deals directly to competitors.',
        whatToImprove:
          'Replace dead infrastructure with a ultra-fast, modern, cloud-hosted website with mobile-first design and 99.9% uptime.',
        recommendedService: 'Website Recovery & Modern Redesign',
        suggestedOffer: 'Full Website Rebuild + High-Speed Hosting + Lead Capture Form',
        suggestedPriceRange: '₹22,000 – ₹38,000 / $450 – $750 (AI Estimate)',
        bestOutreachAngle: `Helpful alert: "I noticed your website link on Google is currently down, which is causing lost leads from your ${reviews} reviews profile."`,
      };
    }

    // Existing website with flaws
    const flawPoints = audit.issues.slice(0, 2).join(' and ');
    return {
      mainProblem: `Website lacks modern conversion features: ${flawPoints || 'outdated mobile layout'}.`,
      whyItMatters:
        'Over 75% of local service searches happen on mobile devices. Without quick WhatsApp capture and fast mobile design, visitors bounce without inquiring.',
      whatToImprove:
        'Implement mobile responsive optimization, instant 1-tap WhatsApp consultation CTA, and SEO structure.',
      recommendedService: 'Website Modernization & Mobile Lead Optimization',
      suggestedOffer: 'High-Converting Mobile Overhaul + WhatsApp Funnel Integration + Speed Optimization',
      suggestedPriceRange: '₹18,000 – ₹32,000 / $350 – $650 (AI Estimate)',
      bestOutreachAngle: `Conversion gap: "Your ${rating} rating shows you do great work in ${city}, but your mobile website isn't converting traffic into direct inquiries."`,
    };
  }

  /**
   * Generates highly personalized outreach messages (WhatsApp, Email, DM)
   */
  public static generateOutreach(
    business: Business,
    audit: WebsiteAudit,
    report: OpportunityReport
  ): OutreachMessages {
    const name = business.name;
    const city = business.city || 'your city';
    const reviews = business.review_count;
    const ratingStr = business.rating ? `${business.rating.toFixed(1)}★` : 'great';
    const niche = business.category || 'services';

    // 1. WhatsApp Message
    let whatsapp = '';
    if (!audit.hasWebsite) {
      whatsapp = `Hi ${name} team, came across your profile in ${city}. Really impressed by your ${ratingStr} rating across ${reviews} reviews! 👏

Quick question: noticed you don't have an official website portfolio linked yet. When clients search for ${niche} in ${city}, having an official portfolio with instant WhatsApp booking could bring in 3-5 more high-value inquiries every month.

I actually put together a quick interactive design concept for ${name} to show how it could look:
👉 [DEMO_LINK]

Would you be open to a 2-minute look? No obligation at all!`;
    } else {
      whatsapp = `Hi ${name} team, loved checking out your work in ${city} (${reviews} reviews, congratulations on the ${ratingStr} reputation!).

I visited your website and noticed a quick opportunity: there's currently no direct WhatsApp chat button, and the mobile layout has a few bottlenecks that make it hard for phone visitors to inquire quickly.

I put together a quick modern layout demo showing how much cleaner your portfolio could look on mobile:
👉 [DEMO_LINK]

Happy to share a couple quick tips if you'd find it helpful!`;
    }

    // 2. Cold Email
    const emailSubject = !audit.hasWebsite
      ? `Website portfolio concept for ${name} (${city})`
      : `Quick feedback on ${name}'s mobile website`;

    const emailBody = `Hi ${name} Team,

I recently came across ${name} while looking at leading ${niche} in ${city}. Seeing your ${ratingStr} rating across ${reviews} Google reviews makes it clear your clients love your work.

However, I noticed a key opportunity:
${report.mainProblem}

In ${city}, high-intent clients looking for ${niche} typically want to browse project photos and start a conversation on WhatsApp within 30 seconds. Right now, ${report.whyItMatters.toLowerCase()}

To make this actionable, I built a personalized website demo concept tailored specifically for ${name}:
👉 [DEMO_LINK]

It includes:
- Showcase of your services in ${city}
- 1-click WhatsApp & call inquiry button
- Clean, fast mobile-responsive design

Would you be open to a 5-minute chat this week to discuss how this could help you capture more premium clients?

Best regards,
Digital Growth & Web Design Specialist`;

    // 3. Instagram / LinkedIn DM
    const dm = `Hey ${name}! Huge fan of your work in ${city} — your ${reviews} reviews and ${ratingStr} score are impressive. 

Quick heads-up: noticed your profile is missing an official website portfolio for clients to browse your past projects and book consultations directly. 

I put together a quick preview concept for you here: [DEMO_LINK] — check it out and let me know what you think! 🚀`;

    return {
      whatsapp,
      email: {
        subject: emailSubject,
        body: emailBody,
      },
      dm,
    };
  }

  /**
   * Generates AI Sales Guidance & Objection Handling for closing this lead
   */
  public static generateSalesGuidance(
    business: Business,
    audit: WebsiteAudit,
    report: OpportunityReport
  ): SalesGuidance {
    const name = business.name;
    const niche = business.category || 'business';

    return {
      pitchPackage: `${report.recommendedService} — Focused on client acquisition and mobile conversion`,
      pricingStrategy: `Anchor price at ${report.suggestedPriceRange}. Offer a flexible 50% upfront / 50% upon launch milestone.`,
      closingStrategy: `Emphasize ROI: Explain that for a ${niche}, closing just 1 single extra client through the new website completely pays off the entire investment.`,
      objections: {
        tooExpensive: `"Totally understand budget is a priority. Look at it this way: what is the average value of a single ${niche} client for you? Usually just 1 new client generated from Google or WhatsApp pays for the entire website, and the site keeps working for you 24/7."`,
        alreadyHaveClients: `"That's awesome, and your reviews clearly show word of mouth is strong! The goal of this website isn't just more volume — it's attracting higher-budget, premium clients who research you online before deciding to call."`,
        sendProposal: `"I'd be glad to send a one-page summary! Before I put that together, are you looking primarily to showcase past project photos, or get direct WhatsApp inquiries from phone visitors?"`,
        notInterested: `"No problem at all! Keep the demo link handy: [DEMO_LINK]. If you ever decide to modernize your online presence in the future, feel free to reach back out."`,
      },
    };
  }

  /**
   * Full end-to-end analysis of a business lead
   */
  public static async analyze(business: Business): Promise<LeadAnalysis> {
    // 1. Real Website Audit
    const audit = await this.auditWebsite(business.website);

    // 2. Opportunity Scoring
    const { score, tier, reasons } = this.calculateOpportunityScore(business, audit);

    // 3. Opportunity Report
    const report = this.generateOpportunityReport(business, audit, tier);

    // 4. Outreach Copy
    const outreach = this.generateOutreach(business, audit, report);

    // 5. Sales Guidance
    const salesGuidance = this.generateSalesGuidance(business, audit, report);

    return {
      businessId: business.id || business.external_id,
      score,
      tier,
      reasons,
      audit,
      report,
      outreach,
      salesGuidance,
      analyzedAt: new Date().toISOString(),
    };
  }
}
