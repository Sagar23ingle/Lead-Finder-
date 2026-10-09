import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '@/lib/config';
import { Business, LeadAnalysis } from '@/types';
import {
  SmartDemoWebsite,
  generateSmartDemo,
  validateSmartDemo,
} from '@/lib/services/smartDemoEngine';
import { GooglePlacesService } from '@/lib/services/googlePlaces';
import { getLeadRepository } from '@/lib/db';

export interface DemoRecord {
  id: string; // e.g. "ChIJ..." or "demo_8f32"
  slug: string; // e.g. "jay-real-estate-ChIJAQAAwPPA1DsR"
  leadId: string;
  businessName: string;
  businessType: string;
  business: Business;
  demo: SmartDemoWebsite;
  createdAt: string;
  updatedAt: string;
}

import {
  generateDemoSlug,
  encodeCompactBusiness,
  decodeCompactBusiness,
  buildDemoPath,
  buildDemoUrl,
  extractPlaceIdFromSlugOrId,
} from '@/lib/utils/demoUrl';

export {
  generateDemoSlug,
  encodeCompactBusiness,
  decodeCompactBusiness,
  buildDemoPath,
  buildDemoUrl,
  extractPlaceIdFromSlugOrId,
};

/**
 * Persistent Demo Repository that survives Vercel serverless container recycling
 */
class PersistentDemoRepository {
  private filePath: string;
  private memoryStore: Record<string, DemoRecord> = {};
  private supabase: SupabaseClient | null = null;

  constructor() {
    let dataDir = path.join(process.cwd(), 'data');
    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      this.filePath = path.join(dataDir, 'demos_storage.json');
    } catch {
      dataDir = path.join('/tmp', 'data');
      try {
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
      } catch {
        // ignore
      }
      this.filePath = path.join(dataDir, 'demos_storage.json');
    }

    if (config.isSupabaseConfigured()) {
      try {
        const key = config.supabaseServiceRoleKey || config.supabaseAnonKey;
        this.supabase = createClient(config.supabaseUrl, key, {
          auth: { persistSession: false },
        });
      } catch (err) {
        console.warn('Supabase initialization for demo repo failed:', err);
      }
    }

