// src/components/forge/ForgeAnvilTrigger.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Hammer, Sparkles, AlertCircle } from 'lucide-react';

interface ForgeAnvilTriggerProps {
  isValid: boolean;
  isForging: boolean;
  canAfford: boolean;
  totalCost: number;
  batchCount: number;
  slottedCount: number;
  strikeStep: number;
  onStrike: () => void;
}

export default function ForgeAnvilTrigger({
  isValid,
  isForging,
  canAfford,
  totalCost,
  batchCount,
  slottedCount,
  strikeStep,
  onStrike,
}: ForgeAnvilTriggerProps) {
  const isReady = isValid && canAfford && !isForging;

  const getButtonText = () => {
    if (isForging) {
      if (strikeStep === 1) return 'Striking Anvil... (Ping)';
      if (strikeStep === 2) return 'Forging Core... (Clang)';
      if (strikeStep === 3) return 'Transmuting... (Crunch)';
      return 'Quenching Ingot...';
    }
    
    if (slottedCount < 3) {
      const remaining = 3 - slottedCount;
      if (slottedCount === 0) return 'Put in 3 compatible badges';
      return `Put in ${remaining} more badge${remaining > 1 ? 's' : ''} to forge`;
    }

    if (!isValid) return 'Incompatible badge selection';

    const countLabel = batchCount === 1 ? '1 badge' : `${batchCount} badges`;
    return `Forge ${countLabel} (${totalCost.toLocaleString()} Ink)`;
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-2 mt-1">
      <motion.div
        className="w-full"
        whileTap={isReady ? { scale: 0.98 } : undefined}
        transition={{ duration: 0.1 }}
      >
        <Button
          type="button"
          onClick={onStrike}
          disabled={!isReady}
          className={`w-full h-11 text-xs font-bold rounded-xl tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
            isReady
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/60 ring-1 ring-emerald-400/40 active:scale-[0.99]'
              : isForging
              ? 'bg-neutral-800 text-amber-300 border border-amber-500/50 cursor-wait'
              : 'bg-neutral-900 border border-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
          }`}
        >
          <motion.div
            animate={
              isForging
                ? {
                    rotate: [0, -35, 15, -35, 15, 0],
                    scale: [1, 1.25, 0.95, 1.25, 0.95, 1],
                  }
                : { rotate: 0, scale: 1 }
            }
            transition={{ duration: 0.65, ease: 'easeInOut' }}
          >
            <Hammer
              size={16}
              className={
                isForging
                  ? 'text-amber-400'
                  : isReady
                  ? 'text-white'
                  : 'text-neutral-500'
              }
            />
          </motion.div>

          <span>{getButtonText()}</span>

          {isReady && <Sparkles size={14} className="text-emerald-300 animate-pulse" />}
        </Button>
      </motion.div>

      {isValid && !canAfford && (
        <div className="flex items-center gap-1.5 text-[11px] text-red-400">
          <AlertCircle size={12} />
          <span>Insufficient Ink for this batch size.</span>
        </div>
      )}
    </div>
  );
}