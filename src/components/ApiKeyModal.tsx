'use client';

import React, { useState, useEffect } from 'react';
import { X, Key, CheckCircle2, AlertCircle, Shield, Loader2, Trash2 } from 'lucide-react';
import { AppConfigStatus } from '@/types';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  configStatus: AppConfigStatus | null;
  onKeyUpdated: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  configStatus,
  onKeyUpdated,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [hasSessionKey, setHasSessionKey] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('session_google_api_key');
      if (stored) {
        setApiKeyInput(stored);
        setHasSessionKey(true);
      } else {
        setHasSessionKey(false);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSaveAndTest = async () => {
    const cleanKey = apiKeyInput.trim();
    if (!cleanKey) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid Google API key.' });
      return;
    }

    setIsTesting(true);
    setStatusMessage(null);

    try {
      // Test key against server status endpoint
      const res = await fetch('/api/status', {
        headers: {
          'x-google-api-key': cleanKey,
        },
      });

      if (res.ok) {
        const data: AppConfigStatus = await res.json();
        if (data.googlePlacesConfigured) {
          sessionStorage.setItem('session_google_api_key', cleanKey);
          setHasSessionKey(true);
          setStatusMessage({
            type: 'success',
            text: 'API Key active for this browser session. Verified with server.',
          });
          onKeyUpdated();
        } else {
          setStatusMessage({
            type: 'error',
            text: data.placesStatusMessage || 'Could not verify API key.',
          });
        }
      } else {
        setStatusMessage({ type: 'error', text: 'Failed to verify API key with backend.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Network error while validating API key.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleClearKey = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('session_google_api_key');
    }
    setApiKeyInput('');
    setHasSessionKey(false);
    setStatusMessage({ type: 'info', text: 'Session API key removed.' });
    onKeyUpdated();
  };

  const isServerEnvConfigured = configStatus?.placesSource === 'env';

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-container"
        style={{ maxWidth: '580px', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#60a5fa',
              }}
            >
              <Key size={18} />
            </div>
            <div>
              <h3 className="modal-title font-bodoni">
                Google Places API Configuration
              </h3>
              <p className="modal-subtitle">
                Server-routed configuration & safe browser session storage
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Environment Status Notice */}
          <div
            style={{
              backgroundColor: isServerEnvConfigured ? 'rgba(52, 211, 153, 0.08)' : 'rgba(245, 158, 11, 0.08)',
              border: `1px solid ${isServerEnvConfigured ? 'rgba(52, 211, 153, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
              borderRadius: '10px',
              padding: '14px 16px',
              fontSize: '0.825rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}
          >
            <div style={{ fontWeight: 600, color: isServerEnvConfigured ? '#34d399' : '#fbbf24', marginBottom: '4px' }}>
              {isServerEnvConfigured
                ? 'Server-Side Environment Variable Active'
                : 'Server Environment Variable Unset'}
            </div>
            {isServerEnvConfigured ? (
              <span>
                Your production deployment is reading <code>GOOGLE_MAPS_API_KEY</code> directly from Vercel environment variables. No session key is required.
              </span>
            ) : (
              <span>
                To configure permanently, add <code>GOOGLE_MAPS_API_KEY</code> or <code>GOOGLE_PLACES_API_KEY</code> in your Vercel Project Settings and redeploy. You can also paste your key below to search in this browser session immediately.
              </span>
            )}
          </div>

          {/* Key Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label
              htmlFor="session-api-key"
              className="form-label"
            >
              <Key size={13} className="text-cyan" />
              <span>Session Google Places API Key</span>
            </label>
            <input
              id="session-api-key"
              type="password"
              className="form-input"
              placeholder="Paste Google API key (starts with AIza...)"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              style={{ fontFamily: 'var(--font-mono)' }}
            />
          </div>

          {/* Security Note */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              lineHeight: 1.45,
            }}
          >
            <Shield size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#34d399' }} />
            <span>
              <strong>Zero Leakage Security:</strong> Session keys are kept in <code>sessionStorage</code> only and transmitted via secure server-side headers (<code>/api/leads/search</code>). They are never saved to public repositories or leaked into client bundles.
            </span>
          </div>

          {/* Feedback Status */}
          {statusMessage && (
            <div
              className={`feedback-alert ${
                statusMessage.type === 'success'
                  ? 'feedback-success'
                  : statusMessage.type === 'error'
                  ? 'feedback-error'
                  : 'feedback-info'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              ) : (
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="modal-footer">
          {hasSessionKey ? (
            <button
              type="button"
              onClick={handleClearKey}
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '7px 13px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
              }}
            >
              <Trash2 size={13} />
              <span>Clear Session Key</span>
            </button>
          ) : (
            <div />
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleSaveAndTest}
              disabled={isTesting || !apiKeyInput.trim()}
              className="btn-primary"
              style={{ padding: '8px 18px', fontSize: '0.85rem' }}
            >
              {isTesting ? <Loader2 size={15} className="spinner" /> : <Key size={15} />}
              <span>{isTesting ? 'Verifying...' : 'Save & Verify Key'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
