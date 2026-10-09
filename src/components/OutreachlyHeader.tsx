'use client';

import React from 'react';
import { AppConfigStatus } from '@/types';
import { Sliders, Sparkles, Key, Check } from 'lucide-react';

interface OutreachlyHeaderProps {
  configStatus: AppConfigStatus | null;
  onOpenSettings: () => void;
  onOpenQuickSearch?: () => void;
  onOpenApiKeyModal?: () => void;
}

export const OutreachlyHeader: React.FC<OutreachlyHeaderProps> = ({
  configStatus,
  onOpenSettings,
  onOpenQuickSearch,
  onOpenApiKeyModal,
}) => {
  const isPlacesReady = configStatus?.googlePlacesConfigured ?? false;

  const handleStatusClick = () => {
    if (!isPlacesReady && onOpenApiKeyModal) {
      onOpenApiKeyModal();
    } else {
      onOpenSettings();
    }
  };
  return (
    <header className="outreachly-header" role="banner">
      <div className="header-brand-container">
        <div className="brand-monogram">
          <span className="brand-glyph font-bodoni">O</span>
        </div>
        <div className="brand-text-block">
          <span className="brand-wordmark font-bodoni">OUTREACHLY</span>
          <span className="brand-tagline">Client Intelligence</span>
        </div>
      </div>

      <div className="header-actions-container">
        {/* Understated API status indicator button that opens API key modal or settings */}
        <button
          type="button"
          onClick={handleStatusClick}
          className={`header-status-btn ${isPlacesReady ? 'ready' : 'unconfigured'}`}
          title={
            isPlacesReady
              ? 'Places API is active. Click to view configuration.'
              : 'Places API key required. Click to configure key.'
          }
          aria-label="API Integration Settings"
        >
          <span className={`status-pulse-dot ${isPlacesReady ? 'active' : ''}`} />
          <span className="status-btn-text">
            {isPlacesReady ? 'Engine Ready' : 'Configure API'}
          </span>
        </button>

        {/* Settings button */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="header-icon-btn"
          title="Platform Settings & API Keys"
          aria-label="Settings"
        >
          <Sliders size={16} strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
};
export default OutreachlyHeader;
