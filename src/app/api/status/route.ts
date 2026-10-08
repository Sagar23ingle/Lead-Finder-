import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { AppConfigStatus } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sessionKey = req.headers.get('x-google-api-key')?.trim();
  const placesConfigured = !!(config.googleMapsApiKey || sessionKey);
  const placesSource = config.googleMapsApiKey ? 'env' : sessionKey ? 'session' : 'none';
  const isVercel = config.isVercel;
  const isSupabase = config.isSupabaseConfigured();

  let databaseProvider: 'supabase' | 'local_persistent' | 'ephemeral_serverless' = 'local_persistent';
  let databaseStatusMessage = 'Local disk storage (data/leads_storage.json)';

  if (isSupabase) {
    databaseProvider = 'supabase';
    databaseStatusMessage = 'Supabase PostgreSQL connected';
  } else if (isVercel) {
    databaseProvider = 'ephemeral_serverless';
    databaseStatusMessage = 'Database unconfigured on Vercel. Running in ephemeral serverless storage (changes not permanent across serverless restarts). Configure SUPABASE_URL and SUPABASE_ANON_KEY for production persistence.';
  }

  const status: AppConfigStatus = {
    googlePlacesConfigured: placesConfigured,
    placesStatus: placesConfigured ? 'CONFIGURED' : 'NOT_CONFIGURED',
    placesStatusMessage: placesConfigured
      ? (placesSource === 'env' ? 'Places API configured in server environment' : 'Places API configured for this browser session')
      : 'Places API is not configured on the server',
    placesSource,
    supabaseConfigured: isSupabase,
    databaseProvider,
    databaseStatusMessage,
    geminiConfigured: config.isGeminiConfigured(),
    geminiStatusMessage: config.isGeminiConfigured() ? 'Gemini AI model active' : 'Local Rule Engine active (no Gemini API key)',
    isVercel,
  };

  return NextResponse.json(status);
}
