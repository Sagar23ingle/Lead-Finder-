export interface Business {
  id: string;
  external_id: string; // Google Place ID or provider unique ID
  placeId?: string; // Canonical alias for external_id
  name: string;
  businessName?: string; // Canonical alias for name
  category: string | null;
  address: string | null;
  city: string | null;
  state?: string | null;
  country: string | null;
  phone: string | null;
  website: string | null;
  google_maps_url: string | null;
  googleMapsUrl?: string | null; // Canonical alias for google_maps_url
  rating: number | null;
  review_count: number;
  reviewCount?: number; // Canonical alias for review_count
  latitude: number | null;
  longitude: number | null;
  opening_status?: string | null;
  source: string; // 'google_places'
  raw_data?: Record<string, unknown> | null;
  discoveredAt?: string; // Canonical alias for created_at
  created_at: string;
  updated_at: string;
}

export interface CanonicalLead {
  businessName: string;
  name: string;
  category: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  phone: string | null;
  website: string | null;
  googleMapsUrl: string | null;
  placeId: string;
  id: string;
  rating: number | null;
  reviewCount: number;
  latitude: number | null;
  longitude: number | null;
  source: string;
  discoveredAt: string;
  websiteStatus?: string;
  aiScore?: number;
  aiTier?: 'HOT' | 'WARM' | 'LOW';
  aiReason?: string;
}

export interface SearchRecord {
  id: string;
  query: string; // "Interior Designers — Nagpur — 50 leads"
  niche: string;
  city: string;
  country: string;
  leads_requested: number;
  leads_found: number;
  created_at: string;
  businesses?: Business[];
}

export interface SearchRequest {
  country: string;
  city: string;
  niche: string;
  limit: 10 | 25 | 50 | 100;
}

export interface SearchResponse {
  searchId: string;
  query: string;
  leadsRequested: number;
  leadsFound: number;
  businesses: Business[];
  source: 'google_places' | 'database_cache';
  message?: string;
}

export interface AppConfigStatus {
  googlePlacesConfigured: boolean;
  placesStatus?: 'CONFIGURED' | 'NOT_CONFIGURED' | 'AUTH_ERROR' | 'QUOTA_EXCEEDED' | 'NOT_ENABLED' | 'REQUEST_FAILED';
  placesStatusMessage?: string;
  placesSource?: 'env' | 'session' | 'none';
  supabaseConfigured: boolean;
  databaseProvider: 'supabase' | 'local_persistent' | 'ephemeral_serverless';
  databaseStatusMessage?: string;
  geminiConfigured: boolean;
  geminiStatusMessage?: string;
  isVercel?: boolean;
}

// ====================================================================
// PART 2: INTELLIGENCE & OPPORTUNITY ENGINE TYPES
// ====================================================================

export interface WebsiteAudit {
  checked: boolean;
  hasWebsite: boolean;
  url: string | null;
  isReachable: boolean | null;
  httpStatus: number | null;
  latencyMs: number | null;
  isHttps: boolean;
  hasMobileViewport: boolean;
  title: string | null;
  metaDescription: string | null;
  hasWhatsApp: boolean;
  hasPhone: boolean;
  hasEmail: boolean;
  hasContactForm: boolean;
  hasClearCta: boolean;
  hasSocialLinks: boolean;
  socialPlatforms: string[];
  issues: string[];
  strengths: string[];
}

export interface OpportunityReport {
  mainProblem: string;
  whyItMatters: string;
  whatToImprove: string;
  recommendedService: string;
  suggestedOffer: string;
  suggestedPriceRange: string;
  bestOutreachAngle: string;
}

export interface OutreachMessages {
  whatsapp: string;
  email: {
    subject: string;
    body: string;
  };
  dm: string;
}

export interface SalesGuidance {
  pitchPackage: string;
  pricingStrategy: string;
  closingStrategy: string;
  objections: {
    tooExpensive: string;
    alreadyHaveClients: string;
    sendProposal: string;
    notInterested: string;
  };
}

export interface LeadAnalysis {
  businessId: string;
  score: number; // 0 - 100
  opportunityScore?: number;
  tier: 'HOT' | 'WARM' | 'LOW';
  reasons: string[];
  audit: WebsiteAudit;
  report: OpportunityReport;
  outreach: OutreachMessages;
  salesGuidance: SalesGuidance;
  analyzedAt: string;
}

