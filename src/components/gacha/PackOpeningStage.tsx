// src/components/gacha/PackOpeningStage.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  useShowcaseStore,
  type PackType,
  type Badge,
  type BadgeShape,
  PACK_CONFIGS,
} from '@/store/useShowcaseStore';
import FoilPackFissure from './FoilPackFissure';
import UnsealParticleCanvas from './UnsealParticleCanvas';
import LootRevealGrid from './LootRevealGrid';
import { Button } from '@/components/ui/button';
import { FastForward, Check, RefreshCw, ShoppingBag } from 'lucide-react';
import { getPackTheme } from '@/lib/theme';

interface PackOpeningStageProps {
  packType: PackType;
  batchCount: number;
  affiliation?: { shape?: BadgeShape; projectId?: string };
  onClose: () => void;
  onBatchSummary: (pulls: Badge[]) => void;
}

type StagePhase = 'tapping' | 'bursting' | 'revealing' | 'resolved';

export default function PackOpeningStage({
  packType,
  batchCount,
  affiliation,
  onClose,
  onBatchSummary,
}: PackOpeningStageProps) {
  const openPacksBatch = useShowcaseStore((state) => state.openPacksBatch);
  const buyPacks = useShowcaseStore((state) => state.buyPacks);
  const unopenedPacks = useShowcaseStore((state) => state.unopenedPacks);
  const inkBalance = useShowcaseStore((state) => state.inkBalance);

  const [phase, setPhase] = useState<StagePhase>('tapping');
  const [tapCount, setTapCount] = useState<number>(0);
  const [pulledBadges, setPulledBadges] = useState<Badge[] | null>(null);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const theme = getPackTheme(packType);

  const ownedPacksRemaining = unopenedPacks[packType] || 0;
  const packCost = PACK_CONFIGS[packType].cost;
  const canAffordBatch = inkBalance >= packCost * batchCount;
  const canAffordSingle = inkBalance >= packCost;

  const clearTimers = () => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];
  };

  const executePull = (count: number): Badge[] | null => {
    const pulls = openPacksBatch(packType, count, affiliation);
    if (pulls && pulls.length > 0) {
      setPulledBadges(pulls);
      return pulls;
    }
    return null;
  };

  // Automated Opening Sequencer
  useEffect(() => {
    if (phase !== 'tapping') return;

    // Check prefers-reduced-motion for instant resolution
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const pulls = executePull(batchCount);
    if (!pulls) {
      onClose();
      return;
    }

    if (prefersReducedMotion) {
      if (batchCount > 1) {
        onBatchSummary(pulls);
      } else {
        setPhase('resolved');
      }
      return;
    }

    // Step 1 (0ms): Pack elevates, hairline fissure glows
    setTapCount(1);

    // Step 2 (320ms): Critical strain, jitter, expanding fissures
    const timer1 = setTimeout(() => {
      setTapCount(2);
    }, 320);

    // Step 3 (650ms): Foil breach and particle burst
    const timer2 = setTimeout(() => {
      setTapCount(3);
      setPhase('bursting');
    }, 650);

    timersRef.current = [timer1, timer2];

    return () => {
      clearTimers();
    };
  }, [phase]);

  const handleBurstComplete = () => {
    if (batchCount > 1 && pulledBadges) {
      onBatchSummary(pulledBadges);
    } else {
      setPhase('revealing');
    }
  };

  // Option 1: Explicit Skip Button Handler
  const handleSkip = () => {
    clearTimers();

    let currentPulls = pulledBadges;
    if (!currentPulls) {
      currentPulls = executePull(batchCount);
    }
    if (!currentPulls) {
      onClose();
      return;
    }

    if (batchCount > 1) {
      onBatchSummary(currentPulls);
    } else {
      setPhase('resolved');
    }
  };

  const handleOpenAnotherOwned = () => {
    clearTimers();
    setTapCount(0);
    setPulledBadges(null);
    setPhase('tapping');
  };

  const handleQuickBuyAndOpenAnother = () => {
    const countToBuy = ownedPacksRemaining >= batchCount ? batchCount : 1;
    const bought = buyPacks(packType, countToBuy);
    if (bought) {
      clearTimers();
      setTapCount(0);
      setPulledBadges(null);
      setPhase('tapping');
    }
  };

  return (
    <div className="relative w-full min-h-[440px] flex flex-col items-center justify-center p-4 overflow-visible">
      {/* Option 1: Corner Skip Button (Active strictly during animation phases) */}
      {(phase === 'tapping' || phase === 'bursting') && (
        <div className="absolute top-2 right-2 z-40">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="h-7 px-2.5 text-xs text-neutral-400 hover:text-white bg-neutral-900/80 border border-neutral-800 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
          >
            <FastForward size={13} className="text-amber-400" /> Skip
          </Button>
        </div>
      )}

      {/* Promoted Canvas FX */}
      {phase === 'bursting' && (
        <UnsealParticleCanvas packType={packType} onComplete={handleBurstComplete} />
      )}

      {/* Automated Foil Pack & Status Feedback */}
      {(phase === 'tapping' || phase === 'bursting') && (
        <div className="relative flex flex-col items-center">
          <FoilPackFissure
            packType={packType}
            tapCount={tapCount}
            onTap={() => {}}
            disabled={true}
          />
          <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium tracking-wide mt-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>Opening pack...</span>
          </div>
        </div>
      )}

      {/* Loot Reveal Grid (Single & Batch) */}
      {(phase === 'revealing' || phase === 'resolved') && pulledBadges && (
        <div className="flex flex-col items-center gap-5 w-full animate-in fade-in duration-300">
          <LootRevealGrid
            badges={pulledBadges}
            isSkipped={phase === 'resolved'}
            isBatch={batchCount > 1}
          />

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            {ownedPacksRemaining >= batchCount && (
              <Button
                type="button"
                onClick={handleOpenAnotherOwned}
                size="sm"
                className="h-8 px-4 text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg border border-neutral-700 flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
              >
                <RefreshCw size={13} /> Open Another {batchCount > 1 ? `${batchCount}x` : ''} ({ownedPacksRemaining} left)
              </Button>
            )}

            {ownedPacksRemaining < batchCount && (canAffordBatch || canAffordSingle) && (
              <Button
                type="button"
                onClick={handleQuickBuyAndOpenAnother}
                size="sm"
                className={`h-8 px-4 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 ${theme.btn}`}
              >
                <ShoppingBag size={13} /> Buy & Open 1x (-{packCost} Ink)
              </Button>
            )}

            <Button
              type="button"
              onClick={onClose}
              size="sm"
              className="h-8 px-5 text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg border border-neutral-700 shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Check size={13} /> Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}