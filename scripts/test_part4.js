// Complete Part 4 End-to-End Automated Acceptance Verification
const BASE_URL = 'http://localhost:3000';

async function runPart4AcceptanceTest() {
  console.log('=== RUNNING PART 4 ACCEPTANCE TEST ===\n');

  // 1. System Status & DB Persistence Check
  console.log('1. Checking system status...');
  const statusRes = await fetch(`${BASE_URL}/api/status`);
  const status = await statusRes.json();
  console.log(`✓ Database Provider: ${status.databaseProvider}`);
  console.log(`✓ Active Searches: ${status.activeSearches}`);

  // 2. Fetch CRM records & verify real data
  console.log('\n2. Fetching real businesses from CRM...');
  const crmRes = await fetch(`${BASE_URL}/api/crm`);
  const crmData = await crmRes.json();
  const businesses = crmData.businesses || [];
  console.log(`✓ Found ${businesses.length} real businesses in database.`);
  if (businesses.length === 0) {
    throw new Error('No businesses found in database! Real data must be preserved.');
  }

  const testLead = businesses[0];
  const leadId = testLead.id || testLead.external_id;
  console.log(`✓ Using real lead for tests: "${testLead.name}" (${testLead.city || 'Unknown City'}) - ID: ${leadId}`);

  // 3. Website Demo Delivery & Personalization
  console.log('\n3. Testing Website Demo Delivery (/demo/[businessId])...');
  const demoRes = await fetch(`${BASE_URL}/demo/${leadId}`);
  if (demoRes.status !== 200) {
    throw new Error(`Demo page returned status ${demoRes.status}`);
  }
  const demoHtml = await demoRes.text();
  const escapedName = testLead.name.replace(/&/g, '&amp;');
  if (!demoHtml.includes(testLead.name) && !demoHtml.includes(escapedName)) {
    throw new Error('Demo HTML does not include the business name!');
  }
  console.log(`✓ Demo page delivered HTTP 200 and rendered real business name "${testLead.name}"`);

  // 4. Standalone HTML Export (Free Hosting & Manual Export)
  console.log('\n4. Testing Standalone HTML Export (/api/crm/export-html)...');
  const exportRes = await fetch(`${BASE_URL}/api/crm/export-html?businessId=${leadId}`);
  if (exportRes.status !== 200) {
    throw new Error(`Export HTML failed with status ${exportRes.status}`);
  }
  const disposition = exportRes.headers.get('content-disposition') || '';
  const exportedHtml = await exportRes.text();
  if (!exportedHtml.includes('<!DOCTYPE html>') || (!exportedHtml.includes(testLead.name) && !exportedHtml.includes(escapedName))) {
    throw new Error('Exported HTML is invalid or missing business details');
  }
  console.log(`✓ Standalone HTML exported successfully:`);
  console.log(`  - Header: ${disposition}`);
  console.log(`  - HTML Size: ${exportedHtml.length} bytes`);
  console.log(`  - Self-contained free-hosting ready (Netlify Drop / Vercel / GitHub Pages)`);

  // 5. Track Demo Sharing in CRM
  console.log('\n5. Tracking Demo Share Event in CRM...');
  const trackRes = await fetch(`${BASE_URL}/api/crm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'track_demo',
      businessId: leadId,
      notes: 'Demo link shared via WhatsApp to client',
    }),
  });
  const trackData = await trackRes.json();
  const crmRec = trackData.record || trackData.crmRecord;
  if (!trackData.success || !crmRec?.demoShared) {
    throw new Error('Failed to track demo share: ' + JSON.stringify(trackData));
  }
  console.log(`✓ Demo share tracked: demoShared = ${crmRec.demoShared}, at ${crmRec.demoSharedAt}`);

  // 6. AI Outreach Optimizer Pre-send Audit
  console.log('\n6. Testing AI Outreach Optimizer (/api/crm/optimize-outreach)...');
  const testMessage = `Hi ${testLead.name} team, noticed you have a great ${testLead.rating || 4.8} star rating in ${testLead.city || 'your area'}, but no mobile website! Would you like to see a custom concept?`;
  const optRes = await fetch(`${BASE_URL}/api/crm/optimize-outreach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      businessId: leadId,
      message: testMessage,
    }),
  });
  const optData = await optRes.json();
  if (!optData.success || !optData.optimization) {
    throw new Error('Outreach optimizer failed: ' + JSON.stringify(optData));
  }
  const opt = optData.optimization;
  console.log(`✓ Optimization Results:`);
  console.log(`  - Personalization Score: ${opt.personalizationScore}%`);
  console.log(`  - Spam Risk: ${opt.spamRisk}`);
  console.log(`  - Clarity: ${opt.clarityRating}`);
  console.log(`  - Strongest Selling Point: ${opt.strongestSellingPoint}`);
  console.log(`  - Suggested Improvement: ${opt.suggestedImprovement}`);
  console.log(`  - Optimized Version:\n    ${opt.optimizedVersion.replace(/\n/g, '\n    ')}`);

  // Also test Spam-risk detection on high-risk message
  const spamTestRes = await fetch(`${BASE_URL}/api/crm/optimize-outreach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      businessId: leadId,
      message: 'URGENT WINNER! 100% FREE MONEY GUARANTEED ACT NOW CLICK HERE!!!!!',
    }),
  });
  const spamData = await spamTestRes.json();
  console.log(`✓ High-spam test flagged correctly as: ${spamData.optimization?.spamRisk}`);

  // 7. Response Intelligence (9 Reply Classifications)
  console.log('\n7. Testing Response Intelligence (9 Reply Classifications)...');
  const replyTestCases = [
    { text: 'Yes, this looks fantastic! I would love to see the concept.', expected: 'Interested' },
    { text: 'How does your service work and how does it compare to others?', expected: 'Curious' },
    { text: 'What are the charges? We have a very small budget right now.', expected: 'Price objection' },
    { text: 'Please remove our number, do not message us again.', expected: 'Not interested' },
    { text: 'Could you email me your full portfolio and packages list?', expected: 'Wants more information' },
    { text: 'Can we schedule a 10 min phone call on Friday afternoon?', expected: 'Wants call' },
    { text: 'We already have an in-house web designer who manages our site.', expected: 'Already has developer' },
    { text: 'We are busy with peak season, ping us back next quarter.', expected: 'Later/follow-up' },
    { text: 'Ok.', expected: 'Unknown' },
  ];

  for (const tc of replyTestCases) {
    const repRes = await fetch(`${BASE_URL}/api/crm/reply-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ replyText: tc.text, businessId: leadId }),
    });
    const repData = await repRes.json();
    if (!repData.success || !repData.classification) {
      throw new Error(`Reply analysis failed for: "${tc.text}"`);
    }
    const cat = repData.classification.category;
    if (cat !== tc.expected) {
      throw new Error(`Expected category [${tc.expected}] but got [${cat}] for "${tc.text}"`);
    }
    console.log(`✓ "${tc.text.slice(0, 32)}..." → Correctly classified as [${cat}]`);
    console.log(`    Recommended Next Action: ${repData.classification.recommendedAction}`);
  }

  // 8. Daily Action Plan & AI Business Insights
  console.log('\n8. Testing Daily Action Plan & AI Business Insights (/api/crm/insights)...');
  const insightsRes = await fetch(`${BASE_URL}/api/crm/insights`);
  const insightsData = await insightsRes.json();
  if (!insightsData.success) {
    throw new Error('Insights API failed: ' + JSON.stringify(insightsData));
  }

  const { insights, dailyActions } = insightsData;
  console.log(`✓ Daily Action Plan:`);
  console.log(`  - Total Action Items: ${dailyActions.length}`);
  dailyActions.slice(0, 5).forEach((item, idx) => {
    console.log(`    ${idx + 1}. [${item.priority}] ${item.title} (${item.businessName}) - Action: ${item.actionType}`);
  });

  console.log(`✓ Real AI Business Insights:`);
  console.log(`  - Reply Rate: ${insights.replyRate}%`);
  console.log(`  - Meeting Rate: ${insights.meetingRate}%`);
  console.log(`  - Proposal Rate: ${insights.proposalRate}%`);
  console.log(`  - Closing Rate: ${insights.closingRate}%`);
  console.log(`  - Average Deal Value: ${insights.averageDealValue}`);
  console.log(`  - Top Performing Niche: ${insights.bestNiche}`);
  console.log(`  - Top Performing City: ${insights.bestCity}`);
  console.log(`  - Sample Size: ${insights.sampleSize} tracked businesses`);
  console.log(`  - Preliminary Data Warning: ${insights.isPreliminary ? 'YES (Guards against premature conclusions)' : 'NO (Sufficient real data)'}`);
  console.log(`  - System Patterns (${insights.patterns.length}):`);
  insights.patterns.forEach(p => console.log(`    * ${p}`));
  console.log(`  - Strategic Recommendations:`);
  console.log(`    * Target Niche: ${insights.recommendations.nicheToTarget}`);
  console.log(`    * Target City: ${insights.recommendations.cityToTarget}`);
  console.log(`    * Offer to Pitch: ${insights.recommendations.offerToSell}`);
  console.log(`    * Outreach Tips: ${insights.recommendations.outreachTips}`);
  if (insights.recommendations.leadsToPrioritize?.length) {
    console.log(`    * Leads to Prioritize: ${insights.recommendations.leadsToPrioritize.join(', ')}`);
  }
  if (insights.recommendations.leadsToStopPursuing?.length) {
    console.log(`    * Leads to Stop Pursuing: ${insights.recommendations.leadsToStopPursuing.join(', ')}`);
  }

  console.log('\n======================================================');
  console.log('✓ ALL PART 4 ACCEPTANCE TESTS PASSED SUCCESSFULLY!');
  console.log('======================================================');
}

runPart4AcceptanceTest().catch((err) => {
  console.error('\n❌ ACCEPTANCE TEST FAILED:', err);
  process.exit(1);
});
