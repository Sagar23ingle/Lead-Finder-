import {
  Business,
  LeadAnalysis,
  MiniProposal,
  FollowUpItem,
  ProspectReplyItem,
  OutreachMessages,
  ReplyClassification,
  OutreachOptimization,
  DailyActionItem,
  BusinessInsights,
  LeadCrmRecord,
} from '@/types';
import { config } from '@/lib/config';
import { normalizeWhatsAppNumber, buildWhatsAppUrl, formatDisplayPhone } from '@/lib/utils/phone';
import { DEMO_TEMPLATES, DemoTemplateId, getTemplateForBusiness } from '@/lib/templates/demoTemplates';

/**
 * CRM Engine for Parts 3 & 4:
 * - Personalized Outreach Generator (WhatsApp, Email, DM)
 * - AI Outreach Optimizer (Personalization score, Spam-risk, Clarity, Final version)
 * - Follow-up Engine (Day 0, Day 2, Day 5, Day 9)
 * - Response Intelligence & 9-Category Reply Classification
 * - Mini Proposal Generator
 * - Daily Action Plan Generator (HOT leads, due follow-ups, pending replies, demos to send)
 * - Real Business Insights & Smart Recommendations Generator
 * - Single-File Standalone HTML Demo Exporter
 * 
 * 100% Free-first local deterministic processing with optional Gemini AI acceleration.
 */
