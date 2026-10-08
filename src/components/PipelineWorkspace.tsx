'use client';

import React from 'react';
import { Business, LeadAnalysis, LeadCrmRecord, PipelineStage } from '@/types';
import { CrmPipelineView } from './CrmPipelineView';
import { GitBranch, Plus, Search } from 'lucide-react';

interface PipelineWorkspaceProps {
  businesses: Business[];
  crmRecords: Record<string, LeadCrmRecord>;
  analyses: Record<string, LeadAnalysis>;
  onOpenOutreach: (business: Business) => void;
  onUpdateStage: (businessId: string, newStage: PipelineStage) => Promise<void>;
  onNavigateToTab: (tab: 'discover' | 'leads') => void;
}

export const PipelineWorkspace: React.FC<PipelineWorkspaceProps> = ({
  businesses,
  crmRecords,
  analyses,
  onOpenOutreach,
  onUpdateStage,
  onNavigateToTab,
}) => {
  return (
    <div className="pipeline-workspace">
      {/* Editorial Header */}
      <div className="workspace-hero compact">
        <div className="hero-text-block">
          <span className="hero-eyebrow">Deal Flow & Client Pipeline</span>
          <h1 className="hero-heading font-bodoni">Outreach Pipeline</h1>
          <p className="hero-description">
            Track prospective client relationships from initial qualification to pitch delivery and closing.
          </p>
        </div>
        <div className="hero-actions">
          <button
            type="button"
            onClick={() => onNavigateToTab('leads')}
            className="btn-ghost-sm"
          >
            <span>View All Leads</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateToTab('discover')}
            className="btn-premium-primary"
          >
            <Search size={14} />
            <span>Discover Leads</span>
          </button>
        </div>
      </div>

      {/* CRM Pipeline Kanban Container */}
      <div className="pipeline-kanban-container">
        {businesses.length === 0 ? (
          <div className="glass-card clean-empty-state">
            <div className="empty-state-icon">
              <GitBranch size={32} strokeWidth={1.5} />
            </div>
            <h2 className="empty-title font-bodoni">Pipeline is empty</h2>
            <p className="empty-desc">
              Discover and qualify businesses to automatically populate your outreach workflow.
            </p>
            <button
              type="button"
              onClick={() => onNavigateToTab('discover')}
              className="btn-premium-primary"
            >
              <Search size={15} />
              <span>Discover Leads</span>
            </button>
          </div>
        ) : (
          <CrmPipelineView
            businesses={businesses}
            crmRecords={crmRecords}
            analyses={analyses}
            onOpenOutreach={onOpenOutreach}
            onUpdateStage={onUpdateStage}
          />
        )}
      </div>
    </div>
  );
};
export default PipelineWorkspace;
