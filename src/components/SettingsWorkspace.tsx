'use client';

import React, { useState, useEffect } from 'react';
import { AppConfigStatus } from '@/types';
import {
  Key,
  Shield,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Database,
  BrainCircuit,
  Eye,
  EyeOff,
  Trash2,
  Sparkles,
} from 'lucide-react';

interface SettingsWorkspaceProps {
  configStatus: AppConfigStatus | null;
  onRefreshStatus: () => void;
}

export const SettingsWorkspace: React.FC<SettingsWorkspaceProps> = ({
  configStatus,
  onRefreshStatus,
}) => {
  const [googleKeyInput, setGoogleKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [hasSessionKey, setHasSessionKey] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('session_google_api_key');
      if (stored) {
        setHasSessionKey(true);
      }
    }
  }, []);

  const handleSaveSessionKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = googleKeyInput.trim();
    if (!trimmed) return;

    setIsSaving(true);
    setTestResult(null);

    try {
      // Test the key via /api/status endpoint
      const res = await fetch('/api/status', {
        headers: { 'x-google-api-key': trimmed },
      });
      const data: AppConfigStatus = await res.json();

      if (data.googlePlacesConfigured) {
        sessionStorage.setItem('session_google_api_key', trimmed);
        setHasSessionKey(true);
        setGoogleKeyInput('');
        setTestResult({
          success: true,
          message: 'Google Places API key validated and activated for this session.',
        });
        onRefreshStatus();
      } else {
        setTestResult({
          success: false,
          message: 'Key could not be validated. Ensure Places API is enabled in your Google Cloud Console.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Network error communicating with server.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearSessionKey = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('session_google_api_key');
      setHasSessionKey(false);
      setTestResult({
        success: true,
        message: 'Session API key removed.',
      });
      onRefreshStatus();
    }
  };

  const isPlacesReady = configStatus?.googlePlacesConfigured ?? false;
  const isSupabaseReady = configStatus?.supabaseConfigured ?? false;
  const isGeminiReady = configStatus?.geminiConfigured ?? false;

  return (
    <div className="settings-workspace">
      {/* Editorial Header */}
      <div className="workspace-hero">
        <div className="hero-text-block">
          <span className="hero-eyebrow">Platform Integrations & Security</span>
          <h1 className="hero-heading font-bodoni">Settings & Integrations</h1>
          <p className="hero-description">
            Manage your Google Places API credentials, AI intelligence engine, and database persistence securely.
          </p>
        </div>
        <div className="hero-actions">
          <button
            type="button"
            onClick={onRefreshStatus}
            className="btn-ghost-sm"
            title="Refresh system connection status"
          >
            <RefreshCw size={14} />
            <span>Verify Status</span>
          </button>
        </div>
      </div>

      <div className="settings-cards-stack">
        {/* Google Places Integration */}
        <div className="glass-card settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-wrapper">
              <Key size={18} className="text-cyan" />
            </div>
            <div className="settings-header-text">
              <div className="settings-title-row">
                <h2 className="settings-card-title font-bodoni">Google Places API</h2>
                <span
                  className={`status-pill ${
                    isPlacesReady ? 'status-pill-success' : 'status-pill-warning'
                  }`}
                >
                  {isPlacesReady ? 'Active' : 'Not Configured'}
                </span>
              </div>
              <p className="settings-card-description">
                Powers real-time business discovery, phone verification, and verified Google rating data.
              </p>
            </div>
          </div>

          <div className="settings-card-body">
            <div className="config-indicator-box">
              <span className="indicator-label">Active Source:</span>
              <span className="indicator-val font-bodoni">
                {hasSessionKey
                  ? 'Browser Session Key (Temporary)'
                  : configStatus?.placesSource === 'env'
                  ? 'Server Environment Variable (Production)'
                  : 'No active key detected'}
              </span>
            </div>

            {/* Session Key Input */}
            <form onSubmit={handleSaveSessionKey} className="settings-form">
              <label className="settings-input-label">
                Add or Override Google Places API Key
              </label>
              <div className="settings-input-row">
                <div className="settings-input-wrapper">
                  <input
                    type={showKey ? 'text' : 'password'}
                    placeholder="AIzaSy..."
                    value={googleKeyInput}
                    onChange={(e) => setGoogleKeyInput(e.target.value)}
                    className="settings-text-input"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="btn-mask-toggle"
                    aria-label="Toggle password visibility"
                  >
                    {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSaving || !googleKeyInput.trim()}
                  className="btn-premium-primary"
                >
                  {isSaving ? 'Validating...' : 'Save Key'}
                </button>
              </div>

              <div className="settings-help-text">
                Keys entered here remain strictly in your browser session and are never logged or stored permanently on third-party servers.
              </div>
            </form>

            {hasSessionKey && (
              <div className="session-active-strip">
                <span>Active session key in memory</span>
                <button
                  type="button"
                  onClick={handleClearSessionKey}
                  className="btn-ghost-sm danger"
                >
                  <Trash2 size={13} />
                  <span>Remove Session Key</span>
                </button>
              </div>
            )}

            {testResult && (
              <div
                className={`feedback-alert ${
                  testResult.success ? 'feedback-success' : 'feedback-error'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <AlertTriangle size={16} />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* AI Opportunity & Intelligence Engine */}
        <div className="glass-card settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-wrapper">
              <BrainCircuit size={18} className="text-amber" />
            </div>
            <div className="settings-header-text">
              <div className="settings-title-row">
                <h2 className="settings-card-title font-bodoni">AI Audit & Opportunity Engine</h2>
                <span
                  className={`status-pill ${
                    isGeminiReady ? 'status-pill-success' : 'status-pill-info'
                  }`}
                >
                  {isGeminiReady ? 'Gemini AI Active' : 'Deterministic Rule Engine Active'}
                </span>
              </div>
              <p className="settings-card-description">
                Analyzes online presence, calculates 0–100 opportunity scores, and crafts personalized outreach pitches.
              </p>
            </div>
          </div>

          <div className="settings-card-body">
            <p className="settings-body-text">
              {isGeminiReady
                ? 'Your deployment is powered by Google Gemini AI for advanced semantic pitch customization and nuanced multi-channel copywriting.'
                : 'The high-precision Deterministic Rule Engine is currently active, generating verified audits and pitch angles without requiring third-party AI keys.'}
            </p>
          </div>
        </div>

        {/* Database Persistence */}
        <div className="glass-card settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-wrapper">
              <Database size={18} className="text-emerald" />
            </div>
            <div className="settings-header-text">
              <div className="settings-title-row">
                <h2 className="settings-card-title font-bodoni">Persistence Storage</h2>
                <span
                  className={`status-pill ${
                    isSupabaseReady ? 'status-pill-success' : 'status-pill-info'
                  }`}
                >
                  {isSupabaseReady ? 'Supabase PostgreSQL' : 'Local Storage'}
                </span>
              </div>
              <p className="settings-card-description">
                Safely stores discovered leads, search history, client pitch statuses, and outreach interactions.
              </p>
            </div>
          </div>

          <div className="settings-card-body">
            <p className="settings-body-text">
              {isSupabaseReady
                ? 'Connected to production PostgreSQL database via Supabase. All searches and leads persist across team sessions.'
                : 'Operating in file/ephemeral mode. To persist leads permanently on cloud deployments, configure SUPABASE_URL and SUPABASE_ANON_KEY.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SettingsWorkspace;
