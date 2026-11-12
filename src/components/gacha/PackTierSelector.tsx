// Run inside: frontend/
// src/components/gacha/PackTierSelector.tsx

import React from 'react';
import { type PackType, PACK_CONFIGS } from '@/store/useShowcaseStore';
import { THEME } from './gachaTheme';

interface PackTierSelectorProps {
  activePackType: PackType;
  unopenedPacks: Record<PackType, number>;
  onSelectPack: (pack: PackType) => void;
}

const PACK_ORDER: PackType[] = ['explorer', 'adventurer', 'degen'];

export default function PackTierSelector({
  activePackType,
  unopenedPacks,
  onSelectPack,
}: PackTierSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full max-w-xl mx-auto pt-2 px-1.5 shrink-0">
      {PACK_ORDER.map((packType) => {
        const isActive = activePackType === packType;
        const theme = THEME[packType];
        const config = PACK_CONFIGS[packType];
        const count = unopenedPacks[packType] || 0;

        return (
          <button
            key={packType}
            type="button"
            onClick={() => onSelectPack(packType)}
            className={`relative overflow-visible min-h-[48px] sm:min-h-[52px] px-2.5 sm:px-3 py-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
              isActive
                ? `${theme.border} bg-neutral-900 shadow-md ring-1 ${theme.ring}`
                : 'border-neutral-800 bg-neutral-900/70 hover:bg-neutral-800/80 hover:border-neutral-700'
            }`}
          >
            {/* Duplicate-Style Corner Counter Pill */}
            <span
              className={`absolute -top-2 -right-1.5 text-xs font-mono font-extrabold px-1.5 py-0.5 rounded-full border shadow-md z-10 leading-none ${
                isActive
                  ? theme.badge
                  : 'bg-neutral-950 border-neutral-700/80 text-neutral-400'
              }`}
            >
              x{count}
            </span>

            {/* Centered Pack Label Inheriting Pack Color */}
            <span
              className={`text-center text-xs sm:text-[13px] font-extrabold leading-tight tracking-wide ${
                isActive ? theme.text : 'text-neutral-300'
              }`}
            >
              {config.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}