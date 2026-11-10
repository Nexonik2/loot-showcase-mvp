// Run inside: frontend/
// src/components/dashboard/ShowcaseView.tsx

import React, { useMemo } from 'react';
import BadgeCard from '@/components/BadgeCard';
import { useShowcaseStore, INSCRIBE_SETTINGS } from '@/store/useShowcaseStore';
import {
  ADJACENCY_MAP,
  BASE_TIER_YIELDS,
  calculateShowcaseTotalYield,
  type SynergyType,
} from '@/lib/inscriptionYield';
import { Droplet, AlertTriangle, Check, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

const getSynergyStroke = (type: SynergyType): string => {
  switch (type) {
    case 'dual':
      return 'rgba(245, 158, 11, 0.85)';
    case 'project':
      return 'rgba(16, 185, 129, 0.85)';
    case 'shape':
      return 'rgba(139, 92, 246, 0.85)';
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
  const traits = useShowcaseStore((state) => state.traits);
  const inkBalance = useShowcaseStore((state) => state.inkBalance);
  const badges = useShowcaseStore((state) => state.badges);

  // Staging state from store
  const stagedSlotId = useShowcaseStore((state) => state.stagedSlotId);
  const stagedBadgeId = useShowcaseStore((state) => state.stagedBadgeId);
  const setStagedSlotId = useShowcaseStore((state) => state.setStagedSlotId);
  const confirmInscription = useShowcaseStore((state) => state.confirmInscription);
  const cancelInscription = useShowcaseStore((state) => state.cancelInscription);

  const yieldReport = useMemo(() => calculateShowcaseTotalYield(slots), [slots]);

  // Staged Badge & Cost Evaluations
  const stagedBadge = stagedBadgeId ? badges[stagedBadgeId] : null;
  const isStagedWildcard = stagedBadge?.projectId === 'wildcard' || stagedBadge?.shape === 'wildcard';
  const inscribeCost = stagedBadge ? INSCRIBE_SETTINGS.calculateCost(stagedBadge.tier) : 0;
  const baseYield = stagedBadge ? (BASE_TIER_YIELDS[stagedBadge.tier] ?? 0) : 0;
  const canAfford = inkBalance >= inscribeCost;
  const occupiedBadge = stagedSlotId ? slots[stagedSlotId] : null;

  // Live Simulation Delta
  const simulatedYieldDelta = useMemo(() => {
    if (!stagedSlotId || !stagedBadge || isStagedWildcard) return null;
    const hypotheticalSlots = { ...slots, [stagedSlotId]: stagedBadge };
    const simulatedReport = calculateShowcaseTotalYield(hypotheticalSlots);
    return simulatedReport.totalYield - yieldReport.totalYield;
  }, [slots, stagedSlotId, stagedBadge, isStagedWildcard, yieldReport]);

  // Dynamic staged synergy pills with readable neighbor context
  const stagedSynergies = useMemo(() => {
    if (!stagedSlotId || !stagedBadge || isStagedWildcard) return [];
    const neighbors = ADJACENCY_MAP[stagedSlotId] ?? [];
    const synergies: Array<{ neighborSlotId: number; label: string; color: string }> = [];

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
    <div className="min-h-[500px] border border-neutral-800 rounded-lg bg-neutral-950/50 p-4 sm:p-5 flex flex-col items-center gap-4 sm:gap-5 w-full">
      
      {/* 1. Trait Matrix */}
      <div className="grid grid-cols-3 gap-2.5 w-full max-w-xl mx-auto">
        {Object.entries(traits).map(([key, value]) => (
          <div key={key} className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800/80 text-center">
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono mb-0.5">{key}</div>
            <div className="text-xs font-semibold capitalize text-neutral-200">{String(value)}</div>
          </div>
        ))}
      </div>

      {/* 2. Daily Bonus Ink Telemetry Bar (2-Row Layout) */}
      <div className="w-full max-w-xl bg-neutral-900/80 border border-neutral-800 rounded-xl p-3.5 shadow-md flex items-center gap-3.5 mx-auto">
        <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
          <Droplet size={20} />
        </div>
        <div className="flex-1 min-w-0">
          {/* Top Row: Hero Total */}
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-mono font-bold tracking-wider text-neutral-400 uppercase">
              Daily Bonus Ink:
            </span>
            <span className="text-lg font-black font-mono text-emerald-400">
              +{yieldReport.totalYield.toFixed(1)} INK
            </span>
          </div>

          {/* Bottom Row: Itemized Component Split */}
          <div className="flex items-center gap-2.5 text-xs font-mono text-neutral-400 mt-0.5 flex-wrap">
            <span>Base: <strong className="text-neutral-300 font-semibold">{yieldReport.baseYieldSum.toFixed(1)} INK/day</strong></span>
            <span className="text-neutral-600">•</span>
            <span className={yieldReport.synergyBonusSum > 0 ? 'text-amber-400' : 'text-neutral-400'}>
              Neighbor Bonus: <strong className="font-semibold">+{yieldReport.synergyBonusSum.toFixed(1)} INK/day</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Inline Inscription Action Bar */}
      {isPipelineActive && (
        <div className="w-full max-w-xl rounded-xl border border-neutral-700 bg-neutral-900/95 p-3 shadow-lg flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-150 mx-auto">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2 py-0.5 rounded-md bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-mono font-bold">
                {stagedSlotId ? `Slot #${stagedSlotId}` : 'Select a Slot'}
              </span>

              {stagedBadge && (
                <span className="text-xs font-semibold capitalize text-neutral-200 truncate">
                  {stagedBadge.projectId} {stagedBadge.shape} (T{stagedBadge.tier})
                </span>
              )}
            </div>

            <span className="text-[10px] font-mono text-neutral-500">
              {!stagedSlotId ? 'Select target slot' : !stagedBadge ? 'Select badge' : 'Ready to bind'}
            </span>
          </div>

          {/* Validation Feedback */}
          {isStagedWildcard && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-2 text-xs font-medium text-destructive">
              <ShieldAlert size={14} className="shrink-0" />
              Wildcard badges can't be inscribed
            </div>
          )}

          {/* Base Yield & Neighbor Synergy Breakdown Pills */}
          {!isStagedWildcard && stagedBadge && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="px-2 py-0.5 rounded-full border border-neutral-700 bg-neutral-800/80 text-neutral-300 text-[9px] font-mono font-semibold">
                Base: +{baseYield} INK/day
              </span>
              {stagedSynergies.map((s, idx) => (
                <span key={idx} className={`px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold ${s.color}`}>
                  {s.label}
                </span>
              ))}
            </div>
          )}

          {!isStagedWildcard && occupiedBadge && (
            <div className="flex items-center gap-2 rounded-md bg-amber-950/40 border border-amber-800/60 p-2 text-[11px] text-amber-300">
              <AlertTriangle size={14} className="shrink-0 text-amber-400" />
              <span>
                <strong>Overwrite:</strong> Slot #{stagedSlotId} will replace{' '}
                <span className="capitalize font-bold">{occupiedBadge.projectId}</span> (T{occupiedBadge.tier}).
              </span>
            </div>
          )}

          {!isStagedWildcard && stagedBadge && !canAfford && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-2 text-xs font-medium text-destructive">
              <AlertTriangle size={14} className="shrink-0" />
              Insufficient Ink balance ({inkBalance} / {inscribeCost}).
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between gap-3 pt-1 border-t border-neutral-800">
            <div className="text-[11px] font-mono">
              {stagedBadge && !isStagedWildcard ? (
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400">
                    Cost: <strong className="text-white">{inscribeCost} Ink</strong>
                  </span>
                  {simulatedYieldDelta !== null && (
                    <span
                      className={`text-[10px] font-bold ${
                        simulatedYieldDelta >= 0 ? 'text-emerald-400' : 'text-neutral-400'
                      }`}
                    >
                      ({simulatedYieldDelta >= 0 ? `+${simulatedYieldDelta.toFixed(1)}` : simulatedYieldDelta.toFixed(1)} INK/day)
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-neutral-500">
                  {!stagedSlotId ? 'Tap a slot below' : 'Tap a badge in inventory'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelInscription}
                className="h-7 px-2.5 text-xs rounded-lg border border-red-900/60 bg-red-950/30 text-red-300 hover:border-red-600 hover:bg-red-900/40 hover:text-white cursor-pointer transition-all active:scale-95"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!stagedSlotId || !stagedBadge || isStagedWildcard || !canAfford}
                onClick={() => confirmInscription()}
                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1 cursor-pointer transition-all active:scale-95"
              >
                <Check size={13} />
                Inscribe
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 4. 2x4 Inscription Matrix with SVG Conduit Connectors */}
      <div className="relative w-full max-w-xl mx-auto mt-1 p-2">
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

            const strokeColor = getSynergyStroke(edge.type);
            const isSynergized = edge.type !== 'none';

            return (
              <line
                key={edge.edgeKey}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={strokeColor}
                strokeWidth={isSynergized ? 2.5 : 1}
                strokeDasharray={isSynergized ? 'none' : '4 4'}
                className="transition-all duration-300"
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
                  {/* Persistent Slot Coordinate Identifier */}
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
                      <span className="opacity-75 text-[8px]">({slotData.totalMultiplier.toFixed(2)}x)</span>
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

      {/* 5. Placement Guide Footer */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 text-[10px] font-mono text-neutral-500 pt-1">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Project (+25%)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> Shape (+25%)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Dual (+50%)
        </span>
      </div>
    </div>
  );
}