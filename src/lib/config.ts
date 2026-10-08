import fs from 'fs';
import path from 'path';

/**
 * Centralized environment configuration helper.
 * Strictly manages server-side secrets and ensures API keys are NEVER leaked to the client.
 * Includes resilient auto-loader for .env.local, .env, and .env.example.
 */

function ensureEnvLoaded() {
  if (typeof window !== 'undefined') return;

  const candidates = ['.env.local', '.env'];
  for (const filename of candidates) {
    try {
      const fullPath = path.resolve(process.cwd(), filename);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split(/\r?\n/);
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx > 0) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
            if (val && !process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      }
    } catch {
      // ignore
    }
  }
}

export const config = {
  get googleMapsApiKey(): string {
    ensureEnvLoaded();
    const key =
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_PLACES_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_API_KEY ||
      '';
    return key.trim();
  },

  get geminiApiKey(): string {
    ensureEnvLoaded();
    const key =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      '';
    return key.trim();
  },

  get supabaseUrl(): string {
    ensureEnvLoaded();
    const key =
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      '';
    return key.trim();
  },

  get supabaseAnonKey(): string {
    ensureEnvLoaded();
    const key =
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      '';
    return key.trim();
  },

  get supabaseServiceRoleKey(): string {
    ensureEnvLoaded();
    return (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  },

  get isVercel(): boolean {
    return process.env.VERCEL === '1' || !!process.env.VERCEL_ENV;
  },

  get rateLimitSearch(): number {
    ensureEnvLoaded();
    const val = parseInt(process.env.RATE_LIMIT_SEARCH || '30', 10);
    return isNaN(val) ? 30 : Math.max(5, val);
  },

  get rateLimitAnalyze(): number {
    ensureEnvLoaded();
    const val = parseInt(process.env.RATE_LIMIT_ANALYZE || '25', 10);
    return isNaN(val) ? 25 : Math.max(5, val);
  },

  get rateLimitEnrich(): number {
    ensureEnvLoaded();
    const val = parseInt(process.env.RATE_LIMIT_ENRICH || '25', 10);
    return isNaN(val) ? 25 : Math.max(5, val);
  },

  get rateLimitExport(): number {
    ensureEnvLoaded();
    const val = parseInt(process.env.RATE_LIMIT_EXPORT || '20', 10);
    return isNaN(val) ? 20 : Math.max(5, val);
  },

  isGooglePlacesConfigured(): boolean {
    return this.googleMapsApiKey.length > 0;
  },

  isGeminiConfigured(): boolean {
    return this.geminiApiKey.length > 0;
  },

  isSupabaseConfigured(): boolean {
    return (
      this.supabaseUrl.length > 0 &&
      (this.supabaseServiceRoleKey.length > 0 || this.supabaseAnonKey.length > 0)
    );
  },
};