    this.readStore();
  }

  private readStore(): Record<string, DemoRecord> {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          this.memoryStore = parsed;
          return this.memoryStore;
        }
      }
    } catch {
      // ignore
    }
    return this.memoryStore;
  }

  private writeStore(): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.memoryStore, null, 2), 'utf-8');
    } catch {
      try {
        const tmp = path.join('/tmp', 'demos_storage.json');
        fs.writeFileSync(tmp, JSON.stringify(this.memoryStore, null, 2), 'utf-8');
        this.filePath = tmp;
      } catch {
        // retained in memory
      }
    }
  }

  /**
   * Saves a generated demo record to all available persistent stores
   */
  public async saveDemo(record: DemoRecord): Promise<DemoRecord> {
    this.memoryStore[record.id] = record;
    this.memoryStore[record.slug] = record;
    if (record.leadId) {
      this.memoryStore[record.leadId] = record;
    }
    this.writeStore();

    // If Supabase is available, upsert to `demos` table
    if (this.supabase) {
      try {
        await this.supabase.from('demos').upsert(
          {
            id: record.id,
            slug: record.slug,
            lead_id: record.leadId,
            business_name: record.businessName,
            business_type: record.businessType,
            data: record,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );
      } catch (err) {
        console.warn('Supabase save demo warning (ignoring table absence):', err);
      }
    }

    return record;
  }

  /**
   * Retrieves a demo record by ID, slug, or Place ID.
   * On Vercel serverless, if the record is not in local memory, it checks:
   * 1. In-memory store (by full key or extracted ID)
   * 2. Local disk store
   * 3. Direct compact business payload decoding
   * 4. Supabase demos table (if configured)
   * 5. Lead Repository (stored businesses by ID or extracted ID)
   * 6. Google Places API (if the ID contains or is a Google Place ID)
   */
  public async getDemo(idOrSlug: string): Promise<DemoRecord | null> {
    if (!idOrSlug) return null;
    const key = idOrSlug.trim();
    const extractedId = key.includes('--') ? key.split('--').slice(1).join('--') : null;

    // 1. Check in-memory store
    if (this.memoryStore[key]) {
      return this.memoryStore[key];
    }
    if (extractedId && this.memoryStore[extractedId]) {
      return this.memoryStore[extractedId];
    }

    // 2. Refresh local file store
    this.readStore();
    if (this.memoryStore[key]) {
      return this.memoryStore[key];
    }
    if (extractedId && this.memoryStore[extractedId]) {
      return this.memoryStore[extractedId];
    }

    // 3. Check by partial match in memory
    for (const d of Object.values(this.memoryStore)) {
      if (
        d.id === key ||
        d.slug === key ||
        d.leadId === key ||
        (extractedId && (d.id === extractedId || d.leadId === extractedId))
      ) {
        return d;
      }
    }

    // 4. Check if the key itself is an encoded compact business payload
    if (key.startsWith('ey') || key.length > 50) {
      const decodedBiz = decodeCompactBusiness(key);
      if (decodedBiz) {
        const demo = generateSmartDemo(decodedBiz);
        const id = decodedBiz.id || 'demo';
        const slug = generateDemoSlug(decodedBiz.name, id);
        const record: DemoRecord = {
          id,
          slug,
          leadId: id,
          businessName: decodedBiz.name,
          businessType: demo.businessType,
          business: decodedBiz,
          demo,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await this.saveDemo(record);
        return record;
      }
    }

    // 5. Check Supabase if configured
    if (this.supabase) {
      try {
        const safeKey = key.replace(/[^a-zA-Z0-9_.-]/g, '');
        if (safeKey) {
          const { data } = await this.supabase
            .from('demos')
            .select('data')
            .or(`id.eq.${safeKey},slug.eq.${safeKey},lead_id.eq.${safeKey}`)
            .maybeSingle();

          if (data?.data) {
            const rec = data.data as DemoRecord;
            this.memoryStore[key] = rec;
            return rec;
          }
        }
      } catch {
        // ignore table absence or query error
      }
    }

    // 6. Check Lead Repository for existing business (by key or extracted ID)
    const leadRepo = getLeadRepository();
    let existingBusiness = await leadRepo.getBusinessById(key);
    if (!existingBusiness && extractedId) {
      existingBusiness = await leadRepo.getBusinessById(extractedId);
    }

    if (existingBusiness) {
      const demo = generateSmartDemo(existingBusiness);
      const slug = generateDemoSlug(existingBusiness.name, existingBusiness.id);
      const record: DemoRecord = {
        id: existingBusiness.id,
        slug,
        leadId: existingBusiness.id,
        businessName: existingBusiness.name,
        businessType: demo.businessType,
        business: existingBusiness,
        demo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await this.saveDemo(record);
      return record;
    }

    // 7. Check if ID contains or is a Google Place ID (ChIJ...)
    const placeId = extractPlaceIdFromSlugOrId(key) || (extractedId ? extractPlaceIdFromSlugOrId(extractedId) : null);
    if (placeId) {
      const verifiedBusiness = await GooglePlacesService.getPlaceById(placeId);
      if (verifiedBusiness) {
        const demo = generateSmartDemo(verifiedBusiness);
        const slug = generateDemoSlug(verifiedBusiness.name, verifiedBusiness.id);
        const record: DemoRecord = {
          id: verifiedBusiness.id,
          slug,
          leadId: verifiedBusiness.id,
          businessName: verifiedBusiness.name,
          businessType: demo.businessType,
          business: verifiedBusiness,
          demo,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await this.saveDemo(record);
        return record;
      }
    }

    return null;
  }
}

// Global Singleton
let demoRepositoryInstance: PersistentDemoRepository | null = null;

export function getDemoRepository(): PersistentDemoRepository {
  if (!demoRepositoryInstance) {
    demoRepositoryInstance = new PersistentDemoRepository();
  }
  return demoRepositoryInstance;
}
