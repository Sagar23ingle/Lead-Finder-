/**
 * Demo Templates Definition & Engine
 * Provides 4 distinct, high-quality, professional website layouts:
 * 1. modern_studio: Architectural & Minimalist Design Studio
 * 2. luxury_dark: Obsidian Glassmorphism & High-End Dark VIP
 * 3. corporate_clean: High-Conversion Commercial & Trust-First Agency
 * 4. creative_boutique: Editorial Visual Showcase & Artisanal Boutique
 */

export type DemoTemplateId = 'modern_studio' | 'luxury_dark' | 'corporate_clean' | 'creative_boutique';

export interface TemplateMeta {
  id: DemoTemplateId;
  name: string;
  badge: string;
  description: string;
  themeStyle: string;
  palette: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    accent: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    tagBg: string;
    tagText: string;
  };
}

export const DEMO_TEMPLATES: Record<DemoTemplateId, TemplateMeta> = {
  modern_studio: {
    id: 'modern_studio',
    name: 'Modern Studio',
    badge: 'Architectural Minimalist',
    description: 'Clean Scandinavian editorial layout with warm stone accents, asymmetric typography, and high-end design appeal.',
    themeStyle: 'Minimalist & Editorial',
    palette: {
      primary: '#d97706',
      secondary: '#b45309',
      background: '#0d1117',
      surface: '#161b22',
      accent: '#f59e0b',
      border: 'rgba(245, 158, 11, 0.25)',
      textPrimary: '#f8fafc',
      textSecondary: '#94a3b8',
      tagBg: 'rgba(217, 119, 6, 0.15)',
      tagText: '#fbbf24',
    },
  },
  luxury_dark: {
    id: 'luxury_dark',
    name: 'Luxury Dark',
    badge: 'Obsidian Glassmorphism',
    description: 'Deep obsidian dark mode with frosted glassmorphism cards, glowing cyan-emerald accents, and VIP exclusivity feel.',
    themeStyle: 'Obsidian Glass & VIP Glow',
    palette: {
      primary: '#06b6d4',
      secondary: '#0891b2',
      background: '#050811',
      surface: 'rgba(15, 23, 42, 0.75)',
      accent: '#10b981',
      border: 'rgba(6, 182, 212, 0.3)',
      textPrimary: '#ffffff',
      textSecondary: '#94a3b8',
      tagBg: 'rgba(6, 182, 212, 0.15)',
      tagText: '#67e8f9',
    },
  },
  corporate_clean: {
    id: 'corporate_clean',
    name: 'Corporate Clean',
    badge: 'High-Conversion Trust',
    description: 'Executive navy-and-white commercial layout with prominent trust badges, 3-step structured process, and conversion funnels.',
    themeStyle: 'Executive Corporate & High Trust',
    palette: {
      primary: '#2563eb',
      secondary: '#1d4ed8',
      background: '#090e1a',
      surface: '#0f172a',
      accent: '#3b82f6',
      border: 'rgba(59, 130, 246, 0.25)',
      textPrimary: '#f8fafc',
      textSecondary: '#cbd5e1',
      tagBg: 'rgba(37, 99, 235, 0.15)',
      tagText: '#93c5fd',
    },
  },
  creative_boutique: {
    id: 'creative_boutique',
    name: 'Creative Boutique',
    badge: 'Artisanal Visual Gallery',
    description: 'Warm sunset terracotta with full-width photography hero, visual masonry portfolio showcase, and boutique charm.',
    themeStyle: 'Warm Sunset & Visual Boutique',
    palette: {
      primary: '#f97316',
      secondary: '#ea580c',
      background: '#120d0b',
      surface: '#1c1512',
      accent: '#fb923c',
      border: 'rgba(249, 115, 22, 0.25)',
      textPrimary: '#fff7ed',
      textSecondary: '#fed7aa',
      tagBg: 'rgba(249, 115, 22, 0.15)',
      tagText: '#fdba74',
    },
  },
};

export const TEMPLATES_LIST: TemplateMeta[] = Object.values(DEMO_TEMPLATES);

/**
 * Deterministically assigns a distinct template to each business
 * Ensures every pitch and lead naturally receives a different design.
 */
export function getTemplateForBusiness(businessId: string, name?: string): DemoTemplateId {
  const str = (businessId + (name || '')).toLowerCase();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const keys: DemoTemplateId[] = ['modern_studio', 'luxury_dark', 'corporate_clean', 'creative_boutique'];
  const idx = Math.abs(hash) % keys.length;
  return keys[idx];
}
