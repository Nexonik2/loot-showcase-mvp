// Run inside: frontend/
// src/components/forge/ForgeCrucibleNode.tsx

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Badge, BadgeShape } from '@/store/useShowcaseStore';
import type { RecipeValidationResult } from '@/lib/forgeHeuristics';
import BadgeCard from '@/components/BadgeCard';
import {
  Circle,
  Square,
  Triangle,
  Hexagon,
  Star,
  AlertCircle,
  Sparkles,
  Anvil,
  Droplet,
  ArrowRight,
} from 'lucide-react';
import { getTierTheme } from '@/lib/theme';

interface ForgeCrucibleNodeProps {
  validation: RecipeValidationResult;
  slottedCount: number;
  mintedResults?: Badge[];
  inkSaved?: number;
  onClearResults?: () => void;
}

interface GroupedMintedBadge {
  key: string;
  badge: Badge;
  count: number;
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

  // Group batch-forged results by signature so large batches stay compact inline
  const groupedResults = useMemo<GroupedMintedBadge[]>(() => {
    if (mintedResults.length === 0) return [];
    const map = new Map<string, GroupedMintedBadge>();

    for (const badge of mintedResults) {
      const key = `${badge.tier}-${badge.projectId}-${badge.shape}`;
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(key, { key, badge, count: 1 });
      }
    }

    return Array.from(map.values()).sort((a, b) => a.badge.tier - b.badge.tier);
  }, [mintedResults]);

  const outcomeTheme =
    groupedResults.length > 0 ? getTierTheme(groupedResults[0].badge.tier) : null;

  return (
    <div className="w-full max-w-xl mx-auto my-0.5">
      <AnimatePresence mode="wait">
        {slottedCount === 3 && validation.valid && targetTheme ? (
          <motion.div
            key="valid"
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className={`relative p-3.5 rounded-xl border bg-neutral-900/90 shadow-md ${targetTheme.border}`}
            style={{ boxShadow: `0 0 16px ${targetTheme.glowColor}` }}
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
                  Tier {validation.targetTier} {targetTheme.label}
                </span>
              </div>
            </div>

            {/* Modular Odds: Project & Shape Distributions */}
            <div className="flex flex-col gap-2 mt-3 pt-2.5 border-t border-neutral-800/80">
              {validation.projectOdds && validation.projectOdds.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono uppercase text-neutral-500 shrink-0 min-w-[65px] sm:min-w-[70px]">
                    Project:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {validation.projectOdds.map(({ project, percentage }) => (
                      <span
                        key={project}
                        className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-mono font-medium px-1.5 sm:px-2 py-0.5 rounded-md bg-neutral-950/80 border border-neutral-800 text-neutral-300"
                      >
                        <span className="uppercase">{project}</span>
                        <strong className="text-white ml-0.5">{percentage}%</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {validation.shapeOdds && validation.shapeOdds.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono uppercase text-neutral-500 shrink-0 min-w-[65px] sm:min-w-[70px]">
                    Shape Odds:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {validation.shapeOdds.map(({ shape, percentage }) => (
                      <span
                        key={shape}
                        className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-mono font-medium px-1.5 sm:px-2 py-0.5 rounded-md bg-neutral-950/80 border border-neutral-800 text-neutral-300"
                      >
                        {renderShapeMiniIcon(shape)}
                        <span className="capitalize">{shape}</span>
                        <strong className="text-white ml-0.5">{percentage}%</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Ink Craft Cost Positioned Below Outcome Data */}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-800/80 text-xs">
              <span className="text-[10px] font-mono uppercase text-neutral-400 flex items-center gap-1">
                <Droplet size={11} className="text-emerald-400" />
                Craft Cost (per badge)
              </span>
              <span className="font-mono font-bold text-neutral-200">
                {Math.round(validation.cost || 0).toLocaleString()} Ink
              </span>
            </div>
          </motion.div>
        ) : slottedCount === 3 && !validation.valid ? (
          <motion.div
            key="invalid"
            layout
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
        ) : slottedCount === 0 && groupedResults.length > 0 && outcomeTheme ? (
          <motion.div
            key={`outcome-${mintedResults[0]?.id}`}
            layout
            initial={{ opacity: 0, scale: 0.94, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className={`relative p-3.5 sm:p-4 rounded-xl border bg-neutral-900/95 shadow-lg flex flex-col items-center text-center ${outcomeTheme.border}`}
            style={{ boxShadow: `0 0 22px ${outcomeTheme.glowColor}` }}
          >
            {/* Header Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/70 text-emerald-300 text-[10px] font-mono font-bold uppercase tracking-wider">
              <Sparkles size={11} className="text-emerald-400" />
              <span>
                Transmutation Complete · {mintedResults.length}{' '}
                {mintedResults.length === 1 ? 'Badge' : 'Badges'} Minted
              </span>
            </div>

            {/* 15% Ink Retention Banner */}
            {inkSaved > 0 && (
              <div className="mt-2 px-2.5 py-1 rounded-md bg-amber-950/50 border border-amber-800/70 text-amber-300 text-[11px] font-mono flex items-center gap-1.5">
                <Droplet size={12} className="text-amber-400 shrink-0" />
                <span>
                  <strong>15% Ink Retention!</strong> Saved {inkSaved.toLocaleString()} Ink
                </span>
              </div>
            )}

            {/* Inline Forged Badge Card(s): Extra top/side headroom prevents ×N pill clipping */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-3.5 my-2.5 pt-2.5 pb-1.5 px-2 w-full max-h-48 overflow-y-auto custom-scrollbar">
              {groupedResults.map((group, idx) => (
                <motion.div
                  key={group.key}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05, type: 'spring', stiffness: 300, damping: 22 }}
                  className={`relative aspect-[3/4] shrink-0 ${
                    groupedResults.length === 1
                      ? 'w-20 sm:w-24'
                      : groupedResults.length <= 4
                      ? 'w-[72px] sm:w-20'
                      : 'w-16 sm:w-[72px]'
                  }`}
                >
                  <BadgeCard
                    tier={group.badge.tier}
                    projectId={group.badge.projectId}
                    shape={group.badge.shape}
                  />
                  {group.count > 1 && (
                    <span className="absolute -top-2 -right-1.5 px-1.5 py-0.5 rounded-full bg-neutral-950 border border-emerald-500/80 text-emerald-300 text-[11px] font-mono font-extrabold leading-none shadow-md z-10">
                      ×{group.count}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Mobile-Friendly Next Action Button */}
            {onClearResults && (
              <button
                type="button"
                onClick={onClearResults}
                className="w-full max-w-[220px] h-9 rounded-xl bg-neutral-800/90 hover:bg-neutral-700/90 active:scale-95 border border-neutral-700/80 text-xs font-semibold text-neutral-100 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <span>Next</span>
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="p-3 rounded-xl border border-dashed border-neutral-800/80 bg-neutral-950/40 text-neutral-500 text-xs flex items-center justify-center gap-2.5"
          >
            <Anvil size={14} className="text-neutral-600" />
            <span className="text-[11px] font-mono">
              {slottedCount === 0
                ? 'Select 3 identical-tier badges from inventory to align recipe'
                : `Place ${3 - slottedCount} more matching-tier badge${3 - slottedCount > 1 ? 's' : ''} to preview output`}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}