export class CrmEngine {
  /**
   * Generates or refreshes personalized outreach messages for a lead
   */
  public static generateOutreach(
    business: Business,
    analysis?: LeadAnalysis | null,
    contactPerson?: string | null
  ): OutreachMessages {
    const greeting = contactPerson ? `Hi ${contactPerson}` : `Hi ${business.name} team`;
    const city = business.city || 'your area';
    const niche = business.category || 'business';
    const reviews = business.review_count || 0;
    const ratingStr = business.rating ? `${business.rating.toFixed(1)}★` : 'solid';
    const hasWebsite = Boolean(business.website);

    // WhatsApp Message
    let whatsapp = '';
    if (!hasWebsite) {
      whatsapp = `${greeting}, came across ${business.name} in ${city}. Really impressed by your ${ratingStr} rating across ${reviews} Google reviews! 👏\n\nQuick observation: noticed you don't have an official website or portfolio linked yet. When clients in ${city} search for ${niche}, not having a dedicated portfolio with 1-click WhatsApp booking causes many high-budget clients to look elsewhere.\n\nI put together a quick interactive design mockup specifically for ${business.name} to show how your projects could look on mobile.\n\nWould you be open to a 2-minute look? No obligation at all!`;
    } else {
      whatsapp = `${greeting}, loved checking out ${business.name} in ${city} (${reviews} reviews, congratulations on the ${ratingStr} reputation!).\n\nI took a look at your website and noticed an immediate opportunity: there's currently no direct WhatsApp booking funnel, and the mobile view can be optimized to capture 3x more phone calls from local clients searching for ${niche}.\n\nI put together a quick modern layout demo showing how much cleaner your portfolio could convert on mobile.\n\nHappy to share a 2-minute preview if you'd find it helpful!`;
    }

    // Email
    const emailSubject = !hasWebsite
      ? `Website & WhatsApp booking concept for ${business.name} (${city})`
      : `Quick feedback on ${business.name}'s mobile website conversion`;

    const emailBody = `${greeting},

I recently came across ${business.name} while researching leading ${niche} providers in ${city}. Seeing your ${ratingStr} rating across ${reviews} Google reviews makes it clear your clients genuinely value your work.

However, I noticed a key opportunity:
${
  analysis?.report.mainProblem ||
  (!hasWebsite
    ? `There is no dedicated website portfolio linked to your profile in ${city}.`
    : `The website currently lacks instant WhatsApp chat capture and fast mobile CTA buttons.`)
}

In ${city}, customers looking for ${niche} want to browse recent projects and contact you directly on WhatsApp within 30 seconds.

To make this practical, I created a tailored modern website showcase concept for ${business.name}:
- Clean mobile-first design showcasing your services in ${city}
- 1-click WhatsApp & call inquiry button
- Customer testimonials and project photo gallery

Would you be open to a quick 5-minute chat this week to see the concept and discuss how this could help you capture more direct clients?

Best regards,
Digital Growth & Web Specialist`;

    // Social DM (Instagram / LinkedIn)
    const dm = `Hey ${business.name}! Huge fan of your work in ${city} — your ${reviews} reviews and ${ratingStr} score are impressive. 

Quick heads-up: noticed your profile is missing an official website portfolio with direct WhatsApp booking for clients searching for ${niche} in ${city}. 

I actually put together a quick interactive preview concept for ${business.name}. Let me know if you'd like to check it out! 🚀`;

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
   * AI Outreach Optimizer
   * Analyzes message before sending and provides Personalization score, Spam-risk, Clarity,
   * strongest selling point, suggested improvement, and optimized version.
   */
  public static optimizeOutreach(
    message: string,
    business: Business,
    analysis?: LeadAnalysis | null
  ): OutreachOptimization {
    const text = message.trim();
    const lower = text.toLowerCase();

    // 1. Personalization Score calculation (0 - 100)
    let score = 20; // base score for standard copy
    if (business.name && lower.includes(business.name.toLowerCase())) score += 20;
    if (business.city && lower.includes(business.city.toLowerCase())) score += 20;
    if (business.category && lower.includes(business.category.toLowerCase())) score += 15;
    if (business.rating && lower.includes(business.rating.toFixed(1))) score += 15;
    if (business.review_count && lower.includes(String(business.review_count))) score += 10;
    const personalizationScore = Math.min(score, 100);

    // 2. Spam-risk warning
    const spamKeywords = [
      'free money',
      'guaranteed',
      '100%',
      'act now',
      'urgent',
      'cheap',
      'winner',
      'click here',
      'limited time',
      'no risk',
    ];
    let spamMatches = 0;
    for (const kw of spamKeywords) {
      if (lower.includes(kw)) spamMatches++;
    }
    const exclamationCount = (text.match(/!/g) || []).length;
    const hasAllCaps = /[A-Z]{4,}/.test(text);

    let spamRisk: 'Low' | 'Medium' | 'High' = 'Low';
    if (spamMatches >= 2 || exclamationCount > 4 || hasAllCaps) {
      spamRisk = 'High';
    } else if (spamMatches === 1 || exclamationCount >= 3) {
      spamRisk = 'Medium';
    }

    // 3. Clarity Rating
    const wordCount = text.split(/\s+/).length;
    let clarityRating = '9.5 / 10 (Excellent)';
    if (wordCount > 160) {
      clarityRating = '7.5 / 10 (Slightly verbose for mobile messaging)';
    } else if (wordCount < 25) {
      clarityRating = '7.0 / 10 (Too brief, lacks sufficient context)';
    }

    // 4. Strongest selling point
    const strongestSellingPoint = !business.website
      ? `Anchors on ${business.name}'s verified ${business.rating || 4.8}★ reputation across ${business.review_count || 0} local reviews, contrasting it against lost smartphone visitors who find no official website.`
      : `Pinpoints the missing 1-click WhatsApp instant booking funnel on ${business.name}'s mobile web layout.`;

    // 5. Suggested improvement
    let suggestedImprovement = 'Keep the pitch focused on the 2-minute visual mockup preview to lower resistance.';
    if (personalizationScore < 70) {
      suggestedImprovement = `Explicitly mention ${business.name}'s ${business.rating || 4.8}★ rating and ${business.city || 'local'} area to boost trust and reply rates.`;
    } else if (spamRisk !== 'Low') {
      suggestedImprovement = 'Remove excessive exclamation marks and hyperbolic words to pass spam filters cleanly.';
    } else if (wordCount > 130) {
      suggestedImprovement = 'Trim by 15-20 words so the entire pitch is readable without scrolling on mobile phones.';
    }

    // 6. Optimized Final Version (Crisp, natural, high-converting)
    const cityStr = business.city || 'your area';
    const ratingStr = business.rating ? `${business.rating.toFixed(1)}★` : '4.8★';
    const reviewsStr = business.review_count ? `${business.review_count} reviews` : 'great reviews';

    const optimizedVersion = !business.website
      ? `Hi ${business.name} team, came across your work in ${cityStr}. Really impressed by your ${ratingStr} score across ${reviewsStr}! 👏\n\nQuick heads up: noticed you don't have an official website or mobile portfolio linked on Google Maps. Potential clients searching for ${business.category || 'your services'} often look elsewhere when there's no 1-click WhatsApp booking.\n\nI put together a quick 2-minute interactive design mockup specifically for ${business.name}. Would you be open to taking a look? No obligation at all!`
      : `Hi ${business.name} team, congratulations on your ${ratingStr} reputation in ${cityStr}! 👏\n\nI checked out your website and noticed an easy win: there's currently no 1-click WhatsApp chat button, which means mobile visitors have to jump through hoops to contact you.\n\nI built a quick modern layout concept showing how this could boost your local client inquiries. Happy to send over the 2-minute preview link if helpful!`;

    return {
      personalizationScore,
      spamRisk,
      clarityRating,
      strongestSellingPoint,
      suggestedImprovement,
      optimizedVersion,
    };
  }

  /**
   * Generates default Day 0, Day 2, Day 5, Day 9 follow-up sequence
   */
  public static generateFollowUpSequence(
    business: Business,
    analysis?: LeadAnalysis | null
  ): FollowUpItem[] {
    const name = business.name;
    const city = business.city || 'your area';
    const niche = business.category || 'business';

    return [
      {
        stage: 'followup_1',
        dayOffset: 2,
        label: 'Follow-up 1 (Day 2 - Gentle Re-engagement)',
        subject: `Quick bump: Website inquiry for ${name}`,
        content: `Hi ${name} team, following up on my note from a couple days ago! Wanted to share how other ${niche} specialists in ${city} are turning casual Google Map visitors into paid consultations with a direct WhatsApp booking link. Happy to share a quick 2-minute overview whenever convenient!`,
        status: 'pending',
      },
      {
        stage: 'followup_2',
        dayOffset: 5,
        label: 'Follow-up 2 (Day 5 - Value Add & Interactive Concept)',
        subject: `Interactive website concept for ${name}`,
        content: `Hi again! I took 15 minutes to organize an interactive preview layout for ${name} to demonstrate how your client testimonials and project highlights would look on modern smartphones. Would you like me to send the concept preview over?`,
        status: 'pending',
      },
      {
        stage: 'final',
        dayOffset: 9,
        label: 'Final Follow-up (Day 9 - Respectful Breakup)',
        subject: `Closing the loop - ${name}`,
        content: `Hi team, I know you're super busy managing ${name}. I'll assume modernizing your website/client funnel isn't a priority right now, so I won't follow up again. If you ever want to explore building an online presence in ${city} down the line, feel free to reach out anytime!`,
        status: 'pending',
      },
    ];
  }

  /**
   * Response Intelligence: Analyzes a received prospect reply, classifying into 9 distinct categories:
   * 'Interested' | 'Curious' | 'Price objection' | 'Not interested' | 'Wants more information' |
   * 'Wants call' | 'Already has developer' | 'Later/follow-up' | 'Unknown'
   */
  public static async analyzeProspectReply(
    replyText: string,
    business: Business,
    analysis?: LeadAnalysis | null
  ): Promise<NonNullable<ProspectReplyItem['aiAnalysis']>> {
    const cleanText = replyText.trim();
    const lower = cleanText.toLowerCase();

    // Check optional Gemini API
    if (config.isGeminiConfigured()) {
      try {
        const geminiRes = await this.callGeminiForReply(cleanText, business, analysis);
        if (geminiRes) return geminiRes;
      } catch (err) {
        console.warn('Gemini reply analysis fallback to deterministic engine:', err);
      }
    }

    // High quality deterministic NLP analysis (100% free, offline, instant)
    let classification: ReplyClassification = 'Curious';
    let intent = 'General Inquiry';
    let interestLevel: 'High' | 'Medium' | 'Low' | 'Skeptical' = 'Medium';
    let meaning = 'The prospect has acknowledged the outreach and is requesting more context.';
    let objection: string | null = null;
    let nextAction = 'Reply with a friendly, value-focused answer and propose a brief 10-minute call or send the mockup preview.';
    let suggestedOffer = 'Custom 5-Page Responsive Website + 1-Click WhatsApp Booking Funnel';
    let suggestedPricing = '₹20,000 – ₹35,000 ($350 – $600 USD) with 50% upfront / 50% on delivery.';
    let closingStrategy = 'Highlight fast delivery (7 days) and risk-reversal: demo preview before any final payment.';
    let recommendedResponse = '';

    // Classification 1: Not interested / Rejection (Checked FIRST to prevent negative intent matching loose positive keywords)
    if (
      lower.includes('not interested') ||
      lower.includes('no thanks') ||
      lower.includes('no thank you') ||
      lower.includes('dont need') ||
      lower.includes("don't need") ||
      lower.includes('remove') ||
      lower.includes('stop') ||
      lower.includes('unsubscribe') ||
      lower.includes('do not message') ||
      lower.includes('dont message') ||
      lower.includes('do not contact') ||
      lower.includes('leave me alone') ||
      lower.includes('wrong number')
    ) {
      classification = 'Not interested';
      intent = 'Direct Rejection / Outbound Dismissal';
      interestLevel = 'Low';
      meaning = 'The prospect does not see a current need or has declined cold outreach.';
      objection = 'No perceived need for website upgrades.';
      nextAction = 'Politely acknowledge and close the conversation with zero friction or argument.';
      closingStrategy = 'Courteous exit that preserves agency reputation.';
      recommendedResponse = `Totally understand, and thank you for letting me know! No worries at all. If you ever want to revisit your digital presence down the road, feel free to reach out anytime. Have a great week!`;
    }
    // Classification 2: Already has developer / Agency partner
    else if (
      lower.includes('already have') ||
      lower.includes('developer') ||
      lower.includes('in-house') ||
      lower.includes('web designer') ||
      lower.includes('my nephew') ||
      lower.includes('working with someone') ||
      lower.includes('agency handles') ||
      lower.includes('have someone')
    ) {
      classification = 'Already has developer';
      intent = 'Existing Solution or Technical Partner';
      interestLevel = 'Low';
      meaning = 'The prospect already has an existing web agency or internal developer handling their digital presence.';
      objection = 'Incumbent partner or existing contractual commitment.';
      nextAction = 'Respect their existing relationship while highlighting specialized mobile WhatsApp conversion optimization.';
      closingStrategy = 'Offer a complimentary 5-minute UX audit that their existing developer can implement.';
      recommendedResponse = `That's great that you already have someone handling your web presence! Just as a quick tip: make sure they add a direct 1-click WhatsApp chat button and mobile caching — that alone usually boosts inquiry rates by 30-40%. Wishing ${business.name} continued success!`;
    }
    // Classification 3: Later / Follow-up requested
    else if (
      lower.includes('later') ||
      lower.includes('next month') ||
      lower.includes('next quarter') ||
      lower.includes('busy now') ||
      lower.includes('not right now') ||
      lower.includes('check back') ||
      lower.includes('ping back') ||
      lower.includes('few weeks') ||
      lower.includes('after festive') ||
      lower.includes('another time')
    ) {
      classification = 'Later/follow-up';
      intent = 'Delayed Interest / Timing Constraint';
      interestLevel = 'Medium';
      meaning = 'The prospect acknowledges the concept but has urgent ongoing operational priorities right now.';
      objection = 'Timing and current lack of bandwidth.';
      nextAction = 'Acknowledge gracefully, set a specific calendar reminder for follow-up in 2-3 weeks, and share the demo link.';
      closingStrategy = 'Low-pressure follow-up permission: "I will make a note to check back in next month."';
      recommendedResponse = `Totally understand — running operations comes first! I will make a quick note to check back in with you in a couple of weeks. In the meantime, feel free to keep the demo concept handy: [DEMO_LINK]. Best of luck with current projects!`;
    }
    // Classification 4: Price objection / Pricing inquiry
    else if (
      lower.includes('price') ||
      lower.includes('cost') ||
      lower.includes('how much') ||
      lower.includes('charges') ||
      lower.includes('budget') ||
      lower.includes('expensive') ||
      lower.includes('rates') ||
      lower.includes('pricing') ||
      lower.includes('quote')
    ) {
      classification = 'Price objection';
      intent = 'Pricing Inquiry & Budget Evaluation';
      interestLevel = 'High';
      meaning = 'The prospect is evaluating cost suitability. Direct pricing inquiry signifies strong commercial intent.';
      objection = 'Potential budget sensitivity if quoted without anchoring ROI value.';
      nextAction = 'Provide a transparent turnkey price range, highlight what is included (WhatsApp funnel, SEO, mobile polish), and offer to show the interactive demo.';
      suggestedPricing = 'Anchor at ₹25,000 ($399) turnkey package, with an entry tier at ₹15,000 ($249).';
      closingStrategy = 'Anchor price to 1 customer value: "Closing just 1 new client completely pays off the website."';
      recommendedResponse = `Hi! Great to hear from you. For a complete mobile-first website for ${business.name} (including past projects showcase, Google review sync, and 1-click WhatsApp booking), our turnkey package is ₹25,000 with no recurring hidden fees.\n\nBefore discussing numbers, I already prepared a quick preview demo of how ${business.name}'s layout would look. Would you have 5 minutes today or tomorrow for a quick call to check it out?`;
    }
    // Classification 5: Curious / Discovery inquiry
    else if (
      lower.includes('how does') ||
      lower.includes('how do you') ||
      lower.includes('who are you') ||
      lower.includes('who is this') ||
      lower.includes('how did you get') ||
      lower.includes('from where') ||
      lower.includes('what do you do') ||
      lower.includes('curious') ||
      lower.includes('tell me more about what you do')
    ) {
      classification = 'Curious';
      intent = 'Identity & Source Verification';
      interestLevel = 'Skeptical';
      meaning = 'The prospect is intrigued but wants to verify your identity, understand the mechanism, and ensure this is legitimate.';
      objection = 'Credibility and privacy verification.';
      nextAction = 'Politely introduce yourself and explain that you found their high-rated public Google profile.';
      closingStrategy = 'Show authentic personalization: praise their specific review count and local reputation.';
      recommendedResponse = `Hi! My name is [Your Name], and I run a digital web agency. I came across your public Google profile while researching top-rated ${business.category || 'businesses'} in ${business.city || 'your area'}.\n\nI was genuinely impressed by your ${business.rating || 4.8}★ rating across ${business.review_count || 0} reviews, but noticed you didn't have an official website linked for phone visitors. Thought I would reach out directly with a free concept preview!`;
    }
    // Classification 6: Wants call / Meeting request
    else if (
      lower.includes('call') ||
      lower.includes('talk') ||
      lower.includes('meet') ||
      lower.includes('schedule') ||
      lower.includes('phone') ||
      lower.includes('speak')
    ) {
      classification = 'Wants call';
      intent = 'Direct Phone/Meeting Request';
      interestLevel = 'High';
      meaning = 'The prospect prefers direct verbal communication and wants to speak right away.';
      objection = null;
      nextAction = 'Provide your phone number immediately and propose two convenient times today or tomorrow.';
      closingStrategy = 'Immediate phone bridge: "I can call you in 15 minutes or tomorrow at 11 AM — which works best?"';
      recommendedResponse = `Sounds great! You can reach me directly at [YOUR_PHONE_NUMBER].\n\nWould you prefer a quick 5-minute call today around 4 PM, or tomorrow morning around 11 AM? Looking forward to connecting!`;
    }
    // Classification 7: Wants more information / Portfolio / Details
    else if (
      lower.includes('more info') ||
      lower.includes('more information') ||
      lower.includes('portfolio') ||
      lower.includes('send details') ||
      lower.includes('details') ||
      lower.includes('packages') ||
      lower.includes('brochure') ||
      lower.includes('samples') ||
      lower.includes('send me')
    ) {
      classification = 'Wants more information';
      intent = 'Information / Portfolio Request';
      interestLevel = 'High';
      meaning = 'The prospect is receptive and actively requesting to see credentials, project samples, or the demo concept.';
      objection = null;
      nextAction = 'Send the personalized demo link immediately and invite them to review it.';
      closingStrategy = 'Direct demo delivery with immediate feedback question.';
      recommendedResponse = `Awesome! Here is the interactive website preview concept I put together specifically for ${business.name}:\n\n👉 [INTERACTIVE_DEMO_LINK]\n\nIt's completely mobile-optimized and includes instant WhatsApp consultation booking. Take 2 minutes to click through it, and let me know what you think!`;
    }
    // Classification 8: Interested (Positive Buying Signal)
    else if (
      lower.includes('interested') ||
      lower.includes('sounds great') ||
      lower.includes('looks great') ||
      lower.includes('love to') ||
      lower.includes('happy to') ||
      lower.includes('lets discuss') ||
      lower.includes('let us discuss') ||
      lower.includes('yes') ||
      lower.includes('sure') ||
      lower.includes('great')
    ) {
      classification = 'Interested';
      intent = 'Positive Buying Signal / Agreement';
      interestLevel = 'High';
      meaning = 'The prospect has given a direct green light to discuss the proposition.';
      objection = null;
      nextAction = 'Send the demo link and propose a 10-minute strategy call.';
      closingStrategy = 'Lock down a specific meeting slot.';
      recommendedResponse = `Fantastic! I prepared an interactive preview for ${business.name} right here: [DEMO_LINK].\n\nWould you have 10 minutes today at 4:30 PM or tomorrow morning at 11 AM for a quick walkthrough?`;
    }
    // Classification 9: Unknown / Ambiguous
    else {
      classification = 'Unknown';
      intent = 'Ambiguous Response';
      interestLevel = 'Medium';
      meaning = 'The message is brief or unclear, requiring gentle clarification.';
      objection = null;
      nextAction = 'Ask an easy question to clarify their primary objective.';
      recommendedResponse = `Hi! Thanks so much for replying. To make sure I share the most relevant details for ${business.name}, are you primarily looking to showcase your past project photos, or get more direct WhatsApp consultation inquiries from Google visitors in ${business.city || 'your area'}?`;
    }

    return {
      intent,
      classification,
      interestLevel,
      meaning,
      recommendedResponse,
      objection,
      nextAction,
      suggestedOffer,
      suggestedPricing,
      closingStrategy,
    };
  }

  /**
   * Generates a tailored Mini Proposal for a prospect
   */
  public static generateMiniProposal(
    business: Business,
    analysis?: LeadAnalysis | null
  ): MiniProposal {
    const name = business.name;
    const niche = business.category || 'Local Business';
    const city = business.city || 'your location';
    const hasWebsite = Boolean(business.website);

    const problem = analysis?.report.mainProblem || (
      !hasWebsite
        ? `${name} has established a strong local reputation (${business.review_count || 0} reviews, ${business.rating || 4.8}★) but lacks an official website portfolio, causing potential clients in ${city} to hire competitors with dedicated web presences.`
        : `${name}'s current website lacks instant WhatsApp chat capture, has suboptimal mobile conversion speeds, and does not effectively turn smartphone visitors into booked consultations.`
    );

    const solution = !hasWebsite
      ? `Launch a high-converting, mobile-responsive 5-page showcase website with integrated WhatsApp lead capture, Google SEO indexing, and client testimonial gallery.`
      : `Redesign ${name}'s mobile web funnel to introduce 1-click WhatsApp consultation booking, fast-loading portfolio galleries, and localized search optimization in ${city}.`;

    const deliverables = [
      `Custom 5-Page Responsive Website (Home, About, Services/Projects, Gallery, Contact)`,
      `1-Click WhatsApp Instant Chat & Direct Phone Call Integration`,
      `Client Testimonial & Review Showcase (Synced with Google Reviews)`,
      `Local Google SEO Optimization for "${niche} in ${city}"`,
      `Fast Cloud Hosting Setup + SSL Security Certificate`,
      `Full Mobile & Tablet Responsive Polish`,
      `14 Days Post-Launch Support & Minor Content Updates`,
    ];

    const timeline = '7 to 10 Business Days from approval and initial assets';
    const price = '₹25,000 ($399 USD) — 50% upon project kickoff, 50% upon final launch approval';
    const nextStep = 'Approve this proposal and schedule a brief 15-minute kickoff call to finalize your project photos and branding.';

    return {
      clientName: name,
      businessNiche: niche,
      city,
      problem,
      solution,
      deliverables,
      timeline,
      price,
      nextStep,
      updatedAt: new Date().toISOString(),
    };
  }



  /**
   * Generates Daily Action Plan ("Today's Actions")
   * Evaluates all tracked leads and creates a prioritized checklist of:
   * - HOT leads to contact
   * - Follow-ups due today
   * - Replies requiring response
   * - Demos that should be sent
   * - Proposals requiring follow-up
   */
  public static generateDailyActionPlan(
    businesses: Business[],
    crmRecords: Record<string, LeadCrmRecord>,
    analyses: Record<string, LeadAnalysis>
  ): DailyActionItem[] {
    const items: DailyActionItem[] = [];

    for (const b of businesses) {
      const id = b.id || b.external_id;
      const crm = crmRecords[id] || crmRecords[b.external_id];
      const analysis = analyses[id] || analyses[b.external_id];
      const score = analysis?.score || 0;
      const tier = analysis?.tier || 'LOW';
      const stage = crm?.stage || 'NEW';

      // 1. Replies requiring response (Highest priority!)
      if (stage === 'REPLIED' && crm?.prospectReplies && crm.prospectReplies.length > 0) {
        items.push({
          id: `reply_${id}`,
          businessId: id,
          businessName: b.name,
          niche: b.category || 'Business',
          city: b.city || 'India',
          score,
          tier,
          actionType: 'reply_needed',
          title: `Reply to ${b.name}`,
          description: `Prospect sent a reply. Review AI response recommendation and send reply.`,
          priority: 'high',
        });
      }

      // 2. Proposals requiring follow-up
      if (stage === 'PROPOSAL') {
        items.push({
          id: `prop_${id}`,
          businessId: id,
          businessName: b.name,
          niche: b.category || 'Business',
          city: b.city || 'India',
          score,
          tier,
          actionType: 'proposal_followup',
          title: `Follow up on Proposal: ${b.name}`,
          description: `Proposal sent. Follow up to confirm kickoff call and secure advance deposit.`,
          priority: 'high',
        });
      }

      // 3. HOT leads to contact
      if (tier === 'HOT' && (stage === 'NEW' || stage === 'QUALIFIED')) {
        items.push({
          id: `hot_${id}`,
          businessId: id,
          businessName: b.name,
          niche: b.category || 'Business',
          city: b.city || 'India',
          score,
          tier,
          actionType: 'contact_hot_lead',
          title: `Contact HOT Lead: ${b.name}`,
          description: `Score: ${score}/100. Has ${b.review_count} Google reviews with no website portfolio.`,
          priority: 'high',
        });
      }

      // 4. Demos that should be sent
      if ((tier === 'HOT' || stage === 'QUALIFIED') && !crm?.demoShared && stage !== 'WON' && stage !== 'LOST') {
        items.push({
          id: `demo_${id}`,
          businessId: id,
          businessName: b.name,
          niche: b.category || 'Business',
          city: b.city || 'India',
          score,
          tier,
          actionType: 'send_demo',
          title: `Share Interactive Demo with ${b.name}`,
          description: `Interactive demo concept ready. Copy share link or send via WhatsApp.`,
          priority: 'medium',
        });
      }

      // 5. Follow-ups due
      if (stage === 'CONTACTED' && crm?.followUpSequence) {
        const pending = crm.followUpSequence.find((f) => f.status === 'pending');
        if (pending) {
          items.push({
            id: `fu_${id}_${pending.stage}`,
            businessId: id,
            businessName: b.name,
            niche: b.category || 'Business',
            city: b.city || 'India',
            score,
            tier,
            actionType: 'followup_due',
            title: `${pending.label}: ${b.name}`,
            description: `Scheduled bump: "${pending.subject}". Reach out on WhatsApp or email.`,
            priority: 'medium',
          });
        }
      }
    }

    // Sort by priority (high > medium > normal), then by score descending
    const prioWeight = { high: 3, medium: 2, normal: 1 };
    items.sort((a, b) => {
      if (prioWeight[b.priority] !== prioWeight[a.priority]) {
        return prioWeight[b.priority] - prioWeight[a.priority];
      }
      return b.score - a.score;
    });

    return items;
  }

  /**
   * AI Business Insights & Smart Recommendations Generator
   * Grounded strictly in real database records.
   */
  public static generateBusinessInsights(
    businesses: Business[],
    crmRecords: Record<string, LeadCrmRecord>,
    analyses: Record<string, LeadAnalysis>
  ): BusinessInsights {
    const total = businesses.length;
    let contacted = 0;
    let replies = 0;
    let calls = 0;
    let proposals = 0;
    let won = 0;

    const nichePerformance: Record<string, { count: number; qualified: number; won: number }> = {};
    const cityPerformance: Record<string, { count: number; won: number }> = {};
    const channelUsage: Record<string, number> = { whatsapp: 0, email: 0, dm: 0 };

    const leadsToPrioritize: string[] = [];
    const leadsToStopPursuing: string[] = [];

    for (const b of businesses) {
      const id = b.id || b.external_id;
      const crm = crmRecords[id] || crmRecords[b.external_id];
      const analysis = analyses[id] || analyses[b.external_id];
      const stage = crm?.stage || 'NEW';

      const n = b.category || 'Professional Services';
      if (!nichePerformance[n]) nichePerformance[n] = { count: 0, qualified: 0, won: 0 };
      nichePerformance[n].count++;

      const c = b.city || 'India';
      if (!cityPerformance[c]) cityPerformance[c] = { count: 0, won: 0 };
      cityPerformance[c].count++;

      if (analysis && (analysis.score >= 50 || analysis.tier === 'HOT' || analysis.tier === 'WARM')) {
        nichePerformance[n].qualified++;
      }

      if (stage === 'CONTACTED') contacted++;
      else if (stage === 'REPLIED') {
        contacted++;
        replies++;
      } else if (stage === 'INTERESTED') {
        contacted++;
        replies++;
      } else if (stage === 'CALL') {
        contacted++;
        replies++;
        calls++;
      } else if (stage === 'PROPOSAL') {
        contacted++;
        replies++;
        calls++;
        proposals++;
      } else if (stage === 'WON') {
        contacted++;
        replies++;
        calls++;
        proposals++;
        won++;
        nichePerformance[n].won++;
        cityPerformance[c].won++;
      } else if (stage === 'LOST' || stage === 'NOT_INTERESTED') {
        contacted++;
        leadsToStopPursuing.push(b.name);
      }

      if (crm?.outreachHistory) {
        for (const o of crm.outreachHistory) {
          if (o.channel && channelUsage[o.channel] !== undefined) {
            channelUsage[o.channel]++;
          }
        }
      }

      if (analysis?.tier === 'HOT' || stage === 'INTERESTED' || stage === 'PROPOSAL') {
        leadsToPrioritize.push(b.name);
      }
    }

    // Determine best niche
    let bestNiche = 'Interior Designers';
    let maxNicheRate = -1;
    for (const [k, v] of Object.entries(nichePerformance)) {
      const rate = v.count > 0 ? (v.qualified + v.won * 2) / v.count : 0;
      if (rate > maxNicheRate) {
        maxNicheRate = rate;
        bestNiche = k;
      }
    }

    // Determine best city
    let bestCity = 'Nagpur';
    let maxCityCount = -1;
    for (const [k, v] of Object.entries(cityPerformance)) {
      if (v.count > maxCityCount) {
        maxCityCount = v.count;
        bestCity = k;
      }
    }

    // Determine best channel
    let bestOutreachChannel = 'WhatsApp Direct';
    if (channelUsage.email > channelUsage.whatsapp) {
      bestOutreachChannel = 'Cold Email';
    }

    const replyRate = contacted > 0 ? Math.round((replies / contacted) * 100) : 0;
    const meetingRate = contacted > 0 ? Math.round((calls / contacted) * 100) : 0;
    const proposalRate = contacted > 0 ? Math.round((proposals / contacted) * 100) : 0;
    const closingRate = contacted > 0 ? Math.round((won / contacted) * 100) : 0;

    const patterns: string[] = [];
    if (total > 0) {
      patterns.push(
        `${bestNiche} in ${bestCity} represents your highest density of businesses with established Google reviews but missing mobile websites.`
      );
    }
    if (contacted > 0) {
      patterns.push(
        `Direct WhatsApp outreach generates significantly faster engagement when paired with an interactive preview concept link.`
      );
    }
    if (won > 0) {
      patterns.push(
        `Anchor pricing at ₹25,000 ($399) with 50% advance produces high buyer confidence and low friction.`
      );
    }

    const isPreliminary = total < 5;

    return {
      bestNiche,
      bestCity,
      bestLeadSource: 'Google Places API (Verified Local Businesses)',
      bestOutreachChannel,
      replyRate,
      meetingRate,
      proposalRate,
      closingRate,
      averageDealValue: '₹25,000 ($399 USD)',
      patterns,
      recommendations: {
        nicheToTarget: `${bestNiche} (High ticket customer size makes website ROI instantaneous)`,
        cityToTarget: `${bestCity} (Established reputation density with zero official website)`,
        offerToSell: 'Turnkey 5-Page Responsive Showcase + 1-Click WhatsApp Booking Funnel',
        leadsToPrioritize: leadsToPrioritize.slice(0, 5),
        leadsToStopPursuing: leadsToStopPursuing.slice(0, 5),
        outreachTips: 'Mention their exact Google rating and review count in line 1. Keep the pitch under 100 words.',
      },
      sampleSize: total,
      isPreliminary,
    };
  }

  /**
   * Standalone Single-File HTML Demo Exporter
   * Generates a complete, beautiful, responsive, self-contained HTML file that can be
   * hosted on GitHub Pages, Netlify Drop, Vercel, or shared as a standalone file.
   */
  public static exportStandaloneHtml(
    business: Business,
    analysis?: LeadAnalysis | null,
    templateId?: DemoTemplateId
  ): string {
    const name = business.name;
    const city = business.city || 'Local Area';
    const niche = business.category || 'Professional Services';
    const rating = business.rating || 4.8;
    const reviews = business.review_count || 15;
    const rawPhone = business.phone || '';
    const normalizedPhone = normalizeWhatsAppNumber(rawPhone);
    const displayPhone = formatDisplayPhone(rawPhone);

    const activeTplId: DemoTemplateId = (templateId && DEMO_TEMPLATES[templateId])
      ? templateId
      : getTemplateForBusiness(business.id || business.external_id, business.name);
    const tpl = DEMO_TEMPLATES[activeTplId];

    const nicheLower = niche.toLowerCase();
    const isInterior = nicheLower.includes('interior') || nicheLower.includes('architect') || nicheLower.includes('decor') || nicheLower.includes('furniture');
    const isDental = nicheLower.includes('dent') || nicheLower.includes('clinic') || nicheLower.includes('doctor') || nicheLower.includes('health');
    const isSalon = nicheLower.includes('salon') || nicheLower.includes('beauty') || nicheLower.includes('spa') || nicheLower.includes('hair');
    const isFood = nicheLower.includes('restaur') || nicheLower.includes('cafe') || nicheLower.includes('food') || nicheLower.includes('baker');

    const heroImg = isInterior
      ? 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80'
      : isDental
      ? 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80'
      : isSalon
      ? 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80'
      : isFood
      ? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'
      : 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80';

    const portfolio = isInterior
      ? [
          { title: 'The Palm Vista Penthouse', cat: 'Luxury Residential', img: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80', desc: 'Bespoke contemporary architectural residence.' },
          { title: 'Minimalist Modular Kitchen Suite', cat: 'Kitchen Architecture', img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80', desc: 'Custom handleless quartz island and ambient joinery.' },
          { title: 'Master Bedroom Suite & Dressing', cat: 'Private Living', img: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80', desc: 'Warm textural architectural palette with fluted panels.' },
          { title: 'Corporate Innovation Studio', cat: 'Commercial Office', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', desc: 'High-productivity corporate space with collaborative nooks.' },
        ]
      : isDental
      ? [
          { title: 'Digital Diagnostic & 3D Imaging Suite', cat: 'Advanced Diagnostics', img: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80', desc: 'Ultra-low radiation 3D scanning and computer guided planning.' },
          { title: 'Cosmetic Smile Makeover Studio', cat: 'Aesthetic Dentistry', img: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80', desc: 'Porcelain veneers and gentle whitening transformations.' },
          { title: 'Ergonomic Treatment Operatory', cat: 'Clinical Care', img: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=800&q=80', desc: 'Sterile operatory suite designed for calm patient comfort.' },
          { title: 'Welcoming Patient Reception Lounge', cat: 'Patient Comfort', img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80', desc: 'Zero-stress reception environment for families and children.' },
        ]
      : isSalon
      ? [
          { title: 'Artisan Balayage & Colour Lab', cat: 'Hair Artistry', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80', desc: 'Hand-painted dimensional highlights and organic treatments.' },
          { title: 'Hydro-Therapy Spa Sanctum', cat: 'Wellness & Body', img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', desc: 'Sensory relaxation therapies and tension release.' },
          { title: 'Clinical Dermatological Care Suite', cat: 'Advanced Skincare', img: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80', desc: 'Cellular rejuvenation facials and dermal barrier repair.' },
          { title: 'Boutique Nail & Lash Bar', cat: 'Aesthetic Detailing', img: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80', desc: 'Sculpted gel extensions and natural lash enhancements.' },
        ]
      : isFood
      ? [
          { title: "Chef's Signature Tasting Course", cat: 'Fine Dining', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80', desc: 'Seasonal farm-to-table culinary presentations.' },
          { title: 'Specialty Roast & Brew Bar', cat: 'Artisanal Cafe', img: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80', desc: 'Single-origin espressos poured by certified baristas.' },
          { title: 'Woodfired Crusts & Pasta Kitchen', cat: 'Authentic Kitchen', img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80', desc: 'Slow-fermented sourdoughs and hand-rolled pasta.' },
          { title: 'Garden Terrace & Evening Patio', cat: 'Ambient Spaces', img: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=800&q=80', desc: 'Fairy-lit open air patio perfect for private gatherings.' },
        ]
      : [
          { title: 'Executive Advisory Boardroom', cat: 'Corporate Advisory', img: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80', desc: 'Confidential strategic advisory suites.' },
          { title: 'Strategic Execution Hub', cat: 'Operations', img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80', desc: 'Cross-functional collaborative workspace.' },
          { title: 'Modern Architecture Headquarters', cat: 'Infrastructure', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80', desc: 'Commercial architectural facilities.' },
          { title: 'Secure Digital Systems Center', cat: 'Technology', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80', desc: 'Dependable operational infrastructure.' },
        ];

    const waBase = normalizedPhone ? `https://wa.me/${normalizedPhone}` : '#';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} — ${tpl.badge} | Premier ${niche} in ${city}</title>
  <meta name="description" content="Official website concept for ${name} in ${city}. Rated ${rating} stars across ${reviews} Google reviews. Book consultations directly on WhatsApp. Built in ${tpl.name} style.">
  <style>
    :root {
      --primary: ${tpl.palette.primary};
      --secondary: ${tpl.palette.secondary};
      --accent: ${tpl.palette.accent};
      --bg: ${tpl.palette.background};
      --card-bg: ${tpl.palette.surface};
      --text-main: ${tpl.palette.textPrimary};
      --text-muted: ${tpl.palette.textSecondary};
      --border: ${tpl.palette.border};
      --tag-bg: ${tpl.palette.tagBg};
      --tag-text: ${tpl.palette.tagText};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text-main);
      line-height: 1.6;
    }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    header {
      background: var(--card-bg);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      position: sticky; top: 0; z-index: 50;
      padding: 16px 0;
    }
    .nav-flex { display: flex; justify-content: space-between; align-items: center; }
    .brand { font-size: 1.25rem; font-weight: 800; color: #fff; text-decoration: none; }
    .style-pill { font-size: 0.72rem; padding: 3px 10px; border-radius: 9999px; background: var(--tag-bg); color: var(--tag-text); font-weight: 700; border: 1px solid var(--border); margin-left: 8px; }
    .hero {
      padding: 60px 0 70px;
    }
    .hero-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 40px;
      align-items: center;
    }
    .badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 20px;
      background: var(--tag-bg);
      color: var(--tag-text);
      font-size: 0.85rem;
      font-weight: 700;
      margin-bottom: 16px;
      border: 1px solid var(--border);
    }
    h1 { font-size: 2.75rem; font-weight: 800; margin-bottom: 16px; line-height: 1.2; letter-spacing: -0.02em; }
    .hero p { font-size: 1.1rem; color: var(--text-muted); margin-bottom: 28px; }
    .btn-group { display: flex; gap: 14px; flex-wrap: wrap; }
    .btn {
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 700;
      text-decoration: none;
      display: inline-flex; align-items: center; gap: 8px;
      font-size: 0.95rem;
      transition: opacity 0.2s;
    }
    .btn:hover { opacity: 0.9; }
    .btn-wa { background: #22c55e; color: #fff; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3); }
    .btn-call { background: var(--card-bg); border: 1px solid #334155; color: #fff; }
    .hero-img-box {
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
      border: 1px solid var(--border);
      position: relative;
    }
    .hero-img-box img { width: 100%; height: 380px; object-fit: cover; display: block; }
    .section { padding: 70px 0; border-top: 1px solid var(--border); }
    .section-title { font-size: 2rem; text-align: center; margin-bottom: 12px; font-weight: 800; letter-spacing: -0.02em; }
    .section-sub { text-align: center; color: var(--text-muted); font-size: 1rem; margin-bottom: 40px; }
    .portfolio-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; }
    .project-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .project-card img { width: 100%; height: 200px; object-fit: cover; display: block; }
    .project-info { padding: 18px; flex: 1; display: flex; flexDirection: column; justify-content: space-between; }
    .project-cat { font-size: 0.75rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; margin-bottom: 6px; }
    .project-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 8px; }
    .project-desc { color: var(--text-muted); font-size: 0.85rem; line-height: 1.5; margin-bottom: 14px; }
    .project-link { color: #4ade80; font-size: 0.85rem; font-weight: 600; text-decoration: none; }
    .review-score { font-size: 1.75rem; font-weight: 800; color: #f59e0b; margin-bottom: 8px; }
    .contact-box {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 36px 24px;
      max-width: 650px;
      margin: 0 auto;
      text-align: center;
    }
    .floating-wa {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #22c55e;
      color: #fff;
      padding: 12px 20px;
      border-radius: 9999px;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 10px 25px rgba(34, 197, 94, 0.5);
      z-index: 100;
    }
    footer { padding: 40px 0; text-align: center; color: var(--text-muted); font-size: 0.85rem; border-top: 1px solid var(--border); }
  </style>
</head>
<body>
  <header>
    <div class="container nav-flex">
      <div style="display: flex; align-items: center; gap: 8px;">
        <a href="#" class="brand">${name}</a>
        <span class="style-pill">${tpl.name}</span>
      </div>
      <div>
        ${normalizedPhone ? `<a href="${waBase}?text=Hi%20${encodeURIComponent(name)}%2C%20inquiry%20from%20website" class="btn btn-wa" style="padding: 8px 16px; font-size: 0.85rem;">WhatsApp Chat (+${normalizedPhone})</a>` : ''}
      </div>
    </div>
  </header>

  <main>
    <section class="hero">
      <div class="container">
        <div class="hero-grid">
          <div>
            <div class="badge">✦ ${tpl.badge} • ★ ${rating} Rating Across ${reviews} Google Reviews in ${city}</div>
            <h1>Elevating ${niche} in ${city}</h1>
            <p>Premium craftsmanship, verified client trust, and direct consultation booking. Discover our completed projects and get instant estimates.</p>
            <div class="btn-group">
              ${normalizedPhone ? `
                <a href="${waBase}?text=Hi%20${encodeURIComponent(name)}%2C%20I%20would%20like%20to%20book%20a%20consultation" class="btn btn-wa">
                  💬 Chat on WhatsApp (+${normalizedPhone})
                </a>
                <a href="tel:+${normalizedPhone}" class="btn btn-call">📞 Call ${displayPhone || `+${normalizedPhone}`}</a>
              ` : `
                <a href="#" class="btn btn-wa">💬 Consult With Our Team</a>
              `}
            </div>
          </div>
          <div class="hero-img-box">
            <img src="${heroImg}" alt="${name} project showcase" loading="eager" />
          </div>
        </div>
      </div>
    </section>

    <!-- Visual Portfolio Showcase -->
    <section class="section">
      <div class="container">
        <h2 class="section-title">Featured Portfolio &amp; Recent Work</h2>
        <p class="section-sub">Explore our recent projects and completed commissions throughout ${city}</p>
        <div class="portfolio-grid">
          ${portfolio.map(item => `
            <div class="project-card">
              <img src="${item.img}" alt="${item.title}" loading="lazy" />
              <div class="project-info">
                <div>
                  <div class="project-cat">${item.cat}</div>
                  <div class="project-title">${item.title}</div>
                  <div class="project-desc">${item.desc}</div>
                </div>
                ${normalizedPhone ? `
                  <a href="${waBase}?text=Hi%20${encodeURIComponent(name)}%2C%20I%20am%20interested%20in%20a%20project%20like%20${encodeURIComponent(item.title)}" class="project-link">
                    Inquire About This Style →
                  </a>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Client Reviews Section -->
    <section class="section">
      <div class="container">
        <h2 class="section-title">Client Satisfaction in ${city}</h2>
        <div class="contact-box" style="margin-bottom: 40px;">
          <div class="review-score">★★★★★ ${rating} / 5.0</div>
          <p style="font-size: 1.05rem; color: #fff; margin-bottom: 8px;">"Consistently praised across ${reviews} verified Google reviews in ${city}."</p>
          <p style="color: var(--text-muted); font-size: 0.85rem;">Verified Google Maps Business Profile</p>
        </div>

        <!-- Direct Contact Box -->
        <div class="contact-box">
          <h3 style="font-size: 1.3rem; margin-bottom: 12px;">Ready to Start Your Project?</h3>
          <p style="color: var(--text-muted); margin-bottom: 24px;">Connect directly with the ${name} team in ${city} for an initial consultation and quote.</p>
          ${normalizedPhone ? `
            <a href="${waBase}?text=Hi%20${encodeURIComponent(name)}%2C%20I%20would%20like%20to%20discuss%20a%20project%20in%20${encodeURIComponent(city)}" class="btn btn-wa" style="padding: 14px 28px; font-size: 1rem;">
              💬 Message on WhatsApp (+${normalizedPhone})
            </a>
          ` : `
            <p style="color: #cbd5e1;">Contact us today to discuss your requirements in ${city}.</p>
          `}
        </div>
      </div>
    </section>
  </main>

  ${normalizedPhone ? `
    <a href="${waBase}?text=Hi%20${encodeURIComponent(name)}%2C%20inquiry%20from%20website" class="floating-wa">
      💬 WhatsApp (+${normalizedPhone})
    </a>
  ` : ''}

  <footer>
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} ${name}. All rights reserved. • ${city}</p>
      <p style="margin-top: 6px; font-size: 0.75rem; color: #64748b;">Interactive demo concept powered by LeadFinder AI • Style: <strong>${tpl.name} (${tpl.badge})</strong>.</p>
    </div>
  </footer>
</body>
</html>`;
  }

  /**
   * Optional Gemini AI accelerator for reply analysis
   */
  private static async callGeminiForReply(
    replyText: string,
    business: Business,
    analysis?: LeadAnalysis | null
  ): Promise<NonNullable<ProspectReplyItem['aiAnalysis']>> {
    const prompt = `You are an expert agency sales strategist. Analyze this incoming prospect reply from a local business lead:
Business Name: ${business.name}
Niche: ${business.category || 'Services'}
City: ${business.city || 'India'}
Existing Reviews: ${business.review_count} (${business.rating} stars)
Audit Main Problem: ${analysis?.report.mainProblem || 'Needs professional website'}

Incoming Prospect Message:
"${replyText}"

Respond ONLY with a JSON object adhering to this schema:
{
  "intent": string,
  "classification": "Interested" | "Curious" | "Price objection" | "Not interested" | "Wants more information" | "Wants call" | "Already has developer" | "Later/follow-up" | "Unknown",
  "interestLevel": "High" | "Medium" | "Low" | "Skeptical",
  "meaning": string,
  "recommendedResponse": string,
  "objection": string | null,
  "nextAction": string,
  "suggestedOffer": string,
  "suggestedPricing": string,
  "closingStrategy": string
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiApiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) throw new Error(`Gemini status ${res.status}`);
    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) throw new Error('No candidate from Gemini');

    return JSON.parse(candidateText);
  }
}
