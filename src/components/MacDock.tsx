'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Compass,
  Users,
  GitBranch,
  Globe,
  BarChart3,
  Sliders,
} from 'lucide-react';

export type DockTabId =
  | 'overview'
  | 'discover'
  | 'leads'
  | 'pipeline'
  | 'demos'
  | 'analytics'
  | 'settings';

interface DockItemConfig {
  id: DockTabId;
  label: string;
  icon: React.ReactNode;
  badge?: number | string | null;
}

interface MacDockProps {
  activeTab: DockTabId;
  onSelectTab: (tab: DockTabId) => void;
  leadsCount?: number;
  demosCount?: number;
}

export const MacDock: React.FC<MacDockProps> = ({
  activeTab,
  onSelectTab,
  leadsCount,
  demosCount,
}) => {
  const [hoveredTab, setHoveredTab] = useState<DockTabId | null>(null);

  const items: DockItemConfig[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard size={20} strokeWidth={1.8} />,
    },
    {
      id: 'discover',
      label: 'Discover',
      icon: <Compass size={20} strokeWidth={1.8} />,
    },
    {
      id: 'leads',
      label: 'Leads',
      icon: <Users size={20} strokeWidth={1.8} />,
      badge: leadsCount && leadsCount > 0 ? leadsCount : null,
    },
    {
      id: 'pipeline',
      label: 'Pipeline',
      icon: <GitBranch size={20} strokeWidth={1.8} />,
    },
    {
      id: 'demos',
      label: 'Demos',
      icon: <Globe size={20} strokeWidth={1.8} />,
      badge: demosCount && demosCount > 0 ? demosCount : null,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 size={20} strokeWidth={1.8} />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Sliders size={20} strokeWidth={1.8} />,
    },
  ];

  return (
    <nav
      className="mac-dock-container"
      aria-label="Mac-Style Application Navigation"
      role="navigation"
    >
      <div className="mac-dock-surface">
        {items.map((item, index) => {
          const isActive = activeTab === item.id;
          const isHovered = hoveredTab === item.id;

          return (
            <div
              key={item.id}
              className="mac-dock-item-wrapper"
              onMouseEnter={() => setHoveredTab(item.id)}
              onMouseLeave={() => setHoveredTab(null)}
              onTouchStart={() => setHoveredTab(null)}
            >
              {/* Tooltip Label */}
              <div
                className={`mac-dock-tooltip ${isHovered ? 'visible' : ''}`}
                aria-hidden={!isHovered}
              >
                <span className="mac-dock-tooltip-text">{item.label}</span>
                <span className="mac-dock-tooltip-arrow" />
              </div>

              {/* Dock Icon Button */}
              <button
                type="button"
                onClick={() => {
                  setHoveredTab(null);
                  onSelectTab(item.id);
                }}
                className={`mac-dock-btn ${isActive ? 'active' : ''} ${
                  isHovered ? 'hovered' : ''
                }`}
                aria-label={`Navigate to ${item.label}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="mac-dock-icon-inner">{item.icon}</div>

                {/* Optional Badge */}
                {item.badge !== null && item.badge !== undefined && (
                  <span className="mac-dock-badge">
                    {typeof item.badge === 'number' && item.badge > 99
                      ? '99+'
                      : item.badge}
                  </span>
                )}

                {/* Active Indicator Dot */}
                {isActive && <span className="mac-dock-active-dot" />}
              </button>
            </div>
          );
        })}
      </div>
    </nav>
  );
};
export default MacDock;
