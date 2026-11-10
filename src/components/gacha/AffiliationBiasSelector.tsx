// Run inside: frontend/
// src/components/gacha/AffiliationBiasSelector.tsx

import React from 'react';
import {
  type PackType,
  type BadgeShape,
  STANDARD_SHAPES,
  LOOT_PROJECTS,
} from '@/store/useShowcaseStore';
import { THEME } from './gachaTheme';
import { Shapes, Layers } from 'lucide-react';

interface AffiliationBiasSelectorProps {
  activePackType: PackType;
  selectedShapeBias?: BadgeShape;
  selectedProjectBias?: string;
  onSelectShapeBias: (shape?: BadgeShape) => void;
  onSelectProjectBias: (project?: string) => void;
}

export default function AffiliationBiasSelector({
  activePackType,
  selectedShapeBias,
  selectedProjectBias,
  onSelectShapeBias,
  onSelectProjectBias,
}: AffiliationBiasSelectorProps) {
  const theme = THEME[activePackType];

  if (activePackType === 'explorer') {
    return (
      <div className="p-2.5 sm:p-3.5 rounded-xl border border-neutral-800 bg-neutral-950/60 flex flex-col gap-2">
        <div className="flex flex-col xs:flex-row xs:items-center justify-between text-xs text-neutral-400 gap-1">
          <span className="flex items-center gap-1.5 font-semibold text-neutral-300 text-[11px] sm:text-xs">
            <Shapes size={13} className={theme.text} />
            Shape Bias
          </span>
          <span className="text-[10px] sm:text-[11px] text-neutral-400 font-mono font-medium">
            {selectedShapeBias
              ? `50% ${selectedShapeBias.charAt(0).toUpperCase() + selectedShapeBias.slice(1)}`
              : 'Even 25% Each'}
          </span>
        </div>

        {/* 3 columns on mobile, 5 on desktop */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2 text-xs">
          <button
            type="button"
            onClick={() => onSelectShapeBias(undefined)}
            className={`py-1.5 px-1 flex flex-col items-center justify-center rounded-lg border transition-all cursor-pointer ${
              !selectedShapeBias
                ? theme.chipActive
                : 'border-neutral-800 bg-neutral-900/80 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
            }`}
          >
            <span className="capitalize font-bold text-[11px] sm:text-xs">None</span>
            <span className="text-[9px] opacity-75 font-mono">Even</span>
          </button>
          {STANDARD_SHAPES.map((shape) => {
            const isTarget = selectedShapeBias === shape;
            const odds = selectedShapeBias ? (isTarget ? '50.0%' : '16.7%') : '25.0%';

            return (
              <button
                type="button"
                key={shape}
                onClick={() => onSelectShapeBias(shape)}
                className={`py-1.5 px-1 flex flex-col items-center justify-center rounded-lg border transition-all cursor-pointer ${
                  isTarget
                    ? theme.chipActive
                    : 'border-neutral-800 bg-neutral-900/80 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                }`}
              >
                <span className="capitalize font-bold text-[11px] sm:text-xs truncate max-w-full">
                  {shape}
                </span>
                <span className={`text-[9px] font-mono ${isTarget ? theme.text : 'opacity-75'}`}>
                  {odds}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (activePackType === 'degen') {
    return (
      <div className="p-2.5 sm:p-3.5 rounded-xl border border-neutral-800 bg-neutral-950/60 flex flex-col gap-2">
        <div className="flex flex-col xs:flex-row xs:items-center justify-between text-xs text-neutral-400 gap-1">
          <span className="flex items-center gap-1.5 font-semibold text-neutral-300 text-[11px] sm:text-xs">
            <Layers size={13} className={theme.text} />
            Project Bias
          </span>
          <span className="text-[10px] sm:text-[11px] text-neutral-400 font-mono font-medium">
            {selectedProjectBias
              ? `50% ${selectedProjectBias.charAt(0).toUpperCase() + selectedProjectBias.slice(1)}`
              : 'Even 20% Each'}
          </span>
        </div>

        {/* 3 columns on mobile, 6 on desktop */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2 text-xs">
          <button
            type="button"
            onClick={() => onSelectProjectBias(undefined)}
            className={`py-1.5 px-1 flex flex-col items-center justify-center rounded-lg border transition-all cursor-pointer ${
              !selectedProjectBias
                ? theme.chipActive
                : 'border-neutral-800 bg-neutral-900/80 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
            }`}
          >
            <span className="capitalize font-bold text-[11px] sm:text-xs">None</span>
            <span className="text-[9px] opacity-75 font-mono">Even</span>
          </button>
          {LOOT_PROJECTS.map((proj) => {
            const isTarget = selectedProjectBias === proj;
            const odds = selectedProjectBias ? (isTarget ? '50.0%' : '12.5%') : '20.0%';

            return (
              <button
                type="button"
                key={proj}
                onClick={() => onSelectProjectBias(proj)}
                className={`py-1.5 px-1 flex flex-col items-center justify-center rounded-lg border transition-all cursor-pointer ${
                  isTarget
                    ? theme.chipActive
                    : 'border-neutral-800 bg-neutral-900/80 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                }`}
              >
                <span className="capitalize font-bold text-[11px] sm:text-xs truncate max-w-full">
                  {proj}
                </span>
                <span className={`text-[9px] font-mono ${isTarget ? theme.text : 'opacity-75'}`}>
                  {odds}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}