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
  const [isParticlesActive, setIsParticlesActive] = useState<boolean>(false);
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

  useEffect(() => {
    return () => {
      resumeQuestToasts();
    };
  }, [resumeQuestToasts]);

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

    // Step 2 (400ms): Critical strain, jitter, expanding fissures
    const timer1 = setTimeout(() => {
      setTapCount(2);
    }, 400);

    // Step 3 (820ms): Foil breach and extended particle burst
    const timer2 = setTimeout(() => {
      setTapCount(3);
      setIsParticlesActive(true);
      setPhase('bursting');
    }, 820);

    timersRef.current = [timer1, timer2];

    return () => {
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, activeBatchCount]);

  // Triggered 520ms into the 1350ms particle burst so cards emerge while sparks continue glowing on top
  const handleRevealOverlapStart = () => {
    setPhase((prev) => (prev === 'bursting' ? 'revealing' : prev));
  };

  const handleParticlesComplete = () => {
    setIsParticlesActive(false);
  };

  const handleSkip = () => {
    clearTimers();
    setIsParticlesActive(false);
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
    setIsParticlesActive(false);
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

  const isBatch = activeBatchCount > 1;

  return (
    <div className="relative w-full min-h-[440px] lg:flex-1 lg:h-full lg:min-h-0 flex flex-col items-center justify-center p-3 sm:p-4 overflow-visible">
      {/* Corner Skip / Flip-All Button (Active during pre-reveal and 1-by-1 flip cascade) */}
      {phase !== 'resolved' && (
        <div className="absolute top-2 right-2 z-50">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="h-7 px-2.5 text-xs text-neutral-400 hover:text-white bg-neutral-900/85 border border-neutral-800 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
          >
            <FastForward size={13} className="text-amber-400" />
            <span>{phase === 'revealing' ? 'Flip All' : 'Skip'}</span>
          </Button>
        </div>
      )}

      {/* Extended Canvas FX (z-50 + mix-blend-screen so sparks shine over emerging cards) */}
      {isParticlesActive && (
        <UnsealParticleCanvas
          packType={packType}
          onRevealStart={handleRevealOverlapStart}
          onComplete={handleParticlesComplete}
        />
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
              {isBatch ? `Opening ${activeBatchCount} packs...` : 'Opening pack...'}
            </span>
          </div>
        </div>
      )}

      {/* Unified Loot Reveal Grid: Stretches full height on batches, centered on 1x */}
      {(phase === 'revealing' || phase === 'resolved') && pulledBadges && (
        <div
          className={`flex flex-col items-center gap-3.5 w-full animate-in fade-in duration-300 ${
            isBatch ? 'flex-1 min-h-0 h-full justify-between' : 'my-auto justify-center'
          }`}
        >
          <LootRevealGrid
            badges={pulledBadges}
            isSkipped={phase === 'resolved'}
            isBatch={isBatch}
            onAllFlipped={() => setPhase('resolved')}
          />

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1 shrink-0">
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