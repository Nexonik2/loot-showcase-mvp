// Run inside: frontend/
// src/components/dashboard/ShowcaseView.tsx

import React, { useMemo, useState } from 'react';
import BadgeCard from '@/components/BadgeCard';
import WorkbenchHelpBanner from './WorkbenchHelpBanner';
import ShowcaseConfirmCard, { type StagedSynergyPill } from './ShowcaseConfirmCard';
import { useShowcaseStore, INSCRIBE_SETTINGS } from '@/store/useShowcaseStore';
import {
  ADJACENCY_MAP,
  BASE_TIER_YIELDS,
  calculateShowcaseTotalYield,
  type SynergyType,
} from '@/lib/inscriptionYield';
import {
  Droplet,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

const SHOWCASE_HELP_BULLETS = [
  'Tap any of the 8 slots and select a badge from your inventory to inscribe it for daily bonus Ink.',
  'Inscribed badges are soulbound: overwriting an occupied slot permanently replaces the previous badge.',
  'Place matching Projects or Shapes next to each other (up/down/left/right) to boost both neighbors.',
];

const getSynergyStroke = (type: SynergyType): string => {
  switch (type) {
    case 'dual':
      return 'rgba(245, 158, 11, 0.9)';
    case 'project':
      return 'rgba(16, 185, 129, 0.9)';
    case 'shape':
      return 'rgba(139, 92, 246, 0.9)';
    default:
      return 'rgba(38, 38, 38, 0.35)';
  }
};

const getSynergyBadgeClass = (multiplier: number): string => {
  if (multiplier >= 2.0) return 'text-amber-300 border-amber-500/50 bg-amber-950/90';
  if (multiplier >= 1.5) return 'text-purple-300 border-purple-500/50 bg-purple-950/90';
  if (multiplier > 1.0) return 'text-emerald-300 border-emerald-500/50 bg-emerald-950/90';
  return 'text-neutral-400 border-neutral-800 bg-neutral-900/90';
};

export default function ShowcaseView() {
  const slots = useShowcaseStore((state) => state.slots);
  const inkBalance = useShowcaseStore((state) => state.inkBalance);
  const badges = useShowcaseStore((state) => state.badges);

  // Staging state from store
  const stagedSlotId = useShowcaseStore((state) => state.stagedSlotId);
  const stagedBadgeId = useShowcaseStore((state) => state.stagedBadgeId);
  const setStagedSlotId = useShowcaseStore((state) => state.setStagedSlotId);
  const confirmInscription = useShowcaseStore((state) => state.confirmInscription);
  const cancelInscription = useShowcaseStore((state) => state.cancelInscription);

  const [isBonusGuideOpen, setIsBonusGuideOpen] = useState(false);

  const yieldReport = useMemo(() => calculateShowcaseTotalYield(slots), [slots]);

  // Staged Badge & Cost Evaluations
  const stagedBadge = stagedBadgeId ? badges[stagedBadgeId] : null;
  const isStagedWildcard =
    stagedBadge?.projectId === 'wildcard' || stagedBadge?.shape === 'wildcard';
  const inscribeCost = stagedBadge ? INSCRIBE_SETTINGS.calculateCost(stagedBadge.tier) : 0;
  const baseYield = stagedBadge ? (BASE_TIER_YIELDS[stagedBadge.tier] ?? 0) : 0;
  const occupiedBadge = stagedSlotId ? slots[stagedSlotId] : null;
  const oldSlotYield = stagedSlotId ? (yieldReport.breakdown[stagedSlotId]?.slotYield ?? 0) : 0;

  // Full Simulated Report (when both a target slot and a valid badge are staged)
  const simulatedReport = useMemo(() => {
    if (!stagedSlotId || !stagedBadge || isStagedWildcard) return null;
    const hypotheticalSlots = { ...slots, [stagedSlotId]: stagedBadge };
    return calculateShowcaseTotalYield(hypotheticalSlots);
  }, [slots, stagedSlotId, stagedBadge, isStagedWildcard]);

  const simulatedYieldDelta = useMemo(() => {
    if (!simulatedReport) return null;
    return simulatedReport.totalYield - yieldReport.totalYield;
  }, [simulatedReport, yieldReport]);

  const thisSlotYield = useMemo(() => {
    if (!simulatedReport || !stagedSlotId) return null;
    return simulatedReport.breakdown[stagedSlotId]?.slotYield ?? null;
  }, [simulatedReport, stagedSlotId]);

  // Extra yield gained (or lost) on the OTHER 7 slots due to mutual neighbor multipliers
  const neighborBoostDelta = useMemo(() => {
    if (!simulatedReport || !stagedSlotId) return null;
    let currentOthersSum = 0;
    let simulatedOthersSum = 0;
    for (let id = 1; id <= 8; id++) {
      if (id === stagedSlotId) continue;
      currentOthersSum += yieldReport.breakdown[id]?.slotYield ?? 0;
      simulatedOthersSum += simulatedReport.breakdown[id]?.slotYield ?? 0;
    }
    return simulatedOthersSum - currentOthersSum;
  }, [simulatedReport, yieldReport, stagedSlotId]);

  // Lookup map for previewing SVG conduit edges before confirming inscription
  const simulatedEdgesByKey = useMemo(() => {
    if (!simulatedReport) return null;
    const map: Record<string, SynergyType> = {};
    for (const edge of simulatedReport.edges) {
      map[edge.edgeKey] = edge.type;
    }
    return map;
  }, [simulatedReport]);

  // Dynamic staged synergy pills with readable neighbor context
  const stagedSynergies = useMemo<StagedSynergyPill[]>(() => {
    if (!stagedSlotId || !stagedBadge || isStagedWildcard) return [];
    const neighbors = ADJACENCY_MAP[stagedSlotId] ?? [];
    const synergies: StagedSynergyPill[] = [];

    for (const nId of neighbors) {
      const neighborBadge = slots[nId];
      if (!neighborBadge) continue;

      const projMatch = stagedBadge.projectId === neighborBadge.projectId;
      const shapeMatch = stagedBadge.shape === neighborBadge.shape;

      if (projMatch && shapeMatch) {
        synergies.push({
          neighborSlotId: nId,
          label: `Dual: #${nId} ${neighborBadge.projectId} (+50%)`,
          color: 'text-amber-300 border-amber-800/60 bg-amber-950/40',
        });
      } else if (projMatch) {
        synergies.push({
          neighborSlotId: nId,
          label: `Project: #${nId} ${neighborBadge.projectId} (+25%)`,
          color: 'text-emerald-300 border-emerald-800/60 bg-emerald-950/40',
        });
      } else if (shapeMatch) {
        synergies.push({
          neighborSlotId: nId,
          label: `Shape: #${nId} ${neighborBadge.shape} (+25%)`,
          color: 'text-purple-300 border-purple-800/60 bg-purple-950/40',
        });
      }
    }
    return synergies;
  }, [stagedSlotId, stagedBadge, isStagedWildcard, slots]);

  const isPipelineActive = stagedSlotId !== null || stagedBadgeId !== null;

  return (
    <div className="min-h-0 h-auto lg:min-h-[500px] lg:h-full border border-neutral-800 rounded-lg bg-neutral-950/50 p-3.5 sm:p-5 flex flex-col items-center gap-3.5 sm:gap-4 justify-center overflow-y-auto custom-scrollbar">
      {/* 1. Contextual Onboarding Banner / Guide Toggle */}
      <WorkbenchHelpBanner
        tipId="showcase"
        title="How The Showcase Works"
        bullets={SHOWCASE_HELP_BULLETS}
      />

      {/* 2. Daily Bonus Ink Telemetry Card (with Live Staged Preview & Collapsible Bonus Guide) */}
      <div className="w-full max-w-xl bg-neutral-900/80 border border-neutral-800 rounded-xl shadow-md mx-auto overflow-hidden shrink-0">
        <div className="p-3 sm:p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <Droplet size={20} />
          </div>
          <div className="flex-1 min-w-0">
            {/* Top Row: Hero Total + Live Staged Projection */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="text-xs font-mono font-bold tracking-wider text-neutral-400 uppercase">
                Daily Bonus Ink:
              </span>
              <span className="text-base sm:text-lg font-black font-mono text-emerald-400">
                +{yieldReport.totalYield.toFixed(1)} INK
              </span>

              {simulatedReport && simulatedYieldDelta !== null && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/70 border border-emerald-500/40 text-xs font-mono font-bold text-emerald-300 animate-in fade-in duration-150">
                  <ArrowRight size={12} className="text-emerald-400" />
                  <span>+{simulatedReport.totalYield.toFixed(1)} INK</span>
                </span>
              )}
            </div>

            {/* Bottom Row: Itemized Base & Neighbor Bonus Split (with Live Preview) */}
            <div className="flex items-center gap-x-2 gap-y-0.5 text-[11px] sm:text-xs font-mono text-neutral-400 mt-0.5 flex-wrap">
              <span>
                Base:{' '}
                <strong className="text-neutral-300 font-semibold">
                  {yieldReport.baseYieldSum.toFixed(1)}
                </strong>
                {simulatedReport &&
                  simulatedReport.baseYieldSum !== yieldReport.baseYieldSum && (
                    <span className="text-emerald-400 font-semibold">
                      {' '}
                      → {simulatedReport.baseYieldSum.toFixed(1)}
                    </span>
                  )}{' '}
                INK/day
              </span>
              <span className="text-neutral-600">•</span>
              <span
                className={
                  yieldReport.synergyBonusSum > 0 ||
                  (simulatedReport && simulatedReport.synergyBonusSum > 0)
                    ? 'text-amber-400'
                    : 'text-neutral-400'
                }
              >
                Neighbor Bonus:{' '}
                <strong className="font-semibold">
                  +{yieldReport.synergyBonusSum.toFixed(1)}
                </strong>
                {simulatedReport &&
                  Math.abs(
                    simulatedReport.synergyBonusSum - yieldReport.synergyBonusSum
                  ) > 0.01 && (
                    <span className="text-emerald-300 font-bold">
                      {' '}
                      → +{simulatedReport.synergyBonusSum.toFixed(1)}
                    </span>
                  )}{' '}
                INK/day
              </span>
            </div>
          </div>
        </div>

        {/* Attached Collapsible Neighbor Bonus Guide */}
        <div className="border-t border-neutral-800/80 bg-neutral-950/60">
          <button
            type="button"
            onClick={() => setIsBonusGuideOpen((prev) => !prev)}
            className="w-full px-3.5 py-1.5 flex items-center justify-between gap-2 text-[11px] font-mono text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <HelpCircle size={12} className="text-neutral-500 shrink-0" />
              <span>Neighbor Bonus Guide</span>
              <span className="inline-flex items-center gap-1 ml-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              </span>
            </span>
            {isBonusGuideOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {isBonusGuideOpen && (
            <div className="px-3.5 pb-3 pt-2 border-t border-neutral-800/50 bg-neutral-950/90 text-xs text-neutral-300 flex flex-col gap-2 animate-in fade-in duration-150">
              <p className="text-[11px] sm:text-xs text-neutral-400 leading-relaxed">
                Adjacent badges (up, down, left, right) that share traits boost{' '}
                <strong className="text-neutral-200">both</strong> neighbors&apos; base daily Ink
                yield:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 font-mono text-[11px]">
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-800/50 text-emerald-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong>Project:</strong> +25%
                  </span>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-purple-950/30 border border-purple-800/50 text-purple-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                  <span>
                    <strong>Shape:</strong> +25%
                  </span>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-amber-950/30 border border-amber-800/50 text-amber-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span>
                    <strong>Dual (Both):</strong> +50%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. 2x4 Inscription Matrix with Active + Preview SVG Conduit Connectors */}
      <div className="relative w-full max-w-xl mx-auto p-1.5 sm:p-2 shrink-0">
        {/* SVG Conduits strictly on z-0 layer */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          preserveAspectRatio="none"
        >
          {yieldReport.edges.map((edge) => {
            const colSrc = (edge.sourceSlot - 1) % 4;
            const rowSrc = Math.floor((edge.sourceSlot - 1) / 4);
            const colTgt = (edge.targetSlot - 1) % 4;
            const rowTgt = Math.floor((edge.targetSlot - 1) / 4);

            const x1 = `${12.5 + colSrc * 25}%`;
            const y1 = `${25 + rowSrc * 50}%`;
            const x2 = `${12.5 + colTgt * 25}%`;
            const y2 = `${25 + rowTgt * 50}%`;

            const touchesStagedSlot =
              stagedSlotId !== null &&
              (edge.sourceSlot === stagedSlotId || edge.targetSlot === stagedSlotId);
            const previewType = touchesStagedSlot
              ? simulatedEdgesByKey?.[edge.edgeKey]
              : undefined;
            const isPreviewSynergy =
              Boolean(previewType && previewType !== 'none');

            const effectiveType: SynergyType = isPreviewSynergy
              ? (previewType as SynergyType)
              : edge.type;
            const strokeColor = getSynergyStroke(effectiveType);
            const isActiveSynergy = edge.type !== 'none' && !touchesStagedSlot;

            return (
              <line
                key={edge.edgeKey}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={strokeColor}
                strokeWidth={isActiveSynergy || isPreviewSynergy ? 3 : 1}
                strokeDasharray={
                  isActiveSynergy
                    ? 'none'
                    : isPreviewSynergy
                    ? '6 4'
                    : '4 4'
                }
                opacity={isPreviewSynergy ? 0.85 : 1}
                className={`transition-all duration-300 ${
                  isPreviewSynergy ? 'animate-pulse' : ''
                }`}
              />
            );
          })}
        </svg>

        {/* 8 Archiver Matrix Interactive Slots (Opaque on z-10) */}
        <div className="relative z-10 grid grid-cols-4 gap-2.5 sm:gap-3 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((slotId) => {
            const slotData = yieldReport.breakdown[slotId];
            const inscribedBadge = slotData.badge;
            const isTargeted = stagedSlotId === slotId;

            if (inscribedBadge) {
              const badgeClass = getSynergyBadgeClass(slotData.totalMultiplier);

              return (
                <div
                  key={slotId}
                  onClick={() => setStagedSlotId(slotId)}
                  className={`relative group flex flex-col items-center cursor-pointer rounded-lg bg-neutral-950 transition-all ${
                    isTargeted
                      ? 'ring-2 ring-emerald-400 scale-105 shadow-md shadow-emerald-500/20'
                      : 'hover:scale-102'
                  }`}
                >
                  <span className="absolute top-1 right-1.5 text-[8px] font-mono font-bold text-neutral-500/70 z-20 pointer-events-none">
                    #{slotId}
                  </span>

                  <div className="w-full aspect-[3/4]">
                    <BadgeCard
                      tier={inscribedBadge.tier}
                      projectId={inscribedBadge.projectId}
                      shape={inscribedBadge.shape}
                    />
                  </div>

                  <div
                    className={`absolute -bottom-2 px-1.5 py-0.5 rounded-full border text-[9px] font-mono font-bold shadow-md z-20 flex items-center gap-0.5 ${badgeClass}`}
                  >
                    <span>+{slotData.slotYield.toFixed(1)}</span>
                    {slotData.totalMultiplier > 1.0 && (
                      <span className="opacity-75 text-[8px]">
                        ({slotData.totalMultiplier.toFixed(2)}x)
                      </span>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <button
                key={slotId}
                type="button"
                onClick={() => setStagedSlotId(slotId)}
                className={`flex flex-col items-center justify-center w-full aspect-[3/4] rounded-lg border transition-all cursor-pointer relative z-10 bg-neutral-950 ${
                  isTargeted
                    ? 'border-emerald-400 bg-emerald-950/40 ring-2 ring-emerald-400/80 shadow-md shadow-emerald-500/20'
                    : 'border-dashed border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/60'
                }`}
              >
                <div className="flex flex-col items-center gap-0.5 opacity-50 group-hover:opacity-80">
                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                      isTargeted ? 'text-emerald-400' : 'text-neutral-500'
                    }`}
                  >
                    #{slotId}
                  </span>
                  <span className="text-neutral-600 text-[9px] font-mono">
                    {isTargeted ? 'Selected' : 'Empty'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Extracted Inline Inscription Confirmation Card */}
      {isPipelineActive && (
        <ShowcaseConfirmCard
          stagedSlotId={stagedSlotId}
          stagedBadge={stagedBadge}
          occupiedBadge={occupiedBadge}
          isStagedWildcard={isStagedWildcard}
          inscribeCost={inscribeCost}
          inkBalance={inkBalance}
          baseYield={baseYield}
          thisSlotYield={thisSlotYield}
          neighborBoostDelta={neighborBoostDelta}
          oldSlotYield={oldSlotYield}
          simulatedYieldDelta={simulatedYieldDelta}
          stagedSynergies={stagedSynergies}
          onCancel={cancelInscription}
          onConfirm={() => confirmInscription()}
        />
      )}
    </div>
  );
}