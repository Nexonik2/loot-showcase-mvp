import { type PackType, type BadgeShape } from '@/store/useShowcaseStore';

export interface PackThemeTokens {
  text: string;
  border: string;
  borderMuted: string;
  bgMuted: string;
  btn: string;
  ring: string;
  chipActive: string;
  icon: string;
  badge: string;
  stepperBtn: string;
  maxBtn: string;
}

export interface TierThemeTokens {
  label: string;
  active: string;
  muted: string;
  glow: string;
  text: string;
  border: string;
  bgSubtle: string;
  stroke: string;
  glowColor: string;
  ring: string;
}

export interface ShapeThemeTokens {
  label: string;
  iconClass: string;
}

/**
 * Composite UI themes for pack variants (Gacha shrine, Depot, inventory cards).
 */
export const PACK_THEMES: Record<PackType, PackThemeTokens> = {
  explorer: {
    text: 'text-emerald-400',
    border: 'border-emerald-500',
    borderMuted: 'border-emerald-900/60',
    bgMuted: 'bg-emerald-950/20',
    btn: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/60 hover:shadow-emerald-500/20',
    ring: 'ring-emerald-500/30',
    chipActive: 'border-emerald-500 text-emerald-300 bg-emerald-950/60 ring-1 ring-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
    icon: 'text-emerald-400',
    badge: 'text-emerald-400 bg-emerald-950/80 border-emerald-800',
    stepperBtn: 'border-emerald-700/60 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 hover:border-emerald-400 hover:text-white hover:shadow-[0_0_12px_rgba(16,185,129,0.3)]',
    maxBtn: 'border-emerald-500 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500 hover:text-white hover:shadow-[0_0_16px_rgba(16,185,129,0.4)]',
  },
  adventurer: {
    text: 'text-blue-400',
    border: 'border-blue-500',
    borderMuted: 'border-blue-900/60',
    bgMuted: 'bg-blue-950/20',
    btn: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-950/60 hover:shadow-blue-500/20',
    ring: 'ring-blue-500/30',
    chipActive: 'border-blue-500 text-blue-300 bg-blue-950/60 ring-1 ring-blue-500/40 shadow-[0_0_10px_rgba(59,130,246,0.2)]',
    icon: 'text-blue-400',
    badge: 'text-blue-400 bg-blue-950/80 border-blue-800',
    stepperBtn: 'border-blue-700/60 bg-blue-950/40 text-blue-300 hover:bg-blue-900/60 hover:border-blue-400 hover:text-white hover:shadow-[0_0_12px_rgba(59,130,246,0.3)]',
    maxBtn: 'border-blue-500 bg-blue-500/20 text-blue-200 hover:bg-blue-500 hover:text-white hover:shadow-[0_0_16px_rgba(59,130,246,0.4)]',
  },
  degen: {
    text: 'text-purple-400',
    border: 'border-purple-500',
    borderMuted: 'border-purple-900/60',
    bgMuted: 'bg-purple-950/20',
    btn: 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-950/60 hover:shadow-purple-500/20',
    ring: 'ring-purple-500/30',
    chipActive: 'border-purple-500 text-purple-300 bg-purple-950/60 ring-1 ring-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]',
    icon: 'text-purple-400',
    badge: 'text-purple-400 bg-purple-950/80 border-purple-800',
    stepperBtn: 'border-purple-700/60 bg-purple-950/40 text-purple-300 hover:bg-purple-900/60 hover:border-purple-400 hover:text-white hover:shadow-[0_0_12px_rgba(168,85,247,0.3)]',
    maxBtn: 'border-purple-500 bg-purple-500/20 text-purple-200 hover:bg-purple-500 hover:text-white hover:shadow-[0_0_16px_rgba(168,85,247,0.4)]',
  },
};

/**
 * Composite UI themes for badge rarity tiers (T1 Legendary through T5 Common).
 */
