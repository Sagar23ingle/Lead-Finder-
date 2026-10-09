import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '@/lib/config';
import {
  Business,
  SearchRecord,
  LeadAnalysis,
  BestOpportunitiesSummary,
  LeadCrmRecord,
  CrmDashboardMetrics,
} from '@/types';
import fs from 'fs';
import path from 'path';

export interface SaveSearchResult {
  searchId: string;
  savedCount: number;
}

export interface LeadRepository {
  getProviderName(): 'supabase' | 'local_persistent';
  saveBusinesses(businesses: Business[]): Promise<Business[]>;
  saveSearch(search: Omit<SearchRecord, 'id' | 'created_at'>, businesses: Business[]): Promise<SaveSearchResult>;
  getSearches(limit?: number): Promise<SearchRecord[]>;
  getSearchById(id: string): Promise<{ search: SearchRecord; businesses: Business[] } | null>;
  deleteSearch(id: string): Promise<boolean>;
  getBusinessById(id: string): Promise<Business | null>;
  getAllBusinesses(): Promise<Business[]>;
  
  // Part 2: Lead Analysis & Opportunities
  saveLeadAnalysis(analysis: LeadAnalysis): Promise<void>;
  getLeadAnalysis(businessId: string): Promise<LeadAnalysis | null>;
  getAllLeadAnalyses(): Promise<Record<string, LeadAnalysis>>;
  getBestOpportunities(): Promise<BestOpportunitiesSummary>;

  // Part 3: CRM, Pipeline & Outreach
  saveLeadCrm(crm: LeadCrmRecord): Promise<void>;
  getLeadCrm(businessId: string): Promise<LeadCrmRecord | null>;
  getAllLeadCrm(): Promise<Record<string, LeadCrmRecord>>;
  getCrmMetrics(): Promise<CrmDashboardMetrics>;
}

// ====================================================================
// 1. SUPABASE POSTGRESQL IMPLEMENTATION
// ====================================================================
class SupabaseLeadRepository implements LeadRepository {
  private client: SupabaseClient;

  constructor() {
    const key = config.supabaseServiceRoleKey || config.supabaseAnonKey;
    this.client = createClient(config.supabaseUrl, key, {
      auth: { persistSession: false },
    });
  }

  getProviderName(): 'supabase' {
    return 'supabase';
  }

