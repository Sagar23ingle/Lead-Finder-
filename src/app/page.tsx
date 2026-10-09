'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';

// WebGL Animated Background
import { DarkVeil } from '@/components/DarkVeil';

// Core UI Components
import { OutreachlyHeader } from '@/components/OutreachlyHeader';
import { MacDock, DockTabId } from '@/components/MacDock';

// Workspaces
import { OverviewWorkspace } from '@/components/OverviewWorkspace';
import { DiscoverWorkspace } from '@/components/DiscoverWorkspace';
import { LeadsWorkspace } from '@/components/LeadsWorkspace';
import { PipelineWorkspace } from '@/components/PipelineWorkspace';
import { DemosWorkspace } from '@/components/DemosWorkspace';
import { AnalyticsWorkspace } from '@/components/AnalyticsWorkspace';
import { SettingsWorkspace } from '@/components/SettingsWorkspace';
import { FilterState } from '@/components/FilterBar';

// Interactive Overlays
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

export default function OutreachlyPage() {
  // Navigation State: 'overview' | 'discover' | 'leads' | 'pipeline' | 'demos' | 'analytics' | 'settings'
  const [activeTab, setActiveTab] = useState<DockTabId>('overview');

  // Backend & Config State
  const [configStatus, setConfigStatus] = useState<AppConfigStatus | null>(null);
  const [searches, setSearches] = useState<SearchRecord[]>([]);
  const [activeSearchId, setActiveSearchId] = useState<string | null>(null);

  // Business & Lead Data State
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, LeadAnalysis>>({});
  const [opportunitiesSummary, setOpportunitiesSummary] = useState<BestOpportunitiesSummary | null>(null);

  // CRM & Pipeline State
  const [crmRecords, setCrmRecords] = useState<Record<string, LeadCrmRecord>>({});
  const [crmMetrics, setCrmMetrics] = useState<MetricsType | null>(null);
  const [allStoredBusinesses, setAllStoredBusinesses] = useState<Business[]>([]);
  const [dailyActions, setDailyActions] = useState<DailyActionItem[]>([]);
  const [businessInsights, setBusinessInsights] = useState<BusinessInsights | null>(null);

  // Modal / Overlay States
  const [selectedLead, setSelectedLead] = useState<Business | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isAnalyzingSingle, setIsAnalyzingSingle] = useState<boolean>(false);
  const [isBatchAnalyzing, setIsBatchAnalyzing] = useState<boolean>(false);

  const [outreachLead, setOutreachLead] = useState<Business | null>(null);
  const [isOutreachOpen, setIsOutreachOpen] = useState<boolean>(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);

  // Status & Feedback Messages
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [searchAttempted, setSearchAttempted] = useState<boolean>(false);
  const [leadsRequested, setLeadsRequested] = useState<number>(10);

  // Leads Filter State
  const [filters, setFilters] = useState<FilterState>({
    websiteFilter: 'all',
    minRating: 0,
    minReviews: 0,
    searchQuery: '',
    sortBy: 'highest_score',
    tierFilter: 'all',
  });

  // Fetch initial data, configuration, opportunities & CRM metrics
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
        if (crmData.businesses) {
          setAllStoredBusinesses(crmData.businesses);
          // If no active search yet, populate default lead pool for workspace views
          setBusinesses((prev) => (prev.length === 0 ? crmData.businesses : prev));
        }
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
        return;
      }

      const searchResult: SearchResponse = data;
      const discoveredList = searchResult.businesses || [];
      setBusinesses(discoveredList);
      setActiveSearchId(searchResult.searchId);
      setStatusMessage(searchResult.message || `Discovered ${searchResult.leadsFound} verified leads.`);

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

      // Automatically audit top results
      if (discoveredList.length > 0) {
        triggerBatchAnalysis(discoveredList.slice(0, 10));
      }
    } catch (err: any) {
      console.error('Search request error:', err);
      setErrorMessage(err?.message || 'Network error communicating with server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load an existing search from database
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
      setSearchAttempted(true);
      setLeadsRequested(data.leadsRequested || 10);
      setStatusMessage(data.message || `Loaded ${loadedBusinesses.length} leads from database.`);

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

  // Delete an existing search
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
        setStatusMessage(`Search "${query}" removed from history.`);
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

  // Update CRM record
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
      }
    } catch (err) {
      console.error('Failed to update CRM record:', err);
    }
  };

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

  // Batch analysis
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

  // Unified lead pool for views
  const displayBusinesses = businesses.length > 0 ? businesses : allStoredBusinesses;

  return (
    <div className="outreachly-app-root">
      {/* 1. EXACT ANIMATED DARKVEIL WEBGL BACKGROUND */}
      <div className="darkveil-fixed-background" aria-hidden="true">
        <DarkVeil
          hueShift={0}
          noiseIntensity={0}
          scanlineIntensity={0}
          speed={0.5}
          scanlineFrequency={0}
          warpAmount={0}
        />
      </div>

      {/* 2. TRANSLUCENT GLASS SHELL */}
      <div className="outreachly-viewport-shell">
        {/* Top Header */}
        <OutreachlyHeader
          configStatus={configStatus}
          onOpenSettings={() => setActiveTab('settings')}
          onOpenQuickSearch={() => setActiveTab('discover')}
          onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        />

        {/* Main Content Workspace */}
        <main className="outreachly-main-content">
          {activeTab === 'overview' && (
            <OverviewWorkspace
              businesses={displayBusinesses}
              allStoredBusinesses={allStoredBusinesses}
              analyses={analyses}
              crmRecords={crmRecords}
              searches={searches}
              onNavigateToTab={(tab) => setActiveTab(tab)}
              onSelectLead={handleSelectLead}
              onOpenOutreach={handleOpenOutreach}
              onLoadSearch={async (id) => {
                await loadSearchDetails(id);
                setActiveTab('leads');
              }}
            />
          )}

          {activeTab === 'discover' && (
            <DiscoverWorkspace
              onSearch={handleSearch}
              isLoading={isLoading}
              isApiConfigured={configStatus?.googlePlacesConfigured ?? false}
              searches={searches}
              activeSearchId={activeSearchId}
              onSelectSearch={async (id) => {
                await loadSearchDetails(id);
                setActiveTab('leads');
              }}
              onDeleteSearch={handleDeleteSearch}
              isLoadingHistory={isLoadingHistory}
              statusMessage={statusMessage}
              errorMessage={errorMessage}
              leadsFound={businesses.length}
              onViewLeads={() => setActiveTab('leads')}
              onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
              onOpenSettings={() => setActiveTab('settings')}
            />
          )}

          {activeTab === 'leads' && (
            <LeadsWorkspace
              businesses={displayBusinesses}
              analyses={analyses}
              crmRecords={crmRecords}
              isLoading={isLoading}
              searchAttempted={searchAttempted}
              leadsFound={displayBusinesses.length}
              leadsRequested={leadsRequested}
              onSelectLead={handleSelectLead}
              onOpenOutreach={handleOpenOutreach}
              onAnalyzeAll={() => triggerBatchAnalysis()}
              isBatchAnalyzing={isBatchAnalyzing}
              filters={filters}
              onFilterChange={setFilters}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'pipeline' && (
            <PipelineWorkspace
              businesses={displayBusinesses}
              crmRecords={crmRecords}
              analyses={analyses}
              onOpenOutreach={handleOpenOutreach}
              onUpdateStage={handleUpdateStage}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'demos' && (
            <DemosWorkspace
              businesses={displayBusinesses}
              analyses={analyses}
              crmRecords={crmRecords}
              onOpenOutreach={handleOpenOutreach}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsWorkspace
              businesses={displayBusinesses}
              analyses={analyses}
              crmRecords={crmRecords}
              crmMetrics={crmMetrics}
              businessInsights={businessInsights}
              dailyActions={dailyActions}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsWorkspace
              configStatus={configStatus}
              onRefreshStatus={fetchStatusAndHistory}
            />
          )}
        </main>

        {/* 3. MAC-STYLE DOCK NAVIGATION */}
        <MacDock
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          leadsCount={displayBusinesses.length}
          demosCount={displayBusinesses.filter((b) => {
            const crm = crmRecords[b.id] || crmRecords[b.external_id];
            return Boolean(crm?.demoGenerated || crm?.demoShared);
          }).length}
        />
      </div>

      {/* 4. CONTROLLED GLASS MODALS & OVERLAYS (Zero Page Jumps) */}
      {selectedLead && isModalOpen && (
        <LeadAnalysisModal
          business={selectedLead}
          analysis={analyses[selectedLead.id] || analyses[selectedLead.external_id] || null}
          isLoading={isAnalyzingSingle}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedLead(null);
          }}
          onAnalyze={handleSelectLead}
        />
      )}

      {outreachLead && isOutreachOpen && (
        <OutreachCenterModal
          business={outreachLead}
          analysis={analyses[outreachLead.id] || analyses[outreachLead.external_id] || null}
          crmRecord={
            crmRecords[outreachLead.id] ||
            crmRecords[outreachLead.external_id] ||
            ({
              businessId: outreachLead.id || outreachLead.external_id,
              stage: 'NEW',
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
            } as LeadCrmRecord)
          }
          onClose={() => {
            setIsOutreachOpen(false);
            setOutreachLead(null);
          }}
          onUpdateCrm={handleUpdateCrm}
        />
      )}

      {isApiKeyModalOpen && (
        <ApiKeyModal
          isOpen={isApiKeyModalOpen}
          onClose={() => setIsApiKeyModalOpen(false)}
          configStatus={configStatus}
          onKeyUpdated={fetchStatusAndHistory}
        />
      )}
    </div>
  );
}
