// Run inside: frontend/
// src/components/gacha/AffiliationBiasSelector.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  type PackType,
  type BadgeShape,
  STANDARD_SHAPES,
  LOOT_PROJECTS,
} from '@/store/useShowcaseStore';
import { THEME } from './gachaTheme';
import { Shapes, Layers, ChevronDown } from 'lucide-react';

interface AffiliationBiasSelectorProps {
  activePackType: PackType;
  selectedShapeBias?: BadgeShape;
  selectedProjectBias?: string;
  onSelectShapeBias: (shape?: BadgeShape) => void;
  onSelectProjectBias: (project?: string) => void;
}

const formatLabel = (raw: string): string =>
  raw
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export default function AffiliationBiasSelector({
  activePackType,
  selectedShapeBias,
  selectedProjectBias,
  onSelectShapeBias,
  onSelectProjectBias,
}: AffiliationBiasSelectorProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const theme = THEME[activePackType];

  if (activePackType === 'explorer') {
    const totalShapes = STANDARD_SHAPES.length;
    const evenPct = (100 / totalShapes).toFixed(0);
    const otherPct = (50 / Math.max(1, totalShapes - 1)).toFixed(1);

    const oddsSummary = selectedShapeBias
      ? `50% ${formatLabel(selectedShapeBias)} · ${otherPct}% Other`
      : `Even ${evenPct}% Each`;

    return (
      <div className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 overflow-hidden shrink-0">
        {/* Clickable Accordion Header */}
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="w-full px-3 py-2.5 flex items-center justify-between gap-2 text-xs text-neutral-400 hover:bg-neutral-900/60 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5 font-semibold text-neutral-200 text-[11px] sm:text-xs shrink-0">
            <Shapes size={13} className={theme.text} />
            <span>Shape Bias</span>
          </span>

          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] sm:text-[11px] text-neutral-300 font-mono font-medium truncate">
              {oddsSummary}
            </span>
            <ChevronDown
              size={14}
              className={`text-neutral-500 shrink-0 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : 'rotate-0'
              }`}
            />
          </div>
        </button>

        {/* Collapsible Button Grid */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-2.5 sm:px-3 pb-2.5 sm:pb-3 pt-1 border-t border-neutral-800/70 grid grid-cols-5 gap-1.5 sm:gap-2 text-xs w-full">
                <button
                  type="button"
                  onClick={() => onSelectShapeBias(undefined)}
                  className={`py-1.5 px-1 flex flex-col items-center justify-center rounded-lg border transition-all cursor-pointer ${
                    !selectedShapeBias
                      ? theme.chipActive
                      : 'border-neutral-800 bg-neutral-900/80 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                  }`}
                >
                  <span className="font-bold text-[11px] sm:text-xs">None</span>
                  <span className="text-[9px] opacity-75 font-mono">Even</span>
                </button>

                {STANDARD_SHAPES.map((shape) => {
                  const isTarget = selectedShapeBias === shape;
                  const odds = selectedShapeBias
                    ? isTarget
                      ? '50.0%'
                      : `${otherPct}%`
                    : `${(100 / totalShapes).toFixed(1)}%`;

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
                      <span
                        className={`text-[9px] font-mono ${
                          isTarget ? theme.text : 'opacity-75'
                        }`}
                      >
                        {odds}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (activePackType === 'degen') {
    const totalProjects = LOOT_PROJECTS.length;
    const evenPct = (100 / totalProjects).toFixed(1);
    const otherPct = (50 / Math.max(1, totalProjects - 1)).toFixed(1);

    const oddsSummary = selectedProjectBias
      ? `50% ${formatLabel(selectedProjectBias)} · ${otherPct}% Other`
      : `Even ${evenPct}% Each`;

    return (
      <div className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 overflow-hidden shrink-0">
        {/* Clickable Accordion Header */}
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="w-full px-3 py-2.5 flex items-center justify-between gap-2 text-xs text-neutral-400 hover:bg-neutral-900/60 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5 font-semibold text-neutral-200 text-[11px] sm:text-xs shrink-0">
            <Layers size={13} className={theme.text} />
            <span>Project Bias</span>
          </span>

          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] sm:text-[11px] text-neutral-300 font-mono font-medium truncate">
              {oddsSummary}
            </span>
            <ChevronDown
              size={14}
              className={`text-neutral-500 shrink-0 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : 'rotate-0'
              }`}
            />
          </div>
        </button>

        {/* Collapsible Multi-Row Grid (Handles 8+ derivatives cleanly) */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-2.5 sm:px-3 pb-2.5 sm:pb-3 pt-1 border-t border-neutral-800/70 grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2 text-xs w-full">
                <button
                  type="button"
                  onClick={() => onSelectProjectBias(undefined)}
                  className={`py-1.5 px-1.5 flex flex-col items-center justify-center rounded-lg border transition-all cursor-pointer ${
                    !selectedProjectBias
                      ? theme.chipActive
                      : 'border-neutral-800 bg-neutral-900/80 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                  }`}
                >
                  <span className="font-bold text-[11px] sm:text-xs">None</span>
                  <span className="text-[9px] opacity-75 font-mono">Even</span>
                </button>

                {LOOT_PROJECTS.map((proj) => {
                  const isTarget = selectedProjectBias === proj;
                  const odds = selectedProjectBias
                    ? isTarget
                      ? '50.0%'
                      : `${otherPct}%`
                    : `${evenPct}%`;

                  return (
                    <button
                      type="button"
                      key={proj}
                      onClick={() => onSelectProjectBias(proj)}
                      className={`py-1.5 px-1.5 flex flex-col items-center justify-center rounded-lg border transition-all cursor-pointer ${
                        isTarget
                          ? theme.chipActive
                          : 'border-neutral-800 bg-neutral-900/80 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                      }`}
                    >
                      <span className="capitalize font-bold text-[11px] sm:text-xs truncate max-w-full">
                        {proj}
                      </span>
                      <span
                        className={`text-[9px] font-mono ${
                          isTarget ? theme.text : 'opacity-75'
                        }`}
                      >
                        {odds}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return null;
}