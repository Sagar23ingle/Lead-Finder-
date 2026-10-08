'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/Navbar';
import { SearchForm } from '@/components/SearchForm';
import { ConfigAlert } from '@/components/ConfigAlert';
import { MetricsOverview } from '@/components/MetricsOverview';
import { FilterBar, FilterState } from '@/components/FilterBar';
import { LeadTable } from '@/components/LeadTable';
import { SearchHistory } from '@/components/SearchHistory';
import { BestOpportunitiesSection } from '@/components/BestOpportunitiesSection';
import { CrmDashboardMetrics } from '@/components/CrmDashboardMetrics';
import { CrmPipelineView } from '@/components/CrmPipelineView';
import { DailyActionPlan } from '@/components/DailyActionPlan';
import { BusinessInsightsView } from '@/components/BusinessInsightsView';

// Dynamically import heavy interactive modals for optimal initial page bundle & mobile performance
const LeadAnalysisModal = dynamic(
  () => import('@/components/LeadAnalysisModal').then((mod) => mod.LeadAnalysisModal),
  { ssr: false }
);
const OutreachCenterModal = dynamic(
  () => import('@/components/OutreachCenterModal').then((mod) => mod.OutreachCenterModal),
  { ssr: false }
);
const ApiKeyModal = dynamic(
  () => import('@/components/ApiKeyModal').then((mod) => mod.ApiKeyModal),
  { ssr: false }
);
import {
  Business,
  SearchRecord,
  AppConfigStatus,
  SearchResponse,
  LeadAnalysis,
  BestOpportunitiesSummary,
  LeadCrmRecord,
  CrmDashboardMetrics as MetricsType,
  PipelineStage,
  DailyActionItem,
  BusinessInsights,
} from '@/types';
import { Search, FolderKanban, History, PlusCircle, RefreshCw, Zap, BarChart3, Trash2 } from 'lucide-react';

