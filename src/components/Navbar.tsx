'use client';

import React from 'react';
import { AppConfigStatus } from '@/types';
import { Database, Key, Sparkles, BrainCircuit } from 'lucide-react';

interface NavbarProps {
  configStatus: AppConfigStatus | null;
  onOpenApiKeyModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ configStatus, onOpenApiKeyModal }) => {
  const isPlacesReady = configStatus?.googlePlacesConfigured ?? false;
  const isSupabase = configStatus?.supabaseConfigured ?? false;
  const isGemini = configStatus?.geminiConfigured ?? false;
  const isVercel = configStatus?.isVercel ?? false;

  return (
    <header className="top-navbar">
      <div className="brand-section">
        <div className="brand-logo">
          <Sparkles size={18} />
        </div>
        <span className="brand-title">Lead Finder</span>
        <span className="brand-badge">PRO ENGINE</span>
      </div>

      <div className="navbar-status">
        {/* Google Places API Key Status */}
        <button
          type="button"
          onClick={onOpenApiKeyModal}
          className={`status-chip ${isPlacesReady ? 'success' : 'danger'}`}
          style={{ cursor: 'pointer', background: 'none' }}
          title={
            isPlacesReady
              ? `Places API Active (${configStatus?.placesSource === 'session' ? 'Session Key' : 'Server Env'}). Click to manage.`
              : 'Places API is not configured on the server. Click to configure API key.'
          }
        >
          <Key size={12} />
          <span className="status-indicator-dot" />
          <span className="status-label-full">
            {isPlacesReady
              ? configStatus?.placesSource === 'session'
                ? 'Places (Session Key)'
                : 'Places API Active'
              : 'Places API Unset'}
          </span>
          <span className="status-label-compact">{isPlacesReady ? 'Places' : 'No Key'}</span>
        </button>

        {/* AI Engine Status */}
        <div
          className={`status-chip ${isGemini ? 'success' : 'warning'}`}
          title={
            isGemini
              ? 'Gemini AI active'
              : 'Deterministic Opportunity & Audit Rule Engine active (no Gemini API key configured)'
          }
        >
          <BrainCircuit size={12} />
          <span className="status-indicator-dot" />
          <span className="status-label-full">
            {isGemini ? 'Gemini AI Active' : 'Rule Engine (No Gemini Key)'}
          </span>
          <span className="status-label-compact">{isGemini ? 'Gemini' : 'Rules'}</span>
        </div>

        {/* Database Status */}
        <div
          className={`status-chip ${isSupabase ? 'success' : 'warning'}`}
          title={
            isSupabase
              ? 'Connected to Supabase PostgreSQL'
              : isVercel
              ? 'Running on ephemeral Vercel serverless storage (configure Supabase for production persistence)'
              : 'Using Local Disk Storage (data/leads_storage.json)'
          }
        >
          <Database size={12} />
          <span className="status-indicator-dot" />
          <span className="status-label-full">
            {isSupabase
              ? 'Supabase Postgres'
              : isVercel
              ? 'Ephemeral Storage (Vercel)'
              : 'Local Disk Storage'}
          </span>
          <span className="status-label-compact">{isSupabase ? 'Postgres' : isVercel ? 'Ephemeral' : 'Disk'}</span>
        </div>
      </div>
    </header>
  );
};
