// Run inside: frontend/
// src/components/forge/ForgeBatchControls.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Plus, Minus, Wand2, Droplet } from 'lucide-react';
import InkDrop from '@/components/ui/InkDrop';

interface ForgeBatchControlsProps {
  batchCount: number;
  maxBatchCount: number;
  costPerCraft: number;
  inkBalance: number;
  isValidRecipe: boolean;
  slottedCount: number;
  onBatchChange: (count: number) => void;
  onAutoFill: () => void;
  onClearForge: () => void;
  hasAutoFillCandidate: boolean;
  disabled?: boolean;
}

export default function ForgeBatchControls({
  batchCount,
  maxBatchCount,
  costPerCraft,
  inkBalance,
  isValidRecipe,
  slottedCount,
  onBatchChange,
  onAutoFill,
  onClearForge,
  hasAutoFillCandidate,
  disabled = false,
}: ForgeBatchControlsProps) {
  const roundedCost = Math.round(costPerCraft);
  const totalCost = roundedCost * batchCount;
  const canAfford = inkBalance >= totalCost;
  const isAtMax = batchCount === maxBatchCount && maxBatchCount > 1;

  const handleMaxOrReset = () => {
    if (isAtMax) {
      onBatchChange(1);
    } else {
      onBatchChange(maxBatchCount);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-2 sm:gap-2.5">
      {/* Top Utility Row: 2-column stretch on mobile when no cost counter is active */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          className={`flex items-center gap-2 ${
            !isValidRecipe ? 'grid grid-cols-2 w-full sm:flex sm:w-auto' : ''
          }`}
        >
          {/* Autofill Forge Button (Standardized Emerald Utility Pill, 36px height) */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onAutoFill}
            disabled={!hasAutoFillCandidate || disabled}
            className={`h-9 px-3 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
              hasAutoFillCandidate && !disabled
                ? 'border-emerald-700/60 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-900/40 hover:border-emerald-500 hover:text-emerald-200 cursor-pointer shadow-sm active:scale-95'
                : 'border-white/10 bg-white/5 text-neutral-400/60 opacity-50 cursor-not-allowed pointer-events-none'
            }`}
            title="Autofill Forge: Auto-slots the highest-tier valid trio from inventory"
          >
            <Wand2
              size={13}
              className={hasAutoFillCandidate ? 'text-emerald-400' : 'text-neutral-500'}
            />
            <span>Autofill</span>
          </Button>

          {/* Clear Forge Button (Standardized Neutral Secondary Control, 36px height) */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearForge}
            disabled={slottedCount === 0 || disabled}
            className={`h-9 px-3 text-xs font-medium rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
              slottedCount > 0 && !disabled
                ? 'border-neutral-800 bg-neutral-900/80 text-neutral-300 hover:bg-neutral-800 hover:text-white cursor-pointer shadow-sm active:scale-95'
                : 'border-white/10 bg-white/5 text-neutral-400/60 opacity-40 cursor-not-allowed pointer-events-none'
            }`}
            title="Clear all badges currently slotted on the forge altar"
          >
            <RotateCcw size={13} />
            <span>Clear</span>
          </Button>
        </div>

        {/* Total Cost Counter */}
        {isValidRecipe && (
        <div className="text-xs font-mono px-1 whitespace-nowrap">
          <span className="text-neutral-400">Total: </span>
          <span className={`font-bold ${canAfford ? 'text-white' : 'text-red-400'}`}>
            {totalCost.toLocaleString()}
          </span>{' '}
          <InkDrop
            className={
              canAfford
                ? 'text-emerald-400 fill-emerald-400/25'
                : 'text-red-400 fill-red-400/25'
            }
          />
  </div>
)}
      </div>

      {/* Stepper Toolbar */}
      {isValidRecipe && (
        <div className="flex items-center justify-between p-1.5 rounded-xl border border-neutral-800 bg-neutral-900/90 shadow-inner">
          <span className="text-[10px] font-mono uppercase text-neutral-400 ml-2 font-bold tracking-wider">
            Batch Multiplier
          </span>

          <div className="flex items-center gap-1.5">
            {/* [-] Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onBatchChange(Math.max(1, batchCount - 1))}
              disabled={batchCount <= 1 || disabled}
              className={`h-8 w-8 p-0 rounded-lg border font-bold transition-all ${
                batchCount > 1 && !disabled
                  ? 'border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white cursor-pointer active:scale-95'
                  : 'border-white/10 bg-white/5 text-neutral-500 opacity-40 cursor-not-allowed pointer-events-none'
              }`}
              title="Decrease batch size"
            >
              <Minus size={13} />
            </Button>

            {/* Current Multiplier Display */}
            <div className="min-w-[44px] h-8 px-2 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center font-mono font-bold text-xs text-white">
              {batchCount}x
            </div>

            {/* [+] Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onBatchChange(Math.min(maxBatchCount, batchCount + 1))}
              disabled={batchCount >= maxBatchCount || disabled}
              className={`h-8 w-8 p-0 rounded-lg border font-bold transition-all ${
                batchCount < maxBatchCount && !disabled
                  ? 'border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white cursor-pointer active:scale-95'
                  : 'border-white/10 bg-white/5 text-neutral-500 opacity-40 cursor-not-allowed pointer-events-none'
              }`}
              title="Increase batch size"
            >
              <Plus size={13} />
            </Button>

            {/* Dynamic [Max] / [Reset] Toggle */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleMaxOrReset}
              disabled={(maxBatchCount <= 1 && batchCount <= 1) || disabled}
              className={`h-8 px-3 rounded-lg border font-bold text-xs transition-all flex items-center gap-1 ${
                isAtMax
                  ? 'border-amber-700/60 bg-amber-950/30 text-amber-400 hover:bg-amber-900/50 hover:border-amber-500 hover:text-white cursor-pointer active:scale-95'
                  : maxBatchCount > 1 && !disabled
                    ? 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white cursor-pointer active:scale-95'
                    : 'border-white/10 bg-white/5 text-neutral-500 opacity-40 cursor-not-allowed pointer-events-none'
              }`}
            >
              {isAtMax ? (
                <>
                  <RotateCcw size={11} />
                  <span>Reset</span>
                </>
              ) : (
                <span>Max {maxBatchCount > 1 ? `(${maxBatchCount})` : ''}</span>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}