  async saveBusinesses(businesses: Business[]): Promise<Business[]> {
    if (businesses.length === 0) return [];

    const rowsToUpsert = businesses.map((b) => ({
      external_id: b.external_id,
      name: b.name,
      category: b.category,
      address: b.address,
      city: b.city,
      country: b.country,
      phone: b.phone,
      website: b.website,
      google_maps_url: b.google_maps_url,
      rating: b.rating,
      review_count: b.review_count,
      latitude: b.latitude,
      longitude: b.longitude,
      opening_status: b.opening_status,
      source: b.source,
      raw_data: b.raw_data,
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await this.client
      .from('businesses')
      .upsert(rowsToUpsert, { onConflict: 'external_id' })
      .select();

    if (error) {
      console.error('Supabase upsert businesses error:', error);
      throw new Error(`Database error saving businesses: ${error.message}`);
    }

    return (data as Business[]) || [];
  }

  async saveSearch(
    search: Omit<SearchRecord, 'id' | 'created_at'>,
    businesses: Business[]
  ): Promise<SaveSearchResult> {
    const savedBusinesses = await this.saveBusinesses(businesses);

    const { data: searchData, error: searchError } = await this.client
      .from('searches')
      .insert({
        query: search.query,
        niche: search.niche,
        city: search.city,
        country: search.country,
        leads_requested: search.leads_requested,
        leads_found: businesses.length,
      })
      .select('id')
      .single();

    if (searchError) {
      console.error('Supabase insert search error:', searchError);
      throw new Error(`Database error saving search: ${searchError.message}`);
    }

    const searchId = searchData.id;

    if (savedBusinesses.length > 0) {
      const links = savedBusinesses.map((b) => ({
        search_id: searchId,
        business_id: b.id,
      }));

      const { error: linkError } = await this.client
        .from('search_businesses')
        .upsert(links, { onConflict: 'search_id,business_id' });

      if (linkError) {
        console.warn('Supabase link search_businesses warning:', linkError);
      }
    }

    return {
      searchId,
      savedCount: savedBusinesses.length,
    };
  }

  async getSearches(limit: number = 20): Promise<SearchRecord[]> {
    const { data, error } = await this.client
      .from('searches')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Supabase get searches error:', error);
      return [];
    }

    return (data as SearchRecord[]) || [];
  }

  async getSearchById(id: string): Promise<{ search: SearchRecord; businesses: Business[] } | null> {
    const { data: searchData, error: searchError } = await this.client
      .from('searches')
      .select('*')
      .eq('id', id)
      .single();

    if (searchError || !searchData) {
      return null;
    }

    const { data: links, error: linksError } = await this.client
      .from('search_businesses')
      .select('business_id, businesses(*)')
      .eq('search_id', id);

    let businesses: Business[] = [];
    if (!linksError && links && links.length > 0) {
      businesses = links
        .map((item: any) => item.businesses)
        .filter(Boolean) as Business[];
    } else {
      const { data: bData } = await this.client
        .from('businesses')
        .select('*')
        .ilike('city', `%${searchData.city}%`)
        .order('created_at', { ascending: false })
        .limit(searchData.leads_requested);
      businesses = (bData as Business[]) || [];
    }

    return {
      search: searchData as SearchRecord,
      businesses,
    };
  }

  async deleteSearch(id: string): Promise<boolean> {
    try {
      await this.client.from('search_businesses').delete().eq('search_id', id);
      const { error } = await this.client.from('searches').delete().eq('id', id);
      if (error) {
        console.error('Supabase delete search error:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Supabase delete search exception:', err);
      return false;
    }
  }

  async getBusinessById(id: string): Promise<Business | null> {
    if (!id) return null;
    const cleanId = id.trim();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cleanId);

    let query = this.client.from('businesses').select('*');
    if (isUuid) {
      query = query.or(`id.eq.${cleanId},external_id.eq.${cleanId}`);
    } else {
      query = query.eq('external_id', cleanId);
    }

    const { data, error } = await query.limit(1).maybeSingle();

    if (error || !data) return null;
    return data as Business;
  }

  async getAllBusinesses(): Promise<Business[]> {
    const { data, error } = await this.client
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase getAllBusinesses error:', error);
      return [];
    }

    return (data as Business[]) || [];
  }

  // Part 2: Lead Scores & Analyses in Supabase
  async saveLeadAnalysis(analysis: LeadAnalysis): Promise<void> {
    // Check if business exists by id or external_id
    const b = await this.getBusinessById(analysis.businessId);
    const dbBusinessId = b ? b.id : analysis.businessId;

    const { error } = await this.client.from('lead_scores').upsert(
      {
        business_id: dbBusinessId,
        score: analysis.score,
        status: analysis.tier,
        notes: JSON.stringify(analysis),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'business_id' }
    );

    if (error) {
      console.warn('Supabase saveLeadAnalysis notice:', error.message);
    }
  }

  async getLeadAnalysis(businessId: string): Promise<LeadAnalysis | null> {
    const b = await this.getBusinessById(businessId);
    const targetId = b ? b.id : businessId;
    const isUuid = targetId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(targetId);

    if (!isUuid) {
      const local = new LocalPersistentLeadRepository();
      return local.getLeadAnalysis(businessId);
    }

    const { data, error } = await this.client
      .from('lead_scores')
      .select('*')
      .eq('business_id', targetId)
      .limit(1)
      .maybeSingle();

    if (error || !data || !data.notes) return null;
    try {
      return JSON.parse(data.notes) as LeadAnalysis;
    } catch {
      return null;
    }
  }

  async getAllLeadAnalyses(): Promise<Record<string, LeadAnalysis>> {
    const { data, error } = await this.client.from('lead_scores').select('*');
    if (error || !data) return {};

    const result: Record<string, LeadAnalysis> = {};
    for (const row of data) {
      if (row.notes) {
        try {
          const parsed = JSON.parse(row.notes) as LeadAnalysis;
          result[parsed.businessId] = parsed;
          result[row.business_id] = parsed;
        } catch {
          // ignore invalid parse
        }
      }
    }
    return result;
  }

  async getBestOpportunities(): Promise<BestOpportunitiesSummary> {
    const businesses = await this.getAllBusinesses();
    const analyses = await this.getAllLeadAnalyses();
    return calculateBestOpportunitiesSummary(businesses, analyses);
  }

  // Part 3: CRM & Outreach
  async saveLeadCrm(crm: LeadCrmRecord): Promise<void> {
    try {
      const b = await this.getBusinessById(crm.businessId);
      const targetId = b ? b.id : crm.businessId;
      const existingAnalysis = await this.getLeadAnalysis(crm.businessId);

      const payload = {
        analysis: existingAnalysis,
        crm,
      };

      await this.client.from('lead_scores').upsert(
        {
          business_id: targetId,
          score: existingAnalysis ? existingAnalysis.score : 0,
          status: crm.stage.toLowerCase(),
          notes: JSON.stringify(payload),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'business_id' }
      );
    } catch (e) {
      console.warn('Supabase saveLeadCrm fallback:', e);
    }
    // Always mirror in local persistent repository for zero-data-loss guarantee
    const local = new LocalPersistentLeadRepository();
    await local.saveLeadCrm(crm);
  }

  async getLeadCrm(businessId: string): Promise<LeadCrmRecord | null> {
    try {
      const b = await this.getBusinessById(businessId);
      const targetId = b ? b.id : businessId;
      const isUuid = targetId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(targetId);

      if (isUuid) {
        const { data, error } = await this.client
          .from('lead_scores')
          .select('*')
          .eq('business_id', targetId)
          .limit(1)
          .maybeSingle();

        if (!error && data && data.notes) {
          try {
            const parsed = JSON.parse(data.notes);
            if (parsed.crm) return parsed.crm;
          } catch {}
        }
      }
    } catch {}

    const local = new LocalPersistentLeadRepository();
    return local.getLeadCrm(businessId);
  }

  async getAllLeadCrm(): Promise<Record<string, LeadCrmRecord>> {
    const local = new LocalPersistentLeadRepository();
    return local.getAllLeadCrm();
  }

  async getCrmMetrics(): Promise<CrmDashboardMetrics> {
    const businesses = await this.getAllBusinesses();
    const crms = await this.getAllLeadCrm();
    const analyses = await this.getAllLeadAnalyses();
    return calculateCrmMetrics(businesses, crms, analyses);
  }
}

// ====================================================================
// 2. LOCAL PERSISTENT REPOSITORY IMPLEMENTATION
// ====================================================================
interface LocalStoreSchema {
  businesses: Record<string, Business>; // keyed by external_id
  searches: Record<string, SearchRecord & { business_ids: string[] }>;
  analyses: Record<string, LeadAnalysis>; // keyed by businessId/external_id
  crm: Record<string, LeadCrmRecord>; // keyed by businessId/external_id
}

class LocalPersistentLeadRepository implements LeadRepository {
  private filePath: string;
  private memoryStore: LocalStoreSchema = { businesses: {}, searches: {}, analyses: {}, crm: {} };

  constructor() {
    // Prefer project data directory, fallback to /tmp if read-only (e.g. Vercel serverless)
    let dataDir = path.join(process.cwd(), 'data');
    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      this.filePath = path.join(dataDir, 'leads_storage.json');
    } catch {
      // In read-only serverless environment like Vercel, use /tmp
      dataDir = path.join('/tmp', 'data');
      try {
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
      } catch {
        // ignore
      }
      this.filePath = path.join(dataDir, 'leads_storage.json');
    }

    if (!fs.existsSync(this.filePath)) {
      this.writeStore({ businesses: {}, searches: {}, analyses: {}, crm: {} });
    }
  }

  getProviderName(): 'local_persistent' {
    return 'local_persistent';
  }

  private readStore(): LocalStoreSchema {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        this.memoryStore = {
          businesses: parsed.businesses || {},
          searches: parsed.searches || {},
          analyses: parsed.analyses || {},
          crm: parsed.crm || {},
        };
        return this.memoryStore;
      }
    } catch {
      // fallback to memory
    }
    return this.memoryStore;
  }

  private writeStore(data: LocalStoreSchema): void {
    this.memoryStore = data;
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      // Attempt write to /tmp if primary path failed
      try {
        const tmpPath = path.join('/tmp', 'leads_storage.json');
        fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
        this.filePath = tmpPath;
      } catch {
        // Retained safely in memoryStore
      }
    }
  }

  async saveBusinesses(businesses: Business[]): Promise<Business[]> {
    const store = this.readStore();
    const saved: Business[] = [];

    for (const b of businesses) {
      const existing = store.businesses[b.external_id];
      const now = new Date().toISOString();
      const updatedBusiness: Business = {
        ...b,
        id: existing ? existing.id : b.external_id,
        created_at: existing ? existing.created_at : now,
        updated_at: now,
      };
      store.businesses[b.external_id] = updatedBusiness;
      saved.push(updatedBusiness);
    }

    this.writeStore(store);
    return saved;
  }

  async saveSearch(
    search: Omit<SearchRecord, 'id' | 'created_at'>,
    businesses: Business[]
  ): Promise<SaveSearchResult> {
    const savedBusinesses = await this.saveBusinesses(businesses);
    const store = this.readStore();

    const searchId = 'search_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const now = new Date().toISOString();

    const searchRecord: SearchRecord & { business_ids: string[] } = {
      id: searchId,
      query: search.query,
      niche: search.niche,
      city: search.city,
      country: search.country,
      leads_requested: search.leads_requested,
      leads_found: businesses.length,
      created_at: now,
      business_ids: savedBusinesses.map((b) => b.external_id),
    };

    store.searches[searchId] = searchRecord;
    this.writeStore(store);

    return {
      searchId,
      savedCount: savedBusinesses.length,
    };
  }

  async getSearches(limit: number = 20): Promise<SearchRecord[]> {
    const store = this.readStore();
    const list = Object.values(store.searches).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return list.slice(0, limit);
  }

  async getSearchById(id: string): Promise<{ search: SearchRecord; businesses: Business[] } | null> {
    const store = this.readStore();
    const searchRecord = store.searches[id];
    if (!searchRecord) return null;

    const businesses = (searchRecord.business_ids || [])
      .map((extId) => store.businesses[extId])
      .filter(Boolean);

    return {
      search: searchRecord,
      businesses,
    };
  }

  async deleteSearch(id: string): Promise<boolean> {
    const store = this.readStore();
    if (store.searches && store.searches[id]) {
      delete store.searches[id];
      this.writeStore(store);
      return true;
    }
    return false;
  }

  async getBusinessById(id: string): Promise<Business | null> {
    const store = this.readStore();
    if (store.businesses[id]) return store.businesses[id];
    // check by internal id
    for (const b of Object.values(store.businesses)) {
      if (b.id === id || b.external_id === id) return b;
    }
    return null;
  }

  async getAllBusinesses(): Promise<Business[]> {
    const store = this.readStore();
    return Object.values(store.businesses).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  // Part 2: Lead Analyses
  async saveLeadAnalysis(analysis: LeadAnalysis): Promise<void> {
    const store = this.readStore();
    store.analyses[analysis.businessId] = analysis;
    this.writeStore(store);
  }

  async getLeadAnalysis(businessId: string): Promise<LeadAnalysis | null> {
    const store = this.readStore();
    return store.analyses[businessId] || null;
  }

  async getAllLeadAnalyses(): Promise<Record<string, LeadAnalysis>> {
    const store = this.readStore();
    return store.analyses || {};
  }

  async getBestOpportunities(): Promise<BestOpportunitiesSummary> {
    const businesses = await this.getAllBusinesses();
    const analyses = await this.getAllLeadAnalyses();
    return calculateBestOpportunitiesSummary(businesses, analyses);
  }

  // Part 3: CRM, Pipeline & Outreach
  async saveLeadCrm(crm: LeadCrmRecord): Promise<void> {
    const store = this.readStore();
    if (!store.crm) store.crm = {};

    // Auto-stop follow-up sequence if prospect replied or stage indicates reply
    const hasReplied =
      (crm.prospectReplies && crm.prospectReplies.length > 0) ||
      crm.stage === 'REPLIED' ||
      crm.stage === 'INTERESTED' ||
      crm.stage === 'CALL' ||
      crm.stage === 'PROPOSAL' ||
      crm.stage === 'WON';

    let followUpSequence = [...(crm.followUpSequence || [])];
    if (hasReplied) {
      followUpSequence = followUpSequence.map((item) => {
        if (item.status === 'pending') {
          return { ...item, status: 'cancelled' as const };
        }
        return item;
      });
    }

    const updatedRecord: LeadCrmRecord = {
      ...crm,
      followUpSequence,
      updatedAt: new Date().toISOString(),
    };

    store.crm[crm.businessId] = updatedRecord;

    // Link by internal business id if different
    const b =
      store.businesses[crm.businessId] ||
      Object.values(store.businesses).find(
        (x) => x.id === crm.businessId || x.external_id === crm.businessId
      );
    if (b) {
      if (b.id) store.crm[b.id] = updatedRecord;
      if (b.external_id) store.crm[b.external_id] = updatedRecord;
    }

    this.writeStore(store);
  }

  async getLeadCrm(businessId: string): Promise<LeadCrmRecord | null> {
    const store = this.readStore();
    if (!store.crm) store.crm = {};
    if (store.crm[businessId]) return store.crm[businessId];

    // Check alternate id (external_id vs id)
    const b = await this.getBusinessById(businessId);
    if (b) {
      if (store.crm[b.id]) return store.crm[b.id];
      if (store.crm[b.external_id]) return store.crm[b.external_id];

      // Auto-initialize default CRM record for this business
      const analysis = store.analyses[b.id] || store.analyses[b.external_id] || null;
      const defaultRecord = createDefaultCrmRecord(b, analysis);
      store.crm[b.id] = defaultRecord;
      store.crm[b.external_id] = defaultRecord;
      this.writeStore(store);
      return defaultRecord;
    }

    return null;
  }

  async getAllLeadCrm(): Promise<Record<string, LeadCrmRecord>> {
    const store = this.readStore();
    return store.crm || {};
  }

  async getCrmMetrics(): Promise<CrmDashboardMetrics> {
    const businesses = await this.getAllBusinesses();
    const crms = await this.getAllLeadCrm();
    const analyses = await this.getAllLeadAnalyses();
    return calculateCrmMetrics(businesses, crms, analyses);
  }
}

function calculateBestOpportunitiesSummary(
  businesses: Business[],
  analyses: Record<string, LeadAnalysis>
): BestOpportunitiesSummary {
  let hotCount = 0;
  let warmCount = 0;
  let lowCount = 0;

  const paired: { business: Business; analysis: LeadAnalysis }[] = [];
  const nicheMap: Record<string, number> = {};
  const cityMap: Record<string, number> = {};

  for (const b of businesses) {
    const a = analyses[b.id] || analyses[b.external_id];
    if (a) {
      paired.push({ business: b, analysis: a });
      if (a.tier === 'HOT') hotCount++;
      else if (a.tier === 'WARM') warmCount++;
      else lowCount++;

      const n = b.category || 'General';
      nicheMap[n] = (nicheMap[n] || 0) + a.score;

      const c = b.city || 'Unknown';
      cityMap[c] = (cityMap[c] || 0) + a.score;
    }
  }

  // Sort pairs by highest opportunity score
  paired.sort((x, y) => y.analysis.score - x.analysis.score);

  // Determine highest-scoring niche & city
  let bestNiche = 'Interior Designers';
  let maxNicheScore = -1;
  for (const [k, v] of Object.entries(nicheMap)) {
    if (v > maxNicheScore) {
      maxNicheScore = v;
      bestNiche = k;
    }
  }

  let bestCity = 'Nagpur';
  let maxCityScore = -1;
  for (const [k, v] of Object.entries(cityMap)) {
    if (v > maxCityScore) {
      maxCityScore = v;
      bestCity = k;
    }
  }

  const keyInsights: string[] = [];
  if (hotCount > 0) {
    keyInsights.push(
      `${hotCount} HOT leads detected with verified review volume but NO website or a broken web funnel.`
    );
  }
  if (paired.length > 0) {
    const noWebCount = paired.filter((p) => !p.business.website).length;
    keyInsights.push(
      `${noWebCount} of ${paired.length} audited leads have zero website — representing your highest closing probability.`
    );
    keyInsights.push(
      `Strongest outreach pitch: Turnkey 5-Page Portfolio + 1-Click WhatsApp Booking Funnel.`
    );
  }

  return {
    hotCount,
    warmCount,
    lowCount,
    bestNiche,
    bestCity,
    topOpportunities: paired.slice(0, 10),
    keyInsights,
  };
}

