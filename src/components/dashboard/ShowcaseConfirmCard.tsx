// Run inside: frontend/
// src/components/dashboard/ShowcaseConfirmCard.tsx

import React from 'react';
import { AlertTriangle, Check, ShieldAlert } from 'lucide-react';
import type { Badge } from '@/store/useShowcaseStore';
import { Button } from '@/components/ui/button';

export interface StagedSynergyPill {
  neighborSlotId: number;
  label: string;
  color: string;
}

interface ShowcaseConfirmCardProps {
  stagedSlotId: number | null;
  stagedBadge: Badge | null;
  occupiedBadge: Badge | null;
  isStagedWildcard: boolean;
  inscribeCost: number;
  inkBalance: number;
  baseYield: number;
  thisSlotYield: number | null;
  neighborBoostDelta: number | null;
  oldSlotYield: number;
  simulatedYieldDelta: number | null;
  stagedSynergies: StagedSynergyPill[];
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ShowcaseConfirmCard({
  stagedSlotId,
  stagedBadge,
  occupiedBadge,
  isStagedWildcard,
  inscribeCost,
  inkBalance,
  baseYield,
  thisSlotYield,
  neighborBoostDelta,
  oldSlotYield,
  simulatedYieldDelta,
  stagedSynergies,
  onCancel,
  onConfirm,
}: ShowcaseConfirmCardProps) {
  const canAfford = inkBalance >= inscribeCost;

  return (
    <div className="w-full max-w-xl rounded-xl border border-neutral-700 bg-neutral-900/95 p-3 sm:p-3.5 shadow-lg flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-150 mx-auto shrink-0">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span
            className={`px-2 py-0.5 rounded-md border text-xs font-mono font-bold shrink-0 ${
              stagedSlotId
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                : 'bg-amber-950/50 border-amber-700/60 text-amber-300'
            }`}
          >
            {stagedSlotId ? `Slot #${stagedSlotId}` : 'Tap a Slot Above'}
          </span>

          {stagedBadge ? (
            <span className="text-xs sm:text-sm font-semibold capitalize text-neutral-100 break-words">
              {stagedBadge.projectId} {stagedBadge.shape} (T{stagedBadge.tier})
            </span>
          ) : (
            <span className="text-xs font-mono text-neutral-400">
              Tap a badge in inventory
            </span>
          )}
        </div>

        {stagedSlotId && stagedBadge && !isStagedWildcard && simulatedYieldDelta !== null && (
          <span
            className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border shrink-0 ${
              simulatedYieldDelta >= 0
                ? 'text-emerald-300 bg-emerald-950/50 border-emerald-700/60'
                : 'text-neutral-300 bg-neutral-800 border-neutral-700'
            }`}
          >
            Net: {simulatedYieldDelta >= 0 ? `+${simulatedYieldDelta.toFixed(1)}` : simulatedYieldDelta.toFixed(1)} INK/day
          </span>
        )}
      </div>

      {/* Wildcard Validation Feedback */}
      {isStagedWildcard && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-2 text-xs font-medium text-destructive">
          <ShieldAlert size={14} className="shrink-0" />
          <span>Wildcard badges can&apos;t be inscribed in the Showcase.</span>
        </div>
      )}

      {/* Itemized Base, Synergy & Mutual Neighbor Boost Pills */}
      {!isStagedWildcard && stagedBadge && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="px-2.5 py-0.5 rounded-full border border-neutral-700 bg-neutral-800/90 text-neutral-200 text-[11px] font-mono font-semibold">
            Base: +{baseYield.toFixed(1)} INK/day
          </span>

          {stagedSynergies.map((s, idx) => (
            <span
              key={idx}
              className={`px-2.5 py-0.5 rounded-full border text-[11px] font-mono font-bold ${s.color}`}
            >
              {s.label}
            </span>
          ))}

          {thisSlotYield !== null && thisSlotYield > baseYield && (
            <span className="px-2.5 py-0.5 rounded-full border border-emerald-700/60 bg-emerald-950/40 text-emerald-300 text-[11px] font-mono font-semibold">
              This Slot: +{thisSlotYield.toFixed(1)}/d
            </span>
          )}

          {neighborBoostDelta !== null && Math.abs(neighborBoostDelta) > 0.01 && (
            <span
              className={`px-2.5 py-0.5 rounded-full border text-[11px] font-mono font-semibold ${
                neighborBoostDelta > 0
                  ? 'border-amber-700/60 bg-amber-950/40 text-amber-300'
                  : 'border-neutral-700 bg-neutral-800 text-neutral-400'
              }`}
            >
              Neighbor Boost: {neighborBoostDelta > 0 ? `+${neighborBoostDelta.toFixed(1)}` : neighborBoostDelta.toFixed(1)}/d
            </span>
          )}

          {oldSlotYield > 0 && (
            <span className="px-2.5 py-0.5 rounded-full border border-red-900/60 bg-red-950/30 text-red-300 text-[11px] font-mono font-semibold">
              Replaces #{stagedSlotId}: -{oldSlotYield.toFixed(1)}/d
            </span>
          )}
        </div>
      )}

      {/* Overwrite Warning */}
      {!isStagedWildcard && occupiedBadge && (
        <div className="flex items-start sm:items-center gap-2 rounded-md bg-amber-950/40 border border-amber-800/60 p-2 text-xs text-amber-300">
          <AlertTriangle size={14} className="shrink-0 text-amber-400 mt-0.5 sm:mt-0" />
          <span>
            <strong>Overwrite:</strong> Slot #{stagedSlotId} will replace{' '}
            <span className="capitalize font-bold">
              {occupiedBadge.projectId} {occupiedBadge.shape}
            </span>{' '}
            (T{occupiedBadge.tier}).
          </span>
        </div>
      )}

      {/* Insufficient Ink Warning */}
      {!isStagedWildcard && stagedBadge && !canAfford && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-2 text-xs font-medium text-destructive">
          <AlertTriangle size={14} className="shrink-0" />
          <span>
            Insufficient Ink balance ({inkBalance} / {inscribeCost} Ink).
          </span>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-neutral-800">
        <div className="text-xs font-mono">
          {stagedBadge && !isStagedWildcard ? (
            <span className="text-neutral-400">
              Cost: <strong className="text-white">{inscribeCost} Ink</strong>
            </span>
          ) : (
            <span className="text-neutral-500 text-[11px]">
              {!stagedSlotId ? 'Select a slot above to preview yield' : 'Select a badge below'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 px-3 text-xs rounded-lg border border-red-900/60 bg-red-950/30 text-red-300 hover:border-red-600 hover:bg-red-900/40 hover:text-white cursor-pointer transition-all active:scale-95"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!stagedSlotId || !stagedBadge || isStagedWildcard || !canAfford}
            onClick={onConfirm}
            className="h-8 px-3.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1 cursor-pointer transition-all active:scale-95"
          >
            <Check size={14} />
            Inscribe
          </Button>
        </div>
      </div>
    </div>
  );
}