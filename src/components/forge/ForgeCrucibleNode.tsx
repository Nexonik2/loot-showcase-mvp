// Run inside: frontend/
// src/components/forge/ForgeCrucibleNode.tsx

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Badge, BadgeShape } from '@/store/useShowcaseStore';
import type { RecipeValidationResult } from '@/lib/forgeHeuristics';
import { getTierTheme } from '@/lib/theme';
import BadgeCard from '@/components/BadgeCard';
import InkDrop from '@/components/ui/InkDrop';
import {
  Circle,
  Square,
  Triangle,
  Hexagon,
  Star,
  AlertCircle,
  Sparkles,
  Anvil,
  X,
} from 'lucide-react';

interface ForgeCrucibleNodeProps {
  validation: RecipeValidationResult;
  slottedCount: number;
  mintedResults?: Badge[];
  inkSaved?: number;
  onClearResults?: () => void;
}

const renderShapeMiniIcon = (shape: BadgeShape) => {
  switch (shape) {
    case 'circle':
      return <Circle size={10} className="stroke-[2.5]" />;
    case 'square':
      return <Square size={10} className="stroke-[2.5]" />;
    case 'triangle':
      return <Triangle size={10} className="stroke-[2.5]" />;
    case 'wildcard':
      return <Star size={10} className="fill-current stroke-[1.5]" />;
    case 'hexagon':
    default:
      return <Hexagon size={10} className="stroke-[2.5]" />;
  }
};

export default function ForgeCrucibleNode({
  validation,
  slottedCount,
  mintedResults = [],
  inkSaved = 0,
  onClearResults,
}: ForgeCrucibleNodeProps) {
  const targetTheme = validation.targetTier ? getTierTheme(validation.targetTier) : null;

  // Group batch-crafted results into xN stacks
  const stackedMinted = useMemo(() => {
    const map = new Map<string, { badge: Badge; count: number }>();
    for (const b of mintedResults) {
      const key = `${b.tier}-${b.projectId}-${b.shape}`;
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(key, { badge: b, count: 1 });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.badge.tier - b.badge.tier);
  }, [mintedResults]);

  return (
    <div className="w-full max-w-xl mx-auto my-0.5">
      <AnimatePresence mode="wait">
        {slottedCount === 0 && stackedMinted.length > 0 ? (
          <motion.div
            key="outcome"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="relative p-3 sm:p-3.5 rounded-xl border border-emerald-500/60 bg-neutral-900/95 shadow-[0_0_20px_rgba(16,185,129,0.2)] flex flex-col gap-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles size={15} className="text-emerald-400 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 truncate">
                  Forging Complete ({mintedResults.length}{' '}
                  {mintedResults.length === 1 ? 'Badge' : 'Badges'})
                </span>
                {inkSaved > 0 && (
                  <span className="px-2 py-0.5 rounded-full border border-emerald-700/60 bg-emerald-950/60 text-emerald-300 text-[10px] font-mono font-bold whitespace-nowrap shrink-0">
                    Saved {Math.round(inkSaved).toLocaleString()} <InkDrop />
                  </span>
                )}
              </div>

              {onClearResults && (
                <button
                  type="button"
                  aria-label="Dismiss forged outcome"
                  onClick={onClearResults}
                  className="w-7 h-7 rounded-full border border-red-900/60 bg-red-950/40 text-red-300 hover:border-red-600 hover:bg-red-900/60 hover:text-white flex items-center justify-center shrink-0 aspect-square transition-all active:scale-95 cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2.5 pb-1 px-2 max-h-48 overflow-y-auto custom-scrollbar">
              {stackedMinted.map(({ badge, count }) => (
                <div
                  key={`${badge.tier}-${badge.projectId}-${badge.shape}`}
                  className="relative w-20 sm:w-24 shrink-0"
                >
                  <BadgeCard
                    tier={badge.tier}
                    projectId={badge.projectId}
                    shape={badge.shape}
                  />
                  {count > 1 && (
                    <span className="absolute -top-2 -right-1.5 z-20 px-1.5 py-0.5 rounded-full bg-neutral-900/95 border border-neutral-700 text-neutral-200 text-[10px] font-mono font-bold leading-none shadow-md">
                      x{count}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ) : slottedCount === 3 && validation.valid && targetTheme ? (
          <motion.div
            key="valid"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className={`relative p-3.5 rounded-xl border bg-neutral-900/90 shadow-md ${targetTheme.border}`}
          >
            {/* Target Tier Header */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center shrink-0">
                <Sparkles size={15} className={targetTheme.text} />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-neutral-400 block leading-tight">
                  Projected Output
                </span>
                <span className={`text-xs font-bold uppercase tracking-wider ${targetTheme.text}`}>
                  {targetTheme.label}
                </span>
              </div>
            </div>

            {/* Project & Shape Outcome Odds */}
            {(validation.projectOdds || validation.shapeOdds) && (
              <div className="mt-2.5 pt-2.5 border-t border-neutral-800/70 flex flex-col gap-1.5 text-[11px]">
                {validation.projectOdds && validation.projectOdds.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="w-16 shrink-0 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                      Project:
                    </span>
                    {validation.projectOdds.map((p) => (
                      <span
                        key={p.project}
                        className="px-2 py-0.5 rounded-md border border-neutral-800 bg-neutral-950/90 text-neutral-200 font-mono font-semibold capitalize"
                      >
                        {p.project} <strong>{p.percentage}%</strong>
                      </span>
                    ))}
                  </div>
                )}

                {validation.shapeOdds && validation.shapeOdds.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="w-16 shrink-0 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                      Shape Odds:
                    </span>
                    {validation.shapeOdds.map((s) => (
                      <span
                        key={s.shape}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-neutral-800 bg-neutral-950/90 text-neutral-200 font-mono font-semibold capitalize"
                      >
                        {renderShapeMiniIcon(s.shape)}
                        <span>{s.shape}</span>
                        <strong>{s.percentage}%</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Single-Line Craft Cost Positioned Below Outcome Data */}
            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-neutral-800/80 text-xs">
              <span className="text-[10px] font-mono uppercase text-neutral-400">
                Craft Cost (per badge)
              </span>
              <span className="font-mono font-bold text-neutral-200 whitespace-nowrap">
                {Math.round(validation.cost || 0).toLocaleString()} <InkDrop />
              </span>
            </div>
          </motion.div>
        ) : slottedCount === 3 && !validation.valid ? (
          <motion.div
            key="invalid"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="p-3 rounded-xl border border-red-900/60 bg-red-950/20 text-red-300 text-xs flex items-start gap-2.5"
          >
            <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-snug">
              <span className="font-semibold block mb-0.5">Incompatible Altar Selection</span>
              <span className="text-[11px] text-red-400/90">{validation.reason}</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="p-3 rounded-xl border border-dashed border-neutral-800/80 bg-neutral-950/40 text-neutral-500 text-xs flex items-center justify-center gap-2.5"
          >
            <Anvil size={14} className="text-neutral-600 shrink-0" />
            <span className="text-[11px] font-mono">
              {slottedCount === 0
                ? 'Select 3 identical-tier badges from inventory to align recipe'
                : `Place ${3 - slottedCount} more matching-tier badge${
                    3 - slottedCount > 1 ? 's' : ''
                  } to preview output`}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}