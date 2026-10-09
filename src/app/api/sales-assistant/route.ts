import { NextRequest, NextResponse } from 'next/server';
import { getLeadRepository } from '@/lib/db';
import { LeadAnalyzer } from '@/lib/services/leadAnalyzer';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { businessId, replyText, business: rawBusiness } = await req.json();

    if (!businessId && !rawBusiness) {
      return NextResponse.json({ error: 'businessId or business object is required' }, { status: 400 });
    }

    const repo = getLeadRepository();
    let business = businessId ? await repo.getBusinessById(String(businessId)) : null;
    if (!business && rawBusiness) {
      business = rawBusiness;
    }

    let analysis = businessId ? await repo.getLeadAnalysis(String(businessId)) : null;
    if (!analysis && business) {
      try {
        analysis = await LeadAnalyzer.analyze(business);
      } catch {
        // ignore analysis failure, continue with defaults
      }
    }

    if (!business && !analysis) {
      return NextResponse.json({ error: 'Business or lead analysis not found' }, { status: 404 });
    }

    const name = business?.name || 'Client';
    const niche = business?.category || 'Professional Services';
    const city = business?.city || 'Local Area';
    const priceRange = analysis?.report?.suggestedPriceRange || '₹25,000 – ₹45,000 / $500 – $900 (AI Estimate)';

    const text = (replyText || '').toLowerCase().trim();

    let intent = 'general_inquiry';
    let suggestedReply = '';
    let objectionAnalysis = '';
    let pricingResponse = '';
    let followUpTiming = 'Follow up in 48 hours if no response.';
    let closingStrategy = 'Offer a brief 10-minute demo call to review the tailored prototype.';

    // Intent Detection
    if (
      text.includes('expensive') ||
      text.includes('cost') ||
      text.includes('price') ||
      text.includes('how much') ||
      text.includes('rate') ||
      text.includes('budget')
    ) {
      intent = 'pricing_objection';
      objectionAnalysis =
        'The prospect is interested in the outcome but evaluating financial risk. Do not discount immediately; frame price against client lifetime value.';
      suggestedReply = `Totally understand budget is a key consideration, ${name} team! Our packages range around ${priceRange} depending on exact custom features.

The key thing: for a ${niche} in ${city}, gaining just 1 single project from a client who discovers you on Google or WhatsApp completely pays for the website. 

Would you be open to a quick 5-minute call so I can show you the interactive demo we built for you? No pressure at all.`;
      pricingResponse = `State the anchor estimate (${priceRange}) and immediately contrast it with the revenue of 1 closed ${niche} project.`;
      closingStrategy = 'Lock in a 10-minute screenshare call where you show their live demo concept.';
      followUpTiming = 'Follow up within 24 hours if they do not reply to the pricing answer.';
    } else if (
      text.includes('not interested') ||
      text.includes('no thanks') ||
      text.includes('dont need') ||
      text.includes("don't need") ||
      text.includes('already have')
    ) {
      intent = 'brush_off';
      objectionAnalysis =
        'The prospect reflexively dismisses cold outreach because they assume generic spam. Break the pattern with grace and leave the demo link.';
      suggestedReply = `No problem at all, ${name} team! I appreciate you getting back to me. 

I'll leave the interactive concept link with you here: [DEMO_LINK]. If you ever want to upgrade your mobile presence or WhatsApp lead capture down the road, feel free to reach back out!`;
      pricingResponse = 'Do not mention pricing when dismissed; leave goodwill and the demo link.';
      closingStrategy = 'Soft close: leave value and set a reminder to re-engage in 60-90 days.';
      followUpTiming = 'Wait 60 days before re-approaching with a fresh case study or portfolio sample.';
    } else if (
      text.includes('send proposal') ||
      text.includes('send details') ||
      text.includes('share details') ||
      text.includes('portfolio') ||
      text.includes('examples') ||
      text.includes('brochure')
    ) {
      intent = 'proposal_request';
      objectionAnalysis =
        'High buying signal, but "send proposal" can be a polite stalling tactic. Send the demo link immediately and request a quick 5-min walk-through.';
      suggestedReply = `Gladly! To make it super concrete, here is the interactive demo concept built specifically for ${name}:
👉 [DEMO_LINK]

It demonstrates:
1. Fast mobile-responsive project showcase
2. 1-tap WhatsApp consultation funnel
3. Google review credibility integration

Are you free for a quick 5-minute chat tomorrow at 11 AM or 3 PM to discuss any specific sections you'd like adjusted?`;
      pricingResponse = `Keep pricing tied to the demo: "Typical setup is around ${priceRange} turnkey."`;
      closingStrategy = 'Propose two specific times (e.g. 11 AM or 3 PM tomorrow) for a 5-minute confirmation call.';
      followUpTiming = 'Follow up in 24 hours if the proposal is viewed without a reply.';
    } else if (
      text.includes('call me') ||
      text.includes('interested') ||
      text.includes('lets talk') ||
      text.includes("let's talk") ||
      text.includes('yes') ||
      text.includes('schedule')
    ) {
      intent = 'hot_interest';
      objectionAnalysis = 'Hot prospect ready to engage. Act immediately to secure a calendar slot or phone call.';
      suggestedReply = `Awesome! What is the best number to reach you on, and does today at 4:00 PM or tomorrow morning work better for a quick 10-minute walk-through? 

Looking forward to connecting with the ${name} team!`;
      pricingResponse = 'Save specific scope customization for the call after understanding their goals.';
      closingStrategy = 'Confirm call time immediately and send a calendar invite / WhatsApp confirmation.';
      followUpTiming = 'Reply within 15 minutes while intent is at its peak!';
    } else {
      suggestedReply = `Thanks for getting back to me! To give you a clear visual of what we had in mind for ${name}, check out this custom layout preview:
👉 [DEMO_LINK]

Would love to hear your feedback on the mobile WhatsApp booking funnel!`;
      objectionAnalysis = 'Prospect responded but intent is open. Steer them to inspect the interactive demo.';
      closingStrategy = 'Direct them to the demo link and ask for their opinion on one specific feature.';
    }

    return NextResponse.json({
      intent,
      suggestedReply,
      objectionAnalysis,
      pricingResponse,
      closingStrategy,
      followUpTiming,
      recommendedService: analysis?.report?.recommendedService || `Custom ${niche} Growth Website`,
      suggestedPriceRange: priceRange,
    });
  } catch (error: any) {
    console.error('Sales assistant error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process sales guidance' },
      { status: 500 }
    );
  }
}
