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

const PACK_TYPES: PackType[] = ['explorer', 'adventurer', 'degen'];

export default function PackTierSelector({
  activePackType,
  unopenedPacks,
  onSelectPack,
}: PackTierSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-1.5 sm:gap-3 w-full">
      {PACK_TYPES.map((type) => {
        const count = unopenedPacks[type] || 0;
        const isSelected = activePackType === type;
        const packTheme = THEME[type];
        const cleanName = type.charAt(0).toUpperCase() + type.slice(1);

        return (
          <button
            key={type}
            type="button"
            onClick={() => onSelectPack(type)}
            className={`py-2 px-1.5 sm:py-2.5 sm:px-3 rounded-xl border flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-1 sm:gap-2 transition-all cursor-pointer min-w-0 ${
              isSelected
                ? `${packTheme.border} bg-neutral-900 shadow-md ring-1 ${packTheme.ring}`
                : 'border-neutral-800 bg-neutral-950/80 hover:bg-neutral-900/60'
            }`}
          >
            <span className="font-bold text-[11px] sm:text-xs text-neutral-200 truncate w-full text-center sm:text-left">
              {cleanName}
              <span className="hidden sm:inline"> Pack</span>
            </span>
            <span className={`text-[9px] sm:text-[10px] font-mono px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full border shrink-0 ${packTheme.badge}`}>
              x{count}
            </span>
          </button>
        );
      })}
    </div>
  );
}