export default function DashboardPage() {
  const [configStatus, setConfigStatus] = useState<AppConfigStatus | null>(null);
  const [searches, setSearches] = useState<SearchRecord[]>([]);
  const [activeSearchId, setActiveSearchId] = useState<string | null>(null);

  // View state separation: 1. New Search, 2. Saved Searches, 3. CRM Pipeline
  const [viewMode, setViewMode] = useState<'new_search' | 'saved_searches' | 'crm_pipeline'>('new_search');

  // Search results state (only populated on search or explicit saved search click)
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, LeadAnalysis>>({});
  const [opportunitiesSummary, setOpportunitiesSummary] = useState<BestOpportunitiesSummary | null>(null);

  // CRM & Pipeline State
  const [crmRecords, setCrmRecords] = useState<Record<string, LeadCrmRecord>>({});
  const [crmMetrics, setCrmMetrics] = useState<MetricsType | null>(null);
  const [allStoredBusinesses, setAllStoredBusinesses] = useState<Business[]>([]);
  const [dailyActions, setDailyActions] = useState<DailyActionItem[]>([]);
  const [businessInsights, setBusinessInsights] = useState<BusinessInsights | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState<boolean>(false);

  // Modals state
  const [selectedLead, setSelectedLead] = useState<Business | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isAnalyzingSingle, setIsAnalyzingSingle] = useState<boolean>(false);
  const [isBatchAnalyzing, setIsBatchAnalyzing] = useState<boolean>(false);

  const [outreachLead, setOutreachLead] = useState<Business | null>(null);
  const [isOutreachOpen, setIsOutreachOpen] = useState<boolean>(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);

  const [dataSource, setDataSource] = useState<'google_places' | 'database_cache' | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [searchAttempted, setSearchAttempted] = useState<boolean>(false);
  const [leadsRequested, setLeadsRequested] = useState<number>(10);

  // Filtering and sorting state
  const [filters, setFilters] = useState<FilterState>({
    websiteFilter: 'all',
    minRating: 0,
    minReviews: 0,
    searchQuery: '',
    sortBy: 'highest_score',
    tierFilter: 'all',
  });

  const fetchInsights = useCallback(async () => {
    try {
      setIsLoadingInsights(true);
      const res = await fetch('/api/crm/insights');
      if (res.ok) {
        const data = await res.json();
        if (data.dailyActions) setDailyActions(data.dailyActions);
        if (data.insights) setBusinessInsights(data.insights);
      }
    } catch (err) {
      console.error('Failed to load insights:', err);
    } finally {
      setIsLoadingInsights(false);
    }
  }, []);

  // Fetch initial data, configuration, opportunities & CRM metrics
  // IMPORTANT: Does NOT auto-populate search inputs or auto-load search results on page load
  const fetchStatusAndHistory = useCallback(async () => {
    try {
      const sessionKey = typeof window !== 'undefined' ? sessionStorage.getItem('session_google_api_key') : null;
      const statusHeaders: Record<string, string> = {};
      if (sessionKey) {
        statusHeaders['x-google-api-key'] = sessionKey;
      }

      const [statusRes, searchesRes, oppsRes, crmRes, insightsRes] = await Promise.all([
        fetch('/api/status', { headers: statusHeaders }),
        fetch('/api/searches'),
        fetch('/api/opportunities'),
        fetch('/api/crm'),
        fetch('/api/crm/insights'),
      ]);

      if (statusRes.ok) {
        const sData: AppConfigStatus = await statusRes.json();
        setConfigStatus(sData);
      }

      if (crmRes.ok) {
        const crmData = await crmRes.json();
        if (crmData.crmRecords) setCrmRecords(crmData.crmRecords);
        if (crmData.metrics) setCrmMetrics(crmData.metrics);
        if (crmData.businesses) setAllStoredBusinesses(crmData.businesses);
      }

      if (insightsRes.ok) {
        const iData = await insightsRes.json();
        if (iData.dailyActions) setDailyActions(iData.dailyActions);
        if (iData.insights) setBusinessInsights(iData.insights);
      }

      if (oppsRes.ok) {
        const oppData = await oppsRes.json();
        if (oppData.summary) {
          setOpportunitiesSummary(oppData.summary);
          const map: Record<string, LeadAnalysis> = {};
          for (const item of oppData.summary.topOpportunities || []) {
            map[item.business.id] = item.analysis;
            map[item.business.external_id] = item.analysis;
          }
          setAnalyses((prev) => ({ ...prev, ...map }));
        }
      }

      if (searchesRes.ok) {
        const hData = await searchesRes.json();
        setSearches(hData.searches || []);
        // NOTE: We deliberately do NOT auto-load latest search here!
        // New Search always begins with empty inputs and empty results.
      }
    } catch (err: any) {
      console.error('Failed to load initial data:', err);
    }
  }, []);

  useEffect(() => {
    fetchStatusAndHistory();
  }, [fetchStatusAndHistory]);

  // Execute a live search
  const handleSearch = async (params: {
    country: string;
    city: string;
    niche: string;
    limit: 10 | 25 | 50 | 100;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);
    setSearchAttempted(true);
    setLeadsRequested(params.limit);

    const sessionKey = typeof window !== 'undefined' ? sessionStorage.getItem('session_google_api_key') : null;
    const reqHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    if (sessionKey) {
      reqHeaders['x-google-api-key'] = sessionKey;
    }

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: reqHeaders,
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        const err = data.error || data.message || 'Failed to discover leads.';
        setErrorMessage(err);
        setBusinesses([]);
        return;
      }

      const searchResult: SearchResponse = data;
      const discoveredList = searchResult.businesses || [];
      setBusinesses(discoveredList);
      setDataSource(searchResult.source);
      setActiveSearchId(searchResult.searchId);
      setStatusMessage(searchResult.message || `Discovered ${searchResult.leadsFound} matching leads.`);

      // Refresh search history list & CRM
      const [hRes, crmRes] = await Promise.all([fetch('/api/searches'), fetch('/api/crm')]);
      if (hRes.ok) {
        const hData = await hRes.json();
        setSearches(hData.searches || []);
      }
      if (crmRes.ok) {
        const crmData = await crmRes.json();
        if (crmData.crmRecords) setCrmRecords(crmData.crmRecords);
        if (crmData.metrics) setCrmMetrics(crmData.metrics);
        if (crmData.businesses) setAllStoredBusinesses(crmData.businesses);
      }

      // Automatically run AI Opportunity Analysis in background for top results
      if (discoveredList.length > 0) {
        triggerBatchAnalysis(discoveredList.slice(0, 10));
      }
    } catch (err: any) {
      console.error('Search request error:', err);
      setErrorMessage(err?.message || 'Network error communicating with server.');
      setBusinesses([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset to brand new search (clears results without deleting DB data)
  const handleStartNewSearch = () => {
    setBusinesses([]);
    setActiveSearchId(null);
    setSearchAttempted(false);
    setStatusMessage(null);
    setErrorMessage(null);
    setViewMode('new_search');
  };

  // Load an existing search from database ONLY when explicitly clicked by user
  const loadSearchDetails = async (searchId: string) => {
    setIsLoadingHistory(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/searches/${searchId}`);
      if (!res.ok) {
        throw new Error('Failed to load saved search leads.');
      }
      const data = await res.json();
      const loadedBusinesses = data.businesses || [];
      setBusinesses(loadedBusinesses);
      setActiveSearchId(searchId);
      setDataSource('database_cache');
      setSearchAttempted(true);
      setLeadsRequested(data.leadsRequested || 10);
      setStatusMessage(data.message || 'Loaded saved search results from database.');

      // Check for existing analyses
      const oppsRes = await fetch('/api/opportunities');
      if (oppsRes.ok) {
        const oData = await oppsRes.json();
        if (oData.summary) {
          setOpportunitiesSummary(oData.summary);
          const map: Record<string, LeadAnalysis> = {};
          for (const item of oData.summary.topOpportunities || []) {
            map[item.business.id] = item.analysis;
            map[item.business.external_id] = item.analysis;
          }
          setAnalyses((prev) => ({ ...prev, ...map }));
        }
      }
    } catch (err: any) {
      console.error('Error loading search from database:', err);
      setErrorMessage(err?.message || 'Could not load search from database.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Delete an existing search from database and history
  const handleDeleteSearch = async (searchId: string, query: string) => {
    try {
      const res = await fetch(`/api/searches/${searchId}`, { method: 'DELETE' });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to delete search from database.');
      }

      setSearches((prev) => prev.filter((s) => s.id !== searchId));

      if (activeSearchId === searchId) {
        setActiveSearchId(null);
        setBusinesses([]);
        setSearchAttempted(false);
        setStatusMessage(`Search "${query}" removed from history.`);
        if (viewMode === 'saved_searches') {
          setViewMode('new_search');
        }
      } else {
        setStatusMessage(`Search "${query}" removed.`);
      }
    } catch (err: any) {
      console.error('Error deleting search:', err);
      setErrorMessage(err?.message || 'Could not delete search from database.');
    }
  };

  // Select a lead for deep audit modal
  const handleSelectLead = async (business: Business) => {
    setSelectedLead(business);
    setIsModalOpen(true);

    const existing = analyses[business.id] || analyses[business.external_id];
    if (!existing) {
      setIsAnalyzingSingle(true);
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId: business.id || business.external_id }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.analysis) {
            setAnalyses((prev) => ({
              ...prev,
              [business.id]: data.analysis,
              [business.external_id]: data.analysis,
            }));
            refreshOpportunities();
          }
        }
      } catch (err) {
        console.error('Analysis error:', err);
      } finally {
        setIsAnalyzingSingle(false);
      }
    }
  };

  // Open Outreach Center modal for a lead
  const handleOpenOutreach = async (business: Business) => {
    setOutreachLead(business);
    setIsOutreachOpen(true);

    const id = business.id || business.external_id;

    // Load or generate initial CRM record if not loaded yet
    if (!crmRecords[id]) {
      try {
        const res = await fetch(`/api/crm?businessId=${encodeURIComponent(id)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.record) {
            setCrmRecords((prev) => ({ ...prev, [id]: data.record }));
          }
        }
      } catch (err) {
        console.error('Failed to load lead CRM record:', err);
      }
    }

    // Trigger analysis if not analyzed yet
    if (!analyses[business.id] && !analyses[business.external_id]) {
      try {
        const aRes = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId: id }),
        });
        if (aRes.ok) {
          const aData = await aRes.json();
          if (aData.analysis) {
            setAnalyses((prev) => ({
              ...prev,
              [business.id]: aData.analysis,
              [business.external_id]: aData.analysis,
            }));
          }
        }
      } catch {}
    }
  };

  // Update CRM record and persist to database
  const handleUpdateCrm = async (updatedRecord: LeadCrmRecord) => {
    try {
      const res = await fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ record: updatedRecord }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.record) {
          setCrmRecords((prev) => ({
            ...prev,
            [data.record.businessId]: data.record,
          }));
        }
        if (data.metrics) {
          setCrmMetrics(data.metrics);
        }
        fetchInsights();
      }
    } catch (err) {
      console.error('Failed to update CRM record:', err);
    }
  };

  // Open outreach from Daily Action Plan 1-click CTA
  const handleActionPlanSelectLead = useCallback(
    async (businessId: string) => {
      const pool = allStoredBusinesses.length > 0 ? allStoredBusinesses : businesses;
      let found = pool.find((b) => b.id === businessId || b.external_id === businessId);

      if (!found) {
        try {
          const res = await fetch('/api/crm');
          if (res.ok) {
            const data = await res.json();
            if (data.businesses) {
              setAllStoredBusinesses(data.businesses);
              found = data.businesses.find((b: Business) => b.id === businessId || b.external_id === businessId);
            }
          }
        } catch (err) {
          console.error('Failed to fetch lead pool:', err);
        }
      }

      if (found) {
        handleOpenOutreach(found);
      }
    },
    [allStoredBusinesses, businesses]
  );

  // Direct pipeline stage update
  const handleUpdateStage = async (businessId: string, newStage: PipelineStage) => {
    const existing =
      crmRecords[businessId] ||
      ({
        businessId,
        stage: newStage,
        contactPerson: null,
        contactEmail: null,
        contactPhone: null,
        notes: '',
        outreachHistory: [],
        prospectReplies: [],
        followUpSequence: [],
        proposal: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as LeadCrmRecord);

    const updated: LeadCrmRecord = {
      ...existing,
      stage: newStage,
      updatedAt: new Date().toISOString(),
    };

    await handleUpdateCrm(updated);
  };

  // Trigger analysis for all current leads
  const triggerBatchAnalysis = async (listToAnalyze?: Business[]) => {
    const target = listToAnalyze || businesses;
    if (target.length === 0 || isBatchAnalyzing) return;

    setIsBatchAnalyzing(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businesses: target }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.analyses) {
          setAnalyses((prev) => ({ ...prev, ...data.analyses }));
          refreshOpportunities();
        }
      }
    } catch (err) {
      console.error('Batch analysis failed:', err);
    } finally {
      setIsBatchAnalyzing(false);
    }
  };

  const refreshOpportunities = async () => {
    try {
      const oppsRes = await fetch('/api/opportunities');
      if (oppsRes.ok) {
        const oData = await oppsRes.json();
        if (oData.summary) {
          setOpportunitiesSummary(oData.summary);
        }
      }
    } catch {}
  };

  // Filter and sort businesses
  const filteredAndSortedBusinesses = useMemo(() => {
    let result = [...businesses];

    // 1. In-results search query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          (b.address && b.address.toLowerCase().includes(q)) ||
          (b.category && b.category.toLowerCase().includes(q))
      );
    }

    // 2. Website filter
    if (filters.websiteFilter === 'has_website') {
      result = result.filter((b) => Boolean(b.website));
    } else if (filters.websiteFilter === 'no_website') {
      result = result.filter((b) => !b.website);
    }

    // 3. Minimum rating filter
    if (filters.minRating > 0) {
      result = result.filter((b) => (b.rating ?? 0) >= filters.minRating);
    }

    // 4. Minimum reviews filter
    if (filters.minReviews > 0) {
      result = result.filter((b) => b.review_count >= filters.minReviews);
    }

    // 5. Tier filter
    if (filters.tierFilter === 'hot') {
      result = result.filter((b) => {
        const a = analyses[b.id] || analyses[b.external_id];
        return a && a.tier === 'HOT';
      });
    } else if (filters.tierFilter === 'warm_or_hot') {
      result = result.filter((b) => {
        const a = analyses[b.id] || analyses[b.external_id];
        return a && (a.tier === 'HOT' || a.tier === 'WARM');
      });
    } else if (filters.tierFilter === 'low') {
      result = result.filter((b) => {
        const a = analyses[b.id] || analyses[b.external_id];
        return a && a.tier === 'LOW';
      });
    }

    // 6. Sorting
    result.sort((a, b) => {
      if (filters.sortBy === 'highest_score') {
        const scoreA = (analyses[a.id] || analyses[a.external_id])?.score ?? -1;
        const scoreB = (analyses[b.id] || analyses[b.external_id])?.score ?? -1;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return (b.review_count || 0) - (a.review_count || 0);
      }
      if (filters.sortBy === 'highest_rating') {
        const ratingA = a.rating ?? 0;
        const ratingB = b.rating ?? 0;
        if (ratingB !== ratingA) return ratingB - ratingA;
        return b.review_count - a.review_count;
      }
      if (filters.sortBy === 'most_reviews') {
        return b.review_count - a.review_count;
      }
      if (filters.sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (filters.sortBy === 'name_asc') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return result;
  }, [businesses, filters, analyses]);

  // Active saved search info
  const activeSearchRecord = searches.find((s) => s.id === activeSearchId);

  return (
    <div className="app-container">
      <Navbar
        configStatus={configStatus}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />

      {/* Top Mode Navigation Tabs */}
      <div
        style={{
          backgroundColor: 'var(--card-bg, #1e293b)',
          borderBottom: '1px solid var(--border-color, #334155)',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', maxWidth: '100%' }}>
          <button
            type="button"
            onClick={() => setViewMode('new_search')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 18px',
              background: 'none',
              border: 'none',
              borderBottom: viewMode === 'new_search' ? '2px solid #3b82f6' : '2px solid transparent',
              color: viewMode === 'new_search' ? '#3b82f6' : 'var(--text-secondary)',
              fontWeight: viewMode === 'new_search' ? 600 : 400,
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            <Search size={16} />
            <span>Discover Leads (New Search)</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('saved_searches')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 18px',
              background: 'none',
              border: 'none',
              borderBottom: viewMode === 'saved_searches' ? '2px solid #3b82f6' : '2px solid transparent',
              color: viewMode === 'saved_searches' ? '#3b82f6' : 'var(--text-secondary)',
              fontWeight: viewMode === 'saved_searches' ? 600 : 400,
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            <History size={16} />
            <span>Saved Searches ({searches.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('crm_pipeline')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 18px',
              background: 'none',
              border: 'none',
              borderBottom: viewMode === 'crm_pipeline' ? '2px solid #8b5cf6' : '2px solid transparent',
              color: viewMode === 'crm_pipeline' ? '#8b5cf6' : 'var(--text-secondary)',
              fontWeight: viewMode === 'crm_pipeline' ? 600 : 400,
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            <FolderKanban size={16} />
            <span>CRM Pipeline & Outreach</span>
          </button>
        </div>

        {/* Quick New Search Button */}
        {viewMode !== 'new_search' && (
          <button
            type="button"
            onClick={handleStartNewSearch}
            className="btn-primary"
            style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <PlusCircle size={15} />
            <span>New Lead Search</span>
          </button>
        )}
      </div>

      <div className={`dashboard-layout ${viewMode === 'crm_pipeline' ? 'single-column' : ''}`}>
        {/* Left Sidebar: Search History (Visible when in Saved Searches or Lead Discovery) */}
        {viewMode !== 'crm_pipeline' && (
          <SearchHistory
            searches={searches}
            activeSearchId={activeSearchId}
            onSelectSearch={async (id) => {
              await loadSearchDetails(id);
              setViewMode('saved_searches');
            }}
            onDeleteSearch={handleDeleteSearch}
            isLoadingHistory={isLoadingHistory}
          />
        )}

        {/* Main Content Area */}
        <main
          className="dashboard-main"
          style={{ width: viewMode === 'crm_pipeline' ? '100%' : undefined }}
        >
          {/* Configuration and Error Alerts */}
          <ConfigAlert
            isPlacesConfigured={configStatus?.googlePlacesConfigured ?? false}
            isSupabaseConfigured={configStatus?.supabaseConfigured ?? false}
            isVercel={configStatus?.isVercel ?? false}
            errorMessage={errorMessage}
            onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          />

          {/* VIEW 1: NEW LEAD DISCOVERY */}
          {viewMode === 'new_search' && (
            <>
              {/* Business Intelligence & Best Opportunities Section */}
              <BestOpportunitiesSection
                summary={opportunitiesSummary}
                onSelectLead={handleSelectLead}
              />

              {/* Quick Daily Actions Banner */}
              {dailyActions.length > 0 && (
                <div
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={18} color="#ef4444" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      You have {dailyActions.length} high-priority conversion {dailyActions.length === 1 ? 'action' : 'actions'} scheduled for today.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewMode('crm_pipeline')}
                    style={{
                      backgroundColor: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    View Today&apos;s Actions
                  </button>
                </div>
              )}

              {/* Clean Empty Search Form */}
              <SearchForm
                onSearch={handleSearch}
                isLoading={isLoading}
                isApiConfigured={configStatus?.googlePlacesConfigured ?? false}
              />

              {/* Status Message */}
              {statusMessage && !errorMessage && (
                <div
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 8px',
                    backgroundColor: 'rgba(30, 41, 59, 0.4)',
                    borderRadius: '6px',
                    width: 'fit-content',
                  }}
                >
                  <span>{statusMessage}</span>
                </div>
              )}

              {/* Metrics Overview */}
              <MetricsOverview businesses={businesses} source={dataSource} />

              {/* Filter Bar */}
              <FilterBar
                filters={filters}
                onChange={setFilters}
                totalCount={businesses.length}
                filteredCount={filteredAndSortedBusinesses.length}
              />

              {/* Leads Table */}
              <LeadTable
                businesses={filteredAndSortedBusinesses}
                analyses={analyses}
                crmRecords={crmRecords}
                isLoading={isLoading}
                searchAttempted={searchAttempted}
                leadsFound={businesses.length}
                leadsRequested={leadsRequested}
                onSelectLead={handleSelectLead}
                onOpenOutreach={handleOpenOutreach}
                onAnalyzeAll={() => triggerBatchAnalysis()}
                isBatchAnalyzing={isBatchAnalyzing}
              />
            </>
          )}

          {/* VIEW 2: SAVED SEARCHES EXPLORER */}
          {viewMode === 'saved_searches' && (
            <>
              <div
                style={{
                  backgroundColor: 'var(--card-bg, #1e293b)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {activeSearchRecord
                      ? `Saved Search: ${activeSearchRecord.niche} in ${activeSearchRecord.city}, ${activeSearchRecord.country}`
                      : 'Saved Searches Explorer'}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {activeSearchRecord
                      ? `Loaded ${businesses.length} leads safely from database storage.`
                      : 'Select a saved search from the sidebar to inspect previously stored leads.'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {activeSearchRecord && (
                    <button
                      type="button"
                      onClick={() => handleDeleteSearch(activeSearchRecord.id, activeSearchRecord.query)}
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.12)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        padding: '7px 12px',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease',
                      }}
                      title="Delete this saved search from database"
                    >
                      <Trash2 size={13} />
                      <span>Delete Search</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleStartNewSearch}
                    className="btn-primary"
                    style={{ padding: '7px 14px', fontSize: '0.82rem' }}
                  >
                    Start New Fresh Search
                  </button>
                </div>
              </div>

              {/* Metrics Overview */}
              <MetricsOverview businesses={businesses} source={dataSource} />

              {/* Filter Bar */}
              <FilterBar
                filters={filters}
                onChange={setFilters}
                totalCount={businesses.length}
                filteredCount={filteredAndSortedBusinesses.length}
              />

              {/* Leads Table */}
              <LeadTable
                businesses={filteredAndSortedBusinesses}
                analyses={analyses}
                crmRecords={crmRecords}
                isLoading={isLoadingHistory}
                searchAttempted={true}
                leadsFound={businesses.length}
                leadsRequested={leadsRequested}
                onSelectLead={handleSelectLead}
                onOpenOutreach={handleOpenOutreach}
                onAnalyzeAll={() => triggerBatchAnalysis()}
                isBatchAnalyzing={isBatchAnalyzing}
              />
            </>
          )}

          {/* VIEW 3: CRM PIPELINE & LIVE METRICS */}
          {viewMode === 'crm_pipeline' && (
            <>
              {/* Daily Action Plan (Today's Actions) */}
              <DailyActionPlan
                actions={dailyActions}
                onSelectLead={handleActionPlanSelectLead}
                isLoading={isLoadingInsights}
                onRefresh={fetchInsights}
              />

              {/* Dashboard Metrics (Calculated from Real Database Data) */}
              <CrmDashboardMetrics metrics={crmMetrics} />

              {/* AI Business Insights & Practical Recommendations */}
              <BusinessInsightsView
                insights={businessInsights}
                isLoading={isLoadingInsights}
              />

              {/* Pipeline Kanban View */}
              <CrmPipelineView
                businesses={allStoredBusinesses.length > 0 ? allStoredBusinesses : businesses}
                crmRecords={crmRecords}
                analyses={analyses}
                onOpenOutreach={handleOpenOutreach}
                onUpdateStage={handleUpdateStage}
              />

              {/* Stored Leads Table with CRM Status */}
              <div style={{ marginTop: '24px' }}>
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    marginBottom: '12px',
                    color: 'var(--text-primary)',
                  }}
                >
                  All Stored Database Leads & Pipeline Status (
                  {(allStoredBusinesses.length > 0 ? allStoredBusinesses : businesses).length})
                </h3>
                <LeadTable
                  businesses={allStoredBusinesses.length > 0 ? allStoredBusinesses : businesses}
                  analyses={analyses}
                  crmRecords={crmRecords}
                  isLoading={false}
                  searchAttempted={true}
                  leadsFound={(allStoredBusinesses.length > 0 ? allStoredBusinesses : businesses).length}
                  leadsRequested={100}
                  onSelectLead={handleSelectLead}
                  onOpenOutreach={handleOpenOutreach}
                  onAnalyzeAll={() =>
                    triggerBatchAnalysis(allStoredBusinesses.length > 0 ? allStoredBusinesses : businesses)
                  }
                  isBatchAnalyzing={isBatchAnalyzing}
                />
              </div>
            </>
          )}
        </main>
      </div>

      {/* MODAL 1: AI Lead Analysis & Opportunity Modal */}
      {isModalOpen && selectedLead && (
        <LeadAnalysisModal
          business={selectedLead}
          analysis={analyses[selectedLead.id] || analyses[selectedLead.external_id] || null}
          isLoading={isAnalyzingSingle}
          onClose={() => setIsModalOpen(false)}
          onAnalyze={async (b) => {
            setIsAnalyzingSingle(true);
            try {
              const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ businessId: b.id || b.external_id }),
              });
              if (res.ok) {
                const data = await res.json();
                if (data.analysis) {
                  setAnalyses((prev) => ({
                    ...prev,
                    [b.id]: data.analysis,
                    [b.external_id]: data.analysis,
                  }));
                  refreshOpportunities();
                }
              }
            } finally {
              setIsAnalyzingSingle(false);
            }
          }}
        />
      )}

      {/* MODAL 2: Human-in-Control Outreach Center Modal */}
      {isOutreachOpen && outreachLead && (
        <OutreachCenterModal
          business={outreachLead}
          analysis={analyses[outreachLead.id] || analyses[outreachLead.external_id] || null}
          crmRecord={
            crmRecords[outreachLead.id || outreachLead.external_id] || {
              businessId: outreachLead.id || outreachLead.external_id,
              stage: 'NEW',
              contactPerson: null,
              contactEmail: null,
              contactPhone: outreachLead.phone || null,
              notes: '',
              outreachHistory: [],
              prospectReplies: [],
              followUpSequence: [],
              proposal: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          }
          onClose={() => setIsOutreachOpen(false)}
          onUpdateCrm={handleUpdateCrm}
        />
      )}

      {/* MODAL 3: Places API Key Session Configuration Modal */}
      {isApiKeyModalOpen && (
        <ApiKeyModal
          isOpen={isApiKeyModalOpen}
          onClose={() => setIsApiKeyModalOpen(false)}
          configStatus={configStatus}
          onKeyUpdated={() => {
            fetchStatusAndHistory();
          }}
        />
      )}
    </div>
  );
}