export interface BestOpportunitiesSummary {
  hotCount: number;
  warmCount: number;
  lowCount: number;
  bestNiche: string;
  bestCity: string;
  topOpportunities: {
    business: Business;
    analysis: LeadAnalysis;
  }[];
  keyInsights: string[];
}

// ====================================================================
// PART 3: OUTREACH, FOLLOW-UP, MINI PROPOSAL & CRM PIPELINE TYPES
// ====================================================================

export type PipelineStage =
  | 'NEW'
  | 'QUALIFIED'
  | 'CONTACTED'
  | 'REPLIED'
  | 'INTERESTED'
  | 'NOT_INTERESTED'
  | 'CALL'
  | 'PROPOSAL'
  | 'WON'
  | 'LOST';

export interface OutreachLogItem {
  id: string;
  channel: 'whatsapp' | 'email' | 'dm' | 'phone';
  stage: 'initial' | 'followup_1' | 'followup_2' | 'final';
  sentAt?: string;
  content: string;
  status: 'draft' | 'ready' | 'sent';
}

export type ReplyClassification =
  | 'Interested'
  | 'Curious'
  | 'Price objection'
  | 'Not interested'
  | 'Wants more information'
  | 'Wants call'
  | 'Already has developer'
  | 'Later/follow-up'
  | 'Unknown';

export interface ProspectReplyItem {
  id: string;
  receivedAt: string;
  text: string;
  aiAnalysis?: {
    intent: string;
    classification: ReplyClassification;
    interestLevel: 'High' | 'Medium' | 'Low' | 'Skeptical';
    meaning: string;
    recommendedResponse: string;
    objection: string | null;
    nextAction: string;
    suggestedOffer: string;
    suggestedPricing: string;
    closingStrategy: string;
  };
}

export interface MiniProposal {
  clientName: string;
  businessNiche: string;
  city: string;
  problem: string;
  solution: string;
  deliverables: string[];
  timeline: string;
  price: string;
  nextStep: string;
  updatedAt: string;
}

export interface FollowUpItem {
  stage: 'followup_1' | 'followup_2' | 'final';
  dayOffset: number; // e.g. 2, 5, 9
  label: string;
  subject: string;
  content: string;
  status: 'pending' | 'sent' | 'cancelled';
}

export interface LeadCrmRecord {
  businessId: string;
  stage: PipelineStage;
  contactPerson: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  notes: string;
  outreachHistory: OutreachLogItem[];
  prospectReplies: ProspectReplyItem[];
  followUpSequence: FollowUpItem[];
  proposal: MiniProposal | null;
  demoShared?: boolean;
  demoGenerated?: boolean;
  demoSharedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CrmDashboardMetrics {
  totalLeads: number;
  qualified: number;
  contacted: number;
  replies: number;
  interested: number;
  calls: number;
  proposals: number;
  won: number;
  lost: number;
  conversionRate: number; // Won / Total (or Won / Contacted)
}

// Part 4: Client Conversion & Automation
export interface OutreachOptimization {
  personalizationScore: number; // 0 - 100
  spamRisk: 'Low' | 'Medium' | 'High';
  clarityRating: string; // e.g. "9.4/10"
  strongestSellingPoint: string;
  suggestedImprovement: string;
  optimizedVersion: string;
}

export interface DailyActionItem {
  id: string;
  businessId: string;
  businessName: string;
  niche: string;
  city: string;
  score: number;
  tier: 'HOT' | 'WARM' | 'LOW';
  actionType:
    | 'contact_hot_lead'
    | 'followup_due'
    | 'reply_needed'
    | 'send_demo'
    | 'proposal_followup';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'normal';
}

export interface BusinessInsights {
  bestNiche: string;
  bestCity: string;
  bestLeadSource: string;
  bestOutreachChannel: string;
  replyRate: number; // %
  meetingRate: number; // %
  proposalRate: number; // %
  closingRate: number; // %
  averageDealValue: string;
  patterns: string[];
  recommendations: {
    nicheToTarget: string;
    cityToTarget: string;
    offerToSell: string;
    leadsToPrioritize: string[];
    leadsToStopPursuing: string[];
    outreachTips: string;
  };
  sampleSize: number;
  isPreliminary: boolean;
}

