// Run inside: frontend/
// src/components/forge/ForgeBatchControls.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Plus, Minus, Wand2, Droplet } from 'lucide-react';

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
    <div className="w-full max-w-xl mx-auto flex flex-col gap-2 sm:gap-2.5">
      {/* Top Utility Row: Wrapped gracefully for 320px */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Autofill Forge Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onAutoFill}
            disabled={!hasAutoFillCandidate || disabled}
            className={`h-7 px-2 sm:px-2.5 text-[10px] sm:text-[11px] font-semibold rounded-lg border transition-all flex items-center gap-1 sm:gap-1.5 ${
              hasAutoFillCandidate && !disabled
                ? 'border-emerald-800/60 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/40 hover:border-emerald-500 cursor-pointer shadow-sm active:scale-95'
                : 'border-neutral-800 bg-neutral-950/40 text-neutral-600 opacity-40 cursor-not-allowed pointer-events-none'
            }`}
            title="Autofill Forge: Auto-slots the highest-tier valid trio from inventory"
          >
            <Wand2 size={11} className={hasAutoFillCandidate ? 'text-emerald-400' : 'text-neutral-600'} />
            <span>Autofill<span className="hidden xs:inline"> Forge</span></span>
          </Button>

          {/* Clear Forge Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearForge}
            disabled={slottedCount === 0 || disabled}
            className={`h-7 px-2 sm:px-2.5 text-[10px] sm:text-[11px] font-medium rounded-lg border transition-all flex items-center gap-1 sm:gap-1.5 ${
              slottedCount > 0 && !disabled
                ? 'border-red-900/60 bg-red-950/30 text-red-300 hover:border-red-600 hover:bg-red-900/40 hover:text-white cursor-pointer shadow-sm active:scale-95'
                : 'border-neutral-800/40 bg-neutral-950/20 text-neutral-600 opacity-30 cursor-not-allowed pointer-events-none'
            }`}
            title="Clear all badges currently slotted on the forge altar"
          >
            <RotateCcw size={11} />
            <span>Clear<span className="hidden xs:inline"> Forge</span></span>
          </Button>
        </div>

        {/* Total Cost Counter */}
        {isValidRecipe && (
          <div className="flex items-center gap-1 text-[11px] sm:text-xs font-mono ml-auto">
            <Droplet size={12} className={canAfford ? 'text-emerald-400' : 'text-red-400'} />
            <span className="text-neutral-400">Total:</span>
            <span className={`font-bold ${canAfford ? 'text-white' : 'text-red-400'}`}>
              {totalCost.toLocaleString()} Ink
            </span>
          </div>
        )}
      </div>

      {/* Stepper Toolbar */}
      {isValidRecipe && (
        <div className="flex items-center justify-between p-1.5 rounded-xl border border-neutral-800 bg-neutral-900/90 shadow-inner">
          <span className="text-[10px] font-mono uppercase text-neutral-400 ml-1.5 sm:ml-2 font-bold tracking-wider">
            Batch<span className="hidden sm:inline"> Multiplier</span>
          </span>

          <div className="flex items-center gap-1 sm:gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onBatchChange(Math.max(1, batchCount - 1))}
              disabled={batchCount <= 1 || disabled}
              className={`h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg border font-bold transition-all ${
                batchCount > 1 && !disabled
                  ? 'border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white cursor-pointer active:scale-95'
                  : 'border-neutral-800/60 bg-neutral-950/40 text-neutral-600 opacity-30 cursor-not-allowed pointer-events-none'
              }`}
            >
              <Minus size={12} />
            </Button>

            <div className="min-w-[36px] sm:min-w-[44px] h-7 sm:h-8 px-1.5 sm:px-2 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center font-mono font-bold text-xs text-white">
              {batchCount}x
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onBatchChange(Math.min(maxBatchCount, batchCount + 1))}
              disabled={batchCount >= maxBatchCount || disabled}
              className={`h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg border font-bold transition-all ${
                batchCount < maxBatchCount && !disabled
                  ? 'border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white cursor-pointer active:scale-95'
                  : 'border-neutral-800/60 bg-neutral-950/40 text-neutral-600 opacity-30 cursor-not-allowed pointer-events-none'
              }`}
            >
              <Plus size={12} />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleMaxOrReset}
              disabled={(maxBatchCount <= 1 && batchCount <= 1) || disabled}
              className={`h-7 sm:h-8 px-2 sm:px-3 rounded-lg border font-bold text-[11px] sm:text-xs transition-all flex items-center gap-1 ${
                isAtMax
                  ? 'border-amber-900/60 bg-amber-950/30 text-amber-300 hover:bg-amber-900/50 hover:border-amber-500 hover:text-white cursor-pointer active:scale-95'
                  : maxBatchCount > 1 && !disabled
                  ? 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white cursor-pointer active:scale-95'
                  : 'border-neutral-800/60 bg-neutral-950/40 text-neutral-600 opacity-30 cursor-not-allowed pointer-events-none'
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