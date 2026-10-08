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
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle, #1e293b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-surface-elevated, #1e293b)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(37, 99, 235, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#60a5fa',
              }}
            >
              <Key size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Google Places API Configuration
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Safe server-routed configuration & browser session management
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '4px',
            }}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Environment Status Notice */}
          <div
            style={{
              backgroundColor: isServerEnvConfigured ? 'rgba(16, 185, 129, 0.1)' : 'rgba(30, 41, 59, 0.6)',
              border: `1px solid ${isServerEnvConfigured ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle, #1e293b)'}`,
              borderRadius: '8px',
              padding: '12px 14px',
              fontSize: '0.825rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {isServerEnvConfigured
                ? 'Server-Side Environment Variable Active'
                : 'Server Environment Variable Unset'}
            </div>
            {isServerEnvConfigured ? (
              <span>
                Your production deployment is reading <code>GOOGLE_MAPS_API_KEY</code> from Vercel environment variables. No session key is required.
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
              style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}
            >
              Session Google Places API Key:
            </label>
            <input
              id="session-api-key"
              type="password"
              className="form-input"
              placeholder="Paste Google API key (starts with AIza...)"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              style={{
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                backgroundColor: 'var(--bg-input, #0b1120)',
                borderColor: 'var(--border-medium, #334155)',
              }}
            />
          </div>

          {/* Security Note */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              fontSize: '0.78rem',
              color: 'var(--text-muted, #64748b)',
            }}
          >
            <Shield size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#10b981' }} />
            <span>
              <strong>Zero Leakage Security:</strong> Session keys are kept in <code>sessionStorage</code> only and transmitted via secure server-side headers (<code>/api/leads/search</code>). They are never saved to public files or exposed in client bundles.
            </span>
          </div>

          {/* Feedback Status */}
          {statusMessage && (
            <div
              style={{
                borderRadius: '6px',
                padding: '10px 14px',
                fontSize: '0.825rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor:
                  statusMessage.type === 'success'
                    ? 'rgba(16, 185, 129, 0.12)'
                    : statusMessage.type === 'error'
                    ? 'rgba(239, 68, 68, 0.12)'
                    : 'rgba(59, 130, 246, 0.12)',
                color:
                  statusMessage.type === 'success'
                    ? '#34d399'
                    : statusMessage.type === 'error'
                    ? '#fca5a5'
                    : '#93c5fd',
                border: `1px solid ${
                  statusMessage.type === 'success'
                    ? 'rgba(16, 185, 129, 0.3)'
                    : statusMessage.type === 'error'
                    ? 'rgba(239, 68, 68, 0.3)'
                    : 'rgba(59, 130, 246, 0.3)'
                }`,
              }}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-subtle, #1e293b)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--bg-surface, #0f172a)',
          }}
        >
          {hasSessionKey ? (
            <button
              type="button"
              onClick={handleClearKey}
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Trash2 size={13} />
              <span>Clear Session Key</span>
            </button>
          ) : (
            <div />
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid var(--border-medium, #334155)',
                color: 'var(--text-secondary, #94a3b8)',
                padding: '7px 14px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleSaveAndTest}
              disabled={isTesting || !apiKeyInput.trim()}
              className="btn-primary"
              style={{ padding: '7px 16px', fontSize: '0.85rem' }}
            >
              {isTesting ? <Loader2 size={14} className="spinner" /> : <Key size={14} />}
              <span>{isTesting ? 'Verifying...' : 'Save & Verify Key'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