export const TIER_THEMES: Record<number, TierThemeTokens> = {
  1: {
    label: 'Legendary',
    active: 'text-yellow-400 border-yellow-400/50 bg-yellow-400/10 shadow-yellow-400/20',
    muted: 'text-yellow-400/60 border-yellow-500/25 bg-yellow-950/15 shadow-none',
    glow: 'shadow-[0_0_20px_rgba(250,204,21,0.35)]',
    text: 'text-yellow-400',
    border: 'border-yellow-400/50',
    bgSubtle: 'bg-yellow-400/10',
    stroke: '#facc15',
    glowColor: 'rgba(250, 204, 21, 0.45)',
    ring: 'border-yellow-500/60 ring-yellow-500/30',
  },
  2: {
    label: 'Epic',
    active: 'text-purple-400 border-purple-400/50 bg-purple-400/10 shadow-purple-400/20',
    muted: 'text-purple-400/60 border-purple-500/25 bg-purple-950/15 shadow-none',
    glow: 'shadow-[0_0_20px_rgba(192,132,252,0.35)]',
    text: 'text-purple-400',
    border: 'border-purple-400/50',
    bgSubtle: 'bg-purple-400/10',
    stroke: '#c084fc',
    glowColor: 'rgba(192, 132, 252, 0.45)',
    ring: 'border-purple-500/60 ring-purple-500/30',
  },
  3: {
    label: 'Rare',
    active: 'text-blue-400 border-blue-400/50 bg-blue-400/10 shadow-blue-400/20',
    muted: 'text-blue-400/60 border-blue-500/25 bg-blue-950/15 shadow-none',
    glow: 'shadow-[0_0_20px_rgba(96,165,250,0.35)]',
    text: 'text-blue-400',
    border: 'border-blue-400/50',
    bgSubtle: 'bg-blue-400/10',
    stroke: '#60a5fa',
    glowColor: 'rgba(96, 165, 250, 0.45)',
    ring: 'border-blue-500/60 ring-blue-500/30',
  },
  4: {
    label: 'Uncommon',
    active: 'text-emerald-400 border-emerald-400/50 bg-emerald-400/10 shadow-emerald-400/20',
    muted: 'text-emerald-400/60 border-emerald-500/25 bg-emerald-950/15 shadow-none',
    glow: 'shadow-[0_0_20px_rgba(52,211,153,0.35)]',
    text: 'text-emerald-400',
    border: 'border-emerald-400/50',
    bgSubtle: 'bg-emerald-400/10',
    stroke: '#34d399',
    glowColor: 'rgba(52, 211, 153, 0.45)',
    ring: 'border-emerald-500/60 ring-emerald-500/30',
  },
  5: {
    label: 'Common',
    active: 'text-neutral-400 border-neutral-700 bg-neutral-800/50 shadow-none',
    muted: 'text-neutral-500 border-neutral-800/80 bg-neutral-950/40 shadow-none',
    glow: 'shadow-none',
    text: 'text-neutral-400',
    border: 'border-neutral-700',
    bgSubtle: 'bg-neutral-800/50',
    stroke: '#a3a3a3',
    glowColor: 'rgba(163, 163, 163, 0.35)',
    ring: 'border-neutral-600/60 ring-neutral-500/20',
  },
};

export const SHAPE_THEMES: Record<BadgeShape, ShapeThemeTokens> = {
  circle: { label: 'Circle', iconClass: 'w-8 h-8 mb-2 opacity-80' },
  square: { label: 'Square', iconClass: 'w-8 h-8 mb-2 opacity-80' },
  triangle: { label: 'Triangle', iconClass: 'w-8 h-8 mb-2 opacity-80' },
  hexagon: { label: 'Hexagon', iconClass: 'w-8 h-8 mb-2 opacity-80' },
  wildcard: { label: 'Wildcard', iconClass: 'w-8 h-8 mb-2 fill-current opacity-90 animate-pulse' },
};

export const getTierTheme = (tier: number): TierThemeTokens => {
  return TIER_THEMES[tier] || TIER_THEMES[5];
};

export const getPackTheme = (pack: PackType): PackThemeTokens => {
  return PACK_THEMES[pack] || PACK_THEMES.explorer;
};