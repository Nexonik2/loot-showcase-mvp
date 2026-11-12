// Run inside: frontend/
// src/components/gacha/PackOpeningStage.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  useShowcaseStore,
  type PackType,
  type Badge,
  type BadgeShape,
  PACK_CONFIGS,
} from '@/store/useShowcaseStore';
import { useQuestStore } from '@/store/useQuestStore';
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
}

type StagePhase = 'tapping' | 'bursting' | 'revealing' | 'resolved';

export default function PackOpeningStage({
  packType,
  batchCount,
  affiliation,
  onClose,
}: PackOpeningStageProps) {
  const openPacksBatch = useShowcaseStore((state) => state.openPacksBatch);
  const buyPacks = useShowcaseStore((state) => state.buyPacks);
  const unopenedPacks = useShowcaseStore((state) => state.unopenedPacks);
  const inkBalance = useShowcaseStore((state) => state.inkBalance);

  const pauseQuestToasts = useQuestStore((state) => state.pauseQuestToasts);
  const resumeQuestToasts = useQuestStore((state) => state.resumeQuestToasts);

  const [phase, setPhase] = useState<StagePhase>('tapping');
  const [tapCount, setTapCount] = useState<number>(0);
  const [activeBatchCount, setActiveBatchCount] = useState<number>(batchCount);
  const [pulledBadges, setPulledBadges] = useState<Badge[] | null>(null);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hasPulledRef = useRef<boolean>(false);
  const pulledBadgesRef = useRef<Badge[] | null>(null);

  const theme = getPackTheme(packType);
  const ownedPacksRemaining = unopenedPacks[packType] || 0;
  const packCost = PACK_CONFIGS[packType].cost;
  const canAffordSingle = inkBalance >= packCost;

  const clearTimers = () => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];
  };

  // Ensure quest toasts are never left paused if the user navigates away mid-animation
  useEffect(() => {
    return () => {
      resumeQuestToasts();
    };
  }, [resumeQuestToasts]);

  // Resume deferred quest toasts the moment cards reveal on screen
  useEffect(() => {
    if (phase === 'revealing' || phase === 'resolved') {
      resumeQuestToasts();
    }
  }, [phase, resumeQuestToasts]);

  const executePullOnce = (count: number): Badge[] | null => {
    if (hasPulledRef.current) {
      return pulledBadgesRef.current;
    }

    hasPulledRef.current = true;
    pauseQuestToasts();

    const pulls = openPacksBatch(packType, count, affiliation);
    if (pulls && pulls.length > 0) {
      pulledBadgesRef.current = pulls;
      setPulledBadges(pulls);
      return pulls;
    }

    resumeQuestToasts();
    return null;
  };

  // Automated Opening Sequencer (StrictMode-safe)
  useEffect(() => {
    if (phase !== 'tapping') return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const pulls = executePullOnce(activeBatchCount);
    if (!pulls) {
      onClose();
      return;
    }

    if (prefersReducedMotion) {
      setPhase('resolved');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, activeBatchCount]);

  const handleBurstComplete = () => {
    setPhase('revealing');
  };

  const handleSkip = () => {
    clearTimers();
    const currentPulls = executePullOnce(activeBatchCount);
    if (!currentPulls) {
      onClose();
      return;
    }
    setPhase('resolved');
  };

  const startNewCycle = (nextCount: number) => {
    clearTimers();
    hasPulledRef.current = false;
    pulledBadgesRef.current = null;
    setTapCount(0);
    setPulledBadges(null);
    setActiveBatchCount(nextCount);
    setPhase('tapping');
  };

  const handleOpenAnotherOwned = () => {
    const nextCount = Math.min(activeBatchCount, ownedPacksRemaining);
    if (nextCount <= 0) return;
    startNewCycle(nextCount);
  };

  const handleQuickBuyAndOpenAnother = () => {
    const bought = buyPacks(packType, 1);
    if (bought) {
      startNewCycle(1);
    }
  };

  return (
    <div className="relative w-full min-h-[420px] lg:flex-1 flex flex-col items-center justify-center p-4 overflow-visible">
      {/* Corner Skip Button (Active strictly during animation phases) */}
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
        <div className="relative flex flex-col items-center my-auto">
          <FoilPackFissure
            packType={packType}
            tapCount={tapCount}
            onTap={() => {}}
            disabled={true}
          />
          <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium tracking-wide mt-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>
              {activeBatchCount > 1
                ? `Opening ${activeBatchCount} packs...`
                : 'Opening pack...'}
            </span>
          </div>
        </div>
      )}

      {/* Unified Loot Reveal Grid (Single & Batch) */}
      {(phase === 'revealing' || phase === 'resolved') && pulledBadges && (
        <div className="flex flex-col items-center justify-between gap-4 w-full my-auto animate-in fade-in duration-300">
          <LootRevealGrid
            badges={pulledBadges}
            isSkipped={phase === 'resolved'}
            isBatch={activeBatchCount > 1}
          />

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-1 shrink-0">
            {ownedPacksRemaining > 0 && (
              <Button
                type="button"
                onClick={handleOpenAnotherOwned}
                size="sm"
                className="h-9 px-4 text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl border border-neutral-700 flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
              >
                <RefreshCw size={13} />
                <span>
                  Open Another{' '}
                  {Math.min(activeBatchCount, ownedPacksRemaining) > 1
                    ? `${Math.min(activeBatchCount, ownedPacksRemaining)}x `
                    : ''}
                  ({ownedPacksRemaining} left)
                </span>
              </Button>
            )}

            {ownedPacksRemaining === 0 && canAffordSingle && (
              <Button
                type="button"
                onClick={handleQuickBuyAndOpenAnother}
                size="sm"
                className={`h-9 px-4 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 ${theme.btn}`}
              >
                <ShoppingBag size={13} /> Buy & Open 1x (-{packCost} Ink)
              </Button>
            )}

            <Button
              type="button"
              onClick={onClose}
              size="sm"
              className="h-9 px-5 text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl border border-neutral-700 shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Check size={13} /> Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}