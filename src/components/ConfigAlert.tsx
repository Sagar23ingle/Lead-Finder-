'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface ConfigAlertProps {
  isPlacesConfigured: boolean;
  isSupabaseConfigured: boolean;
  isVercel?: boolean;
  errorMessage?: string | null;
  onOpenApiKeyModal?: () => void;
}

export const ConfigAlert: React.FC<ConfigAlertProps> = ({
  isPlacesConfigured,
  isSupabaseConfigured,
  isVercel = false,
  errorMessage,
  onOpenApiKeyModal,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Explicit API error message banner */}
      {errorMessage && (
        <div className="banner danger" role="alert">
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div className="banner-title">Error Encountered</div>
            <div>{errorMessage}</div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.9 }}>
              Strict Zero-Fake-Data Policy: We never generate mock, synthetic, or hardcoded leads.
            </div>
          </div>
        </div>
      )}

      {/* Missing Google Places API Key */}
      {!isPlacesConfigured && (
        <div className="banner danger" role="alert">
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <div className="banner-title">Places API is not configured on the server</div>
            <p>
              The environment variable <code className="banner-code">GOOGLE_MAPS_API_KEY</code> or <code className="banner-code">GOOGLE_PLACES_API_KEY</code> is required in server environment or Vercel project settings.
            </p>
            <p style={{ marginTop: '0.35rem', fontSize: '0.825rem' }}>
              Enable <strong>Places API (New)</strong> or <strong>Places API</strong> on Google Cloud Console,
              generate an API key, and configure it in your Vercel Project Settings or enter a session key.
            </p>
            {onOpenApiKeyModal && (
              <div style={{ marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={onOpenApiKeyModal}
                  className="btn-primary"
                  style={{ padding: '6px 12px', fontSize: '0.8rem', backgroundColor: '#dc2626' }}
                >
                  Configure API Key for Session
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Supabase / Persistence Notice */}
      {!isSupabaseConfigured && isPlacesConfigured && (
        <div className="banner warning" role="status">
          <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div className="banner-title">
              {isVercel ? 'Database Notice: Ephemeral Vercel Serverless Storage' : 'Active Database: Local Disk Storage'}
            </div>
            <p style={{ fontSize: '0.825rem' }}>
              {isVercel ? (
                <>
                  Database is currently unconfigured in production. Operating in ephemeral serverless storage (changes are not permanent across Vercel container restarts). To enable permanent production storage, configure <code className="banner-code">SUPABASE_URL</code> and <code className="banner-code">SUPABASE_ANON_KEY</code> in Vercel.
                </>
              ) : (
                <>
                  Leads and search history are being saved to local disk at <code className="banner-code">data/leads_storage.json</code>. To use Supabase PostgreSQL, add <code className="banner-code">SUPABASE_URL</code> and <code className="banner-code">SUPABASE_SERVICE_ROLE_KEY</code> in <code className="banner-code">.env.local</code>.
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
