'use client';

import React, { useState } from 'react';
import { SearchRecord } from '@/types';
import { History, Clock, Database, Trash2, Loader2 } from 'lucide-react';

interface SearchHistoryProps {
  searches: SearchRecord[];
  activeSearchId: string | null;
  onSelectSearch: (searchId: string) => Promise<void>;
  onDeleteSearch?: (searchId: string, query: string) => Promise<void>;
  isLoadingHistory: boolean;
}

function formatRelativeTime(dateString: string): string {
  try {
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(dateString).toLocaleDateString();
  } catch {
    return '';
  }
}

export const SearchHistory: React.FC<SearchHistoryProps> = ({
  searches,
  activeSearchId,
  onSelectSearch,
  onDeleteSearch,
  isLoadingHistory,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, id: string, query: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!onDeleteSearch) return;

    if (window.confirm(`Delete saved search "${query}" from history?`)) {
      setDeletingId(id);
      try {
        await onDeleteSearch(id, query);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <aside className="dashboard-sidebar">
      <div>
        <div className="sidebar-title">
          <History size={16} />
          <span>Search History</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Cached in database. Click to reload results with zero API usage.
        </p>

        {searches.length === 0 ? (
          <div style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No previous searches recorded yet.
          </div>
        ) : (
          <div className="history-list">
            {searches.map((item) => {
              const isActive = activeSearchId === item.id;
              const isDeleting = deletingId === item.id;

              return (
                <div
                  key={item.id}
                  style={{
                    position: 'relative',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <button
                    type="button"
                    className={`history-item ${isActive ? 'active' : ''}`}
                    onClick={() => onSelectSearch(item.id)}
                    disabled={isLoadingHistory || isDeleting}
                    title="Load saved leads from database"
                    style={{
                      paddingRight: onDeleteSearch ? '2.4rem' : undefined,
                      opacity: isDeleting ? 0.5 : 1,
                    }}
                  >
                    <div className="history-query" title={item.query}>
                      {item.query}
                    </div>
                    <div className="history-meta">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Database size={10} />
                        <span>{item.leads_found} leads stored</span>
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={10} />
                        <span>{formatRelativeTime(item.created_at)}</span>
                      </span>
                    </div>
                  </button>

                  {onDeleteSearch && (
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, item.id, item.query)}
                      disabled={isDeleting || isLoadingHistory}
                      title={`Delete "${item.query}" from history`}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        color: '#f87171',
                        cursor: 'pointer',
                        padding: '6px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                        zIndex: 2,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.25)';
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                        e.currentTarget.style.color = '#ef4444';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.25)';
                        e.currentTarget.style.color = '#f87171';
                      }}
                    >
                      {isDeleting ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Trash2 size={13} />
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};