export function createDefaultCrmRecord(
  business: Business,
  analysis?: LeadAnalysis | null
): LeadCrmRecord {
  const isQualified =
    (analysis?.score ?? 0) >= 50 ||
    analysis?.tier === 'HOT' ||
    analysis?.tier === 'WARM';
  const now = new Date().toISOString();
  const name = business.name;
  const city = business.city || 'your area';
  const niche = business.category || 'business';

  return {
    businessId: business.id || business.external_id,
    stage: isQualified ? 'QUALIFIED' : 'NEW',
    contactPerson: null,
    contactEmail: null,
    contactPhone: business.phone || null,
    notes: '',
    outreachHistory: [],
    prospectReplies: [],
    followUpSequence: [
      {
        stage: 'followup_1',
        dayOffset: 2,
        label: 'Follow-up 1 (Day 2)',
        subject: `Quick bump: Website inquiry for ${name}`,
        content: `Hi ${name} team, following up on my note earlier this week. Wanted to share a quick suggestion on how other ${niche} providers in ${city} are capturing 3x more phone/WhatsApp inquiries directly from Google. Happy to share a quick 2-minute overview!`,
        status: 'pending',
      },
      {
        stage: 'followup_2',
        dayOffset: 5,
        label: 'Follow-up 2 (Day 5)',
        subject: `Idea for ${name}'s customer inquiries`,
        content: `Hi again! I put together a quick concept layout showcasing how ${name} could showcase recent project photos and testimonials with 1-click WhatsApp booking. Would you like me to send the preview link over?`,
        status: 'pending',
      },
      {
        stage: 'final',
        dayOffset: 9,
        label: 'Final Follow-up (Day 9)',
        subject: `Closing the loop - ${name}`,
        content: `Hi team, I know you are busy managing operations at ${name}. I will assume modernizing the website isn't a current focus, so I won't follow up again. If you ever want to revisit this down the line, feel free to reach out anytime!`,
        status: 'pending',
      },
    ],
    proposal: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function calculateCrmMetrics(
  businesses: Business[],
  crmRecords: Record<string, LeadCrmRecord>,
  analyses: Record<string, LeadAnalysis> = {}
): CrmDashboardMetrics {
  const totalLeads = businesses.length;
  let qualified = 0;
  let contacted = 0;
  let replies = 0;
  let interested = 0;
  let calls = 0;
  let proposals = 0;
  let won = 0;
  let lost = 0;

  for (const b of businesses) {
    const id = b.id || b.external_id;
    const crm = crmRecords[id] || crmRecords[b.external_id];
    const analysis = analyses[id] || analyses[b.external_id];

    const stage = crm?.stage;

    // Check if qualified
    const isQual =
      stage === 'QUALIFIED' ||
      stage === 'CONTACTED' ||
      stage === 'REPLIED' ||
      stage === 'INTERESTED' ||
      stage === 'CALL' ||
      stage === 'PROPOSAL' ||
      stage === 'WON' ||
      (analysis && (analysis.score >= 50 || analysis.tier === 'HOT' || analysis.tier === 'WARM'));

    if (isQual) qualified++;

    if (stage === 'CONTACTED') contacted++;
    else if (stage === 'REPLIED') {
      contacted++;
      replies++;
    } else if (stage === 'INTERESTED') {
      contacted++;
      replies++;
      interested++;
    } else if (stage === 'CALL') {
      contacted++;
      replies++;
      interested++;
      calls++;
    } else if (stage === 'PROPOSAL') {
      contacted++;
      replies++;
      interested++;
      calls++;
      proposals++;
    } else if (stage === 'WON') {
      contacted++;
      replies++;
      interested++;
      calls++;
      proposals++;
      won++;
    } else if (stage === 'LOST') {
      contacted++;
      lost++;
    } else {
      // Check if outreach was sent even if stage wasn't manually advanced
      if (crm?.outreachHistory?.some((o) => o.status === 'sent')) {
        contacted++;
      }
      if (crm?.prospectReplies && crm.prospectReplies.length > 0) {
        replies++;
      }
      if (crm?.proposal) {
        proposals++;
      }
    }
  }

  // Conversion rate: Won / Contacted (or Won / totalLeads)
  const baseForConversion = contacted > 0 ? contacted : totalLeads;
  const conversionRate =
    baseForConversion > 0 ? Math.round((won / baseForConversion) * 100 * 10) / 10 : 0;

  return {
    totalLeads,
    qualified,
    contacted,
    replies,
    interested,
    calls,
    proposals,
    won,
    lost,
    conversionRate,
  };
}

let repositoryInstance: LeadRepository | null = null;

export function getLeadRepository(): LeadRepository {
  if (config.isSupabaseConfigured()) {
    if (!repositoryInstance || repositoryInstance.getProviderName() !== 'supabase') {
      try {
        repositoryInstance = new SupabaseLeadRepository();
      } catch (err) {
        console.warn('Failed to init Supabase repository, using local persistent fallback:', err);
        repositoryInstance = new LocalPersistentLeadRepository();
      }
    }
  } else {
    if (!repositoryInstance || repositoryInstance.getProviderName() !== 'local_persistent') {
      repositoryInstance = new LocalPersistentLeadRepository();
    }
  }

  return repositoryInstance;
}
