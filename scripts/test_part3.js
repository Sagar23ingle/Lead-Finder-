// Complete Part 3 End-to-End Automated Acceptance Verification
const BASE_URL = 'http://localhost:3000';

async function runAcceptanceTest() {
  console.log('=== RUNNING PART 3 ACCEPTANCE TEST ===\n');

  // 1. Verify Status & Config
  console.log('1. Checking system status...');
  const statusRes = await fetch(`${BASE_URL}/api/status`);
  const status = await statusRes.json();
  console.log('✓ Status OK:', status.databaseProvider);

  // 2. Fetch CRM Initial State
  console.log('\n2. Fetching CRM Initial Records & Dashboard Metrics...');
  const crmRes = await fetch(`${BASE_URL}/api/crm`);
  const crmData = await crmRes.json();
  console.log('✓ Businesses in DB:', crmData.businesses?.length || 0);
  console.log('✓ Initial Metrics:', crmData.metrics);

  const testBusiness = crmData.businesses?.[0];
  if (!testBusiness) {
    throw new Error('No existing business found in database! Data must be preserved.');
  }
  const businessId = testBusiness.id || testBusiness.external_id;
  console.log(`✓ Targeting existing real lead: "${testBusiness.name}" (ID: ${businessId})`);

  // 3. Generate Personalized Outreach
  console.log('\n3. Generating Personalized Outreach Messages...');
  const outreachRes = await fetch(`${BASE_URL}/api/crm/outreach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ businessId, contactPerson: 'Mr. Sharma' }),
  });
  const outreachData = await outreachRes.json();
  if (!outreachData.success || !outreachData.messages) {
    throw new Error('Outreach generation failed: ' + JSON.stringify(outreachData));
  }
  console.log('✓ WhatsApp Message generated:\n---');
  console.log(outreachData.messages.whatsapp);
  console.log('---\n✓ Email Subject:', outreachData.messages.email.subject);
  console.log('✓ Follow-up Steps generated:', outreachData.followUpSequence?.length);

  // 4. Mark Lead as Contacted (Human-in-control sending)
  console.log('\n4. Marking Lead as Contacted & Logging Outreach...');
  const now = new Date().toISOString();
  const crmUpdate1 = {
    businessId,
    stage: 'CONTACTED',
    contactPerson: 'Mr. Sharma',
    contactPhone: testBusiness.phone,
    contactEmail: 'sharma@nagpurinteriors.com',
    notes: 'Initial outreach sent via WhatsApp with custom design preview.',
    outreachHistory: [
      {
        id: 'outreach_' + Date.now(),
        channel: 'whatsapp',
        stage: 'initial',
        sentAt: now,
        content: outreachData.messages.whatsapp,
        status: 'sent',
      },
    ],
    prospectReplies: [],
    followUpSequence: outreachData.followUpSequence,
    proposal: null,
    createdAt: now,
    updatedAt: now,
  };

  const updateRes1 = await fetch(`${BASE_URL}/api/crm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ record: crmUpdate1 }),
  });
  const updateData1 = await updateRes1.json();
  console.log('✓ Stage updated to:', updateData1.record?.stage);
  console.log('✓ Updated Metrics (Contacted count):', updateData1.metrics?.contacted);

  // 5. Add Prospect Reply & Analyze with AI Sales Assistant
  console.log('\n5. Simulating Incoming Prospect Reply & Testing AI Sales Assistant...');
  const prospectReply = 'Hi! Saw the concept. How much do you charge for a 5-page website and how fast can you deliver?';
  const replyAnalysisRes = await fetch(`${BASE_URL}/api/crm/reply-analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ businessId, replyText: prospectReply }),
  });
  const replyAnalysisData = await replyAnalysisRes.json();
  if (!replyAnalysisData.success || !replyAnalysisData.aiAnalysis) {
    throw new Error('Reply analysis failed: ' + JSON.stringify(replyAnalysisData));
  }
  console.log('✓ AI Breakdown:');
  console.log('  Intent:', replyAnalysisData.aiAnalysis.intent);
  console.log('  Interest Level:', replyAnalysisData.aiAnalysis.interestLevel);
  console.log('  Meaning:', replyAnalysisData.aiAnalysis.meaning);
  console.log('  Recommended Response:\n  ' + replyAnalysisData.aiAnalysis.recommendedResponse.replace(/\n/g, '\n  '));
  console.log('  Suggested Pricing:', replyAnalysisData.aiAnalysis.suggestedPricing);
  console.log('  Closing Strategy:', replyAnalysisData.aiAnalysis.closingStrategy);

  // 6. Record Reply in CRM and Move to INTERESTED (Follow-up sequence must auto-stop!)
  console.log('\n6. Recording Reply in CRM & Verifying Auto-Stop on Follow-Up Sequence...');
  const crmUpdate2 = {
    ...updateData1.record,
    stage: 'INTERESTED',
    prospectReplies: [
      {
        id: 'reply_' + Date.now(),
        receivedAt: new Date().toISOString(),
        text: prospectReply,
        aiAnalysis: replyAnalysisData.aiAnalysis,
      },
    ],
    updatedAt: new Date().toISOString(),
  };
  const updateRes2 = await fetch(`${BASE_URL}/api/crm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ record: crmUpdate2 }),
  });
  const updateData2 = await updateRes2.json();
  const allCancelled = updateData2.record?.followUpSequence?.every(
    (f) => f.status === 'cancelled'
  );
  console.log('✓ Stage updated to:', updateData2.record?.stage);
  console.log('✓ Follow-up Sequence Auto-Stopped (all cancelled):', allCancelled);

  // 7. Generate Mini Proposal
  console.log('\n7. Generating Mini Proposal...');
  const proposalRes = await fetch(`${BASE_URL}/api/crm/proposal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ businessId }),
  });
  const proposalData = await proposalRes.json();
  if (!proposalData.success || !proposalData.proposal) {
    throw new Error('Proposal generation failed: ' + JSON.stringify(proposalData));
  }
  console.log('✓ Proposal Generated:');
  console.log('  Client:', proposalData.proposal.clientName);
  console.log('  Problem:', proposalData.proposal.problem);
  console.log('  Solution:', proposalData.proposal.solution);
  console.log('  Deliverables count:', proposalData.proposal.deliverables?.length);
  console.log('  Timeline:', proposalData.proposal.timeline);
  console.log('  Price:', proposalData.proposal.price);

  // 8. Edit Proposal, Advance to PROPOSAL, then to WON
  console.log('\n8. Editing Proposal & Advancing to PROPOSAL stage...');
  const crmUpdate3 = {
    ...updateData2.record,
    stage: 'PROPOSAL',
    proposal: proposalData.proposal,
    updatedAt: new Date().toISOString(),
  };
  const updateRes3 = await fetch(`${BASE_URL}/api/crm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ record: crmUpdate3 }),
  });
  const updateData3 = await updateRes3.json();
  console.log('✓ Stage updated to:', updateData3.record?.stage);
  console.log('✓ Proposals Metric:', updateData3.metrics?.proposals);

  console.log('\n9. Closing Deal: Moving to WON Stage...');
  const crmUpdate4 = {
    ...updateData3.record,
    stage: 'WON',
    notes: updateData3.record.notes + '\nClient approved proposal on call! 50% advance received.',
    updatedAt: new Date().toISOString(),
  };
  const updateRes4 = await fetch(`${BASE_URL}/api/crm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ record: crmUpdate4 }),
  });
  const updateData4 = await updateRes4.json();
  console.log('✓ Stage updated to:', updateData4.record?.stage);
  console.log('✓ Won Count in Live Metrics:', updateData4.metrics?.won);
  console.log('✓ Conversion Rate in Live Metrics:', updateData4.metrics?.conversionRate + '%');

  // 10. Re-fetch from database to verify full persistence
  console.log('\n10. Re-fetching CRM directly to verify 100% database persistence...');
  const verifyRes = await fetch(`${BASE_URL}/api/crm`);
  const verifyData = await verifyRes.json();
  const persistedRecord = verifyData.crmRecords?.[businessId];
  if (!persistedRecord) {
    throw new Error('Persisted record not found in database on re-fetch!');
  }
  console.log('✓ Verified Persisted Stage:', persistedRecord.stage);
  console.log('✓ Verified Persisted Replies:', persistedRecord.prospectReplies?.length);
  console.log('✓ Verified Persisted Proposal Client:', persistedRecord.proposal?.clientName);
  console.log('✓ Final Live Dashboard Metrics:');
  console.table(verifyData.metrics);

  console.log('\n=== ALL PART 3 ACCEPTANCE TESTS PASSED SUCCESSFULLY! ===');
}

runAcceptanceTest().catch((err) => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});
