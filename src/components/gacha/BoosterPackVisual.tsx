// Run inside: frontend/
// src/components/gacha/BoosterPackVisual.tsx

import React from 'react';
import { Sparkles } from 'lucide-react';
import { type PackType } from '@/store/useShowcaseStore';

interface BoosterPackVisualProps {
  packType: PackType;
  size?: 'sm' | 'lg';
  count?: number;
  dimmed?: boolean;
  onClick?: () => void;
}

const PACK_VISUALS: Record<
  PackType,
  {
    title: string;
    gradient: string;
    accent: string;
    glow: string;
    badge: string;
  }
> = {
  explorer: {
    title: 'Explorer',
    gradient: 'from-emerald-950 via-emerald-800 to-teal-950',
    accent: '#10b981',
    glow: 'rgba(16, 185, 129, 0.35)',
    badge: 'text-emerald-300 bg-emerald-950/95 border-emerald-600/80',
  },
  adventurer: {
    title: 'Adventurer',
    gradient: 'from-blue-950 via-blue-800 to-indigo-950',
    accent: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.35)',
    badge: 'text-blue-300 bg-blue-950/95 border-blue-600/80',
  },
  degen: {
    title: 'Degen',
    gradient: 'from-purple-950 via-purple-800 to-fuchsia-950',
    accent: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.35)',
    badge: 'text-purple-300 bg-purple-950/95 border-purple-600/80',
  },
};

export default function BoosterPackVisual({
  packType,
  size = 'lg',
  count,
  dimmed = false,
  onClick,
}: BoosterPackVisualProps) {
  const packVis = PACK_VISUALS[packType];
  const isSmall = size === 'sm';

  return (
    <div
      onClick={onClick}
      className={`relative select-none shrink-0 ${
        isSmall ? 'w-14 h-[76px] sm:w-16 sm:h-[86px]' : 'w-36 h-52 sm:w-44 sm:h-60'
      } ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
    >
      {/* Optional Corner Stash Pill (Used in Packs Inventory) */}
      {typeof count === 'number' && (
        <span
          className={`absolute -top-2 -right-2 z-20 font-mono font-extrabold leading-none rounded-full border shadow-md ${
            isSmall ? 'text-[11px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
          } ${
            count > 0
              ? packVis.badge
              : 'bg-neutral-950 border-neutral-700/80 text-neutral-400'
          }`}
        >
          x{count}
        </span>
      )}

      {/* Foil Wrapper Body (Exact match to original UnsealAltar pack styling) */}
      <div
        className={`relative w-full h-full border border-white/10 flex flex-col items-center justify-between overflow-hidden transition-opacity ${
          isSmall ? 'rounded-xl p-1 shadow-lg' : 'rounded-2xl p-2 shadow-2xl'
        } ${dimmed ? 'opacity-65' : 'opacity-100'}`}
        style={{
          boxShadow: dimmed
            ? 'none'
            : `0 0 ${isSmall ? '14px' : '28px'} ${packVis.glow}`,
        }}
      >
        <div className={`absolute inset-0 bg-gradient-to-b ${packVis.gradient} opacity-95`} />

        {/* Crimped Top Edge */}
        <div
          className={`relative z-10 w-full border-b border-black/40 flex items-center justify-center opacity-70 ${
            isSmall ? 'h-1.5' : 'h-3 sm:h-3.5'
          }`}
        >
          <div className="w-full h-0.5 border-t border-dashed border-white/40" />
        </div>

        {/* Center Crest */}
        <div className="relative z-10 flex flex-col items-center my-auto">
          <div
            className={`border border-white/20 bg-black/50 flex items-center justify-center shadow-inner ${
              isSmall
                ? 'w-7 h-7 sm:w-8 sm:h-8 rounded-lg'
                : 'w-12 h-12 sm:w-14 sm:h-14 rounded-xl mb-1.5'
            }`}
            style={{ borderColor: packVis.accent }}
          >
            <Sparkles
              className={isSmall ? 'w-3.5 h-3.5 sm:w-4 sm:h-4' : 'w-6 h-6 sm:w-7 sm:h-7'}
              style={{ color: packVis.accent }}
            />
          </div>

          {!isSmall && (
            <>
              <span className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-neutral-100">
                {packVis.title}
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-neutral-400">
                5 SEALS
              </span>
            </>
          )}
        </div>

        {/* Crimped Bottom Edge */}
        <div
          className={`relative z-10 w-full border-t border-black/40 flex items-center justify-center opacity-70 ${
            isSmall ? 'h-1.5' : 'h-3 sm:h-3.5'
          }`}
        >
          <div className="w-full h-0.5 border-b border-dashed border-white/40" />
        </div>
      </div>
    </div>
  